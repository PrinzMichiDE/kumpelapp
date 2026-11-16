import type { Metadata } from 'next'
import Link from 'next/link'
import { prisma } from '@kumpelapp/db'
import { getServerSession } from '@/lib/auth-server'
import { MapPinned } from 'lucide-react'
import { SammlerClient } from './sammler-client'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Stadion-Sammler',
  description: 'Sammle deine Stadionbesuche im Auswärts-Guide und verfolge deinen Fortschritt als Veilchen-Fan.',
}

export default async function SammlerPage() {
  const session = await getServerSession()
  const userId = session?.user?.id ?? null

  const [venues, visits] = await Promise.all([
    prisma.venue.findMany({
      orderBy: [{ name: 'asc' }],
      select: { id: true, slug: true, name: true, city: true, imageUrl: true },
    }),
    userId
      ? prisma.venueVisit.findMany({
          where: { userId },
          select: { id: true, venueId: true, visitedAt: true, note: true },
          orderBy: { visitedAt: 'desc' },
        })
      : Promise.resolve([]),
  ])

  return (
    <div className="min-h-screen bg-fc-bg">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-fc-violet/15 ring-1 ring-fc-violet/25">
                <MapPinned className="h-6 w-6 text-fc-violet" aria-hidden="true" />
              </span>
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-fc-fg md:text-4xl">Stadion-Sammler</h1>
                <p className="mt-1 text-fc-fg/70">Hake ab, wo du mit Aue schon überall warst.</p>
              </div>
            </div>
          </div>
          <Link
            href="/auswaerts"
            className="inline-flex items-center justify-center rounded-xl border border-fc-border bg-fc-surface/60 px-4 py-2.5 text-sm font-semibold text-fc-fg transition-colors hover:border-fc-violet/40 hover:bg-fc-violet/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fc-violet focus-visible:ring-offset-2 focus-visible:ring-offset-fc-bg"
          >
            Zum Auswärts-Guide
          </Link>
        </div>

        <SammlerClient
          venues={venues}
          initialVisits={visits.map((v) => ({ id: v.id, venueId: v.venueId, visitedAt: v.visitedAt.toISOString(), note: v.note }))}
          isAuthenticated={!!userId}
        />
      </div>
    </div>
  )
}
