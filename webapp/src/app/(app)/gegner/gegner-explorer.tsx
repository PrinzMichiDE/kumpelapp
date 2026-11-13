'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { Badge, Card, CardContent, Input } from '@kumpelapp/ui'
import { cn, formatDate } from '@kumpelapp/utils'
import { ArrowRight, Calendar, Search, SearchX, Swords, TrendingUp, X } from 'lucide-react'

export type OpponentStat = {
  id: string
  name: string
  shortName: string | null
  played: number
  wins: number
  draws: number
  losses: number
  goalsFor: number
  goalsAgainst: number
  goalDifference: number
  points: number
  pointsPerGame: number
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

type SortKey = 'points' | 'name' | 'played' | 'diff' | 'last'

function resultLabel(r: 'W' | 'D' | 'L') {
  if (r === 'W') return 'Sieg'
  if (r === 'D') return 'Remis'
  return 'Niederlage'
}

function resultClass(r: 'W' | 'D' | 'L') {
  if (r === 'W') return 'border-fc-win/30 bg-fc-win/10 text-fc-win'
  if (r === 'D') return 'border-fc-draw/30 bg-fc-draw/10 text-fc-draw'
  return 'border-fc-loss/30 bg-fc-loss/10 text-fc-loss'
}

function recordText(w: number, d: number, l: number) {
  return `${w}S · ${d}U · ${l}N`
}

export function GegnerExplorer({ opponents }: { opponents: OpponentStat[] }) {
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState<SortKey>('points')
  const [onlyMultiple, setOnlyMultiple] = useState(false)

  const normalized = query.trim().toLowerCase()

  const filtered = useMemo(() => {
    const base = opponents.filter((o) => {
      if (onlyMultiple && o.played < 2) return false
      if (!normalized) return true
      const hay = [o.name, o.shortName ?? ''].join(' ').toLowerCase()
      return hay.includes(normalized)
    })

    const sorted = [...base].sort((a, b) => {
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
          return b.points - a.points || b.goalDifference - a.goalDifference || b.pointsPerGame - a.pointsPerGame || a.name.localeCompare(b.name, 'de')
      }
    })
    return sorted
  }, [opponents, normalized, sort, onlyMultiple])

  const totals = useMemo(() => {
    const played = opponents.reduce((s, o) => s + o.played, 0)
    const wins = opponents.reduce((s, o) => s + o.wins, 0)
    const draws = opponents.reduce((s, o) => s + o.draws, 0)
    const losses = opponents.reduce((s, o) => s + o.losses, 0)
    const gf = opponents.reduce((s, o) => s + o.goalsFor, 0)
    const ga = opponents.reduce((s, o) => s + o.goalsAgainst, 0)
    const positive = opponents.filter((o) => o.points > o.played).length
    return { played, wins, draws, losses, gf, ga, positive }
  }, [opponents])

  const hasFilters = normalized.length > 0 || sort !== 'points' || onlyMultiple

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <Card className="border-fc-border/70">
          <CardContent className="p-4">
            <p className="text-xs uppercase tracking-wide text-fc-fg/55">Gegner</p>
            <p className="mt-1 text-2xl font-bold tabular-nums text-fc-fg">{opponents.length}</p>
          </CardContent>
        </Card>
        <Card className="border-fc-border/70">
          <CardContent className="p-4">
            <p className="text-xs uppercase tracking-wide text-fc-fg/55">Spiele</p>
            <p className="mt-1 text-2xl font-bold tabular-nums text-fc-fg">{totals.played}</p>
          </CardContent>
        </Card>
        <Card className="border-fc-border/70">
          <CardContent className="p-4">
            <p className="text-xs uppercase tracking-wide text-fc-fg/55">Bilanz</p>
            <p className="mt-1 text-sm font-bold tabular-nums sm:text-base">
              <span className="text-fc-win">{totals.wins}S</span> <span className="text-fc-draw">{totals.draws}U</span>{' '}
              <span className="text-fc-loss">{totals.losses}N</span>
            </p>
          </CardContent>
        </Card>
        <Card className="border-fc-border/70">
          <CardContent className="p-4">
            <p className="text-xs uppercase tracking-wide text-fc-fg/55">Tore</p>
            <p className="mt-1 text-xl font-bold tabular-nums text-fc-fg">
              {totals.gf}:{totals.ga}
            </p>
          </CardContent>
        </Card>
        <Card className="border-fc-border/70">
          <CardContent className="p-4">
            <p className="text-xs uppercase tracking-wide text-fc-fg/55">Tor-Diff</p>
            <p className="mt-1 text-2xl font-bold tabular-nums text-fc-fg">
              {totals.gf - totals.ga >= 0 ? '+' : ''}
              {totals.gf - totals.ga}
            </p>
          </CardContent>
        </Card>
        <Card className="border-fc-border/70">
          <CardContent className="p-4">
            <p className="text-xs uppercase tracking-wide text-fc-fg/55">Positive Bilanz</p>
            <p className="mt-1 text-2xl font-bold tabular-nums text-fc-fg">{totals.positive}</p>
            <p className="text-xs text-fc-fg/55">&gt; 1,00 Pkt/Spiel</p>
          </CardContent>
        </Card>
      </div>

      <div className="rounded-xl border border-fc-border/70 bg-fc-surface/50 p-4 sm:p-5">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_auto_auto] lg:items-end">
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-fc-fg/80">Gegner suchen</span>
            <div className="relative">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-fc-fg/45"
                aria-hidden="true"
              />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Vereinsname oder Kurzname"
                className="pl-9 pr-9"
                aria-label="Gegner suchen"
              />
              {query ? (
                <button
                  type="button"
                  onClick={() => setQuery('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-fc-fg/55 transition-colors hover:bg-fc-violet/10 hover:text-fc-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fc-violet focus-visible:ring-offset-2 focus-visible:ring-offset-fc-surface"
                  aria-label="Suche zurücksetzen"
                >
                  <X className="h-4 w-4" aria-hidden="true" />
                </button>
              ) : null}
            </div>
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-fc-fg/80">Sortierung</span>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
              className="h-11 rounded-lg border border-fc-border bg-fc-bg/40 px-3 text-sm text-fc-fg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fc-violet focus-visible:ring-offset-2 focus-visible:ring-offset-fc-surface"
              aria-label="Sortierung wählen"
            >
              <option value="points">Beste Bilanz (Punkte)</option>
              <option value="diff">Beste Tordifferenz</option>
              <option value="played">Meiste Spiele</option>
              <option value="last">Letztes Duell (neueste)</option>
              <option value="name">Name (A–Z)</option>
            </select>
          </label>

          <div className="flex flex-wrap items-end gap-2">
            <button
              type="button"
              onClick={() => setOnlyMultiple((v) => !v)}
              className={cn(
                'inline-flex h-11 items-center gap-2 rounded-lg border px-4 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fc-violet focus-visible:ring-offset-2 focus-visible:ring-offset-fc-surface',
                onlyMultiple
                  ? 'border-fc-violet/35 bg-fc-violet/15 text-fc-fg'
                  : 'border-fc-border bg-fc-bg/40 text-fc-fg/80 hover:border-fc-violet/35 hover:bg-fc-violet/10',
              )}
              aria-pressed={onlyMultiple}
            >
              <Swords className="h-4 w-4" aria-hidden="true" />
              Nur ≥ 2 Spiele
            </button>
            {hasFilters ? (
              <button
                type="button"
                onClick={() => {
                  setQuery('')
                  setSort('points')
                  setOnlyMultiple(false)
                }}
                className="inline-flex h-11 items-center rounded-lg px-3 text-sm font-medium text-fc-fg/70 transition-colors hover:bg-fc-violet/10 hover:text-fc-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fc-violet focus-visible:ring-offset-2 focus-visible:ring-offset-fc-surface"
              >
                Zurücksetzen
              </button>
            ) : null}
          </div>
        </div>
        <p className="mt-3 text-sm text-fc-fg/60" aria-live="polite">
          {filtered.length} von {opponents.length} {opponents.length === 1 ? 'Gegner' : 'Gegnern'} angezeigt
        </p>
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-fc-border/70 bg-fc-surface/40 py-16 text-center text-fc-fg/70">
          <SearchX className="h-10 w-10 text-fc-fg/40" aria-hidden="true" />
          <p className="text-base font-medium text-fc-fg">Keine Gegner gefunden</p>
          <p className="max-w-md text-sm text-fc-fg/60">Passe Suche, Sortierung oder Filter an.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((o) => (
            <Card
              key={o.id}
              className="border-fc-border/70 transition-[border-color,box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:border-fc-violet/40 hover:shadow-lg hover:shadow-fc-violet/5"
            >
              <CardContent className="p-4 sm:p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h2 className="truncate text-lg font-semibold text-fc-fg" title={o.name}>
                      {o.name}
                    </h2>
                    <p className="mt-0.5 text-sm text-fc-fg/60">
                      {o.played} {o.played === 1 ? 'Spiel' : 'Spiele'} · {o.points} Pkt ·{' '}
                      {o.played > 0 ? o.pointsPerGame.toFixed(2) : '–'} Pkt/Spiel
                    </p>
                  </div>
                  <Badge variant="outline" className="shrink-0 tabular-nums">
                    {o.goalDifference >= 0 ? '+' : ''}
                    {o.goalDifference}
                  </Badge>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                  <div className="rounded-lg border border-fc-border/60 bg-fc-bg/30 p-2.5">
                    <p className="text-xs text-fc-fg/55">Gesamt</p>
                    <p className="mt-1 font-semibold tabular-nums text-fc-fg">
                      <span className="text-fc-win">{o.wins}</span>-<span className="text-fc-draw">{o.draws}</span>-
                      <span className="text-fc-loss">{o.losses}</span>
                    </p>
                    <p className="text-xs text-fc-fg/60">
                      Tore {o.goalsFor}:{o.goalsAgainst}
                    </p>
                  </div>
                  <div className="rounded-lg border border-fc-border/60 bg-fc-bg/30 p-2.5">
                    <p className="text-xs text-fc-fg/55">Heim / Auswärts</p>
                    <p className="mt-1 text-xs text-fc-fg/80">
                      H: <span className="font-medium tabular-nums">{recordText(o.homeWins, o.homeDraws, o.homeLosses)}</span>
                    </p>
                    <p className="text-xs text-fc-fg/80">
                      A: <span className="font-medium tabular-nums">{recordText(o.awayWins, o.awayDraws, o.awayLosses)}</span>
                    </p>
                  </div>
                </div>

                {o.played > 0 ? (
                  <div className="mt-3 flex h-2 overflow-hidden rounded-full bg-fc-bg/60" aria-hidden="true">
                    <div className="bg-fc-win" style={{ width: `${(o.wins / o.played) * 100}%` }} title={`${o.wins} Siege`} />
                    <div className="bg-fc-draw" style={{ width: `${(o.draws / o.played) * 100}%` }} title={`${o.draws} Unentschieden`} />
                    <div className="bg-fc-loss" style={{ width: `${(o.losses / o.played) * 100}%` }} title={`${o.losses} Niederlagen`} />
                  </div>
                ) : null}

                <div className="mt-4 flex items-center justify-between gap-3 border-t border-fc-border/60 pt-3">
                  {o.last ? (
                    <div className="min-w-0">
                      <p className="text-xs text-fc-fg/55">Letztes Duell</p>
                      <div className="mt-1 flex flex-wrap items-center gap-2">
                        <span
                          className={cn(
                            'inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-semibold tabular-nums',
                            resultClass(o.last.result),
                          )}
                          title={resultLabel(o.last.result)}
                        >
                          {o.last.aueGoals}:{o.last.oppGoals}
                        </span>
                        <span className="inline-flex items-center gap-1 text-xs text-fc-fg/60">
                          <Calendar className="h-3.5 w-3.5" aria-hidden="true" />
                          {formatDate(o.last.kickoff)}
                        </span>
                        <span className="text-xs text-fc-fg/50">{o.last.venue === 'home' ? 'Heim' : 'Auswärts'}</span>
                      </div>
                    </div>
                  ) : (
                    <span className="text-xs text-fc-fg/50">Kein letztes Duell</span>
                  )}
                  {o.last ? (
                    <Link
                      href={`/spiel/${o.last.matchId}`}
                      className="inline-flex shrink-0 items-center gap-1 rounded-md text-sm font-medium text-fc-violet hover:text-fc-violet-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fc-violet"
                      aria-label={`Letztes Spiel gegen ${o.name} öffnen`}
                    >
                      Spiel <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </Link>
                  ) : null}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <div className="flex items-start gap-2 rounded-xl border border-fc-border/70 bg-fc-surface/40 p-4 text-sm text-fc-fg/70">
        <TrendingUp className="mt-0.5 h-4 w-4 shrink-0 text-fc-violet" aria-hidden="true" />
        <p>
          Die Gegnerbilanz basiert auf abgeschlossenen Spielen mit Ergebnis in der ausgewählten Saison. „Positive Bilanz“ zählt
          Gegner, gegen die Aue im Schnitt mehr als einen Punkt pro Spiel holt.
        </p>
      </div>
    </div>
  )
}
