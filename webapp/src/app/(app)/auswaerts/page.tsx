import type { VenueDto } from '@kumpelapp/api-contracts'
import { prisma } from '@kumpelapp/db'
import { cn } from '@kumpelapp/utils'
import { AlertCircle, SearchX } from 'lucide-react'
import Link from 'next/link'
import { AuswaertsExplorer } from './auswaerts-explorer'
import { DataMeta } from '@/components/data-meta'

export const dynamic = 'force-dynamic'

type AwayMatchRef = { kickoff: string; homeTeam: string; awayTeam: string }

function toVenueDto(v: {
  id: string
  slug: string
  name: string
  address: string | null
  city: string
  lat: number | null
  lng: number | null
  capacity: number | null
  distanceKm: number | null
  travelMinutesCar: number | null
  awayBlockInfo: string | null
  travelCar: string | null
  travelTrain: string | null
  parkingInfo: string | null
  website: string | null
  imageUrl: string | null
  reviewStatus: VenueDto['reviewStatus']
  source: string | null
  sourceUrl: string | null
  attribution: string | null
  fieldSources: unknown
  coverage: unknown
  fetchedAt: Date | null
}): VenueDto {
  return {
    id: v.id,
    slug: v.slug,
    name: v.name,
    address: v.address,
    city: v.city,
    lat: v.lat,
    lng: v.lng,
    capacity: v.capacity,
    distanceKm: v.distanceKm,
    travelMinutesCar: v.travelMinutesCar,
    awayBlockInfo: v.awayBlockInfo,
    travelCar: v.travelCar,
    travelTrain: v.travelTrain,
    parkingInfo: v.parkingInfo,
    website: v.website,
    imageUrl: v.imageUrl,
    reviewStatus: v.reviewStatus,
    source: v.source,
    sourceUrl: v.sourceUrl,
    attribution: v.attribution,
    fieldSources: (v.fieldSources as Record<string, string> | null) ?? null,
    coverage: (v.coverage as Record<string, string> | null) ?? null,
    fetchedAt: v.fetchedAt ? v.fetchedAt.toISOString() : null,
  }
}

export default async function AuswaertsPage({
  searchParams,
}: {
  searchParams: Promise<{ timeframe?: string }>
}) {
  const { timeframe = 'all' } = await searchParams
  const now = new Date()

  let items: { venue: VenueDto; match?: AwayMatchRef }[] = []
  let error: string | null = null

  try {
    const matchWhere =
      timeframe === 'upcoming'
        ? { kickoff: { gte: now } }
        : timeframe === 'past'
          ? { kickoff: { lt: now } }
          : {}

    const awayMatches = await prisma.match.findMany({
      where: {
        awayTeam: { isOwn: true },
        venueId: { not: null },
        ...matchWhere,
      },
      include: {
        venue: true,
        homeTeam: { select: { name: true, shortName: true } },
        awayTeam: { select: { name: true, shortName: true } },
      },
      orderBy: { kickoff: timeframe === 'past' ? 'desc' : 'asc' },
      take: 200,
    })

    const byVenue = new Map<string, { venue: VenueDto; match?: AwayMatchRef }>()
    for (const m of awayMatches) {
      if (!m.venue) continue
      if (byVenue.has(m.venue.id)) continue
      byVenue.set(m.venue.id, {
        venue: toVenueDto(m.venue),
        match: {
          kickoff: m.kickoff.toISOString(),
          homeTeam: m.homeTeam.shortName || m.homeTeam.name,
          awayTeam: m.awayTeam.shortName || m.awayTeam.name,
        },
      })
    }

    items = Array.from(byVenue.values())

    if (items.length === 0 && timeframe === 'all') {
      const venues = await prisma.venue.findMany({
        orderBy: [{ city: 'asc' }, { name: 'asc' }],
        take: 60,
      })
      items = venues.map((v) => ({ venue: toVenueDto(v) }))
    }
  } catch (e) {
    error = 'Auswärts-Guide konnte nicht geladen werden. Bitte versuche es später erneut.'
    console.error('Auswaerts load error', e)
  }

  const filters = [
    { value: 'all', label: 'Alle' },
    { value: 'upcoming', label: 'Kommende' },
    { value: 'past', label: 'Vergangene' },
  ] as const

  return (
    <div className="min-h-screen bg-fc-bg">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-fc-fg md:text-4xl">Auswärts-Guide</h1>
            <p className="mt-2 text-fc-fg/70">Stadien, Anfahrt, Gästeblock und Parken – mit Bezug zu Aue-Auswärtsspielen</p>
          </div>
          <Link
            href="/sammler"
            className="inline-flex items-center justify-center rounded-xl border border-fc-violet/30 bg-fc-violet/10 px-4 py-2.5 text-sm font-semibold text-fc-fg transition-colors hover:bg-fc-violet/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fc-violet focus-visible:ring-offset-2 focus-visible:ring-offset-fc-bg"
          >
            Stadion-Sammler öffnen
          </Link>
        </div>
        <div className="mb-8">
          <DataMeta
            source="Seed-/Venue-Datenbank + redaktionelle Pflege"
            reviewStatus={items.some((i) => i.venue.reviewStatus === 'CHECKED') ? 'DRAFT' : 'AUTO'}
            capabilityLabel="Auswärtsinfos mit Prüfstatus je Stadion"
            capabilityTone="info"
            note="Kritische Hinweise (Gästeblock, Einlass, Parken, ÖPNV, Barriere) bitte vor Reise mit offiziellen Quellen abgleichen. Prüfstatus und Stand siehe Stadiondetail."
          />
        </div>

        <div className="mb-6 flex flex-wrap items-center gap-2" role="group" aria-label="Auswärtsfahrten filtern">
          {filters.map((f) => {
            const active = timeframe === f.value
            const href = f.value === 'all' ? '/auswaerts' : `/auswaerts?timeframe=${f.value}`
            return (
              <Link
                key={f.value}
                href={href}
                className={cn(
                  'inline-flex items-center rounded-lg px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fc-violet focus-visible:ring-offset-2 focus-visible:ring-offset-fc-bg',
                  active
                    ? 'bg-fc-violet text-white shadow-sm'
                    : 'border border-fc-border bg-fc-surface text-fc-fg hover:border-fc-violet/35 hover:bg-fc-violet/10'
                )}
                aria-current={active ? 'page' : undefined}
              >
                {f.label}
              </Link>
            )
          })}
          <span className="ml-auto text-sm text-fc-fg/60">
            {items.length} {items.length === 1 ? 'Stadion' : 'Stadien'}
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
            <p className="text-base font-medium text-fc-fg">Keine Auswärtsdaten gefunden</p>
            <p className="max-w-md text-sm text-fc-fg/60">
              Für den gewählten Filter sind keine Auswärtsspiele oder Stadien hinterlegt. Synchronisiere Spielplan und Venue-Daten im Admin-Bereich oder wähle einen anderen Filter.
            </p>
          </div>
        ) : (
          <AuswaertsExplorer items={items} />
        )}

        <aside className="mt-8 rounded-xl border border-fc-border/80 bg-fc-surface/60 p-5 sm:p-6" aria-label="Legende und Quellen">
          <h3 className="mb-3 text-base font-semibold text-fc-fg">Legende &amp; Hinweise</h3>
          <div className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2 md:grid-cols-4">
            <div className="flex items-center">
              <span className="inline-flex items-center rounded-full bg-fc-win/12 px-2.5 py-1 text-xs font-medium text-fc-win ring-1 ring-inset ring-fc-win/20">
                Geprüft
              </span>
            </div>
            <div className="flex items-center">
              <span className="inline-flex items-center rounded-full bg-fc-violet/12 px-2.5 py-1 text-xs font-medium text-fc-violet-light ring-1 ring-inset ring-fc-violet/20">
                Automatisch
              </span>
            </div>
            <div className="flex items-center">
              <span className="inline-flex items-center rounded-full bg-fc-draw/12 px-2.5 py-1 text-xs font-medium text-fc-draw ring-1 ring-inset ring-fc-draw/20">
                Entwurf
              </span>
            </div>
            <div className="flex items-center">
              <a
                href="/quellen"
                className="rounded-sm font-medium text-fc-violet transition-colors hover:text-fc-violet-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fc-violet focus-visible:ring-offset-2 focus-visible:ring-offset-fc-surface"
              >
                Quellen &amp; Lizenzen
              </a>
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}