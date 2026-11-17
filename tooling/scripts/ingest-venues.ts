#!/usr/bin/env tsx
import { prisma } from '@kumpelapp/db'
import { ingestVenues } from '@kumpelapp/ingest'

async function main() {
  console.log('🚀 Venue seed ingestion (A5/C1-Basis)...')
  const startedAt = Date.now()
  try {
    const result = await ingestVenues()
    const durationMs = Date.now() - startedAt
    console.log('✅ Venue ingestion completed')
    console.log(JSON.stringify({ created: result.created, updated: result.updated, errors: result.errors.length, durationMs }, null, 2))
    if (result.errors.length) {
      console.log('Errors (max 20):')
      result.errors.slice(0, 20).forEach((e) => console.log(` - ${e}`))
    }
    console.log('Hinweis: Kritische Felder (Gästeblock/Einlass/Parken/ÖPNV/Barriere) redaktionell prüfen und reviewStatus/fetchedAt pflegen.')
  } catch (error) {
    console.error('❌ Venue ingestion failed:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()
