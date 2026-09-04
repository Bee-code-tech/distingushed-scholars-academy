// Courses, materials, and per-student completion — browser-local stand-in for
// the LMS course/material endpoints (see docs/DSA-LMS-Backend-Spec.md §4–§5,
// §2.16). Swap get/add/remove for API calls once /courses + /materials ship.
//
// Same-browser only: a material a tutor adds here is visible to students on the
// same browser (great for demoing the flow) until the backend persists it.

import type { Course, CourseCategory, CourseMaterial } from './types'
import type { ExamTrack } from './studentProfile'

const COURSES_KEY = 'dsa_courses'
const MATERIALS_KEY = 'dsa_materials'
const COMPLETE_KEY = 'dsa_material_completions' // { [studentKey]: materialId[] }

// Course categories — the class / exam-track a course belongs to. A student
// sees courses in any category matching their class OR their track.
export const COURSE_CATEGORIES: { id: CourseCategory; label: string; note: string }[] = [
  { id: 'ss1', label: 'SS1', note: 'Senior Secondary 1' },
  { id: 'ss2', label: 'SS2', note: 'Senior Secondary 2' },
  { id: 'ss3', label: 'SS3', note: 'Senior Secondary 3' },
  { id: 'waec', label: 'WAEC', note: 'WAEC / SSCE prep' },
  { id: 'jamb', label: 'JAMB', note: 'UTME prep' },
  { id: 'postutme', label: 'Post-UTME', note: 'Post-UTME prep' },
  { id: '100-level', label: '100 Level', note: 'Undergraduate 100' },
  { id: '200-level', label: '200 Level', note: 'Undergraduate 200' },
  { id: 'preclinical', label: 'Preclinical', note: 'Preclinical' },
  { id: 'afterschool', label: 'After-School', note: 'After-school lessons' },
]

/** Normalise any legacy category or track/level string to a current category. */
export function categoryForTrack(track?: string): CourseCategory {
  const t = (track || '').toLowerCase()
  if (t.includes('ss1')) return 'ss1'
  if (t.includes('ss2')) return 'ss2'
  if (t.includes('ss3')) return 'ss3'
  if (t.includes('post')) return 'postutme'
  if (t.includes('waec')) return 'waec'
  if (t.includes('jamb')) return 'jamb'
  if (t.includes('100')) return '100-level'
  if (t.includes('200') || t.includes('higher')) return '200-level'
  if (t.includes('preclinic')) return 'preclinical'
  if (t.includes('after') || t.includes('summer')) return 'afterschool'
  return 'jamb'
}

/** The categories a student belongs to — their class AND their exam track. */
export function categoriesForStudent(user?: {
  currentLevel?: unknown
  level?: unknown
  examTrack?: unknown
} | null): CourseCategory[] {
  const out = new Set<CourseCategory>()
  const level = String(user?.currentLevel ?? user?.level ?? '').toLowerCase()
  const track = String(user?.examTrack ?? '').toLowerCase()
  if (level.includes('ss1')) out.add('ss1')
  else if (level.includes('ss2')) out.add('ss2')
  else if (level.includes('ss3')) out.add('ss3')
  else if (level.includes('100')) out.add('100-level')
  else if (level.includes('200')) out.add('200-level')
  if (track === 'waec') out.add('waec')
  else if (track === 'jamb') out.add('jamb')
  else if (track === 'postutme') out.add('postutme')
  else if (track === 'preclinical') out.add('preclinical')
  else if (track === 'afterschool') out.add('afterschool')
  else if (track === 'undergrad') out.add('100-level')
  return [...out]
}

export function categoryLabel(id: CourseCategory): string {
  return COURSE_CATEGORIES.find((c) => c.id === id)?.label ?? id
}

/**
 * The exam tracks that fall under a course category — used to scope a tutor to
 * the community channels of the categories they teach. (Community channels are
 * still track-based; SS classes map to the WAEC community.)
 */
export function tracksForCategory(cat: CourseCategory): ExamTrack[] {
  switch (cat) {
    case 'ss1':
    case 'ss2':
    case 'ss3':
    case 'waec':
    case 'waec-sss':
      return ['waec', 'afterschool']
    case '100-level':
    case '200-level':
    case 'preclinical':
    case 'higher':
      return ['undergrad', 'preclinical']
    case 'afterschool':
      return ['afterschool']
    case 'jamb':
    case 'postutme':
    case 'jamb-putme':
    default:
      return ['jamb', 'postutme']
  }
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
