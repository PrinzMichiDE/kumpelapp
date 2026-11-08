import { z } from 'zod'
import { Position, ReviewStatus } from './common'

export const PlayerDto = z.object({
  id: z.string(),
  name: z.string(),
  number: z.number().int().nullable(),
  position: Position,
  teamId: z.string(),
  imageUrl: z.string().url().nullable(),
  nationality: z.string().nullable(),
  birthDate: z.string().datetime().nullable(),
  heightCm: z.number().int().nullable(),
  foot: z.string().nullable(),
  isLegend: z.boolean(),
  sourceUrl: z.string().url().nullable(),
})
export type PlayerDto = z.infer<typeof PlayerDto>

export const PlayerListDto = z.array(PlayerDto)
export type PlayerListDto = z.infer<typeof PlayerListDto>