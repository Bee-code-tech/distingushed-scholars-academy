// Centralized API client for the DSA / Quiz360Pro backend.
// Single source of truth for network access: base URL, auth headers,
// error handling, and automatic logout on expired sessions.

import type {
  AuthResponse,
  LoginPayload,
  RegisterPayload,
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
const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  'https://api.distinguishedscholarsacademy.com/api'

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

export const dsaApi = {
  auth: {
    register: (payload: RegisterPayload) =>
      fetch(`${BASE_URL}/auth/register`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(payload),
      }).then((r) => handleResponse<AuthResponse | { message: string }>(r)),

    sendOtp: (email: string) =>
      fetch(`${BASE_URL}/auth/send-otp`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ email }),
      }).then((r) => handleResponse<{ message: string }>(r)),

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

    getProfile: (token?: string) =>
      fetch(`${BASE_URL}/auth/profile`, {
        method: 'GET',
        headers: getHeaders(token),
      }).then((r) => handleResponse<User>(r)),
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

    getAll: () =>
      fetch(`${BASE_URL}/programs`, {
        method: 'GET',
        headers: getHeaders(),
      }).then((r) => handleResponse<Program[]>(r)),
  },
}
