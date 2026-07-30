// Mock attendance data shared by the student (view), tutor and admin (take)
// screens. Replace with API calls once the backend has attendance endpoints —
// see docs/backend-requests.md.

export type AttendanceStatus = 'present' | 'absent' | 'late'

export interface AttendanceDay {
  date: string // e.g. "Mon, 21 Jul"
  status: AttendanceStatus
}

// A student's own recent record (most recent first).
export const STUDENT_ATTENDANCE: AttendanceDay[] = [
  { date: 'Mon, 21 Jul', status: 'present' },
  { date: 'Tue, 22 Jul', status: 'present' },
  { date: 'Wed, 23 Jul', status: 'late' },
  { date: 'Thu, 24 Jul', status: 'present' },
  { date: 'Fri, 25 Jul', status: 'absent' },
  { date: 'Mon, 28 Jul', status: 'present' },
  { date: 'Tue, 29 Jul', status: 'present' },
]

export interface RosterStudent {
  id: string
  name: string
  track: string
}

// The class roster a tutor/admin marks each day.
export const CLASS_ROSTER: RosterStudent[] = [
  { id: 's1', name: 'Ada Obi', track: 'JAMB' },
  { id: 's2', name: 'Bola Ade', track: 'WAEC' },
  { id: 's3', name: 'Chidi Eze', track: 'JAMB' },
  { id: 's4', name: 'Dupe Ola', track: 'Post-UTME' },
  { id: 's5', name: 'Emeka Nwa', track: 'WAEC' },
  { id: 's6', name: 'Funke Bello', track: 'JAMB' },
]

export function attendanceRate(days: AttendanceDay[]): number {
  if (!days.length) return 0
  const credited = days.filter((d) => d.status !== 'absent').length
  return Math.round((credited / days.length) * 100)
}
