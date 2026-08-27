// Instant duplicate-email check for the admin create forms.
//
// Email/username/phone are unique across ALL users (student, tutor, parent,
// staff), so to warn the admin *before* they submit we pull every role's emails
// once and check against the set. The backend uniqueness constraint is still the
// authoritative gate — this is a UX head-start, not a replacement.

import { dsaApi } from './api'

/** Read the admin JWT the admin panel stores. */
export function adminToken(): string | undefined {
  if (typeof window === 'undefined') return undefined
  return (
    localStorage.getItem('admin_token') ||
    localStorage.getItem('token') ||
    undefined
  )
}

/** Every existing account email (lower-cased), across all roles. */
export async function fetchExistingEmails(token?: string): Promise<Set<string>> {
  const roles = ['student', 'tutor', 'parent', 'staff'] as const
  const set = new Set<string>()
  const results = await Promise.allSettled(
    roles.map(
      (r) =>
        dsaApi.admin.listUsers(r, token) as Promise<Record<string, unknown>[]>,
    ),
  )
  for (const res of results) {
    if (res.status === 'fulfilled' && Array.isArray(res.value)) {
      for (const u of res.value) {
        const e = String(u.email ?? '')
          .trim()
          .toLowerCase()
        if (e) set.add(e)
      }
    }
  }
  return set
}
