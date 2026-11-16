import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { prisma } from '@kumpelapp/db'
import { getServerSession } from '@/lib/auth-server'
import { Badge, Button, Card, CardContent, CardHeader, CardTitle } from '@kumpelapp/ui'
import { formatDate, formatKickoff } from '@kumpelapp/utils'
import { ArrowLeft, Star, Trophy, Vote } from 'lucide-react'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Meine Stimmen',
  description: 'Deine abgegebenen Spieler-des-Spiels-Stimmen und Favoriten im Überblick.',
}

function positionLabel(pos: string) {
  switch (pos) {
    case 'GOALKEEPER': return 'Torwart'
    case 'DEFENDER': return 'Abwehr'
    case 'MIDFIELDER': return 'Mittelfeld'
    case 'FORWARD': return 'Sturm'
    default: return pos
  }
}

export default async function MeineStimmenPage() {
  const session = await getServerSession()
  if (!session?.user?.id) redirect('/login?callbackUrl=/meine-stimmen')
  const userId = session.user.id

  const votes = await prisma.matchVote.findMany({
    where: { userId },
    include: {
      player: { select: { id: true, name: true, number: true, position: true } },
      match: {
        select: {
          id: true,
          kickoff: true,
          status: true,
          homeTeam: { select: { shortName: true, name: true } },
          awayTeam: { select: { shortName: true, name: true } },
        },
      },
    },
    orderBy: [{ createdAt: 'desc' }],
    take: 200,
  }).catch(() => [] as any[])

  const byPlayer = new Map<string, { name: string; number: number | null; count: number }>()
  for (const v of votes) {
    const p = v.player
    if (!p) continue
    const prev = byPlayer.get(p.id)
    if (prev) prev.count += 1
    else byPlayer.set(p.id, { name: p.name, number: p.number, count: 1 })
  }
  const topPlayers = Array.from(byPlayer.values()).sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, 'de')).slice(0, 5)

  return (
    <main id="main-content" className="flex-1">
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <Link href="/profil" className="inline-flex items-center gap-2 rounded-lg text-sm font-medium text-fc-fg/70 transition-colors hover:text-fc-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fc-violet focus-visible:ring-offset-2 focus-visible:ring-offset-fc-bg">
            <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Zurück zum Profil
          </Link>
          <Link href="/spielplan"><Button variant="outline" size="sm">Zu den Spielen</Button></Link>
        </div>

        <div className="mb-8 flex items-center gap-3">
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-fc-violet/15 ring-1 ring-fc-violet/25">
            <Vote className="h-6 w-6 text-fc-violet" aria-hidden="true" />
          </span>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-fc-fg md:text-4xl">Meine Stimmen</h1>
            <p className="mt-1 text-fc-fg/70">Deine „Spieler des Spiels“-Wahl pro Partie und deine häufigsten Favoriten.</p>
          </div>
        </div>

        <div className="mb-8 grid gap-4 sm:grid-cols-2">
          <Card className="border-fc-border/70">
            <CardContent className="pt-5">
              <p className="flex items-center gap-1.5 text-sm text-fc-fg/60"><Star className="h-4 w-4" aria-hidden="true" /> Abgegebene Stimmen</p>
              <p className="mt-1 text-3xl font-bold tabular-nums text-fc-fg">{votes.length}</p>
              <p className="mt-1 text-xs text-fc-fg/55">Du kannst deine Stimme je Spiel jederzeit ändern.</p>
            </CardContent>
          </Card>
          <Card className="border-fc-border/70">
            <CardHeader className="pb-2"><CardTitle className="flex items-center gap-2 text-base"><Trophy className="h-4 w-4 text-fc-violet" aria-hidden="true" /> Deine Top-Spieler</CardTitle></CardHeader>
            <CardContent>
              {topPlayers.length === 0 ? (
                <p className="text-sm text-fc-fg/65">Noch keine Favoriten – stimme auf einer Spieldetailseite ab.</p>
              ) : (
                <ol className="space-y-2 text-sm">
                  {topPlayers.map((p, i) => (
                    <li key={`${p.name}-${i}`} className="flex items-center justify-between gap-3">
                      <span className="min-w-0 truncate text-fc-fg/85">
                        <span className="mr-1.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-fc-violet/15 text-[11px] font-bold text-fc-violet">{i + 1}</span>
                        {p.number != null ? <span className="tabular-nums text-fc-fg/55">#{p.number} </span> : null}{p.name}
                      </span>
                      <span className="shrink-0 font-semibold tabular-nums text-fc-fg">{p.count}×</span>
                    </li>
                  ))}
                </ol>
              )}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader><CardTitle>Stimmen-Verlauf</CardTitle></CardHeader>
          <CardContent>
            {votes.length === 0 ? (
              <div className="py-6 text-center">
                <p className="text-fc-fg/75">Du hast noch keine Stimmen abgegeben.</p>
                <p className="mt-1 text-sm text-fc-fg/60">Wähle auf einer Spieldetailseite deinen Spieler des Spiels.</p>
                <Link href="/spielplan" className="mt-4 inline-flex"><Button variant="outline">Zum Spielplan</Button></Link>
              </div>
            ) : (
              <ul className="space-y-3">
                {votes.map((v) => {
                  const m = v.match
                  const label = m ? `${m.homeTeam.shortName || m.homeTeam.name} – ${m.awayTeam.shortName || m.awayTeam.name}` : 'Spiel'
                  return (
                    <li key={v.id} className="rounded-xl border border-fc-border/70 bg-fc-bg/20 p-4 transition-colors hover:border-fc-violet/30">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <Badge className="border-fc-violet/30 bg-fc-violet/10 text-fc-violet-light">Deine Wahl</Badge>
                            {m?.status ? <Badge variant="outline" className="text-[11px]">{m.status}</Badge> : null}
                          </div>
                          <p className="mt-1.5 font-semibold text-fc-fg">
                            {v.player ? (
                              <>{v.player.number != null ? <span className="tabular-nums text-fc-fg/60">#{v.player.number} </span> : null}{v.player.name}</>
                            ) : 'Spieler'}
                          </p>
                          {v.player?.position ? <p className="text-xs text-fc-fg/55">{positionLabel(v.player.position)}</p> : null}
                          <p className="mt-1 text-sm text-fc-fg/75">
                            Spiel: {m ? <Link href={`/spiel/${m.id}`} className="font-medium text-fc-fg hover:text-fc-violet">{label}</Link> : label}
                          </p>
                          {m ? <p className="mt-0.5 text-xs text-fc-fg/55">{formatDate(m.kickoff)} · {formatKickoff(m.kickoff)} Uhr</p> : null}
                        </div>
                        <div className="shrink-0">
                          {m ? (
                            <Link href={`/spiel/${m.id}`} className="inline-flex items-center rounded-lg border border-fc-border bg-fc-surface/60 px-3 py-2 text-sm font-medium text-fc-fg transition-colors hover:border-fc-violet/40 hover:bg-fc-violet/10">
                              Zur Abstimmung
                            </Link>
                          ) : null}
                        </div>
                      </div>
                    </li>
                  )
                })}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
