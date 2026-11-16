import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getServerSession } from '@/lib/auth-server'
import { prisma } from '@kumpelapp/db'
import { Card, CardContent, CardHeader, CardTitle, Button, Badge } from '@kumpelapp/ui'
import { formatDate, formatKickoff } from '@kumpelapp/utils'
import { Settings, Ticket, Users, Bell, Heart, LogOut, MapPinned, BarChart3, Brain, Trophy, CalendarCheck2, ClipboardCheck } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Profil',
  description: 'Dein KumpelApp-Profil, Tipps, Gruppen und Einstellungen.',
}

export default async function ProfilPage() {
  const session = await getServerSession()
  if (!session?.user?.id) redirect('/login?callbackUrl=/profil')

  const userId = session.user.id
  const now = new Date()
  const [tipCount, groupCount, ticketCount, favCount, visitedVenueGroups, tipAgg, scoredTipCount, exactTipCount, quizAttempts, attendanceCounts, nextMatch] = await Promise.all([
    prisma.tip.count({ where: { userId } }),
    prisma.groupMember.count({ where: { userId } }),
    prisma.ticket.count({ where: { userId } }),
    prisma.favorite.count({ where: { userId } }),
    prisma.venueVisit.groupBy({ by: ['venueId'], where: { userId } }),
    prisma.tip.aggregate({ where: { userId, points: { not: null } }, _sum: { points: true } }),
    prisma.tip.count({ where: { userId, points: { not: null } } }),
    prisma.tip.count({ where: { userId, points: 3 } }),
    prisma.quizAttempt.findMany({ where: { userId }, select: { correct: true }, orderBy: { createdAt: 'desc' } }),
    prisma.attendance.groupBy({ by: ['status'], where: { userId }, _count: { _all: true } }),
    prisma.match.findFirst({
      where: {
        kickoff: { gte: new Date(now.getTime() - 2 * 60 * 60 * 1000) },
        status: { in: ['SCHEDULED', 'LIVE', 'POSTPONED'] },
        OR: [{ homeTeam: { isOwn: true } }, { awayTeam: { isOwn: true } }],
      },
      include: {
        homeTeam: { select: { shortName: true, name: true } },
        awayTeam: { select: { shortName: true, name: true } },
      },
      orderBy: { kickoff: 'asc' },
    }),
  ])

  let nextTip: { homeGoals: number; awayGoals: number } | null = null
  let nextAttendance: 'GOING' | 'MAYBE' | 'NOT_GOING' | null = null
  if (nextMatch) {
    try {
      const [tip, att] = await Promise.all([
        prisma.tip.findUnique({ where: { userId_matchId: { userId, matchId: nextMatch.id } }, select: { homeGoals: true, awayGoals: true } }),
        prisma.attendance.findUnique({ where: { userId_matchId: { userId, matchId: nextMatch.id } }, select: { status: true } }),
      ])
      nextTip = tip ? { homeGoals: tip.homeGoals, awayGoals: tip.awayGoals } : null
      nextAttendance = (att?.status as any) ?? null
    } catch (e) {
      console.error('Profil next actions load error', e)
    }
  }
  const visitedVenueCount = visitedVenueGroups.length
  const totalTipPoints = tipAgg._sum.points ?? 0
  const avgTipPoints = scoredTipCount > 0 ? (totalTipPoints / scoredTipCount).toFixed(2).replace('.', ',') : '0,00'
  const quizTotal = quizAttempts.length
  const quizCorrect = quizAttempts.filter((a) => a.correct).length
  const quizAccuracy = quizTotal > 0 ? Math.round((quizCorrect / quizTotal) * 100) : 0
  let quizStreak = 0
  for (const a of quizAttempts) {
    if (!a.correct) break
    quizStreak += 1
  }
  const goingCount = attendanceCounts.find((r) => r.status === 'GOING')?._count._all ?? 0
  const maybeCount = attendanceCounts.find((r) => r.status === 'MAYBE')?._count._all ?? 0

  return (
    <main id="main-content" className="flex-1">
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-fc-fg">Profil</h1>
            <p className="mt-2 text-fc-fg/70">Hallo {session.user.name || session.user.email} – dein Veilchen-Cockpit.</p>
          </div>
          <Link href="/profil/einstellungen">
            <Button variant="outline" className="gap-2"><Settings className="h-4 w-4" /> Einstellungen</Button>
          </Link>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <Stat label="Tipps abgegeben" value={String(tipCount)} icon={Users} href="/tippspiel" />
          <Stat label="Gruppen" value={String(groupCount)} icon={Users} href="/kumpels" />
          <Stat label="Tickets" value={String(ticketCount)} icon={Ticket} href="/tickets" />
          <Stat label="Favoriten" value={String(favCount)} icon={Heart} href="/profil/einstellungen" />
          <Stat label="Stadien besucht" value={String(visitedVenueCount)} icon={MapPinned} href="/sammler" />
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <div className="space-y-4">
            {nextMatch ? (
              <Card className="border-fc-violet/25 bg-gradient-to-b from-fc-violet/[0.06] to-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><ClipboardCheck className="h-5 w-5 text-fc-violet" aria-hidden="true" /> Nächste Aktionen</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div>
                    <p className="font-semibold text-fc-fg">{(nextMatch.homeTeam.shortName || nextMatch.homeTeam.name)} – {(nextMatch.awayTeam.shortName || nextMatch.awayTeam.name)}</p>
                    <p className="mt-0.5 text-fc-fg/65">{formatDate(nextMatch.kickoff)} · {formatKickoff(nextMatch.kickoff)} Uhr</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {nextTip ? (
                      <Badge variant="secondary">Tipp: {nextTip.homeGoals}:{nextTip.awayGoals}</Badge>
                    ) : (
                      <Badge variant="outline">Tipp fehlt</Badge>
                    )}
                    {nextAttendance ? (
                      <Badge variant={nextAttendance === 'GOING' ? 'success' : nextAttendance === 'MAYBE' ? 'secondary' : 'outline'}>
                        Check-in: {nextAttendance === 'GOING' ? 'Dabei' : nextAttendance === 'MAYBE' ? 'Vielleicht' : 'Nicht dabei'}
                      </Badge>
                    ) : (
                      <Badge variant="outline">Check-in fehlt</Badge>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2 pt-1">
                    <Link href="/tippspiel" className="inline-flex items-center rounded-lg border border-fc-border bg-fc-surface/60 px-3 py-2 text-sm font-medium text-fc-fg transition-colors hover:border-fc-violet/40 hover:bg-fc-violet/10">{nextTip ? 'Tipp prüfen' : 'Jetzt tippen'}</Link>
                    <Link href={`/spiel/${nextMatch.id}`} className="inline-flex items-center rounded-lg bg-fc-violet px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-fc-violet/90"><CalendarCheck2 className="mr-1.5 h-4 w-4" aria-hidden="true" /> Zum Spiel & Check-in</Link>
                  </div>
                </CardContent>
              </Card>
            ) : null}

            <Card className="border-fc-border/70">
              <CardHeader><CardTitle className="flex items-center gap-2"><BarChart3 className="h-5 w-5 text-fc-violet" aria-hidden="true" /> Meine Bilanz</CardTitle></CardHeader>
              <CardContent className="space-y-4 text-sm">
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-lg border border-fc-border/60 bg-fc-bg/25 p-3">
                    <p className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-fc-fg/55"><Trophy className="h-3.5 w-3.5" aria-hidden="true" /> Tippspiel</p>
                    <p className="mt-1 text-xl font-bold tabular-nums text-fc-fg">{totalTipPoints} <span className="text-sm font-semibold text-fc-fg/60">Punkte</span></p>
                    <p className="mt-0.5 text-xs text-fc-fg/65">{scoredTipCount} ausgewertet · {exactTipCount}× exakt · Ø {avgTipPoints}</p>
                  </div>
                  <div className="rounded-lg border border-fc-border/60 bg-fc-bg/25 p-3">
                    <p className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-fc-fg/55"><Brain className="h-3.5 w-3.5" aria-hidden="true" /> Quiz</p>
                    <p className="mt-1 text-xl font-bold tabular-nums text-fc-fg">{quizAccuracy}% <span className="text-sm font-semibold text-fc-fg/60">Quote</span></p>
                    <p className="mt-0.5 text-xs text-fc-fg/65">{quizCorrect}/{quizTotal} richtig · Serie {quizStreak}</p>
                  </div>
                </div>
                <div className="rounded-lg border border-fc-border/60 bg-fc-bg/25 p-3">
                  <p className="text-xs font-medium uppercase tracking-wide text-fc-fg/55">Matchday & Stadion</p>
                  <p className="mt-1 text-fc-fg/80"><span className="font-semibold text-fc-fg">{goingCount}</span> Zusagen{maybeCount > 0 ? <span> · <span className="font-semibold text-fc-fg">{maybeCount}</span> vielleicht</span> : null} · <span className="font-semibold text-fc-fg">{visitedVenueCount}</span> Stadien besucht</p>
                </div>
                <p className="text-xs text-fc-fg/55">Detaillierte Werte auch per API: <code className="rounded bg-fc-bg/40 px-1 py-0.5">GET /api/v1/me/stats</code></p>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            <Card className="border-fc-border/70">
              <CardHeader><CardTitle>Matchday & Community</CardTitle></CardHeader>
              <CardContent className="space-y-2 text-sm">
                <QuickLink href="/kumpels" label="Kumpels & Gruppen" />
                <QuickLink href="/tippspiel" label="Tippspiel (3/2/1/0)" />
                <QuickLink href="/meine-tipps" label="Meine Tipps & Verlauf" />
                <QuickLink href="/meine-stimmen" label="Meine Stimmen (SdS)" />
                <QuickLink href="/checkins" label="Meine Check-ins" />
                <QuickLink href="/tickets" label="Tickets & Wallet" />
                <QuickLink href="/auswaerts" label="Auswärts-Guide" />
                <QuickLink href="/sammler" label="Stadion-Sammler" />
              </CardContent>
            </Card>
            <Card className="border-fc-border/70">
              <CardHeader><CardTitle>Account</CardTitle></CardHeader>
              <CardContent className="space-y-2 text-sm">
                <QuickLink href="/profil/einstellungen" label="Benachrichtigungen & Privatsphäre" />
                <QuickLink href="/quellen" label="Quellen & Lizenzen" />
                <QuickLink href="/datenschutz" label="Datenschutz & Rechte" />
                <form action="/api/auth/signout" method="post">
                  <button
                    type="submit"
                    className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-fc-loss transition-colors hover:bg-fc-loss/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fc-loss/70 focus-visible:ring-offset-2 focus-visible:ring-offset-fc-surface"
                  >
                    <LogOut className="h-4 w-4" aria-hidden="true" /> Abmelden
                  </button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  )
}

function Stat({ label, value, icon: Icon, href }: { label: string; value: string; icon: any; href: string }) {
  return (
    <Link
      href={href}
      className="group block rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fc-violet focus-visible:ring-offset-2 focus-visible:ring-offset-fc-bg"
    >
      <Card className="h-full border-fc-border/70 transition-[transform,border-color,box-shadow] duration-200 group-hover:-translate-y-0.5 group-hover:border-fc-violet/40 group-hover:shadow-md group-hover:shadow-fc-violet/5 group-focus-visible:-translate-y-0.5 group-focus-visible:border-fc-violet/40">
        <CardContent className="flex items-center gap-3 py-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-fc-violet/10 ring-1 ring-inset ring-fc-violet/15 transition-colors group-hover:bg-fc-violet/15">
            <Icon className="h-5 w-5 text-fc-violet" aria-hidden="true" />
          </div>
          <div>
            <p className="text-2xl font-bold text-fc-fg">{value}</p>
            <p className="text-xs text-fc-fg/60">{label}</p>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

function QuickLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="flex items-center justify-between rounded-lg px-3 py-2 text-fc-fg/80 transition-colors hover:bg-fc-violet/10 hover:text-fc-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fc-violet focus-visible:ring-offset-2 focus-visible:ring-offset-fc-surface"
    >
      {label}
      <span aria-hidden="true">→</span>
    </Link>
  )
}
