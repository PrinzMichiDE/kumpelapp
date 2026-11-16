import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@kumpelapp/db'
import { auth } from '@kumpelapp/auth'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers }).catch(() => null)
    if (!session?.user?.id) {
      return NextResponse.json({ data: [], auth: false }, { status: 200 })
    }

    const { searchParams } = new URL(request.url)
    const matchId = searchParams.get('matchId')
    const limit = Math.min(Math.max(Number(searchParams.get('limit')) || 50, 1), 200)

    const rows = await prisma.matchVote.findMany({
      where: {
        userId: session.user.id,
        ...(matchId ? { matchId } : {}),
      },
      include: {
        player: { select: { id: true, name: true, number: true, position: true, imageUrl: true } },
        match: {
          select: {
            id: true,
            kickoff: true,
            status: true,
            homeTeam: { select: { shortName: true, name: true } },
            awayTeam: { select: { shortName: true, name: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    })

    return NextResponse.json({
      data: rows.map((v) => ({
        id: v.id,
        matchId: v.matchId,
        playerId: v.playerId,
        createdAt: v.createdAt.toISOString(),
        player: v.player,
        match: v.match
          ? {
              id: v.match.id,
              kickoff: v.match.kickoff.toISOString(),
              status: v.match.status,
              label: `${v.match.homeTeam.shortName || v.match.homeTeam.name} – ${v.match.awayTeam.shortName || v.match.awayTeam.name}`,
            }
          : null,
      })),
      auth: true,
    })
  } catch (error) {
    console.error('my votes GET error', error)
    return NextResponse.json(
      { error: { code: 'UPSTREAM_UNAVAILABLE', message: 'Stimmen konnten nicht geladen werden' } },
      { status: 503 },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers }).catch(() => null)
    if (!session?.user?.id) return NextResponse.json({ error: { code: 'UNAUTHORIZED', message: 'Anmeldung erforderlich' } }, { status: 401 })
    const body = await request.json().catch(() => ({} as Record<string, unknown>))
    const matchId = typeof body.matchId === 'string' ? body.matchId : ''
    const playerId = typeof body.playerId === 'string' ? body.playerId : ''
    if (!matchId || !playerId) {
      return NextResponse.json({ error: { code: 'INVALID', message: 'matchId und playerId erforderlich' } }, { status: 400 })
    }

    const [match, player] = await Promise.all([
      prisma.match.findUnique({ where: { id: matchId }, select: { id: true } }),
      prisma.player.findUnique({ where: { id: playerId }, select: { id: true } }),
    ])
    if (!match) return NextResponse.json({ error: { code: 'NOT_FOUND', message: 'Spiel nicht gefunden' } }, { status: 404 })
    if (!player) return NextResponse.json({ error: { code: 'NOT_FOUND', message: 'Spieler nicht gefunden' } }, { status: 404 })

    const data = await prisma.matchVote.upsert({
      where: { userId_matchId: { userId: session.user.id, matchId } },
      update: { playerId },
      create: { userId: session.user.id, matchId, playerId },
      include: { player: { select: { id: true, name: true, number: true, position: true } } },
    })
    return NextResponse.json({ data: { id: data.id, matchId: data.matchId, playerId: data.playerId, createdAt: data.createdAt.toISOString(), player: data.player } })
  } catch (error) {
    console.error('my votes POST error', error)
    return NextResponse.json({ error: { code: 'INTERNAL_ERROR', message: 'Stimme konnte nicht gespeichert werden' } }, { status: 500 })
  }
}

