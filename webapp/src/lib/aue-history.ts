export type AueHistoryEvent = {
  year: number
  month?: number
  day?: number
  title: string
  description: string
  category?: 'gruendung' | 'titel' | 'aufstieg' | 'stadion' | 'verein' | 'sonstiges'
}

export const aueHistoryEvents: AueHistoryEvent[] = [
  {
    year: 1946,
    month: 3,
    day: 4,
    title: 'Gründung der SG Aue',
    description:
      'Mit der Gründung der Sportgemeinschaft Aue beginnt die Vereinsgeschichte, aus der später Wismut Aue und der FC Erzgebirge Aue hervorgehen.',
    category: 'gruendung',
  },
  {
    year: 1951,
    title: 'BSG Wismut Aue',
    description:
      'Der Verein wird als BSG Wismut Aue Teil des Sports der SDAG Wismut – der Beginn einer prägenden Ära im Erzgebirge.',
    category: 'verein',
  },
  {
    year: 1955,
    month: 12,
    day: 4,
    title: 'FDGB-Pokalsieger 1955',
    description:
      'SC Wismut Karl-Marx-Stadt gewinnt den FDGB-Pokal (3:2 n. V. gegen Empor Rostock) und holt den ersten großen nationalen Titel.',
    category: 'titel',
  },
  {
    year: 1956,
    title: 'DDR-Meister 1956',
    description:
      'Wismut prägt die DDR-Oberliga und sichert sich die Meisterschaft 1956 – der Auftakt zu einer goldenen Serie.',
    category: 'titel',
  },
  {
    year: 1957,
    title: 'DDR-Meister 1957',
    description:
      'Titelverteidigung gelungen: Wismut Aue bleibt an der Spitze der DDR-Oberliga.',
    category: 'titel',
  },
  {
    year: 1959,
    title: 'DDR-Meister 1959',
    description:
      'Dritter DDR-Meistertitel der Wismut-Ära – ein Meilenstein der Veilchen-Geschichte.',
    category: 'titel',
  },
  {
    year: 1960,
    month: 9,
    day: 7,
    title: 'Europapokal-Premiere in der Oberliga-Ära',
    description:
      'Als DDR-Vertreter sammelt Aue internationale Erfahrung im Europapokal – ein besonderes Kapitel für den Verein aus dem Erzgebirge.',
    category: 'sonstiges',
  },
  {
    year: 1990,
    month: 5,
    day: 19,
    title: 'Neustart als FC Wismut Aue',
    description:
      'Nach der Wende stellt sich der Verein neu auf; aus der BSG-Tradition entsteht der Weg zum FC Erzgebirge Aue.',
    category: 'verein',
  },
  {
    year: 1993,
    month: 1,
    day: 4,
    title: 'Name FC Erzgebirge Aue',
    description:
      'Der Verein trägt fortan den Namen FC Erzgebirge Aue e. V. und verbindet Profifußball mit regionaler Identität.',
    category: 'verein',
  },
  {
    year: 2003,
    month: 6,
    day: 1,
    title: 'Aufstieg in die 2. Bundesliga',
    description:
      'Nach starker Regionalliga-Saison gelingt der Aufstieg – ein emotionaler Höhepunkt der jüngeren Vereinsgeschichte.',
    category: 'aufstieg',
  },
  {
    year: 2016,
    month: 5,
    day: 7,
    title: 'Rückkehr in die 2. Bundesliga',
    description:
      'Die Veilchen feiern den Aufstieg aus der 3. Liga und kehren in die 2. Bundesliga zurück.',
    category: 'aufstieg',
  },
  {
    year: 2026,
    month: 3,
    day: 4,
    title: '80 Jahre Veilchen-Geschichte',
    description:
      'Zum Gründungsdatum blickt der Verein auf acht Jahrzehnte Erzgebirge Aue – Tradition, Leidenschaft und Neustart in der Regionalliga Nordost.',
    category: 'gruendung',
  },
]

function pad2(n: number) {
  return String(n).padStart(2, '0')
}

export function getTodayMonthDay(date = new Date()) {
  return { month: date.getMonth() + 1, day: date.getDate() }
}

export function formatMonthDay(month: number, day: number) {
  return `${pad2(day)}.${pad2(month)}.`
}

export function getEventsOnDate(month: number, day: number, events = aueHistoryEvents) {
  return events.filter((e) => e.month === month && e.day === day)
}

function dayOfYear(date: Date) {
  const start = new Date(date.getFullYear(), 0, 0)
  const diff = date.getTime() - start.getTime()
  return Math.floor(diff / 86400000)
}

export function getDailyHighlight(date = new Date(), events = aueHistoryEvents) {
  const { month, day } = getTodayMonthDay(date)
  const todays = getEventsOnDate(month, day, events)
  if (todays.length > 0) {
    return { kind: 'today' as const, events: todays, dateLabel: formatMonthDay(month, day) }
  }

  const sorted = [...events].sort((a, b) => a.year - b.year || (a.month ?? 13) - (b.month ?? 13) || (a.day ?? 32) - (b.day ?? 32))
  const idx = dayOfYear(date) % sorted.length
  const pick = sorted[idx]
  return { kind: 'highlight' as const, events: [pick], dateLabel: formatMonthDay(month, day) }
}

export function getUpcomingDatedEvents(from = new Date(), limit = 3, events = aueHistoryEvents) {
  const dated = events.filter((e): e is AueHistoryEvent & { month: number; day: number } => typeof e.month === 'number' && typeof e.day === 'number')
  const start = new Date(from.getFullYear(), from.getMonth(), from.getDate())
  const withNext = dated.map((e) => {
    let next = new Date(from.getFullYear(), e.month - 1, e.day)
    if (next < start) next = new Date(from.getFullYear() + 1, e.month - 1, e.day)
    return { event: e, next }
  })
  withNext.sort((a, b) => a.next.getTime() - b.next.getTime() || a.event.year - b.event.year)
  return withNext.slice(0, limit)
}
