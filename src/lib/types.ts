// Shared domain types for the DSA / Quiz360Pro frontend.
// These describe the shapes exchanged with the backend API so that
// components and the API client are type-checked instead of using `any`.

export type UserRole =
  | 'student'
  | 'tutor'
  | 'admin'
  | 'super_admin'
  | 'parent'
  | 'staff'

export interface User {
  id?: string
  username?: string
  fullName?: string
  email: string
  role?: UserRole
  // For `role: 'staff'` — which staff role (secretary, auditor, …) they hold.
  // Their permissions are resolved from this via staffStore.getRole().
  staffRoleId?: string
  isDSAite?: boolean
  avatarUrl?: string
  phone?: string
  createdAt?: string
  // Exam track the student is preparing for. The backend stores this under
  // `level` at registration; some responses echo it as `examType`. Kept loose
  // (string) because the API is the source of truth — studentProfile.ts maps
  // whatever comes back onto a known ExamTrack.
  level?: string
  examType?: string
  // Backend's stored exam track (derived at registration, editable by the admin
  // from the roster). The portal treats it as the source of truth.
  examTrack?: string
  // Optional distinct override field (only if the backend chooses to add one).
  examTrackOverride?: string
  // Class/level at registration, e.g. "100 Level", "SS3" (sent as `currentLevel`).
  currentLevel?: string
  // Programmes the student enrolled in (e.g. "JAMB Tutorials", "Preclinical
  // Tutorials"). The primary signal for which dashboard/track to show.
  programmes?: string[]
  // Payments & access (see docs/payment-plan.md). Level: 'free' (account only),
  // 'portal' (paid the ₦2,000 access fee), 'tutorial' (active tutorial student).
  accessLevel?: 'free' | 'portal' | 'tutorial'
  tutorialExpiry?: string
  paymentStatus?: 'none' | 'pending-offline' | 'active' | 'expired' | 'disabled'
  accessEnabled?: boolean
  // Study mode. `isDsaStudent` (a physical/on-campus DSA student) is what the
  // signup form submits; `studyMode` is the resolved 'physical' | 'online'.
  isDsaStudent?: boolean
  studyMode?: string
  // JAMB/Post-UTME students send their chosen subjects here; WAEC students
  // send their department (a single 'science' | 'art' | 'commercial' value).
  subjectsOfInterest?: string[]
  // Optional explicit department (science | art | commercial) for routing to the
  // right department timetable.
  department?: string
}

/** Response returned by the login / register-verify endpoints. */
export interface AuthResponse {
  token: string
  user: User
  message?: string
}

/**
 * Data returned by POST /api/auth/register — the server initializes a Paystack
 * transaction and hands back the details the browser needs to resume it.
 */
export interface RegisterInitData {
  reference: string
  studentId: string
  price: number // kobo
  currency: string
  authorizationUrl: string
  accessCode: string
}

export interface RegisterResponse {
  success: boolean
  message?: string
  data?: RegisterInitData
}

// Registration fields are backend-defined and vary by form; keep this open.
export interface RegisterPayload {
  email: string
  password: string
  [key: string]: unknown
}

export interface LoginPayload {
  email: string
  password: string
}

export interface ResetPasswordPayload {
  newPassword: string
  token: string
}

// --- LMS domain (courses, materials, progress) ---
// Mirrors docs/DSA-LMS-Backend-Spec.md §2. Runs on a browser-local store until
// the backend ships the /courses + /materials endpoints (§4, §5).

export type MaterialType =
  | 'pdf'
  | 'video'
  | 'recording'
  | 'syllabus'
  | 'slide'
  | 'link'

// Courses are grouped into categories shared across tracks:
//  waec-sss   → WAEC + Secondary (SS1–SS3)
//  jamb-putme → JAMB + Post-UTME (same courses)
//  higher     → Higher Institution (100/200 level)
export type CourseCategory = 'waec-sss' | 'jamb-putme' | 'higher'

export interface Course {
  id: string
  title: string
  subject: string
  category: CourseCategory
  examTrack?: string // legacy hint; category is the source of truth
  department?: string // WAEC only
  tutorId?: string // assigned tutor (username)
  tutorName?: string
  description?: string
}

export interface CourseMaterial {
  id: string
  courseId: string
  title: string
  type: MaterialType
  url: string
  description?: string
  isDownloadable: boolean
  durationLabel?: string // e.g. "12:40" for video/recording
  createdAt: string
}

// --- Announcements & notifications (LMS §2.17–§2.18) ---

export type AnnouncementScope = 'global' | 'track' | 'course'

export interface Announcement {
  id: string
  scope: AnnouncementScope
  track?: string // when scope === 'track' (jamb | waec | postutme)
  // when scope === 'course' — a tutor messaging only the students taking that
  // course/subject. courseTitle is carried for display.
  courseId?: string
  courseTitle?: string
  authorId?: string
  authorName: string
  title: string
  body: string
  createdAt: string
}

// --- Assignments & submissions (LMS §2.5–§2.6) ---

export type SubmissionStatus = 'submitted' | 'late' | 'graded' | 'returned'

export interface Assignment {
  id: string
  courseId: string
  tutorId?: string
  title: string
  instructions: string
  attachmentUrl?: string
  maxScore: number
  dueDate: string // ISO
  allowLate: boolean
  createdAt: string
}

export interface Submission {
  id: string
  assignmentId: string
  studentId: string // student username/key
  studentName?: string
  fileUrl?: string
  text?: string
  status: SubmissionStatus
  score?: number
  feedback?: string
  gradedBy?: string
  submittedAt: string
  gradedAt?: string
}

// --- Quiz / CBT domain ---

export type QuestionDifficulty = 'easy' | 'medium' | 'hard'

export interface QuizOption {
  id: string
  text: string
  isCorrect?: boolean
}

export interface Question {
  id: string
  text: string
  options: QuizOption[]
  correctOptionId?: string
  explanation?: string
  subject?: string
  topic?: string
  year?: number
  difficulty?: QuestionDifficulty
}

export interface Quiz {
  id: string
  title: string
  link?: string
  accessCode?: string
  durationMinutes?: number
  questions: Question[]
  createdAt?: string
  // Audience targeting (see docs/backend-requests-2026-09-01.md §3).
  track?: string
  department?: string
  audience?: string
  // Access mode (see docs/backend-requests-2026-09-02.md §2):
  //  'portal' — enrolled/logged-in students, filtered by track/department.
  //  'free'   — public; anyone with the `link` takes it with just name + age.
  // Free quizzes are always open to everyone (track is forced to 'all').
  accessMode?: 'portal' | 'free'
}

/** Result returned by a public (free) quiz submission. */
export interface PublicQuizResult {
  totalScore: number
  totalMarks: number
  percentage: number
  breakdown?: unknown[]
}

export interface QuizAnswer {
  questionId: string
  /**
   * Index of the chosen option (0-based), NOT an option id.
   * The backend contract is `{ questionId, selectedOption: integer }` —
   * see POST /api/quizzes/{id}/submit. Null means unanswered.
   */
  selectedOption: number | null
}

export interface QuizSubmission {
  timeTaken: number
  answers: QuizAnswer[]
}

export interface LeaderboardEntry {
  rank: number
  userId: string
  username: string
  score: number
  timeTaken?: number
}

export interface Program {
  id?: string
  name: string
  endDate: string
}

/** Standard error envelope some endpoints return. */
export interface ApiError {
  message?: string
  error?: string
  statusCode?: number
}
