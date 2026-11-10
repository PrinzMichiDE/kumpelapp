import type { NewsItemDto } from '@kumpelapp/api-contracts'
import { prisma } from '@kumpelapp/db'
import { Badge, Card } from '@kumpelapp/ui'
import { formatDateTime } from '@kumpelapp/utils'
import { cn } from '@kumpelapp/utils'
import { AlertCircle, Calendar, ExternalLink, Newspaper, SearchX, Tag } from 'lucide-react'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

const sourceLabels: Record<string, { label: string; color: string }> = {
  FC_AUE: { label: 'FC Erzgebirge Aue', color: 'bg-fc-violet/10 text-fc-violet' },
  MDR: { label: 'MDR', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' },
  FREIE_PRESSE: { label: 'Freie Presse', color: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300' },
  KICKER: { label: 'Kicker', color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300' },
}

function sourceMeta(source: string) {
  return sourceLabels[source] ?? { label: source.replace(/_/g, ' '), color: 'bg-fc-border/60 text-fc-fg/80' }
}

function NewsCard({ news }: { news: NewsItemDto }) {
  const source = sourceMeta(news.source)

  return (
    <a
      href={news.externalUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="group block rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fc-violet focus-visible:ring-offset-2 focus-visible:ring-offset-fc-bg"
      aria-label={`${news.title} – Quelle: ${source.label} (öffnet in neuem Tab)`}
    >
      <Card className="flex h-full flex-col gap-4 p-4 transition-[transform,border-color,box-shadow] duration-200 group-hover:-translate-y-0.5 group-hover:border-fc-violet/45 group-hover:shadow-lg group-hover:shadow-fc-violet/5 group-focus-visible:-translate-y-0.5 group-focus-visible:border-fc-violet/45 group-focus-visible:shadow-lg sm:flex-row">
        {news.imageUrl ? (
          <div className="relative h-40 w-full shrink-0 overflow-hidden rounded-lg bg-fc-border/20 sm:h-auto sm:min-h-[160px] sm:w-56">
            <img
              src={news.imageUrl}
              alt=""
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
              loading="lazy"
              decoding="async"
            />
          </div>
        ) : (
          <div className="hidden h-40 w-56 shrink-0 items-center justify-center rounded-lg bg-fc-violet/10 text-fc-violet sm:flex">
            <Newspaper className="h-10 w-10" aria-hidden="true" />
          </div>
        )}
        <div className="flex min-w-0 flex-1 flex-col justify-between">
          <div>
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <Badge variant="outline" className={cn('border-transparent', source.color)}>
                {source.label}
              </Badge>
              {news.category ? (
                <Badge variant="outline" className="border-fc-border/70 bg-fc-bg/30 text-fc-fg/70">
                  <Tag className="mr-1 h-3 w-3" aria-hidden="true" />
                  {news.category}
                </Badge>
              ) : null}
            </div>
            <h3 className="mb-2 line-clamp-2 font-semibold leading-snug text-fc-fg transition-colors duration-200 group-hover:text-fc-violet-light group-focus-visible:text-fc-violet-light">
              {news.title}
            </h3>
            {news.excerpt ? <p className="mb-3 line-clamp-3 text-sm leading-relaxed text-fc-fg/65">{news.excerpt}</p> : null}
          </div>
          <div className="mt-3 flex items-center justify-between gap-3 border-t border-fc-border/70 pt-3">
            <span className="flex items-center gap-1.5 text-xs text-fc-fg/55">
              <Calendar className="h-3.5 w-3.5" aria-hidden="true" />
              <time dateTime={news.publishedAt}>{formatDateTime(news.publishedAt)}</time>
            </span>
            <span className="inline-flex items-center gap-1 text-sm font-medium text-fc-violet transition-colors group-hover:text-fc-violet-light">
              Artikel lesen
              <ExternalLink className="h-4 w-4" aria-hidden="true" />
            </span>
          </div>
        </div>
      </Card>
    </a>
  )
}

export default async function NewsPage({
  searchParams,
}: {
  searchParams: Promise<{ source?: string }>
}) {
  const { source } = await searchParams

  let items: NewsItemDto[] = []
  let availableSources: string[] = []
  let error: string | null = null

  try {
    const [rows, sources] = await Promise.all([
      prisma.newsItem.findMany({
        where: source ? { source } : undefined,
        orderBy: { publishedAt: 'desc' },
        take: 60,
      }),
      prisma.newsItem.findMany({
        distinct: ['source'],
        select: { source: true },
        orderBy: { source: 'asc' },
      }),
    ])

    items = rows.map((r) => ({
      id: r.id,
      externalUrl: r.externalUrl,
      title: r.title,
      excerpt: r.excerpt,
      imageUrl: r.imageUrl,
      publishedAt: r.publishedAt.toISOString(),
      source: r.source,
      category: r.category,
    }))
    availableSources = sources.map((s) => s.source)
  } catch (e) {
    error = 'News konnten nicht geladen werden. Bitte versuche es später erneut.'
    console.error('News load error', e)
  }

  const filterSources = Array.from(new Set([...Object.keys(sourceLabels), ...availableSources]))

  return (
    <div className="min-h-screen bg-fc-bg">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-fc-fg md:text-4xl">News</h1>
          <p className="mt-2 text-fc-fg/70">Aktuelle Nachrichten rund um den FC Erzgebirge Aue</p>
        </div>

        <div className="mb-6 flex flex-wrap items-center gap-2" role="group" aria-label="Nachrichten filtern nach Quelle">
          <Link
            href="/news"
            className={cn(
              'inline-flex items-center rounded-lg px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fc-violet focus-visible:ring-offset-2 focus-visible:ring-offset-fc-bg',
              !source
                ? 'bg-fc-violet text-white shadow-sm'
                : 'border border-fc-border bg-fc-surface text-fc-fg hover:border-fc-violet/35 hover:bg-fc-violet/10'
            )}
            aria-current={!source ? 'page' : undefined}
          >
            Alle
          </Link>
          {filterSources.map((s) => {
            const meta = sourceMeta(s)
            const active = source === s
            return (
              <Link
                key={s}
                href={`/news?source=${encodeURIComponent(s)}`}
                className={cn(
                  'inline-flex items-center rounded-lg px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fc-violet focus-visible:ring-offset-2 focus-visible:ring-offset-fc-bg',
                  active
                    ? 'bg-fc-violet text-white shadow-sm'
                    : 'border border-fc-border bg-fc-surface text-fc-fg hover:border-fc-violet/35 hover:bg-fc-violet/10'
                )}
                aria-current={active ? 'page' : undefined}
              >
                {meta.label}
              </Link>
            )
          })}
          <span className="ml-auto text-sm text-fc-fg/60">
            {items.length} {items.length === 1 ? 'Meldung' : 'Meldungen'}
          </span>
        </div>

        {error ? (
          <div className="flex items-center gap-3 rounded-xl border border-fc-loss/30 bg-fc-loss/10 p-5 text-fc-loss" role="alert">
            <AlertCircle className="h-5 w-5 shrink-0" aria-hidden="true" />
            <p className="text-sm font-medium">{error}</p>
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-fc-border/70 bg-fc-surface/40 py-16 text-center text-fc-fg/70">
            <SearchX className="h-10 w-10 text-fc-fg/40" aria-hidden="true" />
            <p className="text-base font-medium text-fc-fg">Keine News gefunden</p>
            <p className="max-w-md text-sm text-fc-fg/60">
              {source
                ? 'Für diese Quelle sind aktuell keine Meldungen hinterlegt. Wähle einen anderen Filter.'
                : 'Es sind noch keine Nachrichten in der Datenbank vorhanden. Synchronisiere News im Admin-Bereich, um aktuelle Meldungen anzuzeigen.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:gap-6 md:grid-cols-2 lg:grid-cols-3" id="news-list">
            {items.map((news) => (
              <NewsCard key={news.id} news={news} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}