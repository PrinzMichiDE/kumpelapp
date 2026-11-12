import { NextRequest } from 'next/server'
import { prisma } from '@kumpelapp/db'

export const dynamic = 'force-dynamic'

function pad(n: number) {
  return String(n).padStart(2, '0')
}

function formatIcsDateUtc(date: Date) {
  return (
    date.getUTCFullYear().toString() +
    pad(date.getUTCMonth() + 1) +
    pad(date.getUTCDate()) +
    'T' +
    pad(date.getUTCHours()) +
    pad(date.getUTCMinutes()) +
    pad(date.getUTCSeconds()) +
    'Z'
  )
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

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const scope = searchParams.get('scope')
    const now = new Date()
    const from = new Date(now.getTime() - 24 * 60 * 60 * 1000)

    const league = await prisma.league.findFirst({
      where: { season: { isCurrent: true } },
      include: { season: true },
      orderBy: { tier: 'asc' },
    })
    const targetLeague =
      league ??
      (await prisma.league.findFirst({
        include: { season: true },
        orderBy: [{ season: { startYear: 'desc' } }, { tier: 'asc' }],
      }))

    const where: Record<string, unknown> = {
      ...(targetLeague ? { leagueId: targetLeague.id } : {}),
      OR: [{ homeTeam: { isOwn: true } }, { awayTeam: { isOwn: true } }],
    }

    if (scope !== 'all') {
      where.status = { in: ['SCHEDULED', 'LIVE', 'POSTPONED'] }
      where.kickoff = { gte: from }
    }

    const rows = await prisma.match.findMany({
      where,
      include: {
        homeTeam: { select: { name: true, shortName: true, isOwn: true } },
        awayTeam: { select: { name: true, shortName: true, isOwn: true } },
        venue: { select: { name: true, city: true } },
      },
      orderBy: { kickoff: 'asc' },
      take: scope === 'all' ? 500 : 200,
    })

    const seasonLabel = targetLeague?.season?.label ? ` ${targetLeague.season.label}` : ''
    const calName = `FC Erzgebirge Aue${seasonLabel}`
    const dtstamp = formatIcsDateUtc(now)
    const origin = new URL(request.url).origin

    const lines: string[] = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//KumpelApp//FC Erzgebirge Aue//DE',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      foldLine(`X-WR-CALNAME:${escapeIcsText(calName)}`),
      'X-WR-TIMEZONE:Europe/Berlin',
    ]

    for (const m of rows) {
      const start = m.kickoff
      const end = new Date(start.getTime() + 2 * 60 * 60 * 1000)
      const home = m.homeTeam.shortName || m.homeTeam.name
      const away = m.awayTeam.shortName || m.awayTeam.name
      const summary = `${home} – ${away}`
      const venueParts = [m.venue?.name, m.venue?.city].filter(Boolean) as string[]
      const location = venueParts.join(', ')
      const aueHome = m.homeTeam.isOwn
      const statusLabel =
        m.status === 'LIVE'
          ? 'LIVE'
          : m.status === 'POSTPONED'
            ? 'Verlegt'
            : m.status === 'FINISHED'
              ? 'Beendet'
              : 'Geplant'
      const score =
        m.homeGoals !== null && m.awayGoals !== null ? `Ergebnis: ${m.homeGoals}:${m.awayGoals}\\n` : ''
      const description =
        `${statusLabel}\\n` +
        score +
        `${aueHome ? 'Heimspiel' : 'Auswärtsspiel'} des FC Erzgebirge Aue\\n` +
        `Details: ${origin}/spiel/${m.id}`
      const uid = `${m.id}@kumpelapp`

      lines.push('BEGIN:VEVENT')
      lines.push(foldLine(`UID:${escapeIcsText(uid)}`))
      lines.push(`DTSTAMP:${dtstamp}`)
      lines.push(`DTSTART:${formatIcsDateUtc(start)}`)
      lines.push(`DTEND:${formatIcsDateUtc(end)}`)
      lines.push(foldLine(`SUMMARY:${escapeIcsText(summary)}`))
      if (location) lines.push(foldLine(`LOCATION:${escapeIcsText(location)}`))
      lines.push(foldLine(`DESCRIPTION:${description}`))
      lines.push(foldLine(`URL:${origin}/spiel/${m.id}`))
      if (m.status === 'CANCELLED') lines.push('STATUS:CANCELLED')
      else if (m.status === 'POSTPONED') lines.push('STATUS:TENTATIVE')
      else lines.push('STATUS:CONFIRMED')
      lines.push('END:VEVENT')
    }

    lines.push('END:VCALENDAR')

    const body = lines.join('\r\n') + '\r\n'
    const filename = scope === 'all' ? 'fc-erzgebirge-aue-saison.ics' : 'fc-erzgebirge-aue-termine.ics'

    return new Response(body, {
      status: 200,
      headers: {
        'Content-Type': 'text/calendar; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=1800',
      },
    })
  } catch (error) {
    console.error('Calendar ICS error:', error)
    return new Response('Kalender konnte nicht erstellt werden.', {
      status: 503,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    })
  }
}
