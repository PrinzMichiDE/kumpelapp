import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@kumpelapp/db'

export const dynamic = 'force-dynamic'

type Result = 'W' | 'D' | 'L'

function outcome(aueGoals: number, oppGoals: number): Result {
  if (aueGoals > oppGoals) return 'W'
  if (aueGoals === oppGoals) return 'D'
  return 'L'
}

function currentStreak(results: Result[]) {
  if (results.length === 0) return null
  const last = results[results.length - 1]
  let count = 0
  for (let i = results.length - 1; i >= 0; i -= 1) {
    if (results[i] === last) count += 1
    else break
  }
  return { result: last, count }
}

function longestStreak(results: Result[], predicate: (r: Result) => boolean) {
  let max = 0
  let cur = 0
  for (const r of results) {
    if (predicate(r)) {
      cur += 1
      if (cur > max) max = cur
    } else {
      cur = 0
    }
  }
  return max
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const leagueIdParam = searchParams.get('leagueId')
    const round = searchParams.get('round') ?? 'all' // all | hin | rueck
    const venue = searchParams.get('venue') ?? 'all' // all | home | away
    const limitParam = searchParams.get('limit')
    const recentLimit = Math.min(Math.max(Number(limitParam) || 5, 1), 20)

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
        { data: null, league: null },
        { headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=1800' } },
      )
    }

    const rows = await prisma.match.findMany({
      where: {
        leagueId: league.id,
        OR: [{ homeTeam: { isOwn: true } }, { awayTeam: { isOwn: true } }],
      },
      include: {
        homeTeam: { select: { id: true, name: true, shortName: true, isOwn: true } },
        awayTeam: { select: { id: true, name: true, shortName: true, isOwn: true } },
        venue: { select: { name: true, city: true } },
      },
      orderBy: [{ matchday: 'asc' }, { kickoff: 'asc' }],
    })

    const allFinished = rows.filter((m) => m.status === 'FINISHED' && m.homeGoals !== null && m.awayGoals !== null)
    const matchdays = allFinished.map((m) => m.matchday).filter((d): d is number => typeof d === 'number')
    const maxMatchday = matchdays.length > 0 ? Math.max(...matchdays) : 0
    const hinSplit = maxMatchday > 0 ? Math.ceil(maxMatchday / 2) : 17

    const finished = allFinished.filter((m) => {
      if (venue === 'home' && !m.homeTeam.isOwn) return false
      if (venue === 'away' && !m.awayTeam.isOwn) return false
      if ((round === 'hin' || round === 'rueck') && m.matchday === null) return false
      if (round === 'hin' && m.matchday !== null && m.matchday > hinSplit) return false
      if (round === 'rueck' && m.matchday !== null && m.matchday <= hinSplit) return false
      return true
    })

    const progression: Array<{
      matchId: string
      kickoff: string
      matchday: number | null
      opponent: { id: string; name: string; shortName: string | null }
      venue: 'home' | 'away'
      aueGoals: number
      oppGoals: number
      result: Result
      points: number
      totalPoints: number
      totalGoalsFor: number
      totalGoalsAgainst: number
      totalGoalDifference: number
    }> = []

    let runningPoints = 0
    let runningGF = 0
    let runningGA = 0

    for (const m of finished) {
      const aueIsHome = m.homeTeam.isOwn
      const opponent = aueIsHome ? m.awayTeam : m.homeTeam
      const aueGoals = aueIsHome ? (m.homeGoals ?? 0) : (m.awayGoals ?? 0)
      const oppGoals = aueIsHome ? (m.awayGoals ?? 0) : (m.homeGoals ?? 0)
      const result = outcome(aueGoals, oppGoals)
      const points = result === 'W' ? 3 : result === 'D' ? 1 : 0
      runningPoints += points
      runningGF += aueGoals
      runningGA += oppGoals
      progression.push({
        matchId: m.id,
        kickoff: m.kickoff.toISOString(),
        matchday: m.matchday,
        opponent: { id: opponent.id, name: opponent.name, shortName: opponent.shortName },
        venue: aueIsHome ? 'home' : 'away',
        aueGoals,
        oppGoals,
        result,
        points,
        totalPoints: runningPoints,
        totalGoalsFor: runningGF,
        totalGoalsAgainst: runningGA,
        totalGoalDifference: runningGF - runningGA,
      })
    }

    const results = progression.map((p) => p.result)
    const played = progression.length
    const wins = results.filter((r) => r === 'W').length
    const draws = results.filter((r) => r === 'D').length
    const losses = results.filter((r) => r === 'L').length
    const points = wins * 3 + draws
    const goalsFor = progression.reduce((s, p) => s + p.aueGoals, 0)
    const goalsAgainst = progression.reduce((s, p) => s + p.oppGoals, 0)
    const cleanSheets = progression.filter((p) => p.oppGoals === 0).length
    const scoredMatches = progression.filter((p) => p.aueGoals > 0).length

    function split(list: typeof progression) {
      const w = list.filter((p) => p.result === 'W').length
      const d = list.filter((p) => p.result === 'D').length
      const l = list.filter((p) => p.result === 'L').length
      const gf = list.reduce((s, p) => s + p.aueGoals, 0)
      const ga = list.reduce((s, p) => s + p.oppGoals, 0)
      const pl = list.length
      return {
        played: pl,
        wins: w,
        draws: d,
        losses: l,
        points: w * 3 + d,
        goalsFor: gf,
        goalsAgainst: ga,
        goalDifference: gf - ga,
        pointsPerGame: pl > 0 ? Number(((w * 3 + d) / pl).toFixed(3)) : 0,
      }
    }

    const homeSplit = split(progression.filter((p) => p.venue === 'home'))
    const awaySplit = split(progression.filter((p) => p.venue === 'away'))

    const streaks = {
      current: currentStreak(results),
      longestWin: longestStreak(results, (r) => r === 'W'),
      longestUnbeaten: longestStreak(results, (r) => r !== 'L'),
      longestLossless: longestStreak(results, (r) => r !== 'L'),
      longestWinless: longestStreak(results, (r) => r !== 'W'),
    }

    const now = new Date()
    const upcoming = rows
      .filter(
        (m) =>
          (m.status === 'SCHEDULED' || m.status === 'LIVE' || m.status === 'POSTPONED') &&
          m.kickoff >= new Date(now.getTime() - 3 * 60 * 60 * 1000),
      )
      .sort((a, b) => a.kickoff.getTime() - b.kickoff.getTime())
      .slice(0, recentLimit)
      .map((m) => {
        const aueIsHome = m.homeTeam.isOwn
        const opponent = aueIsHome ? m.awayTeam : m.homeTeam
        return {
          matchId: m.id,
          kickoff: m.kickoff.toISOString(),
          matchday: m.matchday,
          status: m.status,
          venue: (aueIsHome ? 'home' : 'away') as 'home' | 'away',
          opponent: { id: opponent.id, name: opponent.name, shortName: opponent.shortName },
          location: m.venue ? [m.venue.name, m.venue.city].filter(Boolean).join(', ') : null,
        }
      })

    const recent = progression.slice(-recentLimit).reverse()

    return NextResponse.json(
      {
        data: {
          league: { id: league.id, name: league.name, season: league.season },
          filters: { round, venue },
          summary: {
            played,
            wins,
            draws,
            losses,
            points,
            goalsFor,
            goalsAgainst,
            goalDifference: goalsFor - goalsAgainst,
            pointsPerGame: played > 0 ? Number((points / played).toFixed(3)) : 0,
            cleanSheets,
            scoredMatches,
          },
          splits: { home: homeSplit, away: awaySplit },
          streaks,
          recent,
          upcoming,
          progression,
        },
      },
      { headers: { 'Cache-Control': 'public, s-maxage=120, stale-while-revalidate=600' } },
    )
  } catch (error) {
    console.error('Saison API error:', error)
    return NextResponse.json(
      { error: { code: 'UPSTREAM_UNAVAILABLE', message: 'Saisonverlauf konnte nicht geladen werden' } },
      { status: 503 },
    )
  }
}
