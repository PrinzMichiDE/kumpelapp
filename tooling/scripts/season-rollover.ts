import { prisma } from '@kumpelapp/db'

/**
 * Saison-Rollover (A5): legt neue Saison/Liga (RLNO) an, aktiviert sie und gibt einen Prüfreport aus.
 *
 * Usage:
 *   pnpm tsx tooling/scripts/season-rollover.ts <startYear> <endYear> [label]
 * Beispiel:
 *   pnpm tsx tooling/scripts/season-rollover.ts 2026 2027 "2026/27"
 */
async function main() {
  const [startArg, endArg, labelArg] = process.argv.slice(2)
  const startYear = Number(startArg)
  const endYear = Number(endArg)
  const label = labelArg || (startYear && endYear ? `${startYear}/${String(endYear).slice(-2)}` : '')

  if (!Number.isInteger(startYear) || !Number.isInteger(endYear) || !label) {
    console.error('Usage: tsx tooling/scripts/season-rollover.ts <startYear> <endYear> [label]')
    process.exit(1)
  }
  if (endYear !== startYear + 1) {
    console.warn(`[warn] endYear (${endYear}) ist nicht startYear+1 (${startYear + 1}). Bitte Saisonlabel/-jahre prüfen.`)
  }

  const startedAt = Date.now()
  const result = await prisma.$transaction(async (tx) => {
    await tx.season.updateMany({ data: { isCurrent: false } })
    const season = await tx.season.upsert({
      where: { label },
      update: { startYear, endYear, isCurrent: true },
      create: { label, startYear, endYear, isCurrent: true },
    })

    const league = await tx.league.upsert({
      where: { shortcut_seasonId: { shortcut: 'rlno', seasonId: season.id } },
      update: { name: 'Regionalliga Nordost', tier: 4 },
      create: { name: 'Regionalliga Nordost', shortcut: 'rlno', tier: 4, seasonId: season.id },
    })

    const [teams, venues, matches, standings, ownTeams] = await Promise.all([
      tx.team.count(),
      tx.venue.count(),
      tx.match.count({ where: { leagueId: league.id } }),
      tx.standing.count({ where: { leagueId: league.id } }),
      tx.team.count({ where: { isOwn: true } }),
    ])

    return { season, league, counts: { teams, venues, matches, standings, ownTeams } }
  })

  const durationMs = Date.now() - startedAt
  console.log('✅ Saison-Rollover abgeschlossen')
  console.log(JSON.stringify({
    season: { id: result.season.id, label: result.season.label, startYear: result.season.startYear, endYear: result.season.endYear, isCurrent: result.season.isCurrent },
    league: { id: result.league.id, name: result.league.name, shortcut: 'rlno', tier: result.league.tier },
    counts: result.counts,
    durationMs,
  }, null, 2))

  console.log('\nNächste Schritte (A5):')
  console.log('- Teams/LeagueEntries für neue Saison prüfen/anlegen (Teilnehmerfeld RLNO).')
  console.log('- Seeds/Reviews aktualisieren: venues, away-info, traditions, quiz, squad/news/streams falls relevant.')
  console.log('- OpenLigaDB-Sync für neue Saison ausführen und SourceSyncLog prüfen.')
  console.log('- Smoke-Test: Start, Spielplan, Tabelle, Matchdetail, Stadionmodus, Auswärts, Admin-Sync.')
  console.log('- Kritische Venue-Felder und Transparenz/Overrides verifizieren (siehe docs/season-rollover-checklist.md).')
}

main().catch((e) => {
  console.error('❌ Saison-Rollover fehlgeschlagen:', e)
  process.exit(1)
}).finally(async () => {
  await prisma.$disconnect()
})
