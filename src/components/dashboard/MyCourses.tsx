'use client'

import { useEffect, useState } from 'react'
import { BookOpen, GraduationCap, Loader2, Users } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { getCoursesByCategory, categoryForTrack, categoryLabel } from '@/lib/coursesStore'
import { getUser } from '@/lib/auth'
import { normaliseTrack } from '@/lib/studentProfile'
import type { Course } from '@/lib/types'

export default function MyCourses({ track: trackProp }: { track?: string }) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  if (!mounted) {
    return <div className='py-16 flex justify-center'><Loader2 className='animate-spin text-[#002EFF]' /></div>
  }

  const u = getUser()
  const track = trackProp || normaliseTrack(u?.level || u?.examType || 'jamb')
  const category = categoryForTrack(track)
  const courses = getCoursesByCategory(category)
  const tutors = Array.from(
    new Set(courses.map((c) => c.tutorName).filter(Boolean) as string[]),
  )

  return (
    <div className='space-y-5'>
      <div>
        <h2 className='text-2xl font-black text-[#002EFF] italic uppercase'>My Courses</h2>
        <p className='text-[11px] font-bold text-slate-400'>
          {categoryLabel(category)} · the courses &amp; tutors for your programme.
        </p>
      </div>

      {/* Your tutors */}
      <Card className='p-4 rounded-3xl border-none shadow-sm bg-white'>
        <p className='text-[10px] font-black uppercase text-gray-400 mb-2 flex items-center gap-2'>
          <Users size={13} className='text-[#002EFF]' /> Your tutors
        </p>
        {tutors.length === 0 ? (
          <p className='text-[11px] font-bold text-slate-400'>No tutor assigned yet — check back soon.</p>
        ) : (
          <div className='flex flex-wrap gap-2'>
            {tutors.map((t) => (
              <span key={t} className='px-3 py-1.5 rounded-lg bg-blue-50 text-[#002EFF] text-[10px] font-black uppercase tracking-wide flex items-center gap-1'>
                <GraduationCap size={12} /> {t}
              </span>
            ))}
          </div>
        )}
      </Card>

      {courses.length === 0 ? (
        <p className='text-xs font-bold text-slate-400 py-8 text-center'>No courses published for your programme yet.</p>
      ) : (
        <div className='space-y-2'>
          {courses.map((c: Course) => (
            <Card key={c.id} className='p-4 rounded-2xl border-none shadow-sm bg-white flex items-center gap-3'>
              <div className='h-10 w-10 rounded-xl bg-blue-50 text-[#002EFF] flex items-center justify-center shrink-0'>
                <BookOpen size={18} />
              </div>
              <div className='min-w-0 flex-1'>
                <p className='text-xs font-black text-gray-800 truncate'>{c.title}</p>
                <p className='text-[10px] font-bold text-slate-400'>{c.subject}</p>
              </div>
              {c.tutorName ? (
                <Badge className='bg-blue-50 text-[#002EFF] text-[8px] font-black'>
                  <GraduationCap size={9} className='mr-1' /> {c.tutorName}
                </Badge>
              ) : (
                <Badge className='bg-amber-50 text-amber-600 text-[8px] font-black'>Unassigned</Badge>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
