import { prisma } from '@kumpelapp/db'

interface StreamLink {
  matchId: string
  name: string
  url: string
  kind: 'AUDIO' | 'VIDEO'
}

export async function syncStreams(): Promise<{ created: number; updated: number; errors: string[] }> {
  const result = { created: 0, updated: 0, errors: [] as string[] }

  try {
    console.log('Starting streams sync...')

    // Known streams for FC Erzgebirge Aue
    const streams = [
      { name: 'Steigerfunk', url: 'https://steigerfunk.de/live', kind: 'AUDIO' as const },
      { name: 'MDR Livestream', url: 'https://www.mdr.de/livestream', kind: 'VIDEO' as const },
      { name: 'Sporttotal', url: 'https://www.sporttotal.tv', kind: 'VIDEO' as const },
    ]

    // Get upcoming matches for the next 7 days
    const upcomingMatches = await prisma.match.findMany({
      where: {
        kickoff: {
          gte: new Date(),
          lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
        status: 'SCHEDULED',
      },
      select: {
        id: true,
      },
    })

    for (const match of upcomingMatches) {
      for (const stream of streams) {
        try {
          // Check if stream already exists for this match
          const existing = await prisma.streamLink.findFirst({
            where: {
              matchId: match.id,
              name: stream.name,
            },
          })

          if (!existing) {
            await prisma.streamLink.create({
              data: {
                matchId: match.id,
                name: stream.name,
                url: stream.url,
                kind: stream.kind,
              },
            })
          }
        } catch (error) {
          result.errors.push(`Stream ${stream.name} for match ${match.id}: ${error}`)
        }
      }
    }

    console.log('Streams sync completed')

  } catch (error) {
    result.errors.push(`Streams sync failed: ${error}`)
  }

  return result
}