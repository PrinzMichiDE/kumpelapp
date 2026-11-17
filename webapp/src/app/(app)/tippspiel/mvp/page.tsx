import type { Metadata } from 'next'
import { prisma } from '@kumpelapp/db'
import { Card, CardContent, CardHeader, CardTitle, Badge } from '@kumpelapp/ui'
import { formatDate } from '@kumpelapp/utils'

export const metadata: Metadata = { title: 'Spieler des Spiels', description: 'Fan-Voting für Spieler des Spiels.' }
export const dynamic = 'force-dynamic'

export default async function MvpPage() {
  const matches = await prisma.match.findMany({ where: { status: { in: ['FINISHED','LIVE','SCHEDULED'] } }, include: { homeTeam: true, awayTeam: true, votes: { include: { player: true } } }, orderBy: { kickoff: 'desc' }, take: 10 }).catch(() => [])
  return (
    <main id="main-content" className="flex-1">
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-fc-fg">Spieler des Spiels</h1>
        <p className="mt-2 text-fc-fg/70">Community-Voting (wenn aktiviert). Stimmen werden pro Nutzer und Spiel gezählt.</p>
        <div className="mt-8 space-y-4">
          {matches.length === 0 ? <Card className="border-fc-border/70"><CardContent className="py-6 text-fc-fg/70">Noch keine Spiele verfügbar.</CardContent></Card> : matches.map(m => {
            const counts = new Map<string, { name: string; n: number }>()
            for (const v of m.votes) counts.set(v.playerId, { name: v.player.name, n: (counts.get(v.playerId)?.n || 0) + 1 })
            const top = [...counts.values()].sort((a,b)=>b.n-a.n).slice(0,3)
            return (
              <Card key={m.id} className="border-fc-border/70">
                <CardHeader><CardTitle className="text-lg">{m.homeTeam.shortName||m.homeTeam.name} – {m.awayTeam.shortName||m.awayTeam.name} <span className="text-sm font-normal text-fc-fg/60">· {formatDate(m.kickoff)}</span></CardTitle></CardHeader>
                <CardContent>{top.length === 0 ? <p className="text-sm text-fc-fg/60">Noch keine Stimmen. Voting wird pro Match freigeschaltet, sobald Kaderdaten vorliegen.</p> : <div className="flex flex-wrap gap-2">{top.map((t,i)=><Badge key={t.name} variant={i===0?'secondary':'outline'}>{i===0?'⭐ ':''}{t.name} ({t.n})</Badge>)}</div>}</CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </main>
  )
}
