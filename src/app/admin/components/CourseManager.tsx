'use client'

import React, { useCallback, useEffect, useState } from 'react'
import { BookOpen, Plus, Trash2, GraduationCap, Loader2 } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { COURSE_CATEGORIES } from '@/lib/coursesStore'
import { dsaApi } from '@/lib/api'
import { adminApi } from '@/lib/admin-api'
import type { CourseCategory } from '@/lib/types'

type UITutor = { id: string; name: string; subject?: string }
type UICourse = {
  id: string
  title: string
  subject?: string
  category: string
  tutorName?: string
}

// The admin signs in via /adminLogin, which stores the JWT under 'admin_token' /
// 'token' (not 'dsa_token'), so read it directly for the dsaApi reads below.
function adminToken(): string | undefined {
  if (typeof window === 'undefined') return undefined
  return (
    localStorage.getItem('admin_token') ||
    localStorage.getItem('token') ||
    undefined
  )
}

export default function CourseManager() {
  const [mounted, setMounted] = useState(false)
  const [loading, setLoading] = useState(true)
  const [tutors, setTutors] = useState<UITutor[]>([])
  const [courses, setCourses] = useState<UICourse[]>([])

  const [title, setTitle] = useState('')
  const [subject, setSubject] = useState('')
  const [category, setCategory] = useState<CourseCategory>('jamb-putme')
  const [tutorId, setTutorId] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    const token = adminToken()
    try {
      const [tutorRows, courseRows] = await Promise.all([
        dsaApi.admin.listUsers('tutor', token) as Promise<
          Record<string, unknown>[]
        >,
        dsaApi.courses.list({}, token) as Promise<Record<string, unknown>[]>,
      ])
      setTutors(
        tutorRows.map((t) => ({
          id: String(t.id ?? t._id ?? ''),
          name: String(t.fullname ?? t.fullName ?? 'Tutor'),
          subject: Array.isArray(t.subjects)
            ? String((t.subjects as unknown[])[0] ?? '')
            : (t.subject as string) || '',
        })),
      )
      setCourses(
        courseRows.map((c) => ({
          id: String(c.id ?? c._id ?? ''),
          title: String(c.title ?? 'Course'),
          subject: c.subject ? String(c.subject) : undefined,
          category: String(c.category ?? ''),
          tutorName:
            (c.tutorName as string) ||
            ((c.tutor as Record<string, unknown>)?.fullname as string) ||
            undefined,
        })),
      )
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Could not load courses. Are you signed in as admin?',
      )
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    setMounted(true)
    void load()
  }, [load])

  const create = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (title.trim().length < 2) return setError('Enter a course title')
    setBusy(true)
    try {
      await adminApi.createCourse({
        title: title.trim(),
        subject: subject.trim() || title.trim(),
        category,
        tutorId: tutorId || undefined,
        isPublished: true,
      })
      setTitle('')
      setSubject('')
      setTutorId('')
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create course')
    } finally {
      setBusy(false)
    }
  }

  const remove = async (id: string) => {
    try {
      await adminApi.deleteCourse(id)
      await load()
    } catch {
      void load()
    }
  }

  if (!mounted) {
    return (
      <div className='py-20 flex justify-center'>
        <Loader2 className='animate-spin text-[#002EFF]' />
      </div>
    )
  }

  return (
    <div className='max-w-5xl mx-auto space-y-6 px-4'>
      <div>
        <h1 className='text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2'>
          <BookOpen size={20} className='text-[#002EFF]' /> Courses
        </h1>
        <p className='text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-1'>
          Add courses per category &amp; assign a tutor
        </p>
      </div>

      {/* Add course */}
      <Card className='p-5 rounded-3xl border-none shadow-sm bg-white'>
        <form onSubmit={create} className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
          {error && (
            <p className='sm:col-span-2 text-[11px] font-bold text-rose-600'>
              {error}
            </p>
          )}
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder='Course title (e.g. Chemistry)'
            className='h-11 px-3 rounded-lg bg-slate-50 border border-transparent focus:border-[#002EFF]/30 focus:bg-white outline-none text-sm font-medium'
          />
          <input
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder='Subject (optional)'
            className='h-11 px-3 rounded-lg bg-slate-50 border border-transparent focus:border-[#002EFF]/30 focus:bg-white outline-none text-sm font-medium'
          />
          <label className='space-y-1'>
            <span className='text-[9px] font-black uppercase text-slate-400'>
              Category
            </span>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as CourseCategory)}
              className='w-full h-11 px-3 rounded-lg bg-slate-50 border border-transparent focus:border-[#002EFF]/30 focus:bg-white outline-none text-sm font-bold'
            >
              {COURSE_CATEGORIES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label} — {c.note}
                </option>
              ))}
            </select>
          </label>
          <label className='space-y-1'>
            <span className='text-[9px] font-black uppercase text-slate-400'>
              Assign tutor
            </span>
            <select
              value={tutorId}
              onChange={(e) => setTutorId(e.target.value)}
              className='w-full h-11 px-3 rounded-lg bg-slate-50 border border-transparent focus:border-[#002EFF]/30 focus:bg-white outline-none text-sm font-bold'
            >
              <option value=''>Unassigned</option>
              {tutors.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                  {t.subject ? ` — ${t.subject}` : ''}
                </option>
              ))}
            </select>
          </label>
          <button
            type='submit'
            disabled={busy}
            className='sm:col-span-2 flex items-center justify-center gap-2 h-11 bg-[#002EFF] text-white rounded-xl font-black text-[11px] uppercase tracking-wide hover:bg-blue-700 active:scale-[0.98] transition-all disabled:opacity-50'
          >
            <Plus size={15} /> {busy ? 'Adding…' : 'Add Course'}
          </button>
        </form>
        {tutors.length === 0 && !loading && (
          <p className='text-[10px] font-bold text-amber-600 mt-3'>
            No tutors found — create tutors first (People → Create Tutor) to
            assign them.
          </p>
        )}
      </Card>

      {/* Courses by category */}
      {loading ? (
        <div className='py-10 flex justify-center'>
          <Loader2 className='animate-spin text-[#002EFF]' />
        </div>
      ) : (
        COURSE_CATEGORIES.map((cat) => {
          const list = courses.filter((c) => c.category === cat.id)
          return (
            <div key={cat.id} className='space-y-2'>
              <div className='flex items-center gap-2'>
                <h3 className='text-[11px] font-black uppercase tracking-widest text-slate-600'>
                  {cat.label}
                </h3>
                <span className='text-[9px] font-bold text-slate-400'>
                  · {cat.note}
                </span>
                <span className='ml-auto text-[9px] font-black uppercase text-slate-400'>
                  {list.length}
                </span>
              </div>
              {list.length === 0 ? (
                <p className='text-[11px] font-bold text-slate-400 px-1'>
                  No courses in this category yet.
                </p>
              ) : (
                <div className='grid grid-cols-1 sm:grid-cols-2 gap-2'>
                  {list.map((c) => (
                    <Card
                      key={c.id}
                      className='p-3 rounded-2xl border-none shadow-sm bg-white flex items-center gap-3'
                    >
                      <div className='h-9 w-9 rounded-xl bg-blue-50 text-[#002EFF] flex items-center justify-center shrink-0'>
                        <BookOpen size={16} />
                      </div>
                      <div className='min-w-0 flex-1'>
                        <p className='text-xs font-black text-gray-800 truncate'>
                          {c.title}
                        </p>
                        <p className='text-[10px] font-bold text-slate-400 flex items-center gap-1'>
                          <GraduationCap size={10} />
                          {c.tutorName ? (
                            c.tutorName
                          ) : (
                            <span className='text-amber-600'>Unassigned</span>
                          )}
                        </p>
                      </div>
                      <button
                        onClick={() => remove(c.id)}
                        className='p-1.5 text-slate-400 hover:text-rose-600'
                        title='Remove course'
                      >
                        <Trash2 size={14} />
                      </button>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )
        })
      )}
    </div>
  )
}
