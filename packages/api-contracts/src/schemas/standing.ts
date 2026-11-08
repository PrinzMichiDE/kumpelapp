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
  position: z.number().int(),
  played: z.number().int(),
  won: z.number().int(),
  drawn: z.number().int(),
  lost: z.number().int(),
  goalsFor: z.number().int(),
  goalsAgainst: z.number().int(),
  goalDifference: z.number().int(),
  points: z.number().int(),
  form: z.string().nullable(),
  updatedAt: z.string().datetime(),
})
export type StandingDto = z.infer<typeof StandingDto>

export const StandingListDto = z.array(StandingDto)
export type StandingListDto = z.infer<typeof StandingListDto>