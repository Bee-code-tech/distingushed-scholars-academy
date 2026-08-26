'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CalendarDays, MapPin, Video, Clock } from 'lucide-react'
import type { ExamTrack, StudyMode, Department } from '@/lib/studentProfile'
import {
  DAYS,
  SLOTS,
  getEffectiveTimetable,
  gridFromApi,
  tintForSubject,
  type TimetableGrid,
} from '@/lib/timetable'
import { getToken } from '@/lib/auth'
import { isDemoToken } from '@/lib/demoAccounts'
import { dsaApi } from '@/lib/api'

export default function Timetable({
  track,
  mode,
  department,
}: {
  track: ExamTrack
  mode: StudyMode
  department: Department | null
}) {
  const isOnline = mode === 'online'

  // Live-first: with a real JWT read GET /timetable/:track (admin-scheduled,
  // source of truth) and transpose to the UI's [period][day] layout; on
  // demo/offline fall back to the local store so the preview still works.
  const [grid, setGrid] = useState<TimetableGrid>([])
  const [live, setLive] = useState(false)
  useEffect(() => {
    let cancelled = false
    const local = () => {
      if (cancelled) return
      setGrid(getEffectiveTimetable(track, department))
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
  }, [track, department])

  return (
    <div className='space-y-6 max-w-6xl mx-auto'>
      <div className='flex items-center justify-between'>
        <div>
          <h2 className='text-2xl font-black text-[#002EFF] italic uppercase flex items-center gap-2'>
            <CalendarDays size={24} /> Timetable
          </h2>
          <p className='text-[10px] font-bold text-gray-400 uppercase tracking-widest'>
            Your weekly class schedule
          </p>
        </div>
        <div className='flex items-center gap-2'>
          <Badge
            className={`text-[8px] font-black ${live ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}
          >
            {live ? 'Live' : 'Local'}
          </Badge>
          <Badge
            className={`text-[9px] font-black flex items-center gap-1 ${isOnline ? 'bg-blue-50 text-[#002EFF]' : 'bg-emerald-50 text-emerald-600'}`}
          >
            {isOnline ? <Video size={11} /> : <MapPin size={11} />}
            {isOnline ? 'Live on DSA Portal' : 'On-Campus'}
          </Badge>
        </div>
      </div>

      <Card className='rounded-3xl border-none shadow-sm bg-white overflow-x-auto'>
        <div className='min-w-[720px]'>
          <div className='grid grid-cols-7 bg-slate-50'>
            <div className='px-4 py-3 text-[9px] font-black uppercase text-gray-400'>
              Time
            </div>
            {DAYS.map((d) => (
              <div
                key={d}
                className='px-3 py-3 text-[9px] font-black uppercase text-gray-500 text-center'
              >
                {d.slice(0, 3)}
              </div>
            ))}
          </div>

          {SLOTS.map((slot, slotIdx) => (
            <div key={slot.label} className='grid grid-cols-7 border-t border-slate-50'>
              <div className='px-4 py-3 flex flex-col justify-center'>
                <span className='text-[10px] font-black text-gray-700'>{slot.label}</span>
                <span className='text-[9px] font-bold text-gray-400 flex items-center gap-1'>
                  <Clock size={9} /> {slot.time}
                </span>
              </div>
              {DAYS.map((d, dayIdx) => {
                const cell = grid[slotIdx]?.[dayIdx] ?? []
                return (
                  <div key={d} className='px-2 py-2 border-l border-slate-50'>
                    {cell.length ? (
                      <div className='flex flex-col gap-1'>
                        {cell.map((s, i) => (
                          <div
                            key={i}
                            className={`rounded-xl px-2 py-1.5 text-center ${tintForSubject(s)}`}
                          >
                            <p className='text-[10px] font-black leading-tight'>
                              {s}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className='rounded-xl px-2 py-2 text-center min-h-[36px] flex items-center justify-center bg-slate-50 text-slate-300'>
                        <p className='text-[10px] font-black'>—</p>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      </Card>

      <div className='flex items-start gap-3 p-4 bg-blue-50/60 rounded-2xl'>
        <CalendarDays className='text-[#002EFF] shrink-0 mt-0.5' size={16} />
        <p className='text-[10px] font-bold text-gray-500 leading-relaxed'>
          {isOnline
            ? 'Online classes run live on the DSA Portal at the times shown (WAT). Recordings are posted after each class.'
            : 'On-campus classes hold at the DSA academy at the times shown (WAT). Please arrive 10 minutes early.'}
        </p>
      </div>
    </div>
  )
}
