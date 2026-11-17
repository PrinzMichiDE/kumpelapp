import type { PlayerDto } from '@kumpelapp/api-contracts'
import { prisma } from '@kumpelapp/db'
import { AlertCircle, SearchX } from 'lucide-react'
import { SquadBirthdaysCard } from '@/components/squad-birthdays'
import { KaderExplorer } from './kader-explorer'
import { DataMeta } from '@/components/data-meta'
import { staleLabel } from '@/lib/data-freshness'

export const dynamic = 'force-dynamic'

export default async function KaderPage() {
  let players: PlayerDto[] = []
  let teamName = 'FC Erzgebirge Aue'
  let seasonLabel: string | null = null
  let error: string | null = null

  try {
    const team =
      (await prisma.team.findFirst({
        where: { isOwn: true, kind: 'SENIOR' },
        select: { id: true, name: true },
      })) ??
      (await prisma.team.findFirst({
        where: { isOwn: true },
        select: { id: true, name: true },
      }))

    if (team) {
      teamName = team.name
      const currentSeason = await prisma.season.findFirst({
        where: { isCurrent: true },
        select: { id: true, label: true },
      })
      seasonLabel = currentSeason?.label ?? null

      const rows = await prisma.player.findMany({
        where: {
          teamId: team.id,
          ...(currentSeason ? { OR: [{ seasonId: currentSeason.id }, { seasonId: null }] } : {}),
        },
        orderBy: [{ position: 'asc' }, { number: 'asc' }, { name: 'asc' }],
      })

      players = rows.map((p) => ({
        id: p.id,
        name: p.name,
        number: p.number,
        position: p.position,
        teamId: p.teamId,
        imageUrl: p.imageUrl,
        nationality: p.nationality,
        birthDate: p.birthDate ? p.birthDate.toISOString() : null,
        heightCm: p.heightCm,
        foot: p.foot,
        isLegend: p.isLegend,
        sourceUrl: p.sourceUrl ?? null,
      }))
    }
  } catch (e) {
    error = 'Kader konnte nicht geladen werden. Bitte versuche es später erneut.'
    console.error('Kader load error', e)
  }

  const birthdayPlayers = players
    .filter((p): p is typeof p & { birthDate: string } => typeof p.birthDate === 'string' && p.birthDate.length > 0)
    .map((p) => ({
      id: p.id,
      name: p.name,
      number: p.number ?? null,
      position: p.position ?? null,
      imageUrl: p.imageUrl ?? null,
      birthDate: p.birthDate,
    }))

  return (
    <div className="min-h-screen bg-fc-bg">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-fc-fg md:text-4xl">Kader</h1>
          <p className="mt-2 text-fc-fg/70">
            {teamName}
            {seasonLabel ? ` – Saison ${seasonLabel}` : ''}
          </p>
          <p className="mt-1 text-sm text-fc-fg/55">
            {players.length} {players.length === 1 ? 'Spieler' : 'Spieler'} im Kader
            {players.length > 0 ? ' · Suche und Filter verfügbar' : ''}
          </p>
          <div className="mt-4">
            <DataMeta
              source="Kaderdaten (Sync/Seed, öffentliche Quellen)"
              reviewStatus="AUTO"
              stale={false}
              capabilityLabel="Kaderdaten können von offizieller Aufstellung abweichen"
              capabilityTone="info"
              note="Vor Spieltag/Nominierung offizielle Vereinsangaben prüfen. Quellen/Stand sind abhängig vom letzten Kader-Sync."
            />
          </div>
        </div>

        {error ? (
          <div className="flex items-center gap-3 rounded-xl border border-fc-loss/30 bg-fc-loss/10 p-5 text-fc-loss" role="alert">
            <AlertCircle className="h-5 w-5 shrink-0" aria-hidden="true" />
            <p className="text-sm font-medium">{error}</p>
          </div>
        ) : players.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-fc-border/70 bg-fc-surface/40 py-16 text-center text-fc-fg/70">
            <SearchX className="h-10 w-10 text-fc-fg/40" aria-hidden="true" />
            <p className="text-base font-medium text-fc-fg">Keine Kaderdaten vorhanden</p>
            <p className="max-w-md text-sm text-fc-fg/60">
              Aktuell sind keine Spieler in der Datenbank hinterlegt. Synchronisiere den Kader im Admin-Bereich, um Spielerprofile und Positionen anzuzeigen.
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {birthdayPlayers.length > 0 ? <SquadBirthdaysCard players={birthdayPlayers} /> : null}
            <KaderExplorer players={players} />
          </div>
        )}

        <aside className="mt-8 rounded-xl border border-fc-border/80 bg-fc-surface/60 p-5 sm:p-6" aria-label="Hinweis zu Kaderdaten">
          <h3 className="mb-2 text-base font-semibold text-fc-fg">Hinweis zu den Kaderdaten</h3>
          <p className="text-sm leading-relaxed text-fc-fg/70">
            Die Kaderdaten werden aus öffentlichen Quellen aggregiert und können von der offiziellen Aufstellung abweichen.
            Für verbindliche Informationen besuche die offizielle Website des FC Erzgebirge Aue.
          </p>
        </aside>
      </div>
    </div>
  )
}