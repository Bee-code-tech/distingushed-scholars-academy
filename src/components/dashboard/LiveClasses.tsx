'use client'

import React, { useEffect, useState } from 'react'
import {
  Video,
  Save,
  Radio,
  Square,
  Clock,
  CalendarDays,
  Link as LinkIcon,
  Info,
  Loader2,
  PlayCircle,
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  getMeetLink,
  saveMeetLink,
  getLiveStatus,
  setLiveStatus,
  type LiveStatus,
} from '@/lib/liveClass'
import { getEffectiveTimetable, getNextClass } from '@/lib/timetable'
import { getUser } from '@/lib/auth'
import { normaliseTrack, EXAM_TRACKS } from '@/lib/studentProfile'
import type { ExamTrack } from '@/lib/studentProfile'

const TRACKS: { id: ExamTrack; label: string }[] = [
  { id: 'jamb', label: 'JAMB' },
  { id: 'waec', label: 'WAEC' },
  { id: 'postutme', label: 'Post-UTME' },
]

function NextClassCard({ track }: { track: ExamTrack }) {
  const next = getNextClass(getEffectiveTimetable(track))
  if (!next) {
    return <p className='text-[11px] font-bold text-slate-400'>No class scheduled in the coming week.</p>
  }
  return (
    <div className='flex items-center gap-3'>
      <div className={`text-center p-3 rounded-2xl min-w-[64px] ${next.ongoing ? 'bg-[#FCB900] text-[#002EFF]' : 'bg-blue-50 text-gray-700'}`}>
        <p className='text-[9px] font-black uppercase'>{next.when}</p>
        <p className='text-[11px] font-black'>{next.time.split(' ')[0]}</p>
      </div>
      <div>
        <div className='flex items-center gap-2'>
          <h4 className='text-sm font-black text-gray-800 uppercase'>{next.subject}</h4>
          {next.ongoing && <Badge className='bg-red-500 text-white text-[8px] font-black animate-pulse'>ONGOING</Badge>}
        </div>
        <p className='text-[10px] font-bold text-gray-400 flex items-center gap-1'>
          <Clock size={11} /> {next.day} · {next.time}
        </p>
      </div>
    </div>
  )
}

function StatusPill({ status }: { status: LiveStatus }) {
  const map: Record<LiveStatus, string> = {
    scheduled: 'bg-slate-100 text-slate-500',
    live: 'bg-red-500 text-white animate-pulse',
    ended: 'bg-slate-200 text-slate-500',
  }
  return <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase ${map[status]}`}>{status}</span>
}

export default function LiveClasses({
  mode,
  track: trackProp,
}: {
  mode: 'tutor' | 'student'
  track?: string
}) {
  const [mounted, setMounted] = useState(false)
  const [tick, setTick] = useState(0)
  const refresh = () => setTick((t) => t + 1)
  useEffect(() => setMounted(true), [])

  if (!mounted) {
    return (
      <div className='py-16 flex justify-center'>
        <Loader2 className='animate-spin text-[#002EFF]' />
      </div>
    )
  }

  if (mode === 'tutor') return <TutorLive key={tick} onChange={refresh} />

  const u = getUser()
  const track = (trackProp || normaliseTrack(u?.level || u?.examType || 'jamb')) as ExamTrack
  return <StudentLive key={tick} track={track} />
}

/* ---------------- Tutor: upload link + control status ---------------- */
function TutorLive({ onChange }: { onChange: () => void }) {
  const [track, setTrack] = useState<ExamTrack>('jamb')
  const [link, setLink] = useState('')
  const [saved, setSaved] = useState(false)
  const status = getLiveStatus(track)

  useEffect(() => {
    setLink(getMeetLink(track))
    setSaved(false)
  }, [track])

  const save = () => {
    saveMeetLink(track, link)
    setSaved(true)
    onChange()
  }
  const setStatus = (s: LiveStatus) => {
    setLiveStatus(track, s)
    onChange()
  }

  return (
    <div className='space-y-5 max-w-3xl'>
      <div>
        <h2 className='text-2xl font-black text-[#002EFF] italic uppercase'>Live Classes</h2>
        <p className='text-[11px] font-bold text-slate-400'>Upload the class link and go live for your students.</p>
      </div>

      {/* Admin-generates note */}
      <div className='flex items-start gap-2 p-3 rounded-2xl bg-amber-50 border border-amber-100'>
        <Info size={15} className='text-amber-600 shrink-0 mt-0.5' />
        <p className='text-[11px] font-bold text-amber-800 leading-relaxed'>
          The admin generates the Google Meet link and shares it with you. Paste
          it here per track, then set the class <b>Live</b> when it starts.
        </p>
      </div>

      {/* Track selector */}
      <div className='inline-flex gap-1 p-1 bg-slate-100 rounded-xl'>
        {TRACKS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTrack(t.id)}
            className={`px-4 py-2 rounded-lg text-[11px] font-black uppercase transition-all ${
              track === t.id ? 'bg-white text-[#002EFF] shadow-sm' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <Card className='p-5 rounded-3xl border-none shadow-sm bg-white space-y-4'>
        <div className='flex items-center justify-between'>
          <p className='text-[10px] font-black uppercase text-gray-400'>
            {EXAM_TRACKS[track].label} online class
          </p>
          <StatusPill status={status} />
        </div>

        <NextClassCard track={track} />

        <div className='space-y-1.5'>
          <label className='text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5'>
            <LinkIcon size={13} className='text-[#002EFF]' /> Google Meet link
          </label>
          <div className='flex gap-2'>
            <input
              value={link}
              onChange={(e) => { setLink(e.target.value); setSaved(false) }}
              placeholder='https://meet.google.com/abc-defg-hij'
              className='flex-1 h-11 px-3 rounded-lg bg-slate-50 border border-transparent focus:bg-white focus:border-[#002EFF]/30 outline-none text-sm font-medium transition-all'
            />
            <button onClick={save} className='flex items-center gap-1.5 px-4 h-11 rounded-xl bg-[#002EFF] text-white text-[10px] font-black uppercase hover:bg-blue-700'>
              <Save size={13} /> {saved ? 'Saved' : 'Save'}
            </button>
          </div>
        </div>

        {/* Status controls */}
        <div className='flex items-center gap-2 pt-1 border-t border-slate-50'>
          <span className='text-[10px] font-black uppercase text-slate-400 mr-1'>Class:</span>
          <button
            onClick={() => setStatus('live')}
            disabled={!link.trim()}
            className='flex items-center gap-1.5 h-9 px-3 rounded-lg bg-red-500 text-white text-[10px] font-black uppercase disabled:opacity-40 hover:brightness-105'
          >
            <Radio size={13} /> Go live
          </button>
          <button
            onClick={() => setStatus('ended')}
            className='flex items-center gap-1.5 h-9 px-3 rounded-lg bg-slate-100 text-slate-600 text-[10px] font-black uppercase hover:bg-slate-200'
          >
            <Square size={12} /> End
          </button>
          {!link.trim() && (
            <span className='text-[10px] font-bold text-slate-400'>Add a link to go live</span>
          )}
        </div>
      </Card>
    </div>
  )
}

/* ---------------- Student: join ---------------- */
function StudentLive({ track }: { track: ExamTrack }) {
  const link = getMeetLink(track)
  const status = getLiveStatus(track)
  const canJoin = status === 'live' && !!link

  return (
    <div className='space-y-5 max-w-2xl'>
      <div>
        <h2 className='text-2xl font-black text-[#002EFF] italic uppercase'>Live Class</h2>
        <p className='text-[11px] font-bold text-slate-400'>Join your online class when your tutor is live.</p>
      </div>

      <Card className='p-6 rounded-3xl border-none shadow-sm bg-white space-y-5'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-2'>
            <CalendarDays size={16} className='text-[#002EFF]' />
            <span className='text-[10px] font-black uppercase text-gray-400'>{EXAM_TRACKS[track].label} · Next class</span>
          </div>
          <StatusPill status={status} />
        </div>

        <NextClassCard track={track} />

        {canJoin ? (
          <a
            href={link}
            target='_blank'
            rel='noreferrer'
            className='flex items-center justify-center gap-2 h-14 rounded-2xl bg-[#002EFF] text-white font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-100 hover:bg-blue-700 active:scale-[0.98] transition-all'
          >
            <Video size={18} /> Join Live Class
          </a>
        ) : (
          <div className='flex items-center justify-center gap-2 h-14 rounded-2xl bg-slate-50 text-slate-400 font-black text-[11px] uppercase tracking-widest'>
            <PlayCircle size={16} />
            {!link
              ? 'Class link not set yet'
              : status === 'ended'
                ? 'This class has ended'
                : 'Class has not started yet'}
          </div>
        )}
        <p className='text-[10px] font-medium text-slate-400 text-center'>
          The button activates when your tutor sets the class live.
        </p>
      </Card>
    </div>
  )
}
