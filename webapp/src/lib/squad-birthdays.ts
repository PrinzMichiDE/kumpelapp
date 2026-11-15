export type SquadBirthdayPlayer = {
  id: string
  name: string
  number: number | null
  position: string | null
  imageUrl: string | null
  birthDate: string
}

export type UpcomingBirthday = {
  player: SquadBirthdayPlayer
  nextBirthday: string
  nextBirthdayLabel: string
  daysUntil: number
  turningAge: number | null
  birthYear: number | null
  isToday: boolean
}

function pad2(n: number) {
  return String(n).padStart(2, '0')
}

function toDateOnly(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate())
}

function parseBirthDate(value: string): Date | null {
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return null
  // Treat stored birth dates as calendar dates (UTC-safe by reading UTC parts when ISO-like)
  if (/^\d{4}-\d{2}-\d{2}/.test(value)) {
    return new Date(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate())
  }
  return new Date(d.getFullYear(), d.getMonth(), d.getDate())
}

export function formatBirthdayLabel(date: Date) {
  return `${pad2(date.getDate())}.${pad2(date.getMonth() + 1)}.`
}

export function getUpcomingSquadBirthdays(players: SquadBirthdayPlayer[], from = new Date(), limit = 8): {
  today: UpcomingBirthday[]
  upcoming: UpcomingBirthday[]
} {
  const start = toDateOnly(from)
  const year = start.getFullYear()

  const mapped = players
    .map((player) => {
      const birth = parseBirthDate(player.birthDate)
      if (!birth) return null

      let next = new Date(year, birth.getMonth(), birth.getDate())
      if (next < start) next = new Date(year + 1, birth.getMonth(), birth.getDate())

      const diffMs = next.getTime() - start.getTime()
      const daysUntil = Math.round(diffMs / 86400000)
      const birthYear = birth.getFullYear()
      const turningAge = birthYear > 1900 ? next.getFullYear() - birthYear : null

      const item: UpcomingBirthday = {
        player,
        nextBirthday: next.toISOString().slice(0, 10),
        nextBirthdayLabel: formatBirthdayLabel(next),
        daysUntil,
        turningAge,
        birthYear: birthYear > 1900 ? birthYear : null,
        isToday: daysUntil === 0,
      }
      return item
    })
    .filter((x): x is UpcomingBirthday => x !== null)

  mapped.sort((a, b) => a.daysUntil - b.daysUntil || (a.player.number ?? 999) - (b.player.number ?? 999) || a.player.name.localeCompare(b.player.name, 'de'))

  const today = mapped.filter((m) => m.isToday)
  const upcoming = mapped.filter((m) => !m.isToday).slice(0, limit)

  return { today, upcoming }
}
