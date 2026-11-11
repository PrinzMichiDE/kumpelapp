'use client'

import { useMemo, useState } from 'react'
import { Card, CardContent, Input } from '@kumpelapp/ui'
import { cn } from '@kumpelapp/utils'
import { Clock, History, Search, SearchX, X } from 'lucide-react'

type TimelineEvent = { year: number; title: string; description: string }
type SeasonRecord = {
  id: string
  label: string
  leagueName: string
  tier: number | null
  position: number | null
  points: number | null
  note: string | null
}

function decadeOf(year: number) {
  return Math.floor(year / 10) * 10
}

export function TraditionExplorer({
  timeline,
  seasonRecords,
}: {
  timeline: TimelineEvent[]
  seasonRecords: SeasonRecord[]
}) {
  const [timelineQuery, setTimelineQuery] = useState('')
  const [decade, setDecade] = useState<number | 'all'>('all')
  const [recordQuery, setRecordQuery] = useState('')
  const [tier, setTier] = useState<number | 'all'>('all')

  const decades = useMemo(() => {
    const set = new Set<number>()
    for (const e of timeline) set.add(decadeOf(e.year))
    return Array.from(set).sort((a, b) => a - b)
  }, [timeline])

  const filteredTimeline = useMemo(() => {
    const q = timelineQuery.trim().toLowerCase()
    return timeline.filter((e) => {
      if (decade !== 'all' && decadeOf(e.year) !== decade) return false
      if (!q) return true
      return `${e.year} ${e.title} ${e.description}`.toLowerCase().includes(q)
    })
  }, [timeline, timelineQuery, decade])

  const tiers = useMemo(() => {
    const set = new Set<number>()
    for (const r of seasonRecords) if (typeof r.tier === 'number') set.add(r.tier)
    return Array.from(set).sort((a, b) => a - b)
  }, [seasonRecords])

  const filteredRecords = useMemo(() => {
    const q = recordQuery.trim().toLowerCase()
    return seasonRecords.filter((r) => {
      if (tier !== 'all' && r.tier !== tier) return false
      if (!q) return true
      return `${r.label} ${r.leagueName} ${r.note ?? ''} ${r.position ?? ''} ${r.points ?? ''}`.toLowerCase().includes(q)
    })
  }, [seasonRecords, recordQuery, tier])

  const bestPlacement = useMemo(() => {
    const withPos = seasonRecords.filter((r): r is SeasonRecord & { position: number } => typeof r.position === 'number')
    if (withPos.length === 0) return null
    return withPos.reduce((best, r) => (r.position < best.position ? r : best), withPos[0])
  }, [seasonRecords])

  return (
    <div className="space-y-12">
      <section aria-labelledby="records-heading">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
          <h2 id="records-heading" className="flex items-center gap-3 text-2xl font-bold tracking-tight text-fc-fg">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-500/12 text-sky-300 ring-1 ring-inset ring-sky-400/20">
              <History className="h-5 w-5" aria-hidden="true" />
            </span>
            Saisonhistorie
          </h2>
          {bestPlacement ? (
            <p className="rounded-lg border border-fc-border/70 bg-fc-surface/50 px-3 py-2 text-sm text-fc-fg/70">
              Beste Platzierung in Auswahl: <span className="font-semibold text-fc-fg">#{bestPlacement.position}</span> ({bestPlacement.label}, {bestPlacement.leagueName})
            </p>
          ) : null}
        </div>

        {seasonRecords.length ? (
          <div className="space-y-4">
            <div className="rounded-xl border border-fc-border/70 bg-fc-surface/50 p-4 sm:p-5">
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_auto] lg:items-end">
                <label className="flex flex-col gap-1.5">
                  <span className="text-sm font-medium text-fc-fg/80">Saisonhistorie durchsuchen</span>
                  <div className="relative">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-fc-fg/45" aria-hidden="true" />
                    <Input
                      value={recordQuery}
                      onChange={(e) => setRecordQuery(e.target.value)}
                      placeholder="Saison, Liga, Hinweis oder Platz"
                      className="pl-9 pr-9"
                      aria-label="Saisonhistorie durchsuchen"
                    />
                    {recordQuery ? (
                      <button
                        type="button"
                        onClick={() => setRecordQuery('')}
                        className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-fc-fg/55 hover:bg-fc-violet/10 hover:text-fc-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fc-violet"
                        aria-label="Suche zurücksetzen"
                      >
                        <X className="h-4 w-4" aria-hidden="true" />
                      </button>
                    ) : null}
                  </div>
                </label>

                <div className="flex flex-wrap items-end gap-2">
                  <label className="flex flex-col gap-1 text-sm text-fc-fg/70">
                    <span className="sr-only">Ligaebene</span>
                    <select
                      value={tier === 'all' ? 'all' : String(tier)}
                      onChange={(e) => setTier(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                      className="h-11 rounded-lg border border-fc-border bg-fc-bg/40 px-3 text-sm text-fc-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fc-violet"
                      aria-label="Ligaebene filtern"
                    >
                      <option value="all">Alle Ebenen</option>
                      {tiers.map((t) => (
                        <option key={t} value={t}>Ebene {t}</option>
                      ))}
                    </select>
                  </label>
                  {(recordQuery || tier !== 'all') ? (
                    <button
                      type="button"
                      onClick={() => {
                        setRecordQuery('')
                        setTier('all')
                      }}
                      className="inline-flex h-11 items-center rounded-lg px-3 text-sm font-medium text-fc-fg/70 hover:bg-fc-violet/10 hover:text-fc-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fc-violet"
                    >
                      Zurücksetzen
                    </button>
                  ) : null}
                </div>
              </div>
              <p className="mt-3 text-sm text-fc-fg/60" aria-live="polite">
                {filteredRecords.length} von {seasonRecords.length} {seasonRecords.length === 1 ? 'Saison' : 'Saisons'} angezeigt
              </p>
            </div>

            {filteredRecords.length ? (
              <Card className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[640px] border-collapse text-left" aria-label="Saisonhistorie">
                      <thead>
                        <tr className="bg-fc-surface/90">
                          <th scope="col" className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-fc-fg/65">Saison</th>
                          <th scope="col" className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-fc-fg/65">Liga</th>
                          <th scope="col" className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-fc-fg/65">Ebene</th>
                          <th scope="col" className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-fc-fg/65">Platz</th>
                          <th scope="col" className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-fc-fg/65">Punkte</th>
                          <th scope="col" className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-fc-fg/65">Hinweis</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredRecords.map((r) => (
                          <tr key={r.id} className="border-t border-fc-border/70 hover:bg-fc-violet/5">
                            <td className="px-4 py-3 font-medium text-fc-fg">{r.label}</td>
                            <td className="px-4 py-3 text-fc-fg/80">{r.leagueName}</td>
                            <td className="px-4 py-3 text-center tabular-nums text-fc-fg/80">{r.tier ?? '–'}</td>
                            <td className="px-4 py-3 text-center tabular-nums text-fc-fg/80">{r.position ?? '–'}</td>
                            <td className="px-4 py-3 text-center tabular-nums text-fc-fg/80">{r.points ?? '–'}</td>
                            <td className="px-4 py-3 text-sm text-fc-fg/65">{r.note ?? '–'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-fc-border/70 bg-fc-surface/40 py-12 text-center text-fc-fg/70">
                <SearchX className="h-10 w-10 text-fc-fg/40" aria-hidden="true" />
                <p className="text-base font-medium text-fc-fg">Keine passenden Saisons gefunden</p>
                <p className="max-w-md text-sm text-fc-fg/60">Passe Suche oder Ligaebene an.</p>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-fc-border/70 bg-fc-surface/40 py-12 text-center text-fc-fg/70">
            <SearchX className="h-10 w-10 text-fc-fg/40" aria-hidden="true" />
            <p className="text-base font-medium text-fc-fg">Keine Saisonhistorie hinterlegt</p>
            <p className="max-w-md text-sm text-fc-fg/60">Synchronisiere Traditionsdaten im Admin-Bereich, um Saisonabschlüsse und Platzierungen anzuzeigen.</p>
          </div>
        )}
      </section>

      <section aria-labelledby="timeline-heading">
        <h2 id="timeline-heading" className="mb-5 flex items-center gap-3 text-2xl font-bold tracking-tight text-fc-fg">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500/12 text-orange-300 ring-1 ring-inset ring-orange-400/20">
            <Clock className="h-5 w-5" aria-hidden="true" />
          </span>
          Zeitstrahl – 80 Jahre
        </h2>

        <div className="rounded-xl border border-fc-border/70 bg-fc-surface/50 p-4 sm:p-5">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_auto] lg:items-end">
            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-medium text-fc-fg/80">Zeitstrahl durchsuchen</span>
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-fc-fg/45" aria-hidden="true" />
                <Input
                  value={timelineQuery}
                  onChange={(e) => setTimelineQuery(e.target.value)}
                  placeholder="Jahr, Titel oder Ereignis"
                  className="pl-9 pr-9"
                  aria-label="Zeitstrahl durchsuchen"
                />
                {timelineQuery ? (
                  <button
                    type="button"
                    onClick={() => setTimelineQuery('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-fc-fg/55 hover:bg-fc-violet/10 hover:text-fc-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fc-violet"
                    aria-label="Suche zurücksetzen"
                  >
                    <X className="h-4 w-4" aria-hidden="true" />
                  </button>
                ) : null}
              </div>
            </label>
            <div className="flex flex-wrap items-end gap-2">
              <div className="flex flex-wrap gap-2" role="group" aria-label="Jahrzehnt filtern">
                <button
                  type="button"
                  onClick={() => setDecade('all')}
                  className={cn(
                    'rounded-lg px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fc-violet',
                    decade === 'all' ? 'bg-fc-violet text-white' : 'border border-fc-border bg-fc-bg/40 text-fc-fg/80 hover:bg-fc-violet/10',
                  )}
                  aria-pressed={decade === 'all'}
                >
                  Alle
                </button>
                {decades.map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setDecade(d)}
                    className={cn(
                      'rounded-lg px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fc-violet',
                      decade === d ? 'bg-fc-violet text-white' : 'border border-fc-border bg-fc-bg/40 text-fc-fg/80 hover:bg-fc-violet/10',
                    )}
                    aria-pressed={decade === d}
                  >
                    {d}er
                  </button>
                ))}
              </div>
              {(timelineQuery || decade !== 'all') ? (
                <button
                  type="button"
                  onClick={() => {
                    setTimelineQuery('')
                    setDecade('all')
                  }}
                  className="inline-flex h-10 items-center rounded-lg px-3 text-sm font-medium text-fc-fg/70 hover:bg-fc-violet/10 hover:text-fc-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fc-violet"
                >
                  Zurücksetzen
                </button>
              ) : null}
            </div>
          </div>
          <p className="mt-3 text-sm text-fc-fg/60" aria-live="polite">
            {filteredTimeline.length} von {timeline.length} Ereignissen angezeigt
          </p>
        </div>

        {filteredTimeline.length ? (
          <ol className="relative ml-3 mt-5 border-l-2 border-fc-violet/25 pl-7 sm:ml-4 sm:pl-8">
            {filteredTimeline.map((event, index) => (
              <li key={`${event.year}-${event.title}`} className="relative pb-8 last:pb-0">
                <span
                  className={cn(
                    'absolute -left-[calc(0.875rem+1px)] top-1 flex h-4 w-4 items-center justify-center rounded-full border-2 border-fc-bg',
                    index === filteredTimeline.length - 1 ? 'bg-fc-violet-light shadow-sm shadow-fc-violet/30' : 'bg-fc-violet'
                  )}
                  aria-hidden="true"
                />
                <div className="rounded-xl border border-transparent px-1 py-0.5 transition-colors hover:border-fc-border/50 hover:bg-fc-surface/25">
                  <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                    <time className="text-lg font-bold tabular-nums text-fc-violet" dateTime={String(event.year)}>
                      {event.year}
                    </time>
                    <h3 className="text-base font-semibold leading-snug text-fc-fg sm:text-lg">{event.title}</h3>
                  </div>
                  <p className="mt-1 text-sm leading-relaxed text-fc-fg/70">{event.description}</p>
                </div>
              </li>
            ))}
          </ol>
        ) : (
          <div className="mt-5 flex flex-col items-center justify-center gap-3 rounded-xl border border-fc-border/70 bg-fc-surface/40 py-12 text-center text-fc-fg/70">
            <SearchX className="h-10 w-10 text-fc-fg/40" aria-hidden="true" />
            <p className="text-base font-medium text-fc-fg">Keine passenden Ereignisse gefunden</p>
            <p className="max-w-md text-sm text-fc-fg/60">Passe Suche oder Jahrzehnt an.</p>
          </div>
        )}
      </section>
    </div>
  )
}
