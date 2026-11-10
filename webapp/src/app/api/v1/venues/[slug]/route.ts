import { NextResponse } from 'next/server'
import { prisma } from '@kumpelapp/db'
import { VenueDto } from '@kumpelapp/api-contracts'

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params
    const v = await prisma.venue.findUnique({ where: { slug } })

    if (!v) {
      return NextResponse.json({ error: { code: 'NOT_FOUND', message: 'Stadion nicht gefunden' } }, { status: 404 })
    }

    const data = VenueDto.parse({
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
    })

    return NextResponse.json(
      { data },
      { headers: { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400' } }
    )
  } catch (error) {
    console.error('Venue API error:', error)
    return NextResponse.json(
      { error: { code: 'UPSTREAM_UNAVAILABLE', message: 'Stadion konnte nicht geladen werden' } },
      { status: 503 }
    )
  }
}
