#!/usr/bin/env tsx

import { syncOpenLigaDB } from '@kumpelapp/ingest'
import { prisma } from '@kumpelapp/db'

async function main() {
  const season = process.argv[2] // e.g., "2026"
  
  console.log('🚀 Starting OpenLigaDB ingestion...')
  console.log(`Season: ${season || 'current'}`)
  console.log('')

  try {
    const result = await syncOpenLigaDB(season)
    
    console.log('')
    console.log('✅ Ingestion completed!')
    console.log(`   Matches: ${result.matches.created} created, ${result.matches.updated} updated`)
    console.log(`   Standings: ${result.standings.created} created, ${result.standings.updated} updated`)
    
    if (result.errors.length > 0) {
      console.log(`   ⚠️  Errors: ${result.errors.length}`)
      result.errors.forEach(err => console.log(`      - ${err}`))
    }
    
  } catch (error) {
    console.error('❌ Ingestion failed:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()