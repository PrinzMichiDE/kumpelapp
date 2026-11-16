import type { Metadata } from 'next'
import Link from 'next/link'
import { prisma } from '@kumpelapp/db'
import { getServerSession } from '@/lib/auth-server'
import { Card, CardContent, CardHeader, CardTitle, Button, Badge } from '@kumpelapp/ui'
import { formatDate, formatKickoff } from '@kumpelapp/utils'

export const metadata: Metadata = { title: 'Tippspiel', description: 'Tippe Aue-Spiele im 3/2/1/0-System.' }
export const dynamic = 'force-dynamic'

export default async function TippspielPage({ searchParams }: { searchParams: Promise<{ saved?: string; error?: string }> }) {
  const { saved, error } = await searchParams
  const session = await getServerSession()
  const userId = session?.user?.id
  const now = new Date()
  const matches = await prisma.match.findMany({
    where: { kickoff: { gte: new Date(now.getTime() - 48 * 3600_000) }, OR: [{ homeTeam: { isOwn: true } }, { awayTeam: { isOwn: true } }] },
    include: { homeTeam: true, awayTeam: true },
    orderBy: { kickoff: 'asc' },
    take: 12,
  }).catch(() => [])
  const tips = userId ? await prisma.tip.findMany({ where: { userId, matchId: { in: matches.map(m => m.id) } } }).catch(() => []) : []
  const tipByMatch = new Map(tips.map(t => [t.matchId, t]))
  const leaderboard = await prisma.tip.groupBy({ by: ['userId'], _sum: { points: true }, orderBy: { _sum: { points: 'desc' } }, take: 10 }).catch(() => [])
  const userIds = leaderboard.map(l => l.userId)
  const users = userIds.length ? await prisma.user.findMany({ where: { id: { in: userIds } }, select: { id: true, name: true } }) : []
  const nameById = new Map(users.map(u => [u.id, u.name || 'Fan']))

  return (
    <main id="main-content" className="flex-1">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-fc-fg">Tippspiel</h1>
            <p className="mt-2 text-fc-fg/70">Punkte: 3 exakt · 2 Tendenz+Differenz · 1 richtige Tendenz · 0 falsch. Tipp bis Anstoß möglich; Auswertung erfolgt automatisch nach Ergebnis-Import/Finalisierung.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {userId ? (
              <Link href="/meine-tipps"><Button variant="outline">Meine Tipps & Verlauf</Button></Link>
            ) : (
              <Link href="/login?callbackUrl=/tippspiel"><Button>Anmelden zum Tippen</Button></Link>
            )}
          </div>
        </div>
        {saved ? <div className="mt-4 rounded-xl border border-fc-win/30 bg-fc-win/10 px-4 py-3 text-sm text-fc-fg">Tipp gespeichert.</div> : null}
        {error ? <div className="mt-4 rounded-xl border border-fc-loss/30 bg-fc-loss/10 px-4 py-3 text-sm text-fc-fg" role="alert">Aktion nicht möglich ({error === 'locked' ? 'Tipp gesperrt (Anstoß/live/beendet)' : error === 'invalid' ? 'ungültige Eingabe' : 'bitte erneut versuchen'}).</div> : null}

        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-4">
            <Card className="border-fc-border/70">
              <CardHeader><CardTitle>Spiele</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {matches.length === 0 ? <p className="text-fc-fg/70">Keine Spiele gefunden. Nach Daten-Sync erscheinen hier Aue-Spiele.</p> : matches.map(m => {
                  const tip = tipByMatch.get(m.id)
                  const locked = new Date(m.kickoff).getTime() <= now.getTime() || m.status === 'FINISHED' || m.status === 'LIVE'
                  return (
                    <div key={m.id} className="rounded-lg border border-fc-border/60 p-3 sm:p-4">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <p className="font-medium text-fc-fg">{m.homeTeam.shortName || m.homeTeam.name} – {m.awayTeam.shortName || m.awayTeam.name}</p>
                          <p className="text-xs text-fc-fg/60">{formatDate(m.kickoff)} · {formatKickoff(m.kickoff)} Uhr · {m.status}</p>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          {m.homeGoals != null && m.awayGoals != null && <Badge variant="outline">Ergebnis {m.homeGoals}:{m.awayGoals}</Badge>}
                          {tip && <Badge variant="secondary">Tipp {tip.homeGoals}:{tip.awayGoals}{tip.points != null ? ` · ${tip.points} P` : ''}</Badge>}
                        </div>
                      </div>
                      {userId ? (
                        <form action="/api/v1/me/tips" method="post" className="mt-3 flex flex-wrap items-end gap-2 sm:gap-3">
                          <input type="hidden" name="matchId" value={m.id} />
                          <label className="flex flex-col gap-1 text-xs font-medium text-fc-fg/70">
                            <span>Heim</span>
                            <input
                              name="homeGoals"
                              type="number"
                              min={0}
                              max={20}
                              defaultValue={tip?.homeGoals ?? ''}
                              disabled={locked}
                              required
                              className="h-10 w-20 rounded-lg border border-fc-border bg-fc-bg px-3 text-sm text-fc-fg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fc-violet focus-visible:ring-offset-2 focus-visible:ring-offset-fc-surface disabled:cursor-not-allowed disabled:opacity-50"
                            />
                          </label>
                          <span className="pb-2 text-sm font-medium text-fc-fg/50" aria-hidden="true">:</span>
                          <label className="flex flex-col gap-1 text-xs font-medium text-fc-fg/70">
                            <span>Gast</span>
                            <input
                              name="awayGoals"
                              type="number"
                              min={0}
                              max={20}
                              defaultValue={tip?.awayGoals ?? ''}
                              disabled={locked}
                              required
                              className="h-10 w-20 rounded-lg border border-fc-border bg-fc-bg px-3 text-sm text-fc-fg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fc-violet focus-visible:ring-offset-2 focus-visible:ring-offset-fc-surface disabled:cursor-not-allowed disabled:opacity-50"
                            />
                          </label>
                          <Button type="submit" size="sm" disabled={locked} className="mb-0 sm:mb-0">{locked ? 'Gesperrt' : (tip ? 'Tipp ändern' : 'Tipp speichern')}</Button>
                          <Link
                            href={`/spiel/${m.id}`}
                            className="ml-auto inline-flex items-center rounded-md px-1 py-1 text-xs font-medium text-fc-violet transition-colors hover:text-fc-violet-light hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fc-violet focus-visible:ring-offset-2 focus-visible:ring-offset-fc-surface"
                          >
                            Matchdetails
                          </Link>
                        </form>
                      ) : (
                        <p className="mt-3 text-sm text-fc-fg/60">
                          <Link href="/login?callbackUrl=/tippspiel" className="rounded font-medium text-fc-violet transition-colors hover:text-fc-violet-light hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fc-violet focus-visible:ring-offset-2 focus-visible:ring-offset-fc-surface">Anmelden</Link>, um zu tippen.
                        </p>
                      )}
                    </div>
                  )
                })}
              </CardContent>
            </Card>
          </div>

          <Card className="border-fc-border/70 h-fit">
            <CardHeader><CardTitle>Rangliste (Top 10)</CardTitle></CardHeader>
            <CardContent className="space-y-2 text-sm">
              {leaderboard.length === 0 ? <p className="text-fc-fg/70">Noch keine ausgewerteten Tipps.</p> : leaderboard.map((l, i) => (
                <div key={l.userId} className="flex items-center justify-between rounded-md border border-fc-border/50 px-3 py-2">
                  <span className="text-fc-fg/80">#{i + 1} {nameById.get(l.userId) || 'Fan'}</span>
                  <span className="font-semibold text-fc-fg">{l._sum.points ?? 0} P</span>
                </div>
              ))}
              <p className="pt-2 text-xs text-fc-fg/55">Gesamtwertung über ausgewertete Tipps. Gruppenwertungen über Kumpels-Gruppen. Bei Spielverlegung/Abbruch können Tipps/Ergebnisse manuell korrigiert werden.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  )
}
