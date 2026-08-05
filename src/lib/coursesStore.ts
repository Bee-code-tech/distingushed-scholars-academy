// Courses, materials, and per-student completion — browser-local stand-in for
// the LMS course/material endpoints (see docs/DSA-LMS-Backend-Spec.md §4–§5,
// §2.16). Swap get/add/remove for API calls once /courses + /materials ship.
//
// Same-browser only: a material a tutor adds here is visible to students on the
// same browser (great for demoing the flow) until the backend persists it.

import type { Course, CourseMaterial } from './types'

const COURSES_KEY = 'dsa_courses'
const MATERIALS_KEY = 'dsa_materials'
const COMPLETE_KEY = 'dsa_material_completions' // { [studentKey]: materialId[] }

// Seeded courses per track so every browser has content to show. Tutors can add
// materials to these; new courses added at runtime are browser-local.
const SEED_COURSES: Course[] = [
  { id: 'jamb-math', title: 'JAMB Mathematics', subject: 'Mathematics', examTrack: 'jamb', tutorName: 'Dr. Jay' },
  { id: 'jamb-eng', title: 'JAMB Use of English', subject: 'English', examTrack: 'jamb', tutorName: 'Miss Betty' },
  { id: 'jamb-phy', title: 'JAMB Physics', subject: 'Physics', examTrack: 'jamb', tutorName: 'Mr. Hakeem' },
  { id: 'waec-math', title: 'WAEC Mathematics', subject: 'Mathematics', examTrack: 'waec', tutorName: 'Dr. Jay' },
  { id: 'waec-eng', title: 'WAEC English', subject: 'English', examTrack: 'waec', tutorName: 'Miss Betty' },
  { id: 'putme-math', title: 'Post-UTME Mathematics', subject: 'Mathematics', examTrack: 'postutme', tutorName: 'Dr. Phils' },
  { id: 'putme-eng', title: 'Post-UTME English', subject: 'English', examTrack: 'postutme', tutorName: 'Mr. Emmanuel' },
]

const SEED_MATERIALS: CourseMaterial[] = [
  { id: 'm-seed-1', courseId: 'jamb-math', title: 'Course Syllabus 2026', type: 'syllabus', url: 'https://example.com/jamb-math-syllabus.pdf', isDownloadable: true, createdAt: '2026-01-05T09:00:00.000Z' },
  { id: 'm-seed-2', courseId: 'jamb-math', title: 'Indices & Logarithms (Notes)', type: 'pdf', url: 'https://example.com/indices.pdf', isDownloadable: true, createdAt: '2026-01-06T09:00:00.000Z' },
  { id: 'm-seed-3', courseId: 'jamb-math', title: 'Live Class Recording — Algebra', type: 'recording', url: 'https://example.com/algebra-recording', durationLabel: '48:12', isDownloadable: false, createdAt: '2026-01-07T09:00:00.000Z' },
  { id: 'm-seed-4', courseId: 'jamb-eng', title: 'Comprehension Techniques (Video)', type: 'video', url: 'https://example.com/comprehension', durationLabel: '15:30', isDownloadable: false, createdAt: '2026-01-06T10:00:00.000Z' },
]

function read<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}
function write(key: string, value: unknown): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(key, JSON.stringify(value))
}

// ---- Courses ----
export function getCourses(track?: string): Course[] {
  const seedIds = new Set(SEED_COURSES.map((c) => c.id))
  const extras = read<Course[]>(COURSES_KEY, []).filter((c) => c?.id && !seedIds.has(c.id))
  const all = [...SEED_COURSES, ...extras]
  return track ? all.filter((c) => c.examTrack === track) : all
}

export function getCourse(id: string): Course | undefined {
  return getCourses().find((c) => c.id === id)
}

export function addCourse(c: Omit<Course, 'id'> & { id?: string }): Course {
  const id = c.id || `course-${Date.now().toString(36)}`
  const course: Course = { ...c, id }
  write(COURSES_KEY, [...read<Course[]>(COURSES_KEY, []).filter((x) => x.id !== id), course])
  return course
}

// ---- Materials ----
export function getMaterials(courseId: string): CourseMaterial[] {
  const all = [...SEED_MATERIALS, ...read<CourseMaterial[]>(MATERIALS_KEY, [])]
  return all
    .filter((m) => m.courseId === courseId)
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
}

/** All materials for every course on a track (student view, grouped by course). */
export function getMaterialsForTrack(track: string): Record<string, CourseMaterial[]> {
  const out: Record<string, CourseMaterial[]> = {}
  for (const c of getCourses(track)) {
    const mats = getMaterials(c.id)
    if (mats.length) out[c.id] = mats
  }
  return out
}

export function addMaterial(input: {
  courseId: string
  title: string
  type: CourseMaterial['type']
  url: string
  description?: string
  isDownloadable: boolean
  durationLabel?: string
  now: number // Date.now() from the handler
}): CourseMaterial {
  const mat: CourseMaterial = {
    id: `m-${input.now.toString(36)}`,
    courseId: input.courseId,
    title: input.title.trim(),
    type: input.type,
    url: input.url.trim(),
    description: input.description?.trim() || undefined,
    isDownloadable: input.isDownloadable,
    durationLabel: input.durationLabel,
    createdAt: new Date(input.now).toISOString(),
  }
  write(MATERIALS_KEY, [...read<CourseMaterial[]>(MATERIALS_KEY, []), mat])
  return mat
}

export function removeMaterial(id: string): void {
  // Seeded materials can't be deleted (compiled in); only runtime ones.
  if (SEED_MATERIALS.some((m) => m.id === id)) return
  write(MATERIALS_KEY, read<CourseMaterial[]>(MATERIALS_KEY, []).filter((m) => m.id !== id))
}

// ---- Per-student completion / progress ----
function completions(): Record<string, string[]> {
  return read<Record<string, string[]>>(COMPLETE_KEY, {})
}

export function getCompleted(studentKey: string): string[] {
  return completions()[studentKey] || []
}

export function toggleComplete(studentKey: string, materialId: string): void {
  const all = completions()
  const cur = new Set(all[studentKey] || [])
  if (cur.has(materialId)) cur.delete(materialId)
  else cur.add(materialId)
  all[studentKey] = Array.from(cur)
  write(COMPLETE_KEY, all)
}

/** Progress % across all materials on the student's track. */
export function trackProgress(studentKey: string, track: string): number {
  const groups = getMaterialsForTrack(track)
  const total = Object.values(groups).reduce((n, m) => n + m.length, 0)
  if (!total) return 0
  const done = getCompleted(studentKey)
  const doneOnTrack = Object.values(groups)
    .flat()
    .filter((m) => done.includes(m.id)).length
  return Math.round((doneOnTrack / total) * 100)
}
