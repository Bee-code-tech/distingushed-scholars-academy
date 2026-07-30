// Static demo logins — one per student "role" (exam track × study mode).
//
// PURPOSE: let the owner preview every dashboard variant without a running
// backend. These are resolved entirely client-side by the sign-in page; no
// network call is made and no real data is exposed.
//
// SAFE TO DELETE once the real backend is connected. Nothing else depends on
// this file except the demo branch in the sign-in page and the dashboard.

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
  {
    email: 'jamb.online@dsa.demo',
    password: PASSWORD,
    profile: {
      email: 'jamb.online@dsa.demo',
      username: 'jamb_online',
      fullName: 'Ada (JAMB · Online)',
      role: 'student',
      level: 'jamb',
      isDsaStudent: false,
      isDSAite: false,
    },
  },
  {
    email: 'jamb.campus@dsa.demo',
    password: PASSWORD,
    profile: {
      email: 'jamb.campus@dsa.demo',
      username: 'jamb_campus',
      fullName: 'Bola (JAMB · On-Campus)',
      role: 'student',
      level: 'jamb',
      isDsaStudent: true,
      isDSAite: true,
    },
  },
  {
    email: 'waec.online@dsa.demo',
    password: PASSWORD,
    profile: {
      email: 'waec.online@dsa.demo',
      username: 'waec_online',
      fullName: 'Chidi (WAEC · Online)',
      role: 'student',
      level: 'waec',
      subjectsOfInterest: ['science'],
      isDsaStudent: false,
      isDSAite: false,
    },
  },
  {
    email: 'waec.campus@dsa.demo',
    password: PASSWORD,
    profile: {
      email: 'waec.campus@dsa.demo',
      username: 'waec_campus',
      fullName: 'Dupe (WAEC · On-Campus)',
      role: 'student',
      level: 'waec',
      subjectsOfInterest: ['commercial'],
      isDsaStudent: true,
      isDSAite: true,
    },
  },
  {
    email: 'postutme.online@dsa.demo',
    password: PASSWORD,
    profile: {
      email: 'postutme.online@dsa.demo',
      username: 'postutme_online',
      fullName: 'Emeka (Post-UTME · Online)',
      role: 'student',
      level: 'post utme',
      isDsaStudent: false,
      isDSAite: false,
    },
  },
  {
    email: 'postutme.campus@dsa.demo',
    password: PASSWORD,
    profile: {
      email: 'postutme.campus@dsa.demo',
      username: 'postutme_campus',
      fullName: 'Funke (Post-UTME · On-Campus)',
      role: 'student',
      level: 'post utme',
      isDsaStudent: true,
      isDSAite: true,
    },
  },
  {
    email: 'tutor@dsa.demo',
    password: PASSWORD,
    profile: {
      email: 'tutor@dsa.demo',
      username: 'tutor_demo',
      fullName: 'Mr. Timilehin (Tutor)',
      role: 'tutor',
    },
  },
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
