// Static demo logins for roles the backend can't create yet.
//
// PURPOSE: let the owner preview the tutor and guardian dashboards without a
// backend for those roles. Resolved entirely client-side by the sign-in page as
// a FALLBACK after the real API login fails (see the sign-in page + memory
// "everything-live").
//
// NOTE: student, tutor AND guardian demo logins were all removed — those roles
// are LIVE now (real backend register/login/verify-otp; guardians authenticate
// and read their ward via /parents/me/wards). No seeded accounts remain here.
// The demo-token plumbing (isDemoToken) is kept only so any lingering demo
// session degrades safely; this file can be deleted once nothing imports it.

import type { User } from './types'

/** A demo session token is prefixed so the dashboard knows to skip the API. */
export const DEMO_TOKEN_PREFIX = 'demo:'

export function isDemoToken(token?: string | null): boolean {
  return !!token && token.startsWith(DEMO_TOKEN_PREFIX)
}

export interface DemoAccount {
  email: string
  password: string
  profile: User
}

// Tutors and guardians are real now (admin-created tutors; guardians linked to
// their ward on the backend), so there are no seeded demo logins.
export const DEMO_ACCOUNTS: DemoAccount[] = []

/** Match typed credentials against the demo list (case-insensitive email). */
export function findDemoAccount(
  email: string,
  password: string,
): DemoAccount | undefined {
  const e = email.trim().toLowerCase()
  return DEMO_ACCOUNTS.find(
    (a) => a.email.toLowerCase() === e && a.password === password,
  )
}
