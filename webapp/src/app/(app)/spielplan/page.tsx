import { MatchDto, MatchListDto } from '@kumpelapp/api-contracts'
import { MatchQuery } from '@kumpelapp/api-contracts'
import { formatDate, formatKickoff, formatMatchDay } from '@kumpelapp/utils'
import { Card, CardContent } from '@kumpelapp/ui'
import { Badge } from '@kumpelapp/ui'
import { Calendar, Clock, MapPin, Trophy, AlertCircle, CheckCircle } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@kumpelapp/utils'

interface MatchCardProps {
  match: MatchDto
}

function MatchCard({ match }: MatchCardProps) {
  const isFinished = match.status === 'FINISHED'
  const isLive = match.status === 'LIVE'
  const isAueHome = match.homeTeam.isOwn

  const getStatusBadge = () => {
    switch (match.status) {
      case 'LIVE':
        return <Badge variant="destructive" className="animate-pulse"><AlertCircle className="h-3 w-3 mr-1" /> LIVE</Badge>
      case 'FINISHED':
        return <Badge variant="success"><CheckCircle className="h-3 w-3 mr-1" /> Beendet</Badge>
      case 'POSTPONED':
        return <Badge variant="warning">Verlegt</Badge>
      case 'CANCELLED':
        return <Badge variant="destructive">Abgesagt</Badge>
      default:
        return <Badge variant="outline">Geplant</Badge>
    }
  }

  const getResultDisplay = () => {
    if (!isFinished || match.homeGoals === null || match.awayGoals === null) return null

    const aueGoals = isAueHome ? match.homeGoals : match.awayGoals
    const opponentGoals = isAueHome ? match.awayGoals : match.homeGoals
    const isWin = aueGoals > opponentGoals
    const isDraw = aueGoals === opponentGoals
    const isLoss = aueGoals < opponentGoals

    return (
      <div className="flex items-center gap-3">
        <span className={cn(
          'text-2xl font-bold tabular-nums',
          isWin && 'text-fc-win',
          isDraw && 'text-fc-draw',
          isLoss && 'text-fc-loss'
        )}>
          {aueGoals}:{opponentGoals}
        </span>
        {isWin && <span className="text-fc-win">✓</span>}
        {isDraw && <span className="text-fc-draw">⏸</span>}
        {isLoss && <span className="text-fc-loss">✗</span>}
      </div>
    )
  }

  return (
    <Link
      href={`/spiel/${match.id}`}
      className="group block rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fc-violet focus-visible:ring-offset-2 focus-visible:ring-offset-fc-bg"
      aria-label={`Spiel: ${match.homeTeam.name} gegen ${match.awayTeam.name}${match.matchday ? `, ${match.matchday}. Spieltag` : ''}`}
    >
      <Card className="transition-[transform,border-color,box-shadow] duration-200 group-hover:-translate-y-0.5 group-hover:border-fc-violet/45 group-hover:shadow-lg group-hover:shadow-fc-violet/5 group-focus-visible:-translate-y-0.5 group-focus-visible:border-fc-violet/45 group-focus-visible:shadow-lg">
        <CardContent className="p-4 sm:p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4 flex-1 min-w-0">
              <div className="flex flex-col items-center sm:items-start gap-1 flex-shrink-0 w-20">
                <span className="text-xs font-medium text-fc-fg/60">{formatMatchDay(match.kickoff)}</span>
                <span className="text-lg font-bold text-fc-fg">{formatDate(match.kickoff)}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  {match.matchday && (
                    <Badge variant="outline" className="text-xs">
                      <Trophy className="h-3 w-3 mr-1" /> {match.matchday}. Spieltag
                    </Badge>
                  )}
                  {getStatusBadge()}
                </div>
                <div className="mt-2 flex items-center gap-4 text-sm text-fc-fg/70 flex-wrap">
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4" /> {formatKickoff(match.kickoff)}
                  </span>
                  {match.venue && (
                    <span className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" /> {match.venue.name}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 flex-shrink-0">
              <div className="text-right sm:text-left">
                <p className={cn(
                  'font-medium truncate',
                  isAueHome ? 'text-fc-fg' : 'text-fc-fg/70'
                )}>
                  {match.homeTeam.name}
                </p>
                <p className={cn(
                  'font-medium truncate',
                  !isAueHome ? 'text-fc-fg' : 'text-fc-fg/70'
                )}>
                  {match.awayTeam.name}
                </p>
              </div>

              <div className="flex flex-col items-center gap-1 w-24">
                {getResultDisplay()}
                {isLive && (
                  <Badge variant="destructive" className="text-xs animate-pulse">
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-full w-full bg-red-500"></span>
                    </span>
                    {match.events?.[match.events.length - 1]?.minute || 0}'
                  </Badge>
                )}
              </div>

              <div className="text-right sm:text-left">
                <p className={cn(
                  'font-medium truncate',
                  isAueHome ? 'text-fc-fg/70' : 'text-fc-fg'
                )}>
                  {match.homeTeam.shortName || match.homeTeam.name}
                </p>
                <p className={cn(
                  'font-medium truncate',
                  !isAueHome ? 'text-fc-fg/70' : 'text-fc-fg'
                )}>
                  {match.awayTeam.shortName || match.awayTeam.name}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

export default function SpielplanPage() {
  return (
    <div className="min-h-screen bg-fc-bg">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-fc-fg">Spielplan</h1>
          <p className="mt-2 text-fc-fg/70">Alle Spiele der Saison 2026/27 – Regionalliga Nordost</p>
        </div>

        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:gap-4">
          <div className="flex min-w-0 flex-1 flex-col gap-1.5 sm:max-w-xs">
            <label htmlFor="competition-filter" className="text-sm font-medium text-fc-fg/80">
              Wettbewerb
            </label>
            <select
              id="competition-filter"
              name="competition"
              className="h-11 rounded-lg border border-fc-border bg-fc-surface px-4 text-sm text-fc-fg shadow-sm transition-[border-color,box-shadow] duration-200 focus-visible:border-fc-violet/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fc-violet focus-visible:ring-offset-2 focus-visible:ring-offset-fc-bg"
              defaultValue="all"
            >
              <option value="all">Alle Wettbewerbe</option>
              <option value="league">Liga</option>
              <option value="cup">Pokal</option>
            </select>
          </div>
          <div className="flex min-w-0 flex-1 flex-col gap-1.5 sm:max-w-xs">
            <label htmlFor="matchday-filter" className="text-sm font-medium text-fc-fg/80">
              Zeitraum
            </label>
            <select
              id="matchday-filter"
              name="timeframe"
              className="h-11 rounded-lg border border-fc-border bg-fc-surface px-4 text-sm text-fc-fg shadow-sm transition-[border-color,box-shadow] duration-200 focus-visible:border-fc-violet/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fc-violet focus-visible:ring-offset-2 focus-visible:ring-offset-fc-bg"
              defaultValue="all"
            >
              <option value="all">Alle Spieltage</option>
              <option value="upcoming">Kommende</option>
              <option value="past">Vergangene</option>
            </select>
          </div>
        </div>

        <div className="space-y-4" id="matches-list" aria-live="polite">
          <div className="flex items-center justify-center gap-3 rounded-xl border border-fc-border/70 bg-fc-surface/40 py-12 text-fc-fg/70" role="status">
            <div className="h-7 w-7 animate-spin rounded-full border-2 border-fc-violet/25 border-t-fc-violet" aria-hidden="true" />
            <span className="text-sm font-medium">Lade Spiele…</span>
          </div>
        </div>
      </div>
    </div>
  )
}