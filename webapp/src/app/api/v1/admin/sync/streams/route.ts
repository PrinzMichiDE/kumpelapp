import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@kumpelapp/auth'
import { prisma } from '@kumpelapp/db'
import { syncStreams } from '@kumpelapp/ingest'

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

    console.log(`Manual Streams sync triggered by ${session.user.email}`)

    const result = await syncStreams()

    return NextResponse.json({
      success: true,
      data: result,
    })

  } catch (error) {
    console.error('Streams sync error:', error)
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
      where: { source: 'streams' },
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