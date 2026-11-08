import { format, formatDistanceToNow, parseISO } from 'date-fns'
import { de } from 'date-fns/locale'
import { utcToZonedTime, format as formatTz } from 'date-fns-tz'

const BERLIN_TZ = 'Europe/Berlin'

export function formatDate(date: Date | string, pattern = 'dd.MM.yyyy'): string {
  const d = typeof date === 'string' ? parseISO(date) : date
  return format(d, pattern, { locale: de })
}

export function formatDateTime(date: Date | string, pattern = 'dd.MM.yyyy HH:mm'): string {
  const d = typeof date === 'string' ? parseISO(date) : date
  return formatTz(d, pattern, { timeZone: BERLIN_TZ, locale: de })
}

export function formatTime(date: Date | string): string {
  const d = typeof date === 'string' ? parseISO(date) : date
  return formatTz(d, 'HH:mm', { timeZone: BERLIN_TZ, locale: de })
}

export function formatRelative(date: Date | string): string {
  const d = typeof date === 'string' ? parseISO(date) : date
  return formatDistanceToNow(d, { addSuffix: true, locale: de })
}

export function formatMatchDay(date: Date | string): string {
  const d = typeof date === 'string' ? parseISO(date) : date
  return formatTz(d, 'EEEE, dd.MM.yyyy', { timeZone: BERLIN_TZ, locale: de })
}

export function formatKickoff(date: Date | string): string {
  const d = typeof date === 'string' ? parseISO(date) : date
  return formatTz(d, 'HH:mm', { timeZone: BERLIN_TZ })
}

export function getBerlinDate(date: Date | string): Date {
  const d = typeof date === 'string' ? parseISO(date) : date
  return utcToZonedTime(d, BERLIN_TZ)
}

export function isToday(date: Date | string): boolean {
  const d = typeof date === 'string' ? parseISO(date) : date
  const today = new Date()
  return d.toDateString() === today.toDateString()
}

export function isPast(date: Date | string): boolean {
  const d = typeof date === 'string' ? parseISO(date) : date
  return d < new Date()
}

export function isFuture(date: Date | string): boolean {
  const d = typeof date === 'string' ? parseISO(date) : date
  return d > new Date()
}