import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@kumpelapp/db'
import { auth } from '@kumpelapp/auth'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth.api.getSession({ headers: request.headers }).catch(() => null)
    if (!session?.user?.id) {
      return NextResponse.json({ error: { code: 'UNAUTHORIZED', message: 'Anmeldung erforderlich' } }, { status: 401 })
    }
    const { id } = await params
    const membership = await prisma.groupMember.findUnique({
      where: { groupId_userId: { groupId: id, userId: session.user.id } },
      select: { id: true },
    })
    if (!membership) {
      return NextResponse.json({ error: { code: 'FORBIDDEN', message: 'Kein Zugriff auf diese Gruppe' } }, { status: 403 })
    }

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
    if (!group) {
      return NextResponse.json({ error: { code: 'NOT_FOUND', message: 'Gruppe nicht gefunden' } }, { status: 404 })
    }

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
        joinedAt: m.joinedAt.toISOString(),
        points: tipByUser.get(m.userId)?.points ?? 0,
        scoredTips: tipByUser.get(m.userId)?.scoredTips ?? 0,
        isOwner: m.userId === group.ownerId,
      }))
      .sort((a, b) => b.points - a.points || b.scoredTips - a.scoredTips || a.name.localeCompare(b.name, 'de'))
      .map((entry, idx) => ({ rank: idx + 1, ...entry }))

    return NextResponse.json({
      data: {
        id: group.id,
        name: group.name,
        inviteCode: group.inviteCode,
        createdAt: group.createdAt.toISOString(),
        owner: group.owner,
        memberCount: group._count.members,
        members: leaderboard,
      },
    })
  } catch (error) {
    console.error('group detail GET error', error)
    return NextResponse.json({ error: { code: 'INTERNAL_ERROR', message: 'Gruppe konnte nicht geladen werden' } }, { status: 500 })
  }
}
