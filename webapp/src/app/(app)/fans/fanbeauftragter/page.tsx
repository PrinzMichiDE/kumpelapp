import Link from 'next/link'
import { prisma } from '@kumpelapp/db'
import { Card, CardContent, CardHeader, CardTitle } from '@kumpelapp/ui'
import { ArrowLeft, Globe, Heart, Mail, Phone, SearchX, Shield, Users } from 'lucide-react'

export const dynamic = 'force-dynamic'

function matchesRole(role: string, keywords: string[]) {
  const r = role.toLowerCase()
  return keywords.some((k) => r.includes(k))
}

export default async function FanbeauftragterPage() {
  let contacts: { id: string; role: string; name: string | null; email: string | null; phone: string | null; url: string | null; note: string | null }[] = []
  let loadError = false

  try {
    const rows = await prisma.clubContact.findMany({ orderBy: { role: 'asc' } })
    contacts = rows.map((c) => ({ id: c.id, role: c.role, name: c.name, email: c.email, phone: c.phone, url: c.url, note: c.note }))
  } catch (e) {
    console.error('Fanbeauftragter load error', e)
    loadError = true
  }

  const primary = contacts.filter((c) => matchesRole(c.role, ['fanbeauftragt', 'fanbeauftragter', 'fanbetreuung', 'fanwesen']))
  const secondary = contacts.filter(
    (c) => !primary.includes(c) && matchesRole(c.role, ['fan', 'support', 'fanprojekt', 'sicherheit', 'ordnung'])
  )
  const shown = primary.length ? primary : secondary.length ? secondary : contacts.slice(0, 6)

  return (
    <div className="min-h-screen bg-fc-bg">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Link href="/fans" className="inline-flex items-center gap-1.5 text-sm font-medium text-fc-fg/70 hover:text-fc-violet focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fc-violet focus-visible:ring-offset-2 focus-visible:ring-offset-fc-bg rounded">
            <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Zurück zu Fans
          </Link>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-fc-fg md:text-4xl">Fanbeauftragter</h1>
          <p className="mt-2 text-fc-fg/70">Dein direkter Draht zum Verein für Fanbelange, Vermittlung und Unterstützung.</p>
        </div>

        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {[
            { icon: Users, title: 'Ansprechpartner', text: 'Kontakt für Fanclubs und Anliegen rund um Spieltage.' },
            { icon: Shield, title: 'Vermittlung', text: 'Unterstützung bei Fragen, Konflikten und Abstimmungen.' },
            { icon: Heart, title: 'Fanbelange', text: 'Interessen der Fans im Austausch mit dem Verein.' },
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

        <section aria-labelledby="contact-heading">
          <h2 id="contact-heading" className="mb-4 text-2xl font-bold tracking-tight text-fc-fg">Kontakt & Ansprechpartner</h2>
          {shown.length ? (
            <div className="space-y-4">
              {primary.length === 0 && contacts.length > 0 && (
                <p className="text-sm text-fc-fg/60">Kein explizit als Fanbeauftragter markierter Kontakt gefunden – zeige passende Vereinskontakte.</p>
              )}
              {shown.map((c) => (
                <Card key={c.id} className="transition-[border-color,box-shadow] duration-200 hover:border-fc-violet/35">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">{c.role}{c.name ? ` – ${c.name}` : ''}</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    {c.note ? <p className="mb-3 text-sm leading-relaxed text-fc-fg/70">{c.note}</p> : null}
                    <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-fc-fg/75">
                      {c.email ? (
                        <a href={`mailto:${c.email}`} className="inline-flex items-center gap-1.5 hover:text-fc-violet focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fc-violet rounded">
                          <Mail className="h-4 w-4" aria-hidden="true" /> {c.email}
                        </a>
                      ) : null}
                      {c.phone ? (
                        <a href={`tel:${c.phone}`} className="inline-flex items-center gap-1.5 hover:text-fc-violet focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fc-violet rounded">
                          <Phone className="h-4 w-4" aria-hidden="true" /> {c.phone}
                        </a>
                      ) : null}
                      {c.url ? (
                        <a href={c.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 hover:text-fc-violet focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fc-violet rounded">
                          <Globe className="h-4 w-4" aria-hidden="true" /> Website
                        </a>
                      ) : null}
                    </div>
                    {!c.email && !c.phone && !c.url ? (
                      <p className="text-sm text-fc-fg/50">Keine Kontaktdaten hinterlegt.</p>
                    ) : null}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : loadError ? (
            <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-fc-border/70 bg-fc-surface/40 py-12 text-center text-fc-fg/70">
              <SearchX className="h-10 w-10 text-fc-fg/40" aria-hidden="true" />
              <p className="text-base font-medium text-fc-fg">Kontaktdaten konnten nicht geladen werden</p>
              <p className="max-w-md text-sm text-fc-fg/60">Bitte später erneut versuchen oder Datenbankverbindung prüfen.</p>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-fc-border/70 bg-fc-surface/40 py-12 text-center text-fc-fg/70">
              <SearchX className="h-10 w-10 text-fc-fg/40" aria-hidden="true" />
              <p className="text-base font-medium text-fc-fg">Noch keine Kontaktdaten hinterlegt</p>
              <p className="max-w-md text-sm text-fc-fg/60">Synchronisiere Vereinskontakte im Admin-Bereich, um Ansprechpartner für den Fanbeauftragten anzuzeigen.</p>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
