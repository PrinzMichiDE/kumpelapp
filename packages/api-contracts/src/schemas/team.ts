import { z } from 'zod'
import { TeamKind, ReviewStatus } from './common'

export const TeamDto = z.object({
  id: z.string(),
  slug: z.string(),
  name: z.string(),
  shortName: z.string().nullable(),
  kind: TeamKind,
  ageGroup: z.string().nullable(),
  isOwn: z.boolean(),
  logoUrl: z.string().nullable(),
  venueId: z.string().nullable(),
  venue: z.object({
    id: z.string(),
    name: z.string(),
    city: z.string(),
    lat: z.number().nullable(),
    lng: z.number().nullable(),
  }).nullable(),
  parentTeamId: z.string().nullable(),
  updatedAt: z.string().datetime(),
})

export type TeamDto = z.infer<typeof TeamDto>

export const TeamListDto = z.array(TeamDto)
export type TeamListDto = z.infer<typeof TeamListDto>