// 'use client'

// import React, { useEffect, useState } from 'react'
// import {
//   Megaphone,
//   Send,
//   Trash2,
//   Globe,
//   GraduationCap,
//   CheckCheck,
//   Loader2,
// } from 'lucide-react'
// import { Card } from '@/components/ui/card'
// import { Badge } from '@/components/ui/badge'
// import {
//   getAnnouncements,
//   getForStudent,
//   addAnnouncement,
//   removeAnnouncement,
//   getReadIds,
//   markRead,
//   markAllRead,
// } from '@/lib/announcementsStore'
// import { getUser } from '@/lib/auth'
// import { normaliseTrack, EXAM_TRACKS } from '@/lib/studentProfile'
// import type { Announcement } from '@/lib/types'

// const TRACKS: { id: string; label: string }[] = [
//   { id: 'jamb', label: 'JAMB' },
//   { id: 'waec', label: 'WAEC' },
//   { id: 'postutme', label: 'Post-UTME' },
// ]

// function timeAgo(iso: string): string {
//   const diff = Date.now() - new Date(iso).getTime()
//   const d = Math.floor(diff / 86_400_000)
//   if (d > 0) return `${d}d ago`
//   const h = Math.floor(diff / 3_600_000)
//   if (h > 0) return `${h}h ago`
//   const m = Math.floor(diff / 60_000)
//   return m > 1 ? `${m}m ago` : 'just now'
// }

// function ScopeBadge({ a }: { a: Announcement }) {
//   return a.scope === 'global' ? (
//     <Badge className='bg-slate-100 text-slate-500 text-[8px] font-black'>
//       <Globe size={9} className='mr-1' /> All students
//     </Badge>
//   ) : (
//     <Badge className='bg-blue-50 text-[#002EFF] text-[8px] font-black'>
//       <GraduationCap size={9} className='mr-1' />
//       {EXAM_TRACKS[a.track as keyof typeof EXAM_TRACKS]?.label ?? a.track}
//     </Badge>
//   )
// }

// export default function Announcements({
//   mode,
//   studentKey,
//   track: trackProp,
// }: {
//   mode: 'tutor' | 'student'
//   studentKey?: string
//   track?: string
// }) {
//   const [mounted, setMounted] = useState(false)
//   const [tick, setTick] = useState(0)
//   const refresh = () => setTick((t) => t + 1)
//   useEffect(() => setMounted(true), [])

//   if (!mounted) {
//     return (
//       <div className='py-16 flex justify-center'>
//         <Loader2 className='animate-spin text-[#002EFF]' />
//       </div>
//     )
//   }

//   if (mode === 'tutor') return <TutorAnnouncements key={tick} onChange={refresh} />

//   const u = getUser()
//   const track = trackProp || normaliseTrack(u?.level || u?.examType || 'jamb')
//   return (
//     <StudentAnnouncements
//       key={tick}
//       track={track}
//       studentKey={studentKey || u?.username || 'me'}
//       onChange={refresh}
//     />
//   )
// }

// /* ---------------- Tutor: broadcast ---------------- */
// function TutorAnnouncements({ onChange }: { onChange: () => void }) {
//   const u = getUser()
//   const authorName = u?.fullName || u?.username || 'Tutor'
//   const list = getAnnouncements()

//   const [title, setTitle] = useState('')
//   const [body, setBody] = useState('')
//   const [target, setTarget] = useState<string>('global') // 'global' | track id
//   const [error, setError] = useState('')
//   const [sent, setSent] = useState(false)

//   const send = (e: React.FormEvent) => {
//     e.preventDefault()
//     setError('')
//     if (title.trim().length < 2) return setError('Enter a title')
//     if (body.trim().length < 3) return setError('Write a message')
//     addAnnouncement({
//       scope: target === 'global' ? 'global' : 'track',
//       track: target === 'global' ? undefined : target,
//       authorName,
//       title,
//       body,
//       now: Date.now(),
//     })
//     setTitle(''); setBody(''); setTarget('global'); setSent(true)
//     onChange()
//   }

//   return (
//     <div className='space-y-5'>
//       <div>
//         <h2 className='text-2xl font-black text-[#002EFF] italic uppercase'>Announcements</h2>
//         <p className='text-[11px] font-bold text-slate-400'>Broadcast to all students or a specific track.</p>
//       </div>

//       <Card className='p-5 rounded-3xl border-none shadow-sm bg-white'>
//         <form onSubmit={send} className='space-y-3'>
//           {sent && (
//             <p className='text-[11px] font-bold text-emerald-600'>Announcement sent to students.</p>
//           )}
//           {error && <p className='text-[11px] font-bold text-rose-600'>{error}</p>}
//           <input
//             value={title}
//             onChange={(e) => { setTitle(e.target.value); setSent(false) }}
//             placeholder='Title'
//             className='w-full h-11 px-3 rounded-lg bg-slate-50 border border-transparent focus:border-[#002EFF]/30 focus:bg-white outline-none text-sm font-medium'
//           />
//           <textarea
//             value={body}
//             onChange={(e) => { setBody(e.target.value); setSent(false) }}
//             placeholder='Write your announcement…'
//             rows={3}
//             className='w-full px-3 py-2 rounded-lg bg-slate-50 border border-transparent focus:border-[#002EFF]/30 focus:bg-white outline-none text-sm font-medium resize-none'
//           />
//           <div className='flex items-center gap-3 flex-wrap'>
//             <label className='text-[10px] font-black uppercase text-slate-400'>Send to</label>
//             <select
//               value={target}
//               onChange={(e) => setTarget(e.target.value)}
//               className='h-10 px-3 rounded-lg bg-slate-50 border border-transparent focus:border-[#002EFF]/30 focus:bg-white outline-none text-sm font-bold'
//             >
//               <option value='global'>All students</option>
//               {TRACKS.map((t) => (
//                 <option key={t.id} value={t.id}>{t.label} track</option>
//               ))}
//             </select>
//             <button type='submit'
//               className='ml-auto flex items-center gap-2 h-10 px-5 bg-[#002EFF] text-white rounded-xl font-black text-[11px] uppercase tracking-wide hover:bg-blue-700 active:scale-[0.98] transition-all'>
//               <Send size={14} /> Send
//             </button>
//           </div>
//         </form>
//       </Card>

//       <div className='space-y-2'>
//         {list.map((a) => (
//           <Card key={a.id} className='p-4 rounded-2xl border-none shadow-sm bg-white'>
//             <div className='flex items-center gap-2 mb-1'>
//               <Megaphone size={14} className='text-[#002EFF]' />
//               <p className='text-xs font-black text-gray-800 flex-1 truncate'>{a.title}</p>
//               <ScopeBadge a={a} />
//               <span className='text-[9px] font-bold text-slate-400'>{timeAgo(a.createdAt)}</span>
//               <button onClick={() => { removeAnnouncement(a.id); onChange() }} className='p-1 text-slate-400 hover:text-rose-600' title='Delete'>
//                 <Trash2 size={14} />
//               </button>
//             </div>
//             <p className='text-[11px] text-slate-600'>{a.body}</p>
//             <p className='text-[9px] font-bold text-slate-400 mt-1'>by {a.authorName}</p>
//           </Card>
//         ))}
//       </div>
//     </div>
//   )
// }

// /* ---------------- Student: inbox with unread ---------------- */
// function StudentAnnouncements({
//   track,
//   studentKey,
//   onChange,
// }: {
//   track: string
//   studentKey: string
//   onChange: () => void
// }) {
//   const list = getForStudent(track)
//   const readIds = new Set(getReadIds(studentKey))
//   const unread = list.filter((a) => !readIds.has(a.id)).length

//   return (
//     <div className='space-y-5'>
//       <div className='flex items-center justify-between flex-wrap gap-2'>
//         <div>
//           <h2 className='text-2xl font-black text-[#002EFF] italic uppercase'>
//             Announcements
//             {unread > 0 && (
//               <span className='ml-2 align-middle text-[10px] font-black text-white bg-rose-500 rounded-full px-2 py-0.5'>
//                 {unread} new
//               </span>
//             )}
//           </h2>
//           <p className='text-[11px] font-bold text-slate-400'>Class reminders, deadlines &amp; notices.</p>
//         </div>
//         {unread > 0 && (
//           <button
//             onClick={() => { markAllRead(studentKey, list.map((a) => a.id)); onChange() }}
//             className='flex items-center gap-1.5 h-9 px-3 rounded-lg bg-blue-50 text-[#002EFF] text-[10px] font-black uppercase'
//           >
//             <CheckCheck size={14} /> Mark all read
//           </button>
//         )}
//       </div>

//       {list.length === 0 ? (
//         <p className='text-xs font-bold text-slate-400 py-8 text-center'>No announcements yet.</p>
//       ) : (
//         <div className='space-y-2'>
//           {list.map((a) => {
//             const isUnread = !readIds.has(a.id)
//             return (
//               <Card
//                 key={a.id}
//                 onClick={() => { if (isUnread) { markRead(studentKey, a.id); onChange() } }}
//                 className={`p-4 rounded-2xl border-none shadow-sm cursor-pointer transition-all ${isUnread ? 'bg-blue-50/60 ring-1 ring-blue-100' : 'bg-white'}`}
//               >
//                 <div className='flex items-center gap-2 mb-1'>
//                   {isUnread && <span className='h-2 w-2 rounded-full bg-rose-500 shrink-0' />}
//                   <Megaphone size={14} className='text-[#002EFF]' />
//                   <p className={`text-xs flex-1 truncate ${isUnread ? 'font-black text-gray-900' : 'font-bold text-gray-700'}`}>{a.title}</p>
//                   <ScopeBadge a={a} />
//                   <span className='text-[9px] font-bold text-slate-400'>{timeAgo(a.createdAt)}</span>
//                 </div>
//                 <p className='text-[11px] text-slate-600'>{a.body}</p>
//                 <p className='text-[9px] font-bold text-slate-400 mt-1'>by {a.authorName}</p>
//               </Card>
//             )
//           })}
//         </div>
//       )}
//     </div>
//   )
// }

'use client'

import React, { useEffect, useState, useCallback } from 'react'
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
import { getUser } from '@/lib/auth'
import { normaliseTrack, EXAM_TRACKS } from '@/lib/studentProfile'

export interface Announcement {
  id: string
  title: string
  body: string
  scope: 'global' | 'track'
  track?: string
  authorName: string
  createdAt: string
  isRead?: boolean
}

const TRACKS: { id: string; label: string }[] = [
  { id: 'jamb', label: 'JAMB' },
  { id: 'waec', label: 'WAEC' },
  { id: 'postutme', label: 'Post-UTME' },
]

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

  useEffect(() => {
    setMounted(true)
  }, [])

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
    <StudentAnnouncements
      track={track}
      studentKey={studentKey || u?.username || 'me'}
    />
  )
}

/* ---------------- Tutor: broadcast ---------------- */
function TutorAnnouncements() {
  const u = getUser()
  const authorName = u?.fullName || u?.username || 'Tutor'

  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [target, setTarget] = useState<string>('global') // 'global' | track id
  const [error, setError] = useState('')
  const [sent, setSent] = useState(false)

  const fetchAnnouncements = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/announcements')
      if (!res.ok) throw new Error('Failed to fetch announcements')
      const data = await res.json()
      setAnnouncements(data)
    } catch (err: any) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchAnnouncements()
  }, [fetchAnnouncements])

  const send = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (title.trim().length < 2) return setError('Enter a title')
    if (body.trim().length < 3) return setError('Write a message')

    try {
      setIsSubmitting(true)
      const res = await fetch('/api/announcements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scope: target === 'global' ? 'global' : 'track',
          track: target === 'global' ? undefined : target,
          authorName,
          title,
          body,
        }),
      })

      if (!res.ok) throw new Error('Failed to create announcement')

      setTitle('')
      setBody('')
      setTarget('global')
      setSent(true)
      await fetchAnnouncements()
    } catch (err: any) {
      setError(err.message || 'An error occurred')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/announcements/${id}`, {
        method: 'DELETE',
      })
      if (!res.ok) throw new Error('Failed to delete announcement')
      await fetchAnnouncements()
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div className='space-y-5'>
      <div>
        <h2 className='text-2xl font-black text-[#002EFF] italic uppercase'>
          Announcements
        </h2>
        <p className='text-[11px] font-bold text-slate-400'>
          Broadcast to all students or a specific track.
        </p>
      </div>

      <Card className='p-5 rounded-3xl border-none shadow-sm bg-white'>
        <form onSubmit={send} className='space-y-3'>
          {sent && (
            <p className='text-[11px] font-bold text-emerald-600'>
              Announcement sent to students.
            </p>
          )}
          {error && (
            <p className='text-[11px] font-bold text-rose-600'>{error}</p>
          )}
          <input
            value={title}
            onChange={(e) => {
              setTitle(e.target.value)
              setSent(false)
            }}
            placeholder='Title'
            className='w-full h-11 px-3 rounded-lg bg-slate-50 border border-transparent focus:border-[#002EFF]/30 focus:bg-white outline-none text-sm font-medium'
          />
          <textarea
            value={body}
            onChange={(e) => {
              setBody(e.target.value)
              setSent(false)
            }}
            placeholder='Write your announcement…'
            rows={3}
            className='w-full px-3 py-2 rounded-lg bg-slate-50 border border-transparent focus:border-[#002EFF]/30 focus:bg-white outline-none text-sm font-medium resize-none'
          />
          <div className='flex items-center gap-3 flex-wrap'>
            <label className='text-[10px] font-black uppercase text-slate-400'>
              Send to
            </label>
            <select
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              className='h-10 px-3 rounded-lg bg-slate-50 border border-transparent focus:border-[#002EFF]/30 focus:bg-white outline-none text-sm font-bold'
            >
              <option value='global'>All students</option>
              {TRACKS.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.label} track
                </option>
              ))}
            </select>
            <button
              type='submit'
              disabled={isSubmitting}
              className='ml-auto flex items-center gap-2 h-10 px-5 bg-[#002EFF] text-white rounded-xl font-black text-[11px] uppercase tracking-wide hover:bg-blue-700 active:scale-[0.98] transition-all disabled:opacity-50'
            >
              {isSubmitting ? (
                <Loader2 size={14} className='animate-spin' />
              ) : (
                <Send size={14} />
              )}
              Send
            </button>
          </div>
        </form>
      </Card>

      <div className='space-y-2'>
        {loading ? (
          <div className='py-8 flex justify-center'>
            <Loader2 className='animate-spin text-[#002EFF]' />
          </div>
        ) : announcements.length === 0 ? (
          <p className='text-xs font-bold text-slate-400 py-8 text-center'>
            No announcements created yet.
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
                <button
                  onClick={() => handleDelete(a.id)}
                  className='p-1 text-slate-400 hover:text-rose-600'
                  title='Delete'
                >
                  <Trash2 size={14} />
                </button>
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
  const [list, setList] = useState<Announcement[]>([])
  const [loading, setLoading] = useState(true)

  const fetchStudentAnnouncements = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch(
        `/api/announcements/student?track=${encodeURIComponent(
          track,
        )}&studentKey=${encodeURIComponent(studentKey)}`,
      )
      if (!res.ok) throw new Error('Failed to fetch announcements')
      const data = await res.json()
      setList(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [track, studentKey])

  useEffect(() => {
    fetchStudentAnnouncements()
  }, [fetchStudentAnnouncements])

  const handleMarkRead = async (id: string) => {
    try {
      // Optimistic update
      setList((prev) =>
        prev.map((item) => (item.id === id ? { ...item, isRead: true } : item)),
      )
      await fetch('/api/announcements/read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentKey, announcementId: id }),
      })
    } catch (err) {
      console.error(err)
      fetchStudentAnnouncements()
    }
  }

  const handleMarkAllRead = async () => {
    try {
      // Optimistic update
      setList((prev) => prev.map((item) => ({ ...item, isRead: true })))
      const unreadIds = list.filter((a) => !a.isRead).map((a) => a.id)
      await fetch('/api/announcements/read-all', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentKey, announcementIds: unreadIds }),
      })
    } catch (err) {
      console.error(err)
      fetchStudentAnnouncements()
    }
  }

  const unreadCount = list.filter((a) => !a.isRead).length

  return (
    <div className='space-y-5'>
      <div className='flex items-center justify-between flex-wrap gap-2'>
        <div>
          <h2 className='text-2xl font-black text-[#002EFF] italic uppercase'>
            Announcements
            {unreadCount > 0 && (
              <span className='ml-2 align-middle text-[10px] font-black text-white bg-rose-500 rounded-full px-2 py-0.5'>
                {unreadCount} new
              </span>
            )}
          </h2>
          <p className='text-[11px] font-bold text-slate-400'>
            Class reminders, deadlines &amp; notices.
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            className='flex items-center gap-1.5 h-9 px-3 rounded-lg bg-blue-50 text-[#002EFF] text-[10px] font-black uppercase'
          >
            <CheckCheck size={14} /> Mark all read
          </button>
        )}
      </div>

      {loading ? (
        <div className='py-16 flex justify-center'>
          <Loader2 className='animate-spin text-[#002EFF]' />
        </div>
      ) : list.length === 0 ? (
        <p className='text-xs font-bold text-slate-400 py-8 text-center'>
          No announcements yet.
        </p>
      ) : (
        <div className='space-y-2'>
          {list.map((a) => {
            const isUnread = !a.isRead
            return (
              <Card
                key={a.id}
                onClick={() => {
                  if (isUnread) handleMarkRead(a.id)
                }}
                className={`p-4 rounded-2xl border-none shadow-sm cursor-pointer transition-all ${
                  isUnread ? 'bg-blue-50/60 ring-1 ring-blue-100' : 'bg-white'
                }`}
              >
                <div className='flex items-center gap-2 mb-1'>
                  {isUnread && (
                    <span className='h-2 w-2 rounded-full bg-rose-500 shrink-0' />
                  )}
                  <Megaphone size={14} className='text-[#002EFF]' />
                  <p
                    className={`text-xs flex-1 truncate ${
                      isUnread
                        ? 'font-black text-gray-900'
                        : 'font-bold text-gray-700'
                    }`}
                  >
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