'use client'

import { useEffect, useState } from 'react'
import { Users, GraduationCap, Mail, Loader2 } from 'lucide-react'
import { getTutors, getGuardians, type DirectoryPerson } from '@/lib/directoryStore'

export default function PeopleRoster({ kind }: { kind: 'tutors' | 'guardians' }) {
  const [mounted, setMounted] = useState(false)
  const [people, setPeople] = useState<DirectoryPerson[]>([])
  useEffect(() => {
    setMounted(true)
    setPeople(kind === 'tutors' ? getTutors() : getGuardians())
  }, [kind])

  if (!mounted) {
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
        {isTutor ? 'Tutors' : 'Guardians'} created here appear in this list. Full server-backed
        list arrives with the users API.
      </p>
    </div>
  )
}
