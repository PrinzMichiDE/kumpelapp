'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, Button } from '@kumpelapp/ui'

type PushPrefs = {
  kickoff: boolean
  goal: boolean
  result: boolean
  news: boolean
  group: boolean
  tickets: boolean
  quietFrom: number | null
  quietTo: number | null
}

const defaultPrefs: PushPrefs = { kickoff: true, goal: true, result: true, news: false, group: true, tickets: true, quietFrom: 22, quietTo: 8 }

export default function EinstellungenPage() {
  const [prefs, setPrefs] = useState<PushPrefs>(defaultPrefs)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/v1/me/push-prefs').then(r => r.ok ? r.json() : null).then(d => { if (d?.data) setPrefs({ ...defaultPrefs, ...d.data }) }).catch(() => {})
  }, [])

  async function save() {
    setSaving(true); setMsg(null)
    try {
      const res = await fetch('/api/v1/me/push-prefs', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(prefs) })
      if (!res.ok) throw new Error('save failed')
      setMsg('Einstellungen gespeichert.')
    } catch {
      setMsg('Speichern nicht möglich (bitte anmelden oder später erneut versuchen).')
    } finally { setSaving(false) }
  }

  const toggle = (k: keyof PushPrefs) => setPrefs(p => ({ ...p, [k]: !p[k] as any }))

  return (
    <main id="main-content" className="flex-1">
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-fc-fg">Einstellungen</h1>
        <p className="mt-2 text-fc-fg/70">Benachrichtigungen (Opt-in), Ruhezeiten und Datenschutz-Optionen. Änderungen wirken für deinen Account.</p>

        <Card className="mt-8 border-fc-border/70">
          <CardHeader><CardTitle>Push-Benachrichtigungen</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm">
            <p className="text-fc-fg/70">Kategorien, Ruhezeiten und Opt-in werden pro Account gespeichert. Test-Push/Diagnose-UI kann je nach Ausrollungsstand variieren; bei Problemen Token/Browser-Berechtigungen prüfen.</p>
            {([
              ['kickoff', 'Anstoß-Erinnerungen (z. B. 60/15 Min.)'],
              ['goal', 'Tore & wichtige Spielereignisse'],
              ['result', 'Halbzeit / Endstand'],
              ['news', 'Wichtige Vereinsnews'],
              ['group', 'Gruppen- & Tippspiel-Aktivitäten'],
              ['tickets', 'Ticket- & Vorverkaufshinweise'],
            ] as const).map(([key, label]) => (
              <label key={key} className="flex cursor-pointer items-center justify-between gap-4 rounded-lg border border-fc-border/60 px-3 py-3 transition-colors hover:border-fc-violet/35 hover:bg-fc-violet/5">
                <span className="text-fc-fg/90">{label}</span>
                <input
                  type="checkbox"
                  checked={!!prefs[key]}
                  onChange={() => toggle(key)}
                  className="h-4 w-4 accent-[#5C2D91] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fc-violet focus-visible:ring-offset-2 focus-visible:ring-offset-fc-surface"
                />
              </label>
            ))}
            <div className="grid grid-cols-1 gap-3 pt-2 sm:grid-cols-2">
              <label className="flex flex-col gap-1.5">
                <span className="text-sm font-medium text-fc-fg/70">Ruhezeit von (Stunde)</span>
                <input
                  type="number"
                  min={0}
                  max={23}
                  value={prefs.quietFrom ?? ''}
                  onChange={e => setPrefs(p => ({ ...p, quietFrom: e.target.value === '' ? null : Number(e.target.value) }))}
                  className="h-11 rounded-lg border border-fc-border bg-fc-bg px-3 text-sm text-fc-fg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fc-violet focus-visible:ring-offset-2 focus-visible:ring-offset-fc-surface"
                />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="text-sm font-medium text-fc-fg/70">Ruhezeit bis (Stunde)</span>
                <input
                  type="number"
                  min={0}
                  max={23}
                  value={prefs.quietTo ?? ''}
                  onChange={e => setPrefs(p => ({ ...p, quietTo: e.target.value === '' ? null : Number(e.target.value) }))}
                  className="h-11 rounded-lg border border-fc-border bg-fc-bg px-3 text-sm text-fc-fg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fc-violet focus-visible:ring-offset-2 focus-visible:ring-offset-fc-surface"
                />
              </label>
            </div>
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Button onClick={save} disabled={saving}>{saving ? 'Speichern…' : 'Speichern'}</Button>
              {msg ? <span className="text-sm text-fc-fg/70" role="status" aria-live="polite">{msg}</span> : null}
            </div>
          </CardContent>
        </Card>

        <Card className="mt-6 border-fc-border/70">
          <CardHeader><CardTitle>Datenschutz & Rechte</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm text-fc-fg/75">
            <p>Datenminimierung: Nur notwendige Daten für Konto, Tipps, Gruppen und optionale Features. Push und Analytics nur opt-in.</p>
            <ul className="list-disc space-y-1 pl-6">
              <li>Auskunft/Export und Löschung des Accounts sind für den Produktivbetrieb bereitzustellen (DSGVO).</li>
              <li>Ticketdaten/Barcodes: möglichst lokal speichern, keine unnötige Server-Ablage.</li>
              <li>Keine öffentlichen Echtzeit-Standorte; Mitfahrten/Check-ins nur mit minimalen Angaben.</li>
            </ul>
            <p>
              Details siehe{' '}
              <a className="rounded font-medium text-fc-violet transition-colors hover:text-fc-violet-light hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fc-violet focus-visible:ring-offset-2 focus-visible:ring-offset-fc-surface" href="/datenschutz">Datenschutzerklärung</a>{' '}
              und{' '}
              <a className="rounded font-medium text-fc-violet transition-colors hover:text-fc-violet-light hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fc-violet focus-visible:ring-offset-2 focus-visible:ring-offset-fc-surface" href="/quellen">Quellen &amp; Lizenzen</a>.
            </p>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
