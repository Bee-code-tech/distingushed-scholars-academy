// Shared domain types for the DSA / Quiz360Pro frontend.
// These describe the shapes exchanged with the backend API so that
// components and the API client are type-checked instead of using `any`.

export type UserRole = 'student' | 'tutor' | 'admin' | 'super_admin' | 'parent'

export interface User {
  id?: string
  username?: string
  fullName?: string
  email: string
  role?: UserRole
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
}

/** Response returned by the login / register-verify endpoints. */
export interface AuthResponse {
  token: string
  user: User
  message?: string
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
  selectedOptionId: string | null
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
