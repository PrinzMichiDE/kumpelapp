#!/usr/bin/env tsx
import { prisma } from '@kumpelapp/db'
import { ingestQuiz } from '@kumpelapp/ingest'

async function main() {
  console.log('🚀 Quiz seed ingestion (C4 Qualitätspfad)...')
  const startedAt = Date.now()
  try {
    const result = await ingestQuiz()
    const durationMs = Date.now() - startedAt
    console.log('✅ Quiz ingestion completed')
    console.log(JSON.stringify({ created: result.created, updated: result.updated, errors: result.errors.length, durationMs }, null, 2))
    if (result.errors.length) {
      console.log('Errors (max 20):')
      result.errors.slice(0, 20).forEach((e) => console.log(` - ${e}`))
    }
    console.log('Hinweis: Fragen auf Fakten, Eindeutigkeit, Duplikate und Review-Status prüfen.')
  } catch (error) {
    console.error('❌ Quiz ingestion failed:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()
