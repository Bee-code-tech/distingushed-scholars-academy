// Assignments & submissions — browser-local stand-in for the LMS assignment
// endpoints (docs/DSA-LMS-Backend-Spec.md §6). Swap get/add/submit/grade for
// API calls once /courses/:id/assignments + /submissions ship.
//
// Same-browser only: an assignment a tutor creates is visible to students on the
// same browser, and a student's submission is visible back to the tutor — great
// for demoing the full create → submit → grade loop.

import type { Assignment, Submission, SubmissionStatus } from './types'
import { getCourses } from './coursesStore'

const ASSIGN_KEY = 'dsa_assignments'
const SUB_KEY = 'dsa_submissions'

// Seeded so every browser has something to show. Due dates are relative to a
// fixed anchor; the current date drives late/upcoming labels at render time.
const SEED_ASSIGNMENTS: Assignment[] = [
  {
    id: 'a-seed-1',
    courseId: 'jamb-math',
    title: 'Algebra Problem Set 1',
    instructions:
      'Solve questions 1–20 in the shared PDF. Show all working. Submit a link to your scanned work or type your answers.',
    maxScore: 20,
    dueDate: '2026-08-20T23:59:00.000Z',
    allowLate: true,
    createdAt: '2026-08-01T09:00:00.000Z',
  },
  {
    id: 'a-seed-2',
    courseId: 'jamb-eng',
    title: 'Comprehension Essay',
    instructions:
      'Read the passage and answer in 250–300 words. Submit as text.',
    maxScore: 15,
    dueDate: '2026-08-18T23:59:00.000Z',
    allowLate: false,
    createdAt: '2026-08-02T09:00:00.000Z',
  },
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

// ---- Assignments ----
export function getAssignments(courseId: string): Assignment[] {
  const all = [...SEED_ASSIGNMENTS, ...read<Assignment[]>(ASSIGN_KEY, [])]
  return all
    .filter((a) => a.courseId === courseId)
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
}

export function getAssignment(id: string): Assignment | undefined {
  return [...SEED_ASSIGNMENTS, ...read<Assignment[]>(ASSIGN_KEY, [])].find(
    (a) => a.id === id,
  )
}

/** All assignments for every course on a track, grouped by course. */
export function getAssignmentsForTrack(
  track: string,
): Record<string, Assignment[]> {
  const out: Record<string, Assignment[]> = {}
  for (const c of getCourses(track)) {
    const list = getAssignments(c.id)
    if (list.length) out[c.id] = list
  }
  return out
}

export function addAssignment(input: {
  courseId: string
  title: string
  instructions: string
  maxScore: number
  dueDate: string
  allowLate: boolean
  now: number
}): Assignment {
  const a: Assignment = {
    id: `a-${input.now.toString(36)}`,
    courseId: input.courseId,
    title: input.title.trim(),
    instructions: input.instructions.trim(),
    maxScore: input.maxScore,
    dueDate: input.dueDate,
    allowLate: input.allowLate,
    createdAt: new Date(input.now).toISOString(),
  }
  write(ASSIGN_KEY, [...read<Assignment[]>(ASSIGN_KEY, []), a])
  return a
}

export function removeAssignment(id: string): void {
  if (SEED_ASSIGNMENTS.some((a) => a.id === id)) return
  write(ASSIGN_KEY, read<Assignment[]>(ASSIGN_KEY, []).filter((a) => a.id !== id))
  // also drop its submissions
  write(SUB_KEY, read<Submission[]>(SUB_KEY, []).filter((s) => s.assignmentId !== id))
}

// ---- Submissions ----
export function getSubmissions(assignmentId: string): Submission[] {
  return read<Submission[]>(SUB_KEY, []).filter(
    (s) => s.assignmentId === assignmentId,
  )
}

export function getMySubmission(
  assignmentId: string,
  studentKey: string,
): Submission | undefined {
  return read<Submission[]>(SUB_KEY, []).find(
    (s) => s.assignmentId === assignmentId && s.studentId === studentKey,
  )
}

/** Submit (or re-submit) work. Marks `late` if past the due date. */
export function submitAssignment(input: {
  assignmentId: string
  studentKey: string
  studentName?: string
  fileUrl?: string
  text?: string
  now: number
}): Submission {
  const assignment = getAssignment(input.assignmentId)
  const isLate = assignment
    ? input.now > new Date(assignment.dueDate).getTime()
    : false
  const status: SubmissionStatus = isLate ? 'late' : 'submitted'

  const subs = read<Submission[]>(SUB_KEY, [])
  const existing = subs.find(
    (s) => s.assignmentId === input.assignmentId && s.studentId === input.studentKey,
  )
  const sub: Submission = {
    id: existing?.id || `s-${input.now.toString(36)}`,
    assignmentId: input.assignmentId,
    studentId: input.studentKey,
    studentName: input.studentName,
    fileUrl: input.fileUrl?.trim() || undefined,
    text: input.text?.trim() || undefined,
    status,
    submittedAt: new Date(input.now).toISOString(),
  }
  const next = existing
    ? subs.map((s) => (s.id === existing.id ? sub : s))
    : [...subs, sub]
  write(SUB_KEY, next)
  return sub
}

/** Tutor grades a submission → writes score/feedback and marks graded. */
export function gradeSubmission(input: {
  submissionId: string
  score: number
  feedback?: string
  gradedBy?: string
  now: number
}): void {
  const subs = read<Submission[]>(SUB_KEY, [])
  write(
    SUB_KEY,
    subs.map((s) =>
      s.id === input.submissionId
        ? {
            ...s,
            score: input.score,
            feedback: input.feedback?.trim() || undefined,
            gradedBy: input.gradedBy,
            status: 'graded' as SubmissionStatus,
            gradedAt: new Date(input.now).toISOString(),
          }
        : s,
    ),
  )
}
