import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@kumpelapp/db'
import { auth } from '@kumpelapp/auth'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: matchId } = await params
    const session = await auth.api.getSession({ headers: request.headers }).catch(() => null)

    const match = await prisma.match.findUnique({
      where: { id: matchId },
      select: {
        id: true,
        kickoff: true,
        status: true,
        homeTeam: { select: { name: true, shortName: true, isOwn: true } },
        awayTeam: { select: { name: true, shortName: true, isOwn: true } },
      },
    })
    if (!match) {
      return NextResponse.json({ error: { code: 'NOT_FOUND', message: 'Spiel nicht gefunden' } }, { status: 404 })
    }

    const [groups, total, myVote] = await Promise.all([
      prisma.matchVote.groupBy({
        by: ['playerId'],
        where: { matchId },
        _count: { playerId: true },
        orderBy: { _count: { playerId: 'desc' } },
        take: 20,
      }),
      prisma.matchVote.count({ where: { matchId } }),
      session?.user?.id
        ? prisma.matchVote.findUnique({
            where: { userId_matchId: { userId: session.user.id, matchId } },
            select: { id: true, playerId: true, createdAt: true },
          })
        : Promise.resolve(null),
    ])

    const playerIds = groups.map((g) => g.playerId)
    const players = playerIds.length
      ? await prisma.player.findMany({
          where: { id: { in: playerIds } },
          select: { id: true, name: true, number: true, position: true, imageUrl: true, teamId: true },
        })
      : []
    const byId = new Map(players.map((p) => [p.id, p]))

    const results = groups.map((g) => {
      const player = byId.get(g.playerId)
      const votes = g._count.playerId
      return {
        playerId: g.playerId,
        votes,
        share: total > 0 ? Number((votes / total).toFixed(4)) : 0,
        player: player
          ? {
              id: player.id,
              name: player.name,
              number: player.number,
              position: player.position,
              imageUrl: player.imageUrl,
            }
          : null,
      }
    })

    return NextResponse.json(
      {
        data: {
          match: {
            id: match.id,
            kickoff: match.kickoff.toISOString(),
            status: match.status,
            label: `${match.homeTeam.shortName || match.homeTeam.name} – ${match.awayTeam.shortName || match.awayTeam.name}`,
          },
          totalVotes: total,
          results,
          myVote: myVote
            ? { id: myVote.id, playerId: myVote.playerId, createdAt: myVote.createdAt.toISOString() }
            : null,
        },
      },
      { headers: { 'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=120' } },
    )
  } catch (error) {
    console.error('match votes GET error', error)
    return NextResponse.json(
      { error: { code: 'UPSTREAM_UNAVAILABLE', message: 'Abstimmungsergebnisse konnten nicht geladen werden' } },
      { status: 503 },
    )
  }
}
