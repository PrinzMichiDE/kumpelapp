import { NewsItemDto } from '@kumpelapp/api-contracts'
import { Card, CardContent, CardHeader, CardTitle } from '@kumpelapp/ui'
import { Badge } from '@kumpelapp/ui'
import { ExternalLink, Calendar, Tag } from 'lucide-react'
import Link from 'next/link'
import { formatDate, formatDateTime } from '@kumpelapp/utils'
import { cn } from '@kumpelapp/utils'

const BASE_DATE = new Date('2026-08-01T00:00:00Z')

const sourceLabels: Record<string, { label: string; color: string }> = {
  FC_AUE: { label: 'FC Erzgebirge Aue', color: 'bg-fc-violet/10 text-fc-violet' },
  MDR: { label: 'MDR', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' },
  FREIE_PRESSE: { label: 'Freie Presse', color: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300' },
  KICKER: { label: 'Kicker', color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300' },
}

function NewsCard({ news }: { news: NewsItemDto }) {
  const source = sourceLabels[news.source] || { label: news.source, color: 'bg-fc-border/60 text-fc-fg/80' }

  return (
    <Link
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
        ) : null}
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
            {news.excerpt ? (
              <p className="mb-3 line-clamp-3 text-sm leading-relaxed text-fc-fg/65">{news.excerpt}</p>
            ) : null}
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
    </Link>
  )
}

export default function NewsPage() {
  return (
    <div className="min-h-screen bg-fc-bg">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-fc-fg">News</h1>
          <p className="mt-2 text-fc-fg/70">Aktuelle Nachrichten rund um den FC Erzgebirge Aue</p>
        </div>

        <div className="mb-6 flex flex-wrap gap-2" role="group" aria-label="Nachrichten filtern nach Quelle">
          <button
            type="button"
            aria-pressed="true"
            className="inline-flex items-center rounded-lg bg-fc-violet px-4 py-2 text-sm font-medium text-white shadow-sm transition-[background-color,box-shadow,transform] duration-200 hover:bg-fc-violet-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fc-violet focus-visible:ring-offset-2 focus-visible:ring-offset-fc-bg active:scale-[0.98]"
          >
            Alle
          </button>
          {['FC Erzgebirge Aue', 'MDR', 'Freie Presse'].map((label) => (
            <button
              key={label}
              type="button"
              aria-pressed="false"
              className="inline-flex items-center rounded-lg border border-fc-border bg-fc-surface px-4 py-2 text-sm font-medium text-fc-fg transition-[background-color,border-color,box-shadow,transform] duration-200 hover:border-fc-violet/35 hover:bg-fc-violet/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fc-violet focus-visible:ring-offset-2 focus-visible:ring-offset-fc-bg active:scale-[0.98]"
            >
              {label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3 sm:gap-6" id="news-list">
          {Array.from({ length: 9 }, (_, i) => (
            <NewsCard
              key={i}
              news={{
                id: `${i}`,
                externalUrl: 'https://www.fc-erzgebirge.de',
                title: `Wichtige News ${i + 1}: Aue bereitet sich auf nächstes Spiel vor`,
                excerpt:
                  'Das Team trainiert intensiv für die kommende Partie. Der Trainer äußert sich zur Personalsituation und zur taktischen Ausrichtung.',
                imageUrl: null,
                publishedAt: new Date(BASE_DATE.getTime() - i * 86400000).toISOString(),
                source: i % 3 === 0 ? 'FC_AUE' : i % 3 === 1 ? 'MDR' : 'FREIE_PRESSE',
                category: 'Aktuelles',
              }}
            />
          ))}
        </div>

        <div className="mt-8 text-center">
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-xl border border-fc-border bg-fc-surface px-8 py-3 text-sm font-semibold text-fc-fg transition-[background-color,border-color,box-shadow,transform] duration-200 hover:border-fc-violet/35 hover:bg-fc-violet/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fc-violet focus-visible:ring-offset-2 focus-visible:ring-offset-fc-bg active:scale-[0.98]"
          >
            Mehr laden
          </button>
        </div>
      </div>
    </div>
  )
}