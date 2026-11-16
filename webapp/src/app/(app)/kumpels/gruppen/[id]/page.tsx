import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { prisma } from '@kumpelapp/db'
import { getServerSession } from '@/lib/auth-server'
import { Badge, Button, Card, CardContent, CardHeader, CardTitle } from '@kumpelapp/ui'
import { ArrowLeft, Crown, Trophy, Users } from 'lucide-react'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Gruppe',
  description: 'Gruppendetails, Mitglieder und Tippspiel-Rangliste deiner Kumpel-Runde.',
}

export default async function GruppenDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession()
  if (!session?.user?.id) redirect('/login?callbackUrl=/kumpels')
  const { id } = await params
  const userId = session.user.id

  const membership = await prisma.groupMember.findUnique({
    where: { groupId_userId: { groupId: id, userId } },
    select: { id: true },
  })
  if (!membership) notFound()

  const group = await prisma.group.findUnique({
    where: { id },
    include: {
      owner: { select: { id: true, name: true } },
      _count: { select: { members: true } },
      members: {
        include: { user: { select: { id: true, name: true } } },
        orderBy: { joinedAt: 'asc' },
      },
    },
  })
  if (!group) notFound()

  const memberIds = group.members.map((m) => m.userId)
  const tipAgg = memberIds.length
    ? await prisma.tip.groupBy({
        by: ['userId'],
        where: { userId: { in: memberIds }, points: { not: null } },
        _sum: { points: true },
        _count: { _all: true },
      })
    : []
  const tipByUser = new Map(tipAgg.map((t) => [t.userId, { points: t._sum.points ?? 0, scoredTips: t._count._all }]))

  const leaderboard = group.members
    .map((m) => ({
      userId: m.userId,
      name: m.user?.name || 'Fan',
      joinedAt: m.joinedAt,
      points: tipByUser.get(m.userId)?.points ?? 0,
      scoredTips: tipByUser.get(m.userId)?.scoredTips ?? 0,
      isOwner: m.userId === group.ownerId,
    }))
    .sort((a, b) => b.points - a.points || b.scoredTips - a.scoredTips || a.name.localeCompare(b.name, 'de'))

  return (
    <main id="main-content" className="flex-1">
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <Link
            href="/kumpels"
            className="inline-flex items-center gap-2 rounded-lg text-sm font-medium text-fc-fg/70 transition-colors hover:text-fc-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fc-violet focus-visible:ring-offset-2 focus-visible:ring-offset-fc-bg"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Zurück zu Kumpels
          </Link>
          <Link href="/tippspiel">
            <Button variant="outline" size="sm" className="gap-2"><Trophy className="h-4 w-4" aria-hidden="true" /> Tippspiel</Button>
          </Link>
        </div>

        <div className="mb-8">
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-fc-violet/15 ring-1 ring-fc-violet/25">
              <Users className="h-6 w-6 text-fc-violet" aria-hidden="true" />
            </span>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-fc-fg">{group.name}</h1>
              <p className="mt-1 text-fc-fg/70">{group._count.members} Mitglieder · Einladungscode: <span className="font-mono font-semibold text-fc-fg/90 select-all">{group.inviteCode}</span></p>
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="border-fc-border/70 lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Trophy className="h-5 w-5 text-fc-violet" aria-hidden="true" /> Gruppen-Rangliste (Tippspiel)</CardTitle>
              <p className="text-sm text-fc-fg/60">Punkte aus ausgewerteten Tipps aller Gruppenmitglieder.</p>
            </CardHeader>
            <CardContent>
              {leaderboard.length === 0 ? (
                <p className="text-fc-fg/70">Noch keine Mitglieder.</p>
              ) : (
                <ol className="space-y-2">
                  {leaderboard.map((m, idx) => {
                    const isMe = m.userId === userId
                    return (
                      <li key={m.userId} className={`flex items-center justify-between gap-3 rounded-lg border px-4 py-3 ${isMe ? 'border-fc-violet/35 bg-fc-violet/10' : 'border-fc-border/60 bg-fc-surface/30'}`}>
                        <div className="flex min-w-0 items-center gap-3">
                          <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-fc-bg/50 text-sm font-bold tabular-nums text-fc-fg/80 ring-1 ring-fc-border/60">
                            {idx + 1}
                          </span>
                          <div className="min-w-0">
                            <p className="truncate font-medium text-fc-fg">
                              {m.name}
                              {m.isOwner ? <span className="ml-2 inline-flex items-center gap-1 align-middle text-xs font-semibold text-fc-draw"><Crown className="h-3.5 w-3.5" aria-hidden="true" /> Owner</span> : null}
                              {isMe ? <span className="ml-2 text-xs font-semibold text-fc-violet">Du</span> : null}
                            </p>
                            <p className="text-xs text-fc-fg/55">{m.scoredTips} ausgewertete Tipps</p>
                          </div>
                        </div>
                        <div className="shrink-0 text-right">
                          <p className="text-lg font-bold tabular-nums text-fc-fg">{m.points}</p>
                          <p className="text-xs text-fc-fg/55">Punkte</p>
                        </div>
                      </li>
                    )
                  })}
                </ol>
              )}
            </CardContent>
          </Card>

          <Card className="border-fc-border/70 h-fit">
            <CardHeader><CardTitle>Gruppeninfo</CardTitle></CardHeader>
            <CardContent className="space-y-3 text-sm text-fc-fg/75">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-fc-fg/55">Owner</p>
                <p className="mt-0.5 font-medium text-fc-fg">{group.owner?.name || 'Fan'}</p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-fc-fg/55">Einladungscode</p>
                <p className="mt-0.5 font-mono text-fc-fg select-all">{group.inviteCode}</p>
                <p className="mt-1 text-xs text-fc-fg/55">Teile den Code, damit andere Fans der Gruppe beitreten können.</p>
              </div>
              <div className="flex flex-wrap gap-2 pt-1">
                <Badge variant="secondary">{group._count.members} Mitglieder</Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  )
}
