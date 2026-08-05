'use client'

import React, { useEffect, useState } from 'react'
import {
  ClipboardList,
  Plus,
  Trash2,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Send,
  Loader2,
  Award,
  ChevronDown,
  ChevronUp,
  BookOpen,
  Users,
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { getCourses } from '@/lib/coursesStore'
import {
  getAssignments,
  getAssignmentsForTrack,
  addAssignment,
  removeAssignment,
  getSubmissions,
  getMySubmission,
  submitAssignment,
  gradeSubmission,
} from '@/lib/assignmentsStore'
import { getUser } from '@/lib/auth'
import { normaliseTrack } from '@/lib/studentProfile'
import type { Assignment, Submission } from '@/lib/types'

function dueLabel(dueISO: string): { text: string; overdue: boolean } {
  const due = new Date(dueISO).getTime()
  const now = Date.now()
  const days = Math.round((due - now) / 86_400_000)
  const date = new Date(dueISO).toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
  })
  if (days < 0) return { text: `Due ${date} · overdue`, overdue: true }
  if (days === 0) return { text: `Due today (${date})`, overdue: false }
  if (days === 1) return { text: `Due tomorrow (${date})`, overdue: false }
  return { text: `Due ${date} · in ${days} days`, overdue: false }
}

export default function Assignments({
  mode,
  studentKey,
  studentName,
  track: trackProp,
}: {
  mode: 'tutor' | 'student'
  studentKey?: string
  studentName?: string
  track?: string
}) {
  const [mounted, setMounted] = useState(false)
  const [tick, setTick] = useState(0)
  const refresh = () => setTick((t) => t + 1)
  useEffect(() => setMounted(true), [])

  if (!mounted) {
    return (
      <div className='py-16 flex justify-center'>
        <Loader2 className='animate-spin text-[#002EFF]' />
      </div>
    )
  }

  if (mode === 'tutor') return <TutorAssignments key={tick} onChange={refresh} />

  const u = getUser()
  const track = trackProp || normaliseTrack(u?.level || u?.examType || 'jamb')
  return (
    <StudentAssignments
      key={tick}
      track={track}
      studentKey={studentKey || u?.username || 'me'}
      studentName={studentName || u?.fullName || u?.username || 'Student'}
      onChange={refresh}
    />
  )
}

/* ---------------- Tutor: create, review, grade ---------------- */
function TutorAssignments({ onChange }: { onChange: () => void }) {
  const courses = getCourses()
  const [courseId, setCourseId] = useState(courses[0]?.id ?? '')
  const assignments = courseId ? getAssignments(courseId) : []
  const [openId, setOpenId] = useState<string | null>(null)

  const [title, setTitle] = useState('')
  const [instructions, setInstructions] = useState('')
  const [maxScore, setMaxScore] = useState('20')
  const [dueDate, setDueDate] = useState('')
  const [allowLate, setAllowLate] = useState(true)
  const [error, setError] = useState('')

  const create = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (title.trim().length < 2) return setError('Enter a title')
    if (instructions.trim().length < 5) return setError('Add some instructions')
    if (!dueDate) return setError('Pick a due date')
    const score = parseInt(maxScore, 10)
    if (!score || score < 1) return setError('Max score must be a positive number')
    addAssignment({
      courseId,
      title,
      instructions,
      maxScore: score,
      dueDate: new Date(`${dueDate}T23:59:00`).toISOString(),
      allowLate,
      now: Date.now(),
    })
    setTitle(''); setInstructions(''); setMaxScore('20'); setDueDate(''); setAllowLate(true)
    onChange()
  }

  return (
    <div className='space-y-5'>
      <div>
        <h2 className='text-2xl font-black text-[#002EFF] italic uppercase'>Assignments</h2>
        <p className='text-[11px] font-bold text-slate-400'>
          Create assignments, review submissions &amp; grade your students.
        </p>
      </div>

      <div className='flex items-center gap-2 flex-wrap'>
        <BookOpen size={15} className='text-slate-400' />
        <select
          value={courseId}
          onChange={(e) => { setCourseId(e.target.value); setOpenId(null) }}
          className='h-10 px-3 rounded-lg bg-slate-50 border border-transparent focus:border-[#002EFF]/30 focus:bg-white outline-none text-sm font-bold'
        >
          {courses.map((c) => (
            <option key={c.id} value={c.id}>{c.title}</option>
          ))}
        </select>
      </div>

      {/* Create form */}
      <Card className='p-5 rounded-3xl border-none shadow-sm bg-white'>
        <form onSubmit={create} className='space-y-3'>
          {error && <p className='text-[11px] font-bold text-rose-600'>{error}</p>}
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder='Assignment title'
            className='w-full h-11 px-3 rounded-lg bg-slate-50 border border-transparent focus:border-[#002EFF]/30 focus:bg-white outline-none text-sm font-medium'
          />
          <textarea
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            placeholder='Instructions…'
            rows={3}
            className='w-full px-3 py-2 rounded-lg bg-slate-50 border border-transparent focus:border-[#002EFF]/30 focus:bg-white outline-none text-sm font-medium resize-none'
          />
          <div className='grid grid-cols-2 sm:grid-cols-3 gap-3'>
            <label className='space-y-1'>
              <span className='text-[9px] font-black uppercase text-slate-400'>Max score</span>
              <input type='number' min={1} value={maxScore} onChange={(e) => setMaxScore(e.target.value)}
                className='w-full h-11 px-3 rounded-lg bg-slate-50 border border-transparent focus:border-[#002EFF]/30 focus:bg-white outline-none text-sm font-medium' />
            </label>
            <label className='space-y-1'>
              <span className='text-[9px] font-black uppercase text-slate-400'>Due date</span>
              <input type='date' value={dueDate} onChange={(e) => setDueDate(e.target.value)}
                className='w-full h-11 px-3 rounded-lg bg-slate-50 border border-transparent focus:border-[#002EFF]/30 focus:bg-white outline-none text-sm font-medium' />
            </label>
            <label className='flex items-end gap-2 text-[11px] font-bold text-slate-500 pb-3'>
              <input type='checkbox' checked={allowLate} onChange={(e) => setAllowLate(e.target.checked)} />
              Allow late
            </label>
          </div>
          <button type='submit'
            className='flex items-center justify-center gap-2 h-11 w-full bg-[#002EFF] text-white rounded-xl font-black text-[11px] uppercase tracking-wide hover:bg-blue-700 active:scale-[0.98] transition-all'>
            <Plus size={15} /> Create Assignment
          </button>
        </form>
      </Card>

      {/* Assignment list */}
      <div className='space-y-2'>
        {assignments.length === 0 ? (
          <p className='text-xs font-bold text-slate-400 py-6 text-center'>No assignments yet for this course.</p>
        ) : (
          assignments.map((a) => {
            const subs = getSubmissions(a.id)
            const graded = subs.filter((s) => s.status === 'graded').length
            const open = openId === a.id
            const d = dueLabel(a.dueDate)
            return (
              <Card key={a.id} className='rounded-2xl border-none shadow-sm bg-white overflow-hidden'>
                <div className='p-4 flex items-center gap-3'>
                  <div className='h-9 w-9 rounded-xl bg-blue-50 text-[#002EFF] flex items-center justify-center shrink-0'>
                    <ClipboardList size={16} />
                  </div>
                  <div className='min-w-0 flex-1'>
                    <p className='text-xs font-black text-gray-800 truncate'>{a.title}</p>
                    <p className={`text-[10px] font-bold ${d.overdue ? 'text-rose-500' : 'text-slate-400'}`}>
                      {d.text} · /{a.maxScore}
                    </p>
                  </div>
                  <Badge className='bg-blue-50 text-[#002EFF] text-[8px] font-black'>
                    <Users size={9} className='mr-1' /> {subs.length} · {graded} graded
                  </Badge>
                  <button onClick={() => setOpenId(open ? null : a.id)} className='p-1.5 text-slate-400 hover:text-[#002EFF]'>
                    {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>
                  <button onClick={() => { removeAssignment(a.id); onChange() }} className='p-1.5 text-slate-400 hover:text-rose-600' title='Delete'>
                    <Trash2 size={15} />
                  </button>
                </div>

                {open && (
                  <div className='px-4 pb-4 space-y-2 border-t border-slate-50 pt-3'>
                    {subs.length === 0 ? (
                      <p className='text-[11px] font-bold text-slate-400'>No submissions yet.</p>
                    ) : (
                      subs.map((s) => (
                        <GradeRow key={s.id} sub={s} maxScore={a.maxScore} onGraded={onChange} />
                      ))
                    )}
                  </div>
                )}
              </Card>
            )
          })
        )}
      </div>
    </div>
  )
}

function GradeRow({ sub, maxScore, onGraded }: { sub: Submission; maxScore: number; onGraded: () => void }) {
  const [score, setScore] = useState(sub.score != null ? String(sub.score) : '')
  const [feedback, setFeedback] = useState(sub.feedback ?? '')
  const [saved, setSaved] = useState(false)

  const save = () => {
    const n = parseInt(score, 10)
    if (isNaN(n) || n < 0 || n > maxScore) return
    gradeSubmission({ submissionId: sub.id, score: n, feedback, gradedBy: 'tutor', now: Date.now() })
    setSaved(true)
    onGraded()
  }

  return (
    <div className='p-3 rounded-xl bg-slate-50/70'>
      <div className='flex items-center justify-between mb-1.5'>
        <span className='text-[11px] font-black text-gray-800'>{sub.studentName || sub.studentId}</span>
        <span className={`text-[9px] font-black uppercase ${sub.status === 'late' ? 'text-amber-600' : sub.status === 'graded' ? 'text-emerald-600' : 'text-blue-600'}`}>
          {sub.status}
        </span>
      </div>
      {sub.text && <p className='text-[11px] text-slate-600 mb-1.5 whitespace-pre-wrap'>{sub.text}</p>}
      {sub.fileUrl && (
        <a href={sub.fileUrl} target='_blank' rel='noreferrer' className='text-[10px] font-black text-[#002EFF] underline'>Open submitted file</a>
      )}
      <div className='flex items-center gap-2 mt-2'>
        <input type='number' min={0} max={maxScore} value={score} onChange={(e) => { setScore(e.target.value); setSaved(false) }}
          placeholder={`0–${maxScore}`}
          className='w-20 h-9 px-2 rounded-lg bg-white border border-slate-200 outline-none text-sm font-bold' />
        <span className='text-[10px] font-bold text-slate-400'>/ {maxScore}</span>
        <input value={feedback} onChange={(e) => { setFeedback(e.target.value); setSaved(false) }}
          placeholder='Feedback (optional)'
          className='flex-1 h-9 px-2 rounded-lg bg-white border border-slate-200 outline-none text-xs font-medium' />
        <button onClick={save} className='h-9 px-3 rounded-lg bg-[#002EFF] text-white text-[10px] font-black uppercase'>
          {saved ? 'Saved' : 'Grade'}
        </button>
      </div>
    </div>
  )
}

/* ---------------- Student: view & submit ---------------- */
function StudentAssignments({
  track,
  studentKey,
  studentName,
  onChange,
}: {
  track: string
  studentKey: string
  studentName: string
  onChange: () => void
}) {
  const groups = getAssignmentsForTrack(track)
  const courseIds = Object.keys(groups)

  return (
    <div className='space-y-5'>
      <div>
        <h2 className='text-2xl font-black text-[#002EFF] italic uppercase'>Assignments</h2>
        <p className='text-[11px] font-bold text-slate-400'>Submit your work and see your grades &amp; feedback.</p>
      </div>

      {courseIds.length === 0 ? (
        <p className='text-xs font-bold text-slate-400 py-8 text-center'>No assignments for your track yet.</p>
      ) : (
        courseIds.map((cid) => {
          const course = getCourses().find((c) => c.id === cid)
          return (
            <div key={cid} className='space-y-2'>
              <h3 className='text-[11px] font-black uppercase tracking-widest text-slate-500'>{course?.title ?? cid}</h3>
              {groups[cid].map((a) => (
                <StudentAssignmentCard key={a.id} assignment={a} studentKey={studentKey} studentName={studentName} onChange={onChange} />
              ))}
            </div>
          )
        })
      )}
    </div>
  )
}

function StudentAssignmentCard({
  assignment,
  studentKey,
  studentName,
  onChange,
}: {
  assignment: Assignment
  studentKey: string
  studentName: string
  onChange: () => void
}) {
  const mine = getMySubmission(assignment.id, studentKey)
  const [open, setOpen] = useState(false)
  const [text, setText] = useState(mine?.text ?? '')
  const [fileUrl, setFileUrl] = useState(mine?.fileUrl ?? '')
  const [error, setError] = useState('')
  const d = dueLabel(assignment.dueDate)
  const locked = mine?.status === 'graded'

  const submit = () => {
    setError('')
    if (!text.trim() && !fileUrl.trim()) return setError('Type an answer or add a file link')
    if (d.overdue && !assignment.allowLate && !mine) return setError('This assignment is past due and late submissions are off.')
    submitAssignment({ assignmentId: assignment.id, studentKey, studentName, text, fileUrl, now: Date.now() })
    setOpen(false)
    onChange()
  }

  const statusBadge = () => {
    if (!mine) return <Badge className='bg-slate-100 text-slate-500 text-[8px] font-black'>Not submitted</Badge>
    if (mine.status === 'graded')
      return <Badge className='bg-emerald-50 text-emerald-600 text-[8px] font-black'><Award size={9} className='mr-1' />{mine.score}/{assignment.maxScore}</Badge>
    if (mine.status === 'late')
      return <Badge className='bg-amber-50 text-amber-600 text-[8px] font-black'>Submitted late</Badge>
    return <Badge className='bg-blue-50 text-[#002EFF] text-[8px] font-black'>Submitted</Badge>
  }

  return (
    <Card className='rounded-2xl border-none shadow-sm bg-white overflow-hidden'>
      <div className='p-4 flex items-center gap-3'>
        <div className='h-9 w-9 rounded-xl bg-blue-50 text-[#002EFF] flex items-center justify-center shrink-0'>
          <ClipboardList size={16} />
        </div>
        <div className='min-w-0 flex-1'>
          <p className='text-xs font-black text-gray-800 truncate'>{assignment.title}</p>
          <p className={`text-[10px] font-bold flex items-center gap-1 ${d.overdue ? 'text-rose-500' : 'text-slate-400'}`}>
            {d.overdue ? <AlertTriangle size={10} /> : <Clock size={10} />} {d.text} · /{assignment.maxScore}
          </p>
        </div>
        {statusBadge()}
        <button onClick={() => setOpen(!open)} className='p-1.5 text-slate-400 hover:text-[#002EFF]'>
          {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
      </div>

      {open && (
        <div className='px-4 pb-4 space-y-3 border-t border-slate-50 pt-3'>
          <p className='text-[11px] text-slate-600 whitespace-pre-wrap'>{assignment.instructions}</p>

          {mine?.status === 'graded' && (
            <div className='p-3 rounded-xl bg-emerald-50'>
              <p className='text-[11px] font-black text-emerald-700 flex items-center gap-1'>
                <CheckCircle2 size={13} /> Graded: {mine.score}/{assignment.maxScore}
              </p>
              {mine.feedback && <p className='text-[11px] text-emerald-800 mt-1'>“{mine.feedback}”</p>}
            </div>
          )}

          {!locked && (
            <>
              {error && <p className='text-[11px] font-bold text-rose-600'>{error}</p>}
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder='Type your answer…'
                rows={3}
                className='w-full px-3 py-2 rounded-lg bg-slate-50 border border-transparent focus:border-[#002EFF]/30 focus:bg-white outline-none text-sm font-medium resize-none'
              />
              <input
                value={fileUrl}
                onChange={(e) => setFileUrl(e.target.value)}
                placeholder='…or paste a file link (https://…)'
                className='w-full h-11 px-3 rounded-lg bg-slate-50 border border-transparent focus:border-[#002EFF]/30 focus:bg-white outline-none text-sm font-medium'
              />
              <button
                onClick={submit}
                className='flex items-center justify-center gap-2 h-11 w-full bg-[#002EFF] text-white rounded-xl font-black text-[11px] uppercase tracking-wide hover:bg-blue-700 active:scale-[0.98] transition-all'
              >
                <Send size={14} /> {mine ? 'Update submission' : 'Submit'}
              </button>
            </>
          )}
        </div>
      )}
    </Card>
  )
}
