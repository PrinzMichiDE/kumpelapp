import { NextRequest } from 'next/server'
import { prisma } from '@kumpelapp/db'

export const dynamic = 'force-dynamic'

function pad(n: number) { return String(n).padStart(2, '0') }
function formatIcsDateUtc(date: Date) {
  return date.getUTCFullYear().toString() + pad(date.getUTCMonth() + 1) + pad(date.getUTCDate()) + 'T' + pad(date.getUTCHours()) + pad(date.getUTCMinutes()) + pad(date.getUTCSeconds()) + 'Z'
}
function escapeIcsText(text: string) {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/\r?\n/g, '\\n')
    .replace(/,/g, '\\,')
    .replace(/;/g, '\\;')
}
function foldLine(line: string) {
  const max = 75
  if (line.length <= max) return line
  let out = ''
  for (let i = 0; i < line.length; i += max) {
    const chunk = line.slice(i, i + max)
    out += i === 0 ? chunk : `\r\n ${chunk}`
  }
  return out
}

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const m = await prisma.match.findUnique({
      where: { id },
      include: {
        homeTeam: { select: { name: true, shortName: true, isOwn: true } },
        awayTeam: { select: { name: true, shortName: true, isOwn: true } },
        venue: { select: { name: true, city: true } },
      },
    })
    if (!m) return new Response('Spiel nicht gefunden', { status: 404, headers: { 'Content-Type': 'text/plain; charset=utf-8' } })

    const now = new Date()
    const origin = new URL(_request.url).origin
    const start = m.kickoff
    const end = new Date(start.getTime() + 2 * 60 * 60 * 1000)
    const home = m.homeTeam.shortName || m.homeTeam.name
    const away = m.awayTeam.shortName || m.awayTeam.name
    const summary = `${home} – ${away}`
    const location = [m.venue?.name, m.venue?.city].filter(Boolean).join(', ')
    const score = m.homeGoals !== null && m.awayGoals !== null ? `Ergebnis: ${m.homeGoals}:${m.awayGoals}\n` : ''
    const statusLabel = m.status === 'LIVE' ? 'LIVE' : m.status === 'POSTPONED' ? 'Verlegt' : m.status === 'CANCELLED' ? 'Abgesagt' : m.status === 'FINISHED' ? 'Beendet' : 'Geplant'
    const desc = `${statusLabel}\n${score}${m.homeTeam.isOwn ? 'Heimspiel' : 'Auswärtsspiel'} des FC Erzgebirge Aue\nDetails: ${origin}/spiel/${m.id}\nHinweis: Zeiten/Status können sich kurzfristig ändern.`

    const lines = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//KumpelApp//FC Erzgebirge Aue//DE',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      foldLine(`X-WR-CALNAME:${escapeIcsText(summary)}`),
      'BEGIN:VEVENT',
      foldLine(`UID:${escapeIcsText(m.id)}@kumpelapp`),
      `DTSTAMP:${formatIcsDateUtc(now)}`,
      `DTSTART:${formatIcsDateUtc(start)}`,
      `DTEND:${formatIcsDateUtc(end)}`,
      foldLine(`SUMMARY:${escapeIcsText(summary)}`),
      ...(location ? [foldLine(`LOCATION:${escapeIcsText(location)}`)] : []),
      foldLine(`DESCRIPTION:${desc}`),
      foldLine(`URL:${origin}/spiel/${m.id}`),
      m.status === 'CANCELLED' ? 'STATUS:CANCELLED' : m.status === 'POSTPONED' ? 'STATUS:TENTATIVE' : 'STATUS:CONFIRMED',
      'END:VEVENT',
      'END:VCALENDAR',
    ]

    return new Response(lines.join('\r\n') + '\r\n', {
      status: 200,
      headers: {
        'Content-Type': 'text/calendar; charset=utf-8',
        'Content-Disposition': `attachment; filename="aue-spiel-${m.id}.ics"`,
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=1800',
      },
    })
  } catch (error) {
    console.error('Single match ICS error', error)
    return new Response('Kalenderdatei konnte nicht erstellt werden.', { status: 503, headers: { 'Content-Type': 'text/plain; charset=utf-8' } })
  }
}
