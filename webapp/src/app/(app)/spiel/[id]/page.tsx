import type { MatchDto } from '@kumpelapp/api-contracts'
import { prisma } from '@kumpelapp/db'
import { formatDate, formatKickoff, formatMatchDay } from '@kumpelapp/utils'
import { Badge, Card, CardContent, CardHeader, CardTitle } from '@kumpelapp/ui'
import {
  AlertCircle,
  ArrowLeft,
  Calendar,
  CalendarPlus,
  Car,
  CheckCircle,
  Clock,
  ExternalLink,
  Info,
  MapPin,
  Navigation,
  Ticket,
  Train,
  Trophy,
  Tv,
} from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { cn } from '@kumpelapp/utils'
import { DataMeta } from '@/components/data-meta'
import { matchDataCapability } from '@/lib/data-freshness'

export const dynamic = 'force-dynamic'

function countdownText(kickoffIso: string, now: Date) {
  const kickoff = new Date(kickoffIso)
  const diffMs = kickoff.getTime() - now.getTime()
  if (diffMs <= 0) return null
  const totalMinutes = Math.floor(diffMs / 60000)
  const days = Math.floor(totalMinutes / (60 * 24))
  const hours = Math.floor((totalMinutes % (60 * 24)) / 60)
  const minutes = totalMinutes % 60
  if (days > 0) return `Anstoß in ${days} ${days === 1 ? 'Tag' : 'Tagen'}${hours > 0 ? `, ${hours} Std.` : ''}`
  if (hours > 0) return `Anstoß in ${hours} Std.${minutes > 0 ? ` ${minutes} Min.` : ''}`
  return `Anstoß in ${minutes} Min.`
}

function mapsSearchUrl(query: string) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`
}

function toDto(m: {
  id: string
  leagueId: string
  externalId: string | null
  source: string | null
  matchday: number | null
  kickoff: Date
  status: MatchDto['status']
  venue: {
    id: string
    name: string
    city: string
    lat: number | null
    lng: number | null
    awayBlockInfo: string | null
    travelCar: string | null
    travelTrain: string | null
    parkingInfo: string | null
  } | null
  homeTeam: { id: string; name: string; shortName: string | null; logoUrl: string | null; isOwn: boolean }
  awayTeam: { id: string; name: string; shortName: string | null; logoUrl: string | null; isOwn: boolean }
  homeGoals: number | null
  awayGoals: number | null
  halftimeHome: number | null
  halftimeAway: number | null
  attendance: number | null
  editorNote: string | null
  events: { id: string; matchId: string; minute: number; type: string; side: string | null; player: string | null; text: string | null }[]
  sales: { saleStart: Date | null; saleEnd: Date | null; shopUrl: string | null; awayContingent: string | null }[]
  streams: { name: string; url: string; kind: string }[]
}): MatchDto {
  const sale = m.sales[0]
  return {
    id: m.id,
    leagueId: m.leagueId,
    externalId: m.externalId,
    source: m.source,
    matchday: m.matchday,
    kickoff: m.kickoff.toISOString(),
    status: m.status,
    venue: m.venue
      ? {
          id: m.venue.id,
          name: m.venue.name,
          city: m.venue.city,
          lat: m.venue.lat,
          lng: m.venue.lng,
          awayBlockInfo: m.venue.awayBlockInfo,
          travelCar: m.venue.travelCar,
          travelTrain: m.venue.travelTrain,
          parkingInfo: m.venue.parkingInfo,
        }
      : null,
    homeTeam: m.homeTeam,
    awayTeam: m.awayTeam,
    homeGoals: m.homeGoals,
    awayGoals: m.awayGoals,
    halftimeHome: m.halftimeHome,
    halftimeAway: m.halftimeAway,
    attendance: m.attendance,
    editorNote: m.editorNote,
    events: m.events as MatchDto['events'],
    ticketSale: sale
      ? {
          saleStart: sale.saleStart ? sale.saleStart.toISOString() : null,
          saleEnd: sale.saleEnd ? sale.saleEnd.toISOString() : null,
          shopUrl: sale.shopUrl,
          awayContingent: sale.awayContingent,
        }
      : null,
    streams: m.streams,
    weather: null,
  }
}

function statusBadge(status: MatchDto['status']) {
  switch (status) {
    case 'LIVE':
      return (
        <Badge variant="destructive" className="animate-pulse">
          <AlertCircle className="mr-1 h-3 w-3" /> LIVE
        </Badge>
      )
    case 'FINISHED':
      return (
        <Badge variant="success">
          <CheckCircle className="mr-1 h-3 w-3" /> Beendet
        </Badge>
      )
    case 'POSTPONED':
      return <Badge variant="warning">Verlegt</Badge>
    case 'CANCELLED':
      return <Badge variant="destructive">Abgesagt</Badge>
    default:
      return <Badge variant="outline">Geplant</Badge>
  }
}

function eventLabel(type: string) {
  switch (type) {
    case 'GOAL':
      return 'Tor'
    case 'OWN_GOAL':
      return 'Eigentor'
    case 'PENALTY_GOAL':
      return 'Elfmeter'
    case 'YELLOW_CARD':
      return 'Gelbe Karte'
    case 'YELLOW_RED':
      return 'Gelb-Rot'
    case 'RED_CARD':
      return 'Rote Karte'
    case 'SUBSTITUTION':
      return 'Wechsel'
    default:
      return 'Ereignis'
  }
}

function eventTone(type: string) {
  switch (type) {
    case 'GOAL':
    case 'PENALTY_GOAL':
      return 'border-fc-win/30 bg-fc-win/10 text-fc-win'
    case 'OWN_GOAL':
      return 'border-fc-draw/30 bg-fc-draw/10 text-fc-draw'
    case 'YELLOW_CARD':
      return 'border-yellow-500/30 bg-yellow-500/10 text-yellow-300'
    case 'YELLOW_RED':
    case 'RED_CARD':
      return 'border-fc-loss/30 bg-fc-loss/10 text-fc-loss'
    case 'SUBSTITUTION':
      return 'border-fc-violet/30 bg-fc-violet/10 text-fc-violet-light'
    default:
      return 'border-fc-border/70 bg-fc-surface/60 text-fc-fg/80'
  }
}

export default async function SpielDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  let match: MatchDto | null = null
  try {
    const row = await prisma.match.findUnique({
      where: { id },
      include: {
        venue: {
          select: {
            id: true,
            name: true,
            city: true,
            lat: true,
            lng: true,
            awayBlockInfo: true,
            travelCar: true,
            travelTrain: true,
            parkingInfo: true,
          },
        },
        homeTeam: { select: { id: true, name: true, shortName: true, logoUrl: true, isOwn: true } },
        awayTeam: { select: { id: true, name: true, shortName: true, logoUrl: true, isOwn: true } },
        events: { orderBy: { minute: 'asc' } },
        sales: { take: 1, orderBy: { saleStart: 'asc' } },
        streams: { select: { name: true, url: true, kind: true } },
      },
    })
    if (row) match = toDto(row)
  } catch (e) {
    console.error('Match detail load error', e)
  }

  if (!match) notFound()

  const isFinished = match.status === 'FINISHED'
  const hasScore = match.homeGoals !== null && match.awayGoals !== null
  const aueIsHome = match.homeTeam.isOwn
  const aueIsAway = match.awayTeam.isOwn
  const auePerspective = aueIsHome || aueIsAway
  const aueGoals = hasScore ? (aueIsHome ? match.homeGoals! : aueIsAway ? match.awayGoals! : null) : null
  const oppGoals = hasScore ? (aueIsHome ? match.awayGoals! : aueIsAway ? match.homeGoals! : null) : null
  const aueResult =
    auePerspective && aueGoals !== null && oppGoals !== null
      ? aueGoals > oppGoals
        ? { label: 'Sieg', tone: 'text-fc-win border-fc-win/30 bg-fc-win/10' }
        : aueGoals === oppGoals
          ? { label: 'Unentschieden', tone: 'text-fc-draw border-fc-draw/30 bg-fc-draw/10' }
          : { label: 'Niederlage', tone: 'text-fc-loss border-fc-loss/30 bg-fc-loss/10' }
      : null
  const events = match.events ?? []
  const eventStats = events.reduce(
    (acc, ev) => {
      if (ev.type === 'GOAL' || ev.type === 'OWN_GOAL' || ev.type === 'PENALTY_GOAL') acc.goals += 1
      if (ev.type === 'YELLOW_CARD' || ev.type === 'YELLOW_RED') acc.yellows += 1
      if (ev.type === 'RED_CARD' || ev.type === 'YELLOW_RED') acc.reds += 1
      if (ev.type === 'SUBSTITUTION') acc.subs += 1
      return acc
    },
    { goals: 0, yellows: 0, reds: 0, subs: 0 },
  )
  const capability = matchDataCapability({ status: match.status, hasEvents: events.length > 0, source: match.source, updatedAt: match.kickoff })

  const now = new Date()
  const countdown = countdownText(match.kickoff, now)
  const opponentName = match.homeTeam.isOwn
    ? match.awayTeam.shortName || match.awayTeam.name
    : match.homeTeam.shortName || match.homeTeam.name
  const venueQuery = match.venue ? `${match.venue.name}, ${match.venue.city}` : null
  const mapsUrl = venueQuery ? mapsSearchUrl(venueQuery) : null
  const statusLabel =
    match.status === 'LIVE'
      ? 'Läuft gerade'
      : match.status === 'FINISHED'
        ? 'Spiel beendet'
        : match.status === 'POSTPONED'
          ? 'Spiel verlegt'
          : match.status === 'CANCELLED'
            ? 'Spiel abgesagt'
            : 'Anstehend'

  return (
    <div className="min-h-screen bg-fc-bg">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <Link
          href="/spielplan"
          className="mb-6 inline-flex items-center gap-2 rounded-lg text-sm font-medium text-fc-fg/70 transition-colors hover:text-fc-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fc-violet focus-visible:ring-offset-2 focus-visible:ring-offset-fc-bg"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Zurück zum Spielplan
        </Link>

        <Card className="overflow-hidden">
          <CardHeader className="border-b border-fc-border/70 bg-fc-surface/50">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                {match.matchday ? (
                  <Badge variant="outline">
                    <Trophy className="mr-1 h-3 w-3" /> {match.matchday}. Spieltag
                  </Badge>
                ) : null}
                {statusBadge(match.status)}
                <Badge variant={match.homeTeam.isOwn ? 'secondary' : 'outline'}>
                  {match.homeTeam.isOwn ? 'Heimspiel' : 'Auswärtsspiel'}
                </Badge>
                {aueResult ? (
                  <span className={cn('inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold', aueResult.tone)}>
                    Aue: {aueResult.label}
                  </span>
                ) : null}
              </div>
              <div className="flex flex-wrap items-center gap-4 text-sm text-fc-fg/70">
                <span className="inline-flex items-center gap-1.5">
                  <Calendar className="h-4 w-4" aria-hidden="true" />
                  <time dateTime={match.kickoff}>{formatMatchDay(match.kickoff)}</time>
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Clock className="h-4 w-4" aria-hidden="true" />
                  {formatKickoff(match.kickoff)} Uhr
                </span>
                {match.source ? <span className="text-xs text-fc-fg/55">Quelle: {match.source}</span> : null}
              </div>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-fc-fg/60">
              {countdown ? <span className="font-medium text-fc-violet-light">{countdown}</span> : <span>{statusLabel}</span>}
              <span>Gegner: {opponentName}</span>
              {match.source ? <span>Quelle: {match.source}</span> : <span>Quelle: unbekannt</span>}
            </div>
            {match.editorNote ? (
              <div className="mt-4 rounded-xl border border-fc-draw/30 bg-fc-draw/10 p-3 text-sm text-fc-fg/85">
                <p className="font-medium text-fc-draw">Redaktioneller Hinweis / Korrektur</p>
                <p className="mt-1">{match.editorNote}</p>
              </div>
            ) : null}
            <div className="mt-4">
              <DataMeta
                source={match.source || 'Unbekannt / redaktionell'}
                updatedAt={match.kickoff}
                capabilityLabel={capability.label}
                capabilityTone={capability.key === 'result_only' || capability.key === 'stale' ? 'warn' : capability.key === 'available' ? 'good' : 'info'}
                manualLabel={match.editorNote ? 'Manuell geprüft/korrigiert möglich' : null}
                note={`${capability.detail} Änderungen (Verlegung, Status, Ergebnis) sind möglich.`}
                compact
              />
            </div>
          </CardHeader>
          <CardContent className="p-6 sm:p-8">
            <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4 sm:gap-8">
              <div className="text-center">
                <p className={cn('text-lg font-semibold sm:text-2xl', match.homeTeam.isOwn ? 'text-fc-violet-light' : 'text-fc-fg')}>
                  {match.homeTeam.name}
                </p>
                <p className="mt-1 text-sm text-fc-fg/50">Heim</p>
              </div>
              <div className="flex flex-col items-center">
                {hasScore ? (
                  <>
                    <p className="text-4xl font-bold tabular-nums text-fc-fg sm:text-6xl">
                      {match.homeGoals}:{match.awayGoals}
                    </p>
                    {match.halftimeHome !== null && match.halftimeAway !== null ? (
                      <p className="mt-1 text-sm text-fc-fg/60">
                        HZ {match.halftimeHome}:{match.halftimeAway}
                      </p>
                    ) : null}
                  </>
                ) : (
                  <p className="text-3xl font-bold text-fc-fg/40 sm:text-5xl">vs</p>
                )}
              </div>
              <div className="text-center">
                <p className={cn('text-lg font-semibold sm:text-2xl', match.awayTeam.isOwn ? 'text-fc-violet-light' : 'text-fc-fg')}>
                  {match.awayTeam.name}
                </p>
                <p className="mt-1 text-sm text-fc-fg/50">Auswärts</p>
              </div>
            </div>

            {auePerspective && (hasScore || events.length > 0) ? (
              <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div className="rounded-xl border border-fc-border/70 bg-fc-surface/40 p-3 text-center">
                  <p className="text-xs uppercase tracking-wide text-fc-fg/55">Tore (Events)</p>
                  <p className="mt-1 text-lg font-bold tabular-nums text-fc-fg">{eventStats.goals}</p>
                </div>
                <div className="rounded-xl border border-fc-border/70 bg-fc-surface/40 p-3 text-center">
                  <p className="text-xs uppercase tracking-wide text-fc-fg/55">Gelb</p>
                  <p className="mt-1 text-lg font-bold tabular-nums text-fc-fg">{eventStats.yellows}</p>
                </div>
                <div className="rounded-xl border border-fc-border/70 bg-fc-surface/40 p-3 text-center">
                  <p className="text-xs uppercase tracking-wide text-fc-fg/55">Rot</p>
                  <p className="mt-1 text-lg font-bold tabular-nums text-fc-fg">{eventStats.reds}</p>
                </div>
                <div className="rounded-xl border border-fc-border/70 bg-fc-surface/40 p-3 text-center">
                  <p className="text-xs uppercase tracking-wide text-fc-fg/55">Wechsel</p>
                  <p className="mt-1 text-lg font-bold tabular-nums text-fc-fg">{eventStats.subs}</p>
                </div>
              </div>
            ) : null}

            {match.editorNote ? (
              <div className="mt-6 rounded-lg border border-fc-violet/20 bg-fc-violet/5 p-4 text-sm text-fc-fg/80">
                <p className="font-medium text-fc-violet-light">Hinweis</p>
                <p className="mt-1">{match.editorNote}</p>
              </div>
            ) : null}
          </CardContent>
        </Card>

        <Card className="mt-6 border-fc-violet/25 bg-gradient-to-b from-fc-violet/[0.07] to-card">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Info className="h-5 w-5 text-fc-violet" aria-hidden="true" /> Spieltag-Check
            </CardTitle>
            <p className="text-sm text-fc-fg/65">
              Die wichtigsten Infos und Schnellaktionen für dieses Spiel auf einen Blick.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-xl border border-fc-border/70 bg-fc-bg/30 p-3">
                <p className="text-xs uppercase tracking-wide text-fc-fg/55">Status</p>
                <p className="mt-1 text-sm font-semibold text-fc-fg">{statusLabel}</p>
                {countdown ? <p className="mt-0.5 text-xs text-fc-fg/60">{countdown}</p> : null}
              </div>
              <div className="rounded-xl border border-fc-border/70 bg-fc-bg/30 p-3">
                <p className="text-xs uppercase tracking-wide text-fc-fg/55">Ort</p>
                <p className="mt-1 text-sm font-semibold text-fc-fg">{match.homeTeam.isOwn ? 'Heim' : 'Auswärts'}</p>
                <p className="mt-0.5 text-xs text-fc-fg/60 line-clamp-2">{venueQuery ?? 'Spielort noch offen'}</p>
              </div>
              <div className="rounded-xl border border-fc-border/70 bg-fc-bg/30 p-3">
                <p className="text-xs uppercase tracking-wide text-fc-fg/55">Tickets</p>
                <p className="mt-1 text-sm font-semibold text-fc-fg">
                  {match.ticketSale?.shopUrl ? 'Verfügbar/Verlinkt' : 'Kein direkter Link'}
                </p>
                {match.ticketSale?.awayContingent ? (
                  <p className="mt-0.5 text-xs text-fc-fg/60 line-clamp-2">{match.ticketSale.awayContingent}</p>
                ) : null}
              </div>
              <div className="rounded-xl border border-fc-border/70 bg-fc-bg/30 p-3">
                <p className="text-xs uppercase tracking-wide text-fc-fg/55">Übertragung</p>
                <p className="mt-1 text-sm font-semibold text-fc-fg">
                  {match.streams && match.streams.length > 0 ? `${match.streams.length} Link${match.streams.length === 1 ? '' : 's'}` : 'Noch kein Stream hinterlegt'}
                </p>
                <p className="mt-0.5 text-xs text-fc-fg/60">Offizielle/kuratierte Hinweise prüfen</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {mapsUrl ? (
                <a
                  href={mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-lg border border-fc-border bg-fc-bg/40 px-3 py-2 text-sm font-medium text-fc-fg transition-[border-color,background-color,color,box-shadow] duration-200 hover:border-fc-violet/40 hover:bg-fc-violet/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fc-violet focus-visible:ring-offset-2 focus-visible:ring-offset-fc-bg"
                >
                  <Navigation className="h-4 w-4" aria-hidden="true" /> Route & Karte <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                </a>
              ) : null}
              {match.ticketSale?.shopUrl ? (
                <a
                  href={match.ticketSale.shopUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-lg border border-fc-border bg-fc-bg/40 px-3 py-2 text-sm font-medium text-fc-fg transition-[border-color,background-color,color,box-shadow] duration-200 hover:border-fc-violet/40 hover:bg-fc-violet/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fc-violet focus-visible:ring-offset-2 focus-visible:ring-offset-fc-bg"
                >
                  <Ticket className="h-4 w-4" aria-hidden="true" /> Tickets <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                </a>
              ) : null}
              {match.streams?.[0] ? (
                <a
                  href={match.streams[0].url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-lg border border-fc-border bg-fc-bg/40 px-3 py-2 text-sm font-medium text-fc-fg transition-[border-color,background-color,color,box-shadow] duration-200 hover:border-fc-violet/40 hover:bg-fc-violet/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fc-violet focus-visible:ring-offset-2 focus-visible:ring-offset-fc-bg"
                >
                  <Tv className="h-4 w-4" aria-hidden="true" /> Stream öffnen <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                </a>
              ) : null}
              <a
                href={`/api/v1/calendar/match/${match.id}`}
                download
                className="inline-flex items-center gap-1.5 rounded-lg border border-fc-violet/25 bg-fc-violet/10 px-3 py-2 text-sm font-medium text-fc-violet-light transition-[border-color,background-color,color,box-shadow] duration-200 hover:bg-fc-violet/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fc-violet focus-visible:ring-offset-2 focus-visible:ring-offset-fc-bg"
              >
                <CalendarPlus className="h-4 w-4" aria-hidden="true" /> Dieses Spiel (.ics)
              </a>
              <a
                href="/api/v1/calendar/aue.ics"
                download
                className="inline-flex items-center gap-1.5 rounded-lg border border-fc-border bg-fc-bg/40 px-3 py-2 text-sm font-medium text-fc-fg transition-[border-color,background-color,color,box-shadow] duration-200 hover:border-fc-violet/40 hover:bg-fc-violet/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fc-violet focus-visible:ring-offset-2 focus-visible:ring-offset-fc-bg"
              >
                <CalendarPlus className="h-4 w-4" aria-hidden="true" /> Alle Termine (.ics)
              </a>
              <Link
                href="/spielplan"
                className="inline-flex items-center gap-1.5 rounded-lg border border-fc-border bg-fc-bg/40 px-3 py-2 text-sm font-medium text-fc-fg transition-[border-color,background-color,color,box-shadow] duration-200 hover:border-fc-violet/40 hover:bg-fc-violet/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fc-violet focus-visible:ring-offset-2 focus-visible:ring-offset-fc-bg"
              >
                <Calendar className="h-4 w-4" aria-hidden="true" /> Zum Spielplan
              </Link>
            </div>

            <p className="text-xs text-fc-fg/55">
              Hinweis: Angaben zu Tickets, Streams, Anfahrt und Zeiten können sich kurzfristig ändern. Prüfe bei wichtigen Infos die offizielle Quelle des Vereins oder Veranstalters.
              {match.source ? ` (Datenquelle dieses Spiels: ${match.source})` : ''}
            </p>
          </CardContent>
        </Card>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Spielinfos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-start gap-3">
                <Calendar className="mt-0.5 h-4 w-4 shrink-0 text-fc-fg/50" aria-hidden="true" />
                <div>
                  <p className="font-medium text-fc-fg">Anstoß</p>
                  <p className="text-fc-fg/70">
                    {formatDate(match.kickoff)} · {formatKickoff(match.kickoff)} Uhr
                  </p>
                </div>
              </div>
              {match.venue ? (
                <div className="flex items-start gap-3">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-fc-fg/50" aria-hidden="true" />
                  <div>
                    <p className="font-medium text-fc-fg">Spielort</p>
                    <p className="text-fc-fg/70">
                      {match.venue.name}, {match.venue.city}
                    </p>
                  </div>
                </div>
              ) : null}
              {match.attendance ? (
                <div className="flex items-start gap-3">
                  <Trophy className="mt-0.5 h-4 w-4 shrink-0 text-fc-fg/50" aria-hidden="true" />
                  <div>
                    <p className="font-medium text-fc-fg">Zuschauer</p>
                    <p className="text-fc-fg/70">{match.attendance.toLocaleString('de-DE')}</p>
                  </div>
                </div>
              ) : null}
              {match.ticketSale?.shopUrl ? (
                <div className="flex items-start gap-3">
                  <Ticket className="mt-0.5 h-4 w-4 shrink-0 text-fc-fg/50" aria-hidden="true" />
                  <div>
                    <p className="font-medium text-fc-fg">Tickets</p>
                    <a
                      href={match.ticketSale.shopUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-fc-violet hover:text-fc-violet-light"
                    >
                      Zum Ticketshop <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                    </a>
                    {match.ticketSale.awayContingent ? (
                      <p className="mt-1 text-fc-fg/60">{match.ticketSale.awayContingent}</p>
                    ) : null}
                  </div>
                </div>
              ) : null}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Anfahrt & Stadion</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              {match.venue ? (
                <>
                  {match.venue.awayBlockInfo ? (
                    <div className="rounded-lg border border-fc-violet/20 bg-fc-violet/5 p-3">
                      <p className="font-medium text-fc-violet-light">Gästeblock</p>
                      <p className="mt-1 text-fc-fg/70">{match.venue.awayBlockInfo}</p>
                    </div>
                  ) : null}
                  {match.venue.travelCar ? (
                    <div className="flex items-start gap-3">
                      <Car className="mt-0.5 h-4 w-4 shrink-0 text-fc-fg/50" aria-hidden="true" />
                      <div>
                        <p className="font-medium text-fc-fg">Anfahrt Auto</p>
                        <p className="text-fc-fg/70">{match.venue.travelCar}</p>
                      </div>
                    </div>
                  ) : null}
                  {match.venue.travelTrain ? (
                    <div className="flex items-start gap-3">
                      <Train className="mt-0.5 h-4 w-4 shrink-0 text-fc-fg/50" aria-hidden="true" />
                      <div>
                        <p className="font-medium text-fc-fg">Anfahrt ÖPNV</p>
                        <p className="text-fc-fg/70">{match.venue.travelTrain}</p>
                      </div>
                    </div>
                  ) : null}
                  {match.venue.parkingInfo ? (
                    <div className="flex items-start gap-3">
                      <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-fc-fg/50" aria-hidden="true" />
                      <div>
                        <p className="font-medium text-fc-fg">Parken</p>
                        <p className="text-fc-fg/70">{match.venue.parkingInfo}</p>
                      </div>
                    </div>
                  ) : null}
                  {!match.venue.awayBlockInfo && !match.venue.travelCar && !match.venue.travelTrain && !match.venue.parkingInfo ? (
                    <p className="text-fc-fg/60">Noch keine detaillierten Anfahrtsinfos hinterlegt.</p>
                  ) : null}
                </>
              ) : (
                <p className="text-fc-fg/60">Kein Spielort hinterlegt.</p>
              )}
            </CardContent>
          </Card>
        </div>

        {events.length > 0 ? (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-lg">Spielereignisse</CardTitle>
              <p className="text-sm text-fc-fg/60">
                {events.length} {events.length === 1 ? 'Ereignis' : 'Ereignisse'} im Verlauf · Darstellung abhängig von der Datenquelle
              </p>
            </CardHeader>
            <CardContent>
              <ol className="space-y-3" aria-label="Spielverlauf">
                {events.map((ev) => (
                  <li key={ev.id} className="flex items-start gap-3 rounded-lg border border-fc-border/70 bg-fc-surface/40 p-3">
                    <span className={cn('inline-flex h-7 min-w-7 items-center justify-center rounded-md border px-2 text-xs font-semibold tabular-nums', eventTone(ev.type))}>
                      {ev.minute}&apos;
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                        <p className="font-medium text-fc-fg">
                          {eventLabel(ev.type)}
                          {ev.player ? <span className="font-normal text-fc-fg/80"> – {ev.player}</span> : null}
                        </p>
                        {ev.side ? (
                          <span className="rounded-md bg-fc-bg/40 px-2 py-0.5 text-xs text-fc-fg/60">
                            {ev.side === 'HOME' ? `Heim · ${match.homeTeam.shortName || match.homeTeam.name}` : ev.side === 'AWAY' ? `Auswärts · ${match.awayTeam.shortName || match.awayTeam.name}` : ev.side}
                          </span>
                        ) : null}
                      </div>
                      {ev.text ? <p className="mt-0.5 text-sm text-fc-fg/60">{ev.text}</p> : null}
                    </div>
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>
        ) : isFinished || match.status === 'LIVE' ? (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-lg">Spielereignisse</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-fc-fg/65">
              <p>Keine detaillierten Live-Events verfügbar. Für dieses Spiel liegen aktuell nur Ergebnis-/Statusdaten oder unvollständige Ereignisdaten vor.</p>
              <p className="text-fc-fg/55">Hinweis: RLNO-Datenquellen liefern nicht immer Karten/Wechsel/Torschützen in Echtzeit. Offizielle Kanäle können ergänzende Infos bieten.</p>
            </CardContent>
          </Card>
        ) : (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-lg">Spielereignisse</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-fc-fg/60">Ereignisse werden bei Anpfiff bzw. nach Erfassung angezeigt, sofern die Datenquelle sie liefert.</p>
            </CardContent>
          </Card>
        )}

        {match.streams && match.streams.length > 0 ? (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Tv className="h-5 w-5" aria-hidden="true" /> Übertragung
              </CardTitle>
              <p className="text-sm text-fc-fg/60">Links zu externen Angeboten; Verfügbarkeit kann sich kurzfristig ändern.</p>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {match.streams.map((s, i) => (
                  <li key={`${s.url}-${i}`}>
                    <a
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between rounded-lg border border-fc-border/70 bg-fc-surface/40 px-4 py-3 text-sm transition-colors hover:border-fc-violet/40 hover:bg-fc-violet/5"
                    >
                      <span className="font-medium text-fc-fg">{s.name}</span>
                      <span className="inline-flex items-center gap-1 text-fc-violet">
                        {s.kind} <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ) : null}
        <Card className="mt-6 border-fc-border/70">
          <CardContent className="flex flex-wrap items-center justify-between gap-3 py-4 text-sm text-fc-fg/65">
            <div className="space-y-1">
              <p>Daten können sich ändern (Verlegung, Korrektur, fehlende Live-Events). Quelle: <span className="text-fc-fg/85">{match.source || 'unbekannt'}</span>.</p>
              <p className="text-xs text-fc-fg/55">Letzte Anzeigeaktualisierung: {new Date().toLocaleString('de-DE')} · Bei Abweichungen: <Link href="/quellen" className="text-fc-violet hover:underline">Quellen/Transparenz</Link> prüfen oder Korrektur über Admin/Redaktion anstoßen.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href="/quellen" className="text-fc-violet hover:underline">Quellen</Link>
              <a href={`mailto:redaktion@kumpelapp.de?subject=${encodeURIComponent(`Datenproblem Spiel ${match.id}`)}&body=${encodeURIComponent(`Spiel: ${match.homeTeam.name} – ${match.awayTeam.name}\nURL: /spiel/${match.id}\n\nWas stimmt nicht?\nQuelle/Referenz:\n`)}`} className="text-fc-violet hover:underline">Datenproblem melden</a>
              <Link href="/admin/matches" className="text-fc-violet hover:underline">Admin-Korrektur</Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
