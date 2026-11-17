#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client'
import { execSync } from 'child_process'

const prisma = new PrismaClient()

async function main() {
  console.log('🚀 Setting up Netlify PostgreSQL...')
  console.log('')

  // Check if DATABASE_URL is set
  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL environment variable is not set')
    console.log('   Set it with: netlify env:set DATABASE_URL "postgresql://..."')
    process.exit(1)
  }

  try {
    console.log('📦 Generating Prisma Client...')
    execSync('pnpm db:generate', { stdio: 'inherit', cwd: 'packages/db' })

    console.log('')
    console.log('🗄️  Running migrations...')
    execSync('pnpm db:migrate deploy', { stdio: 'inherit', cwd: 'packages/db' })

    console.log('')
    console.log('🌱 Seeding database...')
    execSync('pnpm db:seed', { stdio: 'inherit' })

    console.log('')
    console.log('✅ Netlify PostgreSQL setup completed!')
    console.log('')
    console.log('Next steps:')
    console.log('1. Push to GitHub: git push origin main')
    console.log('2. Deploy to Netlify: netlify deploy --prod')
    console.log('3. Configure environment variables in Netlify dashboard')

  } catch (error) {
    console.error('❌ Setup failed:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()