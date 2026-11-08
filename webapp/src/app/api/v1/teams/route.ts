import { NextResponse } from 'next/server'
import { prisma } from '@kumpelapp/db'
import { TeamListDto } from '@kumpelapp/api-contracts'

export async function GET() {
  try {
    const teams = await prisma.team.findMany({
      where: { isOwn: true },
      include: {
        venue: {
          select: {
            id: true,
            name: true,
            city: true,
            lat: true,
            lng: true,
          },
        },
      },
      orderBy: [
        { kind: 'asc' },
        { name: 'asc' },
      ],
    })

    const response = TeamListDto.parse(teams)

    return NextResponse.json(response, {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      },
    })
  } catch (error) {
    console.error('Teams API error:', error)
    return NextResponse.json(
      { error: { code: 'UPSTREAM_UNAVAILABLE', message: 'Teams konnten nicht geladen werden' } },
      { status: 503 }
    )
  }
}