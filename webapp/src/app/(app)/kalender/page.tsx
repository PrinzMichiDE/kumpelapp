import type { Metadata } from 'next'
import Link from 'next/link'
import { prisma } from '@kumpelapp/db'
import { Badge, Card, CardContent, CardHeader, CardTitle } from '@kumpelapp/ui'
import { formatDate, formatKickoff } from '@kumpelapp/utils'
import { CalendarDays, CalendarPlus, Clock, Download, ExternalLink, Info, Link2, MapPin, RefreshCw, Smartphone } from 'lucide-react'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Kalender',
  description: 'FC Erzgebirge Aue Spieltermine als iCal abonnieren – kommende Spiele oder komplette Saison direkt in deinem Kalender.',
}

function absoluteIcsUrl(origin: string, scope: 'upcoming' | 'all') {
  const path = scope === 'all' ? '/api/v1/calendar/aue.ics?scope=all' : '/api/v1/calendar/aue.ics'
  return `${origin}${path}`
}

function webcalUrl(origin: string, scope: 'upcoming' | 'all') {
  return absoluteIcsUrl(origin, scope).replace(/^https?:\/\//, 'webcal://')
}

function CopyHint({ label }: { label: string }) {
  return (
    <span className="rounded-md border border-fc-border/70 bg-fc-bg/40 px-2 py-0.5 text-[11px] font-medium text-fc-fg/60">
      {label}
    </span>
  )
}

export default async function KalenderPage() {
  const appUrl = (process.env.NEXT_PUBLIC_APP_URL || process.env.BETTER_AUTH_URL || 'https://kumpelapp.vercel.app').replace(/\/$/, '')
  const upcomingUrl = absoluteIcsUrl(appUrl, 'upcoming')
  const allUrl = absoluteIcsUrl(appUrl, 'all')
  const upcomingWebcal = webcalUrl(appUrl, 'upcoming')
  const allWebcal = webcalUrl(appUrl, 'all')

  const now = new Date()
  let preview: {
    id: string
    kickoff: Date
    status: string
    matchday: number | null
    homeTeam: string
    awayTeam: string
    homeIsOwn: boolean
    venue: string | null
  }[] = []
  let seasonLabel: string | null = null
  let error: string | null = null

  try {
    const league = await prisma.league.findFirst({
      where: { season: { isCurrent: true } },
      include: { season: true },
      orderBy: { tier: 'asc' },
    })
    const targetLeague =
      league ??
      (await prisma.league.findFirst({
        include: { season: true },
        orderBy: [{ season: { startYear: 'desc' } }, { tier: 'asc' }],
      }))
    seasonLabel = targetLeague?.season?.label ?? null

    const rows = await prisma.match.findMany({
      where: {
        ...(targetLeague ? { leagueId: targetLeague.id } : {}),
        OR: [{ homeTeam: { isOwn: true } }, { awayTeam: { isOwn: true } }],
        kickoff: { gte: new Date(now.getTime() - 24 * 60 * 60 * 1000) },
        status: { in: ['SCHEDULED', 'LIVE', 'POSTPONED'] },
      },
      include: {
        homeTeam: { select: { name: true, shortName: true, isOwn: true } },
        awayTeam: { select: { name: true, shortName: true, isOwn: true } },
        venue: { select: { name: true, city: true } },
      },
      orderBy: { kickoff: 'asc' },
      take: 8,
    })

    preview = rows.map((m) => ({
      id: m.id,
      kickoff: m.kickoff,
      status: m.status,
      matchday: m.matchday,
      homeTeam: m.homeTeam.shortName || m.homeTeam.name,
      awayTeam: m.awayTeam.shortName || m.awayTeam.name,
      homeIsOwn: m.homeTeam.isOwn,
      venue: m.venue ? [m.venue.name, m.venue.city].filter(Boolean).join(', ') : null,
    }))
  } catch (e) {
    console.error('Kalender page load error', e)
    error = 'Vorschau konnte nicht geladen werden. Die Abo-Links funktionieren trotzdem.'
  }

  return (
    <div className="min-h-screen bg-fc-bg">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-fc-violet/15 ring-1 ring-fc-violet/25">
              <CalendarDays className="h-6 w-6 text-fc-violet" aria-hidden="true" />
            </span>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-fc-fg md:text-4xl">Kalender abonnieren</h1>
              <p className="mt-1 text-fc-fg/70">
                Alle Aue-Spiele automatisch in deinem Kalender{seasonLabel ? ` – Saison ${seasonLabel}` : ''}.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card className="border-fc-violet/25 bg-gradient-to-b from-fc-violet/[0.08] to-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <CalendarPlus className="h-5 w-5 text-fc-violet" aria-hidden="true" />
                Kommende Spiele (empfohlen)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm leading-relaxed text-fc-fg/75">
                Enthält die nächsten geplanten, laufenden oder verlegten Partien. Ideal, wenn du nur aktuelle Termine im Kalender haben möchtest.
              </p>
              <div className="flex flex-wrap gap-2">
                <a
                  href={upcomingWebcal}
                  className="inline-flex items-center gap-2 rounded-xl bg-fc-violet px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-fc-violet/20 transition-colors hover:bg-fc-violet-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fc-violet focus-visible:ring-offset-2 focus-visible:ring-offset-fc-bg"
                >
                  <Smartphone className="h-4 w-4" aria-hidden="true" /> In Kalender-App öffnen
                </a>
                <a
                  href={upcomingUrl}
                  className="inline-flex items-center gap-2 rounded-xl border border-fc-border bg-fc-surface/60 px-4 py-2.5 text-sm font-semibold text-fc-fg transition-colors hover:border-fc-violet/40 hover:bg-fc-violet/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fc-violet focus-visible:ring-offset-2 focus-visible:ring-offset-fc-bg"
                >
                  <Download className="h-4 w-4" aria-hidden="true" /> .ics herunterladen
                </a>
              </div>
              <div className="rounded-xl border border-fc-border/70 bg-fc-bg/30 p-3">
                <div className="mb-1 flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold uppercase tracking-wide text-fc-fg/55">Abo-URL (HTTPS)</span>
                  <CopyHint label="Zum Kopieren" />
                </div>
                <p className="break-all font-mono text-xs leading-relaxed text-fc-fg/80 select-all">{upcomingUrl}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <CalendarDays className="h-5 w-5 text-fc-violet" aria-hidden="true" />
                Komplette Saison
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm leading-relaxed text-fc-fg/75">
                Enthält alle bekannten Aue-Spiele der aktuellen Saison, inklusive bereits gespielter Partien. Nützlich für Archiv- und Statistikzwecke im Kalender.
              </p>
              <div className="flex flex-wrap gap-2">
                <a
                  href={allWebcal}
                  className="inline-flex items-center gap-2 rounded-xl border border-fc-violet/30 bg-fc-violet/10 px-4 py-2.5 text-sm font-semibold text-fc-fg transition-colors hover:bg-fc-violet/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fc-violet focus-visible:ring-offset-2 focus-visible:ring-offset-fc-bg"
                >
                  <Link2 className="h-4 w-4" aria-hidden="true" /> Saisonabo öffnen
                </a>
                <a
                  href={allUrl}
                  className="inline-flex items-center gap-2 rounded-xl border border-fc-border bg-fc-surface/60 px-4 py-2.5 text-sm font-semibold text-fc-fg transition-colors hover:border-fc-violet/40 hover:bg-fc-violet/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fc-violet focus-visible:ring-offset-2 focus-visible:ring-offset-fc-bg"
                >
                  <Download className="h-4 w-4" aria-hidden="true" /> .ics herunterladen
                </a>
              </div>
              <div className="rounded-xl border border-fc-border/70 bg-fc-bg/30 p-3">
                <div className="mb-1 flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold uppercase tracking-wide text-fc-fg/55">Abo-URL (HTTPS)</span>
                  <CopyHint label="Zum Kopieren" />
                </div>
                <p className="break-all font-mono text-xs leading-relaxed text-fc-fg/80 select-all">{allUrl}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <section className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3" aria-label="Hinweise und Vorschau">
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Info className="h-5 w-5 text-fc-violet" aria-hidden="true" />
                So funktioniert&apos;s
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm leading-relaxed text-fc-fg/75">
              <div className="rounded-lg border border-fc-border/60 bg-fc-bg/20 p-3">
                <p className="font-semibold text-fc-fg">iPhone / iPad</p>
                <p className="mt-1">Tippe auf „In Kalender-App öffnen“ oder nutze Einstellungen → Kalender → Accounts → Account hinzufügen → Andere → Kalenderabo hinzufügen.</p>
              </div>
              <div className="rounded-lg border border-fc-border/60 bg-fc-bg/20 p-3">
                <p className="font-semibold text-fc-fg">Google Kalender</p>
                <p className="mt-1">Am Computer: „Weitere Kalender“ → „Per URL“ und die HTTPS-Abo-URL einfügen. Aktualisierungen können verzögert erscheinen.</p>
              </div>
              <div className="rounded-lg border border-fc-border/60 bg-fc-bg/20 p-3">
                <p className="font-semibold text-fc-fg">Outlook</p>
                <p className="mt-1">Kalender hinzufügen → Aus dem Internet abonnieren und die HTTPS-URL einfügen.</p>
              </div>
              <div className="flex items-start gap-2 rounded-lg border border-fc-violet/20 bg-fc-violet/5 p-3">
                <RefreshCw className="mt-0.5 h-4 w-4 shrink-0 text-fc-violet" aria-hidden="true" />
                <p>Der Feed wird regelmäßig aktualisiert. Terminänderungen, Verlegungen und Spielstände (im Saison-Feed) können sich mit Datenstand der App ändern.</p>
              </div>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between gap-3 space-y-0">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Clock className="h-5 w-5 text-fc-violet" aria-hidden="true" />
                Vorschau: kommende Termine
              </CardTitle>
              <Link
                href="/spielplan"
                className="inline-flex items-center gap-1 text-sm font-medium text-fc-violet transition-colors hover:text-fc-violet-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fc-violet focus-visible:ring-offset-2 focus-visible:ring-offset-fc-bg"
              >
                Zum Spielplan <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
              </Link>
            </CardHeader>
            <CardContent>
              {error ? <p className="mb-4 text-sm text-fc-loss">{error}</p> : null}
              {preview.length === 0 ? (
                <p className="text-sm text-fc-fg/70">Aktuell keine kommenden Termine in der Vorschau.</p>
              ) : (
                <ul className="space-y-3">
                  {preview.map((m) => {
                    const isHome = m.homeIsOwn
                    const opponent = isHome ? m.awayTeam : m.homeTeam
                    return (
                      <li key={m.id} className="rounded-xl border border-fc-border/70 bg-fc-bg/20 p-4 transition-colors hover:border-fc-violet/30">
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <Badge variant={isHome ? 'success' : 'secondary'} className="text-[11px]">
                                {isHome ? 'Heim' : 'Auswärts'}
                              </Badge>
                              {typeof m.matchday === 'number' ? (
                                <span className="text-xs font-medium text-fc-fg/55">{m.matchday}. Spieltag</span>
                              ) : null}
                              {m.status === 'LIVE' ? <Badge variant="destructive">LIVE</Badge> : null}
                              {m.status === 'POSTPONED' ? <Badge variant="outline">Verlegt</Badge> : null}
                            </div>
                            <p className="mt-1 font-semibold text-fc-fg">
                              <Link href={`/spiel/${m.id}`} className="hover:text-fc-violet focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fc-violet rounded-sm">
                                {m.homeTeam} – {m.awayTeam}
                              </Link>
                            </p>
                            <p className="mt-0.5 text-sm text-fc-fg/70">Gegner: {opponent}</p>
                            {m.venue ? (
                              <p className="mt-1 inline-flex items-center gap-1.5 text-sm text-fc-fg/65">
                                <MapPin className="h-3.5 w-3.5" aria-hidden="true" /> {m.venue}
                              </p>
                            ) : null}
                          </div>
                          <div className="shrink-0 text-left sm:text-right">
                            <p className="font-medium text-fc-fg">{formatDate(m.kickoff)}</p>
                            <p className="text-sm tabular-nums text-fc-fg/70">{formatKickoff(m.kickoff)} Uhr</p>
                          </div>
                        </div>
                      </li>
                    )
                  })}
                </ul>
              )}
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  )
}
