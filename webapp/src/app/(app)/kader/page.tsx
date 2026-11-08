import { PlayerDto } from '@kumpelapp/api-contracts'
import { Card, CardContent, CardHeader, CardTitle } from '@kumpelapp/ui'
import { Badge } from '@kumpelapp/ui'
import { Button } from '@kumpelapp/ui'
import { User, Shield, Goal, HelpCircle } from 'lucide-react'
import { cn } from '@kumpelapp/utils'

const positionConfig = {
  GOALKEEPER: { label: 'Torwart', icon: Shield, color: 'bg-fc-violet/10 text-fc-violet' },
  DEFENDER: { label: 'Abwehr', icon: Shield, color: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' },
  MIDFIELDER: { label: 'Mittelfeld', icon: Goal, color: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' },
  FORWARD: { label: 'Sturm', icon: Goal, color: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300' },
} as const

function PlayerCard({ player }: { player: PlayerDto }) {
  const config = positionConfig[player.position]
  const Icon = config.icon

  return (
    <Card className="flex flex-col sm:flex-row items-center gap-4 p-4 transition-all hover:shadow-lg hover:border-fc-violet/50">
      <div className="flex-shrink-0 w-16 h-16 rounded-full bg-fc-surface flex items-center justify-center overflow-hidden">
        {player.imageUrl ? (
          <img src={player.imageUrl} alt={player.name} className="w-full h-full object-cover" />
        ) : (
          <div className={cn('w-full h-full flex items-center justify-center', config.color)}>
            <Icon className="h-8 w-8" aria-hidden="true" />
          </div>
        )}
      </div>
      <div className="flex-1 text-center sm:text-left">
        <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
          <span className="font-bold text-lg text-fc-fg">{player.name}</span>
          {player.number && (
            <Badge variant="secondary" className="text-sm">
              #{player.number}
            </Badge>
          )}
        </div>
        <div className="flex items-center justify-center sm:justify-start gap-2 text-sm text-fc-fg/60">
          <Badge variant="outline" className={config.color.replace('bg-', 'border-').replace('text-', 'text-')}>
            <Icon className="h-3 w-3 mr-1" aria-hidden="true" />
            {config.label}
          </Badge>
          {player.nationality && (
            <span className="flex items-center gap-1">
              <User className="h-3 w-3" aria-hidden="true" />
              {player.nationality}
            </span>
          )}
        </div>
      </div>
      <div className="flex-shrink-0">
        <Button variant="ghost" size="sm" className="text-fc-fg/60 hover:text-fc-violet">
          <HelpCircle className="h-5 w-5" aria-hidden="true" />
          <span className="sr-only">Spieler-Details</span>
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

        <div className="space-y-6">
          {(['GOALKEEPER', 'DEFENDER', 'MIDFIELDER', 'FORWARD'] as const).map((position) => {
            const config = positionConfig[position]
            const Icon = config.icon

            return (
              <section key={position} aria-labelledby={`${position}-heading`}>
                <div className="flex items-center gap-3 mb-4">
                  <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center', config.color)}>
                    <Icon className="h-6 w-6" aria-hidden="true" />
                  </div>
                  <h2 id={`${position}-heading`} className="text-2xl font-bold text-fc-fg">{config.label}</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Array.from({ length: position === 'GOALKEEPER' ? 3 : 6 }, (_, i) => (
                    <PlayerCard
                      key={`${position}-${i}`}
                      player={{
                        id: `${position}-${i}`,
                        name: `Spieler ${i + 1}`,
                        number: i + 1 + (position === 'DEFENDER' ? 2 : position === 'MIDFIELDER' ? 8 : position === 'FORWARD' ? 16 : 0),
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

        <div className="mt-8 p-6 rounded-lg bg-fc-surface border border-fc-border">
          <h3 className="text-lg font-semibold text-fc-fg mb-2">Hinweis</h3>
          <p className="text-fc-fg/70">
            Die Kaderdaten werden aus öffentlichen Quellen (fussball.de, fc-erzgebirge.de) aggregiert und können
            von der offiziellen Aufstellung abweichen. Für verbindliche Informationen besuche die offizielle Website.
          </p>
        </div>
      </div>
    </div>
  )
}