import { Metadata } from 'next'
import Link from 'next/link'
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  BarChart3,
  Brain,
  Building,
  Calendar,
  CheckCircle,
  Clock,
  ExternalLink,
  Heart,
  History,
  MapPin,
  Newspaper,
  Swords,
  Ticket,
  Trophy,
  Tv,
  Users,
  type LucideIcon,
} from 'lucide-react'
import { prisma } from '@kumpelapp/db'
import { Badge, Card, CardContent, CardHeader, CardTitle } from '@kumpelapp/ui'
import { cn, formatDate, formatDateTime, formatKickoff } from '@kumpelapp/utils'
import { Footer } from '@/components/footer'
import { Header } from '@/components/header'
import { OfflineBanner } from '@/components/offline-banner'
import { TodayInAueHistoryCard } from '@/components/today-in-aue-history'
import { getServerSession } from '@/lib/auth-server'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Startseite',
  description: 'KumpelApp - Deine Fan-App für den FC Erzgebirge Aue. Spieltag, Tabelle, Kader, News und mehr.',
}

const features = [
  { name: 'Stadionmodus', href: '/stadionmodus', icon: Activity, description: 'Alles zum nächsten Spieltag auf einen Blick' },
  { name: 'Spieltag', href: '/spielplan', icon: Calendar, description: 'Alle Spiele, Termine & Ergebnisse' },
  { name: 'Tabelle', href: '/tabelle', icon: Trophy, description: 'Aktuelle Regionalliga Nordost Tabelle' },
  { name: 'Saison', href: '/saison', icon: BarChart3, description: 'Ergebnisse, Formkurve & Saisonbilanz' },
  { name: 'Bilanz', href: '/gegner', icon: Swords, description: 'Aues Bilanz gegen alle Gegner' },
  { name: 'Kader', href: '/kader', icon: Users, description: 'Spieler, Positionen & Statistiken' },
  { name: 'News', href: '/news', icon: Newspaper, description: 'Aktuelle Nachrichten vom Verein' },
  { name: 'Auswärts', href: '/auswaerts', icon: MapPin, description: 'Stadion-Guide & Anfahrtsinfos' },
  { name: 'Kalender', href: '/kalender', icon: Calendar, description: 'Spieltermine als iCal abonnieren' },
  { name: 'Verein', href: '/verein', icon: Building, description: 'Teams, Abteilungen & Mitgliedschaft' },
  { name: 'Tradition', href: '/tradition', icon: History, description: 'Titel, Legenden & Chronik' },
  { name: 'Quiz', href: '/quiz', icon: Brain, description: 'Veilchen-Wissen testen & Serien sammeln' },
  { name: 'Fans', href: '/fans', icon: Heart, description: 'Fanclubs, Fanbeauftragter & KidsClub' },
]

const quickLinks = [
  { name: 'Tickets', href: 'https://customer59.ticketing.cloud.sap/shop?shopid=103', external: true, icon: AlertTriangle },
  { name: 'Fanshop', href: 'https://www.fc-erzgebirge.shop', external: true, icon: Heart },
  { name: 'Offizielle Website', href: 'https://www.fc-erzgebirge.de', external: true, icon: CheckCircle },
]

type MatchTeam = { name: string; shortName: string | null; isOwn: boolean }

function teamLabel(t: MatchTeam) {
  return t.shortName || t.name
}

function countdownText(kickoff: Date, now: Date) {
  const diffMs = kickoff.getTime() - now.getTime()
  if (diffMs <= 0) return 'Anpfiff steht an'
  const totalMinutes = Math.floor(diffMs / 60000)
  const days = Math.floor(totalMinutes / (60 * 24))
  const hours = Math.floor((totalMinutes % (60 * 24)) / 60)
  const minutes = totalMinutes % 60
  if (days > 0) return `in ${days} ${days === 1 ? 'Tag' : 'Tagen'}${hours > 0 ? `, ${hours} Std.` : ''}`
  if (hours > 0) return `in ${hours} Std.${minutes > 0 ? ` ${minutes} Min.` : ''}`
  return `in ${minutes} Min.`
}

function resultForAue(homeGoals: number | null, awayGoals: number | null, homeIsOwn: boolean) {
  if (homeGoals === null || awayGoals === null) return null
  const aue = homeIsOwn ? homeGoals : awayGoals
  const opp = homeIsOwn ? awayGoals : homeGoals
  if (aue > opp) return { key: 'W' as const, label: 'Sieg', className: 'border-fc-win/30 bg-fc-win/10 text-fc-win' }
  if (aue === opp) return { key: 'D' as const, label: 'Remis', className: 'border-fc-draw/30 bg-fc-draw/10 text-fc-draw' }
  return { key: 'L' as const, label: 'Niederlage', className: 'border-fc-loss/30 bg-fc-loss/10 text-fc-loss' }
}

export default async function HomePage() {
  const now = new Date()
  let nextMatch: {
    id: string
    kickoff: Date
    status: string
    homeTeam: string
    awayTeam: string
    homeIsOwn: boolean
    venue?: string | null
    matchday: number | null
    ticketShopUrl?: string | null
    streams: { name: string; url: string }[]
  } | null = null
  let lastMatch: {
    id: string
    kickoff: Date
    status: string
    homeTeam: string
    awayTeam: string
    homeGoals: number | null
    awayGoals: number | null
    homeIsOwn: boolean
  } | null = null
  let recentResults: {
    id: string
    kickoff: Date
    homeTeam: MatchTeam
    awayTeam: MatchTeam
    homeGoals: number | null
    awayGoals: number | null
  }[] = []
  let upcomingMatches: {
    id: string
    kickoff: Date
    status: string
    homeTeam: MatchTeam
    awayTeam: MatchTeam
    venue?: string | null
    matchday: number | null
  }[] = []
  let aueStanding: { position: number; points: number; played: number; league: string; season?: string | null } | null = null
  let latestNews: { id: string; title: string; publishedAt: Date; source: string; externalUrl: string }[] = []
  let attendanceByMatch = new Map<string, { going: number; maybe: number; total: number }>()
  let nextMatchMyTip: { homeGoals: number; awayGoals: number } | null = null
  let nextMatchMyAttendance: 'GOING' | 'MAYBE' | 'NOT_GOING' | null = null
  let isLoggedIn = false

  try {
    const session = await getServerSession()
    isLoggedIn = !!session?.user?.id
    const [upcoming, finished, recent, upcomingList, aueRow, news] = await Promise.all([
      prisma.match.findFirst({
        where: {
          kickoff: { gte: new Date(now.getTime() - 3 * 60 * 60 * 1000) },
          status: { in: ['SCHEDULED', 'LIVE', 'POSTPONED'] },
          OR: [{ homeTeam: { isOwn: true } }, { awayTeam: { isOwn: true } }],
        },
        include: {
          homeTeam: { select: { name: true, shortName: true, isOwn: true } },
          awayTeam: { select: { name: true, shortName: true, isOwn: true } },
          venue: { select: { name: true } },
          sales: { take: 1, orderBy: { saleStart: 'asc' }, select: { shopUrl: true } },
          streams: { select: { name: true, url: true } },
        },
        orderBy: { kickoff: 'asc' },
      }),
      prisma.match.findFirst({
        where: {
          kickoff: { lt: now },
          status: 'FINISHED',
          OR: [{ homeTeam: { isOwn: true } }, { awayTeam: { isOwn: true } }],
        },
        include: {
          homeTeam: { select: { name: true, shortName: true, isOwn: true } },
          awayTeam: { select: { name: true, shortName: true, isOwn: true } },
        },
        orderBy: { kickoff: 'desc' },
      }),
      prisma.match.findMany({
        where: {
          kickoff: { lt: now },
          status: 'FINISHED',
          OR: [{ homeTeam: { isOwn: true } }, { awayTeam: { isOwn: true } }],
        },
        include: {
          homeTeam: { select: { name: true, shortName: true, isOwn: true } },
          awayTeam: { select: { name: true, shortName: true, isOwn: true } },
        },
        orderBy: { kickoff: 'desc' },
        take: 5,
      }),
      prisma.match.findMany({
        where: {
          kickoff: { gte: new Date(now.getTime() - 3 * 60 * 60 * 1000) },
          status: { in: ['SCHEDULED', 'LIVE', 'POSTPONED'] },
          OR: [{ homeTeam: { isOwn: true } }, { awayTeam: { isOwn: true } }],
        },
        include: {
          homeTeam: { select: { name: true, shortName: true, isOwn: true } },
          awayTeam: { select: { name: true, shortName: true, isOwn: true } },
          venue: { select: { name: true } },
        },
        orderBy: { kickoff: 'asc' },
        take: 4,
      }),
      prisma.standing.findFirst({
        where: { team: { isOwn: true } },
        include: { team: { select: { name: true } }, league: { include: { season: true } } },
        orderBy: [{ league: { season: { startYear: 'desc' } } }, { position: 'asc' }],
      }),
      prisma.newsItem.findMany({
        orderBy: { publishedAt: 'desc' },
        take: 3,
        select: { id: true, title: true, publishedAt: true, source: true, externalUrl: true },
      }),
    ])

    if (upcoming) {
      nextMatch = {
        id: upcoming.id,
        kickoff: upcoming.kickoff,
        status: upcoming.status,
        homeTeam: teamLabel(upcoming.homeTeam),
        awayTeam: teamLabel(upcoming.awayTeam),
        homeIsOwn: upcoming.homeTeam.isOwn,
        venue: upcoming.venue?.name ?? null,
        matchday: upcoming.matchday,
        ticketShopUrl: upcoming.sales[0]?.shopUrl ?? null,
        streams: upcoming.streams ?? [],
      }
    }
    if (finished) {
      lastMatch = {
        id: finished.id,
        kickoff: finished.kickoff,
        status: finished.status,
        homeTeam: teamLabel(finished.homeTeam),
        awayTeam: teamLabel(finished.awayTeam),
        homeGoals: finished.homeGoals,
        awayGoals: finished.awayGoals,
        homeIsOwn: finished.homeTeam.isOwn,
      }
    }
    recentResults = recent.map((m) => ({
      id: m.id,
      kickoff: m.kickoff,
      homeTeam: m.homeTeam,
      awayTeam: m.awayTeam,
      homeGoals: m.homeGoals,
      awayGoals: m.awayGoals,
    }))
    upcomingMatches = upcomingList.map((m) => ({
      id: m.id,
      kickoff: m.kickoff,
      status: m.status,
      homeTeam: m.homeTeam,
      awayTeam: m.awayTeam,
      venue: m.venue?.name ?? null,
      matchday: m.matchday,
    }))
    if (aueRow) {
      aueStanding = {
        position: aueRow.position,
        points: aueRow.points,
        played: aueRow.played,
        league: aueRow.league.name,
        season: aueRow.league.season?.label ?? null,
      }
    }
    latestNews = news

    const attendanceIds = Array.from(new Set([...(upcoming ? [upcoming.id] : []), ...upcomingList.map((m) => m.id)]))
    if (attendanceIds.length > 0) {
      try {
        const attGroups = await prisma.attendance.groupBy({
          by: ['matchId', 'status'],
          where: { matchId: { in: attendanceIds } },
          _count: { _all: true },
        })
        for (const g of attGroups) {
          const prev = attendanceByMatch.get(g.matchId) ?? { going: 0, maybe: 0, total: 0 }
          const c = g._count._all
          prev.total += c
          if (g.status === 'GOING') prev.going += c
          else if (g.status === 'MAYBE') prev.maybe += c
          attendanceByMatch.set(g.matchId, prev)
        }
      } catch (attErr) {
        console.error('Home attendance load error', attErr)
      }
    }

    if (session?.user?.id && upcoming?.id) {
      try {
        const [myTip, myAtt] = await Promise.all([
          prisma.tip.findUnique({ where: { userId_matchId: { userId: session.user.id, matchId: upcoming.id } }, select: { homeGoals: true, awayGoals: true } }),
          prisma.attendance.findUnique({ where: { userId_matchId: { userId: session.user.id, matchId: upcoming.id } }, select: { status: true } }),
        ])
        nextMatchMyTip = myTip ? { homeGoals: myTip.homeGoals, awayGoals: myTip.awayGoals } : null
        nextMatchMyAttendance = (myAtt?.status as any) ?? null
      } catch (e) {
        console.error('Home personal next-match load error', e)
      }
    }
  } catch (e) {
    console.error('Home data load error', e)
  }

  const countdown = nextMatch ? countdownText(nextMatch.kickoff, now) : null
  const moreUpcoming = upcomingMatches.filter((m) => m.id !== nextMatch?.id).slice(0, 3)

  return (
    <>
      <OfflineBanner />
      <Header />
      <main id="main-content" className="flex-1">
        <section className="relative isolate overflow-hidden bg-gradient-to-b from-fc-violet/[0.12] via-fc-bg to-fc-bg py-16 sm:py-20 md:py-28">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 -top-24 -z-10 flex justify-center blur-3xl"
          >
            <div className="h-56 w-[min(42rem,90vw)] rounded-full bg-gradient-to-r from-fc-violet/25 via-fc-violet-light/15 to-fc-violet/20 opacity-70" />
          </div>
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 right-0 -z-10 hidden w-1/2 bg-[radial-gradient(ellipse_at_top_right,rgba(124,63,191,0.18),transparent_55%)] lg:block"
          />

          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl text-center">
              <p className="inline-flex items-center rounded-full border border-fc-violet/25 bg-fc-violet/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-fc-violet-light shadow-sm shadow-fc-violet/5">
                {aueStanding?.league ?? 'Regionalliga Nordost'}
                {aueStanding?.season ? ` · ${aueStanding.season}` : ' · Saison 2026/27'}
              </p>
              <h1 className="mt-5 text-4xl font-bold tracking-tight text-fc-fg sm:text-5xl md:text-6xl">
                <span className="bg-gradient-to-r from-fc-violet-light via-fc-violet to-fc-violet-light bg-clip-text text-transparent">
                  Kumpel
                </span>
                App
              </h1>
              <p className="mt-6 text-base leading-relaxed text-fc-fg/70 sm:text-lg md:text-xl">
                Deine Fan-App für den FC Erzgebirge Aue: Spieltag, Tabelle, Kader, News, Tickets, Tippspiel und Tradition – schnell, übersichtlich und mobil optimiert.
              </p>
              <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
                <Link
                  href="/spielplan"
                  className="inline-flex w-full items-center justify-center rounded-xl bg-fc-violet px-7 py-3 text-base font-semibold text-white shadow-sm shadow-fc-violet/20 ring-1 ring-inset ring-white/10 transition-[background-color,box-shadow,transform] duration-200 hover:bg-fc-violet-dark hover:shadow-lg hover:shadow-fc-violet/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fc-violet focus-visible:ring-offset-2 focus-visible:ring-offset-fc-bg active:scale-[0.98] sm:w-auto"
                >
                  Zum Spieltag
                </Link>
                <Link
                  href="/tabelle"
                  className="inline-flex w-full items-center justify-center rounded-xl border border-fc-violet/30 bg-fc-violet/10 px-7 py-3 text-base font-semibold text-fc-fg transition-[background-color,border-color,box-shadow,transform] duration-200 hover:border-fc-violet/45 hover:bg-fc-violet/15 hover:shadow-sm hover:shadow-fc-violet/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fc-violet focus-visible:ring-offset-2 focus-visible:ring-offset-fc-bg active:scale-[0.98] sm:w-auto"
                >
                  Tabelle ansehen
                </Link>
              </div>
            </div>

            <dl className="mx-auto mt-14 grid max-w-5xl grid-cols-1 gap-4 sm:mt-16 sm:grid-cols-3 sm:gap-5">
              <StatCard label="Liga" value={aueStanding?.league ?? 'Regionalliga Nordost'} icon={Trophy} />
              <StatCard
                label="Tabellenplatz"
                value={aueStanding ? `${aueStanding.position}. Platz · ${aueStanding.points} Pkt` : 'Noch keine Daten'}
                icon={Calendar}
              />
              <StatCard label="Stadion" value="Sparkassen-Erzgebirgsstadion" icon={MapPin} />
            </dl>
          </div>
        </section>

        <section className="border-y border-fc-border/70 bg-fc-surface/40 py-12 sm:py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-8 flex items-end justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-fc-fg sm:text-3xl">Live-Überblick</h2>
                <p className="mt-1 text-sm text-fc-fg/65">Matchday-Center: Nächstes Spiel, Ergebnis, News und ein Blick in die Veilchen-Geschichte</p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
              <Card className="border-fc-violet/25 bg-gradient-to-b from-fc-violet/[0.08] to-card">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center justify-between gap-2 text-lg">
                    <span className="flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-fc-violet" aria-hidden="true" /> Nächstes Spiel
                    </span>
                    {countdown ? (
                      <span className="rounded-full border border-fc-violet/25 bg-fc-violet/10 px-2.5 py-1 text-xs font-semibold text-fc-violet-light">
                        {countdown}
                      </span>
                    ) : null}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {nextMatch ? (
                    <div className="space-y-3">
                      <Link
                        href={`/spiel/${nextMatch.id}`}
                        className="group block rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fc-violet"
                      >
                        <div className="flex flex-wrap items-center gap-2">
                          {nextMatch.matchday ? <Badge variant="outline">{nextMatch.matchday}. Spieltag</Badge> : null}
                          <Badge variant={nextMatch.status === 'LIVE' ? 'destructive' : 'secondary'}>
                            {nextMatch.status === 'LIVE' ? 'LIVE' : nextMatch.homeIsOwn ? 'Heim' : 'Auswärts'}
                          </Badge>
                        </div>
                        <p className="mt-2 text-lg font-semibold text-fc-fg group-hover:text-fc-violet-light">
                          {nextMatch.homeTeam} – {nextMatch.awayTeam}
                        </p>
                        <p className="mt-1 flex items-center gap-2 text-sm text-fc-fg/70">
                          <Clock className="h-4 w-4" aria-hidden="true" />
                          {formatDate(nextMatch.kickoff)} · {formatKickoff(nextMatch.kickoff)} Uhr
                        </p>
                        {nextMatch.venue ? <p className="mt-1 text-sm text-fc-fg/60">{nextMatch.venue}</p> : null}
                        {(() => {
                          const att = attendanceByMatch.get(nextMatch.id)
                          if (!att || att.total === 0) return null
                          return (
                            <p className="mt-2 inline-flex items-center rounded-md border border-fc-border/70 bg-fc-bg/30 px-2 py-1 text-xs text-fc-fg/75">
                              <span className="font-semibold text-fc-win">{att.going}</span>&nbsp;dabei{att.maybe > 0 ? <span className="text-fc-fg/55"> · {att.maybe} vielleicht</span> : null}
                              <span className="ml-1 text-fc-fg/50">· Community-Check-in</span>
                            </p>
                          )
                        })()}
                      </Link>
                      {isLoggedIn ? (
                        <div className="rounded-lg border border-fc-violet/20 bg-fc-violet/5 p-2.5">
                          <p className="text-xs font-semibold uppercase tracking-wide text-fc-fg/55">Deine Aktionen</p>
                          <div className="mt-1.5 flex flex-wrap gap-2 text-xs">
                            <span className={cn('rounded-md border px-2 py-0.5 font-medium', nextMatchMyTip ? 'border-fc-win/30 bg-fc-win/10 text-fc-win' : 'border-fc-draw/30 bg-fc-draw/10 text-fc-draw')}>
                              {nextMatchMyTip ? `Tipp: ${nextMatchMyTip.homeGoals}:${nextMatchMyTip.awayGoals}` : 'Tipp offen'}
                            </span>
                            <span className={cn('rounded-md border px-2 py-0.5 font-medium', nextMatchMyAttendance ? 'border-fc-win/30 bg-fc-win/10 text-fc-win' : 'border-fc-draw/30 bg-fc-draw/10 text-fc-draw')}>
                              {nextMatchMyAttendance === 'GOING' ? 'Check-in: Dabei' : nextMatchMyAttendance === 'MAYBE' ? 'Check-in: Vielleicht' : nextMatchMyAttendance === 'NOT_GOING' ? 'Check-in: Nicht dabei' : 'Check-in offen'}
                            </span>
                          </div>
                          <div className="mt-2 flex flex-wrap gap-2">
                            <Link href="/tippspiel" className="text-xs font-medium text-fc-violet hover:underline">Tippspiel</Link>
                            <span className="text-fc-fg/30">·</span>
                            <Link href={`/spiel/${nextMatch.id}`} className="text-xs font-medium text-fc-violet hover:underline">Check-in setzen</Link>
                          </div>
                        </div>
                      ) : null}
                      <div className="flex flex-wrap gap-2 pt-1">
                        {nextMatch.ticketShopUrl ? (
                          <a
                            href={nextMatch.ticketShopUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 rounded-lg border border-fc-border bg-fc-bg/40 px-3 py-1.5 text-xs font-medium text-fc-fg hover:border-fc-violet/40 hover:bg-fc-violet/10"
                          >
                            <Ticket className="h-3.5 w-3.5" aria-hidden="true" /> Tickets <ExternalLink className="h-3 w-3" aria-hidden="true" />
                          </a>
                        ) : null}
                        {nextMatch.streams[0] ? (
                          <a
                            href={nextMatch.streams[0].url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 rounded-lg border border-fc-border bg-fc-bg/40 px-3 py-1.5 text-xs font-medium text-fc-fg hover:border-fc-violet/40 hover:bg-fc-violet/10"
                          >
                            <Tv className="h-3.5 w-3.5" aria-hidden="true" /> Stream <ExternalLink className="h-3 w-3" aria-hidden="true" />
                          </a>
                        ) : null}
                        <Link
                          href={`/spiel/${nextMatch.id}`}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-fc-violet/25 bg-fc-violet/10 px-3 py-1.5 text-xs font-medium text-fc-violet-light hover:bg-fc-violet/15"
                        >
                          Match-Center <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                        </Link>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-fc-fg/60">
                      Kein kommendes Spiel in der Datenbank.{' '}
                      <Link href="/spielplan" className="text-fc-violet hover:underline">
                        Zum Spielplan
                      </Link>
                    </p>
                  )}
                </CardContent>
              </Card>

              <Card className="border-fc-border/70">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Trophy className="h-5 w-5 text-fc-violet" aria-hidden="true" /> Letztes Ergebnis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {lastMatch ? (
                    <Link
                      href={`/spiel/${lastMatch.id}`}
                      className="group block rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fc-violet"
                    >
                      <p className="text-lg font-semibold text-fc-fg group-hover:text-fc-violet-light">
                        {lastMatch.homeTeam} – {lastMatch.awayTeam}
                      </p>
                      <p className="mt-2 text-3xl font-bold tabular-nums text-fc-fg">
                        {lastMatch.homeGoals ?? '-'}:{lastMatch.awayGoals ?? '-'}
                      </p>
                      <p className="mt-1 text-sm text-fc-fg/60">{formatDate(lastMatch.kickoff)}</p>
                      {(() => {
                        const res = resultForAue(lastMatch.homeGoals, lastMatch.awayGoals, lastMatch.homeIsOwn)
                        return res ? (
                          <span className={cn('mt-2 inline-flex rounded-md border px-2 py-0.5 text-xs font-semibold', res.className)}>
                            {res.label}
                          </span>
                        ) : null
                      })()}
                    </Link>
                  ) : aueStanding ? (
                    <div>
                      <p className="text-3xl font-bold text-fc-fg">{aueStanding.position}. Platz</p>
                      <p className="mt-1 text-sm text-fc-fg/70">
                        {aueStanding.points} Punkte nach {aueStanding.played} Spielen
                      </p>
                      <Link
                        href="/tabelle"
                        className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-fc-violet hover:text-fc-violet-light"
                      >
                        Zur Tabelle <ArrowRight className="h-4 w-4" aria-hidden="true" />
                      </Link>
                    </div>
                  ) : (
                    <p className="text-sm text-fc-fg/60">
                      Noch keine Ergebnisse verfügbar.{' '}
                      <Link href="/tabelle" className="text-fc-violet hover:underline">
                        Tabelle ansehen
                      </Link>
                    </p>
                  )}
                </CardContent>
              </Card>

              <Card className="border-fc-border/70">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Newspaper className="h-5 w-5 text-fc-violet" aria-hidden="true" /> Aktuelle News
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {latestNews.length ? (
                    <ul className="space-y-3">
                      {latestNews.map((n) => (
                        <li key={n.id} className="border-b border-fc-border/60 pb-3 last:border-0 last:pb-0">
                          <a
                            href={n.externalUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group block rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fc-violet"
                          >
                            <p className="line-clamp-2 text-sm font-medium text-fc-fg group-hover:text-fc-violet-light">{n.title}</p>
                            <p className="mt-1 text-xs text-fc-fg/55">{formatDateTime(n.publishedAt)}</p>
                          </a>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-fc-fg/60">
                      Noch keine News in der Datenbank.{' '}
                      <Link href="/news" className="text-fc-violet hover:underline">
                        News-Bereich öffnen
                      </Link>
                    </p>
                  )}
                  <Link
                    href="/news"
                    className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-fc-violet hover:text-fc-violet-light"
                  >
                    Alle News <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Link>
                </CardContent>
              </Card>

              <TodayInAueHistoryCard compact />
            </div>

            {(recentResults.length > 0 || moreUpcoming.length > 0) && (
              <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-2">
                <Card className="border-fc-border/70">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Activity className="h-5 w-5 text-fc-violet" aria-hidden="true" /> Form & letzte Ergebnisse
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {recentResults.length ? (
                      <div className="space-y-3">
                        <div className="flex flex-wrap gap-2" aria-label="Form der letzten Spiele">
                          {recentResults.slice(0, 5).map((m) => {
                            const res = resultForAue(m.homeGoals, m.awayGoals, m.homeTeam.isOwn)
                            if (!res) return null
                            return (
                              <Link
                                key={m.id}
                                href={`/spiel/${m.id}`}
                                title={`${teamLabel(m.homeTeam)} ${m.homeGoals}:${m.awayGoals} ${teamLabel(m.awayTeam)}`}
                                className={cn(
                                  'inline-flex h-9 w-9 items-center justify-center rounded-lg border text-sm font-bold transition-colors hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fc-violet',
                                  res.className,
                                )}
                                aria-label={`${res.label}: ${teamLabel(m.homeTeam)} ${m.homeGoals}:${m.awayGoals} ${teamLabel(m.awayTeam)}`}
                              >
                                {res.key === 'W' ? 'S' : res.key}
                              </Link>
                            )
                          })}
                        </div>
                        <ul className="space-y-2 pt-1">
                          {recentResults.slice(0, 3).map((m) => {
                            const res = resultForAue(m.homeGoals, m.awayGoals, m.homeTeam.isOwn)
                            return (
                              <li key={m.id}>
                                <Link
                                  href={`/spiel/${m.id}`}
                                  className="flex items-center justify-between gap-3 rounded-lg border border-fc-border/60 bg-fc-bg/20 px-3 py-2 text-sm transition-colors hover:border-fc-violet/35 hover:bg-fc-violet/5"
                                >
                                  <span className="min-w-0 truncate text-fc-fg">
                                    {teamLabel(m.homeTeam)} – {teamLabel(m.awayTeam)}
                                  </span>
                                  <span className="flex shrink-0 items-center gap-2">
                                    <span className="font-bold tabular-nums text-fc-fg">
                                      {m.homeGoals}:{m.awayGoals}
                                    </span>
                                    {res ? (
                                      <span className={cn('rounded border px-1.5 py-0.5 text-[11px] font-semibold', res.className)}>
                                        {res.key === 'W' ? 'S' : res.key}
                                      </span>
                                    ) : null}
                                  </span>
                                </Link>
                              </li>
                            )
                          })}
                        </ul>
                        <Link
                          href="/saison"
                          className="inline-flex items-center gap-1 pt-1 text-sm font-medium text-fc-violet hover:text-fc-violet-light"
                        >
                          Zum Saisonverlauf <ArrowRight className="h-4 w-4" aria-hidden="true" />
                        </Link>
                      </div>
                    ) : (
                      <p className="text-sm text-fc-fg/60">Noch keine abgeschlossenen Ergebnisse.</p>
                    )}
                  </CardContent>
                </Card>

                <Card className="border-fc-border/70">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Calendar className="h-5 w-5 text-fc-violet" aria-hidden="true" /> Nächste Termine
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {moreUpcoming.length ? (
                      <ul className="space-y-2">
                        {moreUpcoming.map((m) => (
                          <li key={m.id}>
                            <Link
                              href={`/spiel/${m.id}`}
                              className="flex items-center justify-between gap-3 rounded-lg border border-fc-border/60 bg-fc-bg/20 px-3 py-2 text-sm transition-colors hover:border-fc-violet/35 hover:bg-fc-violet/5"
                            >
                              <div className="min-w-0">
                                <p className="truncate font-medium text-fc-fg">
                                  {teamLabel(m.homeTeam)} – {teamLabel(m.awayTeam)}
                                </p>
                                <p className="mt-0.5 text-xs text-fc-fg/60">
                                  {formatDate(m.kickoff)} · {formatKickoff(m.kickoff)} Uhr
                                  {m.venue ? ` · ${m.venue}` : ''}
                                </p>
                                {(() => {
                                  const att = attendanceByMatch.get(m.id)
                                  if (!att || att.total === 0) return null
                                  return (
                                    <p className="mt-1 text-[11px] text-fc-fg/60">
                                      <span className="font-semibold text-fc-win">{att.going}</span> dabei{att.maybe > 0 ? <span> · {att.maybe} vielleicht</span> : null}
                                    </p>
                                  )
                                })()}
                              </div>
                              <Badge variant="outline" className="shrink-0 text-[11px]">
                                {m.homeTeam.isOwn ? 'Heim' : 'Auswärts'}
                              </Badge>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    ) : nextMatch ? (
                      <p className="text-sm text-fc-fg/60">Keine weiteren Termine geladen. Weitere Spiele findest du im Spielplan.</p>
                    ) : (
                      <p className="text-sm text-fc-fg/60">Aktuell keine kommenden Termine vorhanden.</p>
                    )}
                    <Link
                      href="/spielplan"
                      className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-fc-violet hover:text-fc-violet-light"
                    >
                      Alle Termine <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </Link>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </section>

        <section className="py-16 md:py-24 bg-fc-bg">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-fc-fg">Alle Funktionen</h2>
              <p className="mt-4 text-lg text-fc-fg/70 max-w-2xl mx-auto">
                Alles, was du als Aue-Fan brauchst – übersichtlich und schnell erreichbar.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 sm:gap-6">
              {features.map((feature) => (
                <Link
                  key={feature.name}
                  href={feature.href}
                  className="group block rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fc-violet focus-visible:ring-offset-2 focus-visible:ring-offset-fc-bg"
                >
                  <Card className="h-full border-fc-border/70 transition-[transform,border-color,box-shadow,background-color] duration-200 group-hover:-translate-y-1 group-hover:border-fc-violet/45 group-hover:shadow-lg group-hover:shadow-fc-violet/5 group-focus-visible:-translate-y-1 group-focus-visible:border-fc-violet/45 group-focus-visible:shadow-lg group-active:translate-y-0">
                    <CardHeader className="pb-3">
                      <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-fc-violet/12 ring-1 ring-fc-violet/15 transition-[background-color,color,box-shadow,transform] duration-200 group-hover:bg-fc-violet group-hover:shadow-sm group-hover:shadow-fc-violet/25 group-focus-visible:bg-fc-violet">
                        <feature.icon
                          className="h-6 w-6 text-fc-violet transition-colors duration-200 group-hover:text-white group-focus-visible:text-white"
                          aria-hidden="true"
                        />
                      </div>
                      <CardTitle className="text-center text-lg text-fc-fg">{feature.name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-center text-sm leading-relaxed text-fc-fg/65">{feature.description}</p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 md:py-24 bg-fc-surface border-y border-fc-border">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-fc-fg">Offizielle Links</h2>
              <p className="mt-4 text-lg text-fc-fg/70 max-w-2xl mx-auto">
                Direkte Verweise zu den offiziellen Kanälen des Vereins.
              </p>
            </div>

            <div className="mx-auto grid max-w-3xl grid-cols-1 gap-5 sm:grid-cols-3 sm:gap-6">
              {quickLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  target={link.external ? '_blank' : undefined}
                  rel={link.external ? 'noopener noreferrer' : undefined}
                  className="group flex flex-col items-center rounded-xl border border-fc-border bg-fc-bg p-6 text-center transition-[transform,border-color,box-shadow,background-color] duration-200 hover:-translate-y-0.5 hover:border-fc-violet/45 hover:shadow-lg hover:shadow-fc-violet/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fc-violet focus-visible:ring-offset-2 focus-visible:ring-offset-fc-surface active:translate-y-0"
                >
                  <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-fc-violet/12 ring-1 ring-fc-violet/15 transition-[background-color,color,box-shadow] duration-200 group-hover:bg-fc-violet group-hover:shadow-sm group-hover:shadow-fc-violet/25 group-focus-visible:bg-fc-violet">
                    <link.icon
                      className="h-6 w-6 text-fc-violet transition-colors duration-200 group-hover:text-white group-focus-visible:text-white"
                      aria-hidden="true"
                    />
                  </div>
                  <span className="font-medium text-fc-fg">{link.name}</span>
                  {link.external ? (
                    <>
                      <span className="sr-only">(öffnet in neuem Tab)</span>
                      <svg
                        className="mt-2 h-4 w-4 text-fc-fg/50 transition-colors group-hover:text-fc-violet/70"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        aria-hidden="true"
                      >
                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                        <polyline points="15 3 21 3 21 9" />
                        <line x1="10" y1="14" x2="21" y2="3" />
                      </svg>
                    </>
                  ) : null}
                </a>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 md:py-24 bg-fc-bg">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
            {isLoggedIn ? (
              <>
                <h2 className="text-3xl md:text-4xl font-bold text-fc-fg">Willkommen zurück im Veilchen-Kreis</h2>
                <p className="mt-4 text-lg text-fc-fg/70 max-w-2xl mx-auto">
                  Verwalte dein Profil, tippe mit den Kumpels und behalte deine nächsten Spieltage im Blick – alles an einem Ort.
                </p>
                <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
                  <Link
                    href="/profil"
                    className="inline-flex w-full items-center justify-center rounded-xl bg-fc-violet px-7 py-3 text-base font-semibold text-white shadow-sm shadow-fc-violet/20 transition-[background-color,box-shadow,transform] duration-200 hover:bg-fc-violet-dark hover:shadow-md hover:shadow-fc-violet/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fc-violet focus-visible:ring-offset-2 focus-visible:ring-offset-fc-bg active:scale-[0.98] sm:w-auto"
                  >
                    Zum Profil
                  </Link>
                  <Link
                    href="/kumpels"
                    className="inline-flex w-full items-center justify-center rounded-xl border border-fc-violet/30 bg-fc-violet/10 px-7 py-3 text-base font-semibold text-fc-fg transition-[background-color,border-color,box-shadow,transform] duration-200 hover:border-fc-violet/45 hover:bg-fc-violet/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fc-violet focus-visible:ring-offset-2 focus-visible:ring-offset-fc-bg active:scale-[0.98] sm:w-auto"
                  >
                    Kumpels & Tippspiel
                  </Link>
                </div>
              </>
            ) : (
              <>
                <h2 className="text-3xl md:text-4xl font-bold text-fc-fg">Bereit für die Saison 2026/27?</h2>
                <p className="mt-4 text-lg text-fc-fg/70 max-w-2xl mx-auto">
                  Registriere dich kostenlos und verpasse kein Spiel, keine News und keine Aktion mehr.
                </p>
                <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
                  <Link
                    href="/register"
                    className="inline-flex w-full items-center justify-center rounded-xl bg-fc-violet px-7 py-3 text-base font-semibold text-white shadow-sm shadow-fc-violet/20 transition-[background-color,box-shadow,transform] duration-200 hover:bg-fc-violet-dark hover:shadow-md hover:shadow-fc-violet/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fc-violet focus-visible:ring-offset-2 focus-visible:ring-offset-fc-bg active:scale-[0.98] sm:w-auto"
                  >
                    Jetzt registrieren
                  </Link>
                  <Link
                    href="/login"
                    className="inline-flex w-full items-center justify-center rounded-xl border border-fc-violet/30 bg-fc-violet/10 px-7 py-3 text-base font-semibold text-fc-fg transition-[background-color,border-color,box-shadow,transform] duration-200 hover:border-fc-violet/45 hover:bg-fc-violet/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fc-violet focus-visible:ring-offset-2 focus-visible:ring-offset-fc-bg active:scale-[0.98] sm:w-auto"
                  >
                    Anmelden
                  </Link>
                </div>
              </>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}

function StatCard({
  label,
  value,
  icon: Icon,
}: {
  label: string
  value: string
  icon: LucideIcon
}) {
  return (
    <Card
      className={cn(
        'group relative overflow-hidden border-fc-border/70 bg-fc-surface/70 px-5 py-6 text-center backdrop-blur-[1px] sm:py-7',
        'transition-[transform,border-color,box-shadow,background-color] duration-200',
        'hover:-translate-y-0.5 hover:border-fc-violet/45 hover:bg-fc-surface hover:shadow-lg hover:shadow-fc-violet/5',
        'motion-reduce:transform-none motion-reduce:transition-none',
      )}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-fc-violet/40 to-transparent opacity-70"
      />
      <div className="relative">
        <div
          aria-hidden="true"
          className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-fc-violet/12 ring-1 ring-fc-violet/15 transition-[background-color,box-shadow,transform] duration-200 group-hover:bg-fc-violet group-hover:shadow-sm group-hover:shadow-fc-violet/25 group-hover:scale-[1.02] motion-reduce:transform-none"
        >
          <Icon
            className="h-6 w-6 text-fc-violet transition-colors duration-200 group-hover:text-white"
            aria-hidden="true"
          />
        </div>
        <dt className="text-xs font-medium uppercase tracking-wide text-fc-fg/55">{label}</dt>
        <dd className="mt-1.5 m-0 text-balance text-xl font-bold leading-tight text-fc-fg sm:text-2xl">{value}</dd>
      </div>
    </Card>
  )
}
