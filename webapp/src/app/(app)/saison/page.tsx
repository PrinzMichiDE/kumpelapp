import type { Metadata } from 'next'
import Link from 'next/link'
import { prisma } from '@kumpelapp/db'
import { Badge, Card, CardContent, CardHeader, CardTitle } from '@kumpelapp/ui'
import { cn, formatDate, formatKickoff } from '@kumpelapp/utils'
import {
  Activity,
  AlertCircle,
  ArrowRight,
  BarChart3,
  Calendar,
  Goal,
  Home,
  PlaneTakeoff,
  SearchX,
  Shield,
} from 'lucide-react'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Saisonverlauf',
  description: 'Ergebnisse, Formkurve und Bilanz des FC Erzgebirge Aue in der aktuellen Saison.',
}

type Result = 'W' | 'D' | 'L'

interface AueMatchRow {
  id: string
  kickoff: Date
  status: string
  matchday: number | null
  homeGoals: number | null
  awayGoals: number | null
  homeTeam: { name: string; shortName: string | null; isOwn: boolean }
  awayTeam: { name: string; shortName: string | null; isOwn: boolean }
  venue: { name: string } | null
}

function outcome(aueGoals: number, oppGoals: number): Result {
  if (aueGoals > oppGoals) return 'W'
  if (aueGoals === oppGoals) return 'D'
  return 'L'
}

function resultLabel(r: Result) {
  if (r === 'W') return 'Sieg'
  if (r === 'D') return 'Unentschieden'
  return 'Niederlage'
}

function resultBadgeClass(r: Result) {
  if (r === 'W') return 'border-fc-win/30 bg-fc-win/10 text-fc-win'
  if (r === 'D') return 'border-fc-draw/30 bg-fc-draw/10 text-fc-draw'
  return 'border-fc-loss/30 bg-fc-loss/10 text-fc-loss'
}

function resultShort(r: Result) {
  if (r === 'W') return 'S'
  if (r === 'D') return 'U'
  return 'N'
}

function streakLabel(results: Result[], target: Result) {
  let max = 0
  let current = 0
  for (const r of results) {
    if (r === target) {
      current += 1
      if (current > max) max = current
    } else {
      current = 0
    }
  }
  return max
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

export default async function SaisonPage() {
  let matches: AueMatchRow[] = []
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

    const rows = await prisma.match.findMany({
      where: {
        ...(targetLeague ? { leagueId: targetLeague.id } : {}),
        OR: [{ homeTeam: { isOwn: true } }, { awayTeam: { isOwn: true } }],
      },
      include: {
        homeTeam: { select: { name: true, shortName: true, isOwn: true } },
        awayTeam: { select: { name: true, shortName: true, isOwn: true } },
        venue: { select: { name: true } },
      },
      orderBy: [{ matchday: 'asc' }, { kickoff: 'asc' }],
    })

    matches = rows.map((m) => ({
      id: m.id,
      kickoff: m.kickoff,
      status: m.status,
      matchday: m.matchday,
      homeGoals: m.homeGoals,
      awayGoals: m.awayGoals,
      homeTeam: m.homeTeam,
      awayTeam: m.awayTeam,
      venue: m.venue ? { name: m.venue.name } : null,
    }))
  } catch (e) {
    error = 'Saisonverlauf konnte nicht geladen werden. Bitte versuche es später erneut.'
    console.error('Saison load error', e)
  }

  const finished = matches.filter(
    (m) => m.status === 'FINISHED' && m.homeGoals !== null && m.awayGoals !== null,
  )
  const upcoming = matches.filter(
    (m) => m.status === 'SCHEDULED' || m.status === 'LIVE' || m.status === 'POSTPONED',
  )
  const nextMatch = upcoming[0] ?? null

  const progression = finished.map((m, idx) => {
    const aueIsHome = m.homeTeam.isOwn
    const aueGoals = aueIsHome ? (m.homeGoals ?? 0) : (m.awayGoals ?? 0)
    const oppGoals = aueIsHome ? (m.awayGoals ?? 0) : (m.homeGoals ?? 0)
    const res = outcome(aueGoals, oppGoals)
    const pts = res === 'W' ? 3 : res === 'D' ? 1 : 0
    const opponent = aueIsHome
      ? m.awayTeam.shortName || m.awayTeam.name
      : m.homeTeam.shortName || m.homeTeam.name
    return {
      match: m,
      aueIsHome,
      aueGoals,
      oppGoals,
      result: res,
      points: pts,
      opponent,
      index: idx,
    }
  })

  let runningPoints = 0
  let runningGF = 0
  let runningGA = 0
  const progressionWithTotals = progression.map((p) => {
    runningPoints += p.points
    runningGF += p.aueGoals
    runningGA += p.oppGoals
    return {
      ...p,
      totalPoints: runningPoints,
      totalGF: runningGF,
      totalGA: runningGA,
      totalGD: runningGF - runningGA,
    }
  })

  const results = progression.map((p) => p.result)
  const wins = results.filter((r) => r === 'W').length
  const draws = results.filter((r) => r === 'D').length
  const losses = results.filter((r) => r === 'L').length
  const points = wins * 3 + draws
  const goalsFor = progression.reduce((s, p) => s + p.aueGoals, 0)
  const goalsAgainst = progression.reduce((s, p) => s + p.oppGoals, 0)
  const played = progression.length
  const ppg = played > 0 ? (points / played).toFixed(2) : '–'
  const cleanSheets = progression.filter((p) => p.oppGoals === 0).length
  const scoredMatches = progression.filter((p) => p.aueGoals > 0).length
  const activeStreak = currentStreak(results)
  const longestWin = streakLabel(results, 'W')
  const longestUnbeaten = (() => {
    let max = 0
    let cur = 0
    for (const r of results) {
      if (r !== 'L') {
        cur += 1
        if (cur > max) max = cur
      } else cur = 0
    }
    return max
  })()

  const homeProg = progression.filter((p) => p.aueIsHome)
  const awayProg = progression.filter((p) => !p.aueIsHome)
  function splitStats(list: typeof progression) {
    const w = list.filter((p) => p.result === 'W').length
    const d = list.filter((p) => p.result === 'D').length
    const l = list.filter((p) => p.result === 'L').length
    const gf = list.reduce((s, p) => s + p.aueGoals, 0)
    const ga = list.reduce((s, p) => s + p.oppGoals, 0)
    return { played: list.length, w, d, l, pts: w * 3 + d, gf, ga }
  }
  const home = splitStats(homeProg)
  const away = splitStats(awayProg)

  const recent = progressionWithTotals.slice(-5).reverse()

  return (
    <div className="min-h-screen bg-fc-bg">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-fc-fg md:text-4xl">Saisonverlauf</h1>
          <p className="mt-2 text-fc-fg/70">
            {leagueName}
            {seasonLabel ? ` · Saison ${seasonLabel}` : ''} – Ergebnisse, Form und Bilanz des FC Erzgebirge Aue
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
        ) : played === 0 && upcoming.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-fc-border/70 bg-fc-surface/40 py-16 text-center text-fc-fg/70">
            <SearchX className="h-10 w-10 text-fc-fg/40" aria-hidden="true" />
            <p className="text-base font-medium text-fc-fg">Keine Spieldaten vorhanden</p>
            <p className="max-w-md text-sm text-fc-fg/60">
              Für den Saisonverlauf werden Spiele des FC Erzgebirge Aue benötigt. Synchronisiere Spieldaten im Admin-Bereich.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
              <Card className="border-fc-border/70">
                <CardContent className="p-4">
                  <p className="text-xs uppercase tracking-wide text-fc-fg/55">Spiele</p>
                  <p className="mt-1 text-2xl font-bold tabular-nums text-fc-fg">{played}</p>
                  <p className="text-xs text-fc-fg/55">{upcoming.length} ausstehend</p>
                </CardContent>
              </Card>
              <Card className="border-fc-border/70">
                <CardContent className="p-4">
                  <p className="text-xs uppercase tracking-wide text-fc-fg/55">Punkte</p>
                  <p className="mt-1 text-2xl font-bold tabular-nums text-fc-fg">{points}</p>
                  <p className="text-xs text-fc-fg/55">{ppg} pro Spiel</p>
                </CardContent>
              </Card>
              <Card className="border-fc-border/70">
                <CardContent className="p-4">
                  <p className="text-xs uppercase tracking-wide text-fc-fg/55">Bilanz</p>
                  <p className="mt-1 text-lg font-bold tabular-nums">
                    <span className="text-fc-win">{wins}S</span>{' '}
                    <span className="text-fc-draw">{draws}U</span>{' '}
                    <span className="text-fc-loss">{losses}N</span>
                  </p>
                  <p className="text-xs text-fc-fg/55">
                    Siegquote {played ? Math.round((wins / played) * 100) : 0}%
                  </p>
                </CardContent>
              </Card>
              <Card className="border-fc-border/70">
                <CardContent className="p-4">
                  <p className="text-xs uppercase tracking-wide text-fc-fg/55">Tore</p>
                  <p className="mt-1 text-2xl font-bold tabular-nums text-fc-fg">
                    {goalsFor}:{goalsAgainst}
                  </p>
                  <p className="text-xs text-fc-fg/55">
                    Diff {goalsFor - goalsAgainst >= 0 ? '+' : ''}
                    {goalsFor - goalsAgainst}
                  </p>
                </CardContent>
              </Card>
              <Card className="border-fc-border/70">
                <CardContent className="p-4">
                  <p className="text-xs uppercase tracking-wide text-fc-fg/55">Zu Null</p>
                  <p className="mt-1 text-2xl font-bold tabular-nums text-fc-fg">{cleanSheets}</p>
                  <p className="text-xs text-fc-fg/55">{scoredMatches} Spiele mit Tor</p>
                </CardContent>
              </Card>
              <Card className="border-fc-border/70">
                <CardContent className="p-4">
                  <p className="text-xs uppercase tracking-wide text-fc-fg/55">Aktuelle Serie</p>
                  {activeStreak ? (
                    <>
                      <p
                        className={cn(
                          'mt-1 text-lg font-bold',
                          resultBadgeClass(activeStreak.result)
                            .split(' ')
                            .find((c) => c.startsWith('text-')),
                        )}
                      >
                        {activeStreak.count}× {resultLabel(activeStreak.result)}
                      </p>
                      <p className="text-xs text-fc-fg/55">
                        Best: {longestWin}S / {longestUnbeaten} ungeschlagen
                      </p>
                    </>
                  ) : (
                    <p className="mt-1 text-sm text-fc-fg/60">–</p>
                  )}
                </CardContent>
              </Card>
            </div>

            {recent.length > 0 ? (
              <Card className="border-fc-border/70">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Activity className="h-5 w-5 text-fc-violet" aria-hidden="true" />
                    Formkurve (letzte {recent.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {recent.map((p) => (
                      <Link
                        key={p.match.id}
                        href={`/spiel/${p.match.id}`}
                        className={cn(
                          'group flex min-w-[8.5rem] flex-1 flex-col rounded-xl border p-3 transition-colors hover:border-fc-violet/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fc-violet',
                          resultBadgeClass(p.result),
                        )}
                        aria-label={`${resultLabel(p.result)} gegen ${p.opponent}, ${p.aueGoals}:${p.oppGoals}`}
                      >
                        <span className="text-xs font-semibold uppercase tracking-wide opacity-80">
                          {resultLabel(p.result)}
                        </span>
                        <span className="mt-1 text-lg font-bold tabular-nums">
                          {p.aueGoals}:{p.oppGoals}
                        </span>
                        <span className="mt-0.5 truncate text-xs opacity-80">
                          {p.aueIsHome ? 'vs' : '@'} {p.opponent}
                        </span>
                        <span className="mt-1 text-[11px] opacity-70">Σ {p.totalPoints} Pkt</span>
                      </Link>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ) : null}

            <div className="grid gap-6 lg:grid-cols-2">
              <Card className="border-fc-border/70">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <BarChart3 className="h-5 w-5 text-fc-violet" aria-hidden="true" />
                    Heim vs. Auswärts
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { label: 'Heim', icon: Home, data: home },
                    { label: 'Auswärts', icon: PlaneTakeoff, data: away },
                  ].map(({ label, icon: Icon, data }) => (
                    <div key={label} className="rounded-xl border border-fc-border/70 bg-fc-surface/40 p-4">
                      <div className="mb-2 flex items-center justify-between gap-2">
                        <p className="flex items-center gap-2 font-medium text-fc-fg">
                          <Icon className="h-4 w-4 text-fc-fg/60" aria-hidden="true" />
                          {label}
                        </p>
                        <span className="text-sm text-fc-fg/60">
                          {data.played} Spiele · {data.pts} Pkt
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
                        <span>
                          <span className="font-semibold text-fc-win">{data.w}</span>{' '}
                          <span className="text-fc-fg/60">S</span>
                        </span>
                        <span>
                          <span className="font-semibold text-fc-draw">{data.d}</span>{' '}
                          <span className="text-fc-fg/60">U</span>
                        </span>
                        <span>
                          <span className="font-semibold text-fc-loss">{data.l}</span>{' '}
                          <span className="text-fc-fg/60">N</span>
                        </span>
                        <span className="text-fc-fg/70">
                          Tore {data.gf}:{data.ga}
                        </span>
                      </div>
                      {data.played > 0 ? (
                        <div
                          className="mt-3 flex h-2 overflow-hidden rounded-full bg-fc-bg/60"
                          aria-hidden="true"
                        >
                          <div className="bg-fc-win" style={{ width: `${(data.w / data.played) * 100}%` }} />
                          <div className="bg-fc-draw" style={{ width: `${(data.d / data.played) * 100}%` }} />
                          <div className="bg-fc-loss" style={{ width: `${(data.l / data.played) * 100}%` }} />
                        </div>
                      ) : null}
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="border-fc-border/70">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Calendar className="h-5 w-5 text-fc-violet" aria-hidden="true" />
                    {nextMatch ? 'Nächstes Spiel' : 'Ausblick'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {nextMatch ? (
                    <Link
                      href={`/spiel/${nextMatch.id}`}
                      className="group block rounded-xl border border-fc-border/70 bg-fc-surface/40 p-4 transition-colors hover:border-fc-violet/40 hover:bg-fc-violet/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fc-violet"
                    >
                      <div className="flex flex-wrap items-center gap-2">
                        {nextMatch.matchday ? (
                          <Badge variant="outline">{nextMatch.matchday}. Spieltag</Badge>
                        ) : null}
                        <Badge variant={nextMatch.status === 'LIVE' ? 'destructive' : 'secondary'}>
                          {nextMatch.homeTeam.isOwn ? 'Heim' : 'Auswärts'}
                        </Badge>
                      </div>
                      <p className="mt-3 text-lg font-semibold text-fc-fg group-hover:text-fc-violet-light">
                        {nextMatch.homeTeam.shortName || nextMatch.homeTeam.name} –{' '}
                        {nextMatch.awayTeam.shortName || nextMatch.awayTeam.name}
                      </p>
                      <p className="mt-1 text-sm text-fc-fg/70">
                        {formatDate(nextMatch.kickoff)} · {formatKickoff(nextMatch.kickoff)} Uhr
                        {nextMatch.venue ? ` · ${nextMatch.venue.name}` : ''}
                      </p>
                      <span className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-fc-violet">
                        Zum Spiel <ArrowRight className="h-4 w-4" aria-hidden="true" />
                      </span>
                    </Link>
                  ) : (
                    <p className="text-sm text-fc-fg/60">
                      Keine weiteren angesetzten Spiele in den Daten.
                    </p>
                  )}
                  <div className="mt-4 flex flex-wrap gap-3 text-sm">
                    <Link
                      href="/spielplan"
                      className="inline-flex items-center gap-1 font-medium text-fc-violet hover:text-fc-violet-light"
                    >
                      Spielplan <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </Link>
                    <Link
                      href="/tabelle"
                      className="inline-flex items-center gap-1 font-medium text-fc-violet hover:text-fc-violet-light"
                    >
                      Tabelle <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>

            {progressionWithTotals.length > 0 ? (
              <Card className="border-fc-border/70">
                <CardHeader className="border-b border-fc-border/70 pb-4">
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <Goal className="h-5 w-5 text-fc-violet" aria-hidden="true" />
                    Spiele im Saisonverlauf
                  </CardTitle>
                  <p className="text-sm text-fc-fg/60">
                    Abgeschlossene Pflichtspiele in chronologischer Reihenfolge mit Punkteverlauf.
                  </p>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto overscroll-x-contain">
                    <table
                      className="w-full min-w-[760px] border-collapse text-left"
                      aria-label="Saisonverlauf Spiele"
                    >
                      <thead>
                        <tr className="bg-fc-surface/90">
                          <th
                            scope="col"
                            className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-fc-fg/65"
                          >
                            Spieltag
                          </th>
                          <th
                            scope="col"
                            className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-fc-fg/65"
                          >
                            Datum
                          </th>
                          <th
                            scope="col"
                            className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-fc-fg/65"
                          >
                            Gegner
                          </th>
                          <th
                            scope="col"
                            className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-fc-fg/65"
                          >
                            Ort
                          </th>
                          <th
                            scope="col"
                            className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-fc-fg/65"
                          >
                            Ergebnis
                          </th>
                          <th
                            scope="col"
                            className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-fc-fg/65"
                          >
                            Res.
                          </th>
                          <th
                            scope="col"
                            className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-fc-fg/65"
                          >
                            Σ Pkt
                          </th>
                          <th
                            scope="col"
                            className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-fc-fg/65"
                          >
                            Σ Tore
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {progressionWithTotals.map((p) => (
                          <tr
                            key={p.match.id}
                            className="border-b border-fc-border/60 transition-colors hover:bg-fc-violet/5"
                          >
                            <td className="px-4 py-3 text-sm tabular-nums text-fc-fg/80">
                              {p.match.matchday ? `${p.match.matchday}.` : '–'}
                            </td>
                            <td className="px-4 py-3 text-sm text-fc-fg/80">
                              {formatDate(p.match.kickoff)}
                            </td>
                            <td className="px-4 py-3">
                              <Link
                                href={`/spiel/${p.match.id}`}
                                className="font-medium text-fc-fg hover:text-fc-violet-light rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fc-violet"
                              >
                                {p.opponent}
                              </Link>
                            </td>
                            <td className="px-4 py-3 text-center">
                              <span
                                className={cn(
                                  'inline-flex rounded-md px-2 py-0.5 text-xs font-medium',
                                  p.aueIsHome
                                    ? 'bg-fc-violet/12 text-fc-violet-light'
                                    : 'bg-fc-bg/50 text-fc-fg/70',
                                )}
                              >
                                {p.aueIsHome ? 'H' : 'A'}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-center text-sm font-bold tabular-nums text-fc-fg">
                              {p.aueGoals}:{p.oppGoals}
                            </td>
                            <td className="px-4 py-3 text-center">
                              <span
                                className={cn(
                                  'inline-flex min-w-[1.75rem] items-center justify-center rounded-md border px-1.5 py-0.5 text-xs font-bold',
                                  resultBadgeClass(p.result),
                                )}
                                title={resultLabel(p.result)}
                              >
                                {resultShort(p.result)}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-center text-sm font-semibold tabular-nums text-fc-fg">
                              {p.totalPoints}
                            </td>
                            <td className="px-4 py-3 text-center text-sm tabular-nums text-fc-fg/80">
                              {p.totalGF}:{p.totalGA}{' '}
                              <span className="text-fc-fg/50">
                                ({p.totalGD >= 0 ? '+' : ''}
                                {p.totalGD})
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="border-fc-border/70">
                <CardContent className="flex flex-col items-center gap-2 py-12 text-center text-fc-fg/70">
                  <Shield className="h-8 w-8 text-fc-fg/35" aria-hidden="true" />
                  <p className="font-medium text-fc-fg">Noch keine abgeschlossenen Spiele</p>
                  <p className="max-w-md text-sm text-fc-fg/60">
                    Sobald Ergebnisse vorliegen, erscheint hier der komplette Saisonverlauf mit Punktekurve.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
