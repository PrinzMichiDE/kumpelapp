import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@kumpelapp/db'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const q = searchParams.get('q')?.trim() || ''
  const city = searchParams.get('city')?.trim() || ''
  const official = searchParams.get('official')

  const where: Record<string, unknown> = {}
  if (city) where.city = { contains: city, mode: 'insensitive' }
  if (official === 'true') where.isOfficial = true
  if (official === 'false') where.isOfficial = false
  if (q) {
    where.OR = [
      { name: { contains: q, mode: 'insensitive' } },
      { city: { contains: q, mode: 'insensitive' } },
    ]
  }

  try {
    const fanclubs = await prisma.fanClub.findMany({
      where,
      orderBy: [{ isOfficial: 'desc' }, { city: 'asc' }, { name: 'asc' }],
    })

    return NextResponse.json({
      fanclubs: fanclubs.map((f) => ({
        id: f.id,
        name: f.name,
        city: f.city,
        lat: f.lat,
        lng: f.lng,
        contactUrl: f.contactUrl,
        isOfficial: f.isOfficial,
      })),
      meta: {
        total: fanclubs.length,
        officialCount: fanclubs.filter((f) => f.isOfficial).length,
        cities: Array.from(new Set(fanclubs.map((f) => f.city).filter(Boolean))).sort(),
      },
    })
  } catch (error) {
    console.error('Failed to fetch fan clubs', error)
    return NextResponse.json(
      { fanclubs: [], meta: { total: 0, officialCount: 0, cities: [] }, error: 'FAILED_TO_FETCH_FANCLUBS' },
      { status: 500 },
    )
  }
}
