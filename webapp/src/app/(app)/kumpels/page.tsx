import type { Metadata } from 'next'
import Link from 'next/link'
import { prisma } from '@kumpelapp/db'
import { getServerSession } from '@/lib/auth-server'
import { Card, CardContent, CardHeader, CardTitle, Button, Badge } from '@kumpelapp/ui'
import { Users, Car, MapPin, Trophy } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Kumpels & Community',
  description: 'Gruppen, Tippspiel, Mitfahrbörse und Check-ins für Veilchen-Fans.',
}

export const dynamic = 'force-dynamic'

export default async function KumpelsPage() {
  const session = await getServerSession()
  const userId = session?.user?.id
  let groups: { id: string; name: string; inviteCode: string; _count: { members: number } }[] = []
  let recentRides: any[] = []
  if (userId) {
    const memberships = await prisma.groupMember.findMany({
      where: { userId },
      include: { group: { include: { _count: { select: { members: true } } } } },
      take: 10,
    }).catch(() => [])
    groups = memberships.map(m => m.group)
  }
  recentRides = await prisma.ride.findMany({
    include: { match: { select: { id: true, kickoff: true, homeTeam: { select: { shortName: true, name: true } }, awayTeam: { select: { shortName: true, name: true } } } }, user: { select: { name: true } } },
    orderBy: { createdAt: 'desc' },
    take: 5,
  }).catch(() => [])

  return (
    <main id="main-content" className="flex-1">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-fc-fg">Kumpels & Community</h1>
            <p className="mt-2 text-fc-fg/70">Gruppen, Tippspiel (3/2/1/0), Mitfahrten und „Wer ist dabei?“ – datensparsam und moderiert.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href="/tippspiel"><Button className="gap-2"><Trophy className="h-4 w-4" /> Zum Tippspiel</Button></Link>
            {!userId && <Link href="/login?callbackUrl=/kumpels"><Button variant="outline">Anmelden</Button></Link>}
          </div>
        </div>

        <div className="mt-8 grid gap-5 lg:grid-cols-3">
          <Card className="lg:col-span-2 border-fc-border/70">
            <CardHeader><CardTitle className="flex items-center gap-2"><Users className="h-5 w-5 text-fc-violet" /> Meine Gruppen</CardTitle></CardHeader>
            <CardContent>
              {!userId ? (
                <p className="text-fc-fg/70">Melde dich an, um Gruppen zu erstellen oder beizutreten.</p>
              ) : groups.length === 0 ? (
                <div className="space-y-3 text-fc-fg/70">
                  <p>Noch keine Gruppen. Erstelle eine Tipp-/Fanrunde oder tritt per Einladungscode bei.</p>
                  <CreateGroupForm />
                  <JoinGroupForm />
                </div>
              ) : (
                <div className="space-y-3">
                  {groups.map(g => (
                    <Link
                      key={g.id}
                      href={`/kumpels/gruppen/${g.id}`}
                      className="flex items-center justify-between rounded-lg border border-fc-border/60 px-4 py-3 transition-[border-color,background-color,box-shadow] duration-200 hover:border-fc-violet/35 hover:bg-fc-violet/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fc-violet focus-visible:ring-offset-2 focus-visible:ring-offset-fc-surface"
                    >
                      <div className="min-w-0">
                        <p className="font-medium text-fc-fg">{g.name}</p>
                        <p className="text-xs text-fc-fg/60">{g._count.members} Mitglieder · Code: {g.inviteCode}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Badge variant="secondary">Gruppe</Badge>
                        <span className="text-sm font-medium text-fc-violet">Öffnen →</span>
                      </div>
                    </Link>
                  ))}
                  <div className="pt-2 space-y-3"><CreateGroupForm /><JoinGroupForm /></div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-fc-border/70">
            <CardHeader><CardTitle className="flex items-center gap-2"><Trophy className="h-5 w-5 text-fc-violet" /> Punkte-System</CardTitle></CardHeader>
            <CardContent className="space-y-2 text-sm text-fc-fg/75">
              <p><strong className="text-fc-fg">3</strong> Punkte – Exaktes Ergebnis</p>
              <p><strong className="text-fc-fg">2</strong> Punkte – Richtige Tendenz & Tordifferenz</p>
              <p><strong className="text-fc-fg">1</strong> Punkt – Richtige Tendenz</p>
              <p><strong className="text-fc-fg">0</strong> Punkte – Falsch</p>
              <p className="pt-2 text-fc-fg/60">Tippabgabe bis Anstoß. Auswertung serverseitig (Domain-Logik).</p>
            </CardContent>
          </Card>
        </div>

        <div className="mt-6 grid gap-5 lg:grid-cols-2">
          <Card className="border-fc-border/70">
            <CardHeader><CardTitle className="flex items-center gap-2"><Car className="h-5 w-5 text-fc-violet" /> Mitfahrbörse (Auszug)</CardTitle></CardHeader>
            <CardContent className="space-y-3 text-sm">
              {recentRides.length === 0 ? <p className="text-fc-fg/70">Noch keine Fahrten eingetragen. Nutze Spieltage, um Angebote/Gesuche datensparsam zu teilen.</p> : recentRides.map(r => (
                <div key={r.id} className="rounded-lg border border-fc-border/60 px-3 py-2">
                  <p className="font-medium text-fc-fg">{r.kind === 'OFFER' ? 'Angebot' : 'Gesuch'}: {r.fromPlace} · {r.seats ?? '?'} Plätze</p>
                  <p className="text-fc-fg/60">{r.match?.homeTeam?.shortName || r.match?.homeTeam?.name} – {r.match?.awayTeam?.shortName || r.match?.awayTeam?.name} · von {r.user?.name || 'Fan'}</p>
                </div>
              ))}
              <div className="flex flex-wrap gap-2 pt-1">
                <Link href="/kumpels/mitfahrten"><Button variant="outline" size="sm">Mitfahrbörse öffnen</Button></Link>
              </div>
              <p className="text-xs text-fc-fg/55">Hinweis: Keine öffentlichen Echtzeit-Standorte, keine Zahlungsabwicklung. Details & Absprachen eigenverantwortlich; bei Problemen bitte melden (Moderation/Regeln).</p>
            </CardContent>
          </Card>

          <Card className="border-fc-border/70">
            <CardHeader><CardTitle className="flex items-center gap-2"><MapPin className="h-5 w-5 text-fc-violet" /> Spieltagstools</CardTitle></CardHeader>
            <CardContent className="space-y-2 text-sm text-fc-fg/75">
              <p><strong className="text-fc-fg">Check-in „Wer ist dabei?“:</strong> Status pro Spiel (dabei/vielleicht/nicht), nur für Gruppen/Account-Kontext gedacht.</p>
              <p><strong className="text-fc-fg">Auswärts-Guide:</strong> Stadion, Block, Anfahrt, Wetter – direkt zum nächsten Gegner.</p>
              <div className="flex flex-wrap gap-2 pt-2">
                <Link href="/auswaerts"><Button variant="outline" size="sm">Auswärts öffnen</Button></Link>
                <Link href="/spielplan"><Button variant="outline" size="sm">Spielplan</Button></Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  )
}

function CreateGroupForm() {
  return (
    <form action="/api/v1/groups" method="post" className="flex flex-col gap-2 sm:flex-row sm:items-center">
      <input
        name="name"
        required
        minLength={2}
        aria-label="Gruppenname"
        placeholder="Neue Gruppe (z. B. Auswärtskumpels)"
        className="h-11 flex-1 rounded-lg border border-fc-border bg-fc-bg px-3 text-sm text-fc-fg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fc-violet focus-visible:ring-offset-2 focus-visible:ring-offset-fc-surface"
      />
      <Button type="submit">Gruppe erstellen</Button>
    </form>
  )
}

function JoinGroupForm() {
  return (
    <form action="/api/v1/groups/join" method="post" className="flex flex-col gap-2 sm:flex-row sm:items-center">
      <input
        name="inviteCode"
        required
        aria-label="Einladungscode"
        placeholder="Einladungscode eingeben"
        className="h-11 flex-1 rounded-lg border border-fc-border bg-fc-bg px-3 text-sm text-fc-fg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fc-violet focus-visible:ring-offset-2 focus-visible:ring-offset-fc-surface"
      />
      <Button type="submit" variant="outline">Beitreten</Button>
    </form>
  )
}
