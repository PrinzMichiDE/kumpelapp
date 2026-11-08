import { z } from 'zod'

export const CalendarQuery = z.object({
  team: z.string().optional(),
  season: z.string().optional(),
})
export type CalendarQuery = z.infer<typeof CalendarQuery>

export const OGImageQuery = z.object({
  matchId: z.string(),
  type: z.enum(['match', 'result']),
})
export type OGImageQuery = z.infer<typeof OGImageQuery>