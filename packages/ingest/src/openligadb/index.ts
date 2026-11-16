import { prisma } from '@kumpelapp/db'
import { MatchStatus, EventType, TeamKind, ReviewStatus } from '@prisma/client'
import { scoreTip } from '@kumpelapp/domain'

const OPENLIGADB_BASE_URL = 'https://api.openligadb.de'
const LEAGUE_SHORTCUT = 'rlno' // Regionalliga Nordost

interface OpenLigaDBMatch {
  matchId: number
  matchDateTime: string
  matchDateTimeUTC: string
  leagueId: number
  leagueName: string
  leagueSeason: string
  matchDay: number
  group: { groupId: number; groupName: string; groupOrderID: number }
  team1: { teamId: number; teamName: string; shortName: string; teamIconUrl: string; teamGroupName: string }
  team2: { teamId: number; teamName: string; shortName: string; teamIconUrl: string; teamGroupName: string }
  goals: Array<{
    goalId: number
    matchId: number
    scoreTeam1: number
    scoreTeam2: number
    goalGetterId: number
    goalGetterName: string
    isPenalty: boolean
    isOwnGoal: boolean
    matchMinute: number
  }>
  location: { locationId: number; locationCity: string; locationStadium: string }
  lastUpdate: string
  matchIsFinished: boolean
  matchResults: Array<{
    resultId: number
    resultName: string
    resultOrderID: number
    resultTypeID: number
    pointsTeam1: number
    pointsTeam2: number
  }>
}

interface OpenLigaDBStanding {
  teamId: number
  teamName: string
  shortName: string
  teamIconUrl: string
  points: number
  matches: number
  won: number
  draw: number
  lost: number
  goals: number
  goalsAgainst: number
  goalDiff: number
}

interface SyncResult {
  created: number
  updated: number
  errors: string[]
}

function getSeasonYear(season: string): number {
  // "2026/2027" -> 2026
  const parts = season.split('/')
  return parseInt(parts[0] || '2026')
}

async function fetchOpenLigaDB<T>(endpoint: string): Promise<T> {
  const response = await fetch(`${OPENLIGADB_BASE_URL}${endpoint}`, {
    headers: {
      'User-Agent': 'KumpelApp/1.0 (https://kumpelapp.vercel.app; admin@kumpelapp.de)',
      'Accept': 'application/json',
    },
  })

  if (!response.ok) {
    throw new Error(`OpenLigaDB API error: ${response.status} ${response.statusText}`)
  }

  return response.json() as Promise<T>
}

async function upsertTeam(openLigaTeam: OpenLigaDBMatch['team1'], isOwn: boolean): Promise<string> {
  const existing = await prisma.team.findFirst({
    where: {
      OR: [
        { slug: openLigaTeam.teamName.toLowerCase().replace(/[^a-z0-9]+/g, '-') },
        { externalId: String(openLigaTeam.teamId) },
      ],
    },
  })

  const slug = openLigaTeam.teamName.toLowerCase().replace(/[^a-z0-9]+/g, '-')

  if (existing) {
    await prisma.team.update({
      where: { id: existing.id },
      data: {
        name: openLigaTeam.teamName,
        shortName: openLigaTeam.shortName,
        logoUrl: openLigaTeam.teamIconUrl || null,
        externalId: String(openLigaTeam.teamId),
        isOwn,
      },
    })
    return existing.id
  }

  const team = await prisma.team.create({
    data: {
      slug,
      name: openLigaTeam.teamName,
      shortName: openLigaTeam.shortName,
      kind: TeamKind.SENIOR,
      isOwn,
      logoUrl: openLigaTeam.teamIconUrl || null,
      externalId: String(openLigaTeam.teamId),
    },
  })
  return team.id
}

async function upsertVenue(location: OpenLigaDBMatch['location']): Promise<string> {
  const slug = location.locationStadium.toLowerCase().replace(/[^a-z0-9]+/g, '-')

  const existing = await prisma.venue.findUnique({ where: { slug } })

  const venueData = {
    slug,
    name: location.locationStadium,
    address: `${location.locationCity}`,
    city: location.locationCity,
    reviewStatus: ReviewStatus.AUTO,
    source: 'openligadb',
    sourceUrl: `https://api.openligadb.de/getmatchdata/${LEAGUE_SHORTCUT}/${getSeasonYear(location.locationCity ? '2026' : '2026')}`,
  }

  if (existing) {
    await prisma.venue.update({ where: { id: existing.id }, data: venueData })
    return existing.id
  }

  const venue = await prisma.venue.create({ data: venueData })
  return venue.id
}

async function upsertMatch(openLigaMatch: OpenLigaDBMatch, homeTeamId: string, awayTeamId: string, venueId: string, leagueId: string): Promise<SyncResult> {
  const result: SyncResult = { created: 0, updated: 0, errors: [] }

  try {
    const kickoff = new Date(openLigaMatch.matchDateTimeUTC)

    const existing = await prisma.match.findUnique({
      where: { externalId: String(openLigaMatch.matchId) },
      select: {
        id: true,
        editorNote: true,
        kickoff: true,
        status: true,
        homeGoals: true,
        awayGoals: true,
        halftimeHome: true,
        halftimeAway: true,
        venueId: true,
        matchday: true,
      },
    })

    const endResult = openLigaMatch.matchResults?.find((r) => r.resultTypeID === 2) ?? openLigaMatch.matchResults?.[0]
    const homeGoals = openLigaMatch.matchIsFinished ? endResult?.pointsTeam1 ?? null : null
    const awayGoals = openLigaMatch.matchIsFinished ? endResult?.pointsTeam2 ?? null : null
    const halftime = openLigaMatch.matchResults?.find((r) => r.resultTypeID === 1)
    const sourceStatus = openLigaMatch.matchIsFinished ? MatchStatus.FINISHED : MatchStatus.SCHEDULED

    const hasManualOverride = Boolean(existing?.editorNote?.trim())

    const baseData = {
      leagueId,
      externalId: String(openLigaMatch.matchId),
      source: 'openligadb',
      matchday: openLigaMatch.matchDay,
      kickoff,
      venueId,
      homeTeamId,
      awayTeamId,
      homeGoals,
      awayGoals,
      halftimeHome: halftime?.pointsTeam1 ?? null,
      halftimeAway: halftime?.pointsTeam2 ?? null,
      status: sourceStatus,
    }

    // A4: verifizierte redaktionelle Korrekturen (editorNote) nicht still überschreiben.
    // Auto-Sync aktualisiert weiterhin Zuordnung/Metadaten, erhält aber Kernfelder bei aktivem Override.
    const matchData = !existing
      ? baseData
      : hasManualOverride
        ? {
            leagueId,
            externalId: String(openLigaMatch.matchId),
            source: 'openligadb',
            homeTeamId,
            awayTeamId,
            // Kernfelder bewusst beibehalten
            matchday: existing.matchday,
            kickoff: existing.kickoff,
            venueId: existing.venueId,
            homeGoals: existing.homeGoals,
            awayGoals: existing.awayGoals,
            halftimeHome: existing.halftimeHome,
            halftimeAway: existing.halftimeAway,
            status: existing.status,
          }
        : baseData

    const saved = existing
      ? await prisma.match.update({ where: { id: existing.id }, data: matchData })
      : await prisma.match.create({ data: matchData })
    if (existing) result.updated++
    else result.created++

    // Sync events (goals, cards, etc.) nur wenn keine manuelle Ergebnis-/Statuskorrektur aktiv ist,
    // um inkonsistente Eventdaten bei Overrides zu vermeiden.
    if (openLigaMatch.goals.length > 0 && !hasManualOverride) {
      await syncMatchEvents(openLigaMatch.matchId, openLigaMatch.goals)
    }

    // Evaluate tips when result is final (auch bei manuellem Override)
    if (saved.status === MatchStatus.FINISHED && saved.homeGoals != null && saved.awayGoals != null) {
      await evaluateTipsForMatch(saved.id, saved.homeGoals, saved.awayGoals)
    }

  } catch (error) {
    result.errors.push(`Match ${openLigaMatch.matchId}: ${error}`)
  }

  return result
}

async function syncMatchEvents(matchExternalId: number, goals: OpenLigaDBMatch['goals']): Promise<void> {
  const match = await prisma.match.findUnique({ where: { externalId: String(matchExternalId) } })
  if (!match) return

  // Delete existing events to avoid duplicates
  await prisma.matchEvent.deleteMany({ where: { matchId: match.id } })

  const events = goals.map((goal) => ({
    matchId: match.id,
    minute: goal.matchMinute,
    type: goal.isOwnGoal ? EventType.OWN_GOAL : goal.isPenalty ? EventType.PENALTY_GOAL : EventType.GOAL,
    side: goal.scoreTeam1 > goal.scoreTeam2 ? 'HOME' : 'AWAY',
    player: goal.goalGetterName,
    text: `${goal.goalGetterName} ${goal.isPenalty ? '(Elfmeter)' : ''}${goal.isOwnGoal ? ' (Eigentor)' : ''}`.trim(),
  }))

  if (events.length > 0) {
    await prisma.matchEvent.createMany({ data: events })
  }
}

async function evaluateTipsForMatch(matchId: string, homeGoals: number, awayGoals: number): Promise<void> {
  const tips = await prisma.tip.findMany({ where: { matchId } })
  if (tips.length === 0) return
  await Promise.all(
    tips.map((tip) =>
      prisma.tip.update({
        where: { id: tip.id },
        data: { points: scoreTip({ homeGoals: tip.homeGoals, awayGoals: tip.awayGoals }, { homeGoals, awayGoals }) },
      }),
    ),
  )
}

async function upsertStanding(openLigaStanding: OpenLigaDBStanding, leagueId: string, teamId: string): Promise<void> {
  await prisma.standing.upsert({
    where: { leagueId_teamId: { leagueId, teamId } },
    update: {
      position: 0, // Will be recalculated
      played: openLigaStanding.matches,
      won: openLigaStanding.won,
      drawn: openLigaStanding.draw,
      lost: openLigaStanding.lost,
      goalsFor: openLigaStanding.goals,
      goalsAgainst: openLigaStanding.goalsAgainst,
      points: openLigaStanding.points,
      form: '', // TODO: calculate from recent matches
    },
    create: {
      leagueId,
      teamId,
      position: 0,
      played: openLigaStanding.matches,
      won: openLigaStanding.won,
      drawn: openLigaStanding.draw,
      lost: openLigaStanding.lost,
      goalsFor: openLigaStanding.goals,
      goalsAgainst: openLigaStanding.goalsAgainst,
      points: openLigaStanding.points,
      form: '',
    },
  })
}

export async function syncOpenLigaDB(season?: string): Promise<{ matches: SyncResult; standings: SyncResult; errors: string[] }> {
  const targetSeason = season || String(new Date().getFullYear()) // e.g., "2026"
  const allErrors: string[] = []
  let totalCreated = 0
  let totalUpdated = 0
  const startedAt = Date.now()

  try {
    console.log(`Starting OpenLigaDB sync for ${LEAGUE_SHORTCUT} ${targetSeason}...`)

    // Get or create season
    const seasonLabel = `${targetSeason}/${parseInt(targetSeason) + 1}`
    const prismaSeason = await prisma.season.upsert({
      where: { label: seasonLabel },
      update: { isCurrent: true },
      create: { label: seasonLabel, startYear: parseInt(targetSeason), endYear: parseInt(targetSeason) + 1, isCurrent: true },
    })

    // Get or create league
    const league = await prisma.league.upsert({
      where: { shortcut_seasonId: { shortcut: LEAGUE_SHORTCUT, seasonId: prismaSeason.id } },
      update: {},
      create: {
        name: 'Regionalliga Nordost',
        shortcut: LEAGUE_SHORTCUT,
        tier: 4,
        seasonId: prismaSeason.id,
      },
    })

    // Fetch matches
    console.log('Fetching matches...')
    const matches = await fetchOpenLigaDB<OpenLigaDBMatch[]>(`/getmatchdata/${LEAGUE_SHORTCUT}/${targetSeason}`)

    const matchResults: SyncResult = { created: 0, updated: 0, errors: [] }

    // Process matches
    for (const match of matches) {
      try {
        const isAueHome = match.team1.teamName.includes('Erzgebirge') || match.team1.teamName.includes('Aue')
        const isAueAway = match.team2.teamName.includes('Erzgebirge') || match.team2.teamName.includes('Aue')
        const homeTeamId = await upsertTeam(match.team1, isAueHome)
        const awayTeamId = await upsertTeam(match.team2, isAueAway)
        const venueId = await upsertVenue(match.location)

        // Create league entries for teams
        await prisma.leagueEntry.upsert({
          where: { leagueId_teamId: { leagueId: league.id, teamId: homeTeamId } },
          update: {},
          create: { leagueId: league.id, teamId: homeTeamId },
        })
        await prisma.leagueEntry.upsert({
          where: { leagueId_teamId: { leagueId: league.id, teamId: awayTeamId } },
          update: {},
          create: { leagueId: league.id, teamId: awayTeamId },
        })

        const result = await upsertMatch(match, homeTeamId, awayTeamId, venueId, league.id)
        matchResults.created += result.created
        matchResults.updated += result.updated
        matchResults.errors.push(...result.errors)
      } catch (error) {
        matchResults.errors.push(`Match ${match.matchId}: ${error}`)
      }
    }

    totalCreated += matchResults.created
    totalUpdated += matchResults.updated
    allErrors.push(...matchResults.errors)

    // Fetch and sync standings
    console.log('Fetching standings...')
    const standings = await fetchOpenLigaDB<OpenLigaDBStanding[]>(`/getbltable/${LEAGUE_SHORTCUT}/${targetSeason}`)

    const standingResults: SyncResult = { created: 0, updated: 0, errors: [] }

    for (const standing of standings) {
      try {
        // Find team by external ID
        const team = await prisma.team.findFirst({ where: { externalId: String(standing.teamId) } })
        if (!team) {
          standingResults.errors.push(`Team not found for standing: ${standing.teamId}`)
          continue
        }

        await upsertStanding(standing, league.id, team.id)
        standingResults.updated++
      } catch (error) {
        standingResults.errors.push(`Standing ${standing.teamId}: ${error}`)
      }
    }

    totalCreated += standingResults.created
    totalUpdated += standingResults.updated
    allErrors.push(...standingResults.errors)

    // Recalculate positions
    await recalculateStandings(league.id)

    // Log sync result
    await prisma.sourceSyncLog.create({
      data: {
        source: 'openligadb',
        ok: allErrors.length === 0,
        durationMs: Date.now() - startedAt,
        items: totalCreated + totalUpdated,
        message: `Saison ${targetSeason}: Matches ${matchResults.created} neu, ${matchResults.updated} aktualisiert. Tabelle ${standingResults.updated} aktualisiert. Fehler ${allErrors.length}.`,
      },
    })

    console.log('OpenLigaDB sync completed')
    return { matches: matchResults, standings: standingResults, errors: allErrors }

  } catch (error) {
    console.error('OpenLigaDB sync failed:', error)
    allErrors.push(`Sync failed: ${error}`)
    await prisma.sourceSyncLog.create({
      data: {
        source: 'openligadb',
        ok: false,
        durationMs: Date.now() - startedAt,
        items: totalCreated + totalUpdated,
        message: `Sync fehlgeschlagen (${targetSeason}): ${String(error).slice(0, 500)}`,
      },
    }).catch(() => null)
    return { matches: { created: 0, updated: 0, errors: allErrors }, standings: { created: 0, updated: 0, errors: [] }, errors: allErrors }
  }
}

async function recalculateStandings(leagueId: string): Promise<void> {
  const standings = await prisma.standing.findMany({ where: { leagueId } })

  const sorted = [...standings].sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points
    const diffA = a.goalsFor - a.goalsAgainst
    const diffB = b.goalsFor - b.goalsAgainst
    if (diffA !== diffB) return diffB - diffA
    if (b.goalsFor !== a.goalsFor) return b.goalsFor - a.goalsFor
    return a.teamId.localeCompare(b.teamId)
  })

  for (let i = 0; i < sorted.length; i++) {
    const standing = sorted[i]
    if (!standing) continue
    await prisma.standing.update({
      where: { id: standing.id },
      data: { position: i + 1 },
    })
  }
}

export async function syncCurrentSeason(): Promise<void> {
  await syncOpenLigaDB(String(new Date().getFullYear()))
}

export async function syncSpecificSeason(season: string): Promise<void> {
  await syncOpenLigaDB(season)
}