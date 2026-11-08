import { StandingDto } from '@kumpelapp/api-contracts'
import { Card, CardContent, CardHeader, CardTitle } from '@kumpelapp/ui'
import { Badge } from '@kumpelapp/ui'
import { Trophy, TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { cn } from '@kumpelapp/utils'

const BASE_DATE = new Date('2026-08-01T00:00:00Z')

interface StandingRowProps {
  standing: StandingDto
  index: number
  isAue: boolean
}

function StandingRow({ standing, index, isAue }: StandingRowProps) {
  const formChars = standing.form?.split(',') || []
  const lastFive = formChars.slice(-5)

  const formLabel = (result: string) => {
    switch (result) {
      case 'W':
        return 'Sieg'
      case 'D':
        return 'Unentschieden'
      case 'L':
        return 'Niederlage'
      default:
        return 'Unbekannt'
    }
  }

  const getFormIcon = (result: string) => {
    switch (result) {
      case 'W':
        return <TrendingUp className="h-4 w-4 text-fc-win" aria-hidden="true" />
      case 'D':
        return <Minus className="h-4 w-4 text-fc-draw" aria-hidden="true" />
      case 'L':
        return <TrendingDown className="h-4 w-4 text-fc-loss" aria-hidden="true" />
      default:
        return null
    }
  }

  return (
    <tr
      className={cn(
        'border-b border-fc-border/70 transition-colors duration-150 hover:bg-fc-violet/5',
        isAue && 'bg-fc-violet/12 font-medium ring-1 ring-inset ring-fc-violet/20'
      )}
    >
      <td className="px-4 py-3 text-center text-sm font-bold tabular-nums text-fc-fg">{index + 1}.</td>
      <th scope="row" className="px-4 py-3 text-left font-normal">
        <div className="flex items-center gap-3">
          {standing.team.logoUrl ? (
            <img
              src={standing.team.logoUrl}
              alt=""
              className="h-6 w-6 shrink-0 rounded-full bg-fc-border/30 object-contain"
              loading="lazy"
            />
          ) : null}
          <span className={cn('font-medium text-fc-fg', isAue && 'text-fc-violet-light')}>
            {standing.team.shortName || standing.team.name}
            {isAue ? <span className="sr-only"> (FC Erzgebirge Aue)</span> : null}
          </span>
        </div>
      </th>
      <td className="px-4 py-3 text-center text-sm tabular-nums text-fc-fg/90">{standing.played}</td>
      <td className="px-4 py-3 text-center text-sm tabular-nums text-fc-win">{standing.won}</td>
      <td className="px-4 py-3 text-center text-sm tabular-nums text-fc-draw">{standing.drawn}</td>
      <td className="px-4 py-3 text-center text-sm tabular-nums text-fc-loss">{standing.lost}</td>
      <td className="px-4 py-3 text-center text-sm tabular-nums text-fc-fg/90">
        {standing.goalsFor}:{standing.goalsAgainst}
      </td>
      <td className="px-4 py-3 text-center text-sm tabular-nums text-fc-fg/90">
        {standing.goalsFor - standing.goalsAgainst >= 0 ? '+' : ''}
        {standing.goalsFor - standing.goalsAgainst}
      </td>
      <td className="px-4 py-3 text-center text-base font-bold tabular-nums text-fc-fg">{standing.points}</td>
      <td className="px-4 py-3">
        <div className="flex items-center justify-center gap-1" aria-label={`Form: ${lastFive.map(formLabel).join(', ')}`}>
          {lastFive.map((result, i) => (
            <span
              key={`${standing.id}-form-${i}`}
              className="flex h-6 w-6 items-center justify-center rounded-md bg-fc-bg/30"
              title={formLabel(result)}
            >
              {getFormIcon(result)}
            </span>
          ))}
        </div>
      </td>
    </tr>
  )
}

export default function TabellePage() {
  return (
    <div className="min-h-screen bg-fc-bg">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-fc-fg">Tabelle</h1>
          <p className="mt-2 text-fc-fg/70">Regionalliga Nordost 2026/27</p>
        </div>

        <Card className="overflow-hidden">
          <CardHeader className="border-b border-fc-border/70">
            <CardTitle className="text-xl">Regionalliga Nordost</CardTitle>
            <p className="text-sm text-fc-fg/60">Aktueller Tabellenstand mit Form der letzten fünf Spiele.</p>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto overscroll-x-contain">
              <table className="w-full min-w-[720px] border-collapse text-left" aria-label="Tabelle Regionalliga Nordost">
                <caption className="sr-only">
                  Tabelle der Regionalliga Nordost mit Platz, Verein, Spielen, Siegen, Unentschieden, Niederlagen, Toren,
                  Differenz, Punkten und Form.
                </caption>
                <thead>
                  <tr className="bg-fc-surface/90">
                    <th scope="col" className="sticky top-0 bg-fc-surface/95 px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-fc-fg/65">
                      <abbr title="Platz" className="no-underline">#</abbr>
                    </th>
                    <th scope="col" className="sticky top-0 bg-fc-surface/95 px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-fc-fg/65">
                      Verein
                    </th>
                    <th scope="col" className="sticky top-0 bg-fc-surface/95 px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-fc-fg/65">
                      <abbr title="Spiele" className="no-underline">Sp</abbr>
                    </th>
                    <th scope="col" className="sticky top-0 bg-fc-surface/95 px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-fc-fg/65">
                      <abbr title="Siege" className="no-underline">S</abbr>
                    </th>
                    <th scope="col" className="sticky top-0 bg-fc-surface/95 px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-fc-fg/65">
                      <abbr title="Unentschieden" className="no-underline">U</abbr>
                    </th>
                    <th scope="col" className="sticky top-0 bg-fc-surface/95 px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-fc-fg/65">
                      <abbr title="Niederlagen" className="no-underline">N</abbr>
                    </th>
                    <th scope="col" className="sticky top-0 bg-fc-surface/95 px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-fc-fg/65">
                      Tore
                    </th>
                    <th scope="col" className="sticky top-0 bg-fc-surface/95 px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-fc-fg/65">
                      <abbr title="Tordifferenz" className="no-underline">Diff</abbr>
                    </th>
                    <th scope="col" className="sticky top-0 bg-fc-surface/95 px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-fc-fg/65">
                      <abbr title="Punkte" className="no-underline">Pkt</abbr>
                    </th>
                    <th scope="col" className="sticky top-0 bg-fc-surface/95 px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-fc-fg/65">
                      Form
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-card">
                  <StandingRow
                    standing={{
                      id: '1',
                      leagueId: '1',
                      team: {
                        id: '1',
                        name: 'FC Rot-Weiß Erfurt',
                        shortName: 'RWE',
                        logoUrl: null,
                      },
                      position: 1,
                      played: 16,
                      won: 10,
                      drawn: 4,
                      lost: 2,
                      goalsFor: 32,
                      goalsAgainst: 15,
                      points: 34,
                      form: 'W,W,D,W,W',
                      goalDifference: 17,
                      updatedAt: BASE_DATE.toISOString(),
                    }}
                    index={0}
                    isAue={false}
                  />
                  <StandingRow
                    standing={{
                      id: '2',
                      leagueId: '1',
                      team: {
                        id: '2',
                        name: 'Chemnitzer FC',
                        shortName: 'CFC',
                        logoUrl: null,
                        
                      },
                      position: 2,
                      played: 16,
                      won: 9,
                      drawn: 5,
                      lost: 2,
                      goalsFor: 28,
                      goalsAgainst: 12,
                      points: 32,
                      form: 'W,D,W,W,D',
                      goalDifference: 16,
                      updatedAt: BASE_DATE.toISOString(),
                    }}
                    index={1}
                    isAue={false}
                  />
                  <StandingRow
                    standing={{
                      id: '3',
                      leagueId: '1',
                      team: {
                        id: '3',
                        name: 'Hallescher FC',
                        shortName: 'HFC',
                        logoUrl: null,
                        
                      },
                      position: 3,
                      played: 16,
                      won: 9,
                      drawn: 3,
                      lost: 4,
                      goalsFor: 30,
                      goalsAgainst: 18,
                      points: 30,
                      form: 'L,W,W,D,W',
                      goalDifference: 12,
                      updatedAt: BASE_DATE.toISOString(),
                    }}
                    index={2}
                    isAue={false}
                  />
                  <StandingRow
                    standing={{
                      id: '4',
                      leagueId: '1',
                      team: {
                        id: '4',
                        name: 'BFC Dynamo',
                        shortName: 'BFC',
                        logoUrl: null,
                        
                      },
                      position: 4,
                      played: 16,
                      won: 8,
                      drawn: 5,
                      lost: 3,
                      goalsFor: 26,
                      goalsAgainst: 14,
                      points: 29,
                      form: 'D,W,L,W,W',
                      goalDifference: 12,
                      updatedAt: BASE_DATE.toISOString(),
                    }}
                    index={3}
                    isAue={false}
                  />
                  <StandingRow
                    standing={{
                      id: '5',
                      leagueId: '1',
                      team: {
                        id: '5',
                        name: 'VSG Altglienicke',
                        shortName: 'VSG',
                        logoUrl: null,
                        
                      },
                      position: 5,
                      played: 16,
                      won: 8,
                      drawn: 4,
                      lost: 4,
                      goalsFor: 25,
                      goalsAgainst: 16,
                      points: 28,
                      form: 'W,W,D,L,W',
                      goalDifference: 9,
                      updatedAt: BASE_DATE.toISOString(),
                    }}
                    index={4}
                    isAue={false}
                  />
                  <StandingRow
                    standing={{
                      id: '6',
                      leagueId: '1',
                      team: {
                        id: '6',
                        name: 'Greifswalder FC',
                        shortName: 'GFC',
                        logoUrl: null,
                        
                      },
                      position: 6,
                      played: 16,
                      won: 8,
                      drawn: 3,
                      lost: 5,
                      goalsFor: 24,
                      goalsAgainst: 19,
                      points: 27,
                      form: 'L,W,D,W,L',
                      goalDifference: 5,
                      updatedAt: BASE_DATE.toISOString(),
                    }}
                    index={5}
                    isAue={false}
                  />
                  <StandingRow
                    standing={{
                      id: '7',
                      leagueId: '1',
                      team: {
                        id: '7',
                        name: 'FC Erzgebirge Aue',
                        shortName: 'AUE',
                        logoUrl: null,
                      },
                      position: 7,
                      played: 16,
                      won: 7,
                      drawn: 5,
                      lost: 4,
                      goalsFor: 23,
                      goalsAgainst: 17,
                      points: 26,
                      form: 'W,D,W,W,D',
                      goalDifference: 6,
                      updatedAt: BASE_DATE.toISOString(),
                    }}
                    index={6}
                    isAue={true}
                  />
                  <StandingRow
                    standing={{
                      id: '8',
                      leagueId: '1',
                      team: {
                        id: '8',
                        name: '1. FC Lok Leipzig',
                        shortName: 'LOK',
                        logoUrl: null,
                        
                      },
                      position: 8,
                      played: 16,
                      won: 7,
                      drawn: 4,
                      lost: 5,
                      goalsFor: 22,
                      goalsAgainst: 18,
                      points: 25,
                      form: 'D,L,W,D,W',
                      goalDifference: 4,
                      updatedAt: BASE_DATE.toISOString(),
                    }}
                    index={7}
                    isAue={false}
                  />
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-fc-fg/60">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-fc-win" />
            <span>S = Sieg</span>
          </div>
          <div className="flex items-center gap-2">
            <Minus className="h-4 w-4 text-fc-draw" />
            <span>U = Unentschieden</span>
          </div>
          <div className="flex items-center gap-2">
            <TrendingDown className="h-4 w-4 text-fc-loss" />
            <span>N = Niederlage</span>
          </div>
          <div className="flex items-center gap-2">
            <Trophy className="h-4 w-4 text-fc-violet" />
            <span>Form = Letzte 5 Spiele</span>
          </div>
        </div>
      </div>
    </div>
  )
}