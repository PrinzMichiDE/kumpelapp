import type { Metadata } from 'next'
import Link from 'next/link'
import { prisma } from '@kumpelapp/db'
import { getServerSession } from '@/lib/auth-server'
import { Card, CardContent, CardHeader, CardTitle, Button } from '@kumpelapp/ui'
import { formatDate, formatKickoff } from '@kumpelapp/utils'
import { MitfahrtenClient } from './mitfahrten-client'

export const metadata: Metadata = { title: 'Mitfahrbörse', description: 'Fahrgemeinschaften zu Aue-Spielen.' }
export const dynamic = 'force-dynamic'

export default async function MitfahrtenPage() {
  const session = await getServerSession()
  const userId = session?.user?.id ?? null
  const now = new Date()
  const threshold = new Date(now.getTime() - 6 * 60 * 60 * 1000)
  const matches = await prisma.match.findMany({ where: { kickoff: { gte: new Date(now.getTime() - 48 * 3600_000) } }, include: { homeTeam: true, awayTeam: true }, orderBy: { kickoff: 'asc' }, take: 12 }).catch(() => [])
  const [upcomingRides, pastRides] = await Promise.all([
    prisma.ride.findMany({
      where: { departAt: { gte: threshold } },
      include: { user: { select: { id: true, name: true } }, match: { include: { homeTeam: true, awayTeam: true } } },
      orderBy: { departAt: 'asc' },
      take: 30,
    }).catch(() => []),
    prisma.ride.findMany({
      where: { departAt: { lt: threshold } },
      include: { user: { select: { id: true, name: true } }, match: { include: { homeTeam: true, awayTeam: true } } },
      orderBy: { departAt: 'desc' },
      take: 10,
    }).catch(() => []),
  ])
  return (
    <main id="main-content" className="flex-1">
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-fc-fg">Mitfahrbörse</h1>
        <p className="mt-2 text-fc-fg/70">Angebote und Gesuche für gemeinsame An-/Abreise zu Aue-Spielen. Datensparsam: nur notwendige Angaben, keine öffentlichen Echtzeit-Standorte, keine Zahlungsabwicklung in der App.</p>
        <div className="mt-4 rounded-xl border border-fc-draw/25 bg-fc-draw/10 p-4 text-sm text-fc-fg/80">
          <p className="font-medium text-fc-fg">Sicherheits- & Nutzungshinweise</p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-fc-fg/75">
            <li>Teile keine sensiblen persönlichen Daten öffentlich (Adresse, Telefonnummer nur wenn unbedingt nötig und eigenverantwortlich).</li>
            <li>Treffpunkte und Details am besten direkt und vorsichtig abstimmen. Prüfe Angebote/Gesuche vor Fahrtantritt.</li>
            <li>Missbrauch oder problematische Inhalte bitte melden (Profil/Einstellungen/Redaktion), damit Einträge geprüft werden können.</li>
          </ul>
        </div>

        <Card className="mt-8 border-fc-border/70">
          <CardHeader><CardTitle>Fahrt eintragen</CardTitle></CardHeader>
          <CardContent>
            {!session?.user ? <p className="text-fc-fg/70"><Link className="text-fc-violet hover:underline" href="/login?callbackUrl=/kumpels/mitfahrten">Anmelden</Link>, um eine Fahrt anzubieten oder zu suchen.</p> : (
              <form action="/api/v1/rides" method="post" className="grid gap-3 sm:grid-cols-2">
                <label className="text-sm sm:col-span-2">Spiel
                  <select name="matchId" required className="mt-1 w-full rounded-md border border-fc-border bg-fc-bg px-3 py-2">
                    <option value="">Bitte wählen</option>
                    {matches.map(m => <option key={m.id} value={m.id}>{formatDate(m.kickoff)} {formatKickoff(m.kickoff)} – {m.homeTeam.shortName||m.homeTeam.name} vs {m.awayTeam.shortName||m.awayTeam.name}</option>)}
                  </select>
                </label>
                <label className="text-sm">Art
                  <select name="kind" className="mt-1 w-full rounded-md border border-fc-border bg-fc-bg px-3 py-2"><option value="OFFER">Angebot</option><option value="REQUEST">Gesuch</option></select>
                </label>
                <label className="text-sm">Abfahrt von<input name="fromPlace" required className="mt-1 w-full rounded-md border border-fc-border bg-fc-bg px-3 py-2" placeholder="z. B. Aue Bahnhof" /></label>
                <label className="text-sm">Abfahrt (Datum/Zeit)<input name="departAt" type="datetime-local" required className="mt-1 w-full rounded-md border border-fc-border bg-fc-bg px-3 py-2" /></label>
                <label className="text-sm">Plätze<input name="seats" type="number" min={1} max={8} className="mt-1 w-full rounded-md border border-fc-border bg-fc-bg px-3 py-2" /></label>
                <label className="text-sm sm:col-span-2">Hinweis (optional)<input name="note" maxLength={140} className="mt-1 w-full rounded-md border border-fc-border bg-fc-bg px-3 py-2" placeholder="Treffpunkt, Rückfahrt etc." /></label>
                <div className="sm:col-span-2"><Button type="submit">Eintragen</Button></div>
              </form>
            )}
          </CardContent>
        </Card>

        <div className="mt-8 space-y-6">
          <section aria-labelledby="upcoming-rides-heading">
            <h2 id="upcoming-rides-heading" className="mb-3 text-xl font-semibold text-fc-fg">Aktuelle & kommende Fahrten</h2>
            <MitfahrtenClient
              rides={upcomingRides.map((r) => ({
                id: r.id,
                kind: r.kind,
                fromPlace: r.fromPlace,
                departAt: r.departAt.toISOString(),
                seats: r.seats,
                note: r.note,
                userId: r.userId,
                user: r.user ? { id: r.user.id, name: r.user.name } : null,
                match: r.match,
              }))}
              currentUserId={userId}
            />
          </section>

          {pastRides.length > 0 ? (
            <section aria-labelledby="past-rides-heading">
              <h2 id="past-rides-heading" className="mb-3 text-lg font-semibold text-fc-fg/90">Vergangene Einträge</h2>
              <MitfahrtenClient
                rides={pastRides.map((r) => ({
                  id: r.id,
                  kind: r.kind,
                  fromPlace: r.fromPlace,
                  departAt: r.departAt.toISOString(),
                  seats: r.seats,
                  note: r.note,
                  userId: r.userId,
                  user: r.user ? { id: r.user.id, name: r.user.name } : null,
                  match: r.match,
                }))}
                currentUserId={userId}
              />
            </section>
          ) : null}
        </div>
      </div>
    </main>
  )
}
