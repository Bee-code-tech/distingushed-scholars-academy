// Centralized client-side auth/session helpers.
//
// IMPORTANT: this is UX-level gating only. It decides what the browser shows.
// Real security MUST be enforced by the backend on every request via the JWT.
// Never trust `getRole()` / `isAdmin()` for anything that protects data.

import type { User, UserRole } from './types'

const TOKEN_KEY = 'dsa_token'
const USER_KEY = 'dsa_user'
const ROLE_KEY = 'user_role'
const REMEMBER_EMAIL_KEY = 'dsa_remembered_email'
const ADMIN_COOKIE = 'admin_token'

const isBrowser = () => typeof window !== 'undefined'

export function getToken(): string | null {
  if (!isBrowser()) return null
  return localStorage.getItem(TOKEN_KEY)
}

export function getRole(): UserRole | null {
  if (!isBrowser()) return null
  return (localStorage.getItem(ROLE_KEY) as UserRole) || null
}

export function getUser(): User | null {
  if (!isBrowser()) return null
  const raw = localStorage.getItem(USER_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as User
  } catch {
    return null
  }
}

export function isAuthenticated(): boolean {
  return !!getToken()
}

export function isAdmin(): boolean {
  const role = getRole()
  return role === 'admin' || role === 'super_admin'
}

/** Persist a successful login. Also sets the cookie the middleware reads. */
export function setSession(params: {
  token: string
  user?: User | null
  role?: UserRole
}): void {
  if (!isBrowser()) return
  const { token, user, role } = params
  localStorage.setItem(TOKEN_KEY, token)
  if (user) localStorage.setItem(USER_KEY, JSON.stringify(user))
  const resolvedRole = role || user?.role || 'student'
  localStorage.setItem(ROLE_KEY, resolvedRole)
  // Cookie is what middleware.ts checks for route protection.
  document.cookie = `${ADMIN_COOKIE}=true; path=/; max-age=3600; SameSite=Lax`
}

/** Clear all session state (logout, or an invalid/expired token). */
export function clearSession(): void {
  if (!isBrowser()) return
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
  localStorage.removeItem(ROLE_KEY)
  document.cookie = `${ADMIN_COOKIE}=; path=/; max-age=0; SameSite=Lax`
}

export function rememberEmail(email: string, remember: boolean): void {
  if (!isBrowser()) return
  if (remember) localStorage.setItem(REMEMBER_EMAIL_KEY, email)
  else localStorage.removeItem(REMEMBER_EMAIL_KEY)
}

export function getRememberedEmail(): string | null {
  if (!isBrowser()) return null
  return localStorage.getItem(REMEMBER_EMAIL_KEY)
}

/**
 * Dev-only admin bypass. Off by default; enable in a local .env with
 * NEXT_PUBLIC_ENABLE_ADMIN_BYPASS=true. NEVER enable in production — the
 * backend should own admin auth. Kept only so the panel is reachable while
 * the real admin login endpoint is being built.
 */
export const ADMIN_BYPASS_ENABLED =
  process.env.NEXT_PUBLIC_ENABLE_ADMIN_BYPASS === 'true'

export const DEV_ADMIN_EMAIL = 'admin@dsa.com'
