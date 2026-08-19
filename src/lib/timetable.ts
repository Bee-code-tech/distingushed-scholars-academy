// Weekly timetable — shared constants, a default template, and a browser-local
// store so admin/tutor edits are seen by students. Swap the get/save functions
// for API calls when the backend has a timetable endpoint.
//
// One timetable per exam track (JAMB / WAEC / Post-UTME); every student on that
// track sees it.

import type { ExamTrack, Department } from './studentProfile'

export const DAYS = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
] as const

export const SLOTS = [
  { label: 'Period 1', time: '8:00 – 9:30' },
  { label: 'Period 2', time: '9:45 – 11:15' },
  { label: 'Period 3', time: '11:30 – 1:00' },
  { label: 'Period 4', time: '2:00 – 3:30' },
] as const

// Start time of each slot in minutes-from-midnight (aligned with SLOTS), and the
// class length, so "next class" can compare against the current time.
const SLOT_START = [8 * 60, 9 * 60 + 45, 11 * 60 + 30, 14 * 60]
const CLASS_MINUTES = 90

// Representative subjects used to seed a new timetable. JAMB & Post-UTME are
// subject-based; WAEC is department-based.
const SUBJECTS: Record<string, string[]> = {
  jamb: ['English', 'Mathematics', 'Physics', 'Chemistry', 'Biology', 'Economics'],
  'waec-science': ['English', 'Mathematics', 'Physics', 'Chemistry', 'Biology', 'Further Maths'],
  'waec-art': ['English', 'Mathematics', 'Literature', 'Government', 'History', 'CRS'],
  'waec-commercial': ['English', 'Mathematics', 'Economics', 'Commerce', 'Accounting', 'Government'],
}

function subjectsFor(track: ExamTrack, department: Department | null): string[] {
  if (track === 'jamb' || track === 'postutme') return SUBJECTS.jamb
  return SUBJECTS[`waec-${department ?? 'science'}`] ?? SUBJECTS['waec-science']
}

/** A grid is rows (periods) × columns (days); each cell is a subject string. */
export type TimetableGrid = string[][]

/**
 * Convert the backend timetable grid into the UI grid.
 *
 * The API stores the grid as `[day][period]` (6 days Mon–Sat × 4 periods, see
 * docs/timetable.md), but every component here indexes `[period][day]`. This
 * transposes and pads so a partial/empty API grid still renders a full 4×6 grid.
 */
export function gridFromApi(apiGrid: unknown): TimetableGrid {
  const g = Array.isArray(apiGrid) ? (apiGrid as unknown[][]) : []
  return SLOTS.map((_, period) =>
    DAYS.map((_, day) => {
      const cell = g[day]?.[period]
      return typeof cell === 'string' ? cell : ''
    }),
  )
}

/** Build the default template by rotating through the track's subjects. */
export function buildDefaultGrid(
  track: ExamTrack,
  department: Department | null = null,
): TimetableGrid {
  const subjects = subjectsFor(track, department)
  return SLOTS.map((_, slotIdx) =>
    DAYS.map((_, dayIdx) => subjects[(dayIdx * SLOTS.length + slotIdx) % subjects.length]),
  )
}

const KEY = 'dsa_timetables'

function readAll(): Record<string, TimetableGrid> {
  if (typeof window === 'undefined') return {}
  try {
    return JSON.parse(localStorage.getItem(KEY) || '{}')
  } catch {
    return {}
  }
}

export function getSavedTimetable(track: ExamTrack): TimetableGrid | null {
  const grid = readAll()[track]
  return Array.isArray(grid) ? grid : null
}

export function saveTimetable(track: ExamTrack, grid: TimetableGrid): void {
  if (typeof window === 'undefined') return
  const all = readAll()
  all[track] = grid
  localStorage.setItem(KEY, JSON.stringify(all))
}

/** Saved timetable for a track if an admin/tutor set one, else the template. */
export function getEffectiveTimetable(
  track: ExamTrack,
  department: Department | null = null,
): TimetableGrid {
  return getSavedTimetable(track) ?? buildDefaultGrid(track, department)
}

export interface NextClass {
  subject: string
  day: string // e.g. "Monday"
  time: string // e.g. "8:00 – 9:30"
  when: string // "Today" | "Tomorrow" | day name
  ongoing: boolean // true if the class is happening right now
}

/**
 * The next (or currently-running) class from a timetable grid, based on the
 * current day/time. Skips Sundays and empty periods; returns null if nothing is
 * scheduled in the coming week.
 */
export function getNextClass(
  grid: TimetableGrid,
  now = new Date(),
): NextClass | null {
  const jsDay = now.getDay() // 0=Sun … 6=Sat
  const nowMins = now.getHours() * 60 + now.getMinutes()

  for (let offset = 0; offset < 7; offset++) {
    const weekday = (jsDay + offset) % 7
    if (weekday === 0) continue // Sunday — no classes
    const dayIdx = weekday - 1 // Mon(1)→0 … Sat(6)→5
    for (let slot = 0; slot < SLOTS.length; slot++) {
      // Today: skip only periods that have already ended.
      if (offset === 0 && nowMins >= SLOT_START[slot] + CLASS_MINUTES) continue
      const subject = grid[slot]?.[dayIdx]?.trim()
      if (!subject) continue
      const when = offset === 0 ? 'Today' : offset === 1 ? 'Tomorrow' : DAYS[dayIdx]
      const ongoing =
        offset === 0 &&
        nowMins >= SLOT_START[slot] &&
        nowMins < SLOT_START[slot] + CLASS_MINUTES
      return { subject, day: DAYS[dayIdx], time: SLOTS[slot].time, when, ongoing }
    }
  }
  return null
}

const TINTS = [
  'bg-blue-50 text-[#002EFF]',
  'bg-emerald-50 text-emerald-600',
  'bg-amber-50 text-amber-600',
  'bg-rose-50 text-rose-500',
  'bg-violet-50 text-violet-600',
  'bg-cyan-50 text-cyan-600',
]

/** Stable colour for any subject string, so edited subjects still colour-code. */
export function tintForSubject(subject: string): string {
  let hash = 0
  for (let i = 0; i < subject.length; i++) hash = (hash * 31 + subject.charCodeAt(i)) | 0
  return TINTS[Math.abs(hash) % TINTS.length]
}
