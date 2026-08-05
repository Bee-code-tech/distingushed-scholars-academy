'use client'

import React, { useEffect, useState } from 'react'
import { BookOpen, Plus, Trash2, GraduationCap, Loader2 } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  COURSE_CATEGORIES,
  getCoursesByCategory,
  addCourse,
  removeCourse,
} from '@/lib/coursesStore'
import { getTutors, type DirectoryPerson } from '@/lib/directoryStore'
import type { Course, CourseCategory } from '@/lib/types'

export default function CourseManager() {
  const [mounted, setMounted] = useState(false)
  const [tick, setTick] = useState(0)
  const refresh = () => setTick((t) => t + 1)
  const [tutors, setTutors] = useState<DirectoryPerson[]>([])

  const [title, setTitle] = useState('')
  const [subject, setSubject] = useState('')
  const [category, setCategory] = useState<CourseCategory>('jamb-putme')
  const [tutorKey, setTutorKey] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    setMounted(true)
    setTutors(getTutors())
  }, [])

  const create = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (title.trim().length < 2) return setError('Enter a course title')
    const tutor = tutors.find((t) => t.key === tutorKey)
    addCourse({
      title: title.trim(),
      subject: subject.trim() || title.trim(),
      category,
      tutorId: tutor?.key,
      tutorName: tutor?.name,
    })
    setTitle(''); setSubject(''); setTutorKey('')
    refresh()
  }

  if (!mounted) {
    return <div className='py-20 flex justify-center'><Loader2 className='animate-spin text-[#002EFF]' /></div>
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
        <form onSubmit={create} className='grid grid-cols-1 sm:grid-cols-2 gap-3' key={tick}>
          {error && <p className='sm:col-span-2 text-[11px] font-bold text-rose-600'>{error}</p>}
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
            <span className='text-[9px] font-black uppercase text-slate-400'>Category</span>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as CourseCategory)}
              className='w-full h-11 px-3 rounded-lg bg-slate-50 border border-transparent focus:border-[#002EFF]/30 focus:bg-white outline-none text-sm font-bold'
            >
              {COURSE_CATEGORIES.map((c) => (
                <option key={c.id} value={c.id}>{c.label} — {c.note}</option>
              ))}
            </select>
          </label>
          <label className='space-y-1'>
            <span className='text-[9px] font-black uppercase text-slate-400'>Assign tutor</span>
            <select
              value={tutorKey}
              onChange={(e) => setTutorKey(e.target.value)}
              className='w-full h-11 px-3 rounded-lg bg-slate-50 border border-transparent focus:border-[#002EFF]/30 focus:bg-white outline-none text-sm font-bold'
            >
              <option value=''>Unassigned</option>
              {tutors.map((t) => (
                <option key={t.key} value={t.key}>{t.name}</option>
              ))}
            </select>
          </label>
          <button
            type='submit'
            className='sm:col-span-2 flex items-center justify-center gap-2 h-11 bg-[#002EFF] text-white rounded-xl font-black text-[11px] uppercase tracking-wide hover:bg-blue-700 active:scale-[0.98] transition-all'
          >
            <Plus size={15} /> Add Course
          </button>
        </form>
        {tutors.length === 0 && (
          <p className='text-[10px] font-bold text-amber-600 mt-3'>
            No tutors yet — create tutors first (People → Create Tutor) to assign them.
          </p>
        )}
      </Card>

      {/* Courses by category */}
      {COURSE_CATEGORIES.map((cat) => {
        const courses = getCoursesByCategory(cat.id)
        return (
          <div key={cat.id} className='space-y-2'>
            <div className='flex items-center gap-2'>
              <h3 className='text-[11px] font-black uppercase tracking-widest text-slate-600'>{cat.label}</h3>
              <span className='text-[9px] font-bold text-slate-400'>· {cat.note}</span>
              <span className='ml-auto text-[9px] font-black uppercase text-slate-400'>{courses.length}</span>
            </div>
            {courses.length === 0 ? (
              <p className='text-[11px] font-bold text-slate-400 px-1'>No courses in this category yet.</p>
            ) : (
              <div className='grid grid-cols-1 sm:grid-cols-2 gap-2'>
                {courses.map((c: Course) => (
                  <Card key={c.id} className='p-3 rounded-2xl border-none shadow-sm bg-white flex items-center gap-3'>
                    <div className='h-9 w-9 rounded-xl bg-blue-50 text-[#002EFF] flex items-center justify-center shrink-0'>
                      <BookOpen size={16} />
                    </div>
                    <div className='min-w-0 flex-1'>
                      <p className='text-xs font-black text-gray-800 truncate'>{c.title}</p>
                      <p className='text-[10px] font-bold text-slate-400 flex items-center gap-1'>
                        <GraduationCap size={10} />
                        {c.tutorName ? c.tutorName : <span className='text-amber-600'>Unassigned</span>}
                      </p>
                    </div>
                    <button
                      onClick={() => { removeCourse(c.id); refresh() }}
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
      })}
    </div>
  )
}
