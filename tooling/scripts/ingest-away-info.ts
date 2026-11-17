#!/usr/bin/env tsx
import { prisma } from '@kumpelapp/db'
import { ingestAwayInfo } from '@kumpelapp/ingest'

async function main() {
  console.log('🚀 Away-info ingestion (Venue-Review/Anreicherung)...')
  const startedAt = Date.now()
  try {
    const result = await ingestAwayInfo()
    const durationMs = Date.now() - startedAt
    console.log('✅ Away-info ingestion completed')
    console.log(JSON.stringify({ created: result.created, updated: result.updated, errors: result.errors.length, durationMs }, null, 2))
    if (result.errors.length) {
      console.log('Errors (max 20):')
      result.errors.slice(0, 20).forEach((e) => console.log(` - ${e}`))
    }
    console.log('Hinweis: Nur belegbare Informationen übernehmen; Review-Status und fetchedAt/Feldquellen prüfen.')
  } catch (error) {
    console.error('❌ Away-info ingestion failed:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()
