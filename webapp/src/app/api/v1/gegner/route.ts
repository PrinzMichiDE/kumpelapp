import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@kumpelapp/db'

export const dynamic = 'force-dynamic'

function resultFrom(aueGoals: number, oppGoals: number): 'W' | 'D' | 'L' {
  if (aueGoals > oppGoals) return 'W'
  if (aueGoals === oppGoals) return 'D'
  return 'L'
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const leagueIdParam = searchParams.get('leagueId')
    const q = (searchParams.get('q') ?? '').trim().toLowerCase()
    const sort = searchParams.get('sort') ?? 'points' // points | diff | played | last | name
    const limitParam = searchParams.get('limit')
    const limit = Math.min(Math.max(Number(limitParam) || 200, 1), 500)

    let league:
      | { id: string; name: string; season: { id: string; label: string | null } | null }
      | null = null

    if (leagueIdParam) {
      league = await prisma.league.findUnique({
        where: { id: leagueIdParam },
        select: { id: true, name: true, season: { select: { id: true, label: true } } },
      })
      if (!league) {
        return NextResponse.json(
          { error: { code: 'NOT_FOUND', message: 'Liga nicht gefunden' } },
          { status: 404 },
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
        { data: [], league: null, summary: null },
        { headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=1800' } },
      )
    }

    const rows = await prisma.match.findMany({
      where: {
        leagueId: league.id,
        status: 'FINISHED',
        OR: [{ homeTeam: { isOwn: true } }, { awayTeam: { isOwn: true } }],
      },
      include: {
        homeTeam: { select: { id: true, name: true, shortName: true, isOwn: true } },
        awayTeam: { select: { id: true, name: true, shortName: true, isOwn: true } },
      },
      orderBy: [{ kickoff: 'asc' }],
    })

    const map = new Map<
      string,
      {
        id: string
        name: string
        shortName: string | null
        played: number
        wins: number
        draws: number
        losses: number
        goalsFor: number
        goalsAgainst: number
        homePlayed: number
        homeWins: number
        homeDraws: number
        homeLosses: number
        awayPlayed: number
        awayWins: number
        awayDraws: number
        awayLosses: number
        last: {
          matchId: string
          kickoff: string
          matchday: number | null
          aueGoals: number
          oppGoals: number
          result: 'W' | 'D' | 'L'
          venue: 'home' | 'away'
        } | null
      }
    >()

    for (const m of rows) {
      if (m.homeGoals === null || m.awayGoals === null) continue
      const aueIsHome = m.homeTeam.isOwn
      const opp = aueIsHome ? m.awayTeam : m.homeTeam
      const aueGoals = aueIsHome ? m.homeGoals : m.awayGoals
      const oppGoals = aueIsHome ? m.awayGoals : m.homeGoals
      const res = resultFrom(aueGoals, oppGoals)

      let entry = map.get(opp.id)
      if (!entry) {
        entry = {
          id: opp.id,
          name: opp.name,
          shortName: opp.shortName,
          played: 0,
          wins: 0,
          draws: 0,
          losses: 0,
          goalsFor: 0,
          goalsAgainst: 0,
          homePlayed: 0,
          homeWins: 0,
          homeDraws: 0,
          homeLosses: 0,
          awayPlayed: 0,
          awayWins: 0,
          awayDraws: 0,
          awayLosses: 0,
          last: null,
        }
        map.set(opp.id, entry)
      }

      entry.played += 1
      entry.goalsFor += aueGoals
      entry.goalsAgainst += oppGoals
      if (res === 'W') entry.wins += 1
      else if (res === 'D') entry.draws += 1
      else entry.losses += 1

      if (aueIsHome) {
        entry.homePlayed += 1
        if (res === 'W') entry.homeWins += 1
        else if (res === 'D') entry.homeDraws += 1
        else entry.homeLosses += 1
      } else {
        entry.awayPlayed += 1
        if (res === 'W') entry.awayWins += 1
        else if (res === 'D') entry.awayDraws += 1
        else entry.awayLosses += 1
      }

      const lastPayload = {
        matchId: m.id,
        kickoff: m.kickoff.toISOString(),
        matchday: m.matchday,
        aueGoals,
        oppGoals,
        result: res,
        venue: (aueIsHome ? 'home' : 'away') as 'home' | 'away',
      }
      if (!entry.last || new Date(lastPayload.kickoff).getTime() > new Date(entry.last.kickoff).getTime()) {
        entry.last = lastPayload
      }
    }

    let opponents = Array.from(map.values()).map((o) => {
      const points = o.wins * 3 + o.draws
      const goalDifference = o.goalsFor - o.goalsAgainst
      return {
        ...o,
        points,
        goalDifference,
        pointsPerGame: o.played > 0 ? Number((points / o.played).toFixed(3)) : 0,
      }
    })

    if (q) {
      opponents = opponents.filter((o) => `${o.name} ${o.shortName ?? ''}`.toLowerCase().includes(q))
    }

    opponents.sort((a, b) => {
      switch (sort) {
        case 'name':
          return a.name.localeCompare(b.name, 'de')
        case 'played':
          return b.played - a.played || b.points - a.points || a.name.localeCompare(b.name, 'de')
        case 'diff':
          return b.goalDifference - a.goalDifference || b.points - a.points || a.name.localeCompare(b.name, 'de')
        case 'last': {
          const ta = a.last ? new Date(a.last.kickoff).getTime() : 0
          const tb = b.last ? new Date(b.last.kickoff).getTime() : 0
          return tb - ta || a.name.localeCompare(b.name, 'de')
        }
        case 'points':
        default:
          return (
            b.points - a.points ||
            b.goalDifference - a.goalDifference ||
            b.pointsPerGame - a.pointsPerGame ||
            a.name.localeCompare(b.name, 'de')
          )
      }
    })

    const total = opponents.length
    const sliced = opponents.slice(0, limit)
    const summary = {
      opponents: opponents.length,
      played: opponents.reduce((s, o) => s + o.played, 0),
      wins: opponents.reduce((s, o) => s + o.wins, 0),
      draws: opponents.reduce((s, o) => s + o.draws, 0),
      losses: opponents.reduce((s, o) => s + o.losses, 0),
      goalsFor: opponents.reduce((s, o) => s + o.goalsFor, 0),
      goalsAgainst: opponents.reduce((s, o) => s + o.goalsAgainst, 0),
    }

    return NextResponse.json(
      {
        data: sliced,
        total,
        limit,
        league: { id: league.id, name: league.name, season: league.season },
        summary,
      },
      { headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=1800' } },
    )
  } catch (error) {
    console.error('Gegner API error:', error)
    return NextResponse.json(
      { error: { code: 'UPSTREAM_UNAVAILABLE', message: 'Gegnerbilanz konnte nicht geladen werden' } },
      { status: 503 },
    )
  }
}
