import { VenueDto } from '@kumpelapp/api-contracts'
import { Card, CardContent, CardHeader, CardTitle } from '@kumpelapp/ui'
import { Badge } from '@kumpelapp/ui'
import { MapPin, Navigation, Car, Train, Calendar, CloudSun, AlertCircle, CheckCircle } from 'lucide-react'
import Link from 'next/link'
import { formatDate, formatKickoff } from '@kumpelapp/utils'
import { cn } from '@kumpelapp/utils'

const BASE_DATE = new Date('2026-08-01T00:00:00Z')

function VenueCard({ venue, match }: { venue: VenueDto; match?: { kickoff: string; homeTeam: string; awayTeam: string } }) {
  const isAueAway = match?.awayTeam === 'FC Erzgebirge Aue'

  return (
    <Link href={`/auswaerts/${venue.slug}`} className="block">
      <Card className="transition-all hover:shadow-lg hover:border-fc-violet/50 group">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-4">
            <div>
              <CardTitle className="text-xl">{venue.name}</CardTitle>
              <div className="mt-1 flex items-center gap-2 text-sm text-fc-fg/60">
                <MapPin className="h-4 w-4" aria-hidden="true" />
                <span>{venue.address || venue.city}</span>
              </div>
              {match && (
                <div className="mt-2 flex items-center gap-3 text-sm text-fc-fg/70">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" /> {formatDate(match.kickoff)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Navigation className="h-4 w-4" /> {formatKickoff(match.kickoff)}
                  </span>
                </div>
              )}
            </div>
            {venue.imageUrl && (
              <div className="w-24 h-24 rounded-lg overflow-hidden flex-shrink-0">
                <img src={venue.imageUrl} alt={venue.name} className="w-full h-full object-cover" />
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="flex items-center gap-2 text-sm">
              <Car className="h-4 w-4 text-fc-fg/50" aria-hidden="true" />
              <span className="text-fc-fg/70">
                {venue.travelMinutesCar ? `${venue.travelMinutesCar} min` : venue.distanceKm ? `~${venue.distanceKm} km` : 'Unbekannt'}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Train className="h-4 w-4 text-fc-fg/50" aria-hidden="true" />
              <span className="text-fc-fg/70">{venue.travelTrain || 'ÖPNV prüfen'}</span>
            </div>
          </div>

          <div className="space-y-3">
            {venue.awayBlockInfo && (
              <div className="flex items-start gap-2 p-3 rounded-lg bg-fc-violet/5 border border-fc-violet/20">
                <AlertCircle className="h-5 w-5 text-fc-violet flex-shrink-0 mt-0.5" aria-hidden="true" />
                <div>
                  <p className="font-medium text-fc-violet">Gästeblock</p>
                  <p className="text-sm text-fc-fg/70">{venue.awayBlockInfo}</p>
                </div>
              </div>
            )}
            {venue.parkingInfo && (
              <div className="flex items-start gap-2 p-3 rounded-lg bg-fc-surface border border-fc-border">
                <Car className="h-5 w-5 text-fc-fg/50 flex-shrink-0 mt-0.5" aria-hidden="true" />
                <div>
                  <p className="font-medium text-fc-fg">Parken</p>
                  <p className="text-sm text-fc-fg/70">{venue.parkingInfo}</p>
                </div>
              </div>
            )}
            {venue.travelCar && (
              <div className="flex items-start gap-2 p-3 rounded-lg bg-fc-surface border border-fc-border">
                <Navigation className="h-5 w-5 text-fc-fg/50 flex-shrink-0 mt-0.5" aria-hidden="true" />
                <div>
                  <p className="font-medium text-fc-fg">Anfahrt Auto</p>
                  <p className="text-sm text-fc-fg/70">{venue.travelCar}</p>
                </div>
              </div>
            )}
            {venue.travelTrain && (
              <div className="flex items-start gap-2 p-3 rounded-lg bg-fc-surface border border-fc-border">
                <Train className="h-5 w-5 text-fc-fg/50 flex-shrink-0 mt-0.5" aria-hidden="true" />
                <div>
                  <p className="font-medium text-fc-fg">Anfahrt ÖPNV</p>
                  <p className="text-sm text-fc-fg/70">{venue.travelTrain}</p>
                </div>
              </div>
            )}
          </div>

          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className={cn(
                'px-2 py-1 rounded-full text-xs font-medium',
                venue.reviewStatus === 'CHECKED' && 'bg-fc-win/10 text-fc-win',
                venue.reviewStatus === 'AUTO' && 'bg-fc-violet/10 text-fc-violet',
                venue.reviewStatus === 'DRAFT' && 'bg-fc-draw/10 text-fc-draw'
              )}>
                {venue.reviewStatus === 'CHECKED' && '✓ Geprüft'}
                {venue.reviewStatus === 'AUTO' && '⚡ Automatisch'}
                {venue.reviewStatus === 'DRAFT' && '⚠ Entwurfs'}
              </span>
            </div>
            <span className="text-sm text-fc-violet hover:text-fc-violet-light font-medium flex items-center gap-1">
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

        <div className="mb-6 flex flex-wrap gap-2" role="group" aria-label="Filtern nach Spieltag">
          <button className="px-4 py-2 rounded-lg bg-fc-violet text-white text-sm font-medium">Alle</button>
          <button className="px-4 py-2 rounded-lg border border-fc-border bg-fc-surface text-fc-fg text-sm font-medium hover:bg-fc-violet/10">Kommende</button>
          <button className="px-4 py-2 rounded-lg border border-fc-border bg-fc-surface text-fc-fg text-sm font-medium hover:bg-fc-violet/10">Vergangene</button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" id="venues-list">
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

        <div className="mt-8 p-6 rounded-lg bg-fc-surface border border-fc-border">
          <h3 className="text-lg font-semibold text-fc-fg mb-2">Legende</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-fc-fg/70">
            <div className="flex items-center gap-2">
              <span className="px-2 py-1 rounded-full text-xs font-medium bg-fc-win/10 text-fc-win">✓ Geprüft</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-1 rounded-full text-xs font-medium bg-fc-violet/10 text-fc-violet">⚡ Automatisch</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-1 rounded-full text-xs font-medium bg-fc-draw/10 text-fc-draw">⚠ Entwurfs</span>
            </div>
            <div className="flex items-center gap-2">
              <a href="/quellen" className="text-fc-violet hover:underline">Quellen & Lizenzen</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}