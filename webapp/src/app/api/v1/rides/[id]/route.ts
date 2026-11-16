import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@kumpelapp/db'
import { auth } from '@kumpelapp/auth'

export const dynamic = 'force-dynamic'

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth.api.getSession({ headers: request.headers }).catch(() => null)
    if (!session?.user?.id) {
      return NextResponse.json({ error: { code: 'UNAUTHORIZED', message: 'Anmeldung erforderlich' } }, { status: 401 })
    }
    const { id } = await params
    const ride = await prisma.ride.findUnique({ where: { id }, select: { userId: true } })
    if (!ride || ride.userId !== session.user.id) {
      return NextResponse.json({ error: { code: 'NOT_FOUND', message: 'Eintrag nicht gefunden' } }, { status: 404 })
    }
    await prisma.ride.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('ride DELETE error', error)
    return NextResponse.json({ error: { code: 'INTERNAL_ERROR', message: 'Eintrag konnte nicht gelöscht werden' } }, { status: 500 })
  }
}
