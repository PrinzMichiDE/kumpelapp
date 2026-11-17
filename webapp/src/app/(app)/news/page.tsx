import type { NewsItemDto } from '@kumpelapp/api-contracts'
import { prisma } from '@kumpelapp/db'
import { cn } from '@kumpelapp/utils'
import { AlertCircle, SearchX } from 'lucide-react'
import Link from 'next/link'
import { NewsExplorer } from './news-explorer'
import { DataMeta } from '@/components/data-meta'
import { staleLabel } from '@/lib/data-freshness'

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

export default async function NewsPage({
  searchParams,
}: {
  searchParams: Promise<{ source?: string }>
}) {
  const { source } = await searchParams

  let items: NewsItemDto[] = []
  let availableSources: string[] = []
  let error: string | null = null

  let latestPublishedAt: string | null = null
  try {
    const [rows, sources] = await Promise.all([
      prisma.newsItem.findMany({
        where: source ? { source } : undefined,
        orderBy: { publishedAt: 'desc' },
        take: 80,
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
    latestPublishedAt = items[0]?.publishedAt ?? null
  } catch (e) {
    error = 'News konnten nicht geladen werden. Bitte versuche es später erneut.'
    console.error('News load error', e)
  }

  const filterSources = Array.from(new Set([...Object.keys(sourceLabels), ...availableSources]))

  return (
    <div className="min-h-screen bg-fc-bg">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-fc-fg md:text-4xl">News</h1>
          <p className="mt-2 text-fc-fg/70">Aktuelle Nachrichten rund um den FC Erzgebirge Aue – durchsuchen, filtern und direkt lesen.</p>
        </div>
        <div className="mb-8">
          <DataMeta
            source={source ? `Kuratiert/aggregiert: ${sourceMeta(source).label}` : 'Kuratierte Quellen (Teaser + Deep-Link)'}
            updatedAt={latestPublishedAt}
            stale={!!staleLabel(latestPublishedAt, 'news')}
            staleLabel={staleLabel(latestPublishedAt, 'news') || 'Datenstand evtl. veraltet'}
            capabilityLabel="News als Teaser/Link, keine Volltextübernahme"
            capabilityTone="info"
            note="Inhalte stammen aus externen Quellen. Rechte/Lizenzen liegen bei den jeweiligen Anbietern; für Details Originalquelle öffnen."
          />
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
            aria-current={!source ? 'true' : undefined}
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
                aria-current={active ? 'true' : undefined}
              >
                {meta.label}
              </Link>
            )
          })}
          <span className="ml-auto text-sm text-fc-fg/60">
            {items.length} {items.length === 1 ? 'Meldung' : 'Meldungen'} geladen
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
                ? `Für die Quelle „${sourceMeta(source).label}“ sind aktuell keine Meldungen hinterlegt. Wähle einen anderen Filter.`
                : 'Es sind noch keine Nachrichten in der Datenbank vorhanden. Synchronisiere News im Admin-Bereich, um aktuelle Meldungen anzuzeigen.'}
            </p>
          </div>
        ) : (
          <NewsExplorer items={items} activeSource={source} />
        )}
      </div>
    </div>
  )
}