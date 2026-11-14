import Link from 'next/link'
import { ArrowRight, CalendarDays, History, Sparkles } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@kumpelapp/ui'
import { getDailyHighlight, getUpcomingDatedEvents } from '@/lib/aue-history'

function categoryLabel(cat?: string) {
  switch (cat) {
    case 'titel':
      return 'Titel'
    case 'aufstieg':
      return 'Aufstieg'
    case 'gruendung':
      return 'Gründung'
    case 'stadion':
      return 'Stadion'
    case 'verein':
      return 'Verein'
    default:
      return 'Meilenstein'
  }
}

export function TodayInAueHistoryCard({ compact = false }: { compact?: boolean }) {
  const highlight = getDailyHighlight()
  const isToday = highlight.kind === 'today'
  const main = highlight.events[0]
  const upcoming = isToday ? [] : getUpcomingDatedEvents(new Date(), 2)

  return (
    <Card className="border-fc-violet/25 bg-gradient-to-b from-fc-violet/[0.08] to-card">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between gap-2 text-lg">
          <span className="flex items-center gap-2">
            <History className="h-5 w-5 text-fc-violet" aria-hidden="true" />
            Heute in der Veilchen-Geschichte
          </span>
          <span className="rounded-full border border-fc-violet/25 bg-fc-violet/10 px-2.5 py-1 text-xs font-semibold text-fc-violet-light">
            {highlight.dateLabel}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {main ? (
          <div className="rounded-lg border border-fc-border/60 bg-fc-bg/25 p-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-bold tabular-nums text-fc-violet">{main.year}</span>
              <span className="rounded-md border border-fc-border bg-fc-surface/60 px-2 py-0.5 text-[11px] font-medium text-fc-fg/75">
                {categoryLabel(main.category)}
              </span>
              {isToday ? (
                <span className="inline-flex items-center gap-1 rounded-md border border-fc-draw/25 bg-fc-draw/10 px-2 py-0.5 text-[11px] font-semibold text-fc-draw">
                  <Sparkles className="h-3 w-3" aria-hidden="true" /> Jahrestag heute
                </span>
              ) : (
                <span className="text-[11px] font-medium text-fc-fg/55">Tägliches Highlight</span>
              )}
            </div>
            <p className="mt-1.5 font-semibold text-fc-fg">{main.title}</p>
            <p className={compact ? 'mt-1 line-clamp-3 text-sm leading-relaxed text-fc-fg/70' : 'mt-1 text-sm leading-relaxed text-fc-fg/70'}>
              {main.description}
            </p>
          </div>
        ) : null}

        {upcoming.length > 0 ? (
          <div>
            <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-fc-fg/55">
              <CalendarDays className="h-3.5 w-3.5" aria-hidden="true" /> Nächste Gedenktage
            </p>
            <ul className="space-y-1.5">
              {upcoming.map(({ event, next }) => (
                <li key={`${event.year}-${event.month}-${event.day}-${event.title}`} className="text-sm text-fc-fg/75">
                  <span className="font-medium text-fc-fg">
                    {String(next.getDate()).padStart(2, '0')}.{String(next.getMonth() + 1).padStart(2, '0')}.
                  </span>{' '}
                  <span className="tabular-nums text-fc-violet">{event.year}</span> – {event.title}
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        <Link
          href="/tradition"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-fc-violet transition-colors hover:text-fc-violet-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fc-violet focus-visible:ring-offset-2 focus-visible:ring-offset-fc-bg"
        >
          Zur Tradition & Chronik <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </CardContent>
    </Card>
  )
}

export function TodayInAueHistoryBanner() {
  const highlight = getDailyHighlight()
  const main = highlight.events[0]
  if (!main) return null
  const isToday = highlight.kind === 'today'

  return (
    <section aria-labelledby="today-history-heading" className="mb-10">
      <div className="rounded-xl border border-fc-violet/25 bg-gradient-to-r from-fc-violet/[0.12] via-fc-surface/60 to-fc-surface/40 p-5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-fc-violet/15 ring-1 ring-fc-violet/25">
                <History className="h-5 w-5 text-fc-violet" aria-hidden="true" />
              </span>
              <h2 id="today-history-heading" className="text-xl font-bold tracking-tight text-fc-fg sm:text-2xl">
                Heute in der Veilchen-Geschichte
              </h2>
              <span className="rounded-full border border-fc-violet/25 bg-fc-violet/10 px-2.5 py-1 text-xs font-semibold text-fc-violet-light">
                {highlight.dateLabel}
              </span>
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="text-base font-bold tabular-nums text-fc-violet">{main.year}</span>
              <span className="rounded-md border border-fc-border bg-fc-bg/40 px-2 py-0.5 text-xs font-medium text-fc-fg/75">
                {categoryLabel(main.category)}
              </span>
              {isToday ? (
                <span className="inline-flex items-center gap-1 rounded-md border border-fc-draw/25 bg-fc-draw/10 px-2 py-0.5 text-xs font-semibold text-fc-draw">
                  <Sparkles className="h-3.5 w-3.5" aria-hidden="true" /> Jahrestag heute
                </span>
              ) : (
                <span className="text-xs font-medium text-fc-fg/55">Tägliches Highlight aus der Aue-Chronik</span>
              )}
            </div>
            <p className="mt-2 text-lg font-semibold text-fc-fg">{main.title}</p>
            <p className="mt-1 max-w-3xl text-sm leading-relaxed text-fc-fg/75 sm:text-base">{main.description}</p>
          </div>
          <Link
            href="#timeline-heading"
            className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-xl border border-fc-violet/30 bg-fc-violet/10 px-4 py-2.5 text-sm font-semibold text-fc-fg transition-colors hover:bg-fc-violet/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fc-violet focus-visible:ring-offset-2 focus-visible:ring-offset-fc-bg"
          >
            Zum Zeitstrahl <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  )
}

export function UpcomingAueMilestones() {
  const upcoming = getUpcomingDatedEvents(new Date(), 4)
  if (upcoming.length === 0) return null

  return (
    <section aria-labelledby="upcoming-milestones-heading" className="mb-12">
      <div className="flex items-center gap-3 mb-4">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-fc-violet/12 text-fc-violet ring-1 ring-inset ring-fc-violet/20">
          <CalendarDays className="h-5 w-5" aria-hidden="true" />
        </span>
        <h2 id="upcoming-milestones-heading" className="text-2xl font-bold tracking-tight text-fc-fg">
          Nächste Gedenktage
        </h2>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {upcoming.map(({ event, next }) => (
          <Card key={`${event.year}-${event.month}-${event.day}-${event.title}`} className="border-fc-border/70 transition-[border-color,box-shadow] duration-200 hover:border-fc-violet/35 hover:shadow-md hover:shadow-fc-violet/5">
            <CardContent className="pt-5">
              <div className="flex items-center justify-between gap-2">
                <span className="rounded-full border border-fc-violet/25 bg-fc-violet/10 px-2.5 py-1 text-xs font-semibold text-fc-violet-light">
                  {String(next.getDate()).padStart(2, '0')}.{String(next.getMonth() + 1).padStart(2, '0')}.
                </span>
                <span className="text-xs font-medium text-fc-fg/55">{categoryLabel(event.category)}</span>
              </div>
              <p className="mt-3 text-lg font-bold tabular-nums text-fc-violet">{event.year}</p>
              <p className="mt-1 font-semibold leading-snug text-fc-fg">{event.title}</p>
              <p className="mt-2 text-sm leading-relaxed text-fc-fg/70 line-clamp-3">{event.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  )
}
