'use client'

import React, { useCallback, useEffect, useState } from 'react'
import {
  BookOpen,
  Plus,
  Trash2,
  GraduationCap,
  Loader2,
  X,
  UserPlus,
  Pencil,
  Check,
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { COURSE_CATEGORIES, categoryLabel } from '@/lib/coursesStore'
import { CLASS_LEVELS } from '@/lib/registration'
import { dsaApi } from '@/lib/api'
import { adminApi } from '@/lib/admin-api'
import type { CourseCategory } from '@/lib/types'

type UITutor = { id: string; name: string; subject?: string }
type UICourse = {
  id: string
  title: string
  subject?: string
  category: string
  /** Target class/level (SS1…200 Level); '' ⇒ all classes in the category. */
  classLevel: string
  /** Ids of every tutor assigned to this course (one or more). */
  tutorIds: string[]
}

/**
 * Read the assigned tutor ids from a course row, tolerating whatever shape the
 * backend returns: a `tutorIds` array, a populated `tutors` array, or the older
 * single `tutorId` / populated `tutor`.
 */
function tutorIdsFromCourse(c: Record<string, unknown>): string[] {
  const ids = new Set<string>()
  const push = (v: unknown) => {
    const s = String(v ?? '').trim()
    if (s) ids.add(s)
  }
  if (Array.isArray(c.tutorIds)) c.tutorIds.forEach(push)
  if (Array.isArray(c.tutors))
    (c.tutors as unknown[]).forEach((t) =>
      push(
        typeof t === 'object' && t
          ? ((t as Record<string, unknown>).id ??
              (t as Record<string, unknown>)._id)
          : t,
      ),
    )
  if (c.tutor && typeof c.tutor === 'object')
    push(
      (c.tutor as Record<string, unknown>).id ??
        (c.tutor as Record<string, unknown>)._id,
    )
  push(c.tutorId)
  return [...ids]
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
  const [category, setCategory] = useState<CourseCategory>('jamb')
  const [classLevel, setClassLevel] = useState('')
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
          classLevel: c.classLevel ? String(c.classLevel) : '',
          tutorIds: tutorIdsFromCourse(c),
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
    const cleanTitle = title.trim()
    if (cleanTitle.length < 2) return setError('Enter a course title')
    // Block duplicates: same title + same category + same class already exists.
    // (Same name in a different category — JAMB vs WAEC Chemistry — or a
    // different class — SS1 vs SS2 Biology — is allowed.)
    const exists = courses.some(
      (c) =>
        c.category === category &&
        (c.classLevel || '') === classLevel &&
        c.title.trim().toLowerCase() === cleanTitle.toLowerCase(),
    )
    if (exists) {
      const where = classLevel
        ? `${categoryLabel(category)} · ${classLevel}`
        : categoryLabel(category)
      return setError(
        `“${cleanTitle}” already exists in ${where}. Assign another tutor to the existing course instead of creating a new one.`,
      )
    }
    setBusy(true)
    try {
      await adminApi.createCourse({
        title: title.trim(),
        subject: subject.trim() || title.trim(),
        category,
        classLevel: classLevel || undefined,
        // Send both: `tutorId` for the current backend and `tutorIds` for the
        // multi-tutor backend (see docs/backend-request-course-tutors.md).
        tutorId: tutorId || undefined,
        tutorIds: tutorId ? [tutorId] : [],
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

  /**
   * Assign the given set of tutors to an existing course (PUT /courses/:id) —
   * this is how a second tutor is added without recreating the course. Sends
   * `tutorIds` (the full set) plus `tutorId` (the first) for backward compat.
   */
  const setCourseTutors = useCallback(
    async (courseId: string, ids: string[]) => {
      setError('')
      await adminApi.updateCourse(courseId, {
        tutorIds: ids,
        tutorId: ids[0] ?? null,
      })
      await load()
    },
    [load],
  )

  /** Rename an existing course (PUT /courses/:id). */
  const renameCourse = useCallback(
    async (courseId: string, newTitle: string) => {
      setError('')
      await adminApi.updateCourse(courseId, { title: newTitle })
      await load()
    },
    [load],
  )

  /** Change which class an existing course targets (PUT /courses/:id). */
  const setCourseClass = useCallback(
    async (courseId: string, newClass: string) => {
      setError('')
      await adminApi.updateCourse(courseId, { classLevel: newClass })
      await load()
    },
    [load],
  )

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
              Class
            </span>
            <select
              value={classLevel}
              onChange={(e) => setClassLevel(e.target.value)}
              className='w-full h-11 px-3 rounded-lg bg-slate-50 border border-transparent focus:border-[#002EFF]/30 focus:bg-white outline-none text-sm font-bold'
            >
              <option value=''>All classes</option>
              {CLASS_LEVELS.map((c) => (
                <option key={c} value={c}>
                  {c}
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
                    <CourseCard
                      key={c.id}
                      course={c}
                      tutors={tutors}
                      onSetTutors={setCourseTutors}
                      onRename={renameCourse}
                      onSetClass={setCourseClass}
                      onRemove={remove}
                    />
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

/**
 * A single course row with inline tutor management. The admin can assign more
 * than one tutor to the same course here — adding a tutor updates the existing
 * course (no need to recreate it).
 */
function CourseCard({
  course,
  tutors,
  onSetTutors,
  onRename,
  onSetClass,
  onRemove,
}: {
  course: UICourse
  tutors: UITutor[]
  onSetTutors: (courseId: string, ids: string[]) => Promise<void>
  onRename: (courseId: string, title: string) => Promise<void>
  onSetClass: (courseId: string, classLevel: string) => Promise<void>
  onRemove: (id: string) => void
}) {
  const [adding, setAdding] = useState('')
  const [busy, setBusy] = useState(false)
  const [editing, setEditing] = useState(false)
  const [titleDraft, setTitleDraft] = useState(course.title)

  const saveTitle = async () => {
    const t = titleDraft.trim()
    setEditing(false)
    if (t && t !== course.title) {
      setBusy(true)
      try {
        await onRename(course.id, t)
      } finally {
        setBusy(false)
      }
    }
  }

  const nameFor = (id: string) =>
    tutors.find((t) => t.id === id)?.name ?? 'Tutor'
  const unassigned = tutors.filter((t) => !course.tutorIds.includes(t.id))

  const apply = async (ids: string[]) => {
    setBusy(true)
    try {
      await onSetTutors(course.id, ids)
    } finally {
      setBusy(false)
      setAdding('')
    }
  }

  const addTutor = (id: string) => {
    if (!id || course.tutorIds.includes(id)) return
    void apply([...course.tutorIds, id])
  }
  const removeTutor = (id: string) =>
    void apply(course.tutorIds.filter((t) => t !== id))

  return (
    <Card className='p-3 rounded-2xl border-none shadow-sm bg-white flex flex-col gap-2'>
      <div className='flex items-center gap-3'>
        <div className='h-9 w-9 rounded-xl bg-blue-50 text-[#002EFF] flex items-center justify-center shrink-0'>
          <BookOpen size={16} />
        </div>
        <div className='min-w-0 flex-1'>
          {editing ? (
            <div className='flex items-center gap-1'>
              <input
                value={titleDraft}
                onChange={(e) => setTitleDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') saveTitle()
                  if (e.key === 'Escape') setEditing(false)
                }}
                autoFocus
                className='min-w-0 flex-1 h-7 px-2 rounded-lg bg-slate-50 border border-[#002EFF]/30 focus:bg-white outline-none text-xs font-black text-gray-800'
              />
              <button
                onClick={saveTitle}
                disabled={busy}
                className='p-1 text-[#002EFF] hover:text-blue-700 disabled:opacity-40'
                title='Save name'
              >
                <Check size={14} />
              </button>
            </div>
          ) : (
            <p className='text-xs font-black text-gray-800 truncate flex items-center gap-1.5'>
              {course.title}
              <button
                onClick={() => {
                  setTitleDraft(course.title)
                  setEditing(true)
                }}
                className='text-slate-300 hover:text-[#002EFF] shrink-0'
                title='Edit name'
              >
                <Pencil size={11} />
              </button>
            </p>
          )}
          <div className='flex items-center gap-2 mt-0.5'>
            <p className='text-[9px] font-black uppercase tracking-widest text-slate-400'>
              {course.tutorIds.length} tutor
              {course.tutorIds.length === 1 ? '' : 's'}
            </p>
            <span className='text-slate-300'>·</span>
            <select
              value={course.classLevel}
              disabled={busy}
              onChange={(e) => {
                setBusy(true)
                onSetClass(course.id, e.target.value).finally(() =>
                  setBusy(false),
                )
              }}
              title='Class this course targets'
              className='h-6 -ml-1 px-1 rounded bg-transparent hover:bg-slate-50 border border-transparent focus:border-[#002EFF]/30 outline-none text-[10px] font-black uppercase tracking-wide text-slate-500 disabled:opacity-50'
            >
              <option value=''>All classes</option>
              {CLASS_LEVELS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>
        <button
          onClick={() => onRemove(course.id)}
          className='p-1.5 text-slate-400 hover:text-rose-600'
          title='Remove course'
        >
          <Trash2 size={14} />
        </button>
      </div>

      {/* Assigned tutors */}
      <div className='flex flex-wrap items-center gap-1.5 pl-1'>
        {course.tutorIds.length === 0 && (
          <span className='text-[10px] font-bold text-amber-600 flex items-center gap-1'>
            <GraduationCap size={10} /> Unassigned
          </span>
        )}
        {course.tutorIds.map((id) => (
          <span
            key={id}
            className='inline-flex items-center gap-1 pl-2 pr-1 py-0.5 rounded-full bg-blue-50 text-[#002EFF] text-[10px] font-bold'
          >
            {nameFor(id)}
            <button
              onClick={() => removeTutor(id)}
              disabled={busy}
              className='hover:text-rose-600 disabled:opacity-40'
              title='Remove tutor'
            >
              <X size={11} />
            </button>
          </span>
        ))}
      </div>

      {/* Add another tutor */}
      {unassigned.length > 0 && (
        <div className='flex items-center gap-2 pl-1'>
          <UserPlus size={12} className='text-slate-400 shrink-0' />
          <select
            value={adding}
            disabled={busy}
            onChange={(e) => addTutor(e.target.value)}
            className='flex-1 h-8 px-2 rounded-lg bg-slate-50 border border-transparent focus:border-[#002EFF]/30 focus:bg-white outline-none text-[11px] font-bold disabled:opacity-50'
          >
            <option value=''>
              {busy ? 'Saving…' : 'Add a tutor to this course…'}
            </option>
            {unassigned.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
                {t.subject ? ` — ${t.subject}` : ''}
              </option>
            ))}
          </select>
        </div>
      )}
    </Card>
  )
}
