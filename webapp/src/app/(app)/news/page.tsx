import { NewsItemDto } from '@kumpelapp/api-contracts'
import { Card, CardContent, CardHeader, CardTitle } from '@kumpelapp/ui'
import { Badge } from '@kumpelapp/ui'
import { ExternalLink, Calendar, Tag } from 'lucide-react'
import Link from 'next/link'
import { formatDate, formatDateTime } from '@kumpelapp/utils'
import { cn } from '@kumpelapp/utils'

const sourceLabels: Record<string, { label: string; color: string }> = {
  FC_AUE: { label: 'FC Erzgebirge Aue', color: 'bg-fc-violet/10 text-fc-violet' },
  MDR: { label: 'MDR', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' },
  FREIE_PRESSE: { label: 'Freie Presse', color: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300' },
  KICKER: { label: 'Kicker', color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300' },
}

function NewsCard({ news }: { news: NewsItemDto }) {
  const source = sourceLabels[news.source] || { label: news.source, color: 'bg-fc-border text-fc-fg/60' }

  return (
    <Link href={news.externalUrl} target="_blank" rel="noopener noreferrer" className="block">
      <Card className="flex flex-col sm:flex-row gap-4 p-4 transition-all hover:shadow-lg hover:border-fc-violet/50 group">
        {news.imageUrl && (
          <div className="relative w-full sm:w-64 h-40 sm:h-auto min-h-[160px] flex-shrink-0 rounded-lg overflow-hidden">
            <img
              src={news.imageUrl}
              alt=""
              className="w-full h-full object-cover transition-transform group-hover:scale-105"
              loading="lazy"
            />
          </div>
        )}
        <div className="flex-1 flex flex-col justify-between min-w-0">
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-2">
              <Badge variant="outline" className={source.color}>
                {source.label}
              </Badge>
              {news.category && (
                <Badge variant="outline" className="bg-fc-border text-fc-fg/60">
                  <Tag className="h-3 w-3 mr-1" aria-hidden="true" />
                  {news.category}
                </Badge>
              )}
            </div>
            <h3 className="font-semibold text-fc-fg line-clamp-2 group-hover:text-fc-violet transition-colors mb-2">
              {news.title}
            </h3>
            {news.excerpt && (
              <p className="text-sm text-fc-fg/60 line-clamp-3 mb-3">{news.excerpt}</p>
            )}
          </div>
          <div className="flex items-center justify-between mt-4 pt-3 border-t border-fc-border">
            <span className="text-xs text-fc-fg/50 flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" aria-hidden="true" />
              {formatDateTime(news.publishedAt)}
            </span>
            <span className="flex items-center gap-1 text-sm text-fc-violet hover:text-fc-violet-light transition-colors">
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

        <div className="flex flex-wrap gap-2 mb-6" role="group" aria-label="Nachrichten filtern nach Quelle">
          <button className="px-4 py-2 rounded-lg bg-fc-violet text-white text-sm font-medium">Alle</button>
          <button className="px-4 py-2 rounded-lg border border-fc-border bg-fc-surface text-fc-fg text-sm font-medium hover:bg-fc-violet/10">FC Erzgebirge Aue</button>
          <button className="px-4 py-2 rounded-lg border border-fc-border bg-fc-surface text-fc-fg text-sm font-medium hover:bg-fc-violet/10">MDR</button>
          <button className="px-4 py-2 rounded-lg border border-fc-border bg-fc-surface text-fc-fg text-sm font-medium hover:bg-fc-violet/10">Freie Presse</button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" id="news-list">
          {Array.from({ length: 9 }, (_, i) => (
            <NewsCard
              key={i}
              news={{
                id: `${i}`,
                externalUrl: 'https://www.fc-erzgebirge.de',
                title: `Wichtige News ${i + 1}: Aue bereitet sich auf nächstes Spiel vor`,
                excerpt: 'Das Team trainiert intensiv für die kommende Partie. Der Trainer äußert sich zur Personalsituation und zur taktischen Ausrichtung.',
                imageUrl: null,
                publishedAt: new Date(Date.now() - i * 86400000).toISOString(),
                source: i % 3 === 0 ? 'FC_AUE' : i % 3 === 1 ? 'MDR' : 'FREIE_PRESSE',
                category: 'Aktuelles',
              }}
            />
          ))}
        </div>

        <div className="mt-8 text-center">
          <button className="px-8 py-3 rounded-lg border border-fc-border bg-fc-surface text-fc-fg font-medium hover:bg-fc-violet/10 transition-colors">
            Mehr laden
          </button>
        </div>
      </div>
    </div>
  )
}