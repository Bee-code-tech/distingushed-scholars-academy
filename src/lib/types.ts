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
  // Study mode. `isDsaStudent` (a physical/on-campus DSA student) is what the
  // signup form submits; `studyMode` is the resolved 'physical' | 'online'.
  isDsaStudent?: boolean
  studyMode?: string
  // JAMB/Post-UTME students send their chosen subjects here; WAEC students
  // send their department (a single 'science' | 'art' | 'commercial' value).
  subjectsOfInterest?: string[]
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

export interface Course {
  id: string
  title: string
  subject: string
  examTrack: string // jamb | waec | postutme
  department?: string // WAEC only
  tutorId?: string
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

export type AnnouncementScope = 'global' | 'track'

export interface Announcement {
  id: string
  scope: AnnouncementScope
  track?: string // when scope === 'track' (jamb | waec | postutme)
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
