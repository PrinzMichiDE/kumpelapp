import type { VenueDto } from '@kumpelapp/api-contracts'
import { prisma } from '@kumpelapp/db'
import { Badge, Card, CardContent, CardHeader, CardTitle } from '@kumpelapp/ui'
import { formatDate, formatKickoff } from '@kumpelapp/utils'
import { cn } from '@kumpelapp/utils'
import { ArrowLeft, Calendar, Car, ExternalLink, Globe, MapPin, Navigation, Train } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export const dynamic = 'force-dynamic'

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

export default async function VenueDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const now = new Date()

  let venue: VenueDto | null = null
  let matches: {
    id: string
    kickoff: string
    status: string
    homeTeam: string
    awayTeam: string
    homeGoals: number | null
    awayGoals: number | null
    isAueAway: boolean
  }[] = []

  try {
    const row = await prisma.venue.findUnique({
      where: { slug },
      include: {
        matches: {
          include: {
            homeTeam: { select: { name: true, shortName: true, isOwn: true } },
            awayTeam: { select: { name: true, shortName: true, isOwn: true } },
          },
          orderBy: { kickoff: 'desc' },
          take: 20,
        },
      },
    })
    if (!row) notFound()
    venue = toVenueDto(row)
    matches = row.matches.map((m) => ({
      id: m.id,
      kickoff: m.kickoff.toISOString(),
      status: m.status,
      homeTeam: m.homeTeam.shortName || m.homeTeam.name,
      awayTeam: m.awayTeam.shortName || m.awayTeam.name,
      homeGoals: m.homeGoals,
      awayGoals: m.awayGoals,
      isAueAway: m.awayTeam.isOwn,
    }))
  } catch (e) {
    console.error('Venue detail load error', e)
  }

  if (!venue) notFound()

  const status =
    venue.reviewStatus === 'CHECKED'
      ? { label: 'Geprüft', className: 'bg-fc-win/12 text-fc-win ring-1 ring-inset ring-fc-win/20' }
      : venue.reviewStatus === 'AUTO'
        ? { label: 'Automatisch', className: 'bg-fc-violet/12 text-fc-violet-light ring-1 ring-inset ring-fc-violet/20' }
        : { label: 'Entwurf', className: 'bg-fc-draw/12 text-fc-draw ring-1 ring-inset ring-fc-draw/20' }

  const upcoming = matches
    .filter((m) => new Date(m.kickoff) >= now)
    .sort((a, b) => +new Date(a.kickoff) - +new Date(b.kickoff))
  const past = matches.filter((m) => new Date(m.kickoff) < now)

  return (
    <div className="min-h-screen bg-fc-bg">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <Link
          href="/auswaerts"
          className="mb-6 inline-flex items-center gap-2 rounded-lg text-sm font-medium text-fc-fg/70 transition-colors hover:text-fc-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fc-violet focus-visible:ring-offset-2 focus-visible:ring-offset-fc-bg"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Zurück zum Auswärts-Guide
        </Link>

        <Card className="overflow-hidden">
          <CardHeader className="border-b border-fc-border/70 bg-fc-surface/50">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <span className={cn('inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium', status.className)}>
                    {status.label}
                  </span>
                </div>
                <CardTitle className="text-2xl sm:text-3xl">{venue.name}</CardTitle>
                <p className="mt-2 flex items-center gap-2 text-fc-fg/70">
                  <MapPin className="h-4 w-4 shrink-0" aria-hidden="true" />
                  <span>{venue.address || venue.city}</span>
                </p>
              </div>
              {venue.imageUrl ? (
                <div className="h-28 w-full overflow-hidden rounded-xl bg-fc-border/20 ring-1 ring-fc-border/60 sm:h-32 sm:w-56">
                  <img src={venue.imageUrl} alt="" className="h-full w-full object-cover" loading="lazy" decoding="async" />
                </div>
              ) : null}
            </div>
          </CardHeader>
          <CardContent className="p-6 sm:p-8">
            <dl className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <div className="rounded-lg bg-fc-bg/35 p-3">
                <dt className="text-xs font-medium uppercase tracking-wide text-fc-fg/50">Stadt</dt>
                <dd className="mt-1 font-semibold text-fc-fg">{venue.city}</dd>
              </div>
              <div className="rounded-lg bg-fc-bg/35 p-3">
                <dt className="text-xs font-medium uppercase tracking-wide text-fc-fg/50">Kapazität</dt>
                <dd className="mt-1 font-semibold text-fc-fg">{venue.capacity ? venue.capacity.toLocaleString('de-DE') : '–'}</dd>
              </div>
              <div className="rounded-lg bg-fc-bg/35 p-3">
                <dt className="text-xs font-medium uppercase tracking-wide text-fc-fg/50">Entfernung</dt>
                <dd className="mt-1 font-semibold text-fc-fg">{venue.distanceKm ? `~${venue.distanceKm} km` : '–'}</dd>
              </div>
              <div className="rounded-lg bg-fc-bg/35 p-3">
                <dt className="text-xs font-medium uppercase tracking-wide text-fc-fg/50">Fahrtzeit (Auto)</dt>
                <dd className="mt-1 font-semibold text-fc-fg">{venue.travelMinutesCar ? `${venue.travelMinutesCar} min` : '–'}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Anfahrt & Infos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              {venue.awayBlockInfo ? (
                <div className="rounded-lg border border-fc-violet/20 bg-fc-violet/5 p-3">
                  <p className="font-medium text-fc-violet-light">Gästeblock</p>
                  <p className="mt-1 text-fc-fg/70">{venue.awayBlockInfo}</p>
                </div>
              ) : null}
              {venue.travelCar ? (
                <div className="flex items-start gap-3">
                  <Car className="mt-0.5 h-4 w-4 shrink-0 text-fc-fg/50" aria-hidden="true" />
                  <div>
                    <p className="font-medium text-fc-fg">Anfahrt Auto</p>
                    <p className="text-fc-fg/70">{venue.travelCar}</p>
                  </div>
                </div>
              ) : null}
              {venue.travelTrain ? (
                <div className="flex items-start gap-3">
                  <Train className="mt-0.5 h-4 w-4 shrink-0 text-fc-fg/50" aria-hidden="true" />
                  <div>
                    <p className="font-medium text-fc-fg">Anfahrt ÖPNV</p>
                    <p className="text-fc-fg/70">{venue.travelTrain}</p>
                  </div>
                </div>
              ) : null}
              {venue.parkingInfo ? (
                <div className="flex items-start gap-3">
                  <Navigation className="mt-0.5 h-4 w-4 shrink-0 text-fc-fg/50" aria-hidden="true" />
                  <div>
                    <p className="font-medium text-fc-fg">Parken</p>
                    <p className="text-fc-fg/70">{venue.parkingInfo}</p>
                  </div>
                </div>
              ) : null}
              {venue.website ? (
                <div className="flex items-start gap-3">
                  <Globe className="mt-0.5 h-4 w-4 shrink-0 text-fc-fg/50" aria-hidden="true" />
                  <div>
                    <p className="font-medium text-fc-fg">Website</p>
                    <a href={venue.website} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-fc-violet hover:text-fc-violet-light">
                      Stadionseite öffnen <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                    </a>
                  </div>
                </div>
              ) : null}
              {!venue.awayBlockInfo && !venue.travelCar && !venue.travelTrain && !venue.parkingInfo && !venue.website ? (
                <p className="text-fc-fg/60">Noch keine detaillierten Anfahrts- und Stadioninfos hinterlegt.</p>
              ) : null}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Kommende Spiele hier</CardTitle>
            </CardHeader>
            <CardContent>
              {upcoming.length ? (
                <ul className="space-y-2">
                  {upcoming.map((m) => (
                    <li key={m.id}>
                      <Link
                        href={`/spiel/${m.id}`}
                        className="flex items-center justify-between gap-3 rounded-lg border border-fc-border/70 bg-fc-surface/40 px-4 py-3 text-sm transition-colors hover:border-fc-violet/40 hover:bg-fc-violet/5"
                      >
                        <div className="min-w-0">
                          <p className="truncate font-medium text-fc-fg">
                            {m.homeTeam} – {m.awayTeam}
                          </p>
                          <p className="mt-0.5 flex items-center gap-1.5 text-fc-fg/60">
                            <Calendar className="h-3.5 w-3.5" aria-hidden="true" />
                            <time dateTime={m.kickoff}>
                              {formatDate(m.kickoff)} · {formatKickoff(m.kickoff)} Uhr
                            </time>
                          </p>
                        </div>
                        {m.isAueAway ? <Badge variant="outline">Aue auswärts</Badge> : null}
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-fc-fg/60">Keine kommenden Spiele an diesem Spielort hinterlegt.</p>
              )}
            </CardContent>
          </Card>
        </div>

        {past.length ? (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-lg">Vergangene Spiele</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {past.slice(0, 10).map((m) => (
                  <li key={m.id}>
                    <Link
                      href={`/spiel/${m.id}`}
                      className="flex items-center justify-between gap-3 rounded-lg border border-fc-border/70 bg-fc-surface/40 px-4 py-3 text-sm transition-colors hover:border-fc-violet/40 hover:bg-fc-violet/5"
                    >
                      <div className="min-w-0">
                        <p className="truncate font-medium text-fc-fg">
                          {m.homeTeam} – {m.awayTeam}
                        </p>
                        <p className="mt-0.5 text-fc-fg/60">
                          <time dateTime={m.kickoff}>{formatDate(m.kickoff)}</time>
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {m.homeGoals != null && m.awayGoals != null ? (
                          <span className="font-semibold tabular-nums text-fc-fg">
                            {m.homeGoals}:{m.awayGoals}
                          </span>
                        ) : null}
                        {m.isAueAway ? <Badge variant="outline">Aue auswärts</Badge> : null}
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ) : null}

        {venue.source || venue.attribution ? (
          <aside className="mt-6 rounded-xl border border-fc-border/80 bg-fc-surface/60 p-5 text-sm text-fc-fg/65">
            <p className="font-medium text-fc-fg">Quellenhinweis</p>
            <div className="mt-1 space-y-1">
              {venue.source ? <p>Quelle: {venue.source}</p> : null}
              {venue.attribution ? <p>{venue.attribution}</p> : null}
            </div>
          </aside>
        ) : null}
      </div>
    </div>
  )
}
