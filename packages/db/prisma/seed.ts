import { PrismaClient, TeamKind, ReviewStatus, UserRole } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Create admin user
  const adminPassword = await hash('admin123', 12)
  await prisma.user.upsert({
    where: { email: 'admin@kumpelapp.de' },
    update: {},
    create: {
      email: 'admin@kumpelapp.de',
      name: 'Admin',
      password: adminPassword,
      role: UserRole.ADMIN,
    },
  })

  // Create test user
  const userPassword = await hash('user123', 12)
  await prisma.user.upsert({
    where: { email: 'user@kumpelapp.de' },
    update: {},
    create: {
      email: 'user@kumpelapp.de',
      name: 'Test User',
      password: userPassword,
      role: UserRole.FAN,
    },
  })

  // Create Season 2026/27
  const season = await prisma.season.upsert({
    where: { label: '2026/27' },
    update: {},
    create: {
      label: '2026/27',
      startYear: 2026,
      endYear: 2027,
      isCurrent: true,
    },
  })

  // Create League Regionalliga Nordost
  const league = await prisma.league.upsert({
    where: { shortcut_seasonId: { shortcut: 'rlno', seasonId: season.id } },
    update: {},
    create: {
      name: 'Regionalliga Nordost',
      shortcut: 'rlno',
      tier: 4,
      seasonId: season.id,
    },
  })

  // Create Venues (Stadien)
  const venuesData = [
    { slug: 'sparkassen-erzgebirgsstadion', name: 'Sparkassen-Erzgebirgsstadion', city: 'Aue-Bad Schlema', address: 'Gerd-Schädlich-Platz 1, 08280 Aue-Bad Schlema', lat: 50.5847, lng: 12.6989, capacity: 15500, distanceKm: 0, travelMinutesCar: 0, website: 'https://www.fc-erzgebirge.de/verein/stadion/erzgebirgsstadion', reviewStatus: ReviewStatus.CHECKED, source: 'manuell' },
    { slug: 'preussenstadion-stahnsdorf', name: 'Preußenstadion', city: 'Stahnsdorf', address: 'Potsdamer Str. 92, 14532 Stahnsdorf', lat: 52.3833, lng: 13.1833, capacity: 3500, distanceKm: 190, travelMinutesCar: 150, awayBlockInfo: 'Block G (Gäste)', travelCar: 'A100, A115', travelTrain: 'RE7 bis Stahnsdorf, dann Bus 620', parkingInfo: 'Gäste-Parkplatz P3 (500m)', website: 'https://www.rsv-eintracht.de', reviewStatus: ReviewStatus.AUTO, source: 'wikidata' },
    { slug: 'karl-liebknecht-stadion', name: 'Karl-Liebknecht-Stadion', city: 'Potsdam', address: 'Am Luftschiffhafen 1, 14471 Potsdam', lat: 52.4097, lng: 13.0678, capacity: 10787, distanceKm: 190, travelMinutesCar: 150, awayBlockInfo: 'Block H/I (Gäste)', travelCar: 'A100, A115', travelTrain: 'S7/RE1 bis Potsdam Hbf, dann Tram 92/96', parkingInfo: 'Parkplatz P2 (Gäste)', website: 'https://www.svbabelsberg03.de', reviewStatus: ReviewStatus.AUTO, source: 'wikidata' },
    { slug: 'stadion-altglienicke', name: 'Stadion Altglienicke', city: 'Berlin', address: 'Köpenicker Str. 158, 12555 Berlin', lat: 52.4094, lng: 13.5436, capacity: 2500, distanceKm: 195, travelMinutesCar: 160, awayBlockInfo: 'Block C (Gäste)', travelCar: 'A100, A113', travelTrain: 'S9 bis Altglienicke, dann Bus 164', parkingInfo: 'Straßenparkplätze', website: 'https://www.vsg-altglienicke.de', reviewStatus: ReviewStatus.AUTO, source: 'wikidata' },
    { slug: 'werner-seelenbinder-stadion', name: 'Werner-Seelenbinder-Stadion', city: 'Berlin', address: 'Conrad-Blenkle-Str. 25, 10369 Berlin', lat: 52.5233, lng: 13.4733, capacity: 3000, distanceKm: 195, travelMinutesCar: 160, awayBlockInfo: 'Block B (Gäste)', travelCar: 'A100, A114', travelTrain: 'S5/S7/S75 bis Ostkreuz, dann Tram 21', parkingInfo: 'Parkplatz P1 (Gäste)', website: 'https://www.tasmania-berlin.de', reviewStatus: ReviewStatus.AUTO, source: 'wikidata' },
    { slug: 'stadion-im-sportforum', name: 'Stadion im Sportforum', city: 'Berlin', address: 'Weißenseer Weg 53, 13053 Berlin', lat: 52.5556, lng: 13.4639, capacity: 7500, distanceKm: 200, travelMinutesCar: 165, awayBlockInfo: 'Block D (Gäste)', travelCar: 'A100, A114', travelTrain: 'S5/S7/S75 bis Hohenschönhausen, dann Bus 154', parkingInfo: 'Parkplatz P3 (Gäste)', website: 'https://www.bfc.com', reviewStatus: ReviewStatus.AUTO, source: 'wikidata' },
    { slug: 'alfred-kunze-sportpark', name: 'Alfred-Kunze-Sportpark', city: 'Leipzig', address: 'Lützenberger Str. 10, 04177 Leipzig', lat: 51.3397, lng: 12.3731, capacity: 4999, distanceKm: 95, travelMinutesCar: 75, awayBlockInfo: 'Block E/F (Gäste)', travelCar: 'A9, A72', travelTrain: 'ICE/RE bis Leipzig Hbf, dann Tram 7', parkingInfo: 'Parkplatz P1 (Gäste)', website: 'https://www.lok-leipzig.com', reviewStatus: ReviewStatus.AUTO, source: 'wikidata' },
    { slug: 'stadion-der-freundschaft', name: 'Stadion der Freundschaft', city: 'Cottbus', address: 'Thiemstraße 110, 03042 Cottbus', lat: 51.7611, lng: 14.3447, capacity: 22528, distanceKm: 135, travelMinutesCar: 105, awayBlockInfo: 'Block K (Gäste)', travelCar: 'A13, A15', travelTrain: 'RE1/RE2 bis Cottbus Hbf, dann Bus 2', parkingInfo: 'Parkplatz P2 (Gäste)', website: 'https://www.fcenergie.de', reviewStatus: ReviewStatus.AUTO, source: 'wikidata' },
    { slug: 'volksparkstadion-greifswald', name: 'Volksparkstadion', city: 'Greifswald', address: 'Hans-Beimler-Str. 1, 17489 Greifswald', lat: 54.0958, lng: 13.3822, capacity: 5000, distanceKm: 320, travelMinutesCar: 240, awayBlockInfo: 'Block A (Gäste)', travelCar: 'A20, A19', travelTrain: 'RE3/RE10 bis Greifswald, dann Bus 2', parkingInfo: 'Parkplatz P1 (Gäste)', website: 'https://www.greifswalder-fc.de', reviewStatus: ReviewStatus.AUTO, source: 'wikidata' },
    { slug: 'heinz-steyer-stadion', name: 'Heinz-Steyer-Stadion', city: 'Dresden', address: 'Schönfelder Str. 1, 01099 Dresden', lat: 51.0504, lng: 13.7372, capacity: 30000, distanceKm: 75, travelMinutesCar: 60, awayBlockInfo: 'Block G (Gäste)', travelCar: 'A4, A17', travelTrain: 'S1/S2 bis Dresden Mitte, dann Tram 10', parkingInfo: 'Parkplatz P1 (Gäste)', website: 'https://www.dynamo-dresden.de', reviewStatus: ReviewStatus.AUTO, source: 'wikidata' },
    { slug: 'ernst-grube-stadion', name: 'Ernst-Grube-Stadion', city: 'Magdeburg', address: 'Wilhelm-Höcker-Str. 1, 39108 Magdeburg', lat: 52.1277, lng: 11.6292, capacity: 25000, distanceKm: 220, travelMinutesCar: 180, awayBlockInfo: 'Block H (Gäste)', travelCar: 'A2, A14', travelTrain: 'ICE/IC bis Magdeburg Hbf, dann Tram 5', parkingInfo: 'Parkplatz P3 (Gäste)', website: 'https://www.1fcm.de', reviewStatus: ReviewStatus.AUTO, source: 'wikidata' },
    { slug: 'stadion-am-luftschiffhafen', name: 'Stadion am Luftschiffhafen', city: 'Potsdam', address: 'Am Luftschiffhafen 1, 14471 Potsdam', lat: 52.4097, lng: 13.0678, capacity: 5000, distanceKm: 190, travelMinutesCar: 150, awayBlockInfo: 'Block B (Gäste)', travelCar: 'A100, A115', travelTrain: 'S7/RE1 bis Potsdam Hbf, dann Tram 92/96', parkingInfo: 'Parkplatz P2 (Gäste)', website: 'https://www.fsv63.de', reviewStatus: ReviewStatus.AUTO, source: 'wikidata' },
  ]

  const venues = await Promise.all(venuesData.map(v => 
    prisma.venue.upsert({
      where: { slug: v.slug },
      update: v,
      create: v,
    })
  ))

  // Create Teams
  const aueVenue = venues.find(v => v.slug === 'sparkassen-erzgebirgsstadion')!
  
  const aueTeam = await prisma.team.upsert({
    where: { slug: 'fc-erzgebirge-aue' },
    update: {},
    create: {
      slug: 'fc-erzgebirge-aue',
      name: 'FC Erzgebirge Aue',
      shortName: 'AUE',
      kind: 'SENIOR',
      isOwn: true,
      logoUrl: '/brand/logo-aue.svg',
      venueId: aueVenue.id,
    },
  })

  // Opponent teams
  const opponentsData = [
    { slug: 'rsg-eintracht-stahnsdorf', name: 'RSV Eintracht 1949', shortName: 'RSV', kind: 'SENIOR', isOwn: false, venue: 'preussenstadion-stahnsdorf' },
    { slug: 'sv-babelsberg-03', name: 'SV Babelsberg 03', shortName: 'BAB', kind: 'SENIOR', isOwn: false, venue: 'karl-liebknecht-stadion' },
    { slug: 'vsg-altglienicke', name: 'VSG Altglienicke', shortName: 'VSG', kind: 'SENIOR', isOwn: false, venue: 'stadion-altglienicke' },
    { slug: 'tasmania-berlin', name: 'Tasmania Berlin', shortName: 'TAS', kind: 'SENIOR', isOwn: false, venue: 'werner-seelenbinder-stadion' },
    { slug: 'bfc-dynamo', name: 'BFC Dynamo', shortName: 'BFC', kind: 'SENIOR', isOwn: false, venue: 'stadion-im-sportforum' },
    { slug: 'lok-leipzig', name: '1. FC Lok Leipzig', shortName: 'LOK', kind: 'SENIOR', isOwn: false, venue: 'alfred-kunze-sportpark' },
    { slug: 'energie-cottbus', name: 'Energie Cottbus', shortName: 'ECO', kind: 'SENIOR', isOwn: false, venue: 'stadion-der-freundschaft' },
    { slug: 'greifswalder-fc', name: 'Greifswalder FC', shortName: 'GFC', kind: 'SENIOR', isOwn: false, venue: 'volksparkstadion-greifswald' },
    { slug: 'dynamo-dresden-ii', name: 'Dynamo Dresden II', shortName: 'DD2', kind: 'SENIOR', isOwn: false, venue: 'heinz-steyer-stadion' },
    { slug: 'magdeburg-ii', name: '1. FC Magdeburg II', shortName: 'MD2', kind: 'SENIOR', isOwn: false, venue: 'ernst-grube-stadion' },
    { slug: 'fsv-63-luckenwalde', name: 'FSV 63 Luckenwalde', shortName: 'FSV', kind: 'SENIOR', isOwn: false, venue: 'stadion-am-luftschiffhafen' },
  ]

  for (const opp of opponentsData) {
    const venue = venues.find(v => v.slug === opp.venue)!
    await prisma.team.upsert({
      where: { slug: opp.slug },
      update: {},
      create: {
        slug: opp.slug,
        name: opp.name,
        shortName: opp.shortName,
        kind: opp.kind,
        isOwn: opp.isOwn,
        logoUrl: `/brand/logo-${opp.slug}.svg`,
        venueId: venue.id,
      },
    })
  }

  // Youth teams
  await prisma.team.upsert({
    where: { slug: 'aue-u19' },
    update: {},
    create: {
      slug: 'aue-u19',
      name: 'U19 A-Junioren',
      shortName: 'U19',
      kind: 'YOUTH',
      ageGroup: 'U19',
      isOwn: true,
      parentTeamId: aueTeam.id,
      logoUrl: '/brand/logo-aue.svg',
      venueId: aueVenue.id,
    },
  })

  await prisma.team.upsert({
    where: { slug: 'aue-u17' },
    update: {},
    create: {
      slug: 'aue-u17',
      name: 'U17 B-Junioren',
      shortName: 'U17',
      kind: 'YOUTH',
      ageGroup: 'U17',
      isOwn: true,
      parentTeamId: aueTeam.id,
      logoUrl: '/brand/logo-aue.svg',
      venueId: aueVenue.id,
    },
  })

  // Tradition team
  await prisma.team.upsert({
    where: { slug: 'aue-traditionsteam' },
    update: {},
    create: {
      slug: 'aue-traditionsteam',
      name: 'Traditionsteam',
      shortName: 'TRD',
      kind: 'TRADITION',
      isOwn: true,
      logoUrl: '/brand/logo-aue.svg',
      venueId: aueVenue.id,
    },
  })

  // Departments
  const departmentsData = [
    { name: 'Fußball', description: 'Herren, Frauen, Nachwuchs, Traditionsteam', sortOrder: 1 },
    { name: 'Boxen', description: 'Olympisches Boxen für Kinder, Jugendliche und Erwachsene', sortOrder: 2 },
    { name: 'Ringen', description: 'Freistil und Griechisch-Römisch', sortOrder: 3 },
    { name: 'Turnen', description: 'Gerätturnen, Rhythmische Sportgymnastik, Trampolin', sortOrder: 4 },
    { name: 'Volleyball', description: 'Damen, Herren, Jugend', sortOrder: 5 },
    { name: 'Tischtennis', description: 'Herren, Damen, Senioren, Jugend', sortOrder: 6 },
    { name: 'Leichtathletik', description: 'Laufen, Springen, Werfen für alle Altersklassen', sortOrder: 7 },
    { name: 'Schwimmen', description: 'Wettkampf und Breitensport', sortOrder: 8 },
  ]

  for (const dept of departmentsData) {
    await prisma.department.upsert({
      where: { name: dept.name },
      update: dept,
      create: dept,
    })
  }

  // Fanclubs
  const fanclubsData = [
    { name: 'Veilchen Aue', city: 'Aue', lat: 50.5847, lng: 12.6989, contactUrl: 'https://www.veilchen-aue.de', isOfficial: true },
    { name: 'Schachtfreunde', city: 'Aue', lat: 50.5847, lng: 12.6989, contactUrl: 'https://www.schachtfreunde.de', isOfficial: true },
    { name: 'Lila-Weiße Herzen Chemnitz', city: 'Chemnitz', lat: 50.8278, lng: 12.9214, contactUrl: 'https://www.lila-weisse-herzen.de', isOfficial: true },
    { name: 'Erzgebirgsveilchen Dresden', city: 'Dresden', lat: 51.0504, lng: 13.7372, contactUrl: 'https://www.erzgebirgsveilchen-dresden.de', isOfficial: true },
    { name: 'Veilchenpower Berlin', city: 'Berlin', lat: 52.5200, lng: 13.4050, contactUrl: 'https://www.veilchenpower-berlin.de', isOfficial: true },
    { name: 'Kumpels aus Bayern', city: 'München', lat: 48.1374, lng: 11.5755, contactUrl: 'https://www.kumpels-aus-bayern.de', isOfficial: true },
    { name: 'Veilchenfreunde Leipzig', city: 'Leipzig', lat: 51.3397, lng: 12.3731, contactUrl: 'https://www.veilchenfreunde-leipzig.de', isOfficial: true },
    { name: 'Lila-Weiße aus dem Norden', city: 'Hamburg', lat: 53.5511, lng: 9.9937, contactUrl: 'https://www.lila-weisse-norden.de', isOfficial: true },
    { name: 'Veilchen-Freunde Stuttgart', city: 'Stuttgart', lat: 48.7758, lng: 9.1829, contactUrl: 'https://www.veilchen-stuttgart.de', isOfficial: true },
    { name: 'Kumpels aus dem Rheinland', city: 'Köln', lat: 50.9375, lng: 6.9603, contactUrl: 'https://www.kumpels-rheinland.de', isOfficial: true },
    { name: 'Erzgebirgsveilchen Frankfurt', city: 'Frankfurt', lat: 50.1109, lng: 8.6821, contactUrl: 'https://www.erzgebirgsveilchen-frankfurt.de', isOfficial: true },
    { name: 'Veilchen-Fans Nürnberg', city: 'Nürnberg', lat: 49.4521, lng: 11.0767, contactUrl: 'https://www.veilchen-nuernberg.de', isOfficial: true },
  ]

  for (const fc of fanclubsData) {
    await prisma.fanClub.upsert({
      where: { name: fc.name },
      update: fc,
      create: fc,
    })
  }

  // Club Contacts
  const contactsData = [
    { role: 'Fanbeauftragter', name: 'Matthias Heidrich', email: 'fanbeauftragter@fc-erzgebirge.de', phone: '+49 3771 123456', url: 'https://www.fc-erzgebirge.de/fans/fanbeauftragter', note: 'Ansprechpartner für Fanbelange, Fanclub-Unterstützung, Vermittlung bei Konflikten' },
    { role: 'Fanprojekt', name: 'Sozialpädagogisches Team', email: 'fanprojekt@fc-erzgebirge.de', phone: '+49 3771 123457', url: 'https://www.fc-erzgebirge.de/fans/fanprojekt', note: 'Begleitung zu Auswärtsspielen, Beratung & Unterstützung, Präventionsarbeit' },
    { role: 'Team Barrierefrei', name: 'Inklusionsteam', email: 'barrierefrei@fc-erzgebirge.de', phone: '+49 3771 123458', url: 'https://www.fc-erzgebirge.de/fans/team-barrierefrei', note: 'Rollstuhlplätze & Begleitung, Audioguide für Sehbehinderte, Induktionsschleifen' },
    { role: 'Steigerfunk', name: 'Radioteam', email: 'steigerfunk@fc-erzgebirge.de', phone: '+49 3771 123459', url: 'https://www.fc-erzgebirge.de/fans/steigerfunk', note: 'Live-Kommentierung, Interviews & Hintergründe, auch in der App hörbar' },
    { role: 'KidsClub', name: 'KidsClub Team', email: 'kidsclub@fc-erzgebirge.de', phone: '+49 3771 123460', url: 'https://www.fc-erzgebirge.de/fans/kidsclub', note: 'Kindergeburtstage im Stadion, Exklusive Aktionen, Maskottchen-Besuche' },
    { role: 'Mitgliedschaft', name: 'Mitgliederverwaltung', email: 'mitglieder@fc-erzgebirge.de', phone: '+49 3771 123461', url: 'https://www.fc-erzgebirge.de/verein/mitglieder', note: 'Mitgliedsantrag, Geschenkmitgliedschaft, lebenslange Mitgliedschaft' },
  ]

  for (const contact of contactsData) {
    await prisma.clubContact.upsert({
      where: { role: contact.role },
      update: contact,
      create: contact,
    })
  }

  // Static Links
  const linksData = [
    { key: 'audioguide', label: 'Audioguide für Sehbehinderte', url: 'https://www.fc-erzgebirge.de/fans/audioguide-fuer-sehbehinderte', description: 'Live-Audiodeskription der Heimspiele', category: 'FANS', sortOrder: 1 },
    { key: 'kidsclub', label: 'KidsClub', url: 'https://www.fc-erzgebirge.de/fans/kidsclub', description: 'Für die jüngsten Veilchen-Fans', category: 'FANS', sortOrder: 2 },
    { key: 'stadionfuehrung', label: 'Stadionführungen', url: 'https://www.fc-erzgebirge.de/tickets/stadionfuehrungen', description: 'Blick hinter die Kulissen des Erzgebirgsstadions', category: 'FANS', sortOrder: 3 },
    { key: 'gaestefans', label: 'Infos für Gästefans', url: 'https://www.fc-erzgebirge.de/fans/infos-fuer-gaestefans', description: 'Anreise, Gästeblock, Tickets', category: 'FANS', sortOrder: 4 },
    { key: 'fanbeauftragter', label: 'Fanbeauftragter', url: 'https://www.fc-erzgebirge.de/fans/fanbeauftragter', description: 'Kontakt & Infos', category: 'FANS', sortOrder: 5 },
    { key: 'fanprojekt', label: 'Fanprojekt', url: 'https://www.fc-erzgebirge.de/fans/fanprojekt', description: 'Sozialpädagogische Fanarbeit', category: 'FANS', sortOrder: 6 },
    { key: 'barrierefreiheit', label: 'Barrierefreiheit', url: 'https://www.fc-erzgebirge.de/fans/team-barrierefrei', description: 'Inklusion im Stadion', category: 'FANS', sortOrder: 7 },
    { key: 'steigerfunk', label: 'Steigerfunk', url: 'https://www.fc-erzgebirge.de/fans/steigerfunk', description: 'Das Fanradio live am Spieltag', category: 'FANS', sortOrder: 8 },
    { key: 'mitglied_werden', label: 'Mitglied werden', url: 'https://www.fc-erzgebirge.de/verein/mitglieder', description: 'Jetzt Kumpel werden', category: 'VEREIN', sortOrder: 1 },
    { key: 'geschenkmitgliedschaft', label: 'Geschenkmitgliedschaft', url: 'https://www.fc-erzgebirge.de/verein/geschenkmitgliedschaft', description: 'Verschenke Kumpel-Sein', category: 'VEREIN', sortOrder: 2 },
    { key: 'lebenslange_mitgliedschaft', label: 'Lebenslange Mitgliedschaft', url: 'https://www.fc-erzgebirge.de/verein/lebenslange-mitgliedschaft', description: 'Für immer Veilchen', category: 'VEREIN', sortOrder: 3 },
    { key: 'ticketshop', label: 'Offizieller Ticketshop', url: 'https://customer59.ticketing.cloud.sap/shop?shopid=103', description: 'Tickets für alle Heimspiele', category: 'TICKETS', sortOrder: 1 },
    { key: 'vorverkaufsstellen', label: 'Vorverkaufsstellen', url: 'https://www.fc-erzgebirge.de/tickets/vorverkaufsstellen', description: 'Wo du Tickets vor Ort kaufen kannst', category: 'TICKETS', sortOrder: 2 },
    { key: 'fanshop', label: 'Offizieller Fanshop', url: 'https://www.fc-erzgebirge.shop', description: 'Offizieller Merchandise', category: 'SHOP', sortOrder: 1 },
    { key: 'nachhaltigkeit', label: 'Nachhaltigkeit', url: 'https://www.fc-erzgebirge.de/verein/nachhaltigkeit', description: 'Engagement für Umwelt & Soziales', category: 'VEREIN', sortOrder: 4 },
    { key: 'satzung', label: 'Satzung & Ordnungen', url: 'https://www.fc-erzgebirge.de/verein/satzung', description: 'Rechtliche Grundlagen', category: 'VEREIN', sortOrder: 5 },
    { key: 'geschichte', label: 'Vereinsgeschichte', url: 'https://www.fc-erzgebirge.de/verein/geschichte', description: '80 Jahre FC Erzgebirge Aue', category: 'TRADITION', sortOrder: 1 },
    { key: 'traditionsteam', label: 'Traditionsteam', url: 'https://www.fc-erzgebirge.de/traditionsteam', description: 'Legenden im Einsatz', category: 'TRADITION', sortOrder: 2 },
    { key: 'vereinsspielplan', label: 'Vereinsspielplan', url: 'https://www.fc-erzgebirge.de/teams/vereinsspielplan', description: 'Alle Teams auf einen Blick', category: 'TEAMS', sortOrder: 1 },
  ]

  for (const link of linksData) {
    await prisma.staticLink.upsert({
      where: { key: link.key },
      update: link,
      create: link,
    })
  }

  // Titles
  const titlesData = [
    { year: 1955, competition: 'FDGB-Pokal', note: 'Erster Pokalsieg der Vereinsgeschichte (als SC Wismut Karl-Marx-Stadt)', teamId: aueTeam.id, reviewStatus: ReviewStatus.CHECKED, source: 'manuell' },
    { year: 1956, competition: 'DDR-Oberliga', note: 'Erster Meistertitel (als SC Wismut Karl-Marx-Stadt)', teamId: aueTeam.id, reviewStatus: ReviewStatus.CHECKED, source: 'manuell' },
    { year: 1957, competition: 'DDR-Oberliga', note: 'Titelverteidigung (als SC Wismut Karl-Marx-Stadt)', teamId: aueTeam.id, reviewStatus: ReviewStatus.CHECKED, source: 'manuell' },
    { year: 1959, competition: 'DDR-Oberliga', note: 'Dritter Meistertitel (als SC Wismut Karl-Marx-Stadt)', teamId: aueTeam.id, reviewStatus: ReviewStatus.CHECKED, source: 'manuell' },
  ]

  for (const title of titlesData) {
    await prisma.title.upsert({
      where: { year_competition: { year: title.year, competition: title.competition } },
      update: title,
      create: title,
    })
  }

  // Season Records
  const seasonRecordsData = [
    { label: '1955', leagueName: 'DDR-Oberliga', tier: 1, position: 1, points: 39, note: 'Meister (Übergangsrunde)', reviewStatus: ReviewStatus.CHECKED, source: 'manuell' },
    { label: '1956', leagueName: 'DDR-Oberliga', tier: 1, position: 1, points: 39, note: 'Meister', reviewStatus: ReviewStatus.CHECKED, source: 'manuell' },
    { label: '1957', leagueName: 'DDR-Oberliga', tier: 1, position: 1, points: 39, note: 'Meister', reviewStatus: ReviewStatus.CHECKED, source: 'manuell' },
    { label: '1959', leagueName: 'DDR-Oberliga', tier: 1, position: 1, points: 39, note: 'Meister', reviewStatus: ReviewStatus.CHECKED, source: 'manuell' },
    { label: '2003/04', leagueName: '2. Bundesliga', tier: 2, position: 2, points: 63, note: 'Aufstieg in die Bundesliga', reviewStatus: ReviewStatus.CHECKED, source: 'manuell' },
    { label: '2009/10', leagueName: '2. Bundesliga', tier: 2, position: 2, points: 61, note: 'Aufstieg in die Bundesliga', reviewStatus: ReviewStatus.CHECKED, source: 'manuell' },
    { label: '2015/16', leagueName: '2. Bundesliga', tier: 2, position: 2, points: 61, note: 'Aufstieg in die Bundesliga', reviewStatus: ReviewStatus.CHECKED, source: 'manuell' },
    { label: '2026/27', leagueName: 'Regionalliga Nordost', tier: 4, position: 7, points: 26, note: 'Aktuelle Saison (16. Spieltag)', reviewStatus: ReviewStatus.AUTO, source: 'openligadb' },
  ]

  for (const record of seasonRecordsData) {
    await prisma.seasonRecord.upsert({
      where: { label_leagueName: { label: record.label, leagueName: record.leagueName } },
      update: record,
      create: record,
    })
  }

  // Legends
  const legendsData = [
    { name: 'Dieter „Ete“ Schüßler', position: 'Mittelfeld', eraFrom: 1955, eraTo: 1970, appearances: 300, goals: 45, note: 'Vereinsikone, 300+ Spiele für die BSG Wismut, 80. Geburtstag 2026', imageUrl: '/brand/legends/schuessler.jpg', isLegend: true },
    { name: 'Manfred Zapf', position: 'Libero', eraFrom: 1964, eraTo: 1978, appearances: 310, goals: 35, note: 'Rekordnationalspieler der DDR (66 Länderspiele)', imageUrl: '/brand/legends/zapf.jpg', isLegend: true },
    { name: 'Jürgen Croy', position: 'Torwart', eraFrom: 1967, eraTo: 1981, appearances: 287, goals: 0, note: 'Weltbester Torwart 1978 (IFFHS), 86 Länderspiele', imageUrl: '/brand/legends/croy.jpg', isLegend: true },
    { name: 'Hans-Jürgen Dörner', position: 'Libero', eraFrom: 1969, eraTo: 1985, appearances: 379, goals: 65, note: 'DDR-Fußballer des Jahres 1977, 1984, 1985', imageUrl: '/brand/legends/doerner.jpg', isLegend: true },
    { name: 'Gerd Schädlich', position: 'Stürmer', eraFrom: 1972, eraTo: 1986, appearances: 302, goals: 98, note: 'Rekordtorschütze der BSG Wismut Aue, später erfolgreicher Trainer', imageUrl: '/brand/legends/schaedlich.jpg', isLegend: true },
  ]

  for (const legend of legendsData) {
    await prisma.player.upsert({
      where: { teamId_externalId: { teamId: aueTeam.id, externalId: `legend-${legend.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}` } },
      update: legend,
      create: {
        ...legend,
        teamId: aueTeam.id,
        externalId: `legend-${legend.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
        reviewStatus: ReviewStatus.CHECKED,
        source: 'manuell',
      },
    })
  }

  // Quiz Questions
  const quizData = [
    { question: 'In welchem Jahr wurde Aue zuletzt DDR-Meister?', answers: [{ text: '1959', correct: true }, { text: '1960', correct: false }, { text: '1958', correct: false }, { text: '1961', correct: false }], category: 'Titel', generatedBy: 'template:titles', sourceRef: 'Title:1959:DDR-Oberliga', reviewStatus: ReviewStatus.AUTO },
    { question: 'Wie oft gewann Aue den FDGB-Pokal?', answers: [{ text: '1x (1955)', correct: true }, { text: '2x', correct: false }, { text: '3x', correct: false }, { text: 'Nie', correct: false }], category: 'Titel', generatedBy: 'template:titles', sourceRef: 'Title:1955:FDGB-Pokal', reviewStatus: ReviewStatus.AUTO },
    { question: 'Wie hieß der Gegner am 1. Spieltag 2026/27?', answers: [{ text: 'VSG Altglienicke', correct: true }, { text: 'Chemnitzer FC', correct: false }, { text: 'BFC Dynamo', correct: false }, { text: 'Hallescher FC', correct: false }], category: 'Saison 2026/27', generatedBy: 'template:matches', sourceRef: 'Match:1', reviewStatus: ReviewStatus.AUTO },
    { question: 'In welchem Stadion trägt der RSV Eintracht seine Heimspiele aus?', answers: [{ text: 'Preußenstadion', correct: true }, { text: 'Karl-Liebknecht-Stadion', correct: false }, { text: 'Stadion Altglienicke', correct: false }, { text: 'Werner-Seelenbinder-Stadion', correct: false }], category: 'Stadien', generatedBy: 'template:venues', sourceRef: 'Venue:preussenstadion-stahnsdorf', reviewStatus: ReviewStatus.AUTO },
    { question: 'Welcher Spieler gilt als Rekordtorschütze der BSG Wismut Aue?', answers: [{ text: 'Gerd Schädlich', correct: true }, { text: 'Dieter Schüßler', correct: false }, { text: 'Manfred Zapf', correct: false }, { text: 'Hans-Jürgen Dörner', correct: false }], category: 'Legenden', generatedBy: 'template:titles', sourceRef: 'Player:legend-gerd-schaedlich', reviewStatus: ReviewStatus.AUTO },
    { question: 'Wie viele DDR-Meistertitel hat Aue gewonnen?', answers: [{ text: '3', correct: true }, { text: '2', correct: false }, { text: '4', correct: false }, { text: '1', correct: false }], category: 'Titel', generatedBy: 'template:titles', sourceRef: 'Title:count:DDR-Oberliga', reviewStatus: ReviewStatus.AUTO },
    { question: 'Welches Stadion ist das Heimstadion von Energie Cottbus?', answers: [{ text: 'Stadion der Freundschaft', correct: true }, { text: 'Stadion der Freundschaft', correct: true }, { text: 'Ernst-Grube-Stadion', correct: false }, { text: 'Volksparkstadion', correct: false }], category: 'Stadien', generatedBy: 'template:venues', sourceRef: 'Venue:stadion-der-freundschaft', reviewStatus: ReviewStatus.AUTO },
  ]

  for (const q of quizData) {
    await prisma.quizQuestion.upsert({
      where: { id: `quiz-${q.question.slice(0, 20)}` },
      update: q,
      create: q,
    })
  }

  // League Entries
  const allTeams = await prisma.team.findMany({ where: { kind: 'SENIOR' } })
  for (const team of allTeams) {
    await prisma.leagueEntry.upsert({
      where: { leagueId_teamId: { leagueId: league.id, teamId: team.id } },
      update: {},
      create: { leagueId: league.id, teamId: team.id },
    })
  }

  console.log('✅ Database seeded successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })