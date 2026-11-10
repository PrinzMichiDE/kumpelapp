import Link from 'next/link'
import { prisma } from '@kumpelapp/db'
import { Card, CardContent } from '@kumpelapp/ui'
import { ArrowLeft, Building2, ExternalLink, Search, SearchX } from 'lucide-react'

export const dynamic = 'force-dynamic'

type Props = {
  searchParams: Promise<{ q?: string }>
}

export default async function AbteilungenPage({ searchParams }: Props) {
  const params = await searchParams
  const q = (params.q || '').trim()

  let departments: { id: string; name: string; description: string | null; contactUrl: string | null }[] = []
  let loadError = false

  try {
    const rows = await prisma.department.findMany({
      where: q
        ? {
            OR: [
              { name: { contains: q, mode: 'insensitive' } },
              { description: { contains: q, mode: 'insensitive' } },
            ],
          }
        : undefined,
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
    })
    departments = rows.map((d) => ({ id: d.id, name: d.name, description: d.description, contactUrl: d.contactUrl }))
  } catch (e) {
    console.error('Abteilungen load error', e)
    loadError = true
  }

  return (
    <div className="min-h-screen bg-fc-bg">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Link href="/verein" className="inline-flex items-center gap-1.5 text-sm font-medium text-fc-fg/70 hover:text-fc-violet focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fc-violet focus-visible:ring-offset-2 focus-visible:ring-offset-fc-bg rounded">
            <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Zurück zum Verein
          </Link>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-fc-fg md:text-4xl">Abteilungen</h1>
          <p className="mt-2 text-fc-fg/70">Weitere Sportarten und Bereiche im FC Erzgebirge Aue – aus der Vereinsdatenbank.</p>
        </div>

        <form className="mb-8 flex flex-col gap-3 rounded-xl border border-fc-border/70 bg-fc-surface/50 p-4 sm:flex-row sm:items-end">
          <label className="flex flex-1 flex-col gap-1 text-sm text-fc-fg/70">
            Suche
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-fc-fg/40" aria-hidden="true" />
              <input
                name="q"
                defaultValue={q}
                placeholder="Abteilung oder Beschreibung"
                className="w-full rounded-lg border border-fc-border bg-fc-bg/60 py-2 pl-9 pr-3 text-fc-fg placeholder:text-fc-fg/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fc-violet"
              />
            </div>
          </label>
          <button type="submit" className="rounded-lg bg-fc-violet px-4 py-2 text-sm font-semibold text-white hover:bg-fc-violet-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fc-violet focus-visible:ring-offset-2 focus-visible:ring-offset-fc-bg">
            Filtern
          </button>
        </form>

        {departments.length ? (
          <>
            <p className="mb-4 text-sm text-fc-fg/60">{departments.length} Abteilungen gefunden</p>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {departments.map((d) => (
                <Card key={d.id} className="transition-[border-color,box-shadow] duration-200 hover:border-fc-violet/35 hover:shadow-md hover:shadow-fc-violet/5">
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-fc-violet/12 ring-1 ring-fc-violet/20">
                        <Building2 className="h-5 w-5 text-fc-violet" aria-hidden="true" />
                      </div>
                      <div className="min-w-0">
                        <h2 className="text-lg font-semibold text-fc-fg">{d.name}</h2>
                        {d.description ? (
                          <p className="mt-1 text-sm leading-relaxed text-fc-fg/70">{d.description}</p>
                        ) : (
                          <p className="mt-1 text-sm text-fc-fg/50">Keine Beschreibung hinterlegt.</p>
                        )}
                        {d.contactUrl ? (
                          <a
                            href={d.contactUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-fc-violet hover:text-fc-violet-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fc-violet rounded"
                          >
                            Kontakt / Mehr Infos <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                          </a>
                        ) : null}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        ) : loadError ? (
          <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-fc-border/70 bg-fc-surface/40 py-16 text-center text-fc-fg/70">
            <SearchX className="h-10 w-10 text-fc-fg/40" aria-hidden="true" />
            <p className="text-base font-medium text-fc-fg">Abteilungen konnten nicht geladen werden</p>
            <p className="max-w-md text-sm text-fc-fg/60">Bitte später erneut versuchen oder Datenbankverbindung prüfen.</p>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-fc-border/70 bg-fc-surface/40 py-16 text-center text-fc-fg/70">
            <SearchX className="h-10 w-10 text-fc-fg/40" aria-hidden="true" />
            <p className="text-base font-medium text-fc-fg">{q ? 'Keine Abteilungen gefunden' : 'Keine Abteilungen hinterlegt'}</p>
            <p className="max-w-md text-sm text-fc-fg/60">
              {q ? 'Passe die Suche an oder setze sie zurück.' : 'Synchronisiere Vereinsdaten im Admin-Bereich, um Abteilungen anzuzeigen.'}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
