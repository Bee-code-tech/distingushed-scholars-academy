// Admin-managed staff roles & permissions — browser-local stand-in for the
// backend (see docs/backend-requests.md §9). The real system must store staff
// accounts + a role→permissions model and enforce every permission SERVER-SIDE.
// This file only mocks it so the admin UI is fully clickable today.
//
// Same-browser only: staff created here live in localStorage until the backend
// exposes `POST /api/admin/staff` and a permissions API.

// ---- Permission catalogue -------------------------------------------------
// Grouped so the UI can render modules. `key` is what the backend would check
// (e.g. only a role holding `payments.verify` may confirm a manual payment).

export interface Permission {
  key: string
  label: string
  module: string
  sensitive?: boolean // shown with a lock; money / staff-level actions
}

export const PERMISSIONS: Permission[] = [
  { key: 'payments.verify', label: 'Verify manual payments', module: 'Finance', sensitive: true },
  { key: 'payments.view', label: 'View payments & revenue', module: 'Finance' },
  { key: 'timetable.edit', label: 'Create / edit timetable', module: 'Academics' },
  { key: 'timetable.view', label: 'View timetable', module: 'Academics' },
  { key: 'attendance.manage', label: 'Activate / close attendance', module: 'Academics' },
  { key: 'students.manage', label: 'Manage student records', module: 'Students' },
  { key: 'students.view', label: 'View students', module: 'Students' },
  { key: 'announcements.send', label: 'Send announcements', module: 'Engagement' },
  { key: 'reports.view', label: 'View reports & analytics', module: 'Engagement' },
  { key: 'staff.manage', label: 'Create / manage staff', module: 'System', sensitive: true },
]

export const PERMISSION_MODULES = Array.from(
  new Set(PERMISSIONS.map((p) => p.module)),
)

export function permissionLabel(key: string): string {
  return PERMISSIONS.find((p) => p.key === key)?.label ?? key
}

// ---- Roles ----------------------------------------------------------------
// Roles are DATA, not a hardcoded enum — the admin can add new ones. The two
// below are seeded examples the client asked for (secretary, auditor).

export interface StaffRole {
  id: string
  name: string
  permissions: string[]
  seeded?: boolean // seeded roles can be edited but not deleted
}

const SEED_ROLES: StaffRole[] = [
  {
    id: 'secretary',
    name: 'Secretary',
    seeded: true,
    permissions: [
      'payments.verify',
      'timetable.edit',
      'timetable.view',
      'attendance.manage',
      'students.manage',
      'students.view',
      'announcements.send',
    ],
  },
  {
    id: 'auditor',
    name: 'Auditor',
    seeded: true,
    permissions: ['payments.view', 'reports.view', 'students.view', 'timetable.view'],
  },
]

// ---- Staff accounts -------------------------------------------------------

export interface StaffMember {
  id: string
  name: string
  email: string
  roleId: string
  password: string // demo stand-in; the backend must hash & never return it
  createdAt: string // ISO
  seeded?: boolean // seeded accounts can't be removed
}

const ROLES_KEY = 'dsa_staff_roles'
const STAFF_KEY = 'dsa_staff_members'

// Seeded staff so the owner can preview the staff dashboard with one click,
// on every device (like the demo student logins). Password matches the other
// demos. Admin-created staff live only in this browser until the backend exists.
const DEMO_PASSWORD = 'demo1234'
const SEED_STAFF: StaffMember[] = [
  {
    id: 'demo-secretary',
    name: 'Grace Okon',
    email: 'secretary@dsa.demo',
    roleId: 'secretary',
    password: DEMO_PASSWORD,
    createdAt: '2026-01-01T00:00:00.000Z',
    seeded: true,
  },
  {
    id: 'demo-auditor',
    name: 'Sam Udo',
    email: 'auditor@dsa.demo',
    roleId: 'auditor',
    password: DEMO_PASSWORD,
    createdAt: '2026-01-01T00:00:00.000Z',
    seeded: true,
  },
]

function read<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

function write(key: string, value: unknown): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(key, JSON.stringify(value))
}

// Deterministic id (no Math.random / Date.now in render paths). Time is fine
// inside an event handler, but we keep it simple + collision-resistant enough.
function slugId(name: string): string {
  const base = name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
  return base || 'role'
}

// ---- Roles API ------------------------------------------------------------

/** Seeded roles merged with any admin-created / admin-edited roles. */
export function getRoles(): StaffRole[] {
  const stored = read<StaffRole[]>(ROLES_KEY, [])
  const byId = new Map<string, StaffRole>()
  for (const r of SEED_ROLES) byId.set(r.id, r)
  // Stored entries override the seed (so edited permissions persist) and add new roles.
  for (const r of stored) {
    if (r?.id) byId.set(r.id, { ...r, seeded: byId.get(r.id)?.seeded })
  }
  return Array.from(byId.values())
}

export function getRole(id: string): StaffRole | undefined {
  return getRoles().find((r) => r.id === id)
}

/** Create a new role or overwrite an existing one's permissions. */
export function saveRole(role: { id?: string; name: string; permissions: string[] }): StaffRole {
  const id = role.id || slugId(role.name)
  const stored = read<StaffRole[]>(ROLES_KEY, [])
  const next = stored.filter((r) => r.id !== id)
  const saved: StaffRole = { id, name: role.name, permissions: role.permissions }
  write(ROLES_KEY, [...next, saved])
  return saved
}

/** Delete a non-seeded role (and detach it from any staff). */
export function deleteRole(id: string): void {
  if (SEED_ROLES.some((r) => r.id === id)) return
  write(
    ROLES_KEY,
    read<StaffRole[]>(ROLES_KEY, []).filter((r) => r.id !== id),
  )
}

// ---- Staff API ------------------------------------------------------------

/** Seeded demo staff merged with any admin-created accounts (seed wins by id). */
export function getStaff(): StaffMember[] {
  const stored = read<StaffMember[]>(STAFF_KEY, [])
  const seedIds = new Set(SEED_STAFF.map((s) => s.id))
  const seedEmails = new Set(SEED_STAFF.map((s) => s.email))
  const extras = stored.filter(
    (s) => s?.id && !seedIds.has(s.id) && !seedEmails.has(s.email),
  )
  return [...SEED_STAFF, ...extras]
}

/** Add a staff member. Returns null if the email already exists. */
export function addStaff(input: {
  name: string
  email: string
  roleId: string
  password: string
  now: number // pass Date.now() from the event handler
}): StaffMember | null {
  const email = input.email.trim().toLowerCase()
  if (getStaff().some((s) => s.email === email)) return null
  const stored = read<StaffMember[]>(STAFF_KEY, [])
  const member: StaffMember = {
    id: `${slugId(input.name)}-${input.now.toString(36)}`,
    name: input.name.trim(),
    email,
    roleId: input.roleId,
    password: input.password,
    createdAt: new Date(input.now).toISOString(),
  }
  write(STAFF_KEY, [...stored, member])
  return member
}

export function removeStaff(id: string): void {
  if (SEED_STAFF.some((s) => s.id === id)) return // seeded demo accounts stay
  write(
    STAFF_KEY,
    read<StaffMember[]>(STAFF_KEY, []).filter((s) => s.id !== id),
  )
}

// ---- Login & permission resolution (browser-local stand-in) ---------------

/** The seeded demo staff, for the one-click preview buttons on the sign-in page. */
export function getDemoStaff(): StaffMember[] {
  return SEED_STAFF
}

export function getStaffByEmail(email: string): StaffMember | undefined {
  const e = email.trim().toLowerCase()
  return getStaff().find((s) => s.email === e)
}

/** Match staff credentials (case-insensitive email). Returns null if no match. */
export function findStaffLogin(
  email: string,
  password: string,
): StaffMember | null {
  const member = getStaffByEmail(email)
  return member && member.password === password ? member : null
}

/** The permissions a staff member holds, resolved live from their role. */
export function getPermissionsForStaff(email: string): string[] {
  const member = getStaffByEmail(email)
  if (!member) return []
  return getRole(member.roleId)?.permissions ?? []
}

export function can(email: string, permission: string): boolean {
  return getPermissionsForStaff(email).includes(permission)
}
