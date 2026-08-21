// 'use client'

// import { useState, useEffect, useCallback } from 'react'
// import { Card } from '@/components/ui/card'
// import {
//   CalendarDays,
//   Save,
//   RotateCcw,
//   Clock,
//   Loader2,
//   AlertCircle,
//   CheckCircle2,
// } from 'lucide-react'
// import type { ExamTrack } from '@/lib/studentProfile'
// import { adminApi, AcademicTrack } from '@/lib/admin-api'
// import {
//   DAYS,
//   SLOTS,
//   buildDefaultGrid,
//   type TimetableGrid,
// } from '@/lib/timetable'

// const TRACKS: { id: ExamTrack; label: string }[] = [
//   { id: 'jamb', label: 'JAMB' },
//   { id: 'waec', label: 'WAEC' },
//   { id: 'postutme', label: 'Post-UTME' },
// ]

// /**
//  * Normalizes backend grid into 4 slots x 6 days array matrix
//  */
// function normalizeGrid(backendGrid?: string[][]): TimetableGrid {
//   const numSlots = SLOTS.length // 4 slots
//   const numDays = DAYS.length // 6 days

//   // Default empty grid structure
//   const normalized: TimetableGrid = Array.from({ length: numSlots }, () =>
//     Array(numDays).fill(''),
//   )

//   if (!backendGrid || !Array.isArray(backendGrid)) {
//     return normalized
//   }

//   // Handle backend returning (6 days x 4 slots) vs (4 slots x 6 days)
//   const isTransposed =
//     backendGrid.length === numDays && (backendGrid[0]?.length ?? 0) === numSlots

//   for (let s = 0; s < numSlots; s++) {
//     for (let d = 0; d < numDays; d++) {
//       if (isTransposed) {
//         normalized[s][d] = backendGrid[d]?.[s] ?? ''
//       } else {
//         normalized[s][d] = backendGrid[s]?.[d] ?? ''
//       }
//     }
//   }

//   return normalized
// }

// export default function TimetableEditor() {
//   const [track, setTrack] = useState<ExamTrack>('jamb')
//   const [grid, setGrid] = useState<TimetableGrid>([])

//   // Async states
//   const [loading, setLoading] = useState<boolean>(true)
//   const [saving, setSaving] = useState<boolean>(false)
//   const [saved, setSaved] = useState<boolean>(false)
//   const [error, setError] = useState<string | null>(null)

//   // Fetch timetable from backend API
//   const fetchTimetable = useCallback(async (selectedTrack: ExamTrack) => {
//     setLoading(true)
//     setError(null)
//     setSaved(false)
//     try {
//       const response = await adminApi.getTimetable(
//         selectedTrack as AcademicTrack,
//       )
//       if (response.success && response.data?.grid) {
//         setGrid(normalizeGrid(response.data.grid))
//       } else {
//         setGrid(buildDefaultGrid(selectedTrack))
//       }
//     } catch (err: any) {
//       console.error('Failed to load timetable:', err)
//       setError(err?.message || 'Failed to fetch timetable from server.')
//       setGrid(buildDefaultGrid(selectedTrack))
//     } finally {
//       setLoading(false)
//     }
//   }, [])

//   useEffect(() => {
//     fetchTimetable(track)
//   }, [track, fetchTimetable])

//   const setCell = (slotIdx: number, dayIdx: number, value: string) => {
//     setSaved(false)
//     setError(null)
//     setGrid((g) =>
//       g.map((row, r) =>
//         r === slotIdx ? row.map((c, d) => (d === dayIdx ? value : c)) : row,
//       ),
//     )
//   }

//   // Save changes to backend API
//   const handleSave = async () => {
//     setSaving(true)
//     setError(null)
//     try {
//       const response = await adminApi.updateTimetable(
//         track as AcademicTrack,
//         grid,
//       )
//       if (response.success) {
//         setSaved(true)
//         setTimeout(() => setSaved(false), 4000)
//       } else {
//         throw new Error('Save failed on server')
//       }
//     } catch (err: any) {
//       console.error('Failed to update timetable:', err)
//       setError(err?.message || 'Could not save timetable. Please try again.')
//     } finally {
//       setSaving(false)
//     }
//   }

//   const handleReset = () => {
//     setGrid(buildDefaultGrid(track))
//     setSaved(false)
//     setError(null)
//   }

//   return (
//     <div className='space-y-6 max-w-5xl mx-auto'>
//       <div className='flex items-center justify-between'>
//         <div>
//           <h2 className='text-2xl font-black text-[#002EFF] italic uppercase flex items-center gap-2'>
//             <CalendarDays size={24} /> Edit Timetable
//           </h2>
//           <p className='text-[10px] font-bold text-gray-400 uppercase tracking-widest'>
//             Set the weekly schedule students see
//           </p>
//         </div>

//         <div className='flex items-center gap-2'>
//           <button
//             onClick={handleReset}
//             disabled={loading || saving}
//             className='flex items-center gap-1 px-3 h-9 rounded-xl border border-slate-200 text-slate-500 text-[10px] font-black uppercase hover:bg-slate-50 disabled:opacity-50 transition-all'
//           >
//             <RotateCcw size={12} /> Reset
//           </button>
//           <button
//             onClick={handleSave}
//             disabled={loading || saving}
//             className='flex items-center gap-1.5 px-5 h-9 rounded-xl bg-[#002EFF] text-white text-[10px] font-black uppercase shadow-lg shadow-blue-200 hover:bg-blue-700 active:scale-95 disabled:opacity-50 transition-all'
//           >
//             {saving ? (
//               <>
//                 <Loader2 size={13} className='animate-spin' /> Saving...
//               </>
//             ) : saved ? (
//               <>
//                 <CheckCircle2 size={13} /> Saved ✓
//               </>
//             ) : (
//               <>
//                 <Save size={13} /> Save
//               </>
//             )}
//           </button>
//         </div>
//       </div>

//       {/* Notifications */}
//       {error && (
//         <div className='p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-xs font-bold flex items-center gap-2'>
//           <AlertCircle size={16} />
//           <span>{error}</span>
//         </div>
//       )}

//       {saved && (
//         <div className='p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-600 text-xs font-bold flex items-center gap-2'>
//           <CheckCircle2 size={16} />
//           <span>
//             Timetable for {track.toUpperCase()} successfully updated on server.
//           </span>
//         </div>
//       )}

//       {/* Track selector */}
//       <div className='inline-flex gap-1 p-1 bg-slate-100 rounded-xl'>
//         {TRACKS.map((t) => (
//           <button
//             key={t.id}
//             disabled={loading || saving}
//             onClick={() => setTrack(t.id)}
//             className={`px-4 py-2 rounded-lg text-[11px] font-black uppercase transition-all ${
//               track === t.id
//                 ? 'bg-white text-[#002EFF] shadow-sm'
//                 : 'text-slate-400 hover:text-slate-600'
//             }`}
//           >
//             {t.label}
//           </button>
//         ))}
//       </div>

//       <Card className='rounded-3xl border-none shadow-sm bg-white overflow-x-auto relative'>
//         {loading ? (
//           <div className='py-20 flex flex-col items-center justify-center text-slate-400 gap-2'>
//             <Loader2 size={24} className='animate-spin text-[#002EFF]' />
//             <span className='text-xs font-bold uppercase tracking-wider'>
//               Fetching timetable grid...
//             </span>
//           </div>
//         ) : (
//           <div className='min-w-[760px]'>
//             <div className='grid grid-cols-7 bg-slate-50'>
//               <div className='px-4 py-3 text-[9px] font-black uppercase text-gray-400'>
//                 Time
//               </div>
//               {DAYS.map((d) => (
//                 <div
//                   key={d}
//                   className='px-2 py-3 text-[9px] font-black uppercase text-gray-500 text-center'
//                 >
//                   {d.slice(0, 3)}
//                 </div>
//               ))}
//             </div>

//             {SLOTS.map((slot, slotIdx) => (
//               <div
//                 key={slot.label}
//                 className='grid grid-cols-7 border-t border-slate-50'
//               >
//                 <div className='px-4 py-2 flex flex-col justify-center bg-slate-50/50'>
//                   <span className='text-[10px] font-black text-gray-700'>
//                     {slot.label}
//                   </span>
//                   <span className='text-[9px] font-bold text-gray-400 flex items-center gap-1'>
//                     <Clock size={9} /> {slot.time}
//                   </span>
//                 </div>
//                 {DAYS.map((d, dayIdx) => (
//                   <div
//                     key={d}
//                     className='px-1.5 py-1.5 border-l border-slate-50'
//                   >
//                     <input
//                       disabled={saving}
//                       value={grid[slotIdx]?.[dayIdx] ?? ''}
//                       onChange={(e) => setCell(slotIdx, dayIdx, e.target.value)}
//                       placeholder='—'
//                       className='w-full text-center text-[10px] font-black text-gray-700 bg-slate-50 rounded-lg px-1 py-2 outline-none focus:bg-white focus:ring-2 focus:ring-[#002EFF]/20 disabled:opacity-50 transition-all'
//                     />
//                   </div>
//                 ))}
//               </div>
//             ))}
//           </div>
//         )}
//       </Card>

//       <p className='text-[10px] font-bold text-gray-400'>
//         Clear a cell to leave that period free. Changes apply to every student
//         on the selected track once saved.
//       </p>
//     </div>
//   )
// }

'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card } from '@/components/ui/card'
import {
  CalendarDays,
  Save,
  RotateCcw,
  Clock,
  Loader2,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react'
import type { ExamTrack } from '@/lib/studentProfile'
import { adminApi, AcademicTrack } from '@/lib/admin-api'
import {
  DAYS,
  SLOTS,
  buildDefaultGrid,
  type TimetableGrid,
} from '@/lib/timetable'

const TRACKS: { id: ExamTrack; label: string }[] = [
  { id: 'jamb', label: 'JAMB' },
  { id: 'waec', label: 'WAEC' },
  { id: 'postutme', label: 'Post-UTME' },
]

/**
 * Normalizes backend grid (6 days x 4 slots) into frontend state matrix (4 slots x 6 days)
 */
function normalizeGrid(backendGrid?: string[][]): TimetableGrid {
  const numSlots = SLOTS.length // 4 slots
  const numDays = DAYS.length // 6 days

  // Default empty grid structure (4 slots x 6 days)
  const normalized: TimetableGrid = Array.from({ length: numSlots }, () =>
    Array(numDays).fill(''),
  )

  if (!backendGrid || !Array.isArray(backendGrid)) {
    return normalized
  }

  // Backend spec: 6 days (outer) x 4 slots (inner)
  const isBackendFormat = backendGrid.length === numDays

  for (let s = 0; s < numSlots; s++) {
    for (let d = 0; d < numDays; d++) {
      if (isBackendFormat) {
        normalized[s][d] = backendGrid[d]?.[s] ?? ''
      } else {
        normalized[s][d] = backendGrid[s]?.[d] ?? ''
      }
    }
  }

  return normalized
}

/**
 * Transposes UI state matrix (4 slots x 6 days) to Backend structure (6 days x 4 slots)
 */
function serializeGridForBackend(uiGrid: TimetableGrid): string[][] {
  const numDays = DAYS.length // 6
  const numSlots = SLOTS.length // 4

  const payload: string[][] = Array.from({ length: numDays }, () =>
    Array(numSlots).fill(''),
  )

  for (let d = 0; d < numDays; d++) {
    for (let s = 0; s < numSlots; s++) {
      payload[d][s] = uiGrid[s]?.[d] ?? ''
    }
  }

  return payload
}

export default function TimetableEditor() {
  const [track, setTrack] = useState<ExamTrack>('jamb')
  const [grid, setGrid] = useState<TimetableGrid>([])

  // Async states
  const [loading, setLoading] = useState<boolean>(true)
  const [saving, setSaving] = useState<boolean>(false)
  const [saved, setSaved] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch timetable from backend API
  const fetchTimetable = useCallback(async (selectedTrack: ExamTrack) => {
    setLoading(true)
    setError(null)
    setSaved(false)
    try {
      const response = await adminApi.getTimetable(
        selectedTrack as AcademicTrack,
      )
      if (response.success && response.data?.grid) {
        setGrid(normalizeGrid(response.data.grid))
      } else {
        setGrid(buildDefaultGrid(selectedTrack))
      }
    } catch (err: any) {
      console.error('Failed to load timetable:', err)
      setError(err?.message || 'Failed to fetch timetable from server.')
      setGrid(buildDefaultGrid(selectedTrack))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchTimetable(track)
  }, [track, fetchTimetable])

  const setCell = (slotIdx: number, dayIdx: number, value: string) => {
    setSaved(false)
    setError(null)
    setGrid((g) =>
      g.map((row, r) =>
        r === slotIdx ? row.map((c, d) => (d === dayIdx ? value : c)) : row,
      ),
    )
  }

  // Save changes to backend API
  const handleSave = async () => {
    setSaving(true)
    setError(null)
    try {
      // Convert UI grid (4x6) back to backend format (6x4)
      const payloadGrid = serializeGridForBackend(grid)

      const response = await adminApi.updateTimetable(
        track as AcademicTrack,
        payloadGrid,
      )
      if (response.success) {
        setSaved(true)
        setTimeout(() => setSaved(false), 4000)
      } else {
        throw new Error('Save failed on server')
      }
    } catch (err: any) {
      console.error('Failed to update timetable:', err)
      setError(err?.message || 'Could not save timetable. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleReset = () => {
    setGrid(buildDefaultGrid(track))
    setSaved(false)
    setError(null)
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
            onClick={handleReset}
            disabled={loading || saving}
            className='flex items-center gap-1 px-3 h-9 rounded-xl border border-slate-200 text-slate-500 text-[10px] font-black uppercase hover:bg-slate-50 disabled:opacity-50 transition-all'
          >
            <RotateCcw size={12} /> Reset
          </button>
          <button
            onClick={handleSave}
            disabled={loading || saving}
            className='flex items-center gap-1.5 px-5 h-9 rounded-xl bg-[#002EFF] text-white text-[10px] font-black uppercase shadow-lg shadow-blue-200 hover:bg-blue-700 active:scale-95 disabled:opacity-50 transition-all'
          >
            {saving ? (
              <>
                <Loader2 size={13} className='animate-spin' /> Saving...
              </>
            ) : saved ? (
              <>
                <CheckCircle2 size={13} /> Saved ✓
              </>
            ) : (
              <>
                <Save size={13} /> Save
              </>
            )}
          </button>
        </div>
      </div>

      {/* Notifications */}
      {error && (
        <div className='p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-xs font-bold flex items-center gap-2'>
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {saved && (
        <div className='p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-600 text-xs font-bold flex items-center gap-2'>
          <CheckCircle2 size={16} />
          <span>
            Timetable for {track.toUpperCase()} successfully updated on server.
          </span>
        </div>
      )}

      {/* Track selector */}
      <div className='inline-flex gap-1 p-1 bg-slate-100 rounded-xl'>
        {TRACKS.map((t) => (
          <button
            key={t.id}
            disabled={loading || saving}
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

      <Card className='rounded-3xl border-none shadow-sm bg-white overflow-x-auto relative'>
        {loading ? (
          <div className='py-20 flex flex-col items-center justify-center text-slate-400 gap-2'>
            <Loader2 size={24} className='animate-spin text-[#002EFF]' />
            <span className='text-xs font-bold uppercase tracking-wider'>
              Fetching timetable grid...
            </span>
          </div>
        ) : (
          <div className='min-w-[760px]'>
            <div className='grid grid-cols-7 bg-slate-50'>
              <div className='px-4 py-3 text-[9px] font-black uppercase text-gray-400'>
                Time
              </div>
              {DAYS.map((d) => (
                <div
                  key={d}
                  className='px-2 py-3 text-[9px] font-black uppercase text-gray-500 text-center'
                >
                  {d.slice(0, 3)}
                </div>
              ))}
            </div>

            {SLOTS.map((slot, slotIdx) => (
              <div
                key={slot.label}
                className='grid grid-cols-7 border-t border-slate-50'
              >
                <div className='px-4 py-2 flex flex-col justify-center bg-slate-50/50'>
                  <span className='text-[10px] font-black text-gray-700'>
                    {slot.label}
                  </span>
                  <span className='text-[9px] font-bold text-gray-400 flex items-center gap-1'>
                    <Clock size={9} /> {slot.time}
                  </span>
                </div>
                {DAYS.map((d, dayIdx) => (
                  <div
                    key={d}
                    className='px-1.5 py-1.5 border-l border-slate-50'
                  >
                    <input
                      disabled={saving}
                      value={grid[slotIdx]?.[dayIdx] ?? ''}
                      onChange={(e) => setCell(slotIdx, dayIdx, e.target.value)}
                      placeholder='—'
                      className='w-full text-center text-[10px] font-black text-gray-700 bg-slate-50 rounded-lg px-1 py-2 outline-none focus:bg-white focus:ring-2 focus:ring-[#002EFF]/20 disabled:opacity-50 transition-all'
                    />
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
      </Card>

      <p className='text-[10px] font-bold text-gray-400'>
        Clear a cell to leave that period free. Changes apply to every student
        on the selected track once saved.
      </p>
    </div>
  )
}