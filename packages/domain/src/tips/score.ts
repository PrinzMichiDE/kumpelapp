export interface TipScoreInput {
  homeGoals: number
  awayGoals: number
}

export interface MatchResult {
  homeGoals: number
  awayGoals: number
}

export function scoreTip(tip: TipScoreInput, result: MatchResult): 0 | 1 | 2 | 3 {
  if (tip.homeGoals === result.homeGoals && tip.awayGoals === result.awayGoals) {
    return 3
  }

  const tipDiff = tip.homeGoals - tip.awayGoals
  const resultDiff = result.homeGoals - result.awayGoals

  const tipTendency = Math.sign(tipDiff)
  const resultTendency = Math.sign(resultDiff)

  if (tipDiff === resultDiff) {
    return 2
  }

  if (tipTendency === resultTendency && tipTendency !== 0) {
    return 1
  }

  return 0
}