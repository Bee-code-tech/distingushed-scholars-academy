'use client'

import { useEffect, useState } from 'react'
import { CalendarDays, Clock, Lock } from 'lucide-react'
import { Card } from '@/components/ui/card'
import {
  DAYS,
  SLOTS,
  getEffectiveTimetable,
  gridFromApi,
  tintForSubject,
  type TimetableGrid,
} from '@/lib/timetable'
import type { ExamTrack } from '@/lib/studentProfile'
import { Badge } from '@/components/ui/badge'
import { getToken } from '@/lib/auth'
import { isDemoToken } from '@/lib/demoAccounts'
import { dsaApi } from '@/lib/api'

const TRACKS: { id: ExamTrack; label: string }[] = [
  { id: 'jamb', label: 'JAMB' },
  { id: 'waec', label: 'WAEC' },
  { id: 'postutme', label: 'Post-UTME' },
]

/**
 * Read-only weekly timetable with a track selector. Used where a role can view
 * but not edit the schedule (tutors, staff). The ADMIN schedules the timetable.
 */
export default function ReadOnlyTimetable({
  initialTrack = 'jamb',
}: {
  initialTrack?: ExamTrack
}) {
  const [track, setTrack] = useState<ExamTrack>(initialTrack)
  const [grid, setGrid] = useState<TimetableGrid>([])
  const [live, setLive] = useState(false)
  // Live-first: real JWT reads GET /timetable/:track (transposed to [period]
  // [day]); demo/offline falls back to the local store.
  useEffect(() => {
    let cancelled = false
    const local = () => {
      if (cancelled) return
      setGrid(getEffectiveTimetable(track))
      setLive(false)
    }
    const t = getToken()
    if (t && !isDemoToken(t)) {
      dsaApi.timetable
        .get(track)
        .then((res) => {
          if (cancelled) return
          const apiGrid = (res as { grid?: unknown })?.grid
          if (Array.isArray(apiGrid)) {
            setGrid(gridFromApi(apiGrid))
            setLive(true)
          } else local()
        })
        .catch(local)
    } else local()
    return () => {
      cancelled = true
    }
  }, [track])

  return (
    <div className='space-y-5 max-w-5xl mx-auto'>
      <div className='flex items-center justify-between flex-wrap gap-3'>
        <div>
          <h2 className='text-2xl font-black text-[#002EFF] italic uppercase flex items-center gap-2'>
            <CalendarDays size={24} /> Timetable
          </h2>
          <p className='text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5'>
            <Lock size={11} /> View only — scheduled by the admin
            <Badge
              className={`text-[8px] font-black ${live ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}
            >
              {live ? 'Live' : 'Local'}
            </Badge>
          </p>
        </div>
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
      </div>

      <Card className='rounded-3xl border-none shadow-sm bg-white overflow-x-auto'>
        <div className='min-w-[760px]'>
          <div className='grid grid-cols-7 bg-slate-50'>
            <div className='px-4 py-3 text-[9px] font-black uppercase text-gray-400'>Time</div>
            {DAYS.map((d) => (
              <div key={d} className='px-2 py-3 text-[9px] font-black uppercase text-gray-500 text-center'>
                {d.slice(0, 3)}
              </div>
            ))}
          </div>

          {SLOTS.map((slot, slotIdx) => (
            <div key={slot.label} className='grid grid-cols-7 border-t border-slate-50'>
              <div className='px-4 py-2 flex flex-col justify-center'>
                <span className='text-[10px] font-black text-gray-700'>{slot.label}</span>
                <span className='text-[9px] font-bold text-gray-400 flex items-center gap-1'>
                  <Clock size={9} /> {slot.time}
                </span>
              </div>
              {DAYS.map((d, dayIdx) => {
                const subject = grid[slotIdx]?.[dayIdx] ?? ''
                return (
                  <div key={d} className='px-1.5 py-1.5 border-l border-slate-50 flex items-center justify-center'>
                    {subject ? (
                      <span className={`inline-block w-full text-center px-1 py-2 rounded-lg text-[10px] font-black ${tintForSubject(subject)}`}>
                        {subject}
                      </span>
                    ) : (
                      <span className='text-[10px] text-slate-300'>—</span>
                    )}
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
