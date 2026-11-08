'use client'

import { useState, useEffect } from 'react'
import { RefreshCw, Play, AlertCircle, CheckCircle, Clock, Database, Zap, BarChart2, Book, HelpCircle } from 'lucide-react'
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
]

export default function SyncAdminPage() {
  const [jobs, setJobs] = useState<SyncStatus[]>(syncJobs)
  const [logs, setLogs] = useState<Record<string, SyncJob[]>>({})

  useEffect(() => {
    fetchAllLogs()
  }, [])

  const fetchAllLogs = async () => {
    try {
      const responses = await Promise.all(
        jobs.map(job => fetch(`/api/v1/admin/sync/${job.source}`).then(r => r.json()))
      )
      const logsMap: Record<string, SyncJob[]> = {}
      jobs.forEach((job, i) => {
        if (responses[i].data) {
          logsMap[job.source] = responses[i].data
          if (responses[i].data[0]) {
            setJobs(prev => prev.map(j => j.source === job.source ? { ...j, lastRun: responses[i].data[0] } : j))
          }
        }
      })
      setLogs(logsMap)
    } catch (error) {
      console.error('Failed to fetch logs:', error)
    }
  }

  const triggerSync = async (source: string) => {
    setJobs(prev => prev.map(j => j.source === source ? { ...j, isRunning: true } : j))

    try {
      const response = await fetch(`/api/v1/admin/sync/${source}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      })

      const result = await response.json()
      
      if (result.success) {
        await fetchAllLogs()
      } else {
        alert(`Sync fehlgeschlagen: ${result.error?.message || 'Unbekannter Fehler'}`)
      }
    } catch (error) {
      alert(`Sync fehlgeschlagen: ${error}`)
    } finally {
      setJobs(prev => prev.map(j => j.source === source ? { ...j, isRunning: false } : j))
    }
  }

  const getStatusBadge = (job: SyncStatus) => {
    if (job.isRunning) return <Badge variant="default"><Clock className="h-3 w-3 mr-1 animate-spin" /> Läuft...</Badge>
    if (!job.lastRun) return <Badge variant="outline">Nie gelaufen</Badge>
    return job.lastRun.ok 
      ? <Badge variant="success"><CheckCircle className="h-3 w-3 mr-1" /> OK</Badge>
      : <Badge variant="destructive"><AlertCircle className="h-3 w-3 mr-1" /> Fehler</Badge>
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-fc-fg">Sync-Verwaltung</h1>
        <p className="mt-2 text-fc-fg/70">Externe Datenquellen synchronisieren und Status überwachen</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {jobs.map((job) => {
          const Icon = job.icon
          return (
            <Card key={job.source} className="h-full">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl flex items-center gap-2">
                    <Icon className="h-6 w-6 text-fc-violet" aria-hidden="true" />
                    {job.label}
                  </CardTitle>
                  {getStatusBadge(job)}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {job.lastRun ? (
                    <>
                      <div className="flex items-center gap-2 text-sm text-fc-fg/60">
                        <Clock className="h-4 w-4" aria-hidden="true" />
                        <span>Letzter Lauf: {formatDateTime(job.lastRun.createdAt)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-fc-fg/60">
                        <Zap className="h-4 w-4" aria-hidden="true" />
                        <span>Dauer: {job.lastRun.durationMs}ms</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-fc-fg/60">
                        <Database className="h-4 w-4" aria-hidden="true" />
                        <span>Elemente: {job.lastRun.items}</span>
                      </div>
                      {job.lastRun.message && (
                        <div className="text-sm text-fc-fg/70 bg-fc-surface p-2 rounded">
                          {job.lastRun.message}
                        </div>
                      )}
                    </>
                  ) : (
                    <p className="text-sm text-fc-fg/50">Noch nie synchronisiert</p>
                  )}
                  <Button
                    className="w-full mt-4"
                    onClick={() => triggerSync(job.source)}
                    disabled={job.isRunning}
                    variant={job.isRunning ? 'outline' : 'default'}
                  >
                    {job.isRunning ? (
                      <>
                        <Clock className="h-4 w-4 mr-2 animate-spin" aria-hidden="true" />
                        Synchronisiere...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2" aria-hidden="true" />
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
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Letzte Sync-Logs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full" role="table">
              <thead>
                <tr className="bg-fc-surface border-b border-fc-border">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-fc-fg/60 uppercase tracking-wider">Quelle</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-fc-fg/60 uppercase tracking-wider">Zeit</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-fc-fg/60 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-fc-fg/60 uppercase tracking-wider">Dauer</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-fc-fg/60 uppercase tracking-wider">Elemente</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-fc-fg/60 uppercase tracking-wider">Nachricht</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-fc-border">
                {Object.entries(logs).flatMap(([source, sourceLogs]) => 
                  sourceLogs.slice(0, 5).map(log => (
                    <tr key={`${source}-${log.id}`} className="hover:bg-fc-violet/5">
                      <td className="px-4 py-3 font-medium text-fc-fg">{source}</td>
                      <td className="px-4 py-3 text-fc-fg/70">{formatDateTime(log.createdAt)}</td>
                      <td className="px-4 py-3 text-center">
                        {log.ok ? (
                          <Badge variant="success"><CheckCircle className="h-3 w-3 mr-1" /> OK</Badge>
                        ) : (
                          <Badge variant="destructive"><AlertCircle className="h-3 w-3 mr-1" /> Fehler</Badge>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center tabular-nums">{log.durationMs}ms</td>
                      <td className="px-4 py-3 text-center tabular-nums">{log.items}</td>
                      <td className="px-4 py-3 text-fc-fg/70 max-w-xs truncate">{log.message || '—'}</td>
                    </tr>
                  ))
                )}
                {Object.keys(logs).length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-fc-fg/50">
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