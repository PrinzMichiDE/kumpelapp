import { describe, expect, it } from 'vitest'
import { computeForm, compareStandingRows, calculateStandings } from './compute'

describe('computeForm', () => {
  it('liefert die letzten fünf Ergebnisse als W/D/L', () => {
    expect(computeForm(['W', 'L', 'W', 'D', 'W', 'W'], 5)).toBe('L,W,D,W,W')
  })

  it('behandelt leere Arrays', () => {
    expect(computeForm([])).toBe('')
  })

  it('behandelt weniger als window Ergebnisse', () => {
    expect(computeForm(['W', 'D'], 5)).toBe('W,D')
  })
})

describe('compareStandingRows', () => {
  it('sortiert nach Punkten', () => {
    const a = { points: 10, goalsFor: 12, goalsAgainst: 5, teamName: 'B' } as any
    const b = { points: 12, goalsFor: 14, goalsAgainst: 7, teamName: 'A' } as any
    expect(compareStandingRows(a, b)).toBeGreaterThan(0)
  })

  it('bei Punktegleichstand nach Tordifferenz', () => {
    const a = { points: 10, goalsFor: 12, goalsAgainst: 5, teamName: 'B' } as any
    const b = { points: 10, goalsFor: 14, goalsAgainst: 7, teamName: 'A' } as any
    expect(compareStandingRows(a, b)).toBeGreaterThan(0)
  })

  it('bei gleicher Tordifferenz nach erzielten Toren', () => {
    const a = { points: 10, goalsFor: 12, goalsAgainst: 5, teamName: 'B' } as any
    const b = { points: 10, goalsFor: 10, goalsAgainst: 3, teamName: 'A' } as any
    expect(compareStandingRows(a, b)).toBeGreaterThan(0)
  })

  it('bei allem gleich nach Name', () => {
    const a = { points: 10, goalsFor: 12, goalsAgainst: 5, teamName: 'B' } as any
    const b = { points: 10, goalsFor: 12, goalsAgainst: 5, teamName: 'A' } as any
    expect(compareStandingRows(a, b)).toBeGreaterThan(0)
  })
})

describe('calculateStandings', () => {
  it('berechnet Tabelle korrekt', () => {
    const teams = new Map([
      ['1', { name: 'Aue' }],
      ['2', { name: 'Gegner' }],
    ])
    const matches = [
      { homeTeamId: '1', awayTeamId: '2', homeGoals: 2, awayGoals: 1, status: 'FINISHED' },
    ]
    const standings = calculateStandings(matches, teams)
    expect(standings[0].teamName).toBe('Aue')
    expect(standings[0].points).toBe(3)
    expect(standings[1].points).toBe(0)
  })

  it('behandelt Unentschieden', () => {
    const teams = new Map([
      ['1', { name: 'Aue' }],
      ['2', { name: 'Gegner' }],
    ])
    const matches = [
      { homeTeamId: '1', awayTeamId: '2', homeGoals: 1, awayGoals: 1, status: 'FINISHED' },
    ]
    const standings = calculateStandings(matches, teams)
    expect(standings[0].points).toBe(1)
    expect(standings[1].points).toBe(1)
  })
})