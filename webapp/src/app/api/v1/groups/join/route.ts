import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@kumpelapp/db'
import { auth } from '@kumpelapp/auth'

export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({ headers: request.headers }).catch(() => null)
  const ct = request.headers.get('content-type') || ''
  const isForm = ct.includes('form')
  if (!session?.user?.id) {
    if (isForm) return NextResponse.redirect(new URL('/login?callbackUrl=/kumpels', request.url), 303)
    return NextResponse.json({ error: { code: 'UNAUTHORIZED', message: 'Nicht angemeldet' } }, { status: 401 })
  }
  try {
    let inviteCode = ''
    if (ct.includes('application/json')) {
      const body = await request.json()
      inviteCode = String(body?.inviteCode || '')
    } else {
      const form = await request.formData()
      inviteCode = String(form.get('inviteCode') || '')
    }
    inviteCode = inviteCode.trim()
    if (!inviteCode) {
      if (isForm) return NextResponse.redirect(new URL('/kumpels?error=invite', request.url), 303)
      return NextResponse.json({ error: { code: 'INVALID', message: 'Einladungscode fehlt' } }, { status: 400 })
    }
    const group = await prisma.group.findUnique({ where: { inviteCode } })
    if (!group) {
      if (isForm) return NextResponse.redirect(new URL('/kumpels?error=notfound', request.url), 303)
      return NextResponse.json({ error: { code: 'NOT_FOUND', message: 'Gruppe nicht gefunden' } }, { status: 404 })
    }
    await prisma.groupMember.upsert({
      where: { groupId_userId: { groupId: group.id, userId: session.user.id } },
      update: {},
      create: { groupId: group.id, userId: session.user.id },
    })
    if (isForm) return NextResponse.redirect(new URL('/kumpels?joined=1', request.url), 303)
    return NextResponse.json({ data: { ok: true, groupId: group.id } })
  } catch (e) {
    console.error(e)
    if (isForm) return NextResponse.redirect(new URL('/kumpels?error=server', request.url), 303)
    return NextResponse.json({ error: { code: 'SERVER_ERROR', message: 'Beitritt fehlgeschlagen' } }, { status: 500 })
  }
}