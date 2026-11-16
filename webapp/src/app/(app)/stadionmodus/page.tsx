import type { Metadata } from 'next'
import Link from 'next/link'
import { prisma } from '@kumpelapp/db'
import { Badge, Card, CardContent, CardHeader, CardTitle } from '@kumpelapp/ui'
import { formatDate, formatKickoff, formatMatchDay } from '@kumpelapp/utils'
import { cn } from '@kumpelapp/utils'
import {
  AlertCircle,
  Calendar,
  Car,
  CheckCircle,
  Clock,
  Cloud,
  ExternalLink,
  MapPin,
  Navigation,
  Radio,
  ShieldCheck,
  Ticket,
  Train,
  Tv,
  WifiOff,
} from 'lucide-react'
import { DataMeta } from '@/components/data-meta'
import { staleLabel } from '@/lib/data-freshness'

export const metadata: Metadata = {
  title: 'Stadionmodus',
  description: 'Alles Wichtige zum nächsten Aue-Spieltag auf einen Blick – auch bei schlechtem Netz.',
}

export const dynamic = 'force-dynamic'

function countdownParts(kickoff: Date, now: Date) {
  const diffMs = kickoff.getTime() - now.getTime()
  if (diffMs <= 0) return { label: 'Anpfiff / läuft', urgent: true }
  const totalMinutes = Math.floor(diffMs / 60000)
  const days = Math.floor(totalMinutes / (60 * 24))
  const hours = Math.floor((totalMinutes % (60 * 24)) / 60)
  const minutes = totalMinutes % 60
  if (days > 0) return { label: `in ${days} ${days === 1 ? 'Tag' : 'Tagen'}, ${hours} Std.`, urgent: days <= 1 }
  if (hours > 0) return { label: `in ${hours} Std. ${minutes} Min.`, urgent: true }
  return { label: `in ${minutes} Min.`, urgent: true }
}

export default async function StadionmodusPage() {
  const now = new Date()
  let match: any = null
  let error: string | null = null

  try {
    match = await prisma.match.findFirst({
      where: {
        kickoff: { gte: new Date(now.getTime() - 4 * 60 * 60 * 1000) },
        status: { in: ['SCHEDULED', 'LIVE', 'POSTPONED'] },
        OR: [{ homeTeam: { isOwn: true } }, { awayTeam: { isOwn: true } }],
      },
      include: {
        homeTeam: { select: { id: true, name: true, shortName: true, isOwn: true } },
        awayTeam: { select: { id: true, name: true, shortName: true, isOwn: true } },
        venue: {
          select: {
            id: true,
            slug: true,
            name: true,
            city: true,
            address: true,
            awayBlockInfo: true,
            travelCar: true,
            travelTrain: true,
            parkingInfo: true,
            lat: true,
            lng: true,
            distanceKm: true,
            travelMinutesCar: true,
            source: true,
            fetchedAt: true,
          },
        },
        sales: { take: 1, orderBy: { saleStart: 'asc' } },
        streams: { select: { name: true, url: true, kind: true } },
      },
      orderBy: { kickoff: 'asc' },
    })
  } catch (e) {
    console.error('Stadionmodus load error', e)
    error = 'Matchday-Daten konnten nicht geladen werden. Bitte später erneut versuchen oder Offline-Bereich prüfen.'
  }

  if (error) {
    return (
      <main id="main-content" className="flex-1">
        <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="mb-6 flex items-center gap-3">
            <Radio className="h-6 w-6 text-fc-violet" aria-hidden="true" />
            <h1 className="text-3xl font-bold text-fc-fg">Stadionmodus</h1>
          </div>
          <Card className="border-fc-loss/30 bg-fc-loss/5">
            <CardContent className="p-6">
              <p className="flex items-center gap-2 text-fc-loss"><AlertCircle className="h-5 w-5" aria-hidden="true" />{error}</p>
              <div className="mt-4 flex flex-wrap gap-3">
                <Link href="/spielplan" className="text-fc-violet hover:underline">Zum Spielplan</Link>
                <Link href="/offline" className="text-fc-violet hover:underline">Offline-Seite</Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    )
  }

  if (!match) {
    return (
      <main id="main-content" className="flex-1">
        <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="mb-6 flex items-center gap-3">
            <Radio className="h-6 w-6 text-fc-violet" aria-hidden="true" />
            <h1 className="text-3xl font-bold text-fc-fg">Stadionmodus</h1>
          </div>
          <Card>
            <CardContent className="p-6 space-y-3 text-fc-fg/75">
              <p>Aktuell kein anstehendes Aue-Spiel im Matchday-Fenster gefunden.</p>
              <div className="flex flex-wrap gap-3 text-sm">
                <Link href="/spielplan" className="text-fc-violet hover:underline">Spielplan öffnen</Link>
                <Link href="/auswaerts" className="text-fc-violet hover:underline">Auswärts-Guide</Link>
                <Link href="/offline" className="text-fc-violet hover:underline">Offline-Hinweise</Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    )
  }

  const countdown = countdownParts(match.kickoff, now)
  const isHome = match.homeTeam.isOwn
  const opponent = isHome ? match.awayTeam : match.homeTeam
  const sale = match.sales?.[0] ?? null
  const mapsUrl = match.venue?.lat && match.venue?.lng
    ? `https://www.openstreetmap.org/directions?to=${match.venue.lat}%2C${match.venue.lng}`
    : match.venue?.name
      ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${match.venue.name} ${match.venue.city || ''}`)}`
      : null

  const statusBadge =
    match.status === 'LIVE'
      ? { label: 'LIVE', cls: 'bg-fc-loss/20 text-fc-loss border-fc-loss/30', icon: AlertCircle }
      : match.status === 'POSTPONED'
        ? { label: 'Verlegt', cls: 'bg-fc-draw/20 text-fc-draw border-fc-draw/30', icon: Clock }
        : { label: 'Geplant', cls: 'bg-fc-win/15 text-fc-win border-fc-win/30', icon: CheckCircle }
  const StatusIcon = statusBadge.icon
  const venueStaleText = staleLabel(match.venue?.fetchedAt, 'venues')

  return (
    <main id="main-content" className="flex-1">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-fc-violet/30 bg-fc-violet/10 px-3 py-1 text-xs font-medium text-fc-violet-light">
              <Radio className="h-3.5 w-3.5" aria-hidden="true" /> Matchday First · Stadionmodus
            </div>
            <h1 className="text-3xl font-bold text-fc-fg">Nächstes Aue-Spiel</h1>
            <p className={cn('mt-2 text-lg font-semibold', countdown.urgent ? 'text-fc-violet-light' : 'text-fc-fg/80')}>{countdown.label}</p>
          </div>
          <div className="flex flex-wrap gap-2 text-xs text-fc-fg/60">
            <span className="inline-flex items-center gap-1.5 rounded-lg border border-fc-border/70 bg-fc-surface/50 px-3 py-2"><WifiOff className="h-4 w-4" aria-hidden="true" /> Offline: Kerninfos als Snapshot verfügbar, wenn zuvor geladen</span>
            <span className="inline-flex items-center gap-1.5 rounded-lg border border-fc-border/70 bg-fc-surface/50 px-3 py-2"><ShieldCheck className="h-4 w-4" aria-hidden="true" /> Zeiten/Angaben können sich ändern</span>
          </div>
        </div>

        <div className="mb-6">
          <DataMeta
            source={match.source || 'OpenLigaDB / Redaktion'}
            updatedAt={now}
            stale={false}
            capabilityLabel={match.streams?.length ? 'Matchday-Daten + Streams (kuratierte Links)' : 'Matchday-Daten ohne verifizierte Streamlinks'}
            capabilityTone={match.streams?.length ? 'good' : 'info'}
            manualLabel={match.editorNote ? 'Redaktioneller Hinweis aktiv' : (venueStaleText ? 'Stadioninfos evtl. veraltet' : null)}
            note={`Anzeige aktualisiert: ${now.toLocaleString('de-DE')}. Live-Events sind je nach Quelle evtl. nicht verfügbar. Bei kurzfristigen Änderungen (Verlegung/Ort/Status) offizielle Meldungen beachten.`}
          />
        </div>

        <Card className="overflow-hidden border-fc-violet/25 bg-gradient-to-br from-fc-violet/10 via-fc-surface/70 to-fc-surface/40">
          <CardHeader className="pb-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className={cn('inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold', statusBadge.cls)}>
                <StatusIcon className="h-3.5 w-3.5" aria-hidden="true" /> {statusBadge.label}
              </span>
              <Badge variant="outline">{isHome ? 'Heimspiel' : 'Auswärtsspiel'}</Badge>
              {match.matchday ? <Badge variant="outline">{match.matchday}. Spieltag</Badge> : null}
              {match.source ? <span className="text-xs text-fc-fg/55">Quelle: {match.source}</span> : null}
            </div>
            <CardTitle className="mt-2 text-2xl sm:text-3xl">
              {match.homeTeam.shortName || match.homeTeam.name} <span className="text-fc-fg/50">vs</span> {match.awayTeam.shortName || match.awayTeam.name}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-xl border border-fc-border/70 bg-fc-bg/30 p-3">
                <p className="flex items-center gap-2 text-xs uppercase tracking-wide text-fc-fg/55"><Calendar className="h-3.5 w-3.5" /> Datum</p>
                <p className="mt-1 font-semibold text-fc-fg"><time dateTime={match.kickoff.toISOString()}>{formatMatchDay(match.kickoff)}</time></p>
              </div>
              <div className="rounded-xl border border-fc-border/70 bg-fc-bg/30 p-3">
                <p className="flex items-center gap-2 text-xs uppercase tracking-wide text-fc-fg/55"><Clock className="h-3.5 w-3.5" /> Anstoß</p>
                <p className="mt-1 font-semibold text-fc-fg">{formatKickoff(match.kickoff)} Uhr</p>
              </div>
              <div className="rounded-xl border border-fc-border/70 bg-fc-bg/30 p-3 sm:col-span-2">
                <p className="flex items-center gap-2 text-xs uppercase tracking-wide text-fc-fg/55"><MapPin className="h-3.5 w-3.5" /> Spielort</p>
                <p className="mt-1 font-semibold text-fc-fg">{match.venue ? `${match.venue.name}, ${match.venue.city}` : 'Noch nicht bekannt'}</p>
                {match.venue?.distanceKm ? <p className="text-sm text-fc-fg/65">~{match.venue.distanceKm} km ab Aue{match.venue.travelMinutesCar ? ` · ca. ${match.venue.travelMinutesCar} min (Auto)` : ''}</p> : null}
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Link href={`/spiel/${match.id}`} className="inline-flex h-10 items-center rounded-lg bg-fc-violet px-4 text-sm font-medium text-white hover:bg-fc-violet/90">Spieldetails öffnen</Link>
              {match.venue?.slug ? <Link href={`/auswaerts/${match.venue.slug}`} className="inline-flex h-10 items-center rounded-lg border border-fc-border px-4 text-sm font-medium text-fc-fg hover:border-fc-violet/40">Stadion/Guide</Link> : null}
              {mapsUrl ? <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className="inline-flex h-10 items-center gap-1.5 rounded-lg border border-fc-border px-4 text-sm font-medium text-fc-fg hover:border-fc-violet/40"><Navigation className="h-4 w-4" /> Route <ExternalLink className="h-3.5 w-3.5" /></a> : null}
              {sale?.shopUrl ? <a href={sale.shopUrl} target="_blank" rel="noopener noreferrer" className="inline-flex h-10 items-center gap-1.5 rounded-lg border border-fc-violet/30 bg-fc-violet/10 px-4 text-sm font-medium text-fc-fg hover:bg-fc-violet/15"><Ticket className="h-4 w-4" /> Tickets <ExternalLink className="h-3.5 w-3.5" /></a> : null}
              <Link href="/tickets" className="inline-flex h-10 items-center gap-1.5 rounded-lg border border-fc-border px-4 text-sm font-medium text-fc-fg hover:border-fc-violet/40"><Ticket className="h-4 w-4" /> Meine Tickets</Link>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader><CardTitle className="text-lg">Anreise & Stadionhinweise</CardTitle></CardHeader>
            <CardContent className="space-y-3 text-sm">
              {!isHome && match.venue?.awayBlockInfo ? (
                <div className="rounded-lg border border-fc-violet/20 bg-fc-violet/5 p-3">
                  <p className="font-medium text-fc-violet-light">Gästeblock</p>
                  <p className="mt-1 text-fc-fg/75">{match.venue.awayBlockInfo}</p>
                </div>
              ) : null}
              {match.venue?.travelCar ? (
                <div className="flex items-start gap-3"><Car className="mt-0.5 h-4 w-4 shrink-0 text-fc-fg/50" /><div><p className="font-medium text-fc-fg">Auto</p><p className="text-fc-fg/70">{match.venue.travelCar}</p></div></div>
              ) : null}
              {match.venue?.travelTrain ? (
                <div className="flex items-start gap-3"><Train className="mt-0.5 h-4 w-4 shrink-0 text-fc-fg/50" /><div><p className="font-medium text-fc-fg">ÖPNV</p><p className="text-fc-fg/70">{match.venue.travelTrain}</p></div></div>
              ) : null}
              {match.venue?.parkingInfo ? (
                <div className="flex items-start gap-3"><MapPin className="mt-0.5 h-4 w-4 shrink-0 text-fc-fg/50" /><div><p className="font-medium text-fc-fg">Parken</p><p className="text-fc-fg/70">{match.venue.parkingInfo}</p></div></div>
              ) : null}
              {!match.venue?.travelCar && !match.venue?.travelTrain && !match.venue?.parkingInfo && !( !isHome && match.venue?.awayBlockInfo) ? (
                <p className="text-fc-fg/60">Noch keine detaillierten Anfahrts-/Blockinfos hinterlegt. Prüfe den Auswärts-Guide oder offizielle Vereinsinfos.</p>
              ) : null}
              {match.venue?.fetchedAt ? <p className="pt-1 text-xs text-fc-fg/50">Stadiondaten zuletzt aktualisiert: {new Date(match.venue.fetchedAt).toLocaleString('de-DE')}</p> : null}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-lg">Live, Stream & Wetter</CardTitle></CardHeader>
            <CardContent className="space-y-3 text-sm">
              {match.streams?.length ? (
                <div>
                  <p className="mb-2 flex items-center gap-2 font-medium text-fc-fg"><Tv className="h-4 w-4" /> Übertragung/Streams</p>
                  <ul className="space-y-2">
                    {match.streams.map((s: any, i: number) => (
                      <li key={`${s.url}-${i}`}>
                        <a href={s.url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between rounded-lg border border-fc-border/70 bg-fc-surface/40 px-3 py-2 hover:border-fc-violet/40">
                          <span>{s.name}</span>
                          <span className="inline-flex items-center gap-1 text-fc-violet text-xs">{s.kind || 'Stream'} <ExternalLink className="h-3.5 w-3.5" /></span>
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <p className="text-fc-fg/60">Noch keine Stream-/Audio-Links hinterlegt. Offizielle Kanäle am Spieltag prüfen.</p>
              )}
              <div className="rounded-lg border border-fc-border/70 bg-fc-bg/25 p-3">
                <p className="flex items-center gap-2 font-medium text-fc-fg"><Cloud className="h-4 w-4" /> Wetterhinweis</p>
                <p className="mt-1 text-fc-fg/65">Wetterdaten werden je nach Verfügbarkeit im Match-Kontext ergänzt. Für die Anreise kurzfristig lokale Prognosen prüfen.</p>
              </div>
              {sale?.awayContingent ? <p className="text-fc-fg/70"><span className="font-medium text-fc-fg">Ticket-Hinweis:</span> {sale.awayContingent}</p> : null}
              {match.editorNote ? <p className="rounded-lg border border-fc-violet/20 bg-fc-violet/5 p-3 text-fc-fg/80"><span className="font-medium text-fc-violet-light">Redaktioneller Hinweis:</span> {match.editorNote}</p> : null}
            </CardContent>
          </Card>
        </div>

        <div className="mt-6 flex flex-wrap gap-3 text-sm text-fc-fg/60">
          <span>Gegner: <strong className="text-fc-fg/85">{opponent.shortName || opponent.name}</strong></span>
          <span>·</span>
          <Link href="/spielplan" className="text-fc-violet hover:underline">Alle Spiele</Link>
          <Link href="/tippspiel" className="text-fc-violet hover:underline">Tippspiel</Link>
          <Link href="/quellen" className="text-fc-violet hover:underline">Quellen & Stand</Link>
        </div>
      </div>
    </main>
  )
}