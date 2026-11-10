import { NextResponse } from 'next/server'
import { prisma } from '@kumpelapp/db'
import { MatchDto } from '@kumpelapp/api-contracts'

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const m = await prisma.match.findUnique({
      where: { id },
      include: {
        venue: {
          select: {
            id: true,
            name: true,
            city: true,
            lat: true,
            lng: true,
            awayBlockInfo: true,
            travelCar: true,
            travelTrain: true,
            parkingInfo: true,
          },
        },
        homeTeam: { select: { id: true, name: true, shortName: true, logoUrl: true, isOwn: true } },
        awayTeam: { select: { id: true, name: true, shortName: true, logoUrl: true, isOwn: true } },
        events: { orderBy: { minute: 'asc' } },
        sales: { take: 1, orderBy: { saleStart: 'asc' } },
        streams: { select: { name: true, url: true, kind: true } },
      },
    })

    if (!m) {
      return NextResponse.json({ error: { code: 'NOT_FOUND', message: 'Spiel nicht gefunden' } }, { status: 404 })
    }

    const sale = m.sales[0]
    const data = MatchDto.parse({
      id: m.id,
      leagueId: m.leagueId,
      externalId: m.externalId,
      source: m.source,
      matchday: m.matchday,
      kickoff: m.kickoff.toISOString(),
      status: m.status,
      venue: m.venue
        ? {
            id: m.venue.id,
            name: m.venue.name,
            city: m.venue.city,
            lat: m.venue.lat,
            lng: m.venue.lng,
            awayBlockInfo: m.venue.awayBlockInfo,
            travelCar: m.venue.travelCar,
            travelTrain: m.venue.travelTrain,
            parkingInfo: m.venue.parkingInfo,
          }
        : null,
      homeTeam: m.homeTeam,
      awayTeam: m.awayTeam,
      homeGoals: m.homeGoals,
      awayGoals: m.awayGoals,
      halftimeHome: m.halftimeHome,
      halftimeAway: m.halftimeAway,
      attendance: m.attendance,
      editorNote: m.editorNote,
      events: m.events,
      ticketSale: sale
        ? {
            saleStart: sale.saleStart ? sale.saleStart.toISOString() : null,
            saleEnd: sale.saleEnd ? sale.saleEnd.toISOString() : null,
            shopUrl: sale.shopUrl,
            awayContingent: sale.awayContingent,
          }
        : null,
      streams: m.streams,
      weather: null,
    })

    return NextResponse.json(
      { data },
      { headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' } }
    )
  } catch (error) {
    console.error('Match API error:', error)
    return NextResponse.json(
      { error: { code: 'UPSTREAM_UNAVAILABLE', message: 'Spiel konnte nicht geladen werden' } },
      { status: 503 }
    )
  }
}
