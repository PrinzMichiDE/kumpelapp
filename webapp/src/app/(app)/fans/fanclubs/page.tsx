import Link from 'next/link'
import { prisma } from '@kumpelapp/db'
import { Card, CardContent } from '@kumpelapp/ui'
import { ArrowLeft, ExternalLink, MapPin, SearchX, Users } from 'lucide-react'

export const dynamic = 'force-dynamic'

type Props = {
  searchParams: Promise<{ q?: string; city?: string; official?: string }>
}

export default async function FanclubsPage({ searchParams }: Props) {
  const params = await searchParams
  const q = (params.q || '').trim()
  const city = (params.city || '').trim()
  const official = params.official

  const where: Record<string, unknown> = {}
  if (city) where.city = { contains: city, mode: 'insensitive' }
  if (official === '1') where.isOfficial = true
  if (q) {
    where.OR = [
      { name: { contains: q, mode: 'insensitive' } },
      { city: { contains: q, mode: 'insensitive' } },
    ]
  }

  let fanclubs: { id: string; name: string; city: string | null; contactUrl: string | null; isOfficial: boolean; lat: number | null; lng: number | null }[] = []
  let cities: string[] = []
  let error = false

  try {
    const rows = await prisma.fanClub.findMany({
      where,
      orderBy: [{ isOfficial: 'desc' }, { city: 'asc' }, { name: 'asc' }],
    })
    fanclubs = rows.map((f) => ({ id: f.id, name: f.name, city: f.city, contactUrl: f.contactUrl, isOfficial: f.isOfficial, lat: f.lat, lng: f.lng }))
    const allCities = await prisma.fanClub.findMany({ select: { city: true }, distinct: ['city'] })
    cities = allCities.map((c) => c.city).filter((c): c is string => Boolean(c)).sort((a, b) => a.localeCompare(b, 'de'))
  } catch (e) {
    console.error('Fanclubs page load error', e)
    error = true
  }

  return (
    <div className="min-h-screen bg-fc-bg">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Link href="/fans" className="inline-flex items-center gap-1.5 text-sm font-medium text-fc-fg/70 hover:text-fc-violet focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fc-violet focus-visible:ring-offset-2 focus-visible:ring-offset-fc-bg rounded">
            <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Zurück zu Fans
          </Link>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-fc-fg md:text-4xl">Offizielle Fanclubs</h1>
          <p className="mt-2 text-fc-fg/70">Finde Fanclubs der Veilchen-Community – nach Name, Ort und Status.</p>
        </div>

        <form className="mb-8 grid grid-cols-1 gap-3 rounded-xl border border-fc-border/70 bg-fc-surface/50 p-4 sm:grid-cols-4">
          <label className="flex flex-col gap-1 text-sm text-fc-fg/70 sm:col-span-2">
            Suche
            <input name="q" defaultValue={q} placeholder="Fanclub oder Ort" className="rounded-lg border border-fc-border bg-fc-bg/60 px-3 py-2 text-fc-fg placeholder:text-fc-fg/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fc-violet" />
          </label>
          <label className="flex flex-col gap-1 text-sm text-fc-fg/70">
            Ort
            <select name="city" defaultValue={city} className="rounded-lg border border-fc-border bg-fc-bg/60 px-3 py-2 text-fc-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fc-violet">
              <option value="">Alle Orte</option>
              {cities.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </label>
          <div className="flex items-end gap-2">
            <label className="flex items-center gap-2 rounded-lg border border-fc-border bg-fc-bg/60 px-3 py-2 text-sm text-fc-fg/80">
              <input type="checkbox" name="official" value="1" defaultChecked={official === '1'} className="accent-fc-violet" />
              Nur offiziell
            </label>
            <button type="submit" className="rounded-lg bg-fc-violet px-4 py-2 text-sm font-semibold text-white hover:bg-fc-violet-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fc-violet focus-visible:ring-offset-2 focus-visible:ring-offset-fc-bg">Filtern</button>
          </div>
        </form>

        {fanclubs.length ? (
          <>
            <p className="mb-4 text-sm text-fc-fg/60">{fanclubs.length} Fanclubs gefunden</p>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {fanclubs.map((fc) => (
                <Card key={fc.id} className="transition-[border-color,box-shadow] duration-200 hover:border-fc-violet/35 hover:shadow-md hover:shadow-fc-violet/5">
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-fc-violet/12 text-fc-violet ring-1 ring-inset ring-fc-violet/20">
                        <Users className="h-5 w-5" aria-hidden="true" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-semibold text-fc-fg">{fc.name}</p>
                          {fc.isOfficial && <span className="rounded-full bg-fc-violet/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-fc-violet">Offiziell</span>}
                        </div>
                        <p className="mt-1 inline-flex items-center gap-1.5 text-sm text-fc-fg/65">
                          <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
                          {fc.city || 'Ort unbekannt'}
                        </p>
                        {fc.contactUrl ? (
                          <a href={fc.contactUrl} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-fc-violet hover:text-fc-violet-light rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fc-violet">
                            Kontakt / Website <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                          </a>
                        ) : (
                          <p className="mt-2 text-sm text-fc-fg/45">Kein Kontaktlink hinterlegt</p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        ) : error ? (
          <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-fc-border/70 bg-fc-surface/40 py-16 text-center text-fc-fg/70">
            <SearchX className="h-10 w-10 text-fc-fg/40" aria-hidden="true" />
            <p className="text-base font-medium text-fc-fg">Fanclubs konnten nicht geladen werden</p>
            <p className="max-w-md text-sm text-fc-fg/60">Bitte später erneut versuchen oder Datenbankverbindung prüfen.</p>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-fc-border/70 bg-fc-surface/40 py-16 text-center text-fc-fg/70">
            <SearchX className="h-10 w-10 text-fc-fg/40" aria-hidden="true" />
            <p className="text-base font-medium text-fc-fg">Keine Fanclubs gefunden</p>
            <p className="max-w-md text-sm text-fc-fg/60">
              {q || city || official ? 'Passe die Filter an oder setze sie zurück.' : 'Synchronisiere Fanclub-Daten im Admin-Bereich, um Fanclubs anzuzeigen.'}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
