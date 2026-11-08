import { z } from 'zod'

export const StandingDto = z.object({
  id: z.string(),
  leagueId: z.string(),
  team: z.object({
    id: z.string(),
    name: z.string(),
    shortName: z.string().nullable(),
    logoUrl: z.string().nullable(),
  }),
  position: z.int(),
  played: z.int(),
  won: z.int(),
  drawn: z.int(),
  lost: z.int(),
  goalsFor: z.int(),
  goalsAgainst: z.int(),
  goalDifference: z.int(),
  points: z.int(),
  form: z.string().nullable(),
  updatedAt: z.string().datetime(),
})
export type StandingDto = z.infer<typeof StandingDto>

export const StandingListDto = z.array(StandingDto)
export type StandingListDto = z.infer<typeof StandingListDto>