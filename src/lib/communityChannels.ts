// Community channels — the "General" channel plus one per programme (and, for
// department-split programmes, per department), mirroring the timetable / quiz
// audience model. Admins can create and delete channels; the backend is the
// source of truth when live, with a seeded browser-local list as the fallback
// so the switcher works before the endpoints ship.

import type { ExamTrack, Department } from './studentProfile'
import { EXAM_TRACKS, DEPARTMENT_LABELS } from './studentProfile'
import {
  QUIZ_TRACKS,
  QUIZ_DEPARTMENTS,
  isDeptSplitTrack,
} from './quizAudience'

export interface CommunityChannel {
  id: string
  name: string
  track?: ExamTrack | null
  department?: Department | null
  /** 'general' = everyone; 'program' = a programme(+dept); 'custom' = ad-hoc. */
  kind: 'general' | 'program' | 'custom'
  /** System channels (General) can't be deleted. */
  system?: boolean
}

export const GENERAL_CHANNEL: CommunityChannel = {
  id: 'general',
  name: 'General',
  kind: 'general',
  system: true,
}

/** Stable channel id for a programme(+department), e.g. "jamb-science". */
export function programChannelId(
  track: ExamTrack,
  dept?: Department | null,
): string {
  return dept && isDeptSplitTrack(track) ? `${track}-${dept}` : track
}

/** The default set of channels: General + every programme (× department). */
export function defaultChannels(): CommunityChannel[] {
  const out: CommunityChannel[] = [GENERAL_CHANNEL]
  for (const track of QUIZ_TRACKS) {
    const label = EXAM_TRACKS[track].label
    if (isDeptSplitTrack(track)) {
      for (const dept of QUIZ_DEPARTMENTS) {
        out.push({
          id: programChannelId(track, dept),
          name: `${label} · ${DEPARTMENT_LABELS[dept]}`,
          track,
          department: dept,
          kind: 'program',
          system: true,
        })
      }
    } else {
      out.push({
        id: track,
        name: label,
        track,
        department: null,
        kind: 'program',
        system: true,
      })
    }
  }
  return out
}

/** Normalise a backend/store row into a CommunityChannel. */
export function toChannel(raw: Record<string, unknown>): CommunityChannel {
  const track = raw.track ? (String(raw.track) as ExamTrack) : null
  const department = raw.department
    ? (String(raw.department) as Department)
    : null
  const kind =
    raw.kind === 'general' || raw.id === 'general'
      ? 'general'
      : raw.kind === 'custom'
        ? 'custom'
        : track
          ? 'program'
          : 'custom'
  return {
    id: String(raw.id ?? raw._id ?? ''),
    name: String(raw.name ?? 'Channel'),
    track,
    department,
    kind,
    system: !!raw.system || raw.id === 'general',
  }
}

/**
 * Which channels a student may see: the General channel plus the channel(s)
 * that match their resolved programme + department.
 */
export function channelsForProfile(
  channels: CommunityChannel[],
  profile: { track: ExamTrack; department: Department | null } | null,
): CommunityChannel[] {
  return channels.filter((c) => {
    if (c.kind === 'general') return true
    if (!c.track) return true // custom channel with no track → visible to all
    if (!profile) return true
    if (c.track !== profile.track) return false
    if (c.department && isDeptSplitTrack(profile.track)) {
      return !profile.department || c.department === profile.department
    }
    return true
  })
}

// ---- Browser-local fallback store (seeded with the defaults) ----
const KEY = 'dsa_community_channels'

function read(): CommunityChannel[] | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return null
    const arr = JSON.parse(raw)
    return Array.isArray(arr) ? arr : null
  } catch {
    return null
  }
}

function write(list: CommunityChannel[]): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(KEY, JSON.stringify(list))
}

/** The local channel list, seeding the defaults on first use. */
export function getLocalChannels(): CommunityChannel[] {
  const stored = read()
  if (stored && stored.length) return stored
  const seeded = defaultChannels()
  write(seeded)
  return seeded
}

export function addLocalChannel(input: {
  name: string
  track?: ExamTrack | null
  department?: Department | null
}): CommunityChannel {
  const list = getLocalChannels()
  const base = input.track
    ? programChannelId(input.track, input.department ?? null)
    : `custom-${input.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`
  let id = base
  let n = 2
  while (list.some((c) => c.id === id)) id = `${base}-${n++}`
  const channel: CommunityChannel = {
    id,
    name: input.name.trim(),
    track: input.track ?? null,
    department: input.department ?? null,
    kind: input.track ? 'program' : 'custom',
  }
  write([...list, channel])
  return channel
}

export function removeLocalChannel(id: string): void {
  if (id === 'general') return // never delete General
  write(getLocalChannels().filter((c) => c.id !== id))
}
