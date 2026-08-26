'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card } from '@/components/ui/card'
import {
  CalendarDays,
  Save,
  Loader2,
  Check,
  AlertCircle,
  RotateCcw,
} from 'lucide-react'
import {
  EXAM_TRACKS,
  DEPARTMENT_LABELS,
  type ExamTrack,
  type Department,
} from '@/lib/studentProfile'
import {
  DAYS,
  SLOTS,
  gridFromApi,
  gridToApi,
  emptyGrid,
  timetableKey,
  cellLabel,
  tintForSubject,
  type TimetableGrid,
} from '@/lib/timetable'
import { dsaApi } from '@/lib/api'

// Programmes, in the order the admin picks them.
const PROGRAMMES: ExamTrack[] = [
  'jamb',
  'waec',
  'postutme',
  'undergrad',
  'preclinical',
  'afterschool',
]
const DEPT_SPLIT: ExamTrack[] = ['waec', 'afterschool']
const DEPARTMENTS: Department[] = ['science', 'art', 'commercial']

function adminToken(): string | undefined {
  if (typeof window === 'undefined') return undefined
  return (
    localStorage.getItem('admin_token') ||
    localStorage.getItem('token') ||
    undefined
  )
}

export default function TimetableEditor() {
  const [track, setTrack] = useState<ExamTrack>('jamb')
  const [department, setDepartment] = useState<Department>('science')
  const [grid, setGrid] = useState<TimetableGrid>(emptyGrid())
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isDeptSplit = DEPT_SPLIT.includes(track)
  const key = timetableKey(track, isDeptSplit ? department : null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    setSaved(false)
    try {
      const res = (await dsaApi.timetable.get(key, adminToken())) as {
        grid?: unknown
      }
      setGrid(gridFromApi(res?.grid))
    } catch {
      // No timetable yet for this key (or offline) — start from an empty grid.
      setGrid(emptyGrid())
    } finally {
      setLoading(false)
    }
  }, [key])

  useEffect(() => {
    load()
  }, [load])

  // A cell can hold up to two subjects, typed "Physics / Biology".
  const setCell = (period: number, day: number, value: string) => {
    const cell = value
      .split('/')
      .map((s) => s.trim())
      .filter(Boolean)
      .slice(0, 2)
    setGrid((prev) => {
      const next = prev.map((row) => row.slice())
      if (!next[period]) next[period] = []
      next[period][day] = cell
      setSaved(false)
      return next
    })
  }

  const save = async () => {
    setSaving(true)
    setError(null)
    try {
      await dsaApi.timetable.save(key, gridToApi(grid), adminToken())
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not save the timetable.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className='max-w-5xl mx-auto space-y-5 px-1'>
      <div className='flex flex-wrap items-center justify-between gap-3'>
        <div>
          <h1 className='text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2'>
            <CalendarDays size={20} className='text-[#002EFF]' /> Timetable
          </h1>
          <p className='text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-1'>
            Per programme · {isDeptSplit ? 'per department' : 'all students'}
          </p>
        </div>
        <button
          onClick={save}
          disabled={saving || loading}
          className='flex items-center gap-2 h-10 px-5 bg-[#002EFF] text-white rounded-xl font-black text-[11px] uppercase tracking-wide hover:bg-blue-700 active:scale-[0.98] transition-all disabled:opacity-50'
        >
          {saving ? (
            <Loader2 size={15} className='animate-spin' />
          ) : saved ? (
            <Check size={15} />
          ) : (
            <Save size={15} />
          )}
          {saving ? 'Saving…' : saved ? 'Saved' : 'Save Timetable'}
        </button>
      </div>

      {/* Programme + department pickers */}
      <Card className='p-4 rounded-3xl border-none shadow-sm bg-white space-y-3'>
        <div>
          <p className='text-[9px] font-black uppercase text-slate-400 mb-1.5'>
            Programme
          </p>
          <div className='flex flex-wrap gap-1.5'>
            {PROGRAMMES.map((t) => (
              <button
                key={t}
                onClick={() => setTrack(t)}
                className={`px-3 py-1.5 rounded-lg text-[11px] font-black transition-all ${
                  track === t
                    ? 'bg-[#002EFF] text-white shadow'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                }`}
              >
                {EXAM_TRACKS[t].label}
              </button>
            ))}
          </div>
        </div>
        {isDeptSplit && (
          <div>
            <p className='text-[9px] font-black uppercase text-slate-400 mb-1.5'>
              Department
            </p>
            <div className='flex flex-wrap gap-1.5'>
              {DEPARTMENTS.map((d) => (
                <button
                  key={d}
                  onClick={() => setDepartment(d)}
                  className={`px-3 py-1.5 rounded-lg text-[11px] font-black transition-all ${
                    department === d
                      ? 'bg-[#FCB900] text-[#002EFF] shadow'
                      : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {DEPARTMENT_LABELS[d]}
                </button>
              ))}
            </div>
          </div>
        )}
        <p className='text-[10px] font-medium text-slate-400'>
          Editing <span className='font-black text-slate-600'>{key}</span>. Tip:
          put two courses in one period by separating them with a slash — e.g.
          <span className='font-bold text-slate-600'> Physics / Biology</span>.
        </p>
      </Card>

      {error && (
        <div className='flex items-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-2.5'>
          <AlertCircle size={15} className='text-rose-500 shrink-0' />
          <p className='text-[11px] font-bold text-rose-600'>{error}</p>
        </div>
      )}

      {/* Grid */}
      <Card className='rounded-3xl border-none shadow-sm bg-white overflow-hidden'>
        {loading ? (
          <div className='py-16 flex justify-center'>
            <Loader2 className='animate-spin text-[#002EFF]' />
          </div>
        ) : (
          <div className='overflow-x-auto'>
            <div className='min-w-[720px]'>
              {/* Header */}
              <div className='grid grid-cols-7 bg-slate-50'>
                <div className='px-3 py-2.5 text-[9px] font-black uppercase text-slate-400'>
                  Period
                </div>
                {DAYS.map((d) => (
                  <div
                    key={d}
                    className='px-3 py-2.5 text-[9px] font-black uppercase text-slate-500 text-center'
                  >
                    {d.slice(0, 3)}
                  </div>
                ))}
              </div>
              {/* Rows */}
              {SLOTS.map((slot, period) => (
                <div
                  key={slot.label}
                  className='grid grid-cols-7 border-t border-slate-50'
                >
                  <div className='px-3 py-2 flex flex-col justify-center'>
                    <span className='text-[10px] font-black text-slate-700'>
                      {slot.label}
                    </span>
                    <span className='text-[8px] font-bold text-slate-400'>
                      {slot.time}
                    </span>
                  </div>
                  {DAYS.map((d, day) => {
                    const cell = grid[period]?.[day] ?? []
                    return (
                      <div key={d} className='p-1'>
                        <input
                          value={cellLabel(cell)}
                          onChange={(e) => setCell(period, day, e.target.value)}
                          placeholder='—'
                          className={`w-full h-11 px-2 rounded-lg text-[11px] font-bold text-center outline-none border border-transparent focus:border-[#002EFF]/40 focus:bg-white ${
                            cell.length
                              ? tintForSubject(cell[0])
                              : 'bg-slate-50 text-slate-500'
                          }`}
                        />
                      </div>
                    )
                  })}
                </div>
              ))}
            </div>
          </div>
        )}
      </Card>

      <button
        onClick={load}
        className='flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-[#002EFF]'
      >
        <RotateCcw size={12} /> Reload from server
      </button>
    </div>
  )
}
