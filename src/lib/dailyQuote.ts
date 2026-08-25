// Dynamic motivational quote for the student dashboard.
//
// The quote changes with BOTH the part of the day (morning / afternoon / night)
// and the kind of day (Mon+Wed, Tue+Thu, Fri, weekend, public holiday). Public
// holidays override the weekday. Nigerian public holidays are detected below.

export type TimeOfDay = 'morning' | 'afternoon' | 'night'
export type DayCategory =
  | 'monwed'
  | 'tuethu'
  | 'fri'
  | 'weekend'
  | 'holiday'

// --- Nigerian public holidays ------------------------------------------------

// Fixed-date national holidays, keyed MM-DD.
const FIXED_HOLIDAYS: Record<string, string> = {
  '01-01': "New Year's Day",
  '05-01': "Workers' Day",
  '06-12': 'Democracy Day',
  '10-01': 'Independence Day',
  '12-25': 'Christmas Day',
  '12-26': 'Boxing Day',
}

// Movable Islamic holidays depend on the moon and are declared officially, so
// they are curated per year (approximate — update when government confirms).
// Keyed YYYY-MM-DD.
const ISLAMIC_HOLIDAYS: Record<string, string> = {
  // 2026
  '2026-03-20': 'Eid-el-Fitr',
  '2026-03-21': 'Eid-el-Fitr Holiday',
  '2026-05-27': 'Eid-el-Kabir',
  '2026-05-28': 'Eid-el-Kabir Holiday',
  '2026-08-25': 'Eid-el-Maulud',
  // 2027
  '2027-03-10': 'Eid-el-Fitr',
  '2027-03-11': 'Eid-el-Fitr Holiday',
  '2027-05-17': 'Eid-el-Kabir',
  '2027-05-18': 'Eid-el-Kabir Holiday',
  '2027-08-15': 'Eid-el-Maulud',
}

function isoDay(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

/** Easter Sunday for a given year (Anonymous Gregorian algorithm). */
function easterSunday(year: number): Date {
  const a = year % 19
  const b = Math.floor(year / 100)
  const c = year % 100
  const d = Math.floor(b / 4)
  const e = b % 4
  const f = Math.floor((b + 8) / 25)
  const g = Math.floor((b - f + 1) / 3)
  const h = (19 * a + b - d - g + 15) % 30
  const i = Math.floor(c / 4)
  const k = c % 4
  const l = (32 + 2 * e + 2 * i - h - k) % 7
  const m = Math.floor((a + 11 * h + 22 * l) / 451)
  const month = Math.floor((h + l - 7 * m + 114) / 31) // 3=March, 4=April
  const day = ((h + l - 7 * m + 114) % 31) + 1
  return new Date(year, month - 1, day)
}

function addDays(d: Date, n: number): Date {
  const r = new Date(d)
  r.setDate(r.getDate() + n)
  return r
}

/** The public-holiday name for a date, or null if it isn't one. */
export function publicHolidayName(d: Date): string | null {
  const mmdd = isoDay(d).slice(5) // MM-DD
  if (FIXED_HOLIDAYS[mmdd]) return FIXED_HOLIDAYS[mmdd]

  const full = isoDay(d)
  if (ISLAMIC_HOLIDAYS[full]) return ISLAMIC_HOLIDAYS[full]

  // Christian movable feasts (computed, so any year works).
  const easter = easterSunday(d.getFullYear())
  if (isoDay(addDays(easter, -2)) === full) return 'Good Friday'
  if (isoDay(addDays(easter, 1)) === full) return 'Easter Monday'

  return null
}

export function isPublicHoliday(d: Date): boolean {
  return publicHolidayName(d) !== null
}

// --- Day + time classification ----------------------------------------------

export function timeOfDay(d: Date): TimeOfDay {
  const h = d.getHours()
  if (h >= 5 && h < 12) return 'morning'
  if (h >= 12 && h < 17) return 'afternoon'
  return 'night'
}

export function dayCategory(d: Date): DayCategory {
  if (isPublicHoliday(d)) return 'holiday'
  switch (d.getDay()) {
    case 0:
    case 6:
      return 'weekend'
    case 1:
    case 3:
      return 'monwed'
    case 2:
    case 4:
      return 'tuethu'
    case 5:
      return 'fri'
    default:
      return 'monwed'
  }
}

// --- The quote matrix (day category × time of day) --------------------------

const QUOTES: Record<DayCategory, Record<TimeOfDay, string>> = {
  monwed: {
    morning:
      'A fresh week, a fresh chance. Start strong and the rest will follow.',
    afternoon:
      'Keep the momentum — the topics you master now become tomorrow’s easy marks.',
    night:
      'Review one thing before you sleep. Small nightly wins build big results.',
  },
  tuethu: {
    morning:
      'Consistency beats intensity. Show up today like you did yesterday.',
    afternoon:
      'Push through the middle of the week — this is where champions are made.',
    night:
      'Rest is part of the work. Revise gently, then recharge for tomorrow.',
  },
  fri: {
    morning:
      'Finish the week the way you started it — focused and unstoppable.',
    afternoon:
      'One more strong session and you’ve earned your weekend. Keep going.',
    night:
      'Look back at your week with pride, then set your target for the next.',
  },
  weekend: {
    morning:
      'Weekends are for winners who revise. A little study now, a lot of confidence later.',
    afternoon:
      'Balance is key — study smart, then enjoy your rest. You’ve earned both.',
    night:
      'Plan tomorrow tonight. A prepared mind sleeps easy and wakes ready.',
  },
  holiday: {
    morning:
      'Happy holiday! Even a short revision today keeps your streak — and your edge — alive.',
    afternoon:
      'Enjoy the holiday, but a quick look at your notes goes a long way.',
    night:
      'Rest well this holiday. Tomorrow, we get back to building your future.',
  },
}

/** The quote to show right now (or at a given moment). */
export function getDailyQuote(now: Date = new Date()): string {
  return QUOTES[dayCategory(now)][timeOfDay(now)]
}
