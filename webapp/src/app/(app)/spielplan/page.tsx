import type { MatchDto } from '@kumpelapp/api-contracts'
import { prisma } from '@kumpelapp/db'
import { formatDate, formatKickoff, formatMatchDay } from '@kumpelapp/utils'
import { Card, CardContent } from '@kumpelapp/ui'
import { Badge } from '@kumpelapp/ui'
import { Calendar, CalendarPlus, Clock, MapPin, Trophy, AlertCircle, CheckCircle, SearchX } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@kumpelapp/utils'
import { DataMeta } from '@/components/data-meta'
import { ShareAction } from '@/components/share-action'
import { staleLabel } from '@/lib/data-freshness'
import { getServerSession } from '@/lib/auth-server'

export const dynamic = 'force-dynamic'

interface MatchCardProps {
  match: MatchDto
  community?: { going: number; maybe: number; total: number } | null
  myStatus?: 'GOING' | 'MAYBE' | 'NOT_GOING' | null
}

function MatchCard({ match, community, myStatus }: MatchCardProps) {
  const isFinished = match.status === 'FINISHED'
  const isLive = match.status === 'LIVE'
  const isAueHome = match.homeTeam.isOwn

  const getStatusBadge = () => {
    switch (match.status) {
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

  const getResultDisplay = () => {
    if (match.homeGoals === null || match.awayGoals === null) return null

    const aueGoals = isAueHome ? match.homeGoals : match.awayGoals
    const opponentGoals = isAueHome ? match.awayGoals : match.homeGoals
    const isWin = aueGoals > opponentGoals
    const isDraw = aueGoals === opponentGoals
    const isLoss = aueGoals < opponentGoals

    return (
      <div className="flex items-center gap-3">
        <span
          className={cn(
            'text-2xl font-bold tabular-nums',
            isFinished && isWin && 'text-fc-win',
            isFinished && isDraw && 'text-fc-draw',
            isFinished && isLoss && 'text-fc-loss',
            !isFinished && 'text-fc-fg'
          )}
        >
          {match.homeGoals}:{match.awayGoals}
        </span>
      </div>
    )
  }

  const lastEventMinute = match.events?.length ? match.events[match.events.length - 1]?.minute : undefined
  const shareTitle = `${match.homeTeam.shortName || match.homeTeam.name} vs ${match.awayTeam.shortName || match.awayTeam.name}`
  const shareText = `${match.homeTeam.name} – ${match.awayTeam.name} · ${formatDate(match.kickoff)} ${formatKickoff(match.kickoff)} Uhr${match.venue ? ` · ${match.venue.name}` : ''}`

  return (
    <div className="group rounded-xl">
      <Card className="overflow-hidden transition-[transform,border-color,box-shadow] duration-200 hover:border-fc-violet/45 hover:shadow-lg hover:shadow-fc-violet/5">
        <CardContent className="p-0">
          <div className="flex flex-col lg:flex-row lg:items-stretch">
            <Link
              href={`/spiel/${match.id}`}
              className="block min-w-0 flex-1 rounded-xl p-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fc-violet focus-visible:ring-inset sm:p-5"
              aria-label={`Spiel öffnen: ${match.homeTeam.name} gegen ${match.awayTeam.name}${match.matchday ? `, ${match.matchday}. Spieltag` : ''}`}
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex min-w-0 flex-1 items-center gap-4">
                  <div className="flex w-24 flex-shrink-0 flex-col items-center gap-1 sm:items-start">
                    <span className="text-center text-xs font-medium text-fc-fg/60 sm:text-left">{formatMatchDay(match.kickoff)}</span>
                    <span className="text-lg font-bold text-fc-fg">{formatDate(match.kickoff)}</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      {match.matchday ? (
                        <Badge variant="outline" className="text-xs">
                          <Trophy className="mr-1 h-3 w-3" /> {match.matchday}. Spieltag
                        </Badge>
                      ) : null}
                      {getStatusBadge()}
                    </div>
                    <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-fc-fg/70">
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" /> {formatKickoff(match.kickoff)}
                      </span>
                      {match.venue ? (
                        <span className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" /> {match.venue.name}
                        </span>
                      ) : null}
                    </div>
                  </div>
                </div>

                <div className="flex flex-shrink-0 items-center gap-4 sm:min-w-[22rem] sm:justify-end">
                  <div className="min-w-0 flex-1 text-right">
                    <p className={cn('truncate font-medium', isAueHome ? 'text-fc-fg' : 'text-fc-fg/70')}>{match.homeTeam.name}</p>
                    <p className={cn('truncate font-medium', !isAueHome ? 'text-fc-fg' : 'text-fc-fg/70')}>{match.awayTeam.name}</p>
                  </div>

                  <div className="flex w-24 flex-col items-center gap-1">
                    {getResultDisplay() ?? <span className="text-sm text-fc-fg/50">vs</span>}
                    {isLive ? (
                      <Badge variant="destructive" className="text-xs">
                        <span className="relative mr-1.5 flex h-1.5 w-1.5">
                          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75"></span>
                          <span className="relative inline-flex h-full w-full rounded-full bg-red-500"></span>
                        </span>
                        {lastEventMinute ?? 0}&apos;
                      </Badge>
                    ) : null}
                  </div>

                  <div className="min-w-0 flex-1 text-left">
                    <p className={cn('truncate font-medium', isAueHome ? 'text-fc-fg/70' : 'text-fc-fg')}>
                      {match.homeTeam.shortName || match.homeTeam.name}
                    </p>
                    <p className={cn('truncate font-medium', !isAueHome ? 'text-fc-fg/70' : 'text-fc-fg')}>
                      {match.awayTeam.shortName || match.awayTeam.name}
                    </p>
                    {(community && community.total > 0) || myStatus ? (
                      <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-fc-fg/65">
                        {community && community.total > 0 ? (
                          <span className="inline-flex items-center gap-1 rounded-md border border-fc-border/70 bg-fc-bg/30 px-2 py-0.5">
                            <span className="font-semibold text-fc-win">{community.going}</span> dabei
                            {community.maybe > 0 ? <span className="text-fc-fg/55">· {community.maybe} evtl.</span> : null}
                          </span>
                        ) : null}
                        {myStatus ? (
                          <span className={cn('inline-flex items-center rounded-md border px-2 py-0.5 font-medium', myStatus === 'GOING' ? 'border-fc-win/30 bg-fc-win/10 text-fc-win' : myStatus === 'MAYBE' ? 'border-fc-draw/30 bg-fc-draw/10 text-fc-draw' : 'border-fc-loss/30 bg-fc-loss/10 text-fc-loss')}>
                            {myStatus === 'GOING' ? 'Du: Dabei' : myStatus === 'MAYBE' ? 'Du: Vielleicht' : 'Du: Nicht dabei'}
                          </span>
                        ) : null}
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
              {match.source ? (
                <p className="mt-3 border-t border-fc-border/60 pt-2 text-xs text-fc-fg/50">
                  Quelle: <span className="text-fc-fg/65">{match.source}</span>
                </p>
              ) : null}
            </Link>

            <div className="flex shrink-0 flex-row flex-wrap items-center gap-2 border-t border-fc-border/60 p-3 sm:p-4 lg:w-52 lg:flex-col lg:items-stretch lg:justify-center lg:border-l lg:border-t-0">
              <ShareAction
                title={shareTitle}
                text={shareText}
                url={`/spiel/${match.id}`}
                label="Teilen"
                compact
                className="justify-center lg:w-full"
              />
              <a
                href={`/api/v1/calendar/match/${match.id}`}
                download
                className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-fc-border bg-fc-bg/40 px-2.5 py-1.5 text-xs font-medium text-fc-fg transition-[border-color,background-color,color,box-shadow] duration-200 hover:border-fc-violet/40 hover:bg-fc-violet/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fc-violet focus-visible:ring-offset-2 focus-visible:ring-offset-fc-bg lg:w-full"
                aria-label={`Kalendereintrag für ${shareTitle} herunterladen`}
                title="Einzelspiel als .ics speichern"
              >
                <CalendarPlus className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Termin (.ics)</span>
              </a>
              <Link
                href={`/spiel/${match.id}`}
                className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-fc-violet/25 bg-fc-violet/10 px-2.5 py-1.5 text-xs font-medium text-fc-violet-light transition-colors hover:bg-fc-violet/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fc-violet focus-visible:ring-offset-2 focus-visible:ring-offset-fc-bg lg:w-full"
              >
                Details
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
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

export default async function SpielplanPage({
  searchParams,
}: {
  searchParams: Promise<{ timeframe?: string; location?: string }>
}) {
  const { timeframe = 'all', location = 'all' } = await searchParams
  const now = new Date()

  let matches: MatchDto[] = []
  let error: string | null = null
  let attendanceByMatch = new Map<string, { going: number; maybe: number; total: number }>()
  let myAttendanceByMatch = new Map<string, 'GOING' | 'MAYBE' | 'NOT_GOING'>()
  let syncMeta: { source: string; updatedAt: Date | null; stale: boolean; staleText: string | null; manualLabel?: string | null } = {
    source: 'OpenLigaDB (rlno) / Redaktion',
    updatedAt: null,
    stale: false,
    staleText: null,
  }

  const timeframeWhere =
    timeframe === 'upcoming'
      ? { kickoff: { gte: now } }
      : timeframe === 'past'
        ? { kickoff: { lt: now } }
        : {}

  const locationWhere =
    location === 'home'
      ? { homeTeam: { isOwn: true } }
      : location === 'away'
        ? { awayTeam: { isOwn: true } }
        : {}

  try {
    const session = await getServerSession()
    const [rows, syncLog] = await Promise.all([
      prisma.match.findMany({
        where: { ...timeframeWhere, ...locationWhere },
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
        orderBy: { kickoff: timeframe === 'past' ? 'desc' : 'asc' },
        take: 100,
      }),
      prisma.sourceSyncLog.findFirst({
        where: { source: 'openligadb' },
        orderBy: { createdAt: 'desc' },
        select: { createdAt: true, ok: true, message: true },
      }),
    ])

    matches = rows.map(toDto)

    const matchIds = rows.map((m) => m.id)
    if (matchIds.length > 0) {
      try {
        const [attGroups, myRows] = await Promise.all([
          prisma.attendance.groupBy({
            by: ['matchId', 'status'],
            where: { matchId: { in: matchIds } },
            _count: { _all: true },
          }),
          session?.user?.id
            ? prisma.attendance.findMany({
                where: { userId: session.user.id, matchId: { in: matchIds } },
                select: { matchId: true, status: true },
              })
            : Promise.resolve([]),
        ])
        for (const g of attGroups) {
          const prev = attendanceByMatch.get(g.matchId) ?? { going: 0, maybe: 0, total: 0 }
          const c = g._count._all
          prev.total += c
          if (g.status === 'GOING') prev.going += c
          else if (g.status === 'MAYBE') prev.maybe += c
          attendanceByMatch.set(g.matchId, prev)
        }
        for (const r of myRows) {
          if (r.status === 'GOING' || r.status === 'MAYBE' || r.status === 'NOT_GOING') {
            myAttendanceByMatch.set(r.matchId, r.status)
          }
        }
      } catch (e) {
        console.error('Spielplan attendance load error', e)
      }
    }
    const syncDate = syncLog?.createdAt ?? null
    const staleText = staleLabel(syncDate, 'openligadb')
    syncMeta = {
      source: 'OpenLigaDB (rlno), mit manuellen Korrekturen möglich',
      updatedAt: syncDate,
      stale: !!staleText,
      staleText,
      manualLabel: syncLog && !syncLog.ok ? 'Letzter Sync mit Fehler' : null,
    }
  } catch (e) {
    error = 'Spielplan konnte nicht geladen werden. Bitte versuche es später erneut.'
    console.error('Spielplan load error', e)
  }

  const timeframeFilters = [
    { value: 'all', label: 'Alle Spiele' },
    { value: 'upcoming', label: 'Kommende' },
    { value: 'past', label: 'Vergangene' },
  ] as const

  const locationFilters = [
    { value: 'all', label: 'Heim & Auswärts' },
    { value: 'home', label: 'Nur Heim' },
    { value: 'away', label: 'Nur Auswärts' },
  ] as const

  function buildHref(next: { timeframe?: string; location?: string }) {
    const params = new URLSearchParams()
    const tf = next.timeframe ?? timeframe
    const loc = next.location ?? location
    if (tf && tf !== 'all') params.set('timeframe', tf)
    if (loc && loc !== 'all') params.set('location', loc)
    const qs = params.toString()
    return qs ? `/spielplan?${qs}` : '/spielplan'
  }

  const finishedAue = matches.filter((m) => m.status === 'FINISHED' && m.homeGoals !== null && m.awayGoals !== null)
  const summary = finishedAue.reduce(
    (acc, m) => {
      const aueGoals = m.homeTeam.isOwn ? (m.homeGoals ?? 0) : (m.awayGoals ?? 0)
      const oppGoals = m.homeTeam.isOwn ? (m.awayGoals ?? 0) : (m.homeGoals ?? 0)
      if (aueGoals > oppGoals) acc.wins += 1
      else if (aueGoals === oppGoals) acc.draws += 1
      else acc.losses += 1
      return acc
    },
    { wins: 0, draws: 0, losses: 0 },
  )

  return (
    <div className="min-h-screen bg-fc-bg">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-fc-fg md:text-4xl">Spielplan</h1>
            <p className="mt-2 text-fc-fg/70">Alle Spiele der aktuellen Saison – Regionalliga Nordost</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <a
              href="/api/v1/calendar/aue.ics"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-fc-violet/30 bg-fc-violet/10 px-4 text-sm font-medium text-fc-fg transition-colors hover:border-fc-violet/45 hover:bg-fc-violet/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fc-violet focus-visible:ring-offset-2 focus-visible:ring-offset-fc-bg"
              download
            >
              <CalendarPlus className="h-4 w-4" aria-hidden="true" />
              Nächste Termine (.ics)
            </a>
            <a
              href="/api/v1/calendar/aue.ics?scope=all"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-fc-border bg-fc-surface/60 px-4 text-sm font-medium text-fc-fg transition-colors hover:border-fc-violet/35 hover:bg-fc-violet/10"
              download
            >
              Saison (.ics)
            </a>
          </div>
        </div>

        <div className="mb-6">
          <DataMeta
            source={syncMeta.source}
            updatedAt={syncMeta.updatedAt}
            stale={syncMeta.stale}
            staleLabel={syncMeta.staleText || 'Datenstand evtl. veraltet'}
            manualLabel={syncMeta.manualLabel}
            capabilityLabel="Spielplan/Ergebnisse je nach Quelle; Live-Events nicht garantiert"
            capabilityTone="info"
            note="Kurzfristige Änderungen (Verlegung, Ort, Status) sind möglich. Bei Abweichungen gelten offizielle Vereins-/Verbandsmeldungen; redaktionelle Korrekturen werden transparent gekennzeichnet."
          />
        </div>

        <div className="mb-6 space-y-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="grid flex-1 gap-4 sm:grid-cols-2">
              <div className="flex min-w-0 flex-col gap-1.5">
                <span className="text-sm font-medium text-fc-fg/80">Zeitraum</span>
                <div className="flex flex-wrap gap-2" role="group" aria-label="Zeitraum filtern">
                  {timeframeFilters.map((f) => {
                    const active = timeframe === f.value
                    return (
                      <Link
                        key={f.value}
                        href={buildHref({ timeframe: f.value })}
                        className={cn(
                          'inline-flex h-11 items-center rounded-lg px-4 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fc-violet focus-visible:ring-offset-2 focus-visible:ring-offset-fc-bg',
                          active
                            ? 'bg-fc-violet text-white shadow-sm shadow-fc-violet/20'
                            : 'border border-fc-border bg-fc-surface text-fc-fg hover:border-fc-violet/35 hover:bg-fc-violet/10'
                        )}
                        aria-current={active ? 'true' : undefined}
                      >
                        {f.label}
                      </Link>
                    )
                  })}
                </div>
              </div>

              <div className="flex min-w-0 flex-col gap-1.5">
                <span className="text-sm font-medium text-fc-fg/80">Spielort</span>
                <div className="flex flex-wrap gap-2" role="group" aria-label="Spielort filtern">
                  {locationFilters.map((f) => {
                    const active = location === f.value
                    return (
                      <Link
                        key={f.value}
                        href={buildHref({ location: f.value })}
                        className={cn(
                          'inline-flex h-11 items-center rounded-lg px-4 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fc-violet focus-visible:ring-offset-2 focus-visible:ring-offset-fc-bg',
                          active
                            ? 'bg-fc-violet text-white shadow-sm shadow-fc-violet/20'
                            : 'border border-fc-border bg-fc-surface text-fc-fg hover:border-fc-violet/35 hover:bg-fc-violet/10'
                        )}
                        aria-current={active ? 'true' : undefined}
                      >
                        {f.label}
                      </Link>
                    )
                  })}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 text-sm text-fc-fg/70">
              <span className="inline-flex items-center gap-2 rounded-lg border border-fc-border/70 bg-fc-surface/60 px-3 py-2">
                <Calendar className="h-4 w-4" aria-hidden="true" />
                <span className="font-medium text-fc-fg">{matches.length}</span>
                <span>{matches.length === 1 ? 'Spiel' : 'Spiele'}</span>
              </span>
              {finishedAue.length > 0 ? (
                <span className="inline-flex items-center gap-2 rounded-lg border border-fc-border/70 bg-fc-surface/60 px-3 py-2">
                  <span className="text-fc-win font-semibold">{summary.wins}S</span>
                  <span className="text-fc-draw font-semibold">{summary.draws}U</span>
                  <span className="text-fc-loss font-semibold">{summary.losses}N</span>
                  <span className="text-fc-fg/55">in Auswahl</span>
                </span>
              ) : null}
              <span className="inline-flex items-center gap-2 rounded-lg border border-fc-border/70 bg-fc-surface/40 px-3 py-2 text-xs text-fc-fg/60">
                <Link href="/quellen" className="font-medium text-fc-violet hover:text-fc-violet-light underline-offset-2 hover:underline">
                  Quellen & Transparenz
                </Link>
              </span>
            </div>
          </div>
        </div>

        {error ? (
          <div className="flex items-center gap-3 rounded-xl border border-fc-loss/30 bg-fc-loss/10 p-5 text-fc-loss" role="alert">
            <AlertCircle className="h-5 w-5 shrink-0" aria-hidden="true" />
            <p className="text-sm font-medium">{error}</p>
          </div>
        ) : matches.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-fc-border/70 bg-fc-surface/40 py-16 text-center text-fc-fg/70">
            <SearchX className="h-10 w-10 text-fc-fg/40" aria-hidden="true" />
            <p className="text-base font-medium text-fc-fg">Keine Spiele gefunden</p>
            <p className="max-w-md text-sm text-fc-fg/60">
              Für die gewählten Filter sind aktuell keine Spiele hinterlegt. Passe Zeitraum/Spielort an oder synchronisiere Spieldaten im Admin-Bereich.
            </p>
          </div>
        ) : (
          <div className="space-y-4" id="matches-list">
            {matches.map((match) => (
              <MatchCard
                key={match.id}
                match={match}
                community={attendanceByMatch.get(match.id) ?? null}
                myStatus={myAttendanceByMatch.get(match.id) ?? null}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}