import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@kumpelapp/db'
import { auth } from '@kumpelapp/auth'
import { parseTicketPdf } from '@kumpelapp/ticket-parser'

export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({ headers: request.headers }).catch(() => null)
  if (!session?.user?.id) return NextResponse.redirect(new URL('/login?callbackUrl=/tickets', request.url), 303)
  try {
    const form = await request.formData()
    const file = form.get('file')
    if (!(file instanceof File)) return NextResponse.redirect(new URL('/tickets?error=nofile', request.url), 303)
    const buf = Buffer.from(await file.arrayBuffer())

    let parsed: any = { parseStatus: 'PARTIAL', parseError: null }
    try {
      const result = await parseTicketPdf(buf)
      parsed = {
        parseStatus: result ? 'PARSED' : 'PARTIAL',
        opponent: result?.opponent ?? null,
        matchDate: result?.matchDate ? new Date(result.matchDate) : null,
        venue: result?.venue ?? null,
        block: result?.block ?? null,
        row: result?.row ?? null,
        seat: result?.seat ?? null,
        ticketType: result?.ticketType ?? null,
        orderNumber: result?.orderNumber ?? null,
        priceCents: result?.priceCents ?? null,
        qrData: result?.qrData ?? null,
        rawText: result?.rawText ?? null,
        parsedAt: new Date(),
      }
    } catch (e: any) {
      parsed = { parseStatus: 'FAILED', parseError: String(e?.message || e), parsedAt: new Date() }
    }

    await prisma.ticket.create({
      data: {
        userId: session.user.id,
        opponent: parsed.opponent ?? null,
        matchDate: parsed.matchDate ?? null,
        venue: parsed.venue ?? null,
        block: parsed.block ?? null,
        row: parsed.row ?? null,
        seat: parsed.seat ?? null,
        ticketType: parsed.ticketType ?? null,
        orderNumber: parsed.orderNumber ?? null,
        priceCents: parsed.priceCents ?? null,
        qrData: parsed.qrData ?? null,
        rawText: parsed.rawText ?? null,
        parseStatus: parsed.parseStatus as any,
        parseError: parsed.parseError ?? null,
        parsedAt: parsed.parsedAt ?? null,
        pageCount: 1,
      },
    })

    return NextResponse.redirect(new URL('/tickets?imported=1', request.url), 303)
  } catch (e) {
    console.error(e)
    return NextResponse.redirect(new URL('/tickets?error=parse', request.url), 303)
  }
}
