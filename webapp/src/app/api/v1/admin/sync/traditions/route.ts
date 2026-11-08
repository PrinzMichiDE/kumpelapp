import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@kumpelapp/auth'
import { prisma } from '@kumpelapp/db'

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers })
    
    if (!session) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'Nicht angemeldet' } },
        { status: 401 }
      )
    }

    if (session.user.role !== 'EDITOR' && session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: { code: 'FORBIDDEN', message: 'Keine Berechtigung' } },
        { status: 403 }
      )
    }

    console.log(`Manual Traditions sync triggered by ${session.user.email}`)

    // TODO: Implement actual traditions fetching
    return NextResponse.json({
      success: true,
      data: {
        message: 'Traditions sync not yet implemented',
        created: 0,
        updated: 0,
      },
    })

  } catch (error) {
    console.error('Traditions sync error:', error)
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Sync fehlgeschlagen' } },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const session = await auth.api.getSession({ headers: new Headers() })
    
    if (!session || (session.user.role !== 'EDITOR' && session.user.role !== 'ADMIN')) {
      return NextResponse.json(
        { error: { code: 'FORBIDDEN', message: 'Keine Berechtigung' } },
        { status: 403 }
      )
    }

    const logs = await prisma.sourceSyncLog.findMany({
      where: { source: 'traditions' },
      orderBy: { createdAt: 'desc' },
      take: 20,
    })

    return NextResponse.json({ data: logs })

  } catch (error) {
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Fehler beim Laden der Logs' } },
      { status: 500 }
    )
  }
}