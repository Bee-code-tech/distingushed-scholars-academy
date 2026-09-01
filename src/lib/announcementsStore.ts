// Announcements & their read-state ("notifications") — browser-local stand-in
// for the LMS announcement/notification endpoints (docs/DSA-LMS-Backend-Spec.md
// §11–§12). Swap get/add for API calls once /announcements + /notifications
// ship; the read-state maps to Notification.isRead server-side.
//
// Same-browser only: a tutor's announcement is seen by students on the same
// browser, and unread state is tracked per user key.

import type { Announcement } from './types'

const ANN_KEY = 'dsa_announcements'
const READ_KEY = 'dsa_announcement_reads' // { [userKey]: announcementId[] }

const SEED_ANNOUNCEMENTS: Announcement[] = [
  {
    id: 'an-seed-1',
    scope: 'global',
    authorName: 'DSA Admin',
    title: 'Welcome to the 2026 session',
    body: 'Classes resume Monday. Check your timetable and course materials for the week.',
    createdAt: '2026-08-01T08:00:00.000Z',
  },
  {
    id: 'an-seed-2',
    scope: 'track',
    track: 'jamb',
    authorName: 'Dr. Jay',
    title: 'JAMB Mock exam this Saturday',
    body: 'A full mock holds Saturday 10am. Come with your materials. Attendance will be taken.',
    createdAt: '2026-08-03T10:00:00.000Z',
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

function all(): Announcement[] {
  return [...SEED_ANNOUNCEMENTS, ...read<Announcement[]>(ANN_KEY, [])].sort(
    (a, b) => b.createdAt.localeCompare(a.createdAt), // newest first
  )
}

/** Every announcement (tutor/admin view). */
export function getAnnouncements(): Announcement[] {
  return all()
}

/**
 * Announcements a student should see: global + their track + any course they're
 * enrolled in (`courseIds`). Course-scoped ones only show to enrolled students.
 */
export function getForStudent(
  track: string,
  courseIds: string[] = [],
): Announcement[] {
  const mine = new Set(courseIds)
  return all().filter(
    (a) =>
      a.scope === 'global' ||
      (a.scope === 'track' && a.track === track) ||
      (a.scope === 'course' && !!a.courseId && mine.has(a.courseId)),
  )
}

export function addAnnouncement(input: {
  scope: Announcement['scope']
  track?: string
  courseId?: string
  courseTitle?: string
  authorName: string
  title: string
  body: string
  now: number
}): Announcement {
  const a: Announcement = {
    id: `an-${input.now.toString(36)}`,
    scope: input.scope,
    track: input.scope === 'track' ? input.track : undefined,
    courseId: input.scope === 'course' ? input.courseId : undefined,
    courseTitle: input.scope === 'course' ? input.courseTitle : undefined,
    authorName: input.authorName,
    title: input.title.trim(),
    body: input.body.trim(),
    createdAt: new Date(input.now).toISOString(),
  }
  write(ANN_KEY, [...read<Announcement[]>(ANN_KEY, []), a])
  return a
}

export function removeAnnouncement(id: string): void {
  if (SEED_ANNOUNCEMENTS.some((a) => a.id === id)) return
  write(ANN_KEY, read<Announcement[]>(ANN_KEY, []).filter((a) => a.id !== id))
}

/** Edit an existing (non-seed) announcement's title + body. */
export function updateAnnouncement(
  id: string,
  patch: { title: string; body: string },
): void {
  if (SEED_ANNOUNCEMENTS.some((a) => a.id === id)) return
  write(
    ANN_KEY,
    read<Announcement[]>(ANN_KEY, []).map((a) =>
      a.id === id
        ? { ...a, title: patch.title.trim(), body: patch.body.trim() }
        : a,
    ),
  )
}

// ---- Read state (per user) ----
function reads(): Record<string, string[]> {
  return read<Record<string, string[]>>(READ_KEY, {})
}

export function getReadIds(userKey: string): string[] {
  return reads()[userKey] || []
}

export function markRead(userKey: string, id: string): void {
  const map = reads()
  const set = new Set(map[userKey] || [])
  set.add(id)
  map[userKey] = Array.from(set)
  write(READ_KEY, map)
}

export function markAllRead(userKey: string, ids: string[]): void {
  const map = reads()
  const set = new Set(map[userKey] || [])
  ids.forEach((id) => set.add(id))
  map[userKey] = Array.from(set)
  write(READ_KEY, map)
}

/** Count of unread announcements for a student on `track`. */
export function unreadCount(userKey: string, track: string): number {
  const readIds = new Set(getReadIds(userKey))
  return getForStudent(track).filter((a) => !readIds.has(a.id)).length
}
