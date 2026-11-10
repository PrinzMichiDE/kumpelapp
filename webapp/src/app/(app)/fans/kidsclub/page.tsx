import Link from 'next/link'
import { prisma } from '@kumpelapp/db'
import { Card, CardContent, CardHeader, CardTitle } from '@kumpelapp/ui'
import { ArrowLeft, Baby, Cake, ExternalLink, Globe, Mail, PartyPopper, Phone, SearchX, Smile, Users } from 'lucide-react'

export const dynamic = 'force-dynamic'

function matches(text: string, keywords: string[]) {
  const t = text.toLowerCase()
  return keywords.some((k) => t.includes(k))
}

export default async function KidsClubPage() {
  let contacts: { id: string; role: string; name: string | null; email: string | null; phone: string | null; url: string | null; note: string | null }[] = []
  let links: { id: string; label: string; url: string; description: string | null; category: string }[] = []
  let departments: { id: string; name: string; description: string | null; contactUrl: string | null }[] = []
  let loadError = false

  try {
    const [contactRows, linkRows, deptRows] = await Promise.all([
      prisma.clubContact.findMany({ orderBy: { role: 'asc' } }),
      prisma.staticLink.findMany({
        where: { category: { in: ['kidsclub', 'kids', 'kinder', 'familie', 'nachwuchs', 'fans', 'community'] } },
        orderBy: [{ sortOrder: 'asc' }, { label: 'asc' }],
        take: 20,
      }),
      prisma.department.findMany({ orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }] }),
    ])
    contacts = contactRows.map((c) => ({ id: c.id, role: c.role, name: c.name, email: c.email, phone: c.phone, url: c.url, note: c.note }))
    links = linkRows.map((l) => ({ id: l.id, label: l.label, url: l.url, description: l.description, category: l.category }))
    departments = deptRows.map((d) => ({ id: d.id, name: d.name, description: d.description, contactUrl: d.contactUrl }))
  } catch (e) {
    console.error('KidsClub load error', e)
    loadError = true
  }

  const kidsKeywords = ['kids', 'kid', 'kinder', 'familie', 'nachwuchs', 'geburtstag', 'maskottchen', 'kidsclub']
  const primaryContacts = contacts.filter((c) => matches(`${c.role} ${c.note ?? ''}`, kidsKeywords))
  const primaryLinks = links.filter((l) => matches(`${l.category} ${l.label} ${l.description ?? ''}`, kidsKeywords))
  const primaryDepartments = departments.filter((d) => matches(`${d.name} ${d.description ?? ''}`, kidsKeywords))
  const shownContacts = primaryContacts.length ? primaryContacts : contacts.filter((c) => matches(c.role, ['fan', 'nachwuchs', 'familie'])).slice(0, 4)
  const shownLinks = (primaryLinks.length ? primaryLinks : links).slice(0, 8)
  const shownDepartments = primaryDepartments.slice(0, 4)

  return (
    <div className="min-h-screen bg-fc-bg">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Link href="/fans" className="inline-flex items-center gap-1.5 text-sm font-medium text-fc-fg/70 hover:text-fc-violet focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fc-violet focus-visible:ring-offset-2 focus-visible:ring-offset-fc-bg rounded">
            <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Zurück zu Fans
          </Link>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-fc-fg md:text-4xl">KidsClub</h1>
          <p className="mt-2 text-fc-fg/70">Für die jüngsten Veilchen-Fans – Aktionen, Geburtstage und Erlebnisse rund um den FC Erzgebirge Aue.</p>
        </div>

        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {[
            { icon: Cake, title: 'Kindergeburtstage', text: 'Feiere besondere Momente im Umfeld des Vereins und Stadions.' },
            { icon: PartyPopper, title: 'Aktionen & Erlebnisse', text: 'Exklusive Angebote und Aktionen für junge Fans.' },
            { icon: Smile, title: 'Maskottchen & Nähe', text: 'Begegnungen, Mitmachmomente und Veilchen-Erlebnis für Kids.' },
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

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          <section aria-labelledby="kids-links-heading">
            <h2 id="kids-links-heading" className="mb-4 text-2xl font-bold tracking-tight text-fc-fg">Angebote & Infos</h2>
            {shownLinks.length ? (
              <div className="space-y-3">
                {primaryLinks.length === 0 && links.length > 0 && (
                  <p className="text-sm text-fc-fg/60">Keine explizit als KidsClub/Kinder markierten Links gefunden – zeige relevante Fan-/Familien-Links.</p>
                )}
                {shownLinks.map((l) => (
                  <a key={l.id} href={l.url} target="_blank" rel="noopener noreferrer" className="block rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fc-violet focus-visible:ring-offset-2 focus-visible:ring-offset-fc-bg">
                    <Card className="transition-[border-color,box-shadow] duration-200 hover:border-fc-violet/35 hover:shadow-md hover:shadow-fc-violet/5">
                      <CardContent className="flex items-start gap-3 pt-6">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-fc-violet/12 ring-1 ring-fc-violet/20">
                          <Baby className="h-5 w-5 text-fc-violet" aria-hidden="true" />
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
            ) : loadError ? (
              <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-fc-border/70 bg-fc-surface/40 py-12 text-center text-fc-fg/70">
                <SearchX className="h-10 w-10 text-fc-fg/40" aria-hidden="true" />
                <p className="text-base font-medium text-fc-fg">Daten konnten nicht geladen werden</p>
                <p className="max-w-md text-sm text-fc-fg/60">Bitte später erneut versuchen oder Datenbankverbindung prüfen.</p>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-fc-border/70 bg-fc-surface/40 py-12 text-center text-fc-fg/70">
                <SearchX className="h-10 w-10 text-fc-fg/40" aria-hidden="true" />
                <p className="text-base font-medium text-fc-fg">Noch keine Angebote/Links hinterlegt</p>
                <p className="max-w-md text-sm text-fc-fg/60">Synchronisiere statische Links (z. B. KidsClub/Kinder/Familie), um Aktionen und Infos anzuzeigen.</p>
              </div>
            )}
          </section>

          <div className="space-y-8">
            <section aria-labelledby="kids-contacts-heading">
              <h2 id="kids-contacts-heading" className="mb-4 text-2xl font-bold tracking-tight text-fc-fg">Kontakt</h2>
              {shownContacts.length ? (
                <div className="space-y-4">
                  {shownContacts.map((c) => (
                    <Card key={c.id}>
                      <CardHeader className="pb-2"><CardTitle className="text-lg">{c.role}{c.name ? ` – ${c.name}` : ''}</CardTitle></CardHeader>
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
              ) : (
                <Card>
                  <CardContent className="pt-6 text-sm leading-relaxed text-fc-fg/70">
                    <p>Keine passenden Ansprechpartner hinterlegt. Pflege Vereinskontakte (z. B. KidsClub/Familie/Nachwuchs), um Kontaktinformationen anzuzeigen.</p>
                  </CardContent>
                </Card>
              )}
            </section>

            {shownDepartments.length > 0 && (
              <section aria-labelledby="kids-dept-heading">
                <h2 id="kids-dept-heading" className="mb-4 text-2xl font-bold tracking-tight text-fc-fg">Zuständige Bereiche</h2>
                <div className="space-y-3">
                  {shownDepartments.map((d) => (
                    <Card key={d.id}>
                      <CardContent className="pt-6">
                        <div className="flex items-start gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-fc-violet/12 ring-1 ring-fc-violet/20">
                            <Users className="h-5 w-5 text-fc-violet" aria-hidden="true" />
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
              </section>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
