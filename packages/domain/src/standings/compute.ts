export interface FormResult {
  results: Array<'W' | 'D' | 'L'>
  maxLength?: number
}

export function computeForm(results: Array<'W' | 'D' | 'L'>, window = 5): string {
  if (results.length === 0) return ''
  const recent = results.slice(-window)
  return recent.join(',')
}

export interface StandingRow {
  teamId: string
  teamName: string
  played: number
  won: number
  drawn: number
  lost: number
  goalsFor: number
  goalsAgainst: number
  points: number
}

export function compareStandingRows(a: StandingRow, b: StandingRow): number {
  if (a.points !== b.points) return b.points - a.points

  const diffA = a.goalsFor - a.goalsAgainst
  const diffB = b.goalsFor - b.goalsAgainst
  if (diffA !== diffB) return diffB - diffA

  if (a.goalsFor !== b.goalsFor) return b.goalsFor - a.goalsFor

  return a.teamName.localeCompare(b.teamName)
}

export function calculateStandings(
  matches: Array<{
    homeTeamId: string
    awayTeamId: string
    homeGoals: number | null
    awayGoals: number | null
    status: string
  }>,
  teams: Map<string, { name: string }>
): StandingRow[] {
  const stats = new Map<string, StandingRow>()

  for (const team of teams.values()) {
    stats.set(team.name, {
      teamId: '',
      teamName: team.name,
      played: 0,
      won: 0,
      drawn: 0,
      lost: 0,
      goalsFor: 0,
      goalsAgainst: 0,
      points: 0,
    })
  }

  for (const match of matches) {
    if (match.status !== 'FINISHED' || match.homeGoals === null || match.awayGoals === null) {
      continue
    }

    const homeTeam = teams.get(match.homeTeamId)
    const awayTeam = teams.get(match.awayTeamId)
    if (!homeTeam || !awayTeam) continue

    const homeStat = stats.get(homeTeam.name)!
    const awayStat = stats.get(awayTeam.name)!

    homeStat.played++
    awayStat.played++

    homeStat.goalsFor += match.homeGoals
    homeStat.goalsAgainst += match.awayGoals
    awayStat.goalsFor += match.awayGoals
    awayStat.goalsAgainst += match.homeGoals

    if (match.homeGoals > match.awayGoals) {
      homeStat.won++
      homeStat.points += 3
      awayStat.lost++
    } else if (match.homeGoals < match.awayGoals) {
      awayStat.won++
      awayStat.points += 3
      homeStat.lost++
    } else {
      homeStat.drawn++
      homeStat.points += 1
      awayStat.drawn++
      awayStat.points += 1
    }
  }

  return Array.from(stats.values()).sort(compareStandingRows)
}