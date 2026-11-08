import { PlayerDto } from '@kumpelapp/api-contracts'
import { Card, CardContent, CardHeader, CardTitle } from '@kumpelapp/ui'
import { Badge } from '@kumpelapp/ui'
import { Button } from '@kumpelapp/ui'
import { User, Shield, Goal, HelpCircle } from 'lucide-react'
import { cn } from '@kumpelapp/utils'

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
    <Card className="group flex flex-col items-center gap-4 p-4 transition-[border-color,box-shadow,transform,background-color] duration-200 hover:-translate-y-0.5 hover:border-fc-violet/40 hover:shadow-lg hover:shadow-fc-violet/5 focus-within:border-fc-violet/40 sm:flex-row sm:items-center">
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
      <div className="shrink-0">
        <Button
          variant="ghost"
          size="icon"
          type="button"
          className="text-fc-fg/55 hover:text-fc-violet"
          aria-label={`Spielerdetails für ${player.name} anzeigen`}
          title="Details (demnächst verfügbar)"
        >
          <HelpCircle className="h-5 w-5" aria-hidden="true" />
        </Button>
      </div>
    </Card>
  )
}

export default function KaderPage() {
  return (
    <div className="min-h-screen bg-fc-bg">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-fc-fg">Kader</h1>
          <p className="mt-2 text-fc-fg/70">FC Erzgebirge Aue – Saison 2026/27</p>
        </div>

        <div className="space-y-8">
          {(['GOALKEEPER', 'DEFENDER', 'MIDFIELDER', 'FORWARD'] as const).map((position) => {
            const config = positionConfig[position]
            const Icon = config.icon
            const count = position === 'GOALKEEPER' ? 3 : 6

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
                    <p className="text-sm text-fc-fg/55">{count} Spieler</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {Array.from({ length: count }, (_, i) => (
                    <PlayerCard
                      key={`${position}-${i}`}
                      player={{
                        id: `${position}-${i}`,
                        name: `Spieler ${i + 1}`,
                        number:
                          i +
                          1 +
                          (position === 'DEFENDER' ? 2 : position === 'MIDFIELDER' ? 8 : position === 'FORWARD' ? 16 : 0),
                        position,
                        teamId: '1',
                        imageUrl: null,
                        nationality: 'DEU',
                        birthDate: null,
                        heightCm: null,
                        foot: 'right',
                        isLegend: false,
                        sourceUrl: '',
                      }}
                    />
                  ))}
                </div>
              </section>
            )
          })}
        </div>

        <aside className="mt-8 rounded-xl border border-fc-border/80 bg-fc-surface/60 p-5 sm:p-6" aria-label="Hinweis zu Kaderdaten">
          <h3 className="mb-2 text-base font-semibold text-fc-fg">Hinweis zu den Kaderdaten</h3>
          <p className="text-sm leading-relaxed text-fc-fg/70">
            Die Kaderdaten werden aus öffentlichen Quellen (fussball.de, fc-erzgebirge.de) aggregiert und können von der
            offiziellen Aufstellung abweichen. Für verbindliche Informationen besuche die offizielle Website.
          </p>
        </aside>
      </div>
    </div>
  )
}