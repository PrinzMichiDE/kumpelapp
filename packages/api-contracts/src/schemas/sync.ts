import { z } from 'zod'

export const SyncBundleMeta = z.object({
  version: z.number(),
  generatedAt: z.string().datetime(),
  season: z.string(),
  league: z.string().nullable(),
  leagueShortcut: z.string().nullable(),
})
export type SyncBundleMeta = z.infer<typeof SyncBundleMeta>

export const SyncBundleTeam = z.object({
  id: z.string(),
  name: z.string(),
  shortName: z.string().nullable(),
  logoUrl: z.string().nullable(),
})
export type SyncBundleTeam = z.infer<typeof SyncBundleTeam>

export const SyncBundleMatch = z.object({
  id: z.string(),
  matchday: z.number().nullable(),
  kickoff: z.string().datetime(),
  status: z.string(),
  homeTeam: z.object({
    id: z.string(),
    name: z.string(),
    shortName: z.string().nullable(),
    logoUrl: z.string().nullable(),
    isOwn: z.boolean(),
  }),
  awayTeam: z.object({
    id: z.string(),
    name: z.string(),
    shortName: z.string().nullable(),
    logoUrl: z.string().nullable(),
    isOwn: z.boolean(),
  }),
  homeGoals: z.number().nullable(),
  awayGoals: z.number().nullable(),
  venue: z.object({
    id: z.string(),
    name: z.string(),
    city: z.string(),
    lat: z.number().nullable(),
    lng: z.number().nullable(),
  }).nullable(),
})
export type SyncBundleMatch = z.infer<typeof SyncBundleMatch>

export const SyncBundleStanding = z.object({
  position: z.number(),
  team: z.object({
    id: z.string(),
    name: z.string(),
    shortName: z.string().nullable(),
    logoUrl: z.string().nullable(),
  }),
  played: z.number(),
  won: z.number(),
  drawn: z.number(),
  lost: z.number(),
  goalsFor: z.number(),
  goalsAgainst: z.number(),
  points: z.number(),
  form: z.string().nullable(),
})
export type SyncBundleStanding = z.infer<typeof SyncBundleStanding>

export const SyncBundlePlayer = z.object({
  id: z.string(),
  name: z.string(),
  number: z.number().nullable(),
  position: z.string(),
  imageUrl: z.string().nullable(),
  nationality: z.string().nullable(),
  birthDate: z.string().datetime().nullable(),
  heightCm: z.number().nullable(),
  foot: z.string().nullable(),
})
export type SyncBundlePlayer = z.infer<typeof SyncBundlePlayer>

export const SyncBundleVenue = z.object({
  id: z.string(),
  slug: z.string(),
  name: z.string(),
  city: z.string(),
  lat: z.number().nullable(),
  lng: z.number().nullable(),
  capacity: z.number().nullable(),
  distanceKm: z.number().nullable(),
  travelMinutesCar: z.number().nullable(),
  awayBlockInfo: z.string().nullable(),
  travelCar: z.string().nullable(),
  travelTrain: z.string().nullable(),
  parkingInfo: z.string().nullable(),
  imageUrl: z.string().nullable(),
  reviewStatus: z.string(),
})
export type SyncBundleVenue = z.infer<typeof SyncBundleVenue>

export const SyncBundleTitle = z.object({
  year: z.number(),
  competition: z.string(),
  note: z.string().nullable(),
})
export type SyncBundleTitle = z.infer<typeof SyncBundleTitle>

export const SyncBundleSeasonRecord = z.object({
  label: z.string(),
  leagueName: z.string(),
  position: z.number().nullable(),
  points: z.number().nullable(),
  note: z.string().nullable(),
})
export type SyncBundleSeasonRecord = z.infer<typeof SyncBundleSeasonRecord>

export const SyncBundleFanClub = z.object({
  id: z.string(),
  name: z.string(),
  city: z.string(),
  lat: z.number().nullable(),
  lng: z.number().nullable(),
  contactUrl: z.string().nullable(),
})
export type SyncBundleFanClub = z.infer<typeof SyncBundleFanClub>

export const SyncBundleContact = z.object({
  role: z.string(),
  name: z.string().nullable(),
  email: z.string().nullable(),
  phone: z.string().nullable(),
  url: z.string().nullable(),
  note: z.string().nullable(),
})
export type SyncBundleContact = z.infer<typeof SyncBundleContact>

export const SyncBundleLink = z.object({
  key: z.string(),
  label: z.string(),
  url: z.string(),
  description: z.string().nullable(),
  category: z.string(),
  sortOrder: z.number(),
})
export type SyncBundleLink = z.infer<typeof SyncBundleLink>

export const SyncBundle = z.object({
  meta: z.object({
    version: z.number(),
    generatedAt: z.string().datetime(),
    season: z.string(),
    league: z.string().nullable(),
    leagueShortcut: z.string().nullable(),
  }),
  teams: z.object({
    aue: z.object({
      id: z.string(),
      name: z.string(),
      shortName: z.string().nullable(),
      logoUrl: z.string().nullable(),
    }),
  }),
  matches: z.array(z.object({
    id: z.string(),
    matchday: z.number().nullable(),
    kickoff: z.string().datetime(),
    status: z.string(),
    homeTeam: z.object({
      id: z.string(),
      name: z.string(),
      shortName: z.string().nullable(),
      logoUrl: z.string().nullable(),
      isOwn: z.boolean(),
    }),
    awayTeam: z.object({
      id: z.string(),
      name: z.string(),
      shortName: z.string().nullable(),
      logoUrl: z.string().nullable(),
      isOwn: z.boolean(),
    }),
    homeGoals: z.number().nullable(),
    awayGoals: z.number().nullable(),
    venue: z.object({
      id: z.string(),
      name: z.string(),
      city: z.string(),
      lat: z.number().nullable(),
      lng: z.number().nullable(),
    }).nullable(),
  })),
  standings: z.array(z.object({
    position: z.number(),
    team: z.object({
      id: z.string(),
      name: z.string(),
      shortName: z.string().nullable(),
      logoUrl: z.string().nullable(),
    }),
    played: z.number(),
    won: z.number(),
    drawn: z.number(),
    lost: z.number(),
    goalsFor: z.number(),
    goalsAgainst: z.number(),
    points: z.number(),
    form: z.string().nullable(),
  })),
  squad: z.array(z.object({
    id: z.string(),
    name: z.string(),
    number: z.number().nullable(),
    position: z.string(),
    imageUrl: z.string().nullable(),
    nationality: z.string().nullable(),
    birthDate: z.string().datetime().nullable(),
    heightCm: z.number().nullable(),
    foot: z.string().nullable(),
  })),
  venues: z.array(z.object({
    id: z.string(),
    slug: z.string(),
    name: z.string(),
    city: z.string(),
    lat: z.number().nullable(),
    lng: z.number().nullable(),
    capacity: z.number().nullable(),
    distanceKm: z.number().nullable(),
    travelMinutesCar: z.number().nullable(),
    awayBlockInfo: z.string().nullable(),
    travelCar: z.string().nullable(),
    travelTrain: z.string().nullable(),
    parkingInfo: z.string().nullable(),
    imageUrl: z.string().nullable(),
    reviewStatus: z.string(),
  })),
  tradition: z.object({
    titles: z.array(z.object({
      year: z.number(),
      competition: z.string(),
      note: z.string().nullable(),
    })),
    seasonRecords: z.array(z.object({
      label: z.string(),
      leagueName: z.string(),
      position: z.number().nullable(),
      points: z.number().nullable(),
      note: z.string().nullable(),
    })),
  }),
  fanclubs: z.array(z.object({
    id: z.string(),
    name: z.string(),
    city: z.string(),
    lat: z.number().nullable(),
    lng: z.number().nullable(),
    contactUrl: z.string().nullable(),
  })),
  contacts: z.array(z.object({
    role: z.string(),
    name: z.string().nullable(),
    email: z.string().nullable(),
    phone: z.string().nullable(),
    url: z.string().nullable(),
    note: z.string().nullable(),
  })),
  links: z.array(z.object({
    key: z.string(),
    label: z.string(),
    url: z.string(),
    description: z.string().nullable(),
    category: z.string(),
    sortOrder: z.number(),
  })),
})
export type SyncBundle = z.infer<typeof SyncBundle>