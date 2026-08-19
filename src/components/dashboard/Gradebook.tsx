'use client'

import React, { useCallback, useEffect, useState } from 'react'
import {
  BookOpen,
  Loader2,
  Plus,
  Pencil,
  Check,
  X,
  Award,
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { getToken } from '@/lib/auth'
import { isDemoToken } from '@/lib/demoAccounts'
import { dsaApi } from '@/lib/api'

function isLive(): boolean {
  const t = getToken()
  return !!t && !isDemoToken(t)
}

const num = (v: unknown): number | undefined =>
  typeof v === 'number' && !Number.isNaN(v) ? v : undefined

type GradeRow = {
  id: string
  studentName: string
  title: string
  score: number
  maxScore: number
  percent: number
  feedback?: string
  sourceType: string
}

function mapGrade(g: Record<string, unknown>): GradeRow {
  const sid = g.studentId as unknown
  const sidObj =
    sid && typeof sid === 'object' ? (sid as Record<string, unknown>) : null
  const student = (g.student ?? {}) as Record<string, unknown>
  const score = num(g.score) ?? 0
  const maxScore = num(g.maxScore) ?? 0
  return {
    id: String(g.id ?? g._id ?? ''),
    studentName:
      (student.fullname as string) ||
      (sidObj?.fullname as string) ||
      'Student',
    title: String(g.title ?? 'Grade'),
    score,
    maxScore,
    percent: num(g.percent) ?? (maxScore ? Math.round((score / maxScore) * 100) : 0),
    feedback: g.feedback ? String(g.feedback) : undefined,
    sourceType: String(g.sourceType ?? 'manual'),
  }
}

/**
 * Tutor course gradebook — lists every grade entry (assignment + manual) for a
 * course, supports inline correction (PUT /grades/:id) and recording a manual
 * grade (POST /courses/:id/grades). Live-only; the local stores have no
 * gradebook, so it prompts to sign in when there is no backend session.
 */
export default function Gradebook() {
  const [live, setLive] = useState(false)
  const [loadingCourses, setLoadingCourses] = useState(true)
  const [courses, setCourses] = useState<{ id: string; title: string }[]>([])
  const [courseId, setCourseId] = useState('')
  const [rows, setRows] = useState<GradeRow[]>([])
  const [loadingRows, setLoadingRows] = useState(false)
  const [students, setStudents] = useState<{ id: string; name: string }[]>([])

  // Manual-grade form
  const [studentId, setStudentId] = useState('')
  const [title, setTitle] = useState('')
  const [score, setScore] = useState('')
  const [maxScore, setMaxScore] = useState('10')
  const [feedback, setFeedback] = useState('')
  const [formErr, setFormErr] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const liveNow = isLive()
      setLive(liveNow)
      if (!liveNow) {
        setLoadingCourses(false)
        return
      }
      try {
        const [cs, roster] = await Promise.all([
          dsaApi.courses.list({ tutorId: 'me' }) as Promise<
            Record<string, unknown>[]
          >,
          dsaApi.analytics.tutorStudents() as Promise<Record<string, unknown>[]>,
        ])
        if (cancelled) return
        const mapped = cs.map((c) => ({
          id: String(c.id ?? c._id ?? ''),
          title: String(c.title ?? 'Course'),
        }))
        setCourses(mapped)
        setCourseId((p) => p || mapped[0]?.id || '')
        setStudents(
          roster.map((s) => ({
            id: String(s.id ?? s._id ?? ''),
            name: String(s.fullname ?? s.fullName ?? 'Student'),
          })),
        )
      } catch {
        /* leave empty */
      } finally {
        if (!cancelled) setLoadingCourses(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const loadGrades = useCallback(async () => {
    if (!live || !courseId) {
      setRows([])
      return
    }
    setLoadingRows(true)
    try {
      const g = (await dsaApi.assignments.courseGrades(
        courseId,
      )) as Record<string, unknown>[]
      setRows(g.map(mapGrade))
    } catch {
      setRows([])
    } finally {
      setLoadingRows(false)
    }
  }, [live, courseId])

  useEffect(() => {
    void loadGrades()
  }, [loadGrades])

  const addManual = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormErr('')
    if (!studentId) return setFormErr('Pick a student')
    if (title.trim().length < 2) return setFormErr('Enter a title')
    const s = Number(score)
    const m = Number(maxScore)
    if (!m || m < 1) return setFormErr('Max score must be at least 1')
    if (Number.isNaN(s) || s < 0 || s > m)
      return setFormErr(`Score must be between 0 and ${m}`)
    setSaving(true)
    try {
      await dsaApi.assignments.recordGrades(courseId, {
        studentId,
        title: title.trim(),
        score: s,
        maxScore: m,
        feedback: feedback.trim() || undefined,
      })
      setStudentId('')
      setTitle('')
      setScore('')
      setMaxScore('10')
      setFeedback('')
      await loadGrades()
    } catch (err) {
      setFormErr(err instanceof Error ? err.message : 'Failed to record grade')
    } finally {
      setSaving(false)
    }
  }

  if (loadingCourses) {
    return (
      <div className='py-16 flex justify-center'>
        <Loader2 className='animate-spin text-[#002EFF]' />
      </div>
    )
  }

  if (!live) {
    return (
      <div className='py-16 text-center text-xs font-bold text-slate-400'>
        The gradebook is available when signed in to your tutor account.
      </div>
    )
  }

  return (
    <div className='space-y-5'>
      <div className='flex items-start justify-between gap-3'>
        <div>
          <h2 className='text-2xl font-black text-[#002EFF] italic uppercase'>
            Gradebook
          </h2>
          <p className='text-[11px] font-bold text-slate-400'>
            Every grade for your course — assignments &amp; manual entries.
          </p>
        </div>
        <Badge className='text-[8px] font-black bg-emerald-50 text-emerald-600 shrink-0'>
          Live
        </Badge>
      </div>

      {/* Course picker */}
      <div className='flex items-center gap-2 flex-wrap'>
        <BookOpen size={15} className='text-slate-400' />
        <select
          value={courseId}
          onChange={(e) => setCourseId(e.target.value)}
          className='h-10 px-3 rounded-lg bg-slate-50 border border-transparent focus:border-[#002EFF]/30 focus:bg-white outline-none text-sm font-bold'
        >
          {courses.length === 0 && <option value=''>No courses assigned</option>}
          {courses.map((c) => (
            <option key={c.id} value={c.id}>
              {c.title}
            </option>
          ))}
        </select>
      </div>

      {/* Record manual grade */}
      <Card className='p-5 rounded-3xl border-none shadow-sm bg-white'>
        <p className='text-[10px] font-black uppercase text-gray-400 mb-3'>
          Record a manual grade
        </p>
        <form onSubmit={addManual} className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
          {formErr && (
            <p className='sm:col-span-2 text-[11px] font-bold text-rose-600'>
              {formErr}
            </p>
          )}
          <select
            value={studentId}
            onChange={(e) => setStudentId(e.target.value)}
            className='h-11 px-3 rounded-lg bg-slate-50 border border-transparent focus:border-[#002EFF]/30 focus:bg-white outline-none text-sm font-bold'
          >
            <option value=''>Select student…</option>
            {students.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder='Title (e.g. Class participation)'
            className='h-11 px-3 rounded-lg bg-slate-50 border border-transparent focus:border-[#002EFF]/30 focus:bg-white outline-none text-sm font-medium'
          />
          <div className='flex items-center gap-2'>
            <input
              type='number'
              min={0}
              value={score}
              onChange={(e) => setScore(e.target.value)}
              placeholder='Score'
              className='w-24 h-11 px-3 rounded-lg bg-slate-50 border border-transparent focus:border-[#002EFF]/30 focus:bg-white outline-none text-sm font-medium'
            />
            <span className='text-slate-400 font-black'>/</span>
            <input
              type='number'
              min={1}
              value={maxScore}
              onChange={(e) => setMaxScore(e.target.value)}
              placeholder='Max'
              className='w-24 h-11 px-3 rounded-lg bg-slate-50 border border-transparent focus:border-[#002EFF]/30 focus:bg-white outline-none text-sm font-medium'
            />
          </div>
          <input
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder='Feedback (optional)'
            className='h-11 px-3 rounded-lg bg-slate-50 border border-transparent focus:border-[#002EFF]/30 focus:bg-white outline-none text-sm font-medium'
          />
          <button
            type='submit'
            disabled={saving || !courseId}
            className='sm:col-span-2 flex items-center justify-center gap-2 h-11 bg-[#002EFF] text-white rounded-xl font-black text-[11px] uppercase tracking-wide hover:bg-blue-700 active:scale-[0.98] transition-all disabled:opacity-50'
          >
            <Plus size={15} /> {saving ? 'Saving…' : 'Record Grade'}
          </button>
        </form>
      </Card>

      {/* Grade list */}
      <Card className='rounded-3xl border-none shadow-sm bg-white overflow-hidden'>
        <div className='grid grid-cols-12 px-5 py-3 bg-slate-50 text-[9px] font-black uppercase text-gray-400'>
          <span className='col-span-4'>Student</span>
          <span className='col-span-4'>Item</span>
          <span className='col-span-2'>Score</span>
          <span className='col-span-2 text-right'>Edit</span>
        </div>
        {loadingRows ? (
          <div className='py-8 flex justify-center'>
            <Loader2 className='animate-spin text-[#002EFF]' size={18} />
          </div>
        ) : rows.length === 0 ? (
          <p className='py-8 text-center text-[11px] font-bold text-slate-400'>
            No grades recorded for this course yet.
          </p>
        ) : (
          rows.map((r) => (
            <GradeLine key={r.id} row={r} onSaved={loadGrades} />
          ))
        )}
      </Card>
    </div>
  )
}

function GradeLine({ row, onSaved }: { row: GradeRow; onSaved: () => void }) {
  const [editing, setEditing] = useState(false)
  const [score, setScore] = useState(String(row.score))
  const [feedback, setFeedback] = useState(row.feedback ?? '')
  const [busy, setBusy] = useState(false)

  const save = async () => {
    const s = Number(score)
    if (Number.isNaN(s) || s < 0 || s > row.maxScore || busy) return
    setBusy(true)
    try {
      await dsaApi.assignments.updateGrade(row.id, {
        score: s,
        feedback: feedback.trim() || undefined,
      })
      setEditing(false)
      onSaved()
    } catch {
      /* keep editing so the tutor can retry */
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className='grid grid-cols-12 items-center px-5 py-3.5 border-t border-slate-50'>
      <span className='col-span-4 text-xs font-black text-gray-800 truncate'>
        {row.studentName}
      </span>
      <span className='col-span-4 min-w-0'>
        <span className='text-[11px] font-bold text-slate-600 truncate block'>
          {row.title}
        </span>
        <Badge
          className={`text-[7px] font-black ${row.sourceType === 'assignment' ? 'bg-blue-50 text-[#002EFF]' : 'bg-slate-100 text-slate-500'}`}
        >
          {row.sourceType}
        </Badge>
      </span>
      {editing ? (
        <span className='col-span-2 flex items-center gap-1'>
          <input
            type='number'
            min={0}
            max={row.maxScore}
            value={score}
            onChange={(e) => setScore(e.target.value)}
            className='w-14 h-8 px-2 rounded-lg bg-white border border-slate-200 outline-none text-xs font-bold'
          />
          <span className='text-[10px] font-bold text-slate-400'>
            /{row.maxScore}
          </span>
        </span>
      ) : (
        <span
          className={`col-span-2 text-xs font-black ${row.percent >= 70 ? 'text-emerald-600' : 'text-amber-600'}`}
        >
          <Award size={11} className='inline mr-1' />
          {row.score}/{row.maxScore} · {row.percent}%
        </span>
      )}
      <span className='col-span-2 flex items-center justify-end gap-1'>
        {editing ? (
          <>
            <input
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder='Feedback'
              className='hidden md:block w-24 h-8 px-2 rounded-lg bg-white border border-slate-200 outline-none text-[10px]'
            />
            <button
              onClick={save}
              disabled={busy}
              className='p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg'
              title='Save'
            >
              {busy ? <Loader2 size={14} className='animate-spin' /> : <Check size={14} />}
            </button>
            <button
              onClick={() => {
                setEditing(false)
                setScore(String(row.score))
                setFeedback(row.feedback ?? '')
              }}
              className='p-1.5 text-slate-400 hover:bg-slate-100 rounded-lg'
              title='Cancel'
            >
              <X size={14} />
            </button>
          </>
        ) : (
          <button
            onClick={() => setEditing(true)}
            className='p-1.5 text-slate-400 hover:text-[#002EFF] hover:bg-blue-50 rounded-lg'
            title='Edit grade'
          >
            <Pencil size={14} />
          </button>
        )}
      </span>
    </div>
  )
}
