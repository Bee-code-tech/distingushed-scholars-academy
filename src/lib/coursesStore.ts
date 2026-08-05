// Courses, materials, and per-student completion — browser-local stand-in for
// the LMS course/material endpoints (see docs/DSA-LMS-Backend-Spec.md §4–§5,
// §2.16). Swap get/add/remove for API calls once /courses + /materials ship.
//
// Same-browser only: a material a tutor adds here is visible to students on the
// same browser (great for demoing the flow) until the backend persists it.

import type { Course, CourseCategory, CourseMaterial } from './types'

const COURSES_KEY = 'dsa_courses'
const MATERIALS_KEY = 'dsa_materials'
const COMPLETE_KEY = 'dsa_material_completions' // { [studentKey]: materialId[] }

// Course categories — a course is shared across every track/level in its category.
export const COURSE_CATEGORIES: { id: CourseCategory; label: string; note: string }[] = [
  { id: 'waec-sss', label: 'WAEC & Secondary', note: 'SS1 – SS3 and WAEC' },
  { id: 'jamb-putme', label: 'JAMB & Post-UTME', note: 'JAMB and Post-UTME — same courses' },
  { id: 'higher', label: 'Higher Institution', note: '100 / 200 level' },
]

/** Map a student's exam track / class level to a course category. */
export function categoryForTrack(track?: string): CourseCategory {
  const t = (track || '').toLowerCase()
  if (t.includes('waec') || t.includes('ss1') || t.includes('ss2') || t.includes('ss3'))
    return 'waec-sss'
  if (t.includes('100') || t.includes('200') || t.includes('higher')) return 'higher'
  return 'jamb-putme' // jamb, post-utme (and default)
}

export function categoryLabel(id: CourseCategory): string {
  return COURSE_CATEGORIES.find((c) => c.id === id)?.label ?? id
}

const courseCategory = (c: Course): CourseCategory =>
  c.category || categoryForTrack(c.examTrack)

// Seeded example courses per category (unassigned — the admin assigns a tutor).
const SEED_COURSES: Course[] = [
  { id: 'ws-math', title: 'Mathematics', subject: 'Mathematics', category: 'waec-sss', examTrack: 'waec' },
  { id: 'ws-eng', title: 'English Language', subject: 'English', category: 'waec-sss', examTrack: 'waec' },
  { id: 'ws-phy', title: 'Physics', subject: 'Physics', category: 'waec-sss', examTrack: 'waec' },
  { id: 'jp-eng', title: 'Use of English', subject: 'English', category: 'jamb-putme', examTrack: 'jamb' },
  { id: 'jp-math', title: 'Mathematics', subject: 'Mathematics', category: 'jamb-putme', examTrack: 'jamb' },
  { id: 'jp-phy', title: 'Physics', subject: 'Physics', category: 'jamb-putme', examTrack: 'jamb' },
]

const SEED_MATERIALS: CourseMaterial[] = [
  { id: 'm-seed-1', courseId: 'jp-math', title: 'Course Syllabus 2026', type: 'syllabus', url: 'https://example.com/syllabus.pdf', isDownloadable: true, createdAt: '2026-01-05T09:00:00.000Z' },
  { id: 'm-seed-2', courseId: 'jp-math', title: 'Indices & Logarithms (Notes)', type: 'pdf', url: 'https://example.com/indices.pdf', isDownloadable: true, createdAt: '2026-01-06T09:00:00.000Z' },
  { id: 'm-seed-3', courseId: 'jp-math', title: 'Live Class Recording — Algebra', type: 'recording', url: 'https://example.com/algebra-recording', durationLabel: '48:12', isDownloadable: false, createdAt: '2026-01-07T09:00:00.000Z' },
  { id: 'm-seed-4', courseId: 'jp-eng', title: 'Comprehension Techniques (Video)', type: 'video', url: 'https://example.com/comprehension', durationLabel: '15:30', isDownloadable: false, createdAt: '2026-01-06T10:00:00.000Z' },
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
/** All courses, or (when a track is given) the courses for that track's category. */
export function getCourses(track?: string): Course[] {
  const seedIds = new Set(SEED_COURSES.map((c) => c.id))
  const extras = read<Course[]>(COURSES_KEY, []).filter((c) => c?.id && !seedIds.has(c.id))
  const all = [...SEED_COURSES, ...extras]
  if (!track) return all
  const cat = categoryForTrack(track)
  return all.filter((c) => courseCategory(c) === cat)
}

export function getCoursesByCategory(category: CourseCategory): Course[] {
  return getCourses().filter((c) => courseCategory(c) === category)
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

export function removeCourse(id: string): void {
  if (SEED_COURSES.some((c) => c.id === id)) return
  write(COURSES_KEY, read<Course[]>(COURSES_KEY, []).filter((x) => x.id !== id))
}

/** Courses assigned to a tutor (by username or display name). */
export function getCoursesForTutor(tutorKey?: string, tutorName?: string): Course[] {
  return getCourses().filter(
    (c) =>
      (tutorKey && c.tutorId === tutorKey) ||
      (tutorName && c.tutorName && c.tutorName === tutorName),
  )
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
