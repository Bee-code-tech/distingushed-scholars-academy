'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { CalendarDays, Save, RotateCcw, Clock } from 'lucide-react'
import type { ExamTrack } from '@/lib/studentProfile'
import {
  DAYS,
  SLOTS,
  getEffectiveTimetable,
  saveTimetable,
  buildDefaultGrid,
  type TimetableGrid,
} from '@/lib/timetable'

const TRACKS: { id: ExamTrack; label: string }[] = [
  { id: 'jamb', label: 'JAMB' },
  { id: 'waec', label: 'WAEC' },
  { id: 'postutme', label: 'Post-UTME' },
]

/**
 * Admin timetable scheduler. Pick a track, edit each period's subject per day,
 * and save. Students on that track then see it, and tutors view it read-only.
 * The online-class Meet link is handled separately by the tutor (Live Classes).
 * Browser-local until the backend has a timetable endpoint.
 */
export default function TimetableEditor() {
  const [track, setTrack] = useState<ExamTrack>('jamb')
  const [grid, setGrid] = useState<TimetableGrid>([])
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    setGrid(getEffectiveTimetable(track))
    setSaved(false)
  }, [track])

  const setCell = (slotIdx: number, dayIdx: number, value: string) => {
    setSaved(false)
    setGrid((g) =>
      g.map((row, r) =>
        r === slotIdx ? row.map((c, d) => (d === dayIdx ? value : c)) : row,
      ),
    )
  }

  const save = () => {
    saveTimetable(track, grid)
    setSaved(true)
  }
  const reset = () => {
    setGrid(buildDefaultGrid(track))
    setSaved(false)
  }

  return (
    <div className='space-y-6 max-w-5xl mx-auto'>
      <div className='flex items-center justify-between'>
        <div>
          <h2 className='text-2xl font-black text-[#002EFF] italic uppercase flex items-center gap-2'>
            <CalendarDays size={24} /> Edit Timetable
          </h2>
          <p className='text-[10px] font-bold text-gray-400 uppercase tracking-widest'>
            Set the weekly schedule students see
          </p>
        </div>
        <div className='flex items-center gap-2'>
          <button
            onClick={reset}
            className='flex items-center gap-1 px-3 h-9 rounded-xl border border-slate-200 text-slate-500 text-[10px] font-black uppercase hover:bg-slate-50'
          >
            <RotateCcw size={12} /> Reset
          </button>
          <button
            onClick={save}
            className='flex items-center gap-1 px-5 h-9 rounded-xl bg-[#002EFF] text-white text-[10px] font-black uppercase shadow-lg shadow-blue-200 hover:bg-blue-700 active:scale-95 transition-all'
          >
            <Save size={13} /> {saved ? 'Saved ✓' : 'Save'}
          </button>
        </div>
      </div>

      {/* Track selector */}
      <div className='inline-flex gap-1 p-1 bg-slate-100 rounded-xl'>
        {TRACKS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTrack(t.id)}
            className={`px-4 py-2 rounded-lg text-[11px] font-black uppercase transition-all ${
              track === t.id
                ? 'bg-white text-[#002EFF] shadow-sm'
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            {t.label}
          </button>
        ))}
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
              {DAYS.map((d, dayIdx) => (
                <div key={d} className='px-1.5 py-1.5 border-l border-slate-50'>
                  <input
                    value={grid[slotIdx]?.[dayIdx] ?? ''}
                    onChange={(e) => setCell(slotIdx, dayIdx, e.target.value)}
                    placeholder='—'
                    className='w-full text-center text-[10px] font-black text-gray-700 bg-slate-50 rounded-lg px-1 py-2 outline-none focus:bg-white focus:ring-2 focus:ring-[#002EFF]/20 transition-all'
                  />
                </div>
              ))}
            </div>
          ))}
        </div>
      </Card>

      <p className='text-[10px] font-bold text-gray-400'>
        Clear a cell to leave that period free. Changes apply to every student on
        the selected track once saved.
      </p>
    </div>
  )
}
