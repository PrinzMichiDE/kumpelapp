import { z } from 'zod'

export const MatchStatus = z.enum([
  'SCHEDULED',
  'LIVE',
  'FINISHED',
  'POSTPONED',
  'CANCELLED',
  'ABANDONED',
])
export type MatchStatus = z.infer<typeof MatchStatus>

export const EventType = z.enum([
  'GOAL',
  'OWN_GOAL',
  'PENALTY_GOAL',
  'YELLOW_CARD',
  'YELLOW_RED',
  'RED_CARD',
  'SUBSTITUTION',
  'OTHER',
])
export type EventType = z.infer<typeof EventType>

export const MatchEventDto = z.object({
  id: z.string(),
  matchId: z.string(),
  minute: z.int(),
  type: EventType,
  side: z.string().nullable(),
  player: z.string().nullable(),
  text: z.string().nullable(),
})
export type MatchEventDto = z.infer<typeof MatchEventDto>

export const MatchEventListDto = z.array(MatchEventDto)
export type MatchEventListDto = z.infer<typeof MatchEventListDto>

export const VenueRefDto = z.object({
  id: z.string(),
  name: z.string(),
  city: z.string(),
  lat: z.number().nullable(),
  lng: z.number().nullable(),
  awayBlockInfo: z.string().nullable(),
  travelCar: z.string().nullable(),
  travelTrain: z.string().nullable(),
  parkingInfo: z.string().nullable(),
})
export type VenueRefDto = z.infer<typeof VenueRefDto>

export const TeamRefDto = z.object({
  id: z.string(),
  name: z.string(),
  shortName: z.string().nullable(),
  logoUrl: z.string().nullable(),
  isOwn: z.boolean(),
})
export type TeamRefDto = z.infer<typeof TeamRefDto>

export const MatchDto = z.object({
  id: z.string(),
  leagueId: z.string(),
  externalId: z.string().nullable(),
  source: z.string().nullable(),
  matchday: z.int().nullable(),
  kickoff: z.string().datetime(),
  status: MatchStatus,
  venue: VenueRefDto.nullable(),
  homeTeam: TeamRefDto,
  awayTeam: TeamRefDto,
  homeGoals: z.int().nullable(),
  awayGoals: z.int().nullable(),
  halftimeHome: z.int().nullable(),
  halftimeAway: z.int().nullable(),
  attendance: z.int().nullable(),
  editorNote: z.string().nullable(),
  events: MatchEventListDto.optional(),
  ticketSale: z.object({
    saleStart: z.string().datetime().nullable(),
    saleEnd: z.string().datetime().nullable(),
    shopUrl: z.string().nullable(),
    awayContingent: z.string().nullable(),
  }).nullable(),
  streams: z.array(z.object({
    name: z.string(),
    url: z.string(),
    kind: z.string(),
  })).optional(),
  weather: z.object({
    temperature: z.number().nullable(),
    precipitation: z.number().nullable(),
    windSpeed: z.number().nullable(),
    condition: z.string().nullable(),
  }).nullable(),
})
export type MatchDto = z.infer<typeof MatchDto>

export const MatchListDto = z.array(MatchDto)
export type MatchListDto = z.infer<typeof MatchListDto>

export const MatchQuery = z.object({
  season: z.string().optional(),
  team: z.string().optional(),
  matchday: z.coerce.int().optional(),
  status: MatchStatus.optional(),
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
  limit: z.coerce.int().default(50).optional(),
  cursor: z.string().optional(),
})
export type MatchQuery = z.infer<typeof MatchQuery>