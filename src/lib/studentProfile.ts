// Central definition of the two "roles" that shape the student dashboard:
//   1. Exam track  — JAMB, WAEC or Post-UTME
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
import { deriveTrackFromProgrammes } from './registration'

// Exam tracks have a national exam + countdown (JAMB, WAEC, Post-UTME).
// Programme tracks are the academy's non-exam programmes (undergraduate,
// preclinical, after-school/summer) — no exam countdown; the dashboard is
// tailored to the programme / academic year instead.
export type ExamTrack =
  | 'jamb'
  | 'waec'
  | 'postutme'
  | 'undergrad'
  | 'preclinical'
  | 'afterschool'
export type StudyMode = 'physical' | 'online'
export type Department = 'science' | 'art' | 'commercial'

export const DEPARTMENT_LABELS: Record<Department, string> = {
  science: 'Science',
  art: 'Art',
  commercial: 'Commercial',
}

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
  /**
   * True for tracks that sit an external exam (JAMB/WAEC/Post-UTME) and so show
   * a live countdown. False for programme tracks (undergrad, preclinical,
   * after-school) — the dashboard shows a programme focus card instead.
   */
  hasExam: boolean
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
    hasExam: true,
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
    hasExam: true,
  },
  postutme: {
    id: 'postutme',
    label: 'Post-UTME',
    fullName: 'Post-UTME Screening',
    icon: FlaskConical,
    nextExamDate: '2027-08-30T09:00:00+01:00',
    examLabel: 'Post-UTME 2027',
    subjectRule: '4 subjects — matches your intended course',
    totalTopics: 40,
    tagline: 'Small daily improvements are the key to staggering results.',
    hasExam: true,
  },

  // --- Programme tracks (no external exam / countdown) ---------------------

  undergrad: {
    id: 'undergrad',
    label: 'Undergrad',
    fullName: 'Undergraduate Tutorials',
    icon: GraduationCap,
    // No national exam; keep a far session date so any date math stays valid.
    nextExamDate: '2027-07-31T09:00:00+01:00',
    examLabel: 'This Semester',
    subjectRule: 'Course-based tutorials for your level',
    totalTopics: 48,
    tagline: 'Master every course, one week at a time.',
    hasExam: false,
  },
  preclinical: {
    id: 'preclinical',
    label: 'Preclinical',
    fullName: 'Preclinical Tutorials',
    icon: FlaskConical,
    nextExamDate: '2027-07-31T09:00:00+01:00',
    examLabel: 'This Semester',
    subjectRule: 'Anatomy, Physiology & Biochemistry focus',
    totalTopics: 48,
    tagline: 'Build the foundation your clinical years will stand on.',
    hasExam: false,
  },
  afterschool: {
    id: 'afterschool',
    label: 'After-School',
    fullName: 'After-School & Summer Tutorials',
    icon: BookOpen,
    nextExamDate: '2027-07-31T09:00:00+01:00',
    examLabel: 'This Term',
    subjectRule: 'Daily lesson reinforcement across your subjects',
    totalTopics: 40,
    tagline: 'A little progress each day adds up to big results.',
    hasExam: false,
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
  /** WAEC only — the student's department. Null for JAMB/Post-UTME. */
  department: Department | null
  /**
   * The student's class/level as registered (e.g. "100 Level", "SS3"). Shown on
   * programme dashboards so a 100-Level and a 200-Level student see their own
   * year. Undefined when not known.
   */
  yearLabel?: string
  trackConfig: ExamTrackConfig
  modeConfig: StudyModeConfig
}

/** Read a department from a raw string, or null if it isn't one. */
function normaliseDepartment(raw?: string | null): Department | null {
  const v = (raw ?? '').toString().trim().toLowerCase()
  if (v === 'science' || v === 'art' || v === 'commercial') return v
  return null
}

/**
 * Map a raw backend string onto a known ExamTrack. Handles the API values
 * (`jamb`, `waec`, `post utme`). Post-UTME is checked before JAMB because
 * "post utme" also contains "utme". Anything unknown defaults to JAMB.
 */
export function normaliseTrack(raw?: string | null): ExamTrack {
  const v = (raw ?? '').toString().trim().toLowerCase()
  // Exam tracks first (Post-UTME before JAMB — "post utme" also contains "utme").
  if (v.includes('post')) return 'postutme'
  if (v.includes('waec') || v.includes('wassce')) return 'waec'
  // Programme tracks. Check preclinical before the generic level match, and
  // "jamb/utme" last so a value like "Jambite" still lands on JAMB.
  if (v.includes('preclinic') || v.includes('pre-clinic')) return 'preclinical'
  if (
    v.includes('undergrad') ||
    v.includes('100') ||
    v.includes('200') ||
    v.includes('level tutorial')
  )
    return 'undergrad'
  if (v.includes('after') || v.includes('summer') || v.includes('school leav'))
    return 'afterschool'
  if (v.includes('jamb') || v.includes('utme')) return 'jamb'
  return DEFAULT_TRACK
}

/**
 * Resolve study mode. A DSA (on-campus) student registers with
 * `isDsaStudent: true`, which the backend may echo as `isDSAite`. An explicit
 * `studyMode` string wins if present.
 */
export function normaliseMode(user?: Partial<User> | null): StudyMode | null {
  const explicit = (user?.studyMode ?? '').toString().trim().toLowerCase()
  if (explicit === 'physical' || explicit === 'online') return explicit
  if (user?.isDsaStudent === true || user?.isDSAite === true) return 'physical'
  if (user?.isDsaStudent === false || user?.isDSAite === false) return 'online'
  return null
}

// --- Local fallback for the enrolment choice --------------------------------
//
// BACKEND GAP: POST /api/auth/register does not accept `isDsaStudent`, so the
// physical/online choice a student makes at signup is not persisted server-side
// and never comes back on /auth/me. Without a fallback every student would
// resolve to "online" and on-campus students would lose their timetable view.
//
// We therefore remember the choice in this browser at signup and use it only
// when the API says nothing. Remove once the backend stores study mode.

const ENROLMENT_KEY = 'dsa_enrolment_choice'

export interface EnrolmentChoice {
  track?: string
  mode?: StudyMode
  department?: Department
  /** The programmes the student selected — the primary track signal. */
  programmes?: string[]
  /** The class/level the student picked, e.g. "100 Level". */
  classLevel?: string
}

export function rememberEnrolmentChoice(choice: EnrolmentChoice): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(ENROLMENT_KEY, JSON.stringify(choice))
  } catch {
    // Storage unavailable (private mode) — the API values still apply.
  }
}

export function getEnrolmentChoice(): EnrolmentChoice {
  if (typeof window === 'undefined') return {}
  try {
    return JSON.parse(localStorage.getItem(ENROLMENT_KEY) || '{}')
  } catch {
    return {}
  }
}

/** Build the full StudentProfile the dashboard renders from. */
export function resolveStudentProfile(
  user?: Partial<User> | null,
): StudentProfile {
  const remembered = getEnrolmentChoice()

  // The programmes a student enrolled in are the truest signal and cover every
  // programme (JAMB … Preclinical), so prefer them. Fall back to an explicit
  // exam field, then the class level, then the choice remembered at signup.
  const programmes =
    (user?.programmes && user.programmes.length
      ? user.programmes
      : undefined) ??
    (user?.subjectsOfInterest && user.subjectsOfInterest.length
      ? user.subjectsOfInterest
      : undefined) ??
    (remembered.programmes && remembered.programmes.length
      ? remembered.programmes
      : undefined)

  // `examTrack` is the backend's stored track (derived at registration, and
  // editable by the admin from the roster). It's the source of truth, so it
  // wins — this is how an admin corrects a student on the wrong track. Only when
  // it's absent do we derive from programmes, then the other exam fields.
  // (`examTrackOverride` is still honoured first if the backend ever sends it.)
  const explicit = (user?.examTrackOverride ?? user?.examTrack ?? '')
    .toString()
    .trim()
  const track: ExamTrack = explicit
    ? normaliseTrack(explicit)
    : programmes && programmes.length
      ? normaliseTrack(deriveTrackFromProgrammes(programmes))
      : normaliseTrack(
          user?.level ??
            user?.examType ??
            user?.currentLevel ??
            remembered.track,
        )

  const mode = normaliseMode(user) ?? remembered.mode ?? DEFAULT_MODE

  // The class/level to display on programme dashboards (e.g. "100 Level").
  const yearLabel =
    (user?.currentLevel ?? remembered.classLevel ?? '').toString().trim() ||
    undefined

  // WAEC carries a department (Science/Art/Commercial). The backend stores it as
  // the single entry in subjectsOfInterest; the remembered choice is the
  // fallback (same gap as study mode — see rememberEnrolmentChoice).
  const department =
    track === 'waec'
      ? (normaliseDepartment(user?.subjectsOfInterest?.[0]) ??
        remembered.department ??
        null)
      : null

  return {
    track,
    mode,
    department,
    yearLabel,
    trackConfig: EXAM_TRACKS[track],
    modeConfig: STUDY_MODES[mode],
  }
}

// --- Live exam dates from the backend ----------------------------------------

/**
 * Override the built-in exam dates with whatever the backend holds.
 *
 * GET /api/programs returns entries like
 *   { name: 'JAMB Countdown', endDate: '2026-04-20T00:00:00.000Z' }
 * so the owner can change a countdown via POST /api/programs instead of a code
 * deploy. A program is matched to a track by looking for the track name inside
 * the program name (case-insensitive).
 *
 * Any track with no matching program keeps its EXAM_TRACKS default, so a
 * partially-populated backend (today only JAMB exists) degrades cleanly.
 */
export function applyProgramDates(
  profile: StudentProfile,
  programs?: Array<{ name?: string; endDate?: string }> | null,
): StudentProfile {
  if (!programs?.length) return profile

  const match = programs.find(
    (p) =>
      typeof p?.name === 'string' &&
      typeof p?.endDate === 'string' &&
      p.name.toLowerCase().includes(profile.track),
  )
  if (!match?.endDate) return profile

  const when = new Date(match.endDate)
  if (Number.isNaN(when.getTime())) return profile

  return {
    ...profile,
    trackConfig: {
      ...profile.trackConfig,
      nextExamDate: match.endDate,
      examLabel: `${profile.trackConfig.label} ${when.getFullYear()}`,
    },
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
