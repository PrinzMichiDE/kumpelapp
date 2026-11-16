import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@kumpelapp/db'
import { auth } from '@kumpelapp/auth'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const upcomingParam = searchParams.get('upcoming')
    const matchId = searchParams.get('matchId')
    const kind = searchParams.get('kind')
    const limit = Math.min(Math.max(Number(searchParams.get('limit')) || 50, 1), 200)

    const now = new Date()
    const where: Record<string, unknown> = {}
    if (matchId) where.matchId = matchId
    if (kind === 'OFFER' || kind === 'REQUEST') where.kind = kind
    if (upcomingParam === 'true' || upcomingParam === '1') {
      where.departAt = { gte: new Date(now.getTime() - 6 * 60 * 60 * 1000) }
    } else if (upcomingParam === 'false' || upcomingParam === '0') {
      where.departAt = { lt: new Date(now.getTime() - 6 * 60 * 60 * 1000) }
    }

    const data = await prisma.ride.findMany({
      where,
      include: {
        match: {
          select: {
            id: true,
            kickoff: true,
            status: true,
            homeTeam: { select: { shortName: true, name: true } },
            awayTeam: { select: { shortName: true, name: true } },
          },
        },
        user: { select: { id: true, name: true } },
      },
      orderBy: { departAt: upcomingParam === 'false' || upcomingParam === '0' ? 'desc' : 'asc' },
      take: limit,
    })

    return NextResponse.json({ data })
  } catch (error) {
    console.error('rides GET error', error)
    return NextResponse.json({ error: { code: 'UPSTREAM_UNAVAILABLE', message: 'Fahrten konnten nicht geladen werden' } }, { status: 503 })
  }
}

export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({ headers: request.headers }).catch(() => null)
  const ct = request.headers.get('content-type') || ''
  const isForm = ct.includes('form')
  if (!session?.user?.id) {
    if (isForm) return NextResponse.redirect(new URL('/login?callbackUrl=/kumpels/mitfahrten', request.url), 303)
    return NextResponse.json({ error: { code: 'UNAUTHORIZED' } }, { status: 401 })
  }
  try {
    let payload: any = {}
    if (ct.includes('application/json')) payload = await request.json()
    else { const f = await request.formData(); payload = Object.fromEntries(f.entries()) }
    const matchId = String(payload.matchId || '')
    const kind = String(payload.kind || 'OFFER') === 'REQUEST' ? 'REQUEST' : 'OFFER'
    const fromPlace = String(payload.fromPlace || '').trim().slice(0, 120)
    const departAt = new Date(String(payload.departAt || ''))
    const seats = payload.seats ? Math.max(1, Math.min(8, Number(payload.seats))) : null
    const note = payload.note ? String(payload.note).slice(0, 140) : null
    if (!matchId || !fromPlace || isNaN(departAt.getTime())) {
      if (isForm) return NextResponse.redirect(new URL('/kumpels/mitfahrten?error=invalid', request.url), 303)
      return NextResponse.json({ error: { code: 'INVALID' } }, { status: 400 })
    }
    await prisma.ride.create({ data: { userId: session.user.id, matchId, kind: kind as any, fromPlace, departAt, seats, note } })
    if (isForm) return NextResponse.redirect(new URL('/kumpels/mitfahrten?created=1', request.url), 303)
    return NextResponse.json({ data: { ok: true } }, { status: 201 })
  } catch (e) {
    console.error(e)
    if (isForm) return NextResponse.redirect(new URL('/kumpels/mitfahrten?error=server', request.url), 303)
    return NextResponse.json({ error: { code: 'SERVER_ERROR' } }, { status: 500 })
  }
}
