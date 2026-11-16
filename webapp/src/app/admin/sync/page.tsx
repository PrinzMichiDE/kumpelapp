'use client'

import { useState, useEffect } from 'react'
import { RefreshCw, AlertCircle, CheckCircle, Clock, Database, Zap, BarChart2, Book, HelpCircle, Users, Newspaper, Tv, Ticket } from 'lucide-react'
import { Button } from '@kumpelapp/ui'
import { Card, CardContent, CardHeader, CardTitle } from '@kumpelapp/ui'
import { Badge } from '@kumpelapp/ui'
import { formatDateTime } from '@kumpelapp/utils'

interface SyncJob {
  id: string
  source: string
  ok: boolean
  durationMs: number
  items: number
  message: string | null
  createdAt: string
}

interface SyncStatus {
  source: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  lastRun: SyncJob | null
  isRunning: boolean
}

const syncJobs: SyncStatus[] = [
  { source: 'openligadb', label: 'OpenLigaDB (Liga)', icon: Database, lastRun: null, isRunning: false },
  { source: 'away-info', label: 'Auswärts-Infos', icon: BarChart2, lastRun: null, isRunning: false },
  { source: 'traditions', label: 'Tradition', icon: Book, lastRun: null, isRunning: false },
  { source: 'quiz', label: 'Quiz-Fragen', icon: HelpCircle, lastRun: null, isRunning: false },
  { source: 'squad', label: 'Kader', icon: Users, lastRun: null, isRunning: false },
  { source: 'news', label: 'News', icon: Newspaper, lastRun: null, isRunning: false },
  { source: 'streams', label: 'Livestreams', icon: Tv, lastRun: null, isRunning: false },
  { source: 'tickets', label: 'Ticketverkauf', icon: Ticket, lastRun: null, isRunning: false },
]

type Feedback = { type: 'success' | 'error'; text: string } | null

export default function SyncAdminPage() {
  const [jobs, setJobs] = useState<SyncStatus[]>(syncJobs)
  const [logs, setLogs] = useState<Record<string, SyncJob[]>>({})
  const [feedback, setFeedback] = useState<Feedback>(null)

  useEffect(() => {
    fetchAllLogs()
  }, [])

  const fetchAllLogs = async () => {
    try {
      const responses = await Promise.all(
        jobs.map((job) => fetch(`/api/v1/admin/sync/${job.source}`).then((r) => r.json()))
      )
      const logsMap: Record<string, SyncJob[]> = {}
      jobs.forEach((job, i) => {
        if (responses[i]?.data) {
          logsMap[job.source] = responses[i].data
          if (responses[i].data[0]) {
            setJobs((prev) => prev.map((j) => (j.source === job.source ? { ...j, lastRun: responses[i].data[0] } : j)))
          }
        }
      })
      setLogs(logsMap)
    } catch (error) {
      console.error('Failed to fetch logs:', error)
    }
  }

  const triggerSync = async (source: string) => {
    setFeedback(null)
    setJobs((prev) => prev.map((j) => (j.source === source ? { ...j, isRunning: true } : j)))

    try {
      const response = await fetch(`/api/v1/admin/sync/${source}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      })

      const result = await response.json()

      if (result.success) {
        await fetchAllLogs()
        setFeedback({ type: 'success', text: `Synchronisierung „${source}“ erfolgreich gestartet/abgeschlossen.` })
      } else {
        setFeedback({ type: 'error', text: `Sync fehlgeschlagen: ${result.error?.message || 'Unbekannter Fehler'}` })
      }
    } catch (error) {
      setFeedback({ type: 'error', text: `Sync fehlgeschlagen: ${String(error)}` })
    } finally {
      setJobs((prev) => prev.map((j) => (j.source === source ? { ...j, isRunning: false } : j)))
    }
  }

  const staleThresholdMs = (source: string) => {
    if (source === 'openligadb') return 6 * 60 * 60 * 1000
    if (['news', 'streams', 'tickets'].includes(source)) return 24 * 60 * 60 * 1000
    if (['away-info'].includes(source)) return 30 * 24 * 60 * 60 * 1000
    return 90 * 24 * 60 * 60 * 1000
  }

  const isStale = (job: SyncStatus) => {
    if (!job.lastRun) return true
    const ageMs = Date.now() - new Date(job.lastRun.createdAt).getTime()
    return ageMs > staleThresholdMs(job.source)
  }

  const nextAction = (job: SyncStatus) => {
    if (job.isRunning) return 'Läuft – Ergebnis abwarten.'
    if (!job.lastRun) return 'Noch nie gelaufen: initial synchronisieren oder Seed/Ingest prüfen.'
    if (!job.lastRun.ok) return 'Fehler: Logs/Runbook prüfen, Ursache beheben, gezielt neu synchronisieren.'
    if (isStale(job)) return 'Veraltet: jetzt synchronisieren oder Daten manuell verifizieren.'
    return 'OK: regelmäßige Prüfung beibehalten.'
  }

  const getStatusBadge = (job: SyncStatus) => {
    if (job.isRunning)
      return (
        <Badge variant="default" aria-label="Synchronisierung läuft">
          <Clock className="mr-1 h-3 w-3 animate-spin motion-reduce:animate-none" aria-hidden="true" /> Läuft...
        </Badge>
      )
    if (!job.lastRun) return <Badge variant="outline">Nie gelaufen</Badge>
    if (!job.lastRun.ok)
      return (
        <Badge variant="destructive">
          <AlertCircle className="mr-1 h-3 w-3" aria-hidden="true" /> Fehler
        </Badge>
      )
    if (isStale(job))
      return (
        <Badge variant="warning">
          <Clock className="mr-1 h-3 w-3" aria-hidden="true" /> Veraltet
        </Badge>
      )
    return (
      <Badge variant="success">
        <CheckCircle className="mr-1 h-3 w-3" aria-hidden="true" /> OK
      </Badge>
    )
  }

  return (
    <div className="p-4 pt-20 sm:p-6 lg:p-8 lg:pt-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight text-fc-fg">Sync-Verwaltung</h1>
        <p className="mt-2 text-fc-fg/70">Externe Datenquellen synchronisieren, Stale-Zustände erkennen und nächste Aktionen ableiten (A3).</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-fc-border/70 bg-fc-surface/40 p-3 text-sm"><p className="text-fc-fg/55">Fehler (letzter Lauf)</p><p className="mt-1 text-lg font-semibold text-fc-loss">{jobs.filter((j) => j.lastRun && !j.lastRun.ok).length}</p></div>
          <div className="rounded-xl border border-fc-border/70 bg-fc-surface/40 p-3 text-sm"><p className="text-fc-fg/55">Veraltet</p><p className="mt-1 text-lg font-semibold text-fc-draw">{jobs.filter((j) => isStale(j)).length}</p></div>
          <div className="rounded-xl border border-fc-border/70 bg-fc-surface/40 p-3 text-sm"><p className="text-fc-fg/55">Nie gelaufen</p><p className="mt-1 text-lg font-semibold text-fc-fg">{jobs.filter((j) => !j.lastRun).length}</p></div>
          <div className="rounded-xl border border-fc-border/70 bg-fc-surface/40 p-3 text-sm"><p className="text-fc-fg/55">Gesund (ok & frisch)</p><p className="mt-1 text-lg font-semibold text-fc-win">{jobs.filter((j) => j.lastRun?.ok && !isStale(j)).length}</p></div>
        </div>
        <p className="mt-3 text-xs text-fc-fg/55">Stale-Schwellen (UI): OpenLigaDB &gt; 6h, News/Streams/Tickets &gt; 24h, Away-Info &gt; 30 Tage, Content-Quellen &gt; 90 Tage. Details/Playbooks: <code>docs/sync-runbook.md</code>, <code>docs/source-matrix-rlno-2026-27.md</code>.</p>
      </div>

      <div aria-live="polite" aria-atomic="true" className="mb-6 min-h-[1.5rem]">
        {feedback ? (
          <div
            role={feedback.type === 'error' ? 'alert' : 'status'}
            className={
              feedback.type === 'error'
                ? 'rounded-xl border border-fc-loss/30 bg-fc-loss/10 px-4 py-3 text-sm text-fc-fg'
                : 'rounded-xl border border-fc-win/30 bg-fc-win/10 px-4 py-3 text-sm text-fc-fg'
            }
          >
            <span className="inline-flex items-center gap-2">
              {feedback.type === 'error' ? (
                <AlertCircle className="h-4 w-4 shrink-0 text-fc-loss" aria-hidden="true" />
              ) : (
                <CheckCircle className="h-4 w-4 shrink-0 text-fc-win" aria-hidden="true" />
              )}
              {feedback.text}
            </span>
          </div>
        ) : null}
      </div>

      <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4 sm:gap-5">
        {jobs.map((job) => {
          const Icon = job.icon
          return (
            <Card key={job.source} className="h-full border-fc-border/80 transition-[border-color,box-shadow] duration-200 hover:border-fc-violet/35 hover:shadow-md hover:shadow-fc-violet/5">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-3">
                  <CardTitle className="flex items-center gap-2 text-lg leading-tight">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-fc-violet/12 text-fc-violet ring-1 ring-inset ring-fc-violet/20">
                      <Icon className="h-4.5 w-4.5" aria-hidden="true" />
                    </span>
                    <span>{job.label}</span>
                  </CardTitle>
                  {getStatusBadge(job)}
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3">
                  {job.lastRun ? (
                    <>
                      <div className="flex items-center gap-2 text-sm text-fc-fg/65">
                        <Clock className="h-4 w-4 shrink-0" aria-hidden="true" />
                        <span>Letzter Lauf: {formatDateTime(job.lastRun.createdAt)}</span>
                      </div>
                      {isStale(job) && job.lastRun.ok ? (
                        <div className="rounded-lg border border-fc-draw/30 bg-fc-draw/10 p-2 text-xs text-fc-fg/80">
                          Datenstand evtl. veraltet – Sync empfohlen.
                        </div>
                      ) : null}
                      <div className="flex items-center gap-2 text-sm text-fc-fg/65">
                        <Zap className="h-4 w-4 shrink-0" aria-hidden="true" />
                        <span>Dauer: {job.lastRun.durationMs}ms</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-fc-fg/65">
                        <Database className="h-4 w-4 shrink-0" aria-hidden="true" />
                        <span>Elemente: {job.lastRun.items}</span>
                      </div>
                      {job.lastRun.message ? (
                        <div className="rounded-lg border border-fc-border/60 bg-fc-bg/25 p-2.5 text-sm leading-relaxed text-fc-fg/75">
                          {job.lastRun.message}
                        </div>
                      ) : null}
                    </>
                  ) : (
                    <p className="text-sm text-fc-fg/55">Noch nie synchronisiert</p>
                  )}
                  <div className="rounded-lg border border-fc-violet/20 bg-fc-violet/5 p-2.5 text-xs text-fc-fg/75">
                    <span className="font-medium text-fc-violet-light">Nächste Aktion:</span> {nextAction(job)}
                  </div>
                  <Button
                    className="mt-1 w-full"
                    onClick={() => triggerSync(job.source)}
                    disabled={job.isRunning}
                    variant={job.isRunning ? 'outline' : (!job.lastRun || !job.lastRun.ok || isStale(job)) ? 'default' : 'outline'}
                    aria-busy={job.isRunning}
                    aria-label={job.isRunning ? `${job.label} wird synchronisiert` : `${job.label} jetzt synchronisieren`}
                  >
                    {job.isRunning ? (
                      <>
                        <Clock className="mr-2 h-4 w-4 animate-spin motion-reduce:animate-none" aria-hidden="true" />
                        Synchronisiere...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4" aria-hidden="true" />
                        Jetzt synchronisieren
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Recent Logs */}
      <Card className="border-fc-border/80">
        <CardHeader className="pb-3">
          <CardTitle className="text-xl">Letzte Sync-Logs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-xl border border-fc-border/60">
            <table className="w-full min-w-[720px] text-sm">
              <caption className="sr-only">Letzte Synchronisierungsprotokolle nach Quelle</caption>
              <thead>
                <tr className="border-b border-fc-border/70 bg-fc-bg/35">
                  <th scope="col" className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-fc-fg/60">
                    Quelle
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-fc-fg/60">
                    Zeit
                  </th>
                  <th scope="col" className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-fc-fg/60">
                    Status
                  </th>
                  <th scope="col" className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-fc-fg/60">
                    Dauer
                  </th>
                  <th scope="col" className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-fc-fg/60">
                    Elemente
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-fc-fg/60">
                    Nachricht
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-fc-border/60">
                {Object.entries(logs).flatMap(([source, sourceLogs]) =>
                  sourceLogs.slice(0, 5).map((log) => (
                    <tr key={`${source}-${log.id}`} className="transition-colors hover:bg-fc-violet/5">
                      <th scope="row" className="px-4 py-3 text-left font-medium text-fc-fg">
                        {source}
                      </th>
                      <td className="px-4 py-3 text-fc-fg/70">{formatDateTime(log.createdAt)}</td>
                      <td className="px-4 py-3 text-center">
                        {log.ok ? (
                          <Badge variant="success">
                            <CheckCircle className="mr-1 h-3 w-3" aria-hidden="true" /> OK
                          </Badge>
                        ) : (
                          <Badge variant="destructive">
                            <AlertCircle className="mr-1 h-3 w-3" aria-hidden="true" /> Fehler
                          </Badge>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center tabular-nums text-fc-fg/75">{log.durationMs}ms</td>
                      <td className="px-4 py-3 text-center tabular-nums text-fc-fg/75">{log.items}</td>
                      <td className="max-w-xs truncate px-4 py-3 text-fc-fg/70" title={log.message || undefined}>
                        {log.message || '—'}
                      </td>
                    </tr>
                  ))
                )}
                {Object.keys(logs).length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-10 text-center text-fc-fg/55">
                      Keine Logs verfügbar. Führe einen Sync aus.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}