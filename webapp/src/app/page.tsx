import { Metadata } from 'next'
import Link from 'next/link'
import { AlertTriangle, ArrowRight, BarChart3, Brain, Building, Calendar, CheckCircle, Clock, Heart, History, MapPin, Newspaper, Trophy, Users, type LucideIcon } from 'lucide-react'
import { prisma } from '@kumpelapp/db'
import { Badge, Card, CardContent, CardHeader, CardTitle } from '@kumpelapp/ui'
import { cn, formatDate, formatDateTime, formatKickoff } from '@kumpelapp/utils'
import { Footer } from '@/components/footer'
import { Header } from '@/components/header'
import { OfflineBanner } from '@/components/offline-banner'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Startseite',
  description: 'KumpelApp - Deine Fan-App für den FC Erzgebirge Aue. Spieltag, Tabelle, Kader, News und mehr.',
}

const features = [
  { name: 'Spieltag', href: '/spielplan', icon: Calendar, description: 'Alle Spiele, Termine & Ergebnisse' },
  { name: 'Tabelle', href: '/tabelle', icon: Trophy, description: 'Aktuelle Regionalliga Nordost Tabelle' },
  { name: 'Saison', href: '/saison', icon: BarChart3, description: 'Ergebnisse, Formkurve & Saisonbilanz' },
  { name: 'Kader', href: '/kader', icon: Users, description: 'Spieler, Positionen & Statistiken' },
  { name: 'News', href: '/news', icon: Newspaper, description: 'Aktuelle Nachrichten vom Verein' },
  { name: 'Auswärts', href: '/auswaerts', icon: MapPin, description: 'Stadion-Guide & Anfahrtsinfos' },
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
  } | null = null
  let lastMatch: {
    id: string
    kickoff: Date
    status: string
    homeTeam: string
    awayTeam: string
    homeGoals: number | null
    awayGoals: number | null
  } | null = null
  let aueStanding: { position: number; points: number; played: number; league: string; season?: string | null } | null = null
  let latestNews: { id: string; title: string; publishedAt: Date; source: string; externalUrl: string }[] = []

  try {
    const [upcoming, finished, aueRow, news] = await Promise.all([
      prisma.match.findFirst({
        where: {
          kickoff: { gte: now },
          status: { in: ['SCHEDULED', 'LIVE', 'POSTPONED'] },
          OR: [{ homeTeam: { isOwn: true } }, { awayTeam: { isOwn: true } }],
        },
        include: {
          homeTeam: { select: { name: true, shortName: true, isOwn: true } },
          awayTeam: { select: { name: true, shortName: true, isOwn: true } },
          venue: { select: { name: true } },
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
          homeTeam: { select: { name: true, shortName: true } },
          awayTeam: { select: { name: true, shortName: true } },
        },
        orderBy: { kickoff: 'desc' },
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
        homeTeam: upcoming.homeTeam.shortName || upcoming.homeTeam.name,
        awayTeam: upcoming.awayTeam.shortName || upcoming.awayTeam.name,
        homeIsOwn: upcoming.homeTeam.isOwn,
        venue: upcoming.venue?.name ?? null,
      }
    }
    if (finished) {
      lastMatch = {
        id: finished.id,
        kickoff: finished.kickoff,
        status: finished.status,
        homeTeam: finished.homeTeam.shortName || finished.homeTeam.name,
        awayTeam: finished.awayTeam.shortName || finished.awayTeam.name,
        homeGoals: finished.homeGoals,
        awayGoals: finished.awayGoals,
      }
    }
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
  } catch (e) {
    console.error('Home data load error', e)
  }

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
              <StatCard label="Tabellenplatz" value={aueStanding ? `${aueStanding.position}. Platz · ${aueStanding.points} Pkt` : 'Noch keine Daten'} icon={Calendar} />
              <StatCard label="Stadion" value="Sparkassen-Erzgebirgsstadion" icon={MapPin} />
            </dl>
          </div>
        </section>

        <section className="border-y border-fc-border/70 bg-fc-surface/40 py-12 sm:py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-8 flex items-end justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-fc-fg sm:text-3xl">Live-Überblick</h2>
                <p className="mt-1 text-sm text-fc-fg/65">Nächstes Spiel, letztes Ergebnis und aktuelle Meldungen</p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
              <Card className="border-fc-border/70">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Calendar className="h-5 w-5 text-fc-violet" aria-hidden="true" /> Nächstes Spiel
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {nextMatch ? (
                    <Link href={`/spiel/${nextMatch.id}`} className="group block rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fc-violet">
                      <div className="space-y-2">
                        <p className="text-lg font-semibold text-fc-fg group-hover:text-fc-violet-light">
                          {nextMatch.homeTeam} – {nextMatch.awayTeam}
                        </p>
                        <p className="flex items-center gap-2 text-sm text-fc-fg/70">
                          <Clock className="h-4 w-4" aria-hidden="true" />
                          {formatDate(nextMatch.kickoff)} · {formatKickoff(nextMatch.kickoff)} Uhr
                        </p>
                        {nextMatch.venue ? <p className="text-sm text-fc-fg/60">{nextMatch.venue}</p> : null}
                        <div className="pt-1">
                          <Badge variant={nextMatch.status === 'LIVE' ? 'destructive' : 'outline'}>
                            {nextMatch.status === 'LIVE' ? 'LIVE' : nextMatch.homeIsOwn ? 'Heimspiel' : 'Auswärtsspiel'}
                          </Badge>
                        </div>
                      </div>
                    </Link>
                  ) : (
                    <p className="text-sm text-fc-fg/60">Kein kommendes Spiel in der Datenbank. <Link href="/spielplan" className="text-fc-violet hover:underline">Zum Spielplan</Link></p>
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
                    <Link href={`/spiel/${lastMatch.id}`} className="group block rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fc-violet">
                      <p className="text-lg font-semibold text-fc-fg group-hover:text-fc-violet-light">
                        {lastMatch.homeTeam} – {lastMatch.awayTeam}
                      </p>
                      <p className="mt-2 text-3xl font-bold tabular-nums text-fc-fg">
                        {lastMatch.homeGoals ?? '-'}:{lastMatch.awayGoals ?? '-'}
                      </p>
                      <p className="mt-1 text-sm text-fc-fg/60">{formatDate(lastMatch.kickoff)}</p>
                    </Link>
                  ) : aueStanding ? (
                    <div>
                      <p className="text-3xl font-bold text-fc-fg">{aueStanding.position}. Platz</p>
                      <p className="mt-1 text-sm text-fc-fg/70">{aueStanding.points} Punkte nach {aueStanding.played} Spielen</p>
                      <Link href="/tabelle" className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-fc-violet hover:text-fc-violet-light">
                        Zur Tabelle <ArrowRight className="h-4 w-4" aria-hidden="true" />
                      </Link>
                    </div>
                  ) : (
                    <p className="text-sm text-fc-fg/60">Noch keine Ergebnisse verfügbar. <Link href="/tabelle" className="text-fc-violet hover:underline">Tabelle ansehen</Link></p>
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
                          <a href={n.externalUrl} target="_blank" rel="noopener noreferrer" className="group block rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fc-violet">
                            <p className="line-clamp-2 text-sm font-medium text-fc-fg group-hover:text-fc-violet-light">{n.title}</p>
                            <p className="mt-1 text-xs text-fc-fg/55">{formatDateTime(n.publishedAt)}</p>
                          </a>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-fc-fg/60">Noch keine News in der Datenbank. <Link href="/news" className="text-fc-violet hover:underline">News-Bereich öffnen</Link></p>
                  )}
                  <Link href="/news" className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-fc-violet hover:text-fc-violet-light">
                    Alle News <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Link>
                </CardContent>
              </Card>
            </div>
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
        'motion-reduce:transform-none motion-reduce:transition-none'
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

