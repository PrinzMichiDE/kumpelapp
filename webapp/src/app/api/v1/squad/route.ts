import { NextResponse } from 'next/server'
import { prisma } from '@kumpelapp/db'
import { PlayerListDto } from '@kumpelapp/api-contracts'

export async function GET() {
  try {
    const team =
      (await prisma.team.findFirst({
        where: { isOwn: true, kind: 'SENIOR' },
        select: { id: true, name: true },
      })) ??
      (await prisma.team.findFirst({
        where: { isOwn: true },
        select: { id: true, name: true },
      }))

    if (!team) {
      return NextResponse.json(
        { data: [], team: null },
        { headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=1800' } }
      )
    }

    const currentSeason = await prisma.season.findFirst({
      where: { isCurrent: true },
      select: { id: true, label: true },
    })

    const rows = await prisma.player.findMany({
      where: {
        teamId: team.id,
        ...(currentSeason ? { OR: [{ seasonId: currentSeason.id }, { seasonId: null }] } : {}),
      },
      orderBy: [{ position: 'asc' }, { number: 'asc' }, { name: 'asc' }],
    })

    const data = PlayerListDto.parse(
      rows.map((p) => ({
        id: p.id,
        name: p.name,
        number: p.number,
        position: p.position,
        teamId: p.teamId,
        imageUrl: p.imageUrl,
        nationality: p.nationality,
        birthDate: p.birthDate ? p.birthDate.toISOString() : null,
        heightCm: p.heightCm,
        foot: p.foot,
        isLegend: p.isLegend,
        sourceUrl: p.sourceUrl ?? null,
      }))
    )

    return NextResponse.json(
      {
        data,
        team,
        season: currentSeason,
      },
      { headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=1800' } }
    )
  } catch (error) {
    console.error('Squad API error:', error)
    return NextResponse.json(
      { error: { code: 'UPSTREAM_UNAVAILABLE', message: 'Kader konnte nicht geladen werden' } },
      { status: 503 }
    )
  }
}
