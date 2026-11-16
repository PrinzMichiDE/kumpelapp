import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { prisma } from '@kumpelapp/db'
import { getServerSession } from '@/lib/auth-server'
import { Badge, Button, Card, CardContent, CardHeader, CardTitle } from '@kumpelapp/ui'
import { formatDate, formatKickoff } from '@kumpelapp/utils'
import { ArrowLeft, CheckCircle2, Clock, ListChecks, Target, Trophy } from 'lucide-react'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Meine Tipps',
  description: 'Deine Tippspiel-Historie, Auswertungen und Punkte im Überblick.',
}

function pointsLabel(points: number | null) {
  if (points === 3) return { text: 'Exakt (3 P)', variant: 'success' as const }
  if (points === 2) return { text: 'Tendenz + Diff. (2 P)', variant: 'secondary' as const }
  if (points === 1) return { text: 'Tendenz (1 P)', variant: 'outline' as const }
  if (points === 0) return { text: 'Daneben (0 P)', variant: 'destructive' as const }
  return { text: 'Noch offen', variant: 'outline' as const }
}

export default async function MeineTippsPage({ searchParams }: { searchParams: Promise<{ view?: string; result?: string }> }) {
  const session = await getServerSession()
  if (!session?.user?.id) redirect('/login?callbackUrl=/meine-tipps')
  const { view = 'all', result = 'all' } = await searchParams
  const userId = session.user.id
  const now = new Date()

  const viewFilter = view === 'open' || view === 'scored' ? view : 'all'
  const resultFilter = result === 'exact' || result === 'tendency' || result === 'wrong' ? result : 'all'

  const tips = await prisma.tip.findMany({
    where: { userId },
    include: {
      match: {
        include: {
          homeTeam: { select: { name: true, shortName: true, isOwn: true } },
          awayTeam: { select: { name: true, shortName: true, isOwn: true } },
        },
      },
    },
    orderBy: [{ match: { kickoff: 'desc' } }, { createdAt: 'desc' }],
    take: 300,
  }).catch(() => [] as any[])

  const scoredAll = tips.filter((t) => t.points != null)
  const openAll = tips.filter((t) => t.points == null)
  const totalPoints = scoredAll.reduce((sum, t) => sum + (t.points ?? 0), 0)
  const exactCount = scoredAll.filter((t) => t.points === 3).length
  const tendencyCount = scoredAll.filter((t) => t.points === 1 || t.points === 2).length
  const wrongCount = scoredAll.filter((t) => t.points === 0).length
  const avg = scoredAll.length > 0 ? (totalPoints / scoredAll.length).toFixed(2).replace('.', ',') : '0,00'

  function matchesResultFilter(t: any) {
    if (resultFilter === 'all') return true
    if (t.points == null) return false
    if (resultFilter === 'exact') return t.points === 3
    if (resultFilter === 'tendency') return t.points === 1 || t.points === 2
    if (resultFilter === 'wrong') return t.points === 0
    return true
  }

  const open = viewFilter === 'scored' ? [] : openAll.filter((t) => resultFilter === 'all')
  const scored = viewFilter === 'open' ? [] : scoredAll.filter(matchesResultFilter)

  function buildHref(next: { view?: string; result?: string }) {
    const params = new URLSearchParams()
    const v = next.view ?? viewFilter
    const r = next.result ?? resultFilter
    if (v && v !== 'all') params.set('view', v)
    if (r && r !== 'all') params.set('result', r)
    const qs = params.toString()
    return qs ? `/meine-tipps?${qs}` : '/meine-tipps'
  }

  function TipRow({ t }: { t: (typeof tips)[number] }) {
    const m = t.match
    const kickoff = new Date(m.kickoff)
    const locked = kickoff.getTime() <= now.getTime() || m.status === 'FINISHED' || m.status === 'LIVE'
    const pl = pointsLabel(t.points)
    const home = m.homeTeam.shortName || m.homeTeam.name
    const away = m.awayTeam.shortName || m.awayTeam.name
    const resultKnown = m.homeGoals != null && m.awayGoals != null
    return (
      <li className="rounded-xl border border-fc-border/70 bg-fc-bg/20 p-4 transition-colors hover:border-fc-violet/30">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant={pl.variant}>{pl.text}</Badge>
              {m.status === 'LIVE' ? <Badge variant="destructive">LIVE</Badge> : null}
              {m.status === 'POSTPONED' ? <Badge variant="outline">Verlegt</Badge> : null}
              {!locked && t.points == null ? <Badge className="border-fc-violet/30 bg-fc-violet/10 text-fc-violet-light">Änderbar bis Anstoß</Badge> : null}
            </div>
            <p className="mt-1.5 font-semibold text-fc-fg">
              <Link href={`/spiel/${m.id}`} className="hover:text-fc-violet focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fc-violet rounded-sm">
                {home} – {away}
              </Link>
            </p>
            <p className="mt-0.5 text-sm text-fc-fg/65">{formatDate(kickoff)} · {formatKickoff(kickoff)} Uhr</p>
            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm">
              <span className="text-fc-fg/80">Dein Tipp: <span className="font-semibold tabular-nums text-fc-fg">{t.homeGoals}:{t.awayGoals}</span></span>
              {resultKnown ? (
                <span className="text-fc-fg/80">Ergebnis: <span className="font-semibold tabular-nums text-fc-fg">{m.homeGoals}:{m.awayGoals}</span></span>
              ) : (
                <span className="text-fc-fg/55">Ergebnis offen</span>
              )}
            </div>
          </div>
          <div className="shrink-0 flex flex-col items-start sm:items-end gap-2">
            {t.points != null ? (
              <div className="text-left sm:text-right">
                <p className="text-2xl font-bold tabular-nums text-fc-fg">{t.points}</p>
                <p className="text-xs text-fc-fg/55">Punkte</p>
              </div>
            ) : (
              <div className="text-left sm:text-right text-sm text-fc-fg/60 inline-flex items-center gap-1.5">
                <Clock className="h-4 w-4" aria-hidden="true" /> Auswertung ausstehend
              </div>
            )}
            {!locked ? (
              <Link href="/tippspiel" className="text-sm font-medium text-fc-violet hover:text-fc-violet-light">Tipp bearbeiten →</Link>
            ) : null}
          </div>
        </div>
      </li>
    )
  }

  return (
    <main id="main-content" className="flex-1">
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <Link href="/tippspiel" className="inline-flex items-center gap-2 rounded-lg text-sm font-medium text-fc-fg/70 transition-colors hover:text-fc-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fc-violet focus-visible:ring-offset-2 focus-visible:ring-offset-fc-bg">
            <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Zurück zum Tippspiel
          </Link>
          <Link href="/tippspiel"><Button variant="outline" size="sm">Jetzt tippen</Button></Link>
        </div>

        <div className="mb-8 flex items-center gap-3">
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-fc-violet/15 ring-1 ring-fc-violet/25">
            <ListChecks className="h-6 w-6 text-fc-violet" aria-hidden="true" />
          </span>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-fc-fg md:text-4xl">Meine Tipps</h1>
            <p className="mt-1 text-fc-fg/70">Historie, Ergebnisse und Punkte deiner Tipps auf einen Blick.</p>
          </div>
        </div>

        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="border-fc-border/70"><CardContent className="pt-5"><p className="text-sm text-fc-fg/60">Tipps gesamt</p><p className="mt-1 text-2xl font-bold tabular-nums text-fc-fg">{tips.length}</p></CardContent></Card>
          <Card className="border-fc-border/70"><CardContent className="pt-5"><p className="flex items-center gap-1.5 text-sm text-fc-fg/60"><Trophy className="h-4 w-4" aria-hidden="true" /> Punkte (ausgewertet)</p><p className="mt-1 text-2xl font-bold tabular-nums text-fc-fg">{totalPoints}</p><p className="text-xs text-fc-fg/55">Ø {avg} pro ausgewertetem Tipp</p></CardContent></Card>
          <Card className="border-fc-border/70"><CardContent className="pt-5"><p className="flex items-center gap-1.5 text-sm text-fc-fg/60"><Target className="h-4 w-4" aria-hidden="true" /> Exakt getroffen</p><p className="mt-1 text-2xl font-bold tabular-nums text-fc-fg">{exactCount}</p><p className="text-xs text-fc-fg/55">{tendencyCount}× richtige Tendenz (1/2 P)</p></CardContent></Card>
          <Card className="border-fc-border/70"><CardContent className="pt-5"><p className="flex items-center gap-1.5 text-sm text-fc-fg/60"><CheckCircle2 className="h-4 w-4" aria-hidden="true" /> Ausgewertet</p><p className="mt-1 text-2xl font-bold tabular-nums text-fc-fg">{scoredAll.length}</p><p className="text-xs text-fc-fg/55">{openAll.length} offen/ausstehend · {wrongCount}× daneben</p></CardContent></Card>
        </div>

        <div className="mb-6 space-y-3">
          <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Ansicht filtern">
            {([
              { v: 'all', label: `Alle (${tips.length})` },
              { v: 'open', label: `Offen (${openAll.length})` },
              { v: 'scored', label: `Ausgewertet (${scoredAll.length})` },
            ] as const).map((opt) => (
              <Link
                key={opt.v}
                href={buildHref({ view: opt.v })}
                className={`inline-flex items-center rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fc-violet focus-visible:ring-offset-2 focus-visible:ring-offset-fc-bg ${viewFilter === opt.v ? 'border-fc-violet/40 bg-fc-violet/15 text-fc-fg' : 'border-fc-border bg-fc-surface/40 text-fc-fg/75 hover:border-fc-violet/30'}`}
                aria-current={viewFilter === opt.v ? 'page' : undefined}
              >
                {opt.label}
              </Link>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Ergebnis filtern">
            {([
              { v: 'all', label: 'Alle Ergebnisse' },
              { v: 'exact', label: `Exakt (${exactCount})` },
              { v: 'tendency', label: `Tendenz (${tendencyCount})` },
              { v: 'wrong', label: `Daneben (${wrongCount})` },
            ] as const).map((opt) => (
              <Link
                key={opt.v}
                href={buildHref({ result: opt.v })}
                className={`inline-flex items-center rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fc-violet focus-visible:ring-offset-2 focus-visible:ring-offset-fc-bg ${resultFilter === opt.v ? 'border-fc-violet/40 bg-fc-violet/15 text-fc-fg' : 'border-fc-border bg-fc-surface/40 text-fc-fg/75 hover:border-fc-violet/30'}`}
                aria-current={resultFilter === opt.v ? 'page' : undefined}
              >
                {opt.label}
              </Link>
            ))}
          </div>
          {resultFilter !== 'all' ? <p className="text-xs text-fc-fg/55">Ergebnisfilter gilt nur für ausgewertete Tipps.</p> : null}
        </div>

        {tips.length === 0 ? (
          <Card className="border-fc-border/70">
            <CardContent className="py-10 text-center">
              <p className="text-fc-fg/75">Du hast noch keine Tipps abgegeben.</p>
              <p className="mt-1 text-sm text-fc-fg/60">Tippe kommende Aue-Spiele und sammle Punkte (3/2/1/0-System).</p>
              <Link href="/tippspiel" className="mt-4 inline-flex"><Button>Zum Tippspiel</Button></Link>
            </CardContent>
          </Card>
        ) : open.length === 0 && scored.length === 0 ? (
          <Card className="border-fc-border/70">
            <CardContent className="py-10 text-center">
              <p className="text-fc-fg/75">Keine Tipps für diesen Filter gefunden.</p>
              <p className="mt-1 text-sm text-fc-fg/60">Passe Ansicht oder Ergebnisfilter an, um mehr Einträge zu sehen.</p>
              <Link href="/meine-tipps" className="mt-4 inline-flex"><Button variant="outline">Filter zurücksetzen</Button></Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-8">
            {open.length > 0 ? (
              <Card>
                <CardHeader><CardTitle>Offen & ausstehend ({open.length})</CardTitle></CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {open.map((t) => <TipRow key={t.id} t={t} />)}
                  </ul>
                </CardContent>
              </Card>
            ) : null}

            {viewFilter !== 'open' ? (
              <Card>
                <CardHeader><CardTitle>Ausgewertet ({scored.length})</CardTitle></CardHeader>
                <CardContent>
                  {scored.length === 0 ? (
                    <p className="text-sm text-fc-fg/70">Keine ausgewerteten Tipps für diesen Filter. Passe den Ergebnisfilter an.</p>
                  ) : (
                    <ul className="space-y-3">
                      {scored.map((t) => <TipRow key={t.id} t={t} />)}
                    </ul>
                  )}
                </CardContent>
              </Card>
            ) : null}
          </div>
        )}
      </div>
    </main>
  )
}
