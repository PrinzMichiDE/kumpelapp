import { NextResponse } from 'next/server'
import { prisma } from '@kumpelapp/db'
import { getUpcomingSquadBirthdays } from '@/lib/squad-birthdays'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const team =
      (await prisma.team.findFirst({
        where: { isOwn: true, kind: 'SENIOR' },
        select: { id: true, name: true },
      })) ??
      (await prisma.team.findFirst({
        where: { isOwn: true },
        select: { id: true, name: true },
      }))

    if (!team) {
      return NextResponse.json(
        { data: { today: [], upcoming: [] }, team: null, season: null },
        { headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=1800' } },
      )
    }

    const currentSeason = await prisma.season.findFirst({
      where: { isCurrent: true },
      select: { id: true, label: true },
    })

    const rows = await prisma.player.findMany({
      where: {
        teamId: team.id,
        birthDate: { not: null },
        ...(currentSeason ? { OR: [{ seasonId: currentSeason.id }, { seasonId: null }] } : {}),
      },
      select: {
        id: true,
        name: true,
        number: true,
        position: true,
        imageUrl: true,
        birthDate: true,
      },
    })

    const players = rows
      .filter((r) => r.birthDate)
      .map((r) => ({
        id: r.id,
        name: r.name,
        number: r.number,
        position: r.position,
        imageUrl: r.imageUrl,
        birthDate: r.birthDate!.toISOString(),
      }))

    const data = getUpcomingSquadBirthdays(players, new Date(), 8)

    return NextResponse.json(
      {
        data,
        team,
        season: currentSeason,
        meta: {
          playersWithBirthDate: players.length,
        },
      },
      { headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=1800' } },
    )
  } catch (error) {
    console.error('Squad birthdays API error:', error)
    return NextResponse.json(
      { error: { code: 'UPSTREAM_UNAVAILABLE', message: 'Geburtstage konnten nicht geladen werden' } },
      { status: 503 },
    )
  }
}
