'use client'

import { useCallback, useEffect, useState } from 'react'
import { BookOpen, GraduationCap, Loader2, Users } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  getCoursesByCategory,
  categoryForTrack,
  categoryLabel,
} from '@/lib/coursesStore'
import { getUser, getToken } from '@/lib/auth'
import { isDemoToken } from '@/lib/demoAccounts'
import { dsaApi } from '@/lib/api'
import { normaliseTrack } from '@/lib/studentProfile'
import type { CourseCategory } from '@/lib/types'

// Display shape shared by the live API and the local store.
type UICourse = {
  id: string
  title: string
  subject?: string
  tutorName?: string
  progressPercent?: number
}

function isLive(): boolean {
  const t = getToken()
  return !!t && !isDemoToken(t)
}

/** Map a live `/courses/mine` row (tutor is nested; progressPercent present). */
function fromLive(c: Record<string, unknown>): UICourse {
  const tutor = (c.tutor ?? {}) as Record<string, unknown>
  return {
    id: String(c.id ?? c._id ?? ''),
    title: String(c.title ?? 'Course'),
    subject: c.subject ? String(c.subject) : undefined,
    tutorName:
      (c.tutorName as string) ||
      (tutor.fullname as string) ||
      (tutor.fullName as string) ||
      undefined,
    progressPercent:
      typeof c.progressPercent === 'number' ? c.progressPercent : undefined,
  }
}

/**
 * Student "My Courses" — the courses & tutors for the student's programme.
 *
 * Live-first: with a real JWT it reads GET /courses/mine (the backend derives
 * the student's category from programmes + level, so it is the source of
 * truth). On demo/offline it falls back to the local coursesStore keyed off the
 * student's track so the preview still works.
 */
export default function MyCourses({ track: trackProp }: { track?: string }) {
  const [mounted, setMounted] = useState(false)
  const [loading, setLoading] = useState(true)
  const [courses, setCourses] = useState<UICourse[]>([])
  const [live, setLive] = useState(false)
  const [category, setCategory] = useState<CourseCategory>('jamb-putme')

  const load = useCallback(async () => {
    const u = getUser()
    const track = trackProp || normaliseTrack(u?.level || u?.examType || 'jamb')
    const localCategory = categoryForTrack(track)
    setCategory(localCategory)

    if (isLive()) {
      try {
        const rows = (await dsaApi.courses.mine()) as Record<string, unknown>[]
        setCourses(rows.map(fromLive))
        setLive(true)
        setLoading(false)
        return
      } catch {
        // fall through to the local store
      }
    }

    const localCourses = getCoursesByCategory(localCategory).map((c) => ({
      id: c.id,
      title: c.title,
      subject: c.subject,
      tutorName: c.tutorName,
    }))
    setCourses(localCourses)
    setLive(false)
    setLoading(false)
  }, [trackProp])

  useEffect(() => {
    setMounted(true)
    void load()
  }, [load])

  if (!mounted || loading) {
    return (
      <div className='py-16 flex justify-center'>
        <Loader2 className='animate-spin text-[#002EFF]' />
      </div>
    )
  }

  const tutors = Array.from(
    new Set(courses.map((c) => c.tutorName).filter(Boolean) as string[]),
  )

  return (
    <div className='space-y-5'>
      <div className='flex items-start justify-between gap-3'>
        <div>
          <h2 className='text-2xl font-black text-[#002EFF] italic uppercase'>
            My Courses
          </h2>
          <p className='text-[11px] font-bold text-slate-400'>
            {categoryLabel(category)} · the courses &amp; tutors for your
            programme.
          </p>
        </div>
        <Badge
          className={`text-[8px] font-black shrink-0 ${
            live ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'
          }`}
        >
          {live ? 'Live' : 'Local'}
        </Badge>
      </div>

      {/* Your tutors */}
      <Card className='p-4 rounded-3xl border-none shadow-sm bg-white'>
        <p className='text-[10px] font-black uppercase text-gray-400 mb-2 flex items-center gap-2'>
          <Users size={13} className='text-[#002EFF]' /> Your tutors
        </p>
        {tutors.length === 0 ? (
          <p className='text-[11px] font-bold text-slate-400'>
            No tutor assigned yet — check back soon.
          </p>
        ) : (
          <div className='flex flex-wrap gap-2'>
            {tutors.map((t) => (
              <span
                key={t}
                className='px-3 py-1.5 rounded-lg bg-blue-50 text-[#002EFF] text-[10px] font-black uppercase tracking-wide flex items-center gap-1'
              >
                <GraduationCap size={12} /> {t}
              </span>
            ))}
          </div>
        )}
      </Card>

      {courses.length === 0 ? (
        <p className='text-xs font-bold text-slate-400 py-8 text-center'>
          No courses published for your programme yet.
        </p>
      ) : (
        <div className='space-y-2'>
          {courses.map((c) => (
            <Card
              key={c.id}
              className='p-4 rounded-2xl border-none shadow-sm bg-white flex items-center gap-3'
            >
              <div className='h-10 w-10 rounded-xl bg-blue-50 text-[#002EFF] flex items-center justify-center shrink-0'>
                <BookOpen size={18} />
              </div>
              <div className='min-w-0 flex-1'>
                <p className='text-xs font-black text-gray-800 truncate'>
                  {c.title}
                </p>
                <p className='text-[10px] font-bold text-slate-400'>
                  {c.subject}
                  {typeof c.progressPercent === 'number' && (
                    <span className='text-[#002EFF]'>
                      {' '}
                      · {c.progressPercent}% complete
                    </span>
                  )}
                </p>
              </div>
              {c.tutorName ? (
                <Badge className='bg-blue-50 text-[#002EFF] text-[8px] font-black'>
                  <GraduationCap size={9} className='mr-1' /> {c.tutorName}
                </Badge>
              ) : (
                <Badge className='bg-amber-50 text-amber-600 text-[8px] font-black'>
                  Unassigned
                </Badge>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
