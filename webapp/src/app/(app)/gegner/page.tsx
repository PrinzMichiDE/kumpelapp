import type { Metadata } from 'next'
import { prisma } from '@kumpelapp/db'
import { AlertCircle, SearchX } from 'lucide-react'
import { GegnerExplorer, type OpponentStat } from './gegner-explorer'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Gegnerbilanz',
  description: 'Bilanz des FC Erzgebirge Aue gegen alle Gegner: Siege, Unentschieden, Niederlagen und Torverhältnis.',
}

type MatchRow = {
  id: string
  kickoff: Date
  matchday: number | null
  status: string
  homeGoals: number | null
  awayGoals: number | null
  homeTeam: { id: string; name: string; shortName: string | null; isOwn: boolean }
  awayTeam: { id: string; name: string; shortName: string | null; isOwn: boolean }
}

function resultFrom(aueGoals: number, oppGoals: number): 'W' | 'D' | 'L' {
  if (aueGoals > oppGoals) return 'W'
  if (aueGoals === oppGoals) return 'D'
  return 'L'
}

export default async function GegnerPage() {
  let opponents: OpponentStat[] = []
  let leagueName = 'Regionalliga Nordost'
  let seasonLabel: string | null = null
  let error: string | null = null

  try {
    const league = await prisma.league.findFirst({
      where: { season: { isCurrent: true } },
      include: { season: true },
      orderBy: { tier: 'asc' },
    })
    const targetLeague =
      league ??
      (await prisma.league.findFirst({
        include: { season: true },
        orderBy: [{ season: { startYear: 'desc' } }, { tier: 'asc' }],
      }))

    if (targetLeague) {
      leagueName = targetLeague.name
      seasonLabel = targetLeague.season?.label ?? null
    }

    const rows = (await prisma.match.findMany({
      where: {
        ...(targetLeague ? { leagueId: targetLeague.id } : {}),
        status: 'FINISHED',
        OR: [{ homeTeam: { isOwn: true } }, { awayTeam: { isOwn: true } }],
      },
      include: {
        homeTeam: { select: { id: true, name: true, shortName: true, isOwn: true } },
        awayTeam: { select: { id: true, name: true, shortName: true, isOwn: true } },
      },
      orderBy: [{ kickoff: 'asc' }],
    })) as MatchRow[]

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

    opponents = Array.from(map.values())
      .map((o) => {
        const points = o.wins * 3 + o.draws
        const goalDifference = o.goalsFor - o.goalsAgainst
        return {
          ...o,
          points,
          goalDifference,
          pointsPerGame: o.played > 0 ? points / o.played : 0,
        }
      })
      .sort((a, b) => b.points - a.points || b.goalDifference - a.goalDifference || a.name.localeCompare(b.name, 'de'))
  } catch (e) {
    error = 'Gegnerbilanz konnte nicht geladen werden. Bitte versuche es später erneut.'
    console.error('Gegnerbilanz load error', e)
  }

  const totalPlayed = opponents.reduce((s, o) => s + o.played, 0)

  return (
    <div className="min-h-screen bg-fc-bg">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-fc-fg md:text-4xl">Gegnerbilanz</h1>
          <p className="mt-2 text-fc-fg/70">
            {leagueName}
            {seasonLabel ? ` · Saison ${seasonLabel}` : ''} – Aues Bilanz gegen alle Gegner
          </p>
          <p className="mt-1 text-sm text-fc-fg/55">
            {opponents.length} {opponents.length === 1 ? 'Gegner' : 'Gegner'} · {totalPlayed}{' '}
            {totalPlayed === 1 ? 'abgeschlossenes Spiel' : 'abgeschlossene Spiele'}
          </p>
        </div>

        {error ? (
          <div
            className="flex items-center gap-3 rounded-xl border border-fc-loss/30 bg-fc-loss/10 p-5 text-fc-loss"
            role="alert"
          >
            <AlertCircle className="h-5 w-5 shrink-0" aria-hidden="true" />
            <p className="text-sm font-medium">{error}</p>
          </div>
        ) : opponents.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-fc-border/70 bg-fc-surface/40 py-16 text-center text-fc-fg/70">
            <SearchX className="h-10 w-10 text-fc-fg/40" aria-hidden="true" />
            <p className="text-base font-medium text-fc-fg">Keine Gegnerbilanz verfügbar</p>
            <p className="max-w-md text-sm text-fc-fg/60">
              Es sind noch keine abgeschlossenen Spiele des FC Erzgebirge Aue mit Ergebnis vorhanden. Synchronisiere Spieldaten,
              um Bilanzen gegen Gegner anzuzeigen.
            </p>
          </div>
        ) : (
          <GegnerExplorer opponents={opponents} />
        )}
      </div>
    </div>
  )
}
