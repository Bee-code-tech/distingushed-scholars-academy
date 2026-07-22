// Central definition of the two "roles" that shape the student dashboard:
//   1. Exam track  — JAMB, WAEC or NECO
//   2. Study mode  — Physical (on-campus) or Online
//
// Everything the dashboard needs to specialise itself (titles, countdown dates,
// subject rules, mode-specific cards) is derived from here, so there is a single
// place to update each year and a single resolver mapping the raw backend
// profile onto a typed StudentProfile.

import type { LucideIcon } from 'lucide-react'
import {
  GraduationCap,
  BookOpen,
  FlaskConical,
  MapPin,
  Video,
} from 'lucide-react'
import type { User } from './types'

export type ExamTrack = 'jamb' | 'waec' | 'neco'
export type StudyMode = 'physical' | 'online'

export interface ExamTrackConfig {
  id: ExamTrack
  /** Short label for badges, e.g. "WAEC". */
  label: string
  /** Full exam name for headings. */
  fullName: string
  icon: LucideIcon
  /**
   * Next exam date for the countdown, ISO format.
   *
   * OWNER: update these once per academic year. They are deliberately in one
   * place. If a date has already passed, the dashboard falls back gracefully
   * (see examCountdown) instead of showing a negative timer.
   */
  nextExamDate: string
  /** Human label for the countdown target, e.g. "UTME 2027". */
  examLabel: string
  /** Guidance shown for subject registration. */
  subjectRule: string
  /** Total syllabus topics, used for the progress stat. */
  totalTopics: number
  /** Motivational line on the welcome banner. */
  tagline: string
}

export interface StudyModeConfig {
  id: StudyMode
  label: string
  /** One-line description used under the mode badge. */
  description: string
  icon: LucideIcon
}

// --- Exam tracks -------------------------------------------------------------

export const EXAM_TRACKS: Record<ExamTrack, ExamTrackConfig> = {
  jamb: {
    id: 'jamb',
    label: 'JAMB',
    fullName: 'JAMB UTME',
    icon: GraduationCap,
    nextExamDate: '2027-04-24T08:00:00+01:00',
    examLabel: 'UTME 2027',
    subjectRule: '4 subjects — English is compulsory',
    totalTopics: 40,
    tagline:
      'The beautiful thing about learning is that no one can take it away from you.',
  },
  waec: {
    id: 'waec',
    label: 'WAEC',
    fullName: 'WAEC WASSCE',
    icon: BookOpen,
    nextExamDate: '2027-05-05T09:00:00+01:00',
    examLabel: 'WASSCE 2027',
    subjectRule: '8–9 subjects — English & Maths compulsory',
    totalTopics: 60,
    tagline: 'Excellence is not an act, but a habit. Keep practising.',
  },
  neco: {
    id: 'neco',
    label: 'NECO',
    fullName: 'NECO SSCE',
    icon: FlaskConical,
    nextExamDate: '2027-06-16T09:00:00+01:00',
    examLabel: 'SSCE 2027',
    subjectRule: '8–9 subjects — English & Maths compulsory',
    totalTopics: 60,
    tagline: 'Small daily improvements are the key to staggering results.',
  },
}

export const DEFAULT_TRACK: ExamTrack = 'jamb'

// --- Study modes -------------------------------------------------------------

export const STUDY_MODES: Record<StudyMode, StudyModeConfig> = {
  physical: {
    id: 'physical',
    label: 'On-Campus',
    description: 'In-person classes at the DSA academy',
    icon: MapPin,
  },
  online: {
    id: 'online',
    label: 'Online',
    description: 'Live and recorded classes from anywhere',
    icon: Video,
  },
}

export const DEFAULT_MODE: StudyMode = 'online'

// --- Resolver ----------------------------------------------------------------

export interface StudentProfile {
  track: ExamTrack
  mode: StudyMode
  trackConfig: ExamTrackConfig
  modeConfig: StudyModeConfig
}

/**
 * Map a raw backend string onto a known ExamTrack. Handles the current API
 * values (`jamb`, `waec`, `post utme`) plus `neco` for when the backend starts
 * distinguishing it. Post-UTME students are prepping for the same UTME content,
 * so they fall under the JAMB track. Anything unknown defaults to JAMB.
 */
export function normaliseTrack(raw?: string | null): ExamTrack {
  const v = (raw ?? '').toString().trim().toLowerCase()
  if (v.includes('neco')) return 'neco'
  if (v.includes('waec') || v.includes('wassce')) return 'waec'
  if (v.includes('jamb') || v.includes('utme')) return 'jamb'
  return DEFAULT_TRACK
}

/**
 * Resolve study mode. A DSA (on-campus) student registers with
 * `isDsaStudent: true`, which the backend may echo as `isDSAite`. An explicit
 * `studyMode` string wins if present.
 */
export function normaliseMode(user?: Partial<User> | null): StudyMode {
  const explicit = (user?.studyMode ?? '').toString().trim().toLowerCase()
  if (explicit === 'physical' || explicit === 'online') return explicit
  if (user?.isDsaStudent || user?.isDSAite) return 'physical'
  return DEFAULT_MODE
}

/** Build the full StudentProfile the dashboard renders from. */
export function resolveStudentProfile(
  user?: Partial<User> | null,
): StudentProfile {
  const track = normaliseTrack(user?.level ?? user?.examType)
  const mode = normaliseMode(user)
  return {
    track,
    mode,
    trackConfig: EXAM_TRACKS[track],
    modeConfig: STUDY_MODES[mode],
  }
}

// --- Countdown helper --------------------------------------------------------

export interface Countdown {
  days: number
  hours: number
  minutes: number
  seconds: number
  /** True once the target date is in the past — show a fallback, not a timer. */
  elapsed: boolean
}

/** Time remaining until an ISO target, clamped at zero when already passed. */
export function examCountdown(targetIso: string, now = Date.now()): Countdown {
  const diff = new Date(targetIso).getTime() - now
  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, elapsed: true }
  }
  return {
    days: Math.floor(diff / 86_400_000),
    hours: Math.floor((diff % 86_400_000) / 3_600_000),
    minutes: Math.floor((diff % 3_600_000) / 60_000),
    seconds: Math.floor((diff % 60_000) / 1000),
    elapsed: false,
  }
}
