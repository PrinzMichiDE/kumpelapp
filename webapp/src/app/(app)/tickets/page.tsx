import type { Metadata } from 'next'
import Link from 'next/link'
import { getServerSession } from '@/lib/auth-server'
import { prisma } from '@kumpelapp/db'
import { Card, CardContent, CardHeader, CardTitle, Button, Badge } from '@kumpelapp/ui'
import { Ticket, Upload, Wallet, ExternalLink } from 'lucide-react'
import { formatDate } from '@kumpelapp/utils'

export const metadata: Metadata = { title: 'Tickets & Wallet', description: 'Ticket-Übersicht, PDF-Import-Assistenz und Wallet-Links.' }
export const dynamic = 'force-dynamic'

export default async function TicketsPage() {
  const session = await getServerSession()
  if (!session?.user?.id) {
    return (
      <main id="main-content" className="flex-1">
        <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
          <h1 className="text-3xl font-bold text-fc-fg">Tickets & Wallet</h1>
          <p className="mt-3 text-fc-fg/70">Melde dich an, um Tickets zu verwalten, PDFs zu importieren und Wallet-Pässe vorzubereiten.</p>
          <Link href="/login?callbackUrl=/tickets"><Button className="mt-6">Anmelden</Button></Link>
        </div>
      </main>
    )
  }

  const tickets = await prisma.ticket.findMany({ where: { userId: session.user.id }, include: { match: { include: { homeTeam: true, awayTeam: true } }, passes: true }, orderBy: { createdAt: 'desc' }, take: 50 }).catch(() => [])

  return (
    <main id="main-content" className="flex-1">
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-fc-fg">Tickets & Wallet</h1>
            <p className="mt-2 text-fc-fg/70">Assistenz-Funktion: PDF importieren, Daten prüfen, Wallet wo möglich nutzen. Offizieller Verkauf bleibt beim Anbieter.</p>
          </div>
          <a href="https://customer59.ticketing.cloud.sap/shop?shopid=103" target="_blank" rel="noopener noreferrer">
            <Button variant="outline" className="gap-2">Offizieller Ticketshop <ExternalLink className="h-4 w-4" /></Button>
          </a>
        </div>

        <Card className="mt-8 border-fc-border/70">
          <CardHeader><CardTitle className="flex items-center gap-2"><Upload className="h-5 w-5 text-fc-violet" aria-hidden="true" /> Ticket-PDF importieren</CardTitle></CardHeader>
          <CardContent>
            <form action="/api/v1/tickets/parse" method="post" encType="multipart/form-data" className="flex flex-col gap-4 sm:flex-row sm:items-end">
              <label className="flex flex-1 flex-col gap-1.5 text-sm">
                <span className="font-medium text-fc-fg/80">PDF-Datei</span>
                <input
                  type="file"
                  name="file"
                  accept="application/pdf"
                  required
                  className="block w-full rounded-lg border border-fc-border bg-fc-bg px-3 py-2.5 text-sm text-fc-fg file:mr-3 file:rounded-md file:border-0 file:bg-fc-violet/15 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-fc-violet transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fc-violet focus-visible:ring-offset-2 focus-visible:ring-offset-fc-surface"
                />
              </label>
              <Button type="submit" className="gap-2 sm:mb-0">
                <Ticket className="h-4 w-4" aria-hidden="true" />
                Import &amp; Parsen
              </Button>
            </form>
            <p className="mt-3 text-xs text-fc-fg/55">Hinweise: Parser-Ergebnisse bitte prüfen/korrigieren (Status: PENDING/PARSED/PARTIAL/FAILED). Barcodes/QR und sensible Daten werden datensparsam behandelt; Wallet-Generierung ist layout-/anbieterabhängig. Bei Fehlern Ticketdaten manuell abgleichen.</p>
          </CardContent>
        </Card>

        <div className="mt-6 space-y-4">
          {tickets.length === 0 ? (
            <Card className="border-fc-border/70"><CardContent className="py-8 text-fc-fg/70">Noch keine Tickets gespeichert.</CardContent></Card>
          ) : tickets.map(t => (
            <Card key={t.id} className="border-fc-border/70">
              <CardContent className="flex flex-col gap-3 py-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-semibold text-fc-fg">{t.opponent || (t.match ? `${t.match.homeTeam.shortName || t.match.homeTeam.name} – ${t.match.awayTeam.shortName || t.match.awayTeam.name}` : 'Ticket')}</p>
                  <p className="text-sm text-fc-fg/65">{t.matchDate ? formatDate(t.matchDate) : 'Datum unbekannt'}{t.venue ? ` · ${t.venue}` : ''}{t.block ? ` · Block ${t.block}` : ''}{t.row ? ` Reihe ${t.row}` : ''}{t.seat ? ` Platz ${t.seat}` : ''}</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <Badge variant={t.parseStatus === 'PARSED' ? 'secondary' : t.parseStatus === 'FAILED' ? 'destructive' : 'outline'}>{t.parseStatus}</Badge>
                    {t.passes.map(p => <Badge key={p.id} variant="outline"><Wallet className="mr-1 h-3 w-3" /> {p.type}</Badge>)}
                  </div>
                </div>
                <div className="flex gap-2">
                  {t.pdfUrl ? <a href={t.pdfUrl} target="_blank" rel="noopener noreferrer"><Button variant="outline" size="sm">PDF</Button></a> : null}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </main>
  )
}
