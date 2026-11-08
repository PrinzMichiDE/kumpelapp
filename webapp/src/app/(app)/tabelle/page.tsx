import { StandingDto } from '@kumpelapp/api-contracts'
import { Card, CardContent, CardHeader, CardTitle } from '@kumpelapp/ui'
import { Badge } from '@kumpelapp/ui'
import { Trophy, TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { cn } from '@kumpelapp/utils'

interface StandingRowProps {
  standing: StandingDto
  index: number
  isAue: boolean
}

function StandingRow({ standing, index, isAue }: StandingRowProps) {
  const formChars = standing.form?.split(',') || []
  const lastFive = formChars.slice(-5)

  const getFormIcon = (result: string) => {
    switch (result) {
      case 'W': return <TrendingUp className="h-4 w-4 text-fc-win" />
      case 'D': return <Minus className="h-4 w-4 text-fc-draw" />
      case 'L': return <TrendingDown className="h-4 w-4 text-fc-loss" />
      default: return null
    }
  }

  return (
    <tr className={cn(
      'hover:bg-fc-violet/5 transition-colors',
      isAue && 'bg-fc-violet/10 font-medium'
    )}>
      <td className="px-4 py-3 text-center font-bold text-fc-fg">
        {index + 1}.
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          {standing.team.logoUrl && (
            <img src={standing.team.logoUrl} alt="" className="h-6 w-6 rounded-full" />
          )}
          <span className={cn('font-medium', isAue && 'text-fc-violet')}>
            {standing.team.shortName || standing.team.name}
          </span>
        </div>
      </td>
      <td className="px-4 py-3 text-center tabular-nums">{standing.played}</td>
      <td className="px-4 py-3 text-center tabular-nums text-fc-win">{standing.won}</td>
      <td className="px-4 py-3 text-center tabular-nums text-fc-draw">{standing.drawn}</td>
      <td className="px-4 py-3 text-center tabular-nums text-fc-loss">{standing.lost}</td>
      <td className="px-4 py-3 text-center tabular-nums">
        {standing.goalsFor}:{standing.goalsAgainst}
      </td>
      <td className="px-4 py-3 text-center tabular-nums">
        {standing.goalsFor - standing.goalsAgainst >= 0 ? '+' : ''}
        {standing.goalsFor - standing.goalsAgainst}
      </td>
      <td className="px-4 py-3 text-center font-bold text-lg tabular-nums">{standing.points}</td>
      <td className="px-4 py-3 text-center">
        <div className="flex items-center justify-center gap-1">
          {lastFive.map((result, i) => (
            <span key={i} className="w-6 h-6 flex items-center justify-center text-xs">
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

        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Regionalliga Nordost</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full" role="table">
                <thead>
                  <tr className="bg-fc-surface border-b border-fc-border">
                    <th className="px-4 py-3 text-left text-xs font-semibold text-fc-fg/60 uppercase tracking-wider">#</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-fc-fg/60 uppercase tracking-wider">Verein</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-fc-fg/60 uppercase tracking-wider">Sp</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-fc-fg/60 uppercase tracking-wider">S</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-fc-fg/60 uppercase tracking-wider">U</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-fc-fg/60 uppercase tracking-wider">N</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-fc-fg/60 uppercase tracking-wider">Tore</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-fc-fg/60 uppercase tracking-wider">Diff</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-fc-fg/60 uppercase tracking-wider">Pkt</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-fc-fg/60 uppercase tracking-wider">Form</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-fc-border">
                  <StandingRow
                    standing={{
                      id: '1',
                      leagueId: '1',
                      team: {
                        id: '1',
                        name: 'FC Rot-Weiß Erfurt',
                        shortName: 'RWE',
                        logoUrl: null,
                        isOwn: false,
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
                        isOwn: false,
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
                        isOwn: false,
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
                        isOwn: false,
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
                        isOwn: false,
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
                        isOwn: false,
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
                        isOwn: true,
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
                        isOwn: false,
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