// Frontend gates for the quiz create / delete controls, based on the staff
// permission keys (quizzes.create / quizzes.delete / quizzes.manage).
//
// Only `role: 'staff'` is gated on the permission — admins, super-admins and
// tutors have quiz access inherently, and an unknown/unresolved user is allowed
// so we never hide a control from a legitimate operator. The backend is the real
// guard (see docs/backend-request-quiz-permissions.md); this is UX only.

import { getUser } from './auth'
import { getRole as getStaffRole } from './staffStore'
import type { User } from './types'

function permissionsOf(u: User | null): string[] {
  if (!u) return []
  if (Array.isArray(u.permissions)) return u.permissions // backend-provided
  if (u.staffRoleId) return getStaffRole(u.staffRoleId)?.permissions ?? []
  return []
}

function allowed(required: string): boolean {
  const u = getUser() as User | null
  // Non-staff (admin / super_admin / tutor / unknown) are not gated here.
  if (u?.role !== 'staff') return true
  const p = permissionsOf(u)
  return p.includes(required) || p.includes('quizzes.manage')
}

/** Can the current user create/publish a quiz? */
export function canCreateQuiz(): boolean {
  return allowed('quizzes.create')
}

/** Can the current user delete a quiz? */
export function canDeleteQuiz(): boolean {
  return allowed('quizzes.delete')
}
