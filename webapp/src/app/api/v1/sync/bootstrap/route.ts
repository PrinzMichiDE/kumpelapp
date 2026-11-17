import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@kumpelapp/db'
import { auth } from '@kumpelapp/auth'

export async function GET(request: NextRequest) {
  try {
    // Optional auth for personalized data
    const session = await auth.api.getSession({ headers: request.headers })
    
    // Build the sync bundle
    const [currentSeason, aueTeam] = await Promise.all([
      prisma.season.findFirst({ where: { isCurrent: true } }),
      prisma.team.findFirst({ where: { slug: 'fc-erzgebirge-aue', isOwn: true } }),
    ])

    if (!currentSeason || !aueTeam) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Saison oder Team nicht gefunden' } },
        { status: 404 }
      )
    }

    // Fetch core data
    const [
      league,
      matches,
      standingsData,
      squad,
      venues,
      titles,
      seasonRecords,
      fanclubs,
      contacts,
      links,
    ] = await Promise.all([
      prisma.league.findFirst({
        where: { shortcut: 'rlno', seasonId: currentSeason.id },
        include: { season: true },
      }),
      prisma.match.findMany({
        where: {
          league: { shortcut: 'rlno', seasonId: currentSeason.id },
        },
        orderBy: { kickoff: 'asc' },
        take: 50,
        include: {
          homeTeam: { select: { id: true, name: true, shortName: true, logoUrl: true, isOwn: true } },
          awayTeam: { select: { id: true, name: true, shortName: true, logoUrl: true, isOwn: true } },
          venue: { select: { id: true, name: true, city: true, lat: true, lng: true } },
        },
      }),
      prisma.standing.findMany({
        where: { league: { shortcut: 'rlno', seasonId: currentSeason.id } },
        include: {
          team: { select: { id: true, name: true, shortName: true, logoUrl: true } },
        },
        orderBy: { position: 'asc' },
      }),
      prisma.player.findMany({
        where: { teamId: aueTeam.id },
        include: { team: { select: { id: true, name: true } } },
        orderBy: [{ position: 'asc' }, { number: 'asc' }],
      }),
      prisma.venue.findMany({
        where: { reviewStatus: { not: 'DRAFT' } },
        select: {
          id: true, slug: true, name: true, city: true, lat: true, lng: true,
          capacity: true, distanceKm: true, travelMinutesCar: true,
          awayBlockInfo: true, travelCar: true, travelTrain: true,
          parkingInfo: true, imageUrl: true, reviewStatus: true,
        },
      }),
      prisma.title.findMany({
        where: { teamId: aueTeam.id },
        orderBy: { year: 'desc' },
      }),
      prisma.seasonRecord.findMany({
        where: { teamId: aueTeam.id },
        orderBy: { label: 'desc' },
      }),
      prisma.fanClub.findMany({
        where: { isOfficial: true },
        select: { id: true, name: true, city: true, lat: true, lng: true, contactUrl: true },
      }),
      prisma.clubContact.findMany(),
      prisma.staticLink.findMany({
        orderBy: { sortOrder: 'asc' },
      }),
    ])

    // Build the sync bundle
    const matchesOut = matches.map(m => ({
      id: m.id,
      matchday: m.matchday,
      kickoff: m.kickoff.toISOString(),
      status: m.status,
      homeTeam: m.homeTeam,
      awayTeam: m.awayTeam,
      homeGoals: m.homeGoals,
      awayGoals: m.awayGoals,
      venue: m.venue,
    }))

    const standingsOut = standingsData.map(s => ({
      position: s.position,
      team: s.team,
      played: s.played,
      won: s.won,
      drawn: s.drawn,
      lost: s.lost,
      goalsFor: s.goalsFor,
      goalsAgainst: s.goalsAgainst,
      points: s.points,
      form: s.form,
    }))

    const squadOut = squad.map(p => ({
      id: p.id,
      name: p.name,
      number: p.number,
      position: p.position,
      imageUrl: p.imageUrl,
      nationality: p.nationality,
      birthDate: p.birthDate?.toISOString(),
      heightCm: p.heightCm,
      foot: p.foot,
    }))

    const bundle = {
      meta: {
        version: 1,
        generatedAt: new Date().toISOString(),
        season: currentSeason.label,
        league: league?.name,
        leagueShortcut: league?.shortcut,
      },
      teams: {
        aue: { id: aueTeam.id, name: aueTeam.name, shortName: aueTeam.shortName, logoUrl: aueTeam.logoUrl },
      },
      matches: matchesOut,
      standings: standingsOut,
      squad: squadOut,
      venues: venues,
      tradition: {
        titles: titles.map(t => ({ year: t.year, competition: t.competition, note: t.note })),
        seasonRecords: seasonRecords.map(r => ({
          label: r.label,
          leagueName: r.leagueName,
          position: r.position,
          points: r.points,
          note: r.note,
        })),
      },
      fanclubs: fanclubs,
      contacts: contacts,
      links: links,
    }

    // Generate ETag
    const etag = `"${Buffer.from(JSON.stringify(bundle)).toString('base64').slice(0, 32)}"`

    // Check if client has current version
    const ifNoneMatch = request.headers.get('if-none-match')
    if (ifNoneMatch === etag) {
      return new NextResponse(null, { status: 304 })
    }

    // Return bundle with ETag and caching headers
    return NextResponse.json(bundle, {
      headers: {
        ETag: etag,
        'Cache-Control': 'public, max-age=300, stale-while-revalidate=3600',
        'Content-Type': 'application/json',
      },
    })

  } catch (error) {
    console.error('Sync bootstrap error:', error)
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Fehler beim Laden der Sync-Daten' } },
      { status: 500 }
    )
  }
}