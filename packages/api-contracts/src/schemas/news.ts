import { z } from 'zod'

export const NewsItemDto = z.object({
  id: z.string(),
  externalUrl: z.string().url(),
  title: z.string(),
  excerpt: z.string().nullable(),
  imageUrl: z.string().url().nullable(),
  publishedAt: z.string().datetime(),
  source: z.string(),
  category: z.string().nullable(),
})
export type NewsItemDto = z.infer<typeof NewsItemDto>

export const NewsListDto = z.array(NewsItemDto)
export type NewsListDto = z.infer<typeof NewsListDto>

export const NewsQuery = z.object({
  limit: z.number().int().default(20).optional(),
  cursor: z.string().optional(),
  source: z.string().optional(),
  category: z.string().optional(),
})
export type NewsQuery = z.infer<typeof NewsQuery>