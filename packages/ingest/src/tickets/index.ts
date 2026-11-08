import { prisma } from '@kumpelapp/db'

interface TicketSaleInfo {
  matchId: string
  saleStart: Date
  saleEnd?: Date
  shopUrl: string
  awayContingent?: string
  note?: string
}

export async function syncTicketSales(): Promise<{ created: number; updated: number; errors: string[] }> {
  const result = { created: 0, updated: 0, errors: [] as string[] }

  try {
    console.log('Starting ticket sales sync...')

    // Get Aue team first
    const aueTeam = await prisma.team.findFirst({ where: { slug: 'fc-erzgebirge-aue' } })
    const aueTeamId = aueTeam?.id

    // Get upcoming matches
    const upcomingMatches = await prisma.match.findMany({
      where: {
        kickoff: {
          gte: new Date(),
          lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // Next 30 days
        },
        status: 'SCHEDULED',
      },
    })

    // Known ticket sale patterns for FC Erzgebirge Aue
    for (const match of upcomingMatches) {
      try {
        const isAueHome = match.homeTeamId === aueTeamId

        // Sale typically starts 2-4 weeks before match
        const saleStart = new Date(match.kickoff.getTime() - 21 * 24 * 60 * 60 * 1000) // 3 weeks before
        const saleEnd = new Date(match.kickoff.getTime() - 2 * 60 * 60 * 1000) // 2 hours before kickoff

        const ticketData = {
          matchId: match.id,
          saleStart,
          saleEnd,
          shopUrl: 'https://customer59.ticketing.cloud.sap/shop?shopid=103',
          awayContingent: !isAueHome ? 'Gästekarten verfügbar über Gastverein' : undefined,
          note: isAueHome ? 'Heimspiel - Mitglieder-Vorverkauf 48h vor öffentlichem Verkauf' : 'Auswärtsspiel - Karten über Gastverein',
        }

        const existing = await prisma.ticketSale.findFirst({
          where: { matchId: match.id },
        })

        if (existing) {
          await prisma.ticketSale.update({
            where: { id: existing.id },
            data: ticketData,
          })
        } else {
          await prisma.ticketSale.create({
            data: ticketData,
          })
        }
      } catch (error) {
        result.errors.push(`Ticket sale for match ${match.id}: ${error}`)
      }
    }

    console.log('Ticket sales sync completed')

  } catch (error) {
    result.errors.push(`Ticket sales sync failed: ${error}`)
  }

  return result
}