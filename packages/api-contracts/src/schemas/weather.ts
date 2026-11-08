import { z } from 'zod'

export const WeatherDto = z.object({
  temperature: z.number().nullable(),
  feelsLike: z.number().nullable(),
  precipitation: z.number().nullable(),
  precipitationProbability: z.number().nullable(),
  windSpeed: z.number().nullable(),
  windDirection: z.number().nullable(),
  condition: z.string().nullable(),
  conditionCode: z.int().nullable(),
  humidity: z.number().nullable(),
  visibility: z.number().nullable(),
  uvIndex: z.number().nullable(),
  forecast: z.array(z.object({
    time: z.string().datetime(),
    temperature: z.number(),
    precipitation: z.number(),
    condition: z.string(),
  })).optional(),
})
export type WeatherDto = z.infer<typeof WeatherDto>

export const WeatherQuery = z.object({
  lat: z.number(),
  lng: z.number(),
  date: z.string().datetime().optional(),
})
export type WeatherQuery = z.infer<typeof WeatherQuery>