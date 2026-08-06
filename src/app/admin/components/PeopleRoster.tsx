'use client'

import { useEffect, useState } from 'react'
import { Users, GraduationCap, Mail, Loader2, Cloud, HardDrive } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { getTutors, getGuardians, type DirectoryPerson } from '@/lib/directoryStore'
import { dsaApi } from '@/lib/api'

function mapPerson(u: Record<string, unknown>, kind: 'tutors' | 'guardians'): DirectoryPerson {
  const s = u as Record<string, string | string[] | undefined>
  const subjects = s.subjects as string[] | undefined
  return {
    key: String(s.username || s.email || s.id || s.fullname || Math.random()),
    name: String(s.fullname || s.fullName || s.name || (kind === 'tutors' ? 'Tutor' : 'Guardian')),
    email: String(s.email || ''),
    extra:
      kind === 'tutors'
        ? String(s.subject || (subjects && subjects[0]) || '') || undefined
        : String(s.wardName || s.ward || '') || undefined,
  }
}

export default function PeopleRoster({ kind }: { kind: 'tutors' | 'guardians' }) {
  const [loading, setLoading] = useState(true)
  const [people, setPeople] = useState<DirectoryPerson[]>([])
  const [source, setSource] = useState<'server' | 'local'>('local')

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const rows = await dsaApi.admin.listUsers(kind === 'tutors' ? 'tutor' : 'parent')
        if (!cancelled && Array.isArray(rows) && rows.length > 0) {
          setPeople(rows.map((r) => mapPerson(r, kind)))
          setSource('server')
          return
        }
        throw new Error('no server data')
      } catch {
        if (!cancelled) {
          setPeople(kind === 'tutors' ? getTutors() : getGuardians())
          setSource('local')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [kind])

  if (loading) {
    return <div className='py-20 flex justify-center'><Loader2 className='animate-spin text-[#002EFF]' /></div>
  }

  const isTutor = kind === 'tutors'
  const title = isTutor ? 'Tutors' : 'Guardians'
  const extraLabel = isTutor ? 'Subject' : 'Ward'
  const Icon = isTutor ? GraduationCap : Users

  return (
    <div className='max-w-5xl mx-auto space-y-4 px-4'>
      <div className='flex items-center gap-2'>
        <Icon size={18} className='text-[#002EFF]' />
        <h1 className='text-2xl font-black text-slate-900 tracking-tight'>{title}</h1>
        <Badge className={`text-[8px] font-black ${source === 'server' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>
          {source === 'server' ? <><Cloud size={9} className='mr-1' /> Live</> : <><HardDrive size={9} className='mr-1' /> Local</>}
        </Badge>
        <span className='ml-auto text-[10px] font-black uppercase text-slate-400'>{people.length} total</span>
      </div>

      <div className='bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden'>
        <div className='grid grid-cols-12 px-5 py-3 bg-slate-50 text-[9px] font-black uppercase text-gray-400'>
          <span className='col-span-5'>Name</span>
          <span className='col-span-4'>Email</span>
          <span className='col-span-3'>{extraLabel}</span>
        </div>
        {people.length === 0 ? (
          <p className='px-5 py-10 text-center text-xs font-bold text-slate-400'>No {title.toLowerCase()} yet.</p>
        ) : (
          people.map((p) => (
            <div key={p.key} className='grid grid-cols-12 items-center px-5 py-4 border-t border-slate-50'>
              <span className='col-span-5 text-xs font-black text-gray-800'>
                {p.name}
                {p.isNew && (
                  <span className='ml-2 text-[8px] font-black uppercase text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded'>New</span>
                )}
              </span>
              <span className='col-span-4 text-[10px] font-bold text-slate-500 flex items-center gap-1 truncate'>
                <Mail size={10} /> {p.email}
              </span>
              <span className='col-span-3 text-[10px] font-bold text-slate-500'>{p.extra || '—'}</span>
            </div>
          ))
        )}
      </div>
      <p className='text-[10px] font-medium text-slate-400'>
        {source === 'server'
          ? 'Live from the server.'
          : `Showing this browser’s list — the server users API (GET /admin/users?role=${isTutor ? 'tutor' : 'parent'}) is not live yet.`}
      </p>
    </div>
  )
}
