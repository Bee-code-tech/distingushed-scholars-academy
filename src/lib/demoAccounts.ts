// Static demo logins for roles the backend can't create yet.
//
// PURPOSE: let the owner preview the tutor and guardian dashboards without a
// backend for those roles. Resolved entirely client-side by the sign-in page as
// a FALLBACK after the real API login fails (see the sign-in page + memory
// "everything-live").
//
// NOTE: student demo logins were removed — students are LIVE now (real
// register/login/verify-otp against the backend), so there's no fake student
// account. Delete this file entirely once tutor & guardian have real backend
// auth too.

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

// One shared password keeps it easy to demo. Change here if needed.
const PASSWORD = 'demo1234'

export const DEMO_ACCOUNTS: DemoAccount[] = [
  // Tutors are real now (admin-created, real backend login), so the demo tutor
  // login is removed. Guardian has no backend flow yet, so its demo login stays.
  {
    email: 'guardian@dsa.demo',
    password: PASSWORD,
    profile: {
      email: 'guardian@dsa.demo',
      username: 'guardian_demo',
      fullName: 'Mrs. Adeyemi (Guardian)',
      role: 'parent',
    },
  },
]

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
