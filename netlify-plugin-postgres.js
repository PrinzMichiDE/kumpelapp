/**
 * Netlify Plugin für PostgreSQL
 * Erstellt automatisch die Datenbank-Verbindung und migriert bei Deploy
 */

const { execSync } = require('child_process')

module.exports = {
  name: 'netlify-plugin-postgres',
  onPreBuild: async ({ utils }) => {
    if (!process.env.DATABASE_URL) {
      utils.build.failBuild(
        'DATABASE_URL ist nicht gesetzt. Bitte netlify addons:create postgres ausführen.'
      )
    }

    try {
      execSync('pnpm db:generate', { stdio: 'inherit', cwd: 'packages/db' })
      console.log('Prisma Client generiert')
    } catch (error) {
      utils.build.failBuild(`Prisma Client Generierung fehlgeschlagen: ${error}`)
    }
  },

  onPostBuild: async ({ utils }) => {
    try {
      execSync('pnpm db:migrate deploy', { stdio: 'inherit', cwd: 'packages/db' })
      console.log('Migrationen ausgeführt')
    } catch (error) {
      utils.build.failBuild(`Migration fehlgeschlagen: ${error}`)
    }

    if (process.env.SEED_DATABASE === 'true') {
      try {
        execSync('pnpm db:seed', { stdio: 'inherit' })
        console.log('Seed Daten eingefügt')
      } catch (error) {
        console.warn('Seed fehlgeschlagen (evtl. schon vorhanden):', error)
      }
    }
  },
}
