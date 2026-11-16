'use client'

import { useEffect, useMemo, useState } from 'react'
import { AlertCircle, CheckCircle, Save, Search } from 'lucide-react'
import { Button, Card, CardContent, CardHeader, CardTitle, Badge } from '@kumpelapp/ui'

type MatchRow = {
  id: string
  kickoff: string
  status: string
  matchday: number | null
  homeGoals: number | null
  awayGoals: number | null
  editorNote: string | null
  source: string | null
  homeTeam: { name: string; shortName: string | null }
  awayTeam: { name: string; shortName: string | null }
}

export default function AdminMatchesPage() {
  const [matches, setMatches] = useState<MatchRow[]>([])
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState<MatchRow | null>(null)
  const [reason, setReason] = useState('')
  const [sourceRef, setSourceRef] = useState('')
  const [saving, setSaving] = useState(false)
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const load = async () => {
    const res = await fetch('/api/v1/matches?limit=200')
    const json = await res.json().catch(() => ({}))
    setMatches(json.data || [])
  }

  useEffect(() => { load() }, [])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return matches.slice(0, 40)
    return matches.filter((m) =>
      [m.id, m.homeTeam.name, m.awayTeam.name, m.homeTeam.shortName || '', m.awayTeam.shortName || '', m.status, String(m.matchday || '')]
        .join(' ')
        .toLowerCase()
        .includes(q),
    ).slice(0, 40)
  }, [matches, query])

  const save = async () => {
    if (!selected) return
    if (!reason.trim()) {
      setFeedback({ type: 'error', text: 'Bitte einen Korrekturgrund angeben (A4/Nachvollziehbarkeit).' })
      return
    }
    setSaving(true)
    setFeedback(null)
    try {
      const res = await fetch(`/api/v1/admin/matches/${selected.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          kickoff: selected.kickoff,
          status: selected.status,
          matchday: selected.matchday,
          homeGoals: selected.homeGoals,
          awayGoals: selected.awayGoals,
          editorNote: selected.editorNote,
          reason: reason.trim(),
          sourceRef: sourceRef.trim() || null,
        }),
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(json?.error?.message || 'Speichern fehlgeschlagen')
      setFeedback({ type: 'success', text: 'Spiel aktualisiert (Audit-Log). Tipps bei Endergebnis automatisch ausgewertet.' })
      await load()
    } catch (e: any) {
      setFeedback({ type: 'error', text: e?.message || 'Fehler beim Speichern' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="p-4 pt-20 sm:p-6 lg:p-8 lg:pt-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-fc-fg">Spiele & Korrekturen</h1>
        <p className="mt-2 text-fc-fg/70">Manuelle Overrides für Anstoß, Status, Ergebnis und Hinweise (mit Audit-Log).</p>
      </div>

      {feedback ? (
        <div className={`mb-4 rounded-xl border px-4 py-3 text-sm ${feedback.type === 'error' ? 'border-fc-loss/30 bg-fc-loss/10 text-fc-fg' : 'border-fc-win/30 bg-fc-win/10 text-fc-fg'}`} role={feedback.type === 'error' ? 'alert' : 'status'}>
          <span className="inline-flex items-center gap-2">{feedback.type === 'error' ? <AlertCircle className="h-4 w-4 text-fc-loss" /> : <CheckCircle className="h-4 w-4 text-fc-win" />}{feedback.text}</span>
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Spiel auswählen</CardTitle>
            <div className="relative mt-2">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-fc-fg/40" />
              <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Team, Status, ID, Spieltag..." className="w-full rounded-lg border border-fc-border bg-fc-bg py-2 pl-9 pr-3 text-sm" />
            </div>
          </CardHeader>
          <CardContent className="space-y-2 max-h-[70vh] overflow-auto">
            {filtered.map((m) => (
              <button key={m.id} type="button" onClick={() => { setSelected({ ...m }); setFeedback(null); }} className={`w-full rounded-lg border p-3 text-left transition ${selected?.id === m.id ? 'border-fc-violet bg-fc-violet/10' : 'border-fc-border/70 hover:border-fc-violet/40'}`}>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-medium text-fc-fg">{m.homeTeam.shortName || m.homeTeam.name} – {m.awayTeam.shortName || m.awayTeam.name}</p>
                  <Badge variant="outline">{m.status}</Badge>
                </div>
                <p className="mt-1 text-xs text-fc-fg/60">{new Date(m.kickoff).toLocaleString('de-DE')} · {m.matchday ? `${m.matchday}. Spieltag` : 'ohne Spieltag'} · {m.source || 'keine Quelle'}</p>
                {m.homeGoals != null && m.awayGoals != null ? <p className="mt-1 text-sm font-semibold">{m.homeGoals}:{m.awayGoals}</p> : null}
              </button>
            ))}
            {filtered.length === 0 ? <p className="text-sm text-fc-fg/60">Keine Spiele gefunden.</p> : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-lg">Korrektur</CardTitle></CardHeader>
          <CardContent>
            {!selected ? (
              <p className="text-sm text-fc-fg/60">Wähle links ein Spiel aus, um es zu korrigieren.</p>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-fc-fg/70"><strong className="text-fc-fg">{selected.homeTeam.name} – {selected.awayTeam.name}</strong><br /><span className="text-xs">ID: {selected.id}</span></p>
                <label className="block text-sm">Anstoß (ISO/Datum)
                  <input value={selected.kickoff.slice(0,16)} onChange={(e) => setSelected({ ...selected, kickoff: new Date(e.target.value).toISOString() })} type="datetime-local" className="mt-1 w-full rounded-lg border border-fc-border bg-fc-bg px-3 py-2" />
                </label>
                <label className="block text-sm">Status
                  <select value={selected.status} onChange={(e) => setSelected({ ...selected, status: e.target.value })} className="mt-1 w-full rounded-lg border border-fc-border bg-fc-bg px-3 py-2">
                    {['SCHEDULED','LIVE','FINISHED','POSTPONED','CANCELLED','ABANDONED'].map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <label className="text-sm">Spieltag<input type="number" value={selected.matchday ?? ''} onChange={(e) => setSelected({ ...selected, matchday: e.target.value === '' ? null : Number(e.target.value) })} className="mt-1 w-full rounded-lg border border-fc-border bg-fc-bg px-3 py-2" /></label>
                  <label className="text-sm">Tore Heim<input type="number" value={selected.homeGoals ?? ''} onChange={(e) => setSelected({ ...selected, homeGoals: e.target.value === '' ? null : Number(e.target.value) })} className="mt-1 w-full rounded-lg border border-fc-border bg-fc-bg px-3 py-2" /></label>
                  <label className="text-sm">Tore Gast<input type="number" value={selected.awayGoals ?? ''} onChange={(e) => setSelected({ ...selected, awayGoals: e.target.value === '' ? null : Number(e.target.value) })} className="mt-1 w-full rounded-lg border border-fc-border bg-fc-bg px-3 py-2" /></label>
                </div>
                <label className="block text-sm">Redaktioneller Hinweis (sichtbar in UI)
                  <textarea value={selected.editorNote ?? ''} onChange={(e) => setSelected({ ...selected, editorNote: e.target.value || null })} rows={3} className="mt-1 w-full rounded-lg border border-fc-border bg-fc-bg px-3 py-2" placeholder="z. B. Verlegt auf 14:00 Uhr laut Vereinsmeldung" />
                </label>
                <label className="block text-sm">Korrekturgrund (Pflicht, intern/Audit)
                  <input value={reason} onChange={(e) => setReason(e.target.value)} className="mt-1 w-full rounded-lg border border-fc-border bg-fc-bg px-3 py-2" placeholder="Warum wird korrigiert?" />
                </label>
                <label className="block text-sm">Quelle/Referenz (URL, Meldung, Ticket etc.)
                  <input value={sourceRef} onChange={(e) => setSourceRef(e.target.value)} className="mt-1 w-full rounded-lg border border-fc-border bg-fc-bg px-3 py-2" placeholder="https://..." />
                </label>
                <Button onClick={save} disabled={saving} className="w-full"><Save className="mr-2 h-4 w-4" />{saving ? 'Speichern...' : 'Korrektur speichern'}</Button>
                <p className="text-xs text-fc-fg/55">Änderungen werden in AuditLog + SourceSyncLog protokolliert. Bei gesetztem editorNote bleiben Kernfelder bei Auto-Syncs geschützt.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}