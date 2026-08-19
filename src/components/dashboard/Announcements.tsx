'use client'

import React, { useCallback, useEffect, useState } from 'react'
import {
  Megaphone,
  Send,
  Trash2,
  Globe,
  GraduationCap,
  CheckCheck,
  Loader2,
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { getUser, getToken } from '@/lib/auth'
import { isDemoToken } from '@/lib/demoAccounts'
import { dsaApi } from '@/lib/api'
import {
  getAnnouncements as getLocalAnnouncements,
  getForStudent as getLocalForStudent,
  addAnnouncement as addLocalAnnouncement,
  removeAnnouncement as removeLocalAnnouncement,
  getReadIds,
  markRead as markReadLocal,
  markAllRead as markAllReadLocal,
} from '@/lib/announcementsStore'
import { normaliseTrack, EXAM_TRACKS } from '@/lib/studentProfile'
import type { Announcement } from '@/lib/types'

const TRACKS: { id: string; label: string }[] = [
  { id: 'jamb', label: 'JAMB' },
  { id: 'waec', label: 'WAEC' },
  { id: 'postutme', label: 'Post-UTME' },
]

function isLive(): boolean {
  const t = getToken()
  return !!t && !isDemoToken(t)
}

// The API returns { id, scope, examTrack?, authorId?, title, body, createdAt }
// (no authorName), so default the author label.
function mapAnnouncement(a: Record<string, unknown>): Announcement {
  return {
    id: String(a.id ?? a._id ?? ''),
    scope: a.scope === 'track' ? 'track' : 'global',
    track: (a.track as string) || (a.examTrack as string) || undefined,
    authorId: a.authorId ? String(a.authorId) : undefined,
    authorName: (a.authorName as string) || 'DSA Team',
    title: String(a.title ?? ''),
    body: String(a.body ?? ''),
    createdAt: String(a.createdAt ?? new Date().toISOString()),
  }
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const d = Math.floor(diff / 86_400_000)
  if (d > 0) return `${d}d ago`
  const h = Math.floor(diff / 3_600_000)
  if (h > 0) return `${h}h ago`
  const m = Math.floor(diff / 60_000)
  return m > 1 ? `${m}m ago` : 'just now'
}

function ScopeBadge({ a }: { a: Announcement }) {
  return a.scope === 'global' ? (
    <Badge className='bg-slate-100 text-slate-500 text-[8px] font-black'>
      <Globe size={9} className='mr-1' /> All students
    </Badge>
  ) : (
    <Badge className='bg-blue-50 text-[#002EFF] text-[8px] font-black'>
      <GraduationCap size={9} className='mr-1' />
      {EXAM_TRACKS[a.track as keyof typeof EXAM_TRACKS]?.label ?? a.track}
    </Badge>
  )
}

function LiveBadge({ live }: { live: boolean }) {
  return (
    <Badge
      className={`text-[8px] font-black shrink-0 ${live ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}
    >
      {live ? 'Live' : 'Local'}
    </Badge>
  )
}

export default function Announcements({
  mode,
  studentKey,
  track: trackProp,
}: {
  mode: 'tutor' | 'student'
  studentKey?: string
  track?: string
}) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  if (!mounted) {
    return (
      <div className='py-16 flex justify-center'>
        <Loader2 className='animate-spin text-[#002EFF]' />
      </div>
    )
  }
  if (mode === 'tutor') return <TutorAnnouncements />

  const u = getUser()
  const track = trackProp || normaliseTrack(u?.level || u?.examType || 'jamb')
  return (
    <StudentAnnouncements track={track} studentKey={studentKey || u?.username || 'me'} />
  )
}

/* ---------------- Tutor / staff: broadcast ---------------- */
function TutorAnnouncements() {
  const u = getUser()
  const authorName = u?.fullName || u?.username || 'Tutor'

  const [live, setLive] = useState(false)
  const [loading, setLoading] = useState(true)
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [target, setTarget] = useState('global') // 'global' | track id
  const [error, setError] = useState('')
  const [sent, setSent] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    if (isLive()) {
      try {
        const rows = (await dsaApi.announcements.list()) as Record<
          string,
          unknown
        >[]
        setAnnouncements(rows.map(mapAnnouncement))
        setLive(true)
        setLoading(false)
        return
      } catch {
        /* fall through to local */
      }
    }
    setAnnouncements(getLocalAnnouncements())
    setLive(false)
    setLoading(false)
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const send = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSent(false)
    if (title.trim().length < 2) return setError('Enter a title')
    if (body.trim().length < 3) return setError('Write a message')
    const scope = target === 'global' ? 'global' : 'track'
    setSubmitting(true)
    try {
      if (live) {
        await dsaApi.announcements.create({
          scope,
          track: scope === 'track' ? target : undefined,
          examTrack: scope === 'track' ? target : undefined,
          authorName,
          title: title.trim(),
          body: body.trim(),
        })
      } else {
        addLocalAnnouncement({
          scope,
          track: scope === 'track' ? target : undefined,
          authorName,
          title: title.trim(),
          body: body.trim(),
          now: Date.now(),
        })
      }
      setTitle('')
      setBody('')
      setTarget('global')
      setSent(true)
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send announcement')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = (id: string) => {
    // The backend has no delete endpoint yet; only wired for the local store.
    removeLocalAnnouncement(id)
    void load()
  }

  return (
    <div className='space-y-5'>
      <div className='flex items-start justify-between gap-3'>
        <div>
          <h2 className='text-2xl font-black text-[#002EFF] italic uppercase'>
            Announcements
          </h2>
          <p className='text-[11px] font-bold text-slate-400'>
            Broadcast a message to all students or a single track.
          </p>
        </div>
        <LiveBadge live={live} />
      </div>

      {/* Compose */}
      <Card className='p-5 rounded-3xl border-none shadow-sm bg-white'>
        <form onSubmit={send} className='space-y-3'>
          {error && <p className='text-[11px] font-bold text-rose-600'>{error}</p>}
          {sent && (
            <p className='text-[11px] font-bold text-emerald-600'>
              Announcement sent.
            </p>
          )}
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder='Title'
            className='w-full h-11 px-3 rounded-lg bg-slate-50 border border-transparent focus:border-[#002EFF]/30 focus:bg-white outline-none text-sm font-medium'
          />
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder='Message…'
            rows={3}
            className='w-full px-3 py-2 rounded-lg bg-slate-50 border border-transparent focus:border-[#002EFF]/30 focus:bg-white outline-none text-sm font-medium resize-none'
          />
          <div className='flex items-center gap-2 flex-wrap'>
            <span className='text-[9px] font-black uppercase text-slate-400'>
              Send to
            </span>
            <select
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              className='h-10 px-3 rounded-lg bg-slate-50 border border-transparent focus:border-[#002EFF]/30 focus:bg-white outline-none text-sm font-bold'
            >
              <option value='global'>All students</option>
              {TRACKS.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.label}
                </option>
              ))}
            </select>
            <button
              type='submit'
              disabled={submitting}
              className='ml-auto flex items-center justify-center gap-2 h-11 px-6 bg-[#002EFF] text-white rounded-xl font-black text-[11px] uppercase tracking-wide hover:bg-blue-700 active:scale-[0.98] transition-all disabled:opacity-60'
            >
              <Send size={14} /> {submitting ? 'Sending…' : 'Send'}
            </button>
          </div>
        </form>
      </Card>

      {/* Sent list */}
      <div className='space-y-2'>
        {loading ? (
          <div className='py-8 flex justify-center'>
            <Loader2 className='animate-spin text-[#002EFF]' />
          </div>
        ) : announcements.length === 0 ? (
          <p className='text-xs font-bold text-slate-400 py-8 text-center'>
            No announcements yet.
          </p>
        ) : (
          announcements.map((a) => (
            <Card
              key={a.id}
              className='p-4 rounded-2xl border-none shadow-sm bg-white'
            >
              <div className='flex items-center gap-2 mb-1'>
                <Megaphone size={14} className='text-[#002EFF]' />
                <p className='text-xs font-black text-gray-800 flex-1 truncate'>
                  {a.title}
                </p>
                <ScopeBadge a={a} />
                <span className='text-[9px] font-bold text-slate-400'>
                  {timeAgo(a.createdAt)}
                </span>
                {!live && (
                  <button
                    onClick={() => handleDelete(a.id)}
                    className='p-1 text-slate-400 hover:text-rose-600'
                    title='Delete'
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
              <p className='text-[11px] text-slate-600'>{a.body}</p>
              <p className='text-[9px] font-bold text-slate-400 mt-1'>
                by {a.authorName}
              </p>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}

/* ---------------- Student: inbox with unread ---------------- */
function StudentAnnouncements({
  track,
  studentKey,
}: {
  track: string
  studentKey: string
}) {
  const [live, setLive] = useState(false)
  const [loading, setLoading] = useState(true)
  const [list, setList] = useState<Announcement[]>([])
  const [readIds, setReadIds] = useState<string[]>([])

  const load = useCallback(async () => {
    setLoading(true)
    setReadIds(getReadIds(studentKey))
    if (isLive()) {
      try {
        // The backend already filters to the student's track + global.
        const rows = (await dsaApi.announcements.list()) as Record<
          string,
          unknown
        >[]
        setList(rows.map(mapAnnouncement))
        setLive(true)
        setLoading(false)
        return
      } catch {
        /* fall through to local */
      }
    }
    setList(getLocalForStudent(track))
    setLive(false)
    setLoading(false)
  }, [track, studentKey])

  useEffect(() => {
    void load()
  }, [load])

  const isRead = (id: string) => readIds.includes(id)

  const handleMarkRead = (id: string) => {
    markReadLocal(studentKey, id)
    setReadIds(getReadIds(studentKey))
  }

  const handleMarkAllRead = () => {
    markAllReadLocal(
      studentKey,
      list.map((a) => a.id),
    )
    setReadIds(getReadIds(studentKey))
  }

  const unreadCount = list.filter((a) => !isRead(a.id)).length

  return (
    <div className='space-y-5'>
      <div className='flex items-center justify-between flex-wrap gap-2'>
        <div>
          <h2 className='text-2xl font-black text-[#002EFF] italic uppercase flex items-center gap-2'>
            <Megaphone size={22} /> Announcements
            {unreadCount > 0 && (
              <span className='text-[10px] font-black bg-rose-500 text-white rounded-full px-2 py-0.5'>
                {unreadCount} new
              </span>
            )}
          </h2>
          <p className='text-[10px] font-bold text-gray-400 uppercase tracking-widest'>
            Updates from your tutors &amp; the academy
          </p>
        </div>
        <div className='flex items-center gap-2'>
          <LiveBadge live={live} />
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className='flex items-center gap-1.5 h-9 px-3 rounded-lg bg-slate-100 text-slate-600 text-[10px] font-black uppercase hover:bg-slate-200'
            >
              <CheckCheck size={13} /> Mark all read
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className='py-12 flex justify-center'>
          <Loader2 className='animate-spin text-[#002EFF]' />
        </div>
      ) : list.length === 0 ? (
        <p className='text-xs font-bold text-slate-400 py-12 text-center'>
          No announcements yet. Check back soon.
        </p>
      ) : (
        <div className='space-y-2'>
          {list.map((a) => {
            const read = isRead(a.id)
            return (
              <Card
                key={a.id}
                onClick={() => !read && handleMarkRead(a.id)}
                className={`p-4 rounded-2xl border-none shadow-sm cursor-pointer transition-all ${read ? 'bg-white' : 'bg-blue-50/60 ring-1 ring-[#002EFF]/10'}`}
              >
                <div className='flex items-center gap-2 mb-1'>
                  {!read && (
                    <span className='h-2 w-2 rounded-full bg-[#002EFF] shrink-0' />
                  )}
                  <p className='text-xs font-black text-gray-800 flex-1 truncate'>
                    {a.title}
                  </p>
                  <ScopeBadge a={a} />
                  <span className='text-[9px] font-bold text-slate-400'>
                    {timeAgo(a.createdAt)}
                  </span>
                </div>
                <p className='text-[11px] text-slate-600'>{a.body}</p>
                <p className='text-[9px] font-bold text-slate-400 mt-1'>
                  by {a.authorName}
                </p>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
