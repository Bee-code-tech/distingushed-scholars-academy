// Centralized API client for DSA backend
// Provides clean interface, robust error handling, and environment-aware routing.

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  'https://www.api.distinguishedscholarsacademy.com/api'

/**
 * Helper to handle API responses and errors.
 * Ensures that even non-JSON errors (like 502/404) are caught without crashing.
 */
async function handleResponse(response: Response) {
  const contentType = response.headers.get('content-type')
  let data = null

  if (contentType && contentType.includes('application/json')) {
    data = await response.json()
  }

  if (!response.ok) {
    // Look for message in JSON, otherwise fallback to status text
    const errorMessage =
      data?.message ||
      data?.error ||
      `Error ${response.status}: ${response.statusText}`
    throw new Error(errorMessage)
  }

  return data
}

/**
 * Helper to get token safely in client-side environment
 */
const getStoredToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('dsa_token')
  }
  return null
}

/**
 * Helper to generate default headers including Auth
 */
const getHeaders = (token?: string, isJson = true) => {
  const headers: HeadersInit = {}
  if (isJson) headers['Content-Type'] = 'application/json'

  const activeToken = token || getStoredToken()
  if (activeToken) {
    headers['Authorization'] = `Bearer ${activeToken}`
  }
  return headers
}

export const dsaApi = {
  auth: {
    register: (payload: any) =>
      fetch(`${BASE_URL}/auth/register`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(payload),
      }).then(handleResponse),

    verifyOtp: (email: string, otp: string) =>
      fetch(`${BASE_URL}/auth/verify-otp`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ email, otp }),
      }).then(handleResponse),

    login: (payload: any) =>
      fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(payload),
      }).then(handleResponse),

    forgotPassword: (email: string) =>
      fetch(`${BASE_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ email }),
      }).then(handleResponse),

    resetPassword: (payload: { newPassword: string; token: string }) =>
      fetch(`${BASE_URL}/auth/reset-password/${payload.token}`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ newPassword: payload.newPassword }),
      }).then(handleResponse),

    getProfile: (token?: string) =>
      fetch(`${BASE_URL}/auth/profile`, {
        method: 'GET',
        headers: getHeaders(token),
      }).then(handleResponse),
  },

  quizzes: {
    create: (payload: any, token?: string) =>
      fetch(`${BASE_URL}/quizzes`, {
        method: 'POST',
        headers: getHeaders(token),
        body: JSON.stringify(payload),
      }).then(handleResponse),

    getByLink: (link: string, token?: string) =>
      fetch(`${BASE_URL}/quizzes/link/${link}`, {
        method: 'GET',
        headers: getHeaders(token),
      }).then(handleResponse),

    verifyCode: (
      payload: { link: string; accessCode: string },
      token?: string,
    ) =>
      fetch(`${BASE_URL}/quizzes/verify-code`, {
        method: 'POST',
        headers: getHeaders(token),
        body: JSON.stringify(payload),
      }).then(handleResponse),

    submit: (
      id: string,
      payload: { timeTaken: number; answers: any[] },
      token?: string,
    ) =>
      fetch(`${BASE_URL}/quizzes/${id}/submit`, {
        method: 'POST',
        headers: getHeaders(token),
        body: JSON.stringify(payload),
      }).then(handleResponse),

    getLeaderboard: (id: string, token?: string) =>
      fetch(`${BASE_URL}/quizzes/${id}/leaderboard`, {
        method: 'GET',
        headers: getHeaders(token),
      }).then(handleResponse),
  },

  programs: {
    create: (payload: { name: string; endDate: string }, token?: string) =>
      fetch(`${BASE_URL}/programs`, {
        method: 'POST',
        headers: getHeaders(token),
        body: JSON.stringify(payload),
      }).then(handleResponse),

    getAll: () =>
      fetch(`${BASE_URL}/programs`, {
        method: 'GET',
        headers: getHeaders(),
      }).then(handleResponse),
  },
}
