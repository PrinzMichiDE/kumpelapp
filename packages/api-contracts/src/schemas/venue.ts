import { z } from 'zod'

export const ReviewStatus = z.enum(['AUTO', 'DRAFT', 'CHECKED'])
export type ReviewStatus = z.infer<typeof ReviewStatus>

export const VenueDto = z.object({
  id: z.string(),
  slug: z.string(),
  name: z.string(),
  address: z.string().nullable(),
  city: z.string(),
  lat: z.number().nullable(),
  lng: z.number().nullable(),
  capacity: z.int().nullable(),
  distanceKm: z.int().nullable(),
  travelMinutesCar: z.int().nullable(),
  awayBlockInfo: z.string().nullable(),
  travelCar: z.string().nullable(),
  travelTrain: z.string().nullable(),
  parkingInfo: z.string().nullable(),
  website: z.string().url().nullable(),
  imageUrl: z.string().url().nullable(),
  reviewStatus: ReviewStatus,
  source: z.string().nullable(),
  sourceUrl: z.string().url().nullable(),
  attribution: z.string().nullable(),
  fieldSources: z.record(z.string()).nullable(),
  coverage: z.record(z.string()).nullable(),
  fetchedAt: z.string().datetime().nullable(),
})
export type VenueDto = z.infer<typeof VenueDto>

export const VenueListDto = z.array(VenueDto)
export type VenueListDto = z.infer<typeof VenueListDto>