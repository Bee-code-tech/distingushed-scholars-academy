// Login streak — how many days in a row the student has signed in.
//
// We record the local date on each authenticated dashboard load and count the
// consecutive run ending today. This is browser-local (per device); when the
// backend exposes a login history we can swap `getLoginStreak` to read it.

const KEY = 'dsa_login_days'

/** Local calendar date as YYYY-MM-DD (not UTC — the student's own day). */
function isoDay(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function read(): string[] {
  if (typeof window === 'undefined') return []
  try {
    const v = JSON.parse(localStorage.getItem(KEY) || '[]')
    return Array.isArray(v) ? (v as string[]) : []
  } catch {
    return []
  }
}

/** Record that the student is here today (idempotent within a day). */
export function recordLogin(): void {
  if (typeof window === 'undefined') return
  const today = isoDay(new Date())
  const days = read()
  if (days.includes(today)) return
  days.push(today)
  // Keep the tail bounded — 120 days is far more than any streak needs.
  const trimmed = days.slice(-120)
  try {
    localStorage.setItem(KEY, JSON.stringify(trimmed))
  } catch {
    /* storage full / unavailable — streak just won't persist */
  }
}

/** Consecutive days (ending today) the student has logged in. */
export function getLoginStreak(): number {
  const set = new Set(read())
  if (set.size === 0) return 0
  let streak = 0
  const cursor = new Date()
  // Walk backwards from today while each day has a recorded login.
  for (;;) {
    if (!set.has(isoDay(cursor))) break
    streak++
    cursor.setDate(cursor.getDate() - 1)
  }
  return streak
}
