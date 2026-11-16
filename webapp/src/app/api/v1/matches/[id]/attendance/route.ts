import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@kumpelapp/db'
import { auth } from '@kumpelapp/auth'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: matchId } = await params
    const session = await auth.api.getSession({ headers: request.headers }).catch(() => null)

    const match = await prisma.match.findUnique({ where: { id: matchId }, select: { id: true } })
    if (!match) {
      return NextResponse.json({ error: { code: 'NOT_FOUND', message: 'Spiel nicht gefunden' } }, { status: 404 })
    }

    const [groups, my] = await Promise.all([
      prisma.attendance.groupBy({
        by: ['status'],
        where: { matchId },
        _count: { _all: true },
      }),
      session?.user?.id
        ? prisma.attendance.findUnique({
            where: { userId_matchId: { userId: session.user.id, matchId } },
            select: { status: true, note: true },
          })
        : Promise.resolve(null),
    ])

    const counts = { GOING: 0, MAYBE: 0, NOT_GOING: 0, total: 0 }
    for (const g of groups) {
      const c = g._count._all
      counts.total += c
      if (g.status in counts) (counts as any)[g.status] = c
    }

    return NextResponse.json(
      {
        data: {
          matchId,
          counts,
          myStatus: my?.status ?? null,
          myNote: my?.note ?? null,
          auth: !!session?.user?.id,
        },
      },
      { headers: { 'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=120' } },
    )
  } catch (error) {
    console.error('match attendance GET error', error)
    return NextResponse.json({ error: { code: 'UPSTREAM_UNAVAILABLE', message: 'Teilnahmestatus konnte nicht geladen werden' } }, { status: 503 })
  }
}
