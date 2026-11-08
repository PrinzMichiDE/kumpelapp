import { z } from 'zod'

export const ReviewStatus = z.enum(['AUTO', 'DRAFT', 'CHECKED'])

export const TitleDto = z.object({
  id: z.string(),
  year: z.int(),
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
  tier: z.int().nullable(),
  position: z.int().nullable(),
  points: z.int().nullable(),
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
  eraFrom: z.int().nullable(),
  eraTo: z.int().nullable(),
  appearances: z.int().nullable(),
  goals: z.int().nullable(),
  note: z.string().nullable(),
  imageUrl: z.string().url().nullable(),
})
export type LegendDto = z.infer<typeof LegendDto>

export const TimelineEventDto = z.object({
  id: z.string(),
  year: z.int(),
  title: z.string(),
  description: z.string(),
  category: z.string(),
})
export type TimelineEventDto = z.infer<typeof TimelineEventDto>