// Weekly timetable — shared constants, a default template, and a browser-local
// store so admin/tutor edits are seen by students (demo/offline fallback).
//
// Timetables are keyed by PROGRAMME, and by DEPARTMENT for secondary programmes:
//   waec-science | waec-art | waec-commercial
//   afterschool-science | afterschool-art | afterschool-commercial
//   jamb | postutme | undergrad | preclinical
//
// A single period holds UP TO TWO subjects (a `Cell`), so JAMB students who take
// Biology instead of Physics can share the same slot.

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

const SLOT_START = [8 * 60, 9 * 60 + 45, 11 * 60 + 30, 14 * 60]
const CLASS_MINUTES = 90

// Programmes whose timetable is split by department (Science / Art / Commercial).
const DEPT_SPLIT: ExamTrack[] = ['waec', 'afterschool']

/**
 * The backend timetable key for a student's programme (+ department). Secondary
 * programmes are per-department; everything else is keyed by the programme.
 * Falls back to `science` when a department-split programme has no department.
 */
export function timetableKey(
  track: ExamTrack,
  department?: Department | null,
): string {
  if (DEPT_SPLIT.includes(track)) return `${track}-${department ?? 'science'}`
  return track
}

// Representative subjects used to seed a template. JAMB & Post-UTME are
// subject-based; WAEC/after-school are department-based.
const SUBJECTS: Record<string, string[]> = {
  jamb: ['English', 'Mathematics', 'Physics', 'Chemistry', 'Biology', 'Economics'],
  science: ['English', 'Mathematics', 'Physics', 'Chemistry', 'Biology', 'Further Maths'],
  art: ['English', 'Mathematics', 'Literature', 'Government', 'History', 'CRS'],
  commercial: ['English', 'Mathematics', 'Economics', 'Commerce', 'Accounting', 'Government'],
}

function subjectsFor(track: ExamTrack, department: Department | null): string[] {
  if (DEPT_SPLIT.includes(track)) return SUBJECTS[department ?? 'science']
  return SUBJECTS.jamb
}

/** A period holds up to two subjects. */
export type Cell = string[]
/** A grid is rows (periods) × columns (days); each cell is a `Cell`. */
export type TimetableGrid = Cell[][]

/** Coerce any backend cell (array | string | null) into a clean `Cell` (≤2). */
function toCell(raw: unknown): Cell {
  if (Array.isArray(raw)) {
    return raw
      .map((s) => (typeof s === 'string' ? s.trim() : ''))
      .filter(Boolean)
      .slice(0, 2)
  }
  if (typeof raw === 'string' && raw.trim()) return [raw.trim()]
  return []
}

/**
 * Convert the backend grid into the UI grid.
 *
 * The API stores the grid as `[day][period]` (6 days Mon–Sat × 4 periods) with
 * each cell an array of up to two subjects; the UI indexes `[period][day]`. This
 * transposes and pads so a partial/empty API grid still renders a full 4×6 grid.
 */
export function gridFromApi(apiGrid: unknown): TimetableGrid {
  const g = Array.isArray(apiGrid) ? (apiGrid as unknown[][]) : []
  return SLOTS.map((_, period) =>
    DAYS.map((_, day) => toCell(g[day]?.[period])),
  )
}

/**
 * Convert the UI grid (`[period][day]`) back to the backend layout
 * (`[day][period]`) for saving via PUT /timetable/:key.
 */
export function gridToApi(uiGrid: TimetableGrid): string[][][] {
  return DAYS.map((_, day) =>
    SLOTS.map((_, period) => (uiGrid[period]?.[day] ?? []).filter(Boolean)),
  )
}

/** Build the default template by rotating through the track's subjects. */
export function buildDefaultGrid(
  track: ExamTrack,
  department: Department | null = null,
): TimetableGrid {
  const subjects = subjectsFor(track, department)
  return SLOTS.map((_, slotIdx) =>
    DAYS.map((_, dayIdx) => [
      subjects[(dayIdx * SLOTS.length + slotIdx) % subjects.length],
    ]),
  )
}

/** An empty 4×6 grid of empty cells. */
export function emptyGrid(): TimetableGrid {
  return SLOTS.map(() => DAYS.map(() => [] as Cell))
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

export function getSavedTimetable(key: string): TimetableGrid | null {
  const grid = readAll()[key]
  return Array.isArray(grid) ? grid : null
}

export function saveLocalTimetable(key: string, grid: TimetableGrid): void {
  if (typeof window === 'undefined') return
  const all = readAll()
  all[key] = grid
  localStorage.setItem(KEY, JSON.stringify(all))
}

/** Saved timetable for a programme(+dept) if one was set, else the template. */
export function getEffectiveTimetable(
  track: ExamTrack,
  department: Department | null = null,
): TimetableGrid {
  const key = timetableKey(track, department)
  return getSavedTimetable(key) ?? buildDefaultGrid(track, department)
}

export interface NextClass {
  subject: string
  day: string // e.g. "Monday"
  time: string // e.g. "8:00 – 9:30"
  when: string // "Today" | "Tomorrow" | day name
  ongoing: boolean // true if the class is happening right now
}

/** Join a cell's subjects for display, e.g. "Physics / Biology". */
export function cellLabel(cell: Cell): string {
  return cell.filter(Boolean).join(' / ')
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
      if (offset === 0 && nowMins >= SLOT_START[slot] + CLASS_MINUTES) continue
      const subject = cellLabel(grid[slot]?.[dayIdx] ?? [])
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
