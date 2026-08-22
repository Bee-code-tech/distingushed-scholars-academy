// src/lib/admin-auth.ts

export type AdminRole =
  | 'admin'
  | 'super_admin'
  | 'tutor'
  | 'staff'
  | 'parent'
  | string

export interface LoginResponse {
  token?: string
  accessToken?: string
  role?: string
  user?: {
    id?: string
    email?: string
    name?: string
    role?: string
    [key: string]: any
  }
  data?: {
    token?: string
    accessToken?: string
    user?: any
    [key: string]: any
  }
  [key: string]: any // Fallback index signature for dynamic backend payloads
}

export interface GuardianInfo {
  fullname?: string
  email?: string
  phoneNumber?: string
}

export interface AdminUser {
  id?: string // Changed to optional to allow flexible API responses
  studentId?: string
  fullname?: string
  fullName?: string
  email?: string // Changed to optional to allow flexible API responses
  phoneNumber?: string
  phone?: string
  whatsappNumber?: string
  profilePic?: string
  avatarUrl?: string
  gender?: string
  dateOfBirth?: string
  stateOfResidence?: string
  institution?: string
  school?: string
  currentLevel?: string
  level?: string
  learningMode?: string
  studyMode?: string
  isDsaStudent?: boolean
  programmes?: string[]
  subjectsOfInterest?: string[]
  guardianInfo?: GuardianInfo
  role?: AdminRole
  status?: string
  isVerified?: boolean
  isPaid?: boolean
  examTrack?: string
  examType?: string
  createdAt?: string
  updatedAt?: string
  [key: string]: any
}

export interface AdminSession {
  token: string
  role: AdminRole
  user: AdminUser | null
}

const TOKEN_KEY = 'admin_token'
const USER_KEY = 'admin_user'
const ROLE_KEY = 'admin_role'

export const ADMIN_BYPASS_ENABLED =
  process.env.NEXT_PUBLIC_ENABLE_ADMIN_BYPASS === 'true'

export const DEV_ADMIN_EMAIL =
  process.env.NEXT_PUBLIC_DEV_ADMIN_EMAIL || 'fawwasolajide@gmail.com'

/**
 * List of roles allowed to access /admin routes
 */
export const ALLOWED_ADMIN_ROLES = ['admin', 'super_admin', 'tutor', 'staff']

/**
 * Helper to determine secure flag for cookies based on environment
 */
function getCookieSecurityFlag(): string {
  if (typeof window === 'undefined') return ''
  return window.location.protocol === 'https:' ? '; Secure' : ''
}

/**
 * Persist administrative session to localStorage AND cookies
 */
export function setAdminSession(params: {
  token: string
  user?: AdminUser | Record<string, any> | null
  role?: AdminRole
}): void {
  if (typeof window === 'undefined') return

  const user = params.user || null
  const role = (params.role || user?.role || 'admin').toString().toLowerCase()

  // Sync to localStorage
  localStorage.setItem(TOKEN_KEY, params.token)
  localStorage.setItem('token', params.token)
  localStorage.setItem(ROLE_KEY, role)

  if (user) {
    localStorage.setItem(USER_KEY, JSON.stringify(user))
  }

  // Set Cookies for Middleware & SSR (24 Hours TTL)
  const secureFlag = getCookieSecurityFlag()
  document.cookie = `admin_token=${params.token}; path=/; max-age=86400; SameSite=Lax${secureFlag}`
  document.cookie = `admin_role=${role}; path=/; max-age=86400; SameSite=Lax${secureFlag}`
}

/**
 * Retrieve active administrative session from localStorage
 */
export function getAdminSession(): AdminSession | null {
  if (typeof window === 'undefined') return null

  const token = localStorage.getItem(TOKEN_KEY) || localStorage.getItem('token')
  if (!token) return null

  const userStr = localStorage.getItem(USER_KEY)
  let user: AdminUser | null = null

  if (userStr) {
    try {
      user = JSON.parse(userStr)
    } catch {
      user = null
    }
  }

  const storedRole = localStorage.getItem(ROLE_KEY)
  const role = (storedRole || user?.role || 'admin').toLowerCase()

  return {
    token,
    role,
    user,
  }
}

/**
 * Retrieve current active admin token
 */
export function getAdminToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(TOKEN_KEY) || localStorage.getItem('token')
}

/**
 * Retrieve current active admin user object
 */
export function getAdminUser(): AdminUser | null {
  const session = getAdminSession()
  return session?.user || null
}

/**
 * Clear administrative session and purge credentials/cookies
 */
export function clearAdminSession(): void {
  if (typeof window === 'undefined') return

  // Admin keys
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
  localStorage.removeItem(ROLE_KEY)
  localStorage.removeItem('token')
  // Student/shared keys too — otherwise a stale session survives admin logout
  // and the /auth/signin & /auth/signup guards bounce the user back to /admin
  // (→ /adminLogin) via dashboardPathForRole.
  localStorage.removeItem('dsa_token')
  localStorage.removeItem('dsa_user')
  localStorage.removeItem('user_role')

  const expiredDate = 'Thu, 01 Jan 1970 00:00:00 GMT'
  document.cookie = `admin_token=; path=/; expires=${expiredDate}`
  document.cookie = `admin_role=; path=/; expires=${expiredDate}`
}

/**
 * Alias for clearAdminSession to support generic auth imports
 */
export const clearSession = clearAdminSession

/**
 * Helper to check if user has an authorized admin role
 */
export function isAdminAuthenticated(): boolean {
  if (ADMIN_BYPASS_ENABLED) return true

  const session = getAdminSession()
  if (!session?.token) return false

  const userRole = (session.role || session.user?.role || '')
    .toString()
    .toLowerCase()
  return ALLOWED_ADMIN_ROLES.includes(userRole)
}

/**
 * Main guard check used across admin components and layouts
 */
export function isAdmin(): boolean {
  if (typeof window === 'undefined') return false
  return isAdminAuthenticated()
}
