import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@kumpelapp/db'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: matchId } = await params
    const match = await prisma.match.findUnique({ where: { id: matchId }, select: { id: true } })
    if (!match) {
      return NextResponse.json({ error: { code: 'NOT_FOUND', message: 'Spiel nicht gefunden' } }, { status: 404 })
    }

    const { searchParams } = new URL(request.url)
    const upcomingOnly = searchParams.get('upcoming') !== 'false'
    const now = new Date()
    const threshold = new Date(now.getTime() - 6 * 60 * 60 * 1000)

    const rides = await prisma.ride.findMany({
      where: {
        matchId,
        ...(upcomingOnly ? { departAt: { gte: threshold } } : {}),
      },
      include: {
        user: { select: { id: true, name: true } },
      },
      orderBy: { departAt: upcomingOnly ? 'asc' : 'desc' },
      take: 50,
    })

    return NextResponse.json({
      data: rides.map((r) => ({
        id: r.id,
        kind: r.kind,
        fromPlace: r.fromPlace,
        departAt: r.departAt.toISOString(),
        seats: r.seats,
        note: r.note,
        user: r.user ? { id: r.user.id, name: r.user.name } : null,
      })),
      total: rides.length,
    })
  } catch (error) {
    console.error('match rides GET error', error)
    return NextResponse.json({ error: { code: 'UPSTREAM_UNAVAILABLE', message: 'Mitfahrten konnten nicht geladen werden' } }, { status: 503 })
  }
}
