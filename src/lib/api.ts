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

  // Attendance — self check-in flow (docs/attendance.md). Each returns the
  // unwrapped `data` payload.
  attendance: {
    current: (token?: string) =>
      fetch(`${BASE_URL}/attendance/sessions/current`, { headers: getHeaders(token) })
        .then((r) => handleResponse<{ data?: unknown }>(r))
        .then((r) => (r as { data?: unknown }).data ?? r),

    activate: (body: { date?: string; courseId?: string } = {}, token?: string) =>
      fetch(`${BASE_URL}/attendance/sessions`, {
        method: 'POST',
        headers: getHeaders(token),
        body: JSON.stringify(body),
      })
        .then((r) => handleResponse<{ data?: unknown }>(r))
        .then((r) => (r as { data?: unknown }).data ?? r),

    close: (date: string, token?: string) =>
      fetch(`${BASE_URL}/attendance/sessions/${encodeURIComponent(date)}`, {
        method: 'DELETE',
        headers: getHeaders(token),
      })
        .then((r) => handleResponse<{ data?: unknown }>(r))
        .then((r) => (r as { data?: unknown }).data ?? r),

    checkIn: (token?: string) =>
      fetch(`${BASE_URL}/attendance/check-in`, {
        method: 'POST',
        headers: getHeaders(token),
        body: JSON.stringify({}),
      })
        .then((r) => handleResponse<{ data?: unknown }>(r))
        .then((r) => (r as { data?: unknown }).data ?? r),

    checkIns: (date?: string, token?: string) =>
      fetch(`${BASE_URL}/attendance/check-ins${date ? `?date=${encodeURIComponent(date)}` : ''}`, {
        headers: getHeaders(token),
      })
        .then((r) => handleResponse<Record<string, unknown>[] | { data?: Record<string, unknown>[] }>(r))
        .then((res) => (Array.isArray(res) ? res : (res?.data ?? []))),

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
  },
}
