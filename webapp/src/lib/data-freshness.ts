export type SyncSource = 'openligadb' | 'away-info' | 'venues' | 'news' | 'streams' | 'squad' | 'quiz' | 'traditions' | 'tickets' | string

export type Capability = 'available' | 'result_only' | 'no_live_data' | 'stale' | 'manual' | 'unknown'

const STALE_MS: Record<string, { warn: number; critical: number }> = {
  openligadb: { warn: 6 * 60 * 60 * 1000, critical: 24 * 60 * 60 * 1000 },
  'away-info': { warn: 30 * 24 * 60 * 60 * 1000, critical: 60 * 24 * 60 * 60 * 1000 },
  venues: { warn: 30 * 24 * 60 * 60 * 1000, critical: 60 * 24 * 60 * 60 * 1000 },
  news: { warn: 24 * 60 * 60 * 1000, critical: 72 * 60 * 60 * 1000 },
  streams: { warn: 24 * 60 * 60 * 1000, critical: 72 * 60 * 60 * 1000 },
  squad: { warn: 90 * 24 * 60 * 60 * 1000, critical: 120 * 24 * 60 * 60 * 1000 },
  quiz: { warn: 90 * 24 * 60 * 60 * 1000, critical: 120 * 24 * 60 * 60 * 1000 },
  traditions: { warn: 90 * 24 * 60 * 60 * 1000, critical: 120 * 24 * 60 * 60 * 1000 },
  tickets: { warn: 24 * 60 * 60 * 1000, critical: 72 * 60 * 60 * 1000 },
}

export function toDate(value: string | Date | null | undefined): Date | null {
  if (!value) return null
  const d = typeof value === 'string' ? new Date(value) : value
  return Number.isNaN(d.getTime()) ? null : d
}

export function ageMs(value: string | Date | null | undefined): number | null {
  const d = toDate(value)
  if (!d) return null
  return Date.now() - d.getTime()
}

export function freshnessLevel(source: SyncSource, value: string | Date | null | undefined): 'fresh' | 'warn' | 'critical' | 'unknown' {
  const ms = ageMs(value)
  if (ms === null) return 'unknown'
  const cfg = STALE_MS[source] ?? { warn: 24 * 60 * 60 * 1000, critical: 72 * 60 * 60 * 1000 }
  if (ms >= cfg.critical) return 'critical'
  if (ms >= cfg.warn) return 'warn'
  return 'fresh'
}

export function isStale(value: string | Date | null | undefined, source: SyncSource = 'openligadb'): boolean {
  const level = freshnessLevel(source, value)
  return level === 'warn' || level === 'critical' || level === 'unknown'
}

export function staleLabel(value: string | Date | null | undefined, source: SyncSource = 'openligadb'): string | null {
  const level = freshnessLevel(source, value)
  if (level === 'critical') return 'Datenstand kritisch veraltet'
  if (level === 'warn' || level === 'unknown') return 'Datenstand evtl. veraltet'
  return null
}

export function matchDataCapability(input: {
  status: string
  hasEvents: boolean
  source?: string | null
  updatedAt?: string | Date | null
}): { key: Capability; label: string; detail: string } {
  const stale = isStale(input.updatedAt, 'openligadb')
  if (input.status === 'FINISHED' || input.status === 'LIVE') {
    if (input.hasEvents) return { key: stale ? 'stale' : 'available', label: stale ? 'Events vorhanden (evtl. veraltet)' : 'Events verfügbar', detail: stale ? 'Eventdaten vorhanden, Stand prüfen.' : 'Live-/Ereignisdaten verfügbar (abhängig von Quelle).' }
    return { key: 'result_only', label: 'Nur Ergebnis/Status verfügbar', detail: 'Keine verlässlichen Live-Events aus der Quelle – Ergebnis/Status hat Priorität.' }
  }
  if (input.status === 'POSTPONED' || input.status === 'CANCELLED') {
    return { key: 'manual', label: 'Status kann manuell korrigiert sein', detail: 'Verlegungen/Absagen bitte mit Quelle/Stand beachten.' }
  }
  return { key: stale ? 'stale' : 'available', label: stale ? 'Ansetzung evtl. veraltet' : 'Ansetzung verfügbar', detail: stale ? 'Ansetzung vorhanden, kurzfristige Änderungen möglich.' : 'Spielansetzung verfügbar; kurzfristige Änderungen möglich.' }
}

export function formatRelativeAge(value: string | Date | null | undefined): string | null {
  const ms = ageMs(value)
  if (ms === null) return null
  const min = Math.floor(ms / 60000)
  if (min < 60) return `vor ${min} Min.`
  const h = Math.floor(min / 60)
  if (h < 48) return `vor ${h} Std.`
  const d = Math.floor(h / 24)
  return `vor ${d} Tagen`
}
