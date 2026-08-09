// Admin directory of tutors & guardians — browser-local stand-in so the admin
// can view the people they create. When admin creates a tutor/guardian it hits
// the real register API (they're saved to the DB), but there is no "list users
// by role" endpoint yet, so we also record them here for the admin views.
// Swap get* for GET /api/... once the backend exposes those lists.

export interface DirectoryPerson {
  key: string // username
  name: string
  email: string
  extra?: string // tutor: subject/specialty · guardian: ward name
  isNew?: boolean
}

const TUTORS_KEY = 'dsa_tutors'
const GUARDIANS_KEY = 'dsa_guardians'

// One seeded tutor (matches the demo tutor login tutor@dsa.demo → username
// "tutor_demo") so the admin's Tutors list & course-assignment dropdown have a
// tutor to work with, and courses assigned to them link to the tutor dashboard.
// Guardians are created by the admin (Create Guardian).
const SEED_TUTORS: DirectoryPerson[] = [
  { key: 'tutor_demo', name: 'Mr. Timilehin', email: 'tutor@dsa.demo', extra: 'Mathematics' },
]
const SEED_GUARDIANS: DirectoryPerson[] = []

function read(key: string): DirectoryPerson[] {
  if (typeof window === 'undefined') return []
  try {
    const list = JSON.parse(localStorage.getItem(key) || '[]')
    return Array.isArray(list) ? list : []
  } catch {
    return []
  }
}

function merge(seed: DirectoryPerson[], stored: DirectoryPerson[]): DirectoryPerson[] {
  const seedKeys = new Set(seed.map((s) => s.key))
  return [...seed, ...stored.filter((s) => s?.key && !seedKeys.has(s.key))]
}

function add(key: string, seed: DirectoryPerson[], person: DirectoryPerson): void {
  if (typeof window === 'undefined') return
  if (seed.some((s) => s.key === person.key)) return
  const stored = read(key)
  if (stored.some((s) => s.key === person.key)) return
  localStorage.setItem(key, JSON.stringify([...stored, { ...person, isNew: true }]))
}

export function getTutors(): DirectoryPerson[] {
  return merge(SEED_TUTORS, read(TUTORS_KEY))
}
export function addTutor(person: DirectoryPerson): void {
  add(TUTORS_KEY, SEED_TUTORS, person)
}

export function getGuardians(): DirectoryPerson[] {
  return merge(SEED_GUARDIANS, read(GUARDIANS_KEY))
}
export function addGuardian(person: DirectoryPerson): void {
  add(GUARDIANS_KEY, SEED_GUARDIANS, person)
}
