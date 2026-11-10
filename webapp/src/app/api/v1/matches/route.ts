import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@kumpelapp/db'
import { MatchListDto } from '@kumpelapp/api-contracts'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const timeframe = searchParams.get('timeframe')
    const team = searchParams.get('team')
    const matchday = searchParams.get('matchday')
    const status = searchParams.get('status')
    const limitParam = searchParams.get('limit')
    const limit = Math.min(Math.max(Number(limitParam) || 50, 1), 200)
    const now = new Date()

    const where: Record<string, unknown> = {}
    if (timeframe === 'upcoming') where.kickoff = { gte: now }
    if (timeframe === 'past') where.kickoff = { lt: now }
    if (matchday) where.matchday = Number(matchday)
    if (status) where.status = status
    if (team) {
      where.OR = [{ homeTeamId: team }, { awayTeamId: team }]
    }

    const rows = await prisma.match.findMany({
      where,
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
      orderBy: { kickoff: timeframe === 'past' ? 'desc' : 'asc' },
      take: limit,
    })

    const data = MatchListDto.parse(
      rows.map((m) => {
        const sale = m.sales[0]
        return {
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
        }
      })
    )

    return NextResponse.json(
      { data },
      { headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' } }
    )
  } catch (error) {
    console.error('Matches API error:', error)
    return NextResponse.json(
      { error: { code: 'UPSTREAM_UNAVAILABLE', message: 'Spiele konnten nicht geladen werden' } },
      { status: 503 }
    )
  }
}
