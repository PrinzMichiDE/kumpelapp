'use client'

import { useMemo, useState } from 'react'
import type { NewsItemDto } from '@kumpelapp/api-contracts'
import { Badge, Card, Input } from '@kumpelapp/ui'
import { cn, formatDateTime } from '@kumpelapp/utils'
import { Calendar, ExternalLink, Image as ImageIcon, Newspaper, Search, SearchX, Tag, X } from 'lucide-react'

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

export function NewsExplorer({ items, activeSource }: { items: NewsItemDto[]; activeSource?: string }) {
  const [query, setQuery] = useState('')
  const [onlyWithImage, setOnlyWithImage] = useState(false)
  const [sort, setSort] = useState<'newest' | 'oldest'>('newest')

  const normalized = query.trim().toLowerCase()

  const filtered = useMemo(() => {
    const base = items.filter((n) => {
      if (onlyWithImage && !n.imageUrl) return false
      if (!normalized) return true
      const haystack = [n.title, n.excerpt ?? '', n.category ?? '', sourceMeta(n.source).label, n.source]
        .join(' ')
        .toLowerCase()
      return haystack.includes(normalized)
    })
    const sorted = [...base].sort((a, b) => {
      const da = new Date(a.publishedAt).getTime()
      const db = new Date(b.publishedAt).getTime()
      return sort === 'newest' ? db - da : da - db
    })
    return sorted
  }, [items, normalized, onlyWithImage, sort])

  const hasFilters = normalized.length > 0 || onlyWithImage || sort !== 'newest'

  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-fc-border/70 bg-fc-surface/50 p-4 sm:p-5">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_auto] lg:items-end">
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-fc-fg/80">News durchsuchen</span>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-fc-fg/45" aria-hidden="true" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Titel, Inhalt, Kategorie oder Quelle"
                className="pl-9 pr-9"
                aria-label="News durchsuchen"
              />
              {query ? (
                <button
                  type="button"
                  onClick={() => setQuery('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-fc-fg/55 hover:bg-fc-violet/10 hover:text-fc-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fc-violet"
                  aria-label="Suche zurücksetzen"
                >
                  <X className="h-4 w-4" aria-hidden="true" />
                </button>
              ) : null}
            </div>
          </label>

          <div className="flex flex-wrap items-end gap-2">
            <button
              type="button"
              onClick={() => setOnlyWithImage((v) => !v)}
              className={cn(
                'inline-flex h-11 items-center gap-2 rounded-lg border px-4 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fc-violet',
                onlyWithImage
                  ? 'border-fc-violet/35 bg-fc-violet/15 text-fc-fg'
                  : 'border-fc-border bg-fc-bg/40 text-fc-fg/80 hover:border-fc-violet/35 hover:bg-fc-violet/10',
              )}
              aria-pressed={onlyWithImage}
            >
              <ImageIcon className="h-4 w-4" aria-hidden="true" />
              Nur mit Bild
            </button>

            <label className="flex flex-col gap-1 text-sm text-fc-fg/70">
              <span className="sr-only">Sortierung</span>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value === 'oldest' ? 'oldest' : 'newest')}
                className="h-11 rounded-lg border border-fc-border bg-fc-bg/40 px-3 text-sm text-fc-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fc-violet"
                aria-label="Sortierung"
              >
                <option value="newest">Neueste zuerst</option>
                <option value="oldest">Älteste zuerst</option>
              </select>
            </label>

            {hasFilters ? (
              <button
                type="button"
                onClick={() => {
                  setQuery('')
                  setOnlyWithImage(false)
                  setSort('newest')
                }}
                className="inline-flex h-11 items-center rounded-lg px-3 text-sm font-medium text-fc-fg/70 hover:bg-fc-violet/10 hover:text-fc-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fc-violet"
              >
                Zurücksetzen
              </button>
            ) : null}
          </div>
        </div>

        <p className="mt-3 text-sm text-fc-fg/60" aria-live="polite">
          {filtered.length} von {items.length} {items.length === 1 ? 'Meldung' : 'Meldungen'} angezeigt
          {activeSource ? ` · Quelle: ${sourceMeta(activeSource).label}` : ''}
        </p>
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-fc-border/70 bg-fc-surface/40 py-16 text-center text-fc-fg/70">
          <SearchX className="h-10 w-10 text-fc-fg/40" aria-hidden="true" />
          <p className="text-base font-medium text-fc-fg">Keine passenden News gefunden</p>
          <p className="max-w-md text-sm text-fc-fg/60">
            {hasFilters
              ? 'Passe Suche, Bild-Filter oder Sortierung an, um Ergebnisse zu sehen.'
              : 'Für die aktuelle Auswahl sind keine Meldungen hinterlegt.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:gap-6 md:grid-cols-2 lg:grid-cols-3" id="news-list">
          {filtered.map((news) => (
            <NewsCard key={news.id} news={news} />
          ))}
        </div>
      )}
    </div>
  )
}
