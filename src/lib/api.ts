// Centralized API client for the DSA / Quiz360Pro backend.
// Single source of truth for network access: base URL, auth headers,
// error handling, and automatic logout on expired sessions.

import type {
  AuthResponse,
  LoginPayload,
  RegisterPayload,
  RegisterResponse,
  ResetPasswordPayload,
  User,
  Quiz,
  QuizSubmission,
  LeaderboardEntry,
  Program,
} from './types'

// Canonical base URL. Every other file in the app used the non-www host
// (`api.distinguishedscholarsacademy.com`); only this client previously used
// `www.api...`, which was almost certainly wrong. Standardized to non-www.
// Override per-environment with NEXT_PUBLIC_API_URL.
// This client uses an "/api" base (paths below omit the /api prefix), while
// admin-api.ts + the admin components read the SAME env var but WITHOUT /api
// (they add /api per path). Normalize here so either env format works and we
// never emit a doubled "/api/api/...": strip any trailing slash and a single
// trailing "/api", then append exactly one "/api".
const RAW_API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  'https://api.distinguishedscholarsacademy.com'
const BASE_URL = RAW_API_URL.replace(/\/+$/, '').replace(/\/api$/, '') + '/api'

const TOKEN_KEY = 'dsa_token'

/** Read the stored token safely (no-op on the server). */
const getStoredToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(TOKEN_KEY)
  }
  return null
}

/**
 * On a 401 the token is stale/invalid — clear the session and bounce the
 * user to sign-in. Done here so every call gets consistent expiry handling
 * instead of each component reinventing it.
 */
const handleUnauthorized = () => {
  if (typeof window === 'undefined') return
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem('dsa_user')
  localStorage.removeItem('user_role')
  document.cookie = 'admin_token=; path=/; max-age=0; SameSite=Lax'
  // Avoid redirect loops if we're already on an auth page.
  if (!window.location.pathname.startsWith('/auth')) {
    window.location.href = '/auth/signin?expired=true'
  }
}

/**
 * Parse a response, surfacing a clean error message and handling non-JSON
 * bodies (e.g. 502/404 HTML) without crashing.
 */
async function handleResponse<T>(response: Response): Promise<T> {
  const contentType = response.headers.get('content-type')
  let data: unknown = null

  if (contentType && contentType.includes('application/json')) {
    data = await response.json()
  }

  if (!response.ok) {
    if (response.status === 401) handleUnauthorized()
    const body = (data ?? {}) as { message?: string; error?: string }
    const errorMessage =
      body.message ||
      body.error ||
      `Error ${response.status}: ${response.statusText}`
    throw new Error(errorMessage)
  }

  return data as T
}

/** Default headers, including the Bearer token when available. */
const getHeaders = (token?: string, isJson = true): HeadersInit => {
  const headers: Record<string, string> = {}
  if (isJson) headers['Content-Type'] = 'application/json'

  const activeToken = token || getStoredToken()
  if (activeToken) {
    headers['Authorization'] = `Bearer ${activeToken}`
  }
  return headers
}

/**
 * True when a fetch never reached the server (offline / CORS / backend not up
 * yet), as opposed to an HTTP error the server actually returned (which should
 * be surfaced to the user). Lets callers keep a local "preview" path while the
 * backend is still being wired up without hiding real API errors.
 */
export function isBackendUnreachable(err: unknown): boolean {
  if (err instanceof TypeError) return true // fetch() network-level failure
  const m = err instanceof Error ? err.message.toLowerCase() : ''
  return (
    m.includes('failed to fetch') ||
    m.includes('networkerror') ||
    m.includes('load failed') ||
    m.includes('network request failed')
  )
}

export const dsaApi = {
  auth: {
    /**
     * Register a student. The backend creates a PENDING student, initializes a
     * Paystack transaction, and returns `data: { accessCode, authorizationUrl,
     * reference, … }`. The caller resumes that transaction (see paystack.ts),
     * the webhook confirms payment, then OTP verification issues the token.
     */
    register: (payload: RegisterPayload) =>
      fetch(`${BASE_URL}/auth/register`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(payload),
      }).then((r) => handleResponse<RegisterResponse>(r)),

    /**
     * Resend the verification code.
     *
     * BACKEND GAP: `/auth/send-otp` is not implemented — the live API returns
     * 404 and it is absent from the OpenAPI spec. The call is kept so this
     * starts working the moment the endpoint ships; until then a 404 is
     * translated into a message a student can actually act on, instead of
     * surfacing a raw "Cannot POST /api/auth/send-otp".
     */
    sendOtp: async (email: string) => {
      const r = await fetch(`${BASE_URL}/auth/send-otp`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ email }),
      })
      if (r.status === 404) {
        throw new Error(
          'Resending codes is not available yet. Please use the code already sent to your email.',
        )
      }
      return handleResponse<{ message: string }>(r)
    },

    verifyOtp: (email: string, otp: string) =>
      fetch(`${BASE_URL}/auth/verify-otp`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ email, otp }),
      }).then((r) => handleResponse<AuthResponse>(r)),

    login: (payload: LoginPayload) =>
      fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(payload),
      }).then((r) => handleResponse<AuthResponse>(r)),

    forgotPassword: (email: string) =>
      fetch(`${BASE_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ email }),
      }).then((r) => handleResponse<{ message: string }>(r)),

    resetPassword: (payload: ResetPasswordPayload) =>
      fetch(`${BASE_URL}/auth/reset-password/${payload.token}`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ newPassword: payload.newPassword }),
      }).then((r) => handleResponse<{ message: string }>(r)),

    /**
     * Current logged-in user.
     *
     * The endpoint is `/auth/me` — `/auth/profile` does not exist on the
     * backend and returns 404 (verified against the live API), which logged
     * every student straight back out.
     *
     * The API wraps payloads as `{ success, data }` (same envelope as
     * /programs), but login returns the user under `user`. Unwrap either so
     * this keeps working whichever shape comes back.
     */
    getProfile: (token?: string) =>
      fetch(`${BASE_URL}/auth/me`, {
        method: 'GET',
        headers: getHeaders(token),
      })
        .then((r) =>
          handleResponse<User | { data?: User; user?: User }>(r),
        )
        .then((res) => {
          const body = res as { data?: User; user?: User }
          return (body.data ?? body.user ?? res) as User
        }),

    /** Update the logged-in user's profile (PUT /auth/updatedetails). */
    updateDetails: (payload: Record<string, unknown>, token?: string) =>
      fetch(`${BASE_URL}/auth/updatedetails`, {
        method: 'PUT',
        headers: getHeaders(token),
        body: JSON.stringify(payload),
      }).then((r) =>
        handleResponse<{ success?: boolean; data?: User; user?: User; message?: string }>(r),
      ),

    /** Change password (PUT /auth/updatepassword). */
    updatePassword: (
      payload: { currentPassword: string; newPassword: string },
      token?: string,
    ) =>
      fetch(`${BASE_URL}/auth/updatepassword`, {
        method: 'PUT',
        headers: getHeaders(token),
        body: JSON.stringify(payload),
      }).then((r) => handleResponse<{ success?: boolean; token?: string; message?: string }>(r)),
  },

  quizzes: {
    create: (payload: Partial<Quiz>, token?: string) =>
      fetch(`${BASE_URL}/quizzes`, {
        method: 'POST',
        headers: getHeaders(token),
        body: JSON.stringify(payload),
      }).then((r) => handleResponse<Quiz>(r)),

    getByLink: (link: string, token?: string) =>
      fetch(`${BASE_URL}/quizzes/link/${link}`, {
        method: 'GET',
        headers: getHeaders(token),
      }).then((r) => handleResponse<Quiz>(r)),

    verifyCode: (
      payload: { link: string; accessCode: string },
      token?: string,
    ) =>
      fetch(`${BASE_URL}/quizzes/verify-code`, {
        method: 'POST',
        headers: getHeaders(token),
        body: JSON.stringify(payload),
      }).then((r) => handleResponse<{ valid: boolean; quiz?: Quiz }>(r)),

    submit: (id: string, payload: QuizSubmission, token?: string) =>
      fetch(`${BASE_URL}/quizzes/${id}/submit`, {
        method: 'POST',
        headers: getHeaders(token),
        body: JSON.stringify(payload),
      }).then((r) => handleResponse<{ score: number; total: number }>(r)),

    getLeaderboard: (id: string, token?: string) =>
      fetch(`${BASE_URL}/quizzes/${id}/leaderboard`, {
        method: 'GET',
        headers: getHeaders(token),
      }).then((r) => handleResponse<LeaderboardEntry[]>(r)),
  },

  programs: {
    create: (payload: Program, token?: string) =>
      fetch(`${BASE_URL}/programs`, {
        method: 'POST',
        headers: getHeaders(token),
        body: JSON.stringify(payload),
      }).then((r) => handleResponse<Program>(r)),

    /**
     * All program countdowns.
     *
     * The API answers with the `{ success, count, data }` envelope, so unwrap
     * `data` here — callers just want the array. Tolerates a bare array too in
     * case the shape is ever simplified.
     */
    getAll: () =>
      fetch(`${BASE_URL}/programs`, {
        method: 'GET',
        headers: getHeaders(),
      })
        .then((r) => handleResponse<Program[] | { data?: Program[] }>(r))
        .then((res) => (Array.isArray(res) ? res : (res?.data ?? []))),
  },

  admin: {
    /**
     * List users by role for the admin management views
     * (GET /api/admin/users?role=student|tutor|parent|staff).
     *
     * NOT LIVE YET — the backend returns 404 and there is no real admin auth.
     * The admin roster components try this first and fall back to the local
     * store. It starts returning data the moment the backend ships the endpoint
     * (+ real admin login so the Bearer token is valid). See
     * docs/DSA-LMS-Backend-Spec.md §3.
     */
    listUsers: (role: 'student' | 'tutor' | 'parent' | 'staff', token?: string) =>
      fetch(`${BASE_URL}/admin/users?role=${encodeURIComponent(role)}`, {
        method: 'GET',
        headers: getHeaders(token),
      })
        .then((r) => handleResponse<Record<string, unknown>[] | { data?: Record<string, unknown>[] }>(r))
        .then((res) => (Array.isArray(res) ? res : (res?.data ?? []))),
  },

  // Attendance — per-COURSE self check-in (docs/attendance.md). A tutor opens
  // attendance for one of their courses; enrolled students mark themselves
  // present for that course. courseId is required to activate/close and scopes
  // check-in, the monitor list, and the "is it open" check. Each returns the
  // unwrapped `data` payload.
  attendance: {
    // GET /attendance/sessions/current?courseId= — is this course's attendance open?
    current: (courseId?: string, token?: string) =>
      fetch(
        `${BASE_URL}/attendance/sessions/current${courseId ? `?courseId=${encodeURIComponent(courseId)}` : ''}`,
        { headers: getHeaders(token) },
      )
        .then((r) => handleResponse<{ data?: unknown }>(r))
        .then((r) => (r as { data?: unknown }).data ?? r),

    // POST /attendance/sessions { courseId, date? } — tutor/admin activate.
    activate: (
      body: { courseId: string; date?: string },
      token?: string,
    ) =>
      fetch(`${BASE_URL}/attendance/sessions`, {
        method: 'POST',
        headers: getHeaders(token),
        body: JSON.stringify(body),
      })
        .then((r) => handleResponse<{ data?: unknown }>(r))
        .then((r) => (r as { data?: unknown }).data ?? r),

    // DELETE /attendance/sessions/:date?courseId= — close a course's session.
    close: (date: string, courseId: string, token?: string) =>
      fetch(
        `${BASE_URL}/attendance/sessions/${encodeURIComponent(date)}?courseId=${encodeURIComponent(courseId)}`,
        { method: 'DELETE', headers: getHeaders(token) },
      )
        .then((r) => handleResponse<{ data?: unknown }>(r))
        .then((r) => (r as { data?: unknown }).data ?? r),

    // POST /attendance/check-in { courseId } — student marks self present.
    checkIn: (courseId?: string, token?: string) =>
      fetch(`${BASE_URL}/attendance/check-in`, {
        method: 'POST',
        headers: getHeaders(token),
        body: JSON.stringify(courseId ? { courseId } : {}),
      })
        .then((r) => handleResponse<{ data?: unknown }>(r))
        .then((r) => (r as { data?: unknown }).data ?? r),

    // GET /attendance/check-ins?date=&courseId= — monitor a course's check-ins.
    checkIns: (
      params: { date?: string; courseId?: string } = {},
      token?: string,
    ) => {
      const qs = new URLSearchParams()
      if (params.date) qs.set('date', params.date)
      if (params.courseId) qs.set('courseId', params.courseId)
      const q = qs.toString()
      return fetch(`${BASE_URL}/attendance/check-ins${q ? `?${q}` : ''}`, {
        headers: getHeaders(token),
      })
        .then((r) =>
          handleResponse<
            Record<string, unknown>[] | { data?: Record<string, unknown>[] }
          >(r),
        )
        .then((res) => (Array.isArray(res) ? res : (res?.data ?? [])))
    },

    // GET /attendance/me — the student's own overall record + rate.
    me: (token?: string) =>
      fetch(`${BASE_URL}/attendance/me`, { headers: getHeaders(token) })
        .then((r) => handleResponse<{ data?: unknown }>(r))
        .then((r) => (r as { data?: unknown }).data ?? r),
  },

  // Courses & materials (docs/courses.md). Admin create/update/delete live in
  // admin-api.ts (adminApi, owned by the admin work); these are the student-
  // and tutor-facing reads plus enrollment, material listing, and completion.
  // List endpoints unwrap `{ success, count, data }` to the array; single-object
  // endpoints unwrap `{ success, data }` to the object.
  courses: {
    // GET /courses?category=&tutorId=  (any authed user). tutorId may be "me".
    list: (
      params: { category?: string; tutorId?: string } = {},
      token?: string,
    ) => {
      const qs = new URLSearchParams()
      if (params.category) qs.set('category', params.category)
      if (params.tutorId) qs.set('tutorId', params.tutorId)
      const q = qs.toString()
      return fetch(`${BASE_URL}/courses${q ? `?${q}` : ''}`, {
        headers: getHeaders(token),
      })
        .then((r) =>
          handleResponse<
            Record<string, unknown>[] | { data?: Record<string, unknown>[] }
          >(r),
        )
        .then((res) => (Array.isArray(res) ? res : (res?.data ?? [])))
    },

    // GET /courses/mine (student) — published courses for the student's
    // category, each with progressPercent and a nested tutor.
    mine: (token?: string) =>
      fetch(`${BASE_URL}/courses/mine`, { headers: getHeaders(token) })
        .then((r) =>
          handleResponse<
            Record<string, unknown>[] | { data?: Record<string, unknown>[] }
          >(r),
        )
        .then((res) => (Array.isArray(res) ? res : (res?.data ?? []))),

    get: (id: string, token?: string) =>
      fetch(`${BASE_URL}/courses/${encodeURIComponent(id)}`, {
        headers: getHeaders(token),
      })
        .then((r) => handleResponse<{ data?: unknown }>(r))
        .then((r) => (r as { data?: unknown }).data ?? r),

    // POST /courses/:id/enroll (student). 409 if already enrolled.
    enroll: (id: string, token?: string) =>
      fetch(`${BASE_URL}/courses/${encodeURIComponent(id)}/enroll`, {
        method: 'POST',
        headers: getHeaders(token),
        body: JSON.stringify({}),
      })
        .then((r) => handleResponse<{ data?: unknown }>(r))
        .then((r) => (r as { data?: unknown }).data ?? r),

    // GET /enrollments/me (student) — enrollments with nested course + tutor.
    myEnrollments: (token?: string) =>
      fetch(`${BASE_URL}/enrollments/me`, { headers: getHeaders(token) })
        .then((r) =>
          handleResponse<
            Record<string, unknown>[] | { data?: Record<string, unknown>[] }
          >(r),
        )
        .then((res) => (Array.isArray(res) ? res : (res?.data ?? []))),

    // GET /courses/:id/materials (student / owner tutor / admin).
    materials: (courseId: string, token?: string) =>
      fetch(`${BASE_URL}/courses/${encodeURIComponent(courseId)}/materials`, {
        headers: getHeaders(token),
      })
        .then((r) =>
          handleResponse<
            Record<string, unknown>[] | { data?: Record<string, unknown>[] }
          >(r),
        )
        .then((res) => (Array.isArray(res) ? res : (res?.data ?? []))),

    // POST /courses/:id/materials (owner tutor / admin).
    addMaterial: (
      courseId: string,
      body: Record<string, unknown>,
      token?: string,
    ) =>
      fetch(`${BASE_URL}/courses/${encodeURIComponent(courseId)}/materials`, {
        method: 'POST',
        headers: getHeaders(token),
        body: JSON.stringify(body),
      })
        .then((r) => handleResponse<{ data?: unknown }>(r))
        .then((r) => (r as { data?: unknown }).data ?? r),

    // DELETE /materials/:id (owner tutor / admin).
    removeMaterial: (materialId: string, token?: string) =>
      fetch(`${BASE_URL}/materials/${encodeURIComponent(materialId)}`, {
        method: 'DELETE',
        headers: getHeaders(token),
      })
        .then((r) => handleResponse<{ data?: unknown }>(r))
        .then((r) => (r as { data?: unknown }).data ?? r),

    // POST /materials/:id/complete (student) — recomputes progressPercent.
    completeMaterial: (materialId: string, token?: string) =>
      fetch(`${BASE_URL}/materials/${encodeURIComponent(materialId)}/complete`, {
        method: 'POST',
        headers: getHeaders(token),
        body: JSON.stringify({}),
      })
        .then((r) => handleResponse<{ data?: unknown }>(r))
        .then((r) => (r as { data?: unknown }).data ?? r),
  },

  // Timetable (docs/timetable.md). The wire grid is [day][period] (6 days x 4
  // periods); the UI grid is [period][day] — transpose with gridFromApi() in
  // lib/timetable. Admin/staff edit via adminApi.updateTimetable; this is the
  // any-authenticated read.
  timetable: {
    get: (track: string, token?: string) =>
      fetch(`${BASE_URL}/timetable/${encodeURIComponent(track)}`, {
        headers: getHeaders(token),
      })
        .then((r) => handleResponse<{ data?: unknown }>(r))
        .then((r) => (r as { data?: unknown }).data ?? r),
  },

  // Live classes (docs/timetable.md §Live Classes). Tutors upload the Meet link
  // and flip status; students read `next` to drive the Join button.
  liveClasses: {
    // GET /live-classes/next?track= (any auth) — { status, canJoin, meetLink? }.
    next: (track: string, token?: string) =>
      fetch(`${BASE_URL}/live-classes/next?track=${encodeURIComponent(track)}`, {
        headers: getHeaders(token),
      })
        .then((r) => handleResponse<{ data?: unknown }>(r))
        .then((r) => (r as { data?: unknown }).data ?? r),

    // GET /live-classes?track= (any auth) — list of live-class records.
    list: (track?: string, token?: string) =>
      fetch(
        `${BASE_URL}/live-classes${track ? `?track=${encodeURIComponent(track)}` : ''}`,
        { headers: getHeaders(token) },
      )
        .then((r) =>
          handleResponse<
            Record<string, unknown>[] | { data?: Record<string, unknown>[] }
          >(r),
        )
        .then((res) => (Array.isArray(res) ? res : (res?.data ?? []))),

    // PUT /live-classes/:track/link (tutor / admin) — upload the Meet link.
    uploadLink: (track: string, meetLink: string, token?: string) =>
      fetch(`${BASE_URL}/live-classes/${encodeURIComponent(track)}/link`, {
        method: 'PUT',
        headers: getHeaders(token),
        body: JSON.stringify({ meetLink }),
      })
        .then((r) => handleResponse<{ data?: unknown }>(r))
        .then((r) => (r as { data?: unknown }).data ?? r),

    // PATCH /live-classes/:track/status (tutor / admin) — go live / end.
    // Going live requires a meetLink; ending accepts an optional recordingUrl.
    setStatus: (
      track: string,
      body: { status: string; recordingUrl?: string },
      token?: string,
    ) =>
      fetch(`${BASE_URL}/live-classes/${encodeURIComponent(track)}/status`, {
        method: 'PATCH',
        headers: getHeaders(token),
        body: JSON.stringify(body),
      })
        .then((r) => handleResponse<{ data?: unknown }>(r))
        .then((r) => (r as { data?: unknown }).data ?? r),
  },

  // Assignments, submissions & grades (docs/assignment.md). Assignments are
  // nested under courses; submissions/grades are standalone. Tutors (or admin)
  // create + grade on their own courses; students submit + read their own.
  assignments: {
    // GET /courses/:id/assignments (enrolled student sees published; owner
    // tutor / admin see all).
    listForCourse: (courseId: string, token?: string) =>
      fetch(`${BASE_URL}/courses/${encodeURIComponent(courseId)}/assignments`, {
        headers: getHeaders(token),
      })
        .then((r) =>
          handleResponse<
            Record<string, unknown>[] | { data?: Record<string, unknown>[] }
          >(r),
        )
        .then((res) => (Array.isArray(res) ? res : (res?.data ?? []))),

    // POST /courses/:id/assignments (owner tutor / admin).
    create: (
      courseId: string,
      body: Record<string, unknown>,
      token?: string,
    ) =>
      fetch(`${BASE_URL}/courses/${encodeURIComponent(courseId)}/assignments`, {
        method: 'POST',
        headers: getHeaders(token),
        body: JSON.stringify(body),
      })
        .then((r) => handleResponse<{ data?: unknown }>(r))
        .then((r) => (r as { data?: unknown }).data ?? r),

    // PUT /assignments/:id (owner tutor / admin).
    update: (id: string, body: Record<string, unknown>, token?: string) =>
      fetch(`${BASE_URL}/assignments/${encodeURIComponent(id)}`, {
        method: 'PUT',
        headers: getHeaders(token),
        body: JSON.stringify(body),
      })
        .then((r) => handleResponse<{ data?: unknown }>(r))
        .then((r) => (r as { data?: unknown }).data ?? r),

    // DELETE /assignments/:id (owner tutor / admin) — also deletes submissions.
    remove: (id: string, token?: string) =>
      fetch(`${BASE_URL}/assignments/${encodeURIComponent(id)}`, {
        method: 'DELETE',
        headers: getHeaders(token),
      })
        .then((r) => handleResponse<{ data?: unknown }>(r))
        .then((r) => (r as { data?: unknown }).data ?? r),

    // POST /assignments/:id/submit (student). At least one of text/fileUrl.
    submit: (
      assignmentId: string,
      body: { text?: string; fileUrl?: string },
      token?: string,
    ) =>
      fetch(`${BASE_URL}/assignments/${encodeURIComponent(assignmentId)}/submit`, {
        method: 'POST',
        headers: getHeaders(token),
        body: JSON.stringify(body),
      })
        .then((r) => handleResponse<{ data?: unknown }>(r))
        .then((r) => (r as { data?: unknown }).data ?? r),

    // GET /assignments/:id/submissions (owner tutor / admin) — for grading.
    submissions: (assignmentId: string, token?: string) =>
      fetch(
        `${BASE_URL}/assignments/${encodeURIComponent(assignmentId)}/submissions`,
        { headers: getHeaders(token) },
      )
        .then((r) =>
          handleResponse<
            Record<string, unknown>[] | { data?: Record<string, unknown>[] }
          >(r),
        )
        .then((res) => (Array.isArray(res) ? res : (res?.data ?? []))),

    // GET /submissions/me?assignmentId= (student).
    mySubmissions: (assignmentId?: string, token?: string) =>
      fetch(
        `${BASE_URL}/submissions/me${assignmentId ? `?assignmentId=${encodeURIComponent(assignmentId)}` : ''}`,
        { headers: getHeaders(token) },
      )
        .then((r) =>
          handleResponse<
            Record<string, unknown>[] | { data?: Record<string, unknown>[] }
          >(r),
        )
        .then((res) => (Array.isArray(res) ? res : (res?.data ?? []))),

    // PUT /submissions/:id/grade (owner tutor / admin).
    grade: (
      submissionId: string,
      body: { score: number; feedback?: string },
      token?: string,
    ) =>
      fetch(`${BASE_URL}/submissions/${encodeURIComponent(submissionId)}/grade`, {
        method: 'PUT',
        headers: getHeaders(token),
        body: JSON.stringify(body),
      })
        .then((r) => handleResponse<{ data?: unknown }>(r))
        .then((r) => (r as { data?: unknown }).data ?? r),

    // GET /grades/me (student) — all grades, each with percent.
    myGrades: (token?: string) =>
      fetch(`${BASE_URL}/grades/me`, { headers: getHeaders(token) })
        .then((r) =>
          handleResponse<
            Record<string, unknown>[] | { data?: Record<string, unknown>[] }
          >(r),
        )
        .then((res) => (Array.isArray(res) ? res : (res?.data ?? []))),

    // GET /courses/:id/grades (owner tutor / admin) — the course gradebook
    // (assignment + manual grades) with student info.
    courseGrades: (courseId: string, token?: string) =>
      fetch(`${BASE_URL}/courses/${encodeURIComponent(courseId)}/grades`, {
        headers: getHeaders(token),
      })
        .then((r) =>
          handleResponse<
            Record<string, unknown>[] | { data?: Record<string, unknown>[] }
          >(r),
        )
        .then((res) => (Array.isArray(res) ? res : (res?.data ?? []))),

    // POST /courses/:id/grades (owner tutor / admin) — record a manual grade
    // ({studentId,title,score,maxScore,feedback}) or a batch ({grades:[...]}).
    recordGrades: (
      courseId: string,
      body: Record<string, unknown>,
      token?: string,
    ) =>
      fetch(`${BASE_URL}/courses/${encodeURIComponent(courseId)}/grades`, {
        method: 'POST',
        headers: getHeaders(token),
        body: JSON.stringify(body),
      })
        .then((r) => handleResponse<{ data?: unknown }>(r))
        .then((r) => (r as { data?: unknown }).data ?? r),

    // PUT /grades/:id (owner tutor / admin) — correct a grade.
    updateGrade: (id: string, body: Record<string, unknown>, token?: string) =>
      fetch(`${BASE_URL}/grades/${encodeURIComponent(id)}`, {
        method: 'PUT',
        headers: getHeaders(token),
        body: JSON.stringify(body),
      })
        .then((r) => handleResponse<{ data?: unknown }>(r))
        .then((r) => (r as { data?: unknown }).data ?? r),
  },

  // Analytics — computed from grades, enrollments, submissions & attendance
  // (docs/analytics.md). Students read their own; tutors (or admin) read theirs.
  analytics: {
    // GET /analytics/me (student).
    me: (token?: string) =>
      fetch(`${BASE_URL}/analytics/me`, { headers: getHeaders(token) })
        .then((r) => handleResponse<{ data?: unknown }>(r))
        .then((r) => (r as { data?: unknown }).data ?? r),

    // GET /tutors/me/analytics (tutor / admin) — dashboard overview.
    tutorOverview: (token?: string) =>
      fetch(`${BASE_URL}/tutors/me/analytics`, { headers: getHeaders(token) })
        .then((r) => handleResponse<{ data?: unknown }>(r))
        .then((r) => (r as { data?: unknown }).data ?? r),

    // GET /tutors/me/students (tutor / admin) — roster with avg + progress.
    tutorStudents: (token?: string) =>
      fetch(`${BASE_URL}/tutors/me/students`, { headers: getHeaders(token) })
        .then((r) =>
          handleResponse<
            Record<string, unknown>[] | { data?: Record<string, unknown>[] }
          >(r),
        )
        .then((res) => (Array.isArray(res) ? res : (res?.data ?? []))),

    // GET /courses/:id/analytics (owner tutor / admin) — one course.
    course: (courseId: string, token?: string) =>
      fetch(`${BASE_URL}/courses/${encodeURIComponent(courseId)}/analytics`, {
        headers: getHeaders(token),
      })
        .then((r) => handleResponse<{ data?: unknown }>(r))
        .then((r) => (r as { data?: unknown }).data ?? r),
  },

  // Announcements. The backend supports GET (server-filtered: a student sees
  // global + their track) and POST (tutor/admin broadcast). There is no delete
  // or read-state endpoint, so read tracking stays client-side.
  announcements: {
    // GET /announcements?scope=&track= — students get their relevant set
    // server-side; tutors/admin can filter.
    list: (
      params: { scope?: string; track?: string } = {},
      token?: string,
    ) => {
      const qs = new URLSearchParams()
      if (params.scope) qs.set('scope', params.scope)
      if (params.track) qs.set('track', params.track)
      const q = qs.toString()
      return fetch(`${BASE_URL}/announcements${q ? `?${q}` : ''}`, {
        headers: getHeaders(token),
      })
        .then((r) =>
          handleResponse<
            Record<string, unknown>[] | { data?: Record<string, unknown>[] }
          >(r),
        )
        .then((res) => (Array.isArray(res) ? res : (res?.data ?? [])))
    },

    // POST /announcements (tutor / admin). scope 'global' | 'track' (+ track).
    create: (body: Record<string, unknown>, token?: string) =>
      fetch(`${BASE_URL}/announcements`, {
        method: 'POST',
        headers: getHeaders(token),
        body: JSON.stringify(body),
      })
        .then((r) => handleResponse<{ data?: unknown }>(r))
        .then((r) => (r as { data?: unknown }).data ?? r),
  },

  // Notifications — a per-user inbox with server-side read state. Populated by
  // the backend from announcements, attendance opens, grades, etc.
  notifications: {
    // GET /notifications — the logged-in user's notifications, newest first.
    list: (token?: string) =>
      fetch(`${BASE_URL}/notifications`, { headers: getHeaders(token) })
        .then((r) =>
          handleResponse<
            Record<string, unknown>[] | { data?: Record<string, unknown>[] }
          >(r),
        )
        .then((res) => (Array.isArray(res) ? res : (res?.data ?? []))),

    // PATCH /notifications/:id/read — mark one read.
    markRead: (id: string, token?: string) =>
      fetch(`${BASE_URL}/notifications/${encodeURIComponent(id)}/read`, {
        method: 'PATCH',
        headers: getHeaders(token),
      })
        .then((r) => handleResponse<{ data?: unknown }>(r))
        .then((r) => (r as { data?: unknown }).data ?? r),

    // PATCH /notifications/read-all — mark every notification read.
    markAllRead: (token?: string) =>
      fetch(`${BASE_URL}/notifications/read-all`, {
        method: 'PATCH',
        headers: getHeaders(token),
      })
        .then((r) => handleResponse<{ data?: unknown }>(r))
        .then((r) => (r as { data?: unknown }).data ?? r),
  },

  // Uploads. POST /uploads/sign returns a signed target. NOTE: the backend's
  // object storage is a stub right now — it returns `uploadUrl: null` and asks
  // callers to pass an external URL instead (see uploadFile below).
  uploads: {
    sign: (
      body: { filename: string; contentType?: string; folder?: string },
      token?: string,
    ) =>
      fetch(`${BASE_URL}/uploads/sign`, {
        method: 'POST',
        headers: getHeaders(token),
        body: JSON.stringify(body),
      })
        .then((r) => handleResponse<{ data?: unknown }>(r))
        .then((r) => (r as { data?: unknown }).data ?? r),
  },
}

/**
 * Upload a file via the signed-URL flow and return its hosted URL.
 *
 * Forward-compatible: it asks the backend for a signed PUT target and uploads
 * to it. TODAY the backend's storage is not configured (`uploadUrl` is null),
 * so this throws a clear, actionable error and callers should fall back to a
 * pasted external link. The moment object storage is enabled, this starts
 * working with no further code change.
 */
export async function uploadFile(
  file: File,
  folder = 'uploads',
  token?: string,
): Promise<string> {
  const meta = (await dsaApi.uploads.sign(
    {
      filename: file.name,
      contentType: file.type || 'application/octet-stream',
      folder,
    },
    token,
  )) as { uploadUrl?: string | null; fileUrl?: string; message?: string }

  if (!meta.uploadUrl) {
    throw new Error(
      'Direct upload isn’t enabled on the server yet. Host the file (Google Drive, Dropbox, OneDrive…), set it to “anyone with the link”, and paste that link below.',
    )
  }

  const put = await fetch(meta.uploadUrl, {
    method: 'PUT',
    headers: { 'Content-Type': file.type || 'application/octet-stream' },
    body: file,
  })
  if (!put.ok) {
    throw new Error('Upload failed. Please try again or paste a link instead.')
  }
  return meta.fileUrl || ''
}
