import { describe, expect, it } from 'vitest'
import { scoreTip } from './score'

describe('scoreTip', () => {
  it('gibt 3 für exaktes Ergebnis', () => {
    expect(scoreTip({ homeGoals: 2, awayGoals: 1 }, { homeGoals: 2, awayGoals: 1 })).toBe(3)
  })

  it('gibt 2 für richtige Tordifferenz', () => {
    expect(scoreTip({ homeGoals: 3, awayGoals: 1 }, { homeGoals: 2, awayGoals: 0 })).toBe(2)
  })

  it('gibt 1 für richtige Tendenz', () => {
    expect(scoreTip({ homeGoals: 1, awayGoals: 0 }, { homeGoals: 3, awayGoals: 1 })).toBe(1)
  })

  it('gibt 0 bei falscher Tendenz', () => {
    expect(scoreTip({ homeGoals: 0, awayGoals: 1 }, { homeGoals: 2, awayGoals: 0 })).toBe(0)
  })

  it('gibt 2 bei richtigem Unentschieden mit falschem Stand', () => {
    expect(scoreTip({ homeGoals: 1, awayGoals: 1 }, { homeGoals: 2, awayGoals: 2 })).toBe(2)
  })

  it('ist idempotent bei wiederholter Auswertung', () => {
    const r = { homeGoals: 2, awayGoals: 2 }
    expect(scoreTip({ homeGoals: 2, awayGoals: 2 }, r)).toBe(scoreTip({ homeGoals: 2, awayGoals: 2 }, r))
  })

  it('behandelt torloses Unentschieden korrekt', () => {
    expect(scoreTip({ homeGoals: 0, awayGoals: 0 }, { homeGoals: 0, awayGoals: 0 })).toBe(3)
    expect(scoreTip({ homeGoals: 1, awayGoals: 1 }, { homeGoals: 0, awayGoals: 0 })).toBe(2)
  })
})