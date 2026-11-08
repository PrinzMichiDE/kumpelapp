import { VenueDto } from '@kumpelapp/api-contracts'
import { Card, CardContent, CardHeader, CardTitle } from '@kumpelapp/ui'
import { Badge } from '@kumpelapp/ui'
import { MapPin, Navigation, Car, Train, Calendar, CloudSun, AlertCircle, CheckCircle } from 'lucide-react'
import Link from 'next/link'
import { formatDate, formatKickoff } from '@kumpelapp/utils'
import { cn } from '@kumpelapp/utils'

const BASE_DATE = new Date('2026-08-01T00:00:00Z')

function VenueCard({ venue, match }: { venue: VenueDto; match?: { kickoff: string; homeTeam: string; awayTeam: string } }) {
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
                    {formatKickoff(match.kickoff)}
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
                {venue.travelMinutesCar
                  ? `${venue.travelMinutesCar} min`
                  : venue.distanceKm
                    ? `~${venue.distanceKm} km`
                    : 'Unbekannt'}
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
            {venue.parkingInfo ? (
              <div className="flex items-start gap-2.5 rounded-lg border border-fc-border/70 bg-fc-surface/50 p-3">
                <Car className="mt-0.5 h-4 w-4 shrink-0 text-fc-fg/50" aria-hidden="true" />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-fc-fg">Parken</p>
                  <p className="text-sm leading-relaxed text-fc-fg/70">{venue.parkingInfo}</p>
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
            {venue.travelTrain ? (
              <div className="flex items-start gap-2.5 rounded-lg border border-fc-border/70 bg-fc-surface/50 p-3">
                <Train className="mt-0.5 h-4 w-4 shrink-0 text-fc-fg/50" aria-hidden="true" />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-fc-fg">Anfahrt ÖPNV</p>
                  <p className="text-sm leading-relaxed text-fc-fg/70">{venue.travelTrain}</p>
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

export default function AuswaertsPage() {
  return (
    <div className="min-h-screen bg-fc-bg">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-fc-fg">Auswärts-Guide</h1>
          <p className="mt-2 text-fc-fg/70">Alle Stadien der Regionalliga Nordost – Anfahrt, Gästeblock, Parken & mehr</p>
        </div>

        <div className="mb-6 flex flex-wrap gap-2" role="group" aria-label="Auswärtsfahrten filtern">
          <button
            type="button"
            aria-pressed="true"
            className="inline-flex items-center rounded-lg bg-fc-violet px-4 py-2 text-sm font-medium text-white shadow-sm transition-[background-color,box-shadow,transform] duration-200 hover:bg-fc-violet-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fc-violet focus-visible:ring-offset-2 focus-visible:ring-offset-fc-bg active:scale-[0.98]"
          >
            Alle
          </button>
          {['Kommende', 'Vergangene'].map((label) => (
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

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3 sm:gap-6" id="venues-list">
          {[
            { name: 'Preussenstadion', city: 'Stahnsdorf', team: 'RSV Eintracht', slug: 'preussenstadion-stahnsdorf' },
            { name: 'Karl-Liebknecht-Stadion', city: 'Potsdam', team: 'Babelsberg 03', slug: 'karl-liebknecht-stadion' },
            { name: 'Stadion Altglienicke', city: 'Berlin', team: 'VSG Altglienicke', slug: 'stadion-altglienicke' },
            { name: 'Werner-Seelenbinder-Stadion', city: 'Berlin', team: 'Tasmania Berlin', slug: 'werner-seelenbinder-stadion' },
            { name: 'Stadion im Sportforum', city: 'Berlin', team: 'BFC Dynamo', slug: 'stadion-im-sportforum' },
            { name: 'Stadion an der Alten Försterei', city: 'Berlin', team: '1. FC Union Berlin II', slug: 'stadion-alte-foersterei' },
            { name: 'Alfred-Kunze-Sportpark', city: 'Leipzig', team: '1. FC Lok Leipzig', slug: 'alfred-kunze-sportpark' },
            { name: 'Stadion der Freundschaft', city: 'Cottbus', team: 'Energie Cottbus', slug: 'stadion-der-freundschaft' },
            { name: 'Volksparkstadion Greifswald', city: 'Greifswald', team: 'Greifswalder FC', slug: 'volksparkstadion-greifswald' },
            { name: 'Heinz-Steyer-Stadion', city: 'Dresden', team: 'Dynamo Dresden II', slug: 'heinz-steyer-stadion' },
            { name: 'Ernst-Grube-Stadion', city: 'Magdeburg', team: '1. FC Magdeburg II', slug: 'ernst-grube-stadion' },
            { name: 'Stadion am Luftschiffhafen', city: 'Potsdam', team: 'FSV 63 Luckenwalde', slug: 'stadion-am-luftschiffhafen' },
          ].map((venue, i) => (
            <VenueCard
              key={venue.slug}
              venue={{
                id: venue.slug,
                slug: venue.slug,
                name: venue.name,
                address: `${venue.city}`,
                city: venue.city,
                lat: 52.0,
                lng: 13.0,
                capacity: 5000,
                distanceKm: 150 + i * 20,
                travelMinutesCar: 120 + i * 15,
                awayBlockInfo: 'Block G (Gäste)',
                travelCar: 'A4, A9, A72',
                travelTrain: 'RE/ICE bis Hauptbahnhof, dann Tram/Bus',
                parkingInfo: 'Gäste-Parkplatz P3 (500m)',
                reviewStatus: 'AUTO',
                source: 'wikidata',
                sourceUrl: 'https://www.wikidata.org',
                attribution: '© OpenStreetMap-Mitwirkende (ODbL 1.0)',
                imageUrl: null,
                website: null,
                fieldSources: null,
                coverage: null,
                fetchedAt: null,
              }}
              match={{
                kickoff: new Date(BASE_DATE.getTime() + (i + 1) * 7 * 86400000).toISOString(),
                homeTeam: venue.team,
                awayTeam: 'FC Erzgebirge Aue',
              }}
            />
          ))}
        </div>

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