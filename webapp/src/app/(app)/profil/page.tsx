import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getServerSession } from '@/lib/auth-server'
import { prisma } from '@kumpelapp/db'
import { Card, CardContent, CardHeader, CardTitle, Button } from '@kumpelapp/ui'
import { Settings, Ticket, Users, Bell, Heart, LogOut } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Profil',
  description: 'Dein KumpelApp-Profil, Tipps, Gruppen und Einstellungen.',
}

export default async function ProfilPage() {
  const session = await getServerSession()
  if (!session?.user?.id) redirect('/login?callbackUrl=/profil')

  const userId = session.user.id
  const [tipCount, groupCount, ticketCount, favCount] = await Promise.all([
    prisma.tip.count({ where: { userId } }),
    prisma.groupMember.count({ where: { userId } }),
    prisma.ticket.count({ where: { userId } }),
    prisma.favorite.count({ where: { userId } }),
  ])

  return (
    <main id="main-content" className="flex-1">
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-fc-fg">Profil</h1>
            <p className="mt-2 text-fc-fg/70">Hallo {session.user.name || session.user.email} – dein Veilchen-Cockpit.</p>
          </div>
          <Link href="/profil/einstellungen">
            <Button variant="outline" className="gap-2"><Settings className="h-4 w-4" /> Einstellungen</Button>
          </Link>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Stat label="Tipps abgegeben" value={String(tipCount)} icon={Users} href="/tippspiel" />
          <Stat label="Gruppen" value={String(groupCount)} icon={Users} href="/kumpels" />
          <Stat label="Tickets" value={String(ticketCount)} icon={Ticket} href="/tickets" />
          <Stat label="Favoriten" value={String(favCount)} icon={Heart} href="/profil/einstellungen" />
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <Card className="border-fc-border/70">
            <CardHeader><CardTitle>Matchday & Community</CardTitle></CardHeader>
            <CardContent className="space-y-2 text-sm">
              <QuickLink href="/kumpels" label="Kumpels & Gruppen" />
              <QuickLink href="/tippspiel" label="Tippspiel (3/2/1/0)" />
              <QuickLink href="/tickets" label="Tickets & Wallet" />
              <QuickLink href="/auswaerts" label="Auswärts-Guide" />
              <QuickLink href="/sammler" label="Stadion-Sammler" />
            </CardContent>
          </Card>
          <Card className="border-fc-border/70">
            <CardHeader><CardTitle>Account</CardTitle></CardHeader>
            <CardContent className="space-y-2 text-sm">
              <QuickLink href="/profil/einstellungen" label="Benachrichtigungen & Privatsphäre" />
              <QuickLink href="/quellen" label="Quellen & Lizenzen" />
              <QuickLink href="/datenschutz" label="Datenschutz & Rechte" />
              <form action="/api/auth/signout" method="post">
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-fc-loss transition-colors hover:bg-fc-loss/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fc-loss/70 focus-visible:ring-offset-2 focus-visible:ring-offset-fc-surface"
                >
                  <LogOut className="h-4 w-4" aria-hidden="true" /> Abmelden
                </button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  )
}

function Stat({ label, value, icon: Icon, href }: { label: string; value: string; icon: any; href: string }) {
  return (
    <Link
      href={href}
      className="group block rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fc-violet focus-visible:ring-offset-2 focus-visible:ring-offset-fc-bg"
    >
      <Card className="h-full border-fc-border/70 transition-[transform,border-color,box-shadow] duration-200 group-hover:-translate-y-0.5 group-hover:border-fc-violet/40 group-hover:shadow-md group-hover:shadow-fc-violet/5 group-focus-visible:-translate-y-0.5 group-focus-visible:border-fc-violet/40">
        <CardContent className="flex items-center gap-3 py-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-fc-violet/10 ring-1 ring-inset ring-fc-violet/15 transition-colors group-hover:bg-fc-violet/15">
            <Icon className="h-5 w-5 text-fc-violet" aria-hidden="true" />
          </div>
          <div>
            <p className="text-2xl font-bold text-fc-fg">{value}</p>
            <p className="text-xs text-fc-fg/60">{label}</p>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

function QuickLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="flex items-center justify-between rounded-lg px-3 py-2 text-fc-fg/80 transition-colors hover:bg-fc-violet/10 hover:text-fc-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fc-violet focus-visible:ring-offset-2 focus-visible:ring-offset-fc-surface"
    >
      {label}
      <span aria-hidden="true">→</span>
    </Link>
  )
}
