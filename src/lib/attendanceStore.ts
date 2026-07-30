// Shared attendance state for the self-check-in flow.
//
// FLOW: a tutor/admin ACTIVATES attendance for the day → students then MARK
// THEMSELVES present while it's open. Each check-in is stamped with the time.
//
// This is a browser-local stand-in so the whole flow works without a backend.
// When the backend exists, swap these functions for API calls (the check-in
// endpoint should stamp the server time). See docs/backend-requests.md (R7).

export interface CheckIn {
  key: string // student username/email
  name: string
  at: string // ISO timestamp
}

const SESSION_KEY = 'dsa_attendance_session'
const CHECKIN_KEY = 'dsa_attendance_checkins'

function todayKey(): string {
  // YYYY-MM-DD, locale-independent
  return new Date().toISOString().slice(0, 10)
}

export interface AttendanceSession {
  active: boolean
  date: string | null
  activatedAt: string | null
}

export function getSession(): AttendanceSession {
  if (typeof window === 'undefined')
    return { active: false, date: null, activatedAt: null }
  try {
    const s = JSON.parse(localStorage.getItem(SESSION_KEY) || 'null')
    if (s && s.date === todayKey())
      return { active: true, date: s.date, activatedAt: s.activatedAt }
  } catch {
    /* ignore */
  }
  return { active: false, date: null, activatedAt: null }
}

export function activateAttendance(): AttendanceSession {
  const session = {
    date: todayKey(),
    activatedAt: new Date().toISOString(),
  }
  if (typeof window !== 'undefined')
    localStorage.setItem(SESSION_KEY, JSON.stringify(session))
  return { active: true, ...session }
}

export function closeAttendance(): void {
  if (typeof window !== 'undefined') localStorage.removeItem(SESSION_KEY)
}

function readAll(): Record<string, CheckIn[]> {
  if (typeof window === 'undefined') return {}
  try {
    return JSON.parse(localStorage.getItem(CHECKIN_KEY) || '{}')
  } catch {
    return {}
  }
}

export function getTodayCheckIns(): CheckIn[] {
  return readAll()[todayKey()] || []
}

export function getMyCheckIn(key: string): CheckIn | null {
  return getTodayCheckIns().find((c) => c.key === key) || null
}

/**
 * Record a student's self-check-in with the current time. No-op (returns null)
 * if attendance isn't active. Idempotent — a second call the same day returns
 * the existing check-in.
 */
export function checkIn(key: string, name: string): CheckIn | null {
  if (typeof window === 'undefined') return null
  if (!getSession().active) return null
  const all = readAll()
  const day = todayKey()
  const list = all[day] || []
  const existing = list.find((c) => c.key === key)
  if (existing) return existing
  const entry: CheckIn = { key, name, at: new Date().toISOString() }
  all[day] = [...list, entry]
  localStorage.setItem(CHECKIN_KEY, JSON.stringify(all))
  return entry
}

export function formatTime(iso: string): string {
  try {
    return new Date(iso).toLocaleTimeString('en-NG', {
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return ''
  }
}
