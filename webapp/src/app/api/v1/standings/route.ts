import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@kumpelapp/db'
import { StandingListDto } from '@kumpelapp/api-contracts'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const leagueIdParam = searchParams.get('leagueId')

    let league = null as null | {
      id: string
      name: string
      season: { id: string; label: string } | null
    }

    if (leagueIdParam) {
      league = await prisma.league.findUnique({
        where: { id: leagueIdParam },
        select: { id: true, name: true, season: { select: { id: true, label: true } } },
      })
      if (!league) {
        return NextResponse.json(
          { error: { code: 'NOT_FOUND', message: 'Liga nicht gefunden' } },
          { status: 404 }
        )
      }
    } else {
      league =
        (await prisma.league.findFirst({
          where: { season: { isCurrent: true } },
          select: { id: true, name: true, season: { select: { id: true, label: true } } },
          orderBy: { tier: 'asc' },
        })) ??
        (await prisma.league.findFirst({
          select: { id: true, name: true, season: { select: { id: true, label: true } } },
          orderBy: [{ season: { startYear: 'desc' } }, { tier: 'asc' }],
        }))
    }

    if (!league) {
      return NextResponse.json(
        { data: [], league: null },
        { headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=1800' } }
      )
    }

    const rows = await prisma.standing.findMany({
      where: { leagueId: league.id },
      include: {
        team: { select: { id: true, name: true, shortName: true, logoUrl: true } },
      },
      orderBy: { position: 'asc' },
    })

    const data = StandingListDto.parse(
      rows.map((r) => ({
        id: r.id,
        leagueId: r.leagueId,
        team: r.team,
        position: r.position,
        played: r.played,
        won: r.won,
        drawn: r.drawn,
        lost: r.lost,
        goalsFor: r.goalsFor,
        goalsAgainst: r.goalsAgainst,
        goalDifference: r.goalsFor - r.goalsAgainst,
        points: r.points,
        form: r.form,
        updatedAt: r.updatedAt.toISOString(),
      }))
    )

    const updatedAt = rows.reduce<Date | null>((acc, r) => (!acc || r.updatedAt > acc ? r.updatedAt : acc), null)

    return NextResponse.json(
      {
        data,
        league,
        updatedAt: updatedAt ? updatedAt.toISOString() : null,
      },
      { headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=1800' } }
    )
  } catch (error) {
    console.error('Standings API error:', error)
    return NextResponse.json(
      { error: { code: 'UPSTREAM_UNAVAILABLE', message: 'Tabelle konnte nicht geladen werden' } },
      { status: 503 }
    )
  }
}
