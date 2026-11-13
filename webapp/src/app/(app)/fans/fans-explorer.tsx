'use client'

import { useMemo, useState } from 'react'
import { Badge, Card, CardContent, Input } from '@kumpelapp/ui'
import { Building2, ExternalLink, Globe, Mail, MapPin, Phone, Search, SearchX, Users, X } from 'lucide-react'

type Fanclub = { id: string; name: string; city: string | null; lat: number | null; lng: number | null; contactUrl: string | null; isOfficial: boolean }
type Contact = { id: string; role: string; name: string | null; email: string | null; phone: string | null; url: string | null }
type Department = { id: string; name: string; description: string | null; contactUrl: string | null }
type StaticLink = { id: string; label: string; url: string; description: string | null; category: string }

type Tab = 'all' | 'fanclubs' | 'contacts' | 'departments' | 'links'

function matches(q: string, ...values: Array<string | null | undefined>) {
  if (!q) return true
  const haystack = values.filter(Boolean).join(' ').toLowerCase()
  return haystack.includes(q)
}

export function FansExplorer({
  fanclubs,
  contacts,
  departments,
  links,
}: {
  fanclubs: Fanclub[]
  contacts: Contact[]
  departments: Department[]
  links: StaticLink[]
}) {
  const [query, setQuery] = useState('')
  const [tab, setTab] = useState<Tab>('all')
  const q = query.trim().toLowerCase()

  const filtered = useMemo(() => {
    const fcs = fanclubs.filter((f) => matches(q, f.name, f.city, f.isOfficial ? 'offiziell' : ''))
    const cts = contacts.filter((c) => matches(q, c.role, c.name, c.email, c.phone))
    const deps = departments.filter((d) => matches(q, d.name, d.description))
    const lks = links.filter((l) => matches(q, l.label, l.description, l.category, l.url))
    return { fanclubs: fcs, contacts: cts, departments: deps, links: lks }
  }, [fanclubs, contacts, departments, links, q])

  const counts = {
    fanclubs: filtered.fanclubs.length,
    contacts: filtered.contacts.length,
    departments: filtered.departments.length,
    links: filtered.links.length,
  }
  const total = counts.fanclubs + counts.contacts + counts.departments + counts.links
  const hasQuery = q.length > 0

  const tabs: { key: Tab; label: string; count: number }[] = [
    { key: 'all', label: 'Alle', count: total },
    { key: 'fanclubs', label: 'Fanclubs', count: counts.fanclubs },
    { key: 'contacts', label: 'Kontakte', count: counts.contacts },
    { key: 'departments', label: 'Abteilungen', count: counts.departments },
    { key: 'links', label: 'Links', count: counts.links },
  ]

  const showSection = (key: Exclude<Tab, 'all'>) => tab === 'all' || tab === key

  return (
    <section aria-labelledby="fans-finder-heading" className="mb-12">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 id="fans-finder-heading" className="text-2xl font-bold tracking-tight text-fc-fg">Fan-Quickfinder</h2>
          <p className="mt-1 text-sm text-fc-fg/65">Durchsuche Fanclubs, Kontakte, Abteilungen und wichtige Links an einem Ort.</p>
        </div>
        <div className="flex flex-wrap gap-2 text-xs text-fc-fg/60">
          <Badge variant="secondary">{fanclubs.length} Fanclubs</Badge>
          <Badge variant="secondary">{contacts.length} Kontakte</Badge>
          <Badge variant="secondary">{departments.length} Abteilungen</Badge>
          <Badge variant="secondary">{links.length} Links</Badge>
        </div>
      </div>

      <div className="rounded-xl border border-fc-border/70 bg-fc-surface/50 p-4 sm:p-5">
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-fc-fg/80">Suche in der Fan-Community</span>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-fc-fg/45" aria-hidden="true" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Name, Ort, Rolle, Abteilung oder Link"
              className="pl-9 pr-9"
              aria-label="Fanbereiche durchsuchen"
            />
            {query ? (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-fc-fg/55 transition-colors hover:bg-fc-violet/10 hover:text-fc-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fc-violet focus-visible:ring-offset-2 focus-visible:ring-offset-fc-surface"
                aria-label="Suche zurücksetzen"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            ) : null}
          </div>
        </label>

        <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label="Bereich filtern">
          {tabs.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              className={[
                'inline-flex h-10 items-center gap-1.5 rounded-lg px-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fc-violet focus-visible:ring-offset-2 focus-visible:ring-offset-fc-surface',
                tab === t.key ? 'bg-fc-violet text-white' : 'border border-fc-border bg-fc-bg/40 text-fc-fg/80 hover:bg-fc-violet/10',
              ].join(' ')}
              aria-pressed={tab === t.key}
            >
              {t.label}
              <span className={tab === t.key ? 'text-white/80' : 'text-fc-fg/50'}>{t.count}</span>
            </button>
          ))}
        </div>

        <p className="mt-3 text-sm text-fc-fg/60" aria-live="polite">
          {hasQuery ? `${total} Treffer für „${query.trim()}“` : 'Gib einen Suchbegriff ein oder wähle einen Bereich, um gezielt zu filtern.'}
        </p>
      </div>

      {hasQuery || tab !== 'all' ? (
        total === 0 ? (
          <div className="mt-5 flex flex-col items-center justify-center gap-3 rounded-xl border border-fc-border/70 bg-fc-surface/40 py-14 text-center text-fc-fg/70">
            <SearchX className="h-10 w-10 text-fc-fg/40" aria-hidden="true" />
            <p className="text-base font-medium text-fc-fg">Keine passenden Einträge gefunden</p>
            <p className="max-w-md text-sm text-fc-fg/60">Passe Suchbegriff oder Bereich an.</p>
          </div>
        ) : (
          <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-2">
            {showSection('fanclubs') && filtered.fanclubs.length > 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <h3 className="mb-3 flex items-center gap-2 text-lg font-semibold text-fc-fg"><Users className="h-5 w-5 text-fc-violet" aria-hidden="true" />Fanclubs <span className="text-sm font-normal text-fc-fg/55">({filtered.fanclubs.length})</span></h3>
                  <ul className="space-y-2">
                    {filtered.fanclubs.slice(0, 8).map((fc) => (
                      <li key={fc.id} className="rounded-lg border border-fc-border/60 bg-fc-bg/30 p-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-medium text-fc-fg">{fc.name}</p>
                          {fc.isOfficial ? <span className="rounded-full bg-fc-violet/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-fc-violet">Offiziell</span> : null}
                        </div>
                        <p className="mt-1 inline-flex items-center gap-1.5 text-sm text-fc-fg/65"><MapPin className="h-3.5 w-3.5" aria-hidden="true" />{fc.city || 'Ort unbekannt'}</p>
                        {fc.contactUrl ? <a href={fc.contactUrl} target="_blank" rel="noopener noreferrer" className="mt-1 inline-flex items-center gap-1 rounded text-sm font-medium text-fc-violet transition-colors hover:text-fc-violet-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fc-violet focus-visible:ring-offset-2 focus-visible:ring-offset-fc-bg"><ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />Kontakt</a> : null}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ) : null}

            {showSection('contacts') && filtered.contacts.length > 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <h3 className="mb-3 flex items-center gap-2 text-lg font-semibold text-fc-fg"><Phone className="h-5 w-5 text-fc-violet" aria-hidden="true" />Kontakte <span className="text-sm font-normal text-fc-fg/55">({filtered.contacts.length})</span></h3>
                  <ul className="space-y-2">
                    {filtered.contacts.slice(0, 8).map((c) => (
                      <li key={c.id} className="rounded-lg border border-fc-border/60 bg-fc-bg/30 p-3">
                        <p className="font-medium text-fc-fg">{c.role}{c.name ? ` – ${c.name}` : ''}</p>
                        <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-fc-fg/65">
                          {c.email ? <a href={`mailto:${c.email}`} className="inline-flex items-center gap-1 rounded transition-colors hover:text-fc-violet focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fc-violet focus-visible:ring-offset-2 focus-visible:ring-offset-fc-bg"><Mail className="h-3.5 w-3.5" aria-hidden="true" />{c.email}</a> : null}
                          {c.phone ? <a href={`tel:${c.phone}`} className="inline-flex items-center gap-1 rounded transition-colors hover:text-fc-violet focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fc-violet focus-visible:ring-offset-2 focus-visible:ring-offset-fc-bg"><Phone className="h-3.5 w-3.5" aria-hidden="true" />{c.phone}</a> : null}
                          {c.url ? <a href={c.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 rounded transition-colors hover:text-fc-violet focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fc-violet focus-visible:ring-offset-2 focus-visible:ring-offset-fc-bg"><Globe className="h-3.5 w-3.5" aria-hidden="true" />Website</a> : null}
                        </div>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ) : null}

            {showSection('departments') && filtered.departments.length > 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <h3 className="mb-3 flex items-center gap-2 text-lg font-semibold text-fc-fg"><Building2 className="h-5 w-5 text-fc-violet" aria-hidden="true" />Abteilungen <span className="text-sm font-normal text-fc-fg/55">({filtered.departments.length})</span></h3>
                  <ul className="space-y-2">
                    {filtered.departments.slice(0, 8).map((d) => (
                      <li key={d.id} className="rounded-lg border border-fc-border/60 bg-fc-bg/30 p-3">
                        <p className="font-medium text-fc-fg">{d.name}</p>
                        {d.description ? <p className="mt-1 text-sm text-fc-fg/65">{d.description}</p> : null}
                        {d.contactUrl ? <a href={d.contactUrl} target="_blank" rel="noopener noreferrer" className="mt-1 inline-flex items-center gap-1 rounded text-sm font-medium text-fc-violet transition-colors hover:text-fc-violet-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fc-violet focus-visible:ring-offset-2 focus-visible:ring-offset-fc-bg"><ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />Mehr Infos</a> : null}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ) : null}

            {showSection('links') && filtered.links.length > 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <h3 className="mb-3 flex items-center gap-2 text-lg font-semibold text-fc-fg"><ExternalLink className="h-5 w-5 text-fc-violet" aria-hidden="true" />Links <span className="text-sm font-normal text-fc-fg/55">({filtered.links.length})</span></h3>
                  <ul className="space-y-2">
                    {filtered.links.slice(0, 8).map((l) => (
                      <li key={l.id} className="rounded-lg border border-fc-border/60 bg-fc-bg/30 p-3">
                        <a href={l.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 rounded font-medium text-fc-fg transition-colors hover:text-fc-violet focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fc-violet focus-visible:ring-offset-2 focus-visible:ring-offset-fc-bg">
                          {l.label} <ExternalLink className="h-3.5 w-3.5 text-fc-fg/45" aria-hidden="true" />
                        </a>
                        <p className="mt-1 text-sm text-fc-fg/65">{l.description || l.category}</p>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ) : null}
          </div>
        )
      ) : null}
    </section>
  )
}
