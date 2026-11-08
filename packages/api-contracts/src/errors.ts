import { z } from 'zod'

export const ErrorCode = z.enum([
  'UNAUTHORIZED',
  'FORBIDDEN',
  'VALIDATION_FAILED',
  'NOT_FOUND',
  'RATE_LIMITED',
  'UPSTREAM_UNAVAILABLE',
  'INTERNAL_ERROR',
])

export type ErrorCode = z.infer<typeof ErrorCode>

export const ApiError = z.object({
  error: z.object({
    code: ErrorCode,
    message: z.string(),
    details: z.unknown().optional(),
  }),
})

export type ApiError = z.infer<typeof ApiError>

export function apiError(code: ErrorCode, message: string, details?: unknown): ApiError {
  return { error: { code, message, details } }
}

export function isApiError(obj: unknown): obj is ApiError {
  return ApiError.safeParse(obj).success
}