'use client'

import { useMemo, useState } from 'react'
import type { VenueDto } from '@kumpelapp/api-contracts'
import { Card, CardContent, CardHeader, CardTitle, Input } from '@kumpelapp/ui'
import { cn, formatDate, formatKickoff } from '@kumpelapp/utils'
import { AlertCircle, Calendar, Car, CheckCircle2, MapPin, Navigation, Search, SearchX, Train, X } from 'lucide-react'
import Link from 'next/link'

type AwayMatchRef = { kickoff: string; homeTeam: string; awayTeam: string }

function VenueCard({ venue, match }: { venue: VenueDto; match?: AwayMatchRef }) {
  const status =
    venue.reviewStatus === 'CHECKED'
      ? { label: 'Geprüft', className: 'bg-fc-win/12 text-fc-win ring-1 ring-inset ring-fc-win/20' }
      : venue.reviewStatus === 'AUTO'
        ? { label: 'Automatisch', className: 'bg-fc-violet/12 text-fc-violet-light ring-1 ring-inset ring-fc-violet/20' }
        : { label: 'Entwurf', className: 'bg-fc-draw/12 text-fc-draw ring-1 ring-inset ring-fc-draw/20' }

  return (
    <Link
      href={`/auswaerts/${venue.slug}`}
      className="group block rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fc-violet focus-visible:ring-offset-2 focus-visible:ring-offset-fc-bg"
      aria-label={`Auswärts-Guide: ${venue.name}${match ? `, Spiel am ${formatDate(match.kickoff)}` : ''}`}
    >
      <Card className="h-full transition-[transform,border-color,box-shadow] duration-200 group-hover:-translate-y-0.5 group-hover:border-fc-violet/45 group-hover:shadow-lg group-hover:shadow-fc-violet/5 group-focus-visible:-translate-y-0.5 group-focus-visible:border-fc-violet/45 group-focus-visible:shadow-lg">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <CardTitle className="text-xl leading-tight">{venue.name}</CardTitle>
              <div className="mt-1.5 flex items-center gap-2 text-sm text-fc-fg/65">
                <MapPin className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span className="truncate">{venue.address || venue.city}</span>
              </div>
              {match ? (
                <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-fc-fg/70">
                  <span className="inline-flex items-center gap-1.5">
                    <Calendar className="h-4 w-4" aria-hidden="true" />
                    <time dateTime={match.kickoff}>{formatDate(match.kickoff)}</time>
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Navigation className="h-4 w-4" aria-hidden="true" />
                    {formatKickoff(match.kickoff)} Uhr · {match.homeTeam}
                  </span>
                </div>
              ) : null}
            </div>
            {venue.imageUrl ? (
              <div className="h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-fc-border/20 ring-1 ring-fc-border/60 sm:h-24 sm:w-24">
                <img
                  src={venue.imageUrl}
                  alt=""
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                  loading="lazy"
                  decoding="async"
                />
              </div>
            ) : null}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2 rounded-lg bg-fc-bg/35 px-3 py-2 text-sm">
              <Car className="h-4 w-4 shrink-0 text-fc-fg/50" aria-hidden="true" />
              <span className="text-fc-fg/75">
                {venue.travelMinutesCar ? `${venue.travelMinutesCar} min` : venue.distanceKm ? `~${venue.distanceKm} km` : 'Unbekannt'}
              </span>
            </div>
            <div className="flex items-center gap-2 rounded-lg bg-fc-bg/35 px-3 py-2 text-sm">
              <Train className="h-4 w-4 shrink-0 text-fc-fg/50" aria-hidden="true" />
              <span className="truncate text-fc-fg/75" title={venue.travelTrain || undefined}>
                {venue.travelTrain || 'ÖPNV prüfen'}
              </span>
            </div>
          </div>

          <div className="space-y-2.5">
            {venue.awayBlockInfo ? (
              <div className="flex items-start gap-2.5 rounded-lg border border-fc-violet/20 bg-fc-violet/6 p-3">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-fc-violet-light" aria-hidden="true" />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-fc-violet-light">Gästeblock</p>
                  <p className="text-sm leading-relaxed text-fc-fg/70">{venue.awayBlockInfo}</p>
                </div>
              </div>
            ) : null}
            {venue.travelCar ? (
              <div className="flex items-start gap-2.5 rounded-lg border border-fc-border/70 bg-fc-surface/50 p-3">
                <Navigation className="mt-0.5 h-4 w-4 shrink-0 text-fc-fg/50" aria-hidden="true" />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-fc-fg">Anfahrt Auto</p>
                  <p className="text-sm leading-relaxed text-fc-fg/70">{venue.travelCar}</p>
                </div>
              </div>
            ) : null}
            {venue.parkingInfo ? (
              <div className="flex items-start gap-2.5 rounded-lg border border-fc-border/70 bg-fc-surface/50 p-3">
                <Car className="mt-0.5 h-4 w-4 shrink-0 text-fc-fg/50" aria-hidden="true" />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-fc-fg">Parken</p>
                  <p className="text-sm leading-relaxed text-fc-fg/70">{venue.parkingInfo}</p>
                </div>
              </div>
            ) : null}
          </div>

          <div className="flex items-center justify-between gap-3 border-t border-fc-border/70 pt-3">
            <span className={cn('inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium', status.className)}>
              {status.label}
            </span>
            <span className="inline-flex items-center gap-1 text-sm font-medium text-fc-violet transition-colors group-hover:text-fc-violet-light group-focus-visible:text-fc-violet-light">
              Details
              <Navigation className="h-4 w-4" aria-hidden="true" />
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

export function AuswaertsExplorer({ items }: { items: { venue: VenueDto; match?: AwayMatchRef }[] }) {
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState<'all' | 'CHECKED' | 'AUTO' | 'DRAFT'>('all')
  const [onlyWithAwayBlock, setOnlyWithAwayBlock] = useState(false)
  const [sort, setSort] = useState<'match' | 'distance' | 'name'>('match')

  const normalized = query.trim().toLowerCase()

  const filtered = useMemo(() => {
    const base = items.filter((item) => {
      if (status !== 'all' && item.venue.reviewStatus !== status) return false
      if (onlyWithAwayBlock && !item.venue.awayBlockInfo) return false
      if (!normalized) return true
      const haystack = [
        item.venue.name,
        item.venue.city,
        item.venue.address ?? '',
        item.match?.homeTeam ?? '',
      ]
        .join(' ')
        .toLowerCase()
      return haystack.includes(normalized)
    })

    const sorted = [...base].sort((a, b) => {
      if (sort === 'name') return a.venue.name.localeCompare(b.venue.name, 'de')
      if (sort === 'distance') {
        const da = a.venue.distanceKm ?? Number.POSITIVE_INFINITY
        const db = b.venue.distanceKm ?? Number.POSITIVE_INFINITY
        if (da !== db) return da - db
        return a.venue.name.localeCompare(b.venue.name, 'de')
      }
      const ma = a.match ? new Date(a.match.kickoff).getTime() : Number.POSITIVE_INFINITY
      const mb = b.match ? new Date(b.match.kickoff).getTime() : Number.POSITIVE_INFINITY
      if (ma !== mb) return ma - mb
      return a.venue.name.localeCompare(b.venue.name, 'de')
    })
    return sorted
  }, [items, normalized, status, onlyWithAwayBlock, sort])

  const hasFilters = normalized.length > 0 || status !== 'all' || onlyWithAwayBlock || sort !== 'match'
  const checkedCount = items.filter((i) => i.venue.reviewStatus === 'CHECKED').length

  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-fc-border/70 bg-fc-surface/50 p-4 sm:p-5">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_auto] lg:items-end">
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-fc-fg/80">Stadion oder Ort suchen</span>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-fc-fg/45" aria-hidden="true" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Name, Stadt, Adresse oder Gegner"
                className="pl-9 pr-9"
                aria-label="Auswärts-Guide durchsuchen"
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
              onClick={() => setOnlyWithAwayBlock((v) => !v)}
              className={cn(
                'inline-flex h-11 items-center gap-2 rounded-lg border px-4 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fc-violet',
                onlyWithAwayBlock
                  ? 'border-fc-violet/35 bg-fc-violet/15 text-fc-fg'
                  : 'border-fc-border bg-fc-bg/40 text-fc-fg/80 hover:border-fc-violet/35 hover:bg-fc-violet/10',
              )}
              aria-pressed={onlyWithAwayBlock}
            >
              <AlertCircle className="h-4 w-4" aria-hidden="true" />
              Mit Gästeblock-Info
            </button>

            <label className="flex flex-col gap-1 text-sm text-fc-fg/70">
              <span className="sr-only">Sortierung</span>
              <select
                value={sort}
                onChange={(e) => setSort((e.target.value as 'match' | 'distance' | 'name') || 'match')}
                className="h-11 rounded-lg border border-fc-border bg-fc-bg/40 px-3 text-sm text-fc-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fc-violet"
                aria-label="Sortierung"
              >
                <option value="match">Nach Spieltermin</option>
                <option value="distance">Nach Entfernung</option>
                <option value="name">Nach Name</option>
              </select>
            </label>

            {hasFilters ? (
              <button
                type="button"
                onClick={() => {
                  setQuery('')
                  setStatus('all')
                  setOnlyWithAwayBlock(false)
                  setSort('match')
                }}
                className="inline-flex h-11 items-center rounded-lg px-3 text-sm font-medium text-fc-fg/70 hover:bg-fc-violet/10 hover:text-fc-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fc-violet"
              >
                Zurücksetzen
              </button>
            ) : null}
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label="Status filtern">
          {(
            [
              { value: 'all', label: 'Alle Status' },
              { value: 'CHECKED', label: 'Geprüft' },
              { value: 'AUTO', label: 'Automatisch' },
              { value: 'DRAFT', label: 'Entwurf' },
            ] as const
          ).map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setStatus(opt.value)}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fc-violet',
                status === opt.value ? 'bg-fc-violet text-white' : 'border border-fc-border bg-fc-bg/40 text-fc-fg/80 hover:bg-fc-violet/10',
              )}
              aria-pressed={status === opt.value}
            >
              {opt.value === 'CHECKED' ? <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" /> : null}
              {opt.label}
            </button>
          ))}
        </div>

        <p className="mt-3 text-sm text-fc-fg/60" aria-live="polite">
          {filtered.length} von {items.length} {items.length === 1 ? 'Stadion' : 'Stadien'} angezeigt
          {checkedCount > 0 ? ` · ${checkedCount} geprüft` : ''}
        </p>
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-fc-border/70 bg-fc-surface/40 py-16 text-center text-fc-fg/70">
          <SearchX className="h-10 w-10 text-fc-fg/40" aria-hidden="true" />
          <p className="text-base font-medium text-fc-fg">Keine passenden Stadien gefunden</p>
          <p className="max-w-md text-sm text-fc-fg/60">Passe Suche, Status oder Sortierung an, um Ergebnisse zu sehen.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:gap-6 md:grid-cols-2 lg:grid-cols-3" id="venues-list">
          {filtered.map((item) => (
            <VenueCard key={item.venue.id} venue={item.venue} match={item.match} />
          ))}
        </div>
      )}
    </div>
  )
}
