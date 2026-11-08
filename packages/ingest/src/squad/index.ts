import { prisma } from '@kumpelapp/db'
import { Position, TeamKind } from '@prisma/client'

interface SquadPlayer {
  name: string
  number?: number
  position: Position
  imageUrl?: string
  nationality?: string
  birthDate?: string
  heightCm?: number
  foot?: string
  sourceUrl: string
}

interface SquadIngestResult {
  created: number
  updated: number
  errors: string[]
}

async function fetchSquadFromFussballDe(): Promise<SquadPlayer[]> {
  // Placeholder - will implement actual parsing from fussball.de
  // For now, return mock data
  return [
    { name: 'Martin Männel', number: 1, position: Position.GOALKEEPER, nationality: 'DEU', birthDate: '1988-03-16', heightCm: 188, foot: 'right', sourceUrl: 'https://www.fussball.de' },
    { name: 'Erik Majetschak', number: 2, position: Position.DEFENDER, nationality: 'DEU', birthDate: '1999-06-21', heightCm: 182, foot: 'right', sourceUrl: 'https://www.fussball.de' },
    { name: 'Anthony Barylla', number: 3, position: Position.DEFENDER, nationality: 'DEU', birthDate: '1997-09-04', heightCm: 185, foot: 'left', sourceUrl: 'https://www.fussball.de' },
    { name: 'Stefano Marino', number: 4, position: Position.DEFENDER, nationality: 'DEU', birthDate: '1997-08-05', heightCm: 187, foot: 'right', sourceUrl: 'https://www.fussball.de' },
    { name: 'Kilian Jakob', number: 5, position: Position.DEFENDER, nationality: 'DEU', birthDate: '1998-02-25', heightCm: 183, foot: 'right', sourceUrl: 'https://www.fussball.de' },
    { name: 'Marco Schikora', number: 6, position: Position.MIDFIELDER, nationality: 'DEU', birthDate: '1994-01-18', heightCm: 180, foot: 'right', sourceUrl: 'https://www.fussball.de' },
    { name: 'Marvin Stefaniak', number: 7, position: Position.MIDFIELDER, nationality: 'DEU', birthDate: '1995-02-03', heightCm: 175, foot: 'right', sourceUrl: 'https://www.fussball.de' },
    { name: 'Omar Sijaric', number: 8, position: Position.MIDFIELDER, nationality: 'DEU', birthDate: '2001-01-15', heightCm: 178, foot: 'right', sourceUrl: 'https://www.fussball.de' },
    { name: 'Pascal Fallmann', number: 9, position: Position.FORWARD, nationality: 'AUT', birthDate: '2003-11-07', heightCm: 182, foot: 'right', sourceUrl: 'https://www.fussball.de' },
    { name: 'Borys Tashchy', number: 10, position: Position.FORWARD, nationality: 'UKR', birthDate: '1993-07-26', heightCm: 190, foot: 'right', sourceUrl: 'https://www.fussball.de' },
    { name: 'Marcel Bär', number: 11, position: Position.FORWARD, nationality: 'DEU', birthDate: '1992-06-09', heightCm: 185, foot: 'right', sourceUrl: 'https://www.fussball.de' },
    { name: 'Maximilian Thiel', number: 14, position: Position.MIDFIELDER, nationality: 'DEU', birthDate: '1993-07-11', heightCm: 176, foot: 'left', sourceUrl: 'https://www.fussball.de' },
    { name: 'Antonio Jonjic', number: 16, position: Position.DEFENDER, nationality: 'DEU', birthDate: '1999-01-27', heightCm: 188, foot: 'right', sourceUrl: 'https://www.fussball.de' },
    { name: 'Kilian Pagliuca', number: 17, position: Position.MIDFIELDER, nationality: 'CHE', birthDate: '1996-09-19', heightCm: 175, foot: 'right', sourceUrl: 'https://www.fussball.de' },
    { name: 'Linus Rosenlöcher', number: 18, position: Position.DEFENDER, nationality: 'DEU', birthDate: '2002-02-10', heightCm: 180, foot: 'left', sourceUrl: 'https://www.fussball.de' },
    { name: 'Bentley Baxter Bahn', number: 19, position: Position.MIDFIELDER, nationality: 'DEU', birthDate: '1992-08-09', heightCm: 183, foot: 'right', sourceUrl: 'https://www.fussball.de' },
    { name: 'Tino Mehlhorn', number: 20, position: Position.GOALKEEPER, nationality: 'DEU', birthDate: '2001-08-15', heightCm: 185, foot: 'right', sourceUrl: 'https://www.fussball.de' },
    { name: 'Finn Heidrich', number: 22, position: Position.MIDFIELDER, nationality: 'DEU', birthDate: '2004-01-23', heightCm: 178, foot: 'right', sourceUrl: 'https://www.fussball.de' },
    { name: 'Jannik Möker', number: 23, position: Position.MIDFIELDER, nationality: 'DEU', birthDate: '2003-03-08', heightCm: 179, foot: 'right', sourceUrl: 'https://www.fussball.de' },
    { name: 'Lukas Gottwalt', number: 24, position: Position.DEFENDER, nationality: 'DEU', birthDate: '2005-01-12', heightCm: 182, foot: 'right', sourceUrl: 'https://www.fussball.de' },
    { name: 'Max Uthoff', number: 25, position: Position.GOALKEEPER, nationality: 'DEU', birthDate: '2004-07-18', heightCm: 190, foot: 'right', sourceUrl: 'https://www.fussball.de' },
    { name: 'Jean Hugonet', number: 26, position: Position.DEFENDER, nationality: 'FRA', birthDate: '2003-05-14', heightCm: 184, foot: 'left', sourceUrl: 'https://www.fussball.de' },
    { name: 'Ali Loune', number: 27, position: Position.MIDFIELDER, nationality: 'MAR', birthDate: '2003-02-27', heightCm: 177, foot: 'right', sourceUrl: 'https://www.fussball.de' },
    { name: 'Niklas Jeck', number: 28, position: Position.FORWARD, nationality: 'DEU', birthDate: '2004-09-15', heightCm: 185, foot: 'right', sourceUrl: 'https://www.fussball.de' },
    { name: 'Lars Lokotsch', number: 29, position: Position.FORWARD, nationality: 'DEU', birthDate: '1996-11-24', heightCm: 188, foot: 'right', sourceUrl: 'https://www.fussball.de' },
    { name: 'Tim Danhof', number: 30, position: Position.DEFENDER, nationality: 'DEU', birthDate: '1997-04-21', heightCm: 185, foot: 'right', sourceUrl: 'https://www.fussball.de' },
  ]
}

async function fetchSquadFromFCAue(): Promise<SquadPlayer[]> {
  // Placeholder - will implement actual parsing from fc-erzgebirge.de
  // For now, return empty array (fallback)
  return []
}

export async function syncSquad(): Promise<{ created: number; updated: number; errors: string[] }> {
  const result = { created: 0, updated: 0, errors: [] as string[] }

  try {
    console.log('Starting squad sync...')

    // Get Aue team
    const aueTeam = await prisma.team.findFirst({
      where: { slug: 'fc-erzgebirge-aue', isOwn: true },
    })

    if (!aueTeam) {
      throw new Error('Aue team not found')
    }

    // Get current season
    const currentSeason = await prisma.season.findFirst({
      where: { isCurrent: true },
    })

    // Try fussball.de first, then fc-erzgebirge.de
    let players = await fetchSquadFromFussballDe()
    
    if (players.length === 0) {
      players = await fetchSquadFromFCAue()
    }

    if (players.length === 0) {
      throw new Error('No squad data found from any source')
    }

    // Upsert players
    for (const player of players) {
      try {
        const existing = await prisma.player.findFirst({
          where: {
            teamId: aueTeam.id,
            name: player.name,
            number: player.number,
          },
        })

        const playerData = {
          name: player.name,
          number: player.number,
          position: player.position,
          teamId: aueTeam.id,
          seasonId: currentSeason?.id,
          imageUrl: player.imageUrl,
          nationality: player.nationality,
          birthDate: player.birthDate ? new Date(player.birthDate) : null,
          heightCm: player.heightCm,
          foot: player.foot,
          sourceUrl: player.sourceUrl,
          externalId: `fussballde-${player.name.toLowerCase().replace(/\s+/g, '-')}-${player.number}`,
        }

        if (existing) {
          await prisma.player.update({
            where: { id: existing.id },
            data: playerData,
          })
        } else {
          await prisma.player.create({ data: playerData })
        }
      } catch (error) {
        result.errors.push(`Player ${player.name}: ${error}`)
      }
    }

    // Clean up old players not in current squad (optional, could be configured)
    // For now, we keep all historical players

    console.log('Squad sync completed')

  } catch (error) {
    result.errors.push(`Squad sync failed: ${error}`)
  }

  return result
}