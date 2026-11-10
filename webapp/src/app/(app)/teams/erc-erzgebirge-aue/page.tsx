import Link from 'next/link'
import { prisma } from '@kumpelapp/db'
import { Card, CardContent, CardHeader, CardTitle } from '@kumpelapp/ui'
import { ArrowLeft, ArrowRight, CalendarDays, SearchX, Shield, Trophy, Users } from 'lucide-react'
import { formatDateTime } from '@kumpelapp/utils'

export const dynamic = 'force-dynamic'

function formatResult(home: number | null, away: number | null) {
  if (home == null || away == null) return '–:–'
  return `${home}:${away}`
}

export default async function ErsteMannschaftPage() {
  let team: { id: string; name: string; shortName: string | null } | null = null
  let nextMatch: { id: string; kickoff: Date; home: string; away: string; venue: string | null; competition: string } | null = null
  let lastMatch: { id: string; kickoff: Date; home: string; away: string; homeScore: number | null; awayScore: number | null; competition: string } | null = null
  let standing: { position: number; points: number; played: number; won: number; drawn: number; lost: number; goalsFor: number; goalsAgainst: number; league: string; season: string } | null = null
  let players: { id: string; name: string; position: string; number: number | null }[] = []
  let loadError = false

  try {
    const teamRow = await prisma.team.findFirst({
      where: {
        OR: [
          { slug: 'erc-erzgebirge-aue' },
          { slug: 'fc-erzgebirge-aue' },
          { isOwn: true, name: { contains: 'Aue', mode: 'insensitive' } },
          { isOwn: true },
        ],
      },
      orderBy: [{ isOwn: 'desc' }, { updatedAt: 'desc' }],
      select: { id: true, name: true, shortName: true },
    })
    team = teamRow

    if (teamRow) {
      const now = new Date()
      const [next, last, standingRow, playerRows] = await Promise.all([
        prisma.match.findFirst({
          where: { kickoff: { gte: now }, OR: [{ homeTeamId: teamRow.id }, { awayTeamId: teamRow.id }] },
          orderBy: { kickoff: 'asc' },
          include: { homeTeam: { select: { name: true, shortName: true } }, awayTeam: { select: { name: true, shortName: true } }, venue: { select: { name: true } }, league: { select: { name: true } } },
        }),
        prisma.match.findFirst({
          where: { kickoff: { lt: now }, status: 'FINISHED', OR: [{ homeTeamId: teamRow.id }, { awayTeamId: teamRow.id }] },
          orderBy: { kickoff: 'desc' },
          include: { homeTeam: { select: { name: true, shortName: true } }, awayTeam: { select: { name: true, shortName: true } }, league: { select: { name: true } } },
        }),
        prisma.standing.findFirst({
          where: { teamId: teamRow.id },
          orderBy: { updatedAt: 'desc' },
          include: { league: { select: { name: true, season: { select: { name: true } } } } },
        }),
        prisma.player.findMany({
          where: { teamId: teamRow.id },
          orderBy: [{ position: 'asc' }, { number: 'asc' }, { name: 'asc' }],
          take: 12,
          select: { id: true, name: true, position: true, number: true },
        }),
      ])

      if (next) {
        nextMatch = {
          id: next.id,
          kickoff: next.kickoff,
          home: next.homeTeam.shortName || next.homeTeam.name,
          away: next.awayTeam.shortName || next.awayTeam.name,
          venue: next.venue?.name ?? null,
          competition: next.league.name,
        }
      }
      if (last) {
        lastMatch = {
          id: last.id,
          kickoff: last.kickoff,
          home: last.homeTeam.shortName || last.homeTeam.name,
          away: last.awayTeam.shortName || last.awayTeam.name,
          homeScore: last.homeScore,
          awayScore: last.awayScore,
          competition: last.league.name,
        }
      }
      if (standingRow) {
        standing = {
          position: standingRow.position,
          points: standingRow.points,
          played: standingRow.played,
          won: standingRow.won,
          drawn: standingRow.drawn,
          lost: standingRow.lost,
          goalsFor: standingRow.goalsFor,
          goalsAgainst: standingRow.goalsAgainst,
          league: standingRow.league.name,
          season: standingRow.league.season.name,
        }
      }
      players = playerRows
    }
  } catch (e) {
    console.error('Team hub load error', e)
    loadError = true
  }

  const posLabel = (p: string) => (p === 'GOALKEEPER' ? 'TW' : p === 'DEFENDER' ? 'ABW' : p === 'MIDFIELDER' ? 'MF' : 'ST')

  return (
    <div className="min-h-screen bg-fc-bg">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Link href="/verein" className="inline-flex items-center gap-1.5 text-sm font-medium text-fc-fg/70 hover:text-fc-violet focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fc-violet focus-visible:ring-offset-2 focus-visible:ring-offset-fc-bg rounded">
            <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Zurück zum Verein
          </Link>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-fc-fg md:text-4xl">{team?.name || '1. Mannschaft'}</h1>
          <p className="mt-2 text-fc-fg/70">Team-Hub: Spiele, Tabelle, Kader und Schnellzugriffe – aus der Datenbank.</p>
        </div>

        {loadError ? (
          <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-fc-border/70 bg-fc-surface/40 py-16 text-center text-fc-fg/70">
            <SearchX className="h-10 w-10 text-fc-fg/40" aria-hidden="true" />
            <p className="text-base font-medium text-fc-fg">Teamdaten konnten nicht geladen werden</p>
            <p className="max-w-md text-sm text-fc-fg/60">Bitte später erneut versuchen oder Datenbankverbindung prüfen.</p>
          </div>
        ) : (
          <>
            <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3">
              <Card>
                <CardHeader className="pb-2"><CardTitle className="flex items-center gap-2 text-lg"><CalendarDays className="h-5 w-5 text-fc-violet" aria-hidden="true" />Nächstes Spiel</CardTitle></CardHeader>
                <CardContent className="pt-0">
                  {nextMatch ? (
                    <div className="space-y-1 text-sm text-fc-fg/80">
                      <p className="font-semibold text-fc-fg">{nextMatch.home} – {nextMatch.away}</p>
                      <p>{formatDateTime(nextMatch.kickoff)}</p>
                      <p className="text-fc-fg/60">{nextMatch.competition}{nextMatch.venue ? ` • ${nextMatch.venue}` : ''}</p>
                      <Link href={`/spiel/${nextMatch.id}`} className="mt-2 inline-flex items-center gap-1 font-medium text-fc-violet hover:text-fc-violet-light">Zum Spiel <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
                    </div>
                  ) : (
                    <p className="text-sm text-fc-fg/60">Kein kommendes Spiel in der Datenbank.</p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2"><CardTitle className="flex items-center gap-2 text-lg"><Shield className="h-5 w-5 text-fc-violet" aria-hidden="true" />Letztes Ergebnis</CardTitle></CardHeader>
                <CardContent className="pt-0">
                  {lastMatch ? (
                    <div className="space-y-1 text-sm text-fc-fg/80">
                      <p className="font-semibold text-fc-fg">{lastMatch.home} {formatResult(lastMatch.homeScore, lastMatch.awayScore)} {lastMatch.away}</p>
                      <p>{formatDateTime(lastMatch.kickoff)}</p>
                      <p className="text-fc-fg/60">{lastMatch.competition}</p>
                      <Link href={`/spiel/${lastMatch.id}`} className="mt-2 inline-flex items-center gap-1 font-medium text-fc-violet hover:text-fc-violet-light">Zum Spiel <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
                    </div>
                  ) : (
                    <p className="text-sm text-fc-fg/60">Kein abgeschlossenes Spiel in der Datenbank.</p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2"><CardTitle className="flex items-center gap-2 text-lg"><Trophy className="h-5 w-5 text-fc-violet" aria-hidden="true" />Tabellenplatz</CardTitle></CardHeader>
                <CardContent className="pt-0">
                  {standing ? (
                    <div className="space-y-1 text-sm text-fc-fg/80">
                      <p className="text-2xl font-bold tabular-nums text-fc-fg">{standing.position}. <span className="text-base font-semibold text-fc-fg/70">Platz</span></p>
                      <p>{standing.points} Punkte • {standing.played} Spiele</p>
                      <p className="text-fc-fg/60">{standing.won}S {standing.drawn}U {standing.lost}N • {standing.goalsFor}:{standing.goalsAgainst} Tore</p>
                      <p className="text-fc-fg/50">{standing.league} • {standing.season}</p>
                      <Link href="/tabelle" className="mt-2 inline-flex items-center gap-1 font-medium text-fc-violet hover:text-fc-violet-light">Zur Tabelle <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
                    </div>
                  ) : (
                    <p className="text-sm text-fc-fg/60">Keine Tabellendaten für dieses Team in der Datenbank.</p>
                  )}
                </CardContent>
              </Card>
            </div>

            <section className="mb-8" aria-labelledby="squad-preview-heading">
              <div className="mb-4 flex items-center justify-between gap-3">
                <h2 id="squad-preview-heading" className="text-2xl font-bold tracking-tight text-fc-fg">Kader (Auszug)</h2>
                <Link href="/kader" className="inline-flex items-center gap-1 text-sm font-medium text-fc-violet hover:text-fc-violet-light">Kompletter Kader <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
              </div>
              {players.length ? (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {players.map((p) => (
                    <Card key={p.id}>
                      <CardContent className="flex items-center gap-3 py-4">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-fc-violet/12 text-sm font-bold tabular-nums text-fc-violet ring-1 ring-fc-violet/20">
                          {p.number ?? '–'}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate font-medium text-fc-fg">{p.name}</p>
                          <p className="text-xs uppercase tracking-wide text-fc-fg/55">{posLabel(p.position)}</p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-fc-border/70 bg-fc-surface/40 py-12 text-center text-fc-fg/70">
                  <Users className="h-10 w-10 text-fc-fg/40" aria-hidden="true" />
                  <p className="text-base font-medium text-fc-fg">Keine Spieler für dieses Team hinterlegt</p>
                  <p className="max-w-md text-sm text-fc-fg/60">Synchronisiere Kaderdaten im Admin-Bereich, um Spieler anzuzeigen.</p>
                </div>
              )}
            </section>

            <section aria-labelledby="quick-links-heading">
              <h2 id="quick-links-heading" className="mb-4 text-2xl font-bold tracking-tight text-fc-fg">Schnellzugriffe</h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                {[
                  { href: '/spielplan', title: 'Spielplan', desc: 'Alle kommenden und vergangenen Spiele' },
                  { href: '/tabelle', title: 'Tabelle', desc: 'Aktueller Tabellenstand und Statistiken' },
                  { href: '/kader', title: 'Kader', desc: 'Kompletter Kader mit Positionen' },
                ].map((item) => (
                  <Link key={item.href} href={item.href} className="block rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fc-violet focus-visible:ring-offset-2 focus-visible:ring-offset-fc-bg">
                    <Card className="h-full transition-[border-color,box-shadow] duration-200 hover:border-fc-violet/35 hover:shadow-md hover:shadow-fc-violet/5">
                      <CardContent className="pt-6">
                        <p className="font-semibold text-fc-fg">{item.title}</p>
                        <p className="mt-1 text-sm text-fc-fg/65">{item.desc}</p>
                        <span className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-fc-violet">Öffnen <ArrowRight className="h-4 w-4" aria-hidden="true" /></span>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  )
}
