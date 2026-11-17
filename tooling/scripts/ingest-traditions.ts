#!/usr/bin/env tsx
import { prisma } from '@kumpelapp/db'
import { ingestTraditions } from '@kumpelapp/ingest'

async function main() {
  console.log('🚀 Tradition seed ingestion (Wismut/Veilchen-Chronik)...')
  const startedAt = Date.now()
  try {
    const result = await ingestTraditions()
    const durationMs = Date.now() - startedAt
    console.log('✅ Tradition ingestion completed')
    console.log(JSON.stringify({ created: result.created, updated: result.updated, errors: result.errors.length, durationMs }, null, 2))
    if (result.errors.length) {
      console.log('Errors (max 20):')
      result.errors.slice(0, 20).forEach((e) => console.log(` - ${e}`))
    }
    console.log('Hinweis: Fakten, Quellen/Attribution und Lizenzlage redaktionell verifizieren.')
  } catch (error) {
    console.error('❌ Tradition ingestion failed:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()
