import Link from 'next/link'
import { prisma } from '@kumpelapp/db'
import { Card, CardContent, CardHeader, CardTitle } from '@kumpelapp/ui'
import { ArrowLeft, Building2, ExternalLink, FileText, Globe, Landmark, Mail, Phone, Scale, SearchX, Shield, Users } from 'lucide-react'

export const dynamic = 'force-dynamic'

function matches(text: string, keywords: string[]) {
  const t = text.toLowerCase()
  return keywords.some((k) => t.includes(k))
}

export default async function GremienPage() {
  let contacts: { id: string; role: string; name: string | null; email: string | null; phone: string | null; url: string | null; note: string | null }[] = []
  let links: { id: string; label: string; url: string; description: string | null; category: string }[] = []
  let departments: { id: string; name: string; description: string | null; contactUrl: string | null }[] = []
  let loadError = false

  try {
    const [contactRows, linkRows, deptRows] = await Promise.all([
      prisma.clubContact.findMany({ orderBy: { role: 'asc' } }),
      prisma.staticLink.findMany({
        where: { category: { in: ['gremien', 'satzung', 'ordnung', 'verein', 'club', 'official', 'documents', 'dokumente'] } },
        orderBy: [{ sortOrder: 'asc' }, { label: 'asc' }],
        take: 30,
      }),
      prisma.department.findMany({ orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }] }),
    ])
    contacts = contactRows.map((c) => ({ id: c.id, role: c.role, name: c.name, email: c.email, phone: c.phone, url: c.url, note: c.note }))
    links = linkRows.map((l) => ({ id: l.id, label: l.label, url: l.url, description: l.description, category: l.category }))
    departments = deptRows.map((d) => ({ id: d.id, name: d.name, description: d.description, contactUrl: d.contactUrl }))
  } catch (e) {
    console.error('Gremien load error', e)
    loadError = true
  }

  const boardKeywords = ['vorstand', 'aufsichtsrat', 'präsidium', 'gremium', 'ehrenrat', 'geschäftsführ']
  const docKeywords = ['satzung', 'ordnung', 'dokument', 'statut', 'richtlinie', 'wahl', 'protokoll']

  const boardContacts = contacts.filter((c) => matches(`${c.role} ${c.note ?? ''}`, boardKeywords))
  const boardDepartments = departments.filter((d) => matches(`${d.name} ${d.description ?? ''}`, boardKeywords))
  const docLinks = links.filter((l) => matches(`${l.category} ${l.label} ${l.description ?? ''}`, docKeywords))
  const otherLinks = links.filter((l) => !docLinks.includes(l)).slice(0, 8)
  const shownContacts = boardContacts.length ? boardContacts : contacts.filter((c) => matches(c.role, ['verein', 'leitung', 'verwaltung'])).slice(0, 6)

  return (
    <div className="min-h-screen bg-fc-bg">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Link href="/verein" className="inline-flex items-center gap-1.5 text-sm font-medium text-fc-fg/70 hover:text-fc-violet focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fc-violet focus-visible:ring-offset-2 focus-visible:ring-offset-fc-bg rounded">
            <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Zurück zum Verein
          </Link>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-fc-fg md:text-4xl">Gremien &amp; Satzung</h1>
          <p className="mt-2 text-fc-fg/70">Vorstand, Aufsichtsrat, Satzung und Ordnungen – strukturiert aus Vereinsdaten und Dokumentenlinks.</p>
        </div>

        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {[
            { icon: Landmark, title: 'Vorstand & Leitung', text: 'Verantwortliche Gremien und Ansprechpartner im Vereinsgefüge.' },
            { icon: Shield, title: 'Aufsicht & Kontrolle', text: 'Organe wie Aufsichtsrat oder weitere Kontrollgremien.' },
            { icon: Scale, title: 'Satzung & Ordnungen', text: 'Grundlagen, Regeln und offizielle Vereinsdokumente.' },
          ].map((item) => (
            <Card key={item.title}>
              <CardContent className="pt-6">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-fc-violet/12 ring-1 ring-fc-violet/20">
                  <item.icon className="h-5 w-5 text-fc-violet" aria-hidden="true" />
                </div>
                <p className="font-semibold text-fc-fg">{item.title}</p>
                <p className="mt-1 text-sm text-fc-fg/65">{item.text}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="space-y-10">
          <section aria-labelledby="board-heading">
            <h2 id="board-heading" className="mb-4 text-2xl font-bold tracking-tight text-fc-fg">Gremien & Ansprechpartner</h2>
            {shownContacts.length || boardDepartments.length ? (
              <div className="space-y-6">
                {shownContacts.length ? (
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {boardContacts.length === 0 && contacts.length > 0 && (
                      <p className="text-sm text-fc-fg/60 md:col-span-2">Keine explizit als Gremium/Vorstand markierten Kontakte gefunden – zeige passende Vereinskontakte.</p>
                    )}
                    {shownContacts.map((c) => (
                      <Card key={c.id}>
                        <CardHeader className="pb-2"><CardTitle className="text-lg flex items-center gap-2"><Users className="h-4 w-4 text-fc-violet" aria-hidden="true" />{c.role}{c.name ? ` – ${c.name}` : ''}</CardTitle></CardHeader>
                        <CardContent className="pt-0">
                          {c.note ? <p className="mb-3 text-sm leading-relaxed text-fc-fg/70">{c.note}</p> : null}
                          <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-fc-fg/75">
                            {c.email ? <a href={`mailto:${c.email}`} className="inline-flex items-center gap-1.5 hover:text-fc-violet"><Mail className="h-4 w-4" aria-hidden="true" />{c.email}</a> : null}
                            {c.phone ? <a href={`tel:${c.phone}`} className="inline-flex items-center gap-1.5 hover:text-fc-violet"><Phone className="h-4 w-4" aria-hidden="true" />{c.phone}</a> : null}
                            {c.url ? <a href={c.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 hover:text-fc-violet"><Globe className="h-4 w-4" aria-hidden="true" />Website</a> : null}
                          </div>
                          {!c.email && !c.phone && !c.url ? <p className="text-sm text-fc-fg/50">Keine Kontaktdaten hinterlegt.</p> : null}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : null}

                {boardDepartments.length ? (
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {boardDepartments.map((d) => (
                      <Card key={d.id}>
                        <CardContent className="pt-6">
                          <div className="flex items-start gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-fc-violet/12 ring-1 ring-fc-violet/20">
                              <Building2 className="h-5 w-5 text-fc-violet" aria-hidden="true" />
                            </div>
                            <div className="min-w-0">
                              <p className="font-medium text-fc-fg">{d.name}</p>
                              {d.description ? <p className="mt-1 text-sm text-fc-fg/65">{d.description}</p> : null}
                              {d.contactUrl ? <a href={d.contactUrl} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-fc-violet hover:text-fc-violet-light">Mehr Infos <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" /></a> : null}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : null}
              </div>
            ) : loadError ? (
              <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-fc-border/70 bg-fc-surface/40 py-12 text-center text-fc-fg/70">
                <SearchX className="h-10 w-10 text-fc-fg/40" aria-hidden="true" />
                <p className="text-base font-medium text-fc-fg">Gremiendaten konnten nicht geladen werden</p>
                <p className="max-w-md text-sm text-fc-fg/60">Bitte später erneut versuchen oder Datenbankverbindung prüfen.</p>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-fc-border/70 bg-fc-surface/40 py-12 text-center text-fc-fg/70">
                <SearchX className="h-10 w-10 text-fc-fg/40" aria-hidden="true" />
                <p className="text-base font-medium text-fc-fg">Keine Gremien/Kontakte hinterlegt</p>
                <p className="max-w-md text-sm text-fc-fg/60">Synchronisiere Vereinskontakte und Abteilungen (z. B. Vorstand/Aufsichtsrat), um Gremien anzuzeigen.</p>
              </div>
            )}
          </section>

          <section aria-labelledby="docs-heading">
            <h2 id="docs-heading" className="mb-4 text-2xl font-bold tracking-tight text-fc-fg">Satzung & Ordnungen</h2>
            {docLinks.length ? (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {docLinks.map((l) => (
                  <a key={l.id} href={l.url} target="_blank" rel="noopener noreferrer" className="block rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fc-violet focus-visible:ring-offset-2 focus-visible:ring-offset-fc-bg">
                    <Card className="h-full transition-[border-color,box-shadow] duration-200 hover:border-fc-violet/35 hover:shadow-md hover:shadow-fc-violet/5">
                      <CardContent className="flex items-start gap-3 pt-6">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-fc-violet/12 ring-1 ring-fc-violet/20">
                          <FileText className="h-5 w-5 text-fc-violet" aria-hidden="true" />
                        </div>
                        <div className="min-w-0">
                          <p className="inline-flex items-center gap-1 font-medium text-fc-fg">{l.label} <ExternalLink className="h-3.5 w-3.5 text-fc-fg/45" aria-hidden="true" /></p>
                          <p className="mt-1 text-sm text-fc-fg/65">{l.description || l.category}</p>
                        </div>
                      </CardContent>
                    </Card>
                  </a>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-fc-border/70 bg-fc-surface/40 py-12 text-center text-fc-fg/70">
                <SearchX className="h-10 w-10 text-fc-fg/40" aria-hidden="true" />
                <p className="text-base font-medium text-fc-fg">Keine Dokumentenlinks hinterlegt</p>
                <p className="max-w-md text-sm text-fc-fg/60">Synchronisiere statische Links (z. B. Satzung/Ordnungen/Dokumente), um offizielle Unterlagen anzuzeigen.</p>
              </div>
            )}
          </section>

          {otherLinks.length > 0 && (
            <section aria-labelledby="other-links-heading">
              <h2 id="other-links-heading" className="mb-4 text-2xl font-bold tracking-tight text-fc-fg">Weitere Vereinslinks</h2>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {otherLinks.map((l) => (
                  <a key={l.id} href={l.url} target="_blank" rel="noopener noreferrer" className="block rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fc-violet focus-visible:ring-offset-2 focus-visible:ring-offset-fc-bg">
                    <Card className="h-full transition-[border-color,box-shadow] duration-200 hover:border-fc-violet/35 hover:shadow-md hover:shadow-fc-violet/5">
                      <CardContent className="flex items-start gap-3 pt-6">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-fc-violet/12 ring-1 ring-fc-violet/20">
                          <ExternalLink className="h-5 w-5 text-fc-violet" aria-hidden="true" />
                        </div>
                        <div className="min-w-0">
                          <p className="inline-flex items-center gap-1 font-medium text-fc-fg">{l.label} <ExternalLink className="h-3.5 w-3.5 text-fc-fg/45" aria-hidden="true" /></p>
                          <p className="mt-1 text-sm text-fc-fg/65">{l.description || l.category}</p>
                        </div>
                      </CardContent>
                    </Card>
                  </a>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  )
}
