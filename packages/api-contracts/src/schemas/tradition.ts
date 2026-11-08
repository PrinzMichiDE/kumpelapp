import { z } from 'zod'
import { ReviewStatus } from './common'

export const TitleDto = z.object({
  id: z.string(),
  year: z.number().int(),
  competition: z.string(),
  note: z.string().nullable(),
  teamId: z.string().nullable(),
  reviewStatus: ReviewStatus,
  source: z.string().nullable(),
  sourceUrl: z.string().url().nullable(),
  attribution: z.string().nullable(),
})
export type TitleDto = z.infer<typeof TitleDto>

export const TitleListDto = z.array(TitleDto)

export const SeasonRecordDto = z.object({
  id: z.string(),
  label: z.string(),
  leagueName: z.string(),
  tier: z.number().int().nullable(),
  position: z.number().int().nullable(),
  points: z.number().int().nullable(),
  note: z.string().nullable(),
  reviewStatus: ReviewStatus,
  source: z.string().nullable(),
  sourceUrl: z.string().url().nullable(),
  attribution: z.string().nullable(),
})
export type SeasonRecordDto = z.infer<typeof SeasonRecordDto>

export const SeasonRecordListDto = z.array(SeasonRecordDto)

export const LegendDto = z.object({
  id: z.string(),
  name: z.string(),
  position: z.string(),
  eraFrom: z.number().int().nullable(),
  eraTo: z.number().int().nullable(),
  appearances: z.number().int().nullable(),
  goals: z.number().int().nullable(),
  note: z.string().nullable(),
  imageUrl: z.string().url().nullable(),
})
export type LegendDto = z.infer<typeof LegendDto>

export const TimelineEventDto = z.object({
  id: z.string(),
  year: z.number().int(),
  title: z.string(),
  description: z.string(),
  category: z.string(),
})
export type TimelineEventDto = z.infer<typeof TimelineEventDto>