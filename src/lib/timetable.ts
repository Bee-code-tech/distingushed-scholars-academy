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
