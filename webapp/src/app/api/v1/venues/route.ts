import { NextResponse } from 'next/server'
import { prisma } from '@kumpelapp/db'
import { VenueListDto } from '@kumpelapp/api-contracts'

export async function GET() {
  try {
    const rows = await prisma.venue.findMany({
      orderBy: [{ city: 'asc' }, { name: 'asc' }],
      take: 200,
    })

    const data = VenueListDto.parse(
      rows.map((v) => ({
        id: v.id,
        slug: v.slug,
        name: v.name,
        address: v.address,
        city: v.city,
        lat: v.lat,
        lng: v.lng,
        capacity: v.capacity,
        distanceKm: v.distanceKm,
        travelMinutesCar: v.travelMinutesCar,
        awayBlockInfo: v.awayBlockInfo,
        travelCar: v.travelCar,
        travelTrain: v.travelTrain,
        parkingInfo: v.parkingInfo,
        website: v.website,
        imageUrl: v.imageUrl,
        reviewStatus: v.reviewStatus,
        source: v.source,
        sourceUrl: v.sourceUrl,
        attribution: v.attribution,
        fieldSources: (v.fieldSources as Record<string, string> | null) ?? null,
        coverage: (v.coverage as Record<string, string> | null) ?? null,
        fetchedAt: v.fetchedAt ? v.fetchedAt.toISOString() : null,
      }))
    )

    return NextResponse.json(
      { data },
      { headers: { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400' } }
    )
  } catch (error) {
    console.error('Venues API error:', error)
    return NextResponse.json(
      { error: { code: 'UPSTREAM_UNAVAILABLE', message: 'Stadien konnten nicht geladen werden' } },
      { status: 503 }
    )
  }
}
