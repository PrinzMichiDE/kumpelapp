import { apiError, ErrorCode, isApiError, type ApiError } from '@kumpelapp/api-contracts'

export { apiError, ErrorCode, isApiError, type ApiError }

export async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const baseUrl = process.env['NEXT_PUBLIC_APP_URL'] || 'http://localhost:3000'
  const response = await fetch(`${baseUrl}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  })
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: { message: 'Unknown error' } })) as { error?: { message?: string } }
    throw new Error(error.error?.message || 'API request failed')
  }
  
  return response.json() as Promise<T>
}