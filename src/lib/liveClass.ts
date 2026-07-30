// Google Meet link for the online class, one per exam track. Admin/tutor set it
// (in the timetable editor); the student's "Join Live Class" button opens it.
//
// Browser-local for now. When the backend exists this becomes a stored field on
// the class/session — or, better, an auto-generated Meet link via the Google
// Calendar/Meet API (see docs/backend-requests.md).

import type { ExamTrack } from './studentProfile'

const KEY = 'dsa_meet_links'

function readAll(): Record<string, string> {
  if (typeof window === 'undefined') return {}
  try {
    return JSON.parse(localStorage.getItem(KEY) || '{}')
  } catch {
    return {}
  }
}

export function getMeetLink(track: ExamTrack): string {
  return readAll()[track] || ''
}

export function saveMeetLink(track: ExamTrack, url: string): void {
  if (typeof window === 'undefined') return
  const all = readAll()
  all[track] = url.trim()
  localStorage.setItem(KEY, JSON.stringify(all))
}
