'use client'

import { useEffect, useState } from 'react'
import { Users, Loader2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { getStudents, type StoredStudent } from '@/lib/studentsStore'

// Live student roster (from the students store; becomes the real
// GET /api/... students list once the backend ships it).
export default function StudentRoster() {
  const [mounted, setMounted] = useState(false)
  const [students, setStudents] = useState<StoredStudent[]>([])
  useEffect(() => {
    setMounted(true)
    setStudents(getStudents())
  }, [])

  if (!mounted) {
    return <div className='py-20 flex justify-center'><Loader2 className='animate-spin text-[#002EFF]' /></div>
  }

  return (
    <div className='max-w-5xl mx-auto space-y-4 px-4'>
      <div className='flex items-center gap-2'>
        <Users size={18} className='text-[#002EFF]' />
        <h1 className='text-2xl font-black text-slate-900 tracking-tight'>Students</h1>
        <span className='ml-auto text-[10px] font-black uppercase text-slate-400'>{students.length} total</span>
      </div>

      <div className='bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden'>
        <div className='grid grid-cols-12 px-5 py-3 bg-slate-50 text-[9px] font-black uppercase text-gray-400'>
          <span className='col-span-5'>Student</span>
          <span className='col-span-3'>Track</span>
          <span className='col-span-4'>Mode</span>
        </div>
        {students.length === 0 ? (
          <p className='px-5 py-10 text-center text-xs font-bold text-slate-400'>No students yet.</p>
        ) : (
          students.map((s) => (
            <div key={s.key} className='grid grid-cols-12 items-center px-5 py-4 border-t border-slate-50'>
              <span className='col-span-5 text-xs font-black text-gray-800'>
                {s.name}
                {s.isNew && (
                  <span className='ml-2 text-[8px] font-black uppercase text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded'>New</span>
                )}
              </span>
              <span className='col-span-3'>
                <Badge className='bg-blue-50 text-[#002EFF] text-[8px] font-black'>{s.track}</Badge>
              </span>
              <span className='col-span-4 text-[10px] font-bold text-slate-500'>
                {s.mode === 'physical' ? 'On-Campus' : s.mode === 'online' ? 'Online' : '—'}
              </span>
            </div>
          ))
        )}
      </div>
      <p className='text-[10px] font-medium text-slate-400'>
        Registered students appear here. Full server-backed list arrives with the students API.
      </p>
    </div>
  )
}
