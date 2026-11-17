import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@kumpelapp/db'
import { auth } from '@kumpelapp/auth'
import { randomBytes } from 'crypto'

export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({ headers: request.headers }).catch(() => null)
  if (!session?.user?.id) {
    // if form post, redirect to login
    const ct = request.headers.get('content-type') || ''
    if (ct.includes('form')) return NextResponse.redirect(new URL('/login?callbackUrl=/kumpels', request.url), 303)
    return NextResponse.json({ error: { code: 'UNAUTHORIZED', message: 'Nicht angemeldet' } }, { status: 401 })
  }
  try {
    let name = ''
    const ct = request.headers.get('content-type') || ''
    if (ct.includes('application/json')) {
      const body = await request.json()
      name = String(body?.name || '')
    } else {
      const form = await request.formData()
      name = String(form.get('name') || '')
    }
    name = name.trim()
    if (name.length < 2) {
      if (ct.includes('form')) return NextResponse.redirect(new URL('/kumpels?error=name', request.url), 303)
      return NextResponse.json({ error: { code: 'INVALID', message: 'Name zu kurz' } }, { status: 400 })
    }
    const inviteCode = randomBytes(4).toString('hex')
    const group = await prisma.group.create({
      data: { name, inviteCode, ownerId: session.user.id, members: { create: { userId: session.user.id } } },
    })
    if (ct.includes('form')) return NextResponse.redirect(new URL('/kumpels?created=1', request.url), 303)
    return NextResponse.json({ data: group }, { status: 201 })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: { code: 'SERVER_ERROR', message: 'Gruppe konnte nicht erstellt werden' } }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  const session = await auth.api.getSession({ headers: request.headers }).catch(() => null)
  if (!session?.user?.id) return NextResponse.json({ data: [] })
  const groups = await prisma.group.findMany({
    where: { members: { some: { userId: session.user.id } } },
    include: { _count: { select: { members: true } } },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json({ data: groups })
}
