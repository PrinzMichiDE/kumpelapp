import type { PlayerDto } from '@kumpelapp/api-contracts'
import { prisma } from '@kumpelapp/db'
import { Badge, Card } from '@kumpelapp/ui'
import { cn } from '@kumpelapp/utils'
import { AlertCircle, Goal, SearchX, Shield, User } from 'lucide-react'

export const dynamic = 'force-dynamic'

const positionConfig = {
  GOALKEEPER: {
    label: 'Torwart',
    icon: Shield,
    chip: 'bg-fc-violet/12 text-fc-violet ring-1 ring-inset ring-fc-violet/20',
    badge: 'border-fc-violet/25 bg-fc-violet/10 text-fc-violet-light',
  },
  DEFENDER: {
    label: 'Abwehr',
    icon: Shield,
    chip: 'bg-sky-500/12 text-sky-300 ring-1 ring-inset ring-sky-400/20',
    badge: 'border-sky-400/25 bg-sky-500/10 text-sky-200',
  },
  MIDFIELDER: {
    label: 'Mittelfeld',
    icon: Goal,
    chip: 'bg-emerald-500/12 text-emerald-300 ring-1 ring-inset ring-emerald-400/20',
    badge: 'border-emerald-400/25 bg-emerald-500/10 text-emerald-200',
  },
  FORWARD: {
    label: 'Sturm',
    icon: Goal,
    chip: 'bg-rose-500/12 text-rose-300 ring-1 ring-inset ring-rose-400/20',
    badge: 'border-rose-400/25 bg-rose-500/10 text-rose-200',
  },
} as const

function PlayerCard({ player }: { player: PlayerDto }) {
  const config = positionConfig[player.position]
  const Icon = config.icon

  return (
    <Card className="group flex flex-col items-center gap-4 p-4 transition-[border-color,box-shadow,transform,background-color] duration-200 hover:-translate-y-0.5 hover:border-fc-violet/40 hover:shadow-lg hover:shadow-fc-violet/5 sm:flex-row sm:items-center">
      <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full bg-fc-surface ring-1 ring-fc-border/70">
        {player.imageUrl ? (
          <img
            src={player.imageUrl}
            alt={`Foto von ${player.name}`}
            className="h-full w-full object-cover"
            loading="lazy"
            decoding="async"
          />
        ) : (
          <div className={cn('flex h-full w-full items-center justify-center', config.chip)}>
            <Icon className="h-7 w-7" aria-hidden="true" />
          </div>
        )}
      </div>
      <div className="min-w-0 flex-1 text-center sm:text-left">
        <div className="mb-1 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
          <span className="text-lg font-bold leading-tight text-fc-fg">{player.name}</span>
          {player.number != null ? (
            <Badge variant="secondary" className="tabular-nums text-xs">
              #{player.number}
            </Badge>
          ) : null}
          {player.isLegend ? (
            <Badge variant="outline" className="border-amber-400/30 bg-amber-500/10 text-amber-200">
              Legende
            </Badge>
          ) : null}
        </div>
        <div className="flex flex-wrap items-center justify-center gap-2 text-sm text-fc-fg/65 sm:justify-start">
          <Badge variant="outline" className={cn('font-medium', config.badge)}>
            <Icon className="mr-1 h-3 w-3" aria-hidden="true" />
            {config.label}
          </Badge>
          {player.nationality ? (
            <span className="inline-flex items-center gap-1 rounded-md bg-fc-bg/35 px-2 py-0.5">
              <User className="h-3 w-3" aria-hidden="true" />
              {player.nationality}
            </span>
          ) : null}
        </div>
      </div>
    </Card>
  )
}

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

  const grouped = (['GOALKEEPER', 'DEFENDER', 'MIDFIELDER', 'FORWARD'] as const).map((position) => ({
    position,
    players: players.filter((p) => p.position === position),
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
          </p>
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
            {grouped.map(({ position, players: list }) => {
              const config = positionConfig[position]
              const Icon = config.icon
              return (
                <section key={position} aria-labelledby={`${position}-heading`}>
                  <div className="mb-4 flex items-center gap-3">
                    <div className={cn('flex h-10 w-10 items-center justify-center rounded-xl', config.chip)}>
                      <Icon className="h-5 w-5" aria-hidden="true" />
                    </div>
                    <div>
                      <h2 id={`${position}-heading`} className="text-xl font-bold tracking-tight text-fc-fg sm:text-2xl">
                        {config.label}
                      </h2>
                      <p className="text-sm text-fc-fg/55">
                        {list.length} {list.length === 1 ? 'Spieler' : 'Spieler'}
                      </p>
                    </div>
                  </div>
                  {list.length ? (
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      {list.map((player) => (
                        <PlayerCard key={player.id} player={player} />
                      ))}
                    </div>
                  ) : (
                    <p className="rounded-lg border border-dashed border-fc-border/70 bg-fc-surface/30 px-4 py-3 text-sm text-fc-fg/55">
                      Keine Spieler in dieser Position hinterlegt.
                    </p>
                  )}
                </section>
              )
            })}
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