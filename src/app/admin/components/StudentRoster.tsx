'use client'

import { useEffect, useState } from 'react'
import { Users, Loader2, Cloud, HardDrive } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { getStudents, type StoredStudent } from '@/lib/studentsStore'
import { dsaApi } from '@/lib/api'

// Map a backend user record (shape TBD) to the row we render, defensively.
function mapStudent(u: Record<string, unknown>): StoredStudent {
  const s = u as Record<string, string | boolean | undefined>
  const mode =
    (s.learningMode as string) ||
    (s.mode as string) ||
    (s.isDsaStudent ? 'physical' : s.isDsaStudent === false ? 'online' : undefined)
  return {
    key: String(s.studentId || s.username || s.email || s.id || s.fullname || Math.random()),
    name: String(s.fullname || s.fullName || s.name || 'Student'),
    track: String(s.examTrack || s.level || s.track || '—').toUpperCase(),
    mode,
  }
}

export default function StudentRoster() {
  const [loading, setLoading] = useState(true)
  const [students, setStudents] = useState<StoredStudent[]>([])
  const [source, setSource] = useState<'server' | 'local'>('local')

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      // Live-first: try the backend list, fall back to the local roster.
      try {
        const rows = await dsaApi.admin.listUsers('student')
        if (!cancelled && Array.isArray(rows) && rows.length > 0) {
          setStudents(rows.map(mapStudent))
          setSource('server')
          return
        }
        throw new Error('no server data')
      } catch {
        if (!cancelled) {
          setStudents(getStudents())
          setSource('local')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  if (loading) {
    return <div className='py-20 flex justify-center'><Loader2 className='animate-spin text-[#002EFF]' /></div>
  }

  return (
    <div className='max-w-5xl mx-auto space-y-4 px-4'>
      <div className='flex items-center gap-2'>
        <Users size={18} className='text-[#002EFF]' />
        <h1 className='text-2xl font-black text-slate-900 tracking-tight'>Students</h1>
        <Badge className={`text-[8px] font-black ${source === 'server' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>
          {source === 'server' ? <><Cloud size={9} className='mr-1' /> Live</> : <><HardDrive size={9} className='mr-1' /> Local</>}
        </Badge>
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
        {source === 'server'
          ? 'Live from the server.'
          : 'Showing this browser’s list — the server students API (GET /admin/users?role=student) is not live yet, so registered students from other devices won’t appear until the backend ships it.'}
      </p>
    </div>
  )
}
