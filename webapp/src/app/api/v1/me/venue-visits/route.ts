import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@kumpelapp/db'
import { auth } from '@kumpelapp/auth'

export const dynamic = 'force-dynamic'

function isValidDate(value: unknown): value is string {
  if (typeof value !== 'string' || !value) return false
  const t = Date.parse(value)
  return Number.isFinite(t)
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers }).catch(() => null)
    if (!session?.user?.id) {
      return NextResponse.json({ data: [], summary: null, auth: false }, { status: 200 })
    }

    const { searchParams } = new URL(request.url)
    const includeVenues = searchParams.get('includeVenues') !== 'false'

    const [visits, venueCount] = await Promise.all([
      prisma.venueVisit.findMany({
        where: { userId: session.user.id },
        include: {
          venue: { select: { id: true, slug: true, name: true, city: true, imageUrl: true } },
          match: { select: { id: true, kickoff: true, homeTeam: { select: { shortName: true, name: true } }, awayTeam: { select: { shortName: true, name: true } } } },
        },
        orderBy: [{ visitedAt: 'desc' }],
      }),
      includeVenues ? prisma.venue.count() : Promise.resolve(0),
    ])

    const byVenue = new Map<string, { count: number; lastVisitedAt: string }>()
    for (const v of visits) {
      const prev = byVenue.get(v.venueId)
      const iso = v.visitedAt.toISOString()
      if (!prev) byVenue.set(v.venueId, { count: 1, lastVisitedAt: iso })
      else {
        prev.count += 1
        if (iso > prev.lastVisitedAt) prev.lastVisitedAt = iso
      }
    }

    return NextResponse.json({
      data: visits.map((v) => ({
        id: v.id,
        venueId: v.venueId,
        matchId: v.matchId,
        visitedAt: v.visitedAt.toISOString(),
        note: v.note,
        venue: v.venue,
        match: v.match
          ? {
              id: v.match.id,
              kickoff: v.match.kickoff.toISOString(),
              label: `${v.match.homeTeam.shortName || v.match.homeTeam.name} – ${v.match.awayTeam.shortName || v.match.awayTeam.name}`,
            }
          : null,
      })),
      summary: {
        totalVisits: visits.length,
        uniqueVenues: byVenue.size,
        totalVenues: includeVenues ? venueCount : null,
      },
      venueProgress: Array.from(byVenue.entries()).map(([venueId, value]) => ({ venueId, ...value })),
      auth: true,
    })
  } catch (error) {
    console.error('venue-visits GET error', error)
    return NextResponse.json({ error: { code: 'UPSTREAM_UNAVAILABLE', message: 'Besuche konnten nicht geladen werden' } }, { status: 503 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers }).catch(() => null)
    if (!session?.user?.id) {
      return NextResponse.json({ error: { code: 'UNAUTHORIZED', message: 'Anmeldung erforderlich' } }, { status: 401 })
    }

    const body = await request.json().catch(() => ({} as Record<string, unknown>))
    const venueId = typeof body.venueId === 'string' ? body.venueId : ''
    const matchId = typeof body.matchId === 'string' && body.matchId ? body.matchId : null
    const note = typeof body.note === 'string' && body.note.trim() ? body.note.trim().slice(0, 500) : null
    const visitedAtRaw = body.visitedAt
    const visitedAt = isValidDate(visitedAtRaw) ? new Date(visitedAtRaw) : new Date()

    if (!venueId) {
      return NextResponse.json({ error: { code: 'INVALID', message: 'venueId fehlt' } }, { status: 400 })
    }

    const venue = await prisma.venue.findUnique({ where: { id: venueId }, select: { id: true } })
    if (!venue) {
      return NextResponse.json({ error: { code: 'NOT_FOUND', message: 'Stadion nicht gefunden' } }, { status: 404 })
    }

    if (matchId) {
      const match = await prisma.match.findUnique({ where: { id: matchId }, select: { id: true } })
      if (!match) {
        return NextResponse.json({ error: { code: 'NOT_FOUND', message: 'Spiel nicht gefunden' } }, { status: 404 })
      }
    }

    const created = await prisma.venueVisit.create({
      data: {
        userId: session.user.id,
        venueId,
        matchId,
        visitedAt,
        note,
      },
      include: { venue: { select: { id: true, slug: true, name: true, city: true } } },
    })

    return NextResponse.json(
      {
        data: {
          id: created.id,
          venueId: created.venueId,
          matchId: created.matchId,
          visitedAt: created.visitedAt.toISOString(),
          note: created.note,
          venue: created.venue,
        },
      },
      { status: 201 },
    )
  } catch (error: any) {
    // Unique constraint on (userId, venueId, visitedAt) can trip if same timestamp submitted twice.
    if (error?.code === 'P2002') {
      return NextResponse.json(
        { error: { code: 'DUPLICATE', message: 'Besuch für diesen Zeitpunkt bereits erfasst' } },
        { status: 409 },
      )
    }
    console.error('venue-visits POST error', error)
    return NextResponse.json({ error: { code: 'INTERNAL_ERROR', message: 'Besuch konnte nicht gespeichert werden' } }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers }).catch(() => null)
    if (!session?.user?.id) {
      return NextResponse.json({ error: { code: 'UNAUTHORIZED', message: 'Anmeldung erforderlich' } }, { status: 401 })
    }
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ error: { code: 'INVALID', message: 'id fehlt' } }, { status: 400 })

    const existing = await prisma.venueVisit.findUnique({ where: { id }, select: { userId: true } })
    if (!existing || existing.userId !== session.user.id) {
      return NextResponse.json({ error: { code: 'NOT_FOUND', message: 'Eintrag nicht gefunden' } }, { status: 404 })
    }
    await prisma.venueVisit.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('venue-visits DELETE error', error)
    return NextResponse.json({ error: { code: 'INTERNAL_ERROR', message: 'Eintrag konnte nicht gelöscht werden' } }, { status: 500 })
  }
}
