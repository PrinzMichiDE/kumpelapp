import { AlertCircle, CheckCircle, Clock, Database, Info, ShieldAlert } from 'lucide-react'
import { cn } from '@kumpelapp/utils'

type ReviewStatus = 'AUTO' | 'DRAFT' | 'CHECKED' | string | null | undefined

export function formatDataTime(value: string | Date | null | undefined) {
  if (!value) return null
  const d = typeof value === 'string' ? new Date(value) : value
  if (Number.isNaN(d.getTime())) return null
  return d.toLocaleString('de-DE')
}

export function isStaleDate(value: string | Date | null | undefined, staleAfterMs: number) {
  if (!value) return true
  const d = typeof value === 'string' ? new Date(value) : value
  if (Number.isNaN(d.getTime())) return true
  return Date.now() - d.getTime() > staleAfterMs
}

export function ReviewStatusBadge({ status, className }: { status: ReviewStatus; className?: string }) {
  const normalized = typeof status === 'string' ? status.toUpperCase() : status
  const cfg =
    normalized === 'CHECKED'
      ? { label: 'Geprüft', cls: 'bg-fc-win/12 text-fc-win ring-fc-win/20' }
      : normalized === 'DRAFT'
        ? { label: 'Entwurf', cls: 'bg-fc-draw/12 text-fc-draw ring-fc-draw/20' }
        : { label: 'Automatisch', cls: 'bg-fc-violet/12 text-fc-violet-light ring-fc-violet/20' }
  return (
    <span className={cn('inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset', cfg.cls, className)}>
      {cfg.label}
    </span>
  )
}

export function CapabilityBadge({
  label,
  tone = 'neutral',
  className,
}: {
  label: string
  tone?: 'neutral' | 'good' | 'warn' | 'info'
  className?: string
}) {
  const cls =
    tone === 'good'
      ? 'bg-fc-win/10 text-fc-win ring-fc-win/20'
      : tone === 'warn'
        ? 'bg-fc-draw/10 text-fc-draw ring-fc-draw/20'
        : tone === 'info'
          ? 'bg-fc-violet/10 text-fc-violet-light ring-fc-violet/20'
          : 'bg-fc-surface/70 text-fc-fg/75 ring-fc-border/60'
  return (
    <span className={cn('inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset', cls, className)}>
      <Info className="h-3.5 w-3.5" aria-hidden="true" /> {label}
    </span>
  )
}

export function DataMeta({
  source,
  updatedAt,
  reviewStatus,
  stale = false,
  staleLabel = 'Datenstand evtl. veraltet',
  manualLabel,
  capabilityLabel,
  capabilityTone = 'neutral',
  note,
  compact = false,
  className,
}: {
  source?: string | null
  updatedAt?: string | Date | null
  reviewStatus?: ReviewStatus
  stale?: boolean
  staleLabel?: string
  manualLabel?: string | null
  capabilityLabel?: string | null
  capabilityTone?: 'neutral' | 'good' | 'warn' | 'info'
  note?: string | null
  compact?: boolean
  className?: string
}) {
  const updated = formatDataTime(updatedAt)
  const hasAny = source || updated || reviewStatus || stale || manualLabel || capabilityLabel || note
  if (!hasAny) return null

  return (
    <div className={cn('rounded-xl border border-fc-border/70 bg-fc-surface/40', compact ? 'p-2.5' : 'p-3 sm:p-4', className)}>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-xs sm:text-sm text-fc-fg/70">
        {source ? (
          <span className="inline-flex items-center gap-1.5"><Database className="h-3.5 w-3.5 text-fc-fg/50" aria-hidden="true" /><span><span className="text-fc-fg/55">Quelle:</span> <span className="text-fc-fg/80">{source}</span></span></span>
        ) : null}
        {updated ? (
          <span className="inline-flex items-center gap-1.5"><Clock className="h-3.5 w-3.5 text-fc-fg/50" aria-hidden="true" /><span><span className="text-fc-fg/55">Stand:</span> <span className="text-fc-fg/80">{updated}</span></span></span>
        ) : null}
        {reviewStatus ? <ReviewStatusBadge status={reviewStatus} /> : null}
        {capabilityLabel ? <CapabilityBadge label={capabilityLabel} tone={capabilityTone} /> : null}
        {manualLabel ? (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-fc-draw/10 px-2.5 py-1 text-xs font-medium text-fc-draw ring-1 ring-inset ring-fc-draw/20">
            <ShieldAlert className="h-3.5 w-3.5" aria-hidden="true" /> {manualLabel}
          </span>
        ) : null}
        {stale ? (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-fc-draw/10 px-2.5 py-1 text-xs font-medium text-fc-draw ring-1 ring-inset ring-fc-draw/20">
            <AlertCircle className="h-3.5 w-3.5" aria-hidden="true" /> {staleLabel}
          </span>
        ) : !stale && (source || updated) ? (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-fc-win/10 px-2.5 py-1 text-xs font-medium text-fc-win ring-1 ring-inset ring-fc-win/20">
            <CheckCircle className="h-3.5 w-3.5" aria-hidden="true" /> Transparenzhinweis vorhanden
          </span>
        ) : null}
      </div>
      {note ? <p className="mt-2 text-xs sm:text-sm text-fc-fg/65">{note}</p> : null}
    </div>
  )
}
