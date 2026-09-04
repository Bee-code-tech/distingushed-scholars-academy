// Shared list of students, so a student registered on this browser shows up on
// the tutor/admin side. Browser-local stand-in until the backend has a real
// "students assigned to tutor" endpoint (see docs/backend-requests.md, R4).
//
// Same-browser only — a student registered on another device won't appear here
// until the backend stores it.

export interface StoredStudent {
  key: string // username
  name: string
  track: string // display label, e.g. "JAMB"
  level?: string // class/level, e.g. "SS2", "100 Level"
  mode?: string // "physical" | "online"
  avg?: number
  progress?: number
  isNew?: boolean
}

const KEY = 'dsa_students'

// Seeded students — compiled into the app, so they show in EVERY browser/device
// (unlike students registered at runtime, which are local to one browser until
// the backend exists). Add real known students here.
// No seeded students — the list is populated only by real registrations.
const SEED: StoredStudent[] = []

function readStored(): StoredStudent[] {
  if (typeof window === 'undefined') return []
  try {
    const list = JSON.parse(localStorage.getItem(KEY) || '[]')
    return Array.isArray(list) ? list : []
  } catch {
    return []
  }
}

/**
 * Seed (always shown) merged with any students registered on this browser.
 * The seed is authoritative for its keys, so a code-seeded student appears even
 * if the browser already has saved data.
 */
export function getStudents(): StoredStudent[] {
  const seedKeys = new Set(SEED.map((s) => s.key))
  const extras = readStored().filter((s) => s?.key && !seedKeys.has(s.key))
  return [...SEED, ...extras]
}

/** Append a newly registered student (idempotent; skips seeded keys). */
export function addStudent(s: StoredStudent): void {
  if (typeof window === 'undefined') return
  if (SEED.some((x) => x.key === s.key)) return
  const stored = readStored()
  if (stored.some((x) => x.key === s.key)) return
  localStorage.setItem(KEY, JSON.stringify([...stored, { ...s, isNew: true }]))
}
