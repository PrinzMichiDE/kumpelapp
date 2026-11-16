import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { prisma } from '@kumpelapp/db'
import { getServerSession } from '@/lib/auth-server'
import { Badge, Card, CardContent, CardHeader, CardTitle } from '@kumpelapp/ui'
import { formatDate, formatKickoff } from '@kumpelapp/utils'
import { CalendarCheck2, CheckCircle2, HelpCircle, XCircle } from 'lucide-react'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Meine Check-ins',
  description: 'Deine Spieltags-Zusagen und Check-ins – wer ist dabei bei Aue?',
}

const statusMeta = {
  GOING: { label: 'Dabei', icon: CheckCircle2, className: 'border-fc-win/30 bg-fc-win/10 text-fc-win' },
  MAYBE: { label: 'Vielleicht', icon: HelpCircle, className: 'border-fc-draw/30 bg-fc-draw/10 text-fc-draw' },
  NOT_GOING: { label: 'Nicht dabei', icon: XCircle, className: 'border-fc-loss/30 bg-fc-loss/10 text-fc-loss' },
} as const

export default async function CheckinsPage() {
  const session = await getServerSession()
  if (!session?.user?.id) redirect('/login?callbackUrl=/checkins')

  const userId = session.user.id
  const now = new Date()

  const rows = await prisma.attendance.findMany({
    where: { userId },
    include: {
      match: {
        include: {
          homeTeam: { select: { name: true, shortName: true, isOwn: true } },
          awayTeam: { select: { name: true, shortName: true, isOwn: true } },
          venue: { select: { name: true, city: true } },
        },
      },
    },
    orderBy: [{ match: { kickoff: 'desc' } }],
    take: 100,
  }).catch(() => [])

  const upcoming = rows
    .filter((r) => r.match.kickoff >= new Date(now.getTime() - 3 * 60 * 60 * 1000))
    .sort((a, b) => +a.match.kickoff - +b.match.kickoff)
  const past = rows.filter((r) => r.match.kickoff < new Date(now.getTime() - 3 * 60 * 60 * 1000))

  function renderList(items: typeof rows, empty: string) {
    if (items.length === 0) return <p className="text-sm text-fc-fg/70">{empty}</p>
    return (
      <ul className="space-y-3">
        {items.map((r) => {
          const m = r.match
          const meta = statusMeta[r.status as keyof typeof statusMeta] ?? statusMeta.MAYBE
          const Icon = meta.icon
          const home = m.homeTeam.shortName || m.homeTeam.name
          const away = m.awayTeam.shortName || m.awayTeam.name
          const aueHome = m.homeTeam.isOwn
          return (
            <li key={r.id} className="rounded-xl border border-fc-border/70 bg-fc-bg/20 p-4 transition-colors hover:border-fc-violet/30">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge className={meta.className}><Icon className="mr-1 h-3.5 w-3.5" aria-hidden="true" /> {meta.label}</Badge>
                    <Badge variant={aueHome ? 'success' : 'secondary'} className="text-[11px]">{aueHome ? 'Heim' : 'Auswärts'}</Badge>
                    {m.status ? <Badge variant="outline" className="text-[11px]">{m.status}</Badge> : null}
                  </div>
                  <p className="mt-1.5 font-semibold text-fc-fg">
                    <Link href={`/spiel/${m.id}`} className="hover:text-fc-violet focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fc-violet rounded-sm">
                      {home} – {away}
                    </Link>
                  </p>
                  <p className="mt-0.5 text-sm text-fc-fg/65">
                    {m.venue ? [m.venue.name, m.venue.city].filter(Boolean).join(', ') : 'Spielort offen'}
                  </p>
                  {r.note ? <p className="mt-1 text-sm text-fc-fg/60">Notiz: {r.note}</p> : null}
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
    )
  }

  return (
    <div className="min-h-screen bg-fc-bg">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-fc-violet/15 ring-1 ring-fc-violet/25">
              <CalendarCheck2 className="h-6 w-6 text-fc-violet" aria-hidden="true" />
            </span>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-fc-fg md:text-4xl">Meine Check-ins</h1>
              <p className="mt-1 text-fc-fg/70">Deine Zusagen und Spieltags-Planung auf einen Blick.</p>
            </div>
          </div>
          <Link
            href="/spielplan"
            className="inline-flex items-center justify-center rounded-xl border border-fc-border bg-fc-surface/60 px-4 py-2.5 text-sm font-semibold text-fc-fg transition-colors hover:border-fc-violet/40 hover:bg-fc-violet/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fc-violet focus-visible:ring-offset-2 focus-visible:ring-offset-fc-bg"
          >
            Zum Spielplan
          </Link>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Kommende Spiele</CardTitle></CardHeader>
            <CardContent>{renderList(upcoming, 'Keine kommenden Check-ins. Öffne ein Spiel und setze deinen Status unter „Wer ist dabei?“')}</CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Vergangene Spiele</CardTitle></CardHeader>
            <CardContent>{renderList(past, 'Noch keine vergangenen Check-ins gespeichert.')}</CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
