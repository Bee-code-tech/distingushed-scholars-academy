// Quiz audience — which programme (+ department) a quiz is meant for, mirroring
// the timetable's programme/department model. Admins target a quiz at a
// programme like JAMB (Science/Art/Commercial); students only see quizzes that
// match their resolved track + department (plus untargeted "all" quizzes).

import type { ExamTrack, Department } from './studentProfile'
import { EXAM_TRACKS, DEPARTMENT_LABELS } from './studentProfile'

/** Programmes an admin can target a quiz at. */
export const QUIZ_TRACKS: ExamTrack[] = [
  'jamb',
  'postutme',
  'waec',
  'undergrad',
  'preclinical',
  'afterschool',
]

/** Programmes split by department (Science / Art / Commercial). */
export const QUIZ_DEPT_SPLIT: ExamTrack[] = [
  'jamb',
  'postutme',
  'waec',
  'afterschool',
]

export const QUIZ_DEPARTMENTS: Department[] = ['science', 'art', 'commercial']

export function isDeptSplitTrack(track: string): boolean {
  return QUIZ_DEPT_SPLIT.includes(track as ExamTrack)
}

/** Human label for a quiz's audience, e.g. "JAMB · Science" or "All students". */
export function audienceLabel(
  track?: string | null,
  dept?: string | null,
): string {
  if (!track || track === 'all' || track === 'general') return 'All students'
  const t = EXAM_TRACKS[track as ExamTrack]?.label ?? track
  if (dept && isDeptSplitTrack(track)) {
    return `${t} · ${DEPARTMENT_LABELS[dept as Department] ?? dept}`
  }
  return t
}

/**
 * Whether a quiz (carrying optional `track`/`department`) should be visible to a
 * student with the given resolved profile. Untargeted quizzes are visible to
 * everyone; when a profile can't be resolved we don't hide anything.
 */
export function quizMatchesProfile(
  quiz: { track?: unknown; department?: unknown },
  profile: { track: ExamTrack; department: Department | null } | null,
): boolean {
  const qt = quiz.track ? String(quiz.track).toLowerCase() : ''
  if (!qt || qt === 'all' || qt === 'general') return true
  if (!profile) return true
  if (qt !== profile.track) return false
  const qd = quiz.department ? String(quiz.department).toLowerCase() : ''
  if (qd && isDeptSplitTrack(profile.track)) {
    // If the student's department is unknown, keep the quiz visible.
    return !profile.department || qd === profile.department
  }
  return true
}
