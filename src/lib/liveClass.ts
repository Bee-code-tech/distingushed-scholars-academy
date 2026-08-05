// Live online class — Google Meet link + status, one per exam track.
//
// Ownership: the ADMIN schedules the timetable and GENERATES the Google Meet
// link (in Google Meet), then passes it to the TUTOR, who UPLOADS it here and
// flips the class live/ended. The student's "Join Live Class" button opens it
// when the tutor has it live.
//
// Browser-local for now. When the backend exists this becomes fields on the
// LiveClass entity (docs/DSA-LMS-Backend-Spec.md §2.13, §10) — or an
// auto-generated Meet link via the Google Calendar/Meet API.

import type { ExamTrack } from './studentProfile'

const KEY = 'dsa_meet_links'
const STATUS_KEY = 'dsa_live_status'

export type LiveStatus = 'scheduled' | 'live' | 'ended'

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

function readStatuses(): Record<string, LiveStatus> {
  if (typeof window === 'undefined') return {}
  try {
    return JSON.parse(localStorage.getItem(STATUS_KEY) || '{}')
  } catch {
    return {}
  }
}

export function getLiveStatus(track: ExamTrack): LiveStatus {
  return readStatuses()[track] || 'scheduled'
}

export function setLiveStatus(track: ExamTrack, status: LiveStatus): void {
  if (typeof window === 'undefined') return
  const all = readStatuses()
  all[track] = status
  localStorage.setItem(STATUS_KEY, JSON.stringify(all))
}
