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

    console.log(`Manual Away-Info sync triggered by ${session.user.email}`)

    // TODO: Implement actual away-info fetching
    // For now, return placeholder response
    return NextResponse.json({
      success: true,
      data: {
        message: 'Away-Info sync not yet implemented',
        created: 0,
        updated: 0,
      },
    })

  } catch (error) {
    console.error('Away-Info sync error:', error)
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
      where: { source: 'away-info' },
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