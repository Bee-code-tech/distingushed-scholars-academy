'use client'

import React, { useCallback, useEffect, useState } from 'react'
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
  Paperclip,
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { getCourses, categoryLabel } from '@/lib/coursesStore'
import type { CourseCategory } from '@/lib/types'
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
import { getUser, getToken } from '@/lib/auth'
import { isDemoToken } from '@/lib/demoAccounts'
import { dsaApi } from '@/lib/api'
import { uploadToCloudinary, cloudinaryConfigured } from '@/lib/cloudinary'
import { normaliseTrack } from '@/lib/studentProfile'
import type { Assignment, Submission, SubmissionStatus } from '@/lib/types'

function isLive(): boolean {
  const t = getToken()
  return !!t && !isDemoToken(t)
}

// ---- Mappers: live API rows -> the local Assignment/Submission shapes ----
function mapAssignment(a: Record<string, unknown>): Assignment {
  return {
    id: String(a.id ?? a._id ?? ''),
    courseId: String(a.courseId ?? ''),
    tutorId: a.tutorId ? String(a.tutorId) : undefined,
    title: String(a.title ?? ''),
    instructions: String(a.instructions ?? ''),
    attachmentUrl: a.attachmentUrl ? String(a.attachmentUrl) : undefined,
    maxScore: Number(a.maxScore ?? 0),
    dueDate: String(a.dueDate ?? new Date().toISOString()),
    allowLate: !!a.allowLate,
    createdAt: String(a.createdAt ?? ''),
  }
}

function mapSubmission(s: Record<string, unknown>): Submission {
  // studentId can be a plain id (own submission) or a populated object (tutor list).
  const sid = s.studentId as unknown
  const student = (s.student ?? {}) as Record<string, unknown>
  const sidObj =
    sid && typeof sid === 'object' ? (sid as Record<string, unknown>) : null
  return {
    id: String(s.id ?? s._id ?? ''),
    assignmentId: String(s.assignmentId ?? ''),
    studentId: sidObj
      ? String(sidObj._id ?? sidObj.id ?? '')
      : String(sid ?? ''),
    studentName:
      (student.fullname as string) ||
      (sidObj?.fullname as string) ||
      (s.studentName as string) ||
      undefined,
    fileUrl: s.fileUrl ? String(s.fileUrl) : undefined,
    text: s.text ? String(s.text) : undefined,
    status: (s.status as SubmissionStatus) ?? 'submitted',
    score: typeof s.score === 'number' ? (s.score as number) : undefined,
    feedback: s.feedback ? String(s.feedback) : undefined,
    gradedBy: s.gradedBy ? String(s.gradedBy) : undefined,
    submittedAt: String(s.submittedAt ?? ''),
    gradedAt: s.gradedAt ? String(s.gradedAt) : undefined,
  }
}

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
  const [live, setLive] = useState(false)
  const [loading, setLoading] = useState(true)
  const [courses, setCourses] = useState<
    { id: string; title: string; category?: string }[]
  >([])
  const [courseId, setCourseId] = useState('')
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [subsByA, setSubsByA] = useState<Record<string, Submission[]>>({})
  const [openId, setOpenId] = useState<string | null>(null)

  const [title, setTitle] = useState('')
  const [instructions, setInstructions] = useState('')
  const [maxScore, setMaxScore] = useState('20')
  const [dueDate, setDueDate] = useState('')
  const [allowLate, setAllowLate] = useState(true)
  const [error, setError] = useState('')

  // Load the tutor's courses (live: GET /courses?tutorId=me; local: store).
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      if (isLive()) {
        try {
          const cs = (await dsaApi.courses.list({
            tutorId: 'me',
          })) as Record<string, unknown>[]
          if (cancelled) return
          const mapped = cs.map((c) => ({
            id: String(c.id ?? c._id ?? ''),
            title: String(c.title ?? 'Course'),
            category: c.category ? String(c.category) : undefined,
          }))
          setCourses(mapped)
          setLive(true)
          setCourseId((p) => p || mapped[0]?.id || '')
          return
        } catch {
          /* fall through */
        }
      }
      if (cancelled) return
      const cs = getCourses().map((c) => ({
        id: c.id,
        title: c.title,
        category: c.category,
      }))
      setCourses(cs)
      setLive(false)
      setCourseId((p) => p || cs[0]?.id || '')
    })()
    return () => {
      cancelled = true
    }
  }, [])

  // Load assignments (+ their submissions) for the selected course.
  useEffect(() => {
    let cancelled = false
    setLoading(true)
    ;(async () => {
      if (!courseId) {
        if (!cancelled) {
          setAssignments([])
          setSubsByA({})
          setLoading(false)
        }
        return
      }
      if (live) {
        try {
          const asgs = (
            (await dsaApi.assignments.listForCourse(
              courseId,
            )) as Record<string, unknown>[]
          ).map(mapAssignment)
          const entries = await Promise.all(
            asgs.map(async (a) => {
              try {
                const subs = (
                  (await dsaApi.assignments.submissions(
                    a.id,
                  )) as Record<string, unknown>[]
                ).map(mapSubmission)
                return [a.id, subs] as const
              } catch {
                return [a.id, [] as Submission[]] as const
              }
            }),
          )
          if (cancelled) return
          setAssignments(asgs)
          setSubsByA(Object.fromEntries(entries))
          setLoading(false)
          return
        } catch {
          /* fall through to local */
        }
      }
      if (cancelled) return
      const asgs = getAssignments(courseId)
      const map: Record<string, Submission[]> = {}
      asgs.forEach((a) => (map[a.id] = getSubmissions(a.id)))
      setAssignments(asgs)
      setSubsByA(map)
      setLoading(false)
    })()
    return () => {
      cancelled = true
    }
  }, [courseId, live])

  const create = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (title.trim().length < 2) return setError('Enter a title')
    if (instructions.trim().length < 5) return setError('Add some instructions')
    if (!dueDate) return setError('Pick a due date')
    const score = parseInt(maxScore, 10)
    if (!score || score < 1)
      return setError('Max score must be a positive number')
    const dueISO = new Date(`${dueDate}T23:59:00`).toISOString()
    try {
      if (live) {
        await dsaApi.assignments.create(courseId, {
          title,
          instructions,
          maxScore: score,
          dueDate: dueISO,
          isPublished: true,
          allowLate,
        })
      } else {
        addAssignment({
          courseId,
          title,
          instructions,
          maxScore: score,
          dueDate: dueISO,
          allowLate,
          now: Date.now(),
        })
      }
      setTitle('')
      setInstructions('')
      setMaxScore('20')
      setDueDate('')
      setAllowLate(true)
      onChange()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create assignment')
    }
  }

  const remove = async (id: string) => {
    try {
      if (live) await dsaApi.assignments.remove(id)
      else removeAssignment(id)
      onChange()
    } catch {
      /* ignore — a reload will reflect the true state */
    }
  }

  if (loading && !courses.length) {
    return (
      <div className='py-16 flex justify-center'>
        <Loader2 className='animate-spin text-[#002EFF]' />
      </div>
    )
  }

  return (
    <div className='space-y-5'>
      <div className='flex items-start justify-between gap-3'>
        <div>
          <h2 className='text-2xl font-black text-[#002EFF] italic uppercase'>
            Assignments
          </h2>
          <p className='text-[11px] font-bold text-slate-400'>
            Create assignments, review submissions &amp; grade your students.
          </p>
        </div>
        <Badge
          className={`text-[8px] font-black shrink-0 ${live ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}
        >
          {live ? 'Live' : 'Local'}
        </Badge>
      </div>

      <div className='flex items-center gap-2 flex-wrap'>
        <BookOpen size={15} className='text-slate-400' />
        <select
          value={courseId}
          onChange={(e) => {
            setCourseId(e.target.value)
            setOpenId(null)
          }}
          className='h-10 px-3 rounded-lg bg-slate-50 border border-transparent focus:border-[#002EFF]/30 focus:bg-white outline-none text-sm font-bold'
        >
          {courses.length === 0 && <option value=''>No courses assigned</option>}
          {courses.map((c) => (
            <option key={c.id} value={c.id}>
              {c.category
                ? `${c.title} — ${categoryLabel(c.category as CourseCategory)}`
                : c.title}
            </option>
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
              <span className='text-[9px] font-black uppercase text-slate-400'>
                Max score
              </span>
              <input
                type='number'
                min={1}
                value={maxScore}
                onChange={(e) => setMaxScore(e.target.value)}
                className='w-full h-11 px-3 rounded-lg bg-slate-50 border border-transparent focus:border-[#002EFF]/30 focus:bg-white outline-none text-sm font-medium'
              />
            </label>
            <label className='space-y-1'>
              <span className='text-[9px] font-black uppercase text-slate-400'>
                Due date
              </span>
              <input
                type='date'
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className='w-full h-11 px-3 rounded-lg bg-slate-50 border border-transparent focus:border-[#002EFF]/30 focus:bg-white outline-none text-sm font-medium'
              />
            </label>
            <label className='flex items-end gap-2 text-[11px] font-bold text-slate-500 pb-3'>
              <input
                type='checkbox'
                checked={allowLate}
                onChange={(e) => setAllowLate(e.target.checked)}
              />
              Allow late
            </label>
          </div>
          <button
            type='submit'
            disabled={!courseId}
            className='flex items-center justify-center gap-2 h-11 w-full bg-[#002EFF] text-white rounded-xl font-black text-[11px] uppercase tracking-wide hover:bg-blue-700 active:scale-[0.98] transition-all disabled:opacity-50'
          >
            <Plus size={15} /> Create Assignment
          </button>
        </form>
      </Card>

      {/* Assignment list */}
      <div className='space-y-2'>
        {assignments.length === 0 ? (
          <p className='text-xs font-bold text-slate-400 py-6 text-center'>
            No assignments yet for this course.
          </p>
        ) : (
          assignments.map((a) => {
            const subs = subsByA[a.id] ?? []
            const graded = subs.filter((s) => s.status === 'graded').length
            const open = openId === a.id
            const d = dueLabel(a.dueDate)
            return (
              <Card
                key={a.id}
                className='rounded-2xl border-none shadow-sm bg-white overflow-hidden'
              >
                <div className='p-4 flex items-center gap-3'>
                  <div className='h-9 w-9 rounded-xl bg-blue-50 text-[#002EFF] flex items-center justify-center shrink-0'>
                    <ClipboardList size={16} />
                  </div>
                  <div className='min-w-0 flex-1'>
                    <p className='text-xs font-black text-gray-800 truncate'>
                      {a.title}
                    </p>
                    <p
                      className={`text-[10px] font-bold ${d.overdue ? 'text-rose-500' : 'text-slate-400'}`}
                    >
                      {d.text} · /{a.maxScore}
                    </p>
                  </div>
                  <Badge className='bg-blue-50 text-[#002EFF] text-[8px] font-black'>
                    <Users size={9} className='mr-1' /> {subs.length} · {graded}{' '}
                    graded
                  </Badge>
                  <button
                    onClick={() => setOpenId(open ? null : a.id)}
                    className='p-1.5 text-slate-400 hover:text-[#002EFF]'
                  >
                    {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>
                  <button
                    onClick={() => remove(a.id)}
                    className='p-1.5 text-slate-400 hover:text-rose-600'
                    title='Delete'
                  >
                    <Trash2 size={15} />
                  </button>
                </div>

                {open && (
                  <div className='px-4 pb-4 space-y-2 border-t border-slate-50 pt-3'>
                    {subs.length === 0 ? (
                      <p className='text-[11px] font-bold text-slate-400'>
                        No submissions yet.
                      </p>
                    ) : (
                      subs.map((s) => (
                        <GradeRow
                          key={s.id}
                          sub={s}
                          maxScore={a.maxScore}
                          live={live}
                          onGraded={onChange}
                        />
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

function GradeRow({
  sub,
  maxScore,
  live,
  onGraded,
}: {
  sub: Submission
  maxScore: number
  live: boolean
  onGraded: () => void
}) {
  const [score, setScore] = useState(sub.score != null ? String(sub.score) : '')
  const [feedback, setFeedback] = useState(sub.feedback ?? '')
  const [saved, setSaved] = useState(false)
  const [busy, setBusy] = useState(false)

  const save = async () => {
    const n = parseInt(score, 10)
    if (isNaN(n) || n < 0 || n > maxScore || busy) return
    setBusy(true)
    try {
      if (live) {
        await dsaApi.assignments.grade(sub.id, { score: n, feedback })
      } else {
        gradeSubmission({
          submissionId: sub.id,
          score: n,
          feedback,
          gradedBy: 'tutor',
          now: Date.now(),
        })
      }
      setSaved(true)
      onGraded()
    } catch {
      /* leave the row editable so the tutor can retry */
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className='p-3 rounded-xl bg-slate-50/70'>
      <div className='flex items-center justify-between mb-1.5'>
        <span className='text-[11px] font-black text-gray-800'>
          {sub.studentName || sub.studentId}
        </span>
        <span
          className={`text-[9px] font-black uppercase ${sub.status === 'late' ? 'text-amber-600' : sub.status === 'graded' ? 'text-emerald-600' : 'text-blue-600'}`}
        >
          {sub.status}
        </span>
      </div>
      {sub.text && (
        <p className='text-[11px] text-slate-600 mb-1.5 whitespace-pre-wrap'>
          {sub.text}
        </p>
      )}
      {sub.fileUrl && (
        <a
          href={sub.fileUrl}
          target='_blank'
          rel='noreferrer'
          className='text-[10px] font-black text-[#002EFF] underline'
        >
          Open submitted file
        </a>
      )}
      <div className='flex items-center gap-2 mt-2'>
        <input
          type='number'
          min={0}
          max={maxScore}
          value={score}
          onChange={(e) => {
            setScore(e.target.value)
            setSaved(false)
          }}
          placeholder={`0–${maxScore}`}
          className='w-20 h-9 px-2 rounded-lg bg-white border border-slate-200 outline-none text-sm font-bold'
        />
        <span className='text-[10px] font-bold text-slate-400'>/ {maxScore}</span>
        <input
          value={feedback}
          onChange={(e) => {
            setFeedback(e.target.value)
            setSaved(false)
          }}
          placeholder='Feedback (optional)'
          className='flex-1 h-9 px-2 rounded-lg bg-white border border-slate-200 outline-none text-xs font-medium'
        />
        <button
          onClick={save}
          disabled={busy}
          className='h-9 px-3 rounded-lg bg-[#002EFF] text-white text-[10px] font-black uppercase disabled:opacity-60'
        >
          {busy ? '…' : saved ? 'Saved' : 'Grade'}
        </button>
      </div>
    </div>
  )
}

/* ---------------- Student: view & submit ---------------- */
type CourseGroup = {
  course: { id: string; title: string; category?: string }
  assignments: Assignment[]
}

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
  const [live, setLive] = useState(false)
  const [loading, setLoading] = useState(true)
  const [groups, setGroups] = useState<CourseGroup[]>([])
  // Latest submission per assignmentId.
  const [subsByA, setSubsByA] = useState<Record<string, Submission>>({})

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      if (isLive()) {
        try {
          const courses = (await dsaApi.courses.mine()) as Record<
            string,
            unknown
          >[]
          const perCourse = await Promise.all(
            courses.map(async (c) => {
              const id = String(c.id ?? c._id ?? '')
              const assignments = (
                (await dsaApi.assignments.listForCourse(
                  id,
                )) as Record<string, unknown>[]
              ).map(mapAssignment)
              return {
                course: {
                  id,
                  title: String(c.title ?? 'Course'),
                  category: c.category ? String(c.category) : undefined,
                },
                assignments,
              }
            }),
          )
          const mine = (
            (await dsaApi.assignments.mySubmissions()) as Record<
              string,
              unknown
            >[]
          ).map(mapSubmission)
          if (cancelled) return
          const map: Record<string, Submission> = {}
          mine.forEach((s) => (map[s.assignmentId] = s))
          setGroups(perCourse.filter((g) => g.assignments.length))
          setSubsByA(map)
          setLive(true)
          setLoading(false)
          return
        } catch {
          /* fall through to local */
        }
      }
      if (cancelled) return
      const local = getAssignmentsForTrack(track)
      const g: CourseGroup[] = Object.keys(local).map((cid) => ({
        course: {
          id: cid,
          title: getCourses().find((c) => c.id === cid)?.title ?? cid,
          category: getCourses().find((c) => c.id === cid)?.category,
        },
        assignments: local[cid],
      }))
      const map: Record<string, Submission> = {}
      g.forEach((grp) =>
        grp.assignments.forEach((a) => {
          const mine = getMySubmission(a.id, studentKey)
          if (mine) map[a.id] = mine
        }),
      )
      setGroups(g)
      setSubsByA(map)
      setLive(false)
      setLoading(false)
    })()
    return () => {
      cancelled = true
    }
  }, [track, studentKey])

  if (loading) {
    return (
      <div className='py-16 flex justify-center'>
        <Loader2 className='animate-spin text-[#002EFF]' />
      </div>
    )
  }

  return (
    <div className='space-y-5'>
      <div className='flex items-start justify-between gap-3'>
        <div>
          <h2 className='text-2xl font-black text-[#002EFF] italic uppercase'>
            Assignments
          </h2>
          <p className='text-[11px] font-bold text-slate-400'>
            Submit your work and see your grades &amp; feedback.
          </p>
        </div>
        <Badge
          className={`text-[8px] font-black shrink-0 ${live ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}
        >
          {live ? 'Live' : 'Local'}
        </Badge>
      </div>

      {groups.length === 0 ? (
        <p className='text-xs font-bold text-slate-400 py-8 text-center'>
          No assignments for your courses yet.
        </p>
      ) : (
        groups.map((g) => (
          <div key={g.course.id} className='space-y-2'>
            <h3 className='text-[11px] font-black uppercase tracking-widest text-slate-500'>
              {g.course.category
                ? `${g.course.title} — ${categoryLabel(g.course.category as CourseCategory)}`
                : g.course.title}
            </h3>
            {g.assignments.map((a) => (
              <StudentAssignmentCard
                key={a.id}
                assignment={a}
                mine={subsByA[a.id] ?? null}
                live={live}
                studentKey={studentKey}
                studentName={studentName}
                onChange={onChange}
              />
            ))}
          </div>
        ))
      )}
    </div>
  )
}

function StudentAssignmentCard({
  assignment,
  mine,
  live,
  studentKey,
  studentName,
  onChange,
}: {
  assignment: Assignment
  mine: Submission | null
  live: boolean
  studentKey: string
  studentName: string
  onChange: () => void
}) {
  const [open, setOpen] = useState(false)
  const [text, setText] = useState(mine?.text ?? '')
  const [fileUrl, setFileUrl] = useState(mine?.fileUrl ?? '')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [uploadingFile, setUploadingFile] = useState(false)
  const [uploadNote, setUploadNote] = useState('')
  const d = dueLabel(assignment.dueDate)

  const onPickFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setUploadNote('')
    setError('')
    setUploadingFile(true)
    try {
      const { url } = await uploadToCloudinary(file, 'submissions')
      setFileUrl(url)
      setUploadNote('File attached ✓')
    } catch (err) {
      setUploadNote(
        err instanceof Error ? err.message : 'Upload unavailable — paste a link.',
      )
    } finally {
      setUploadingFile(false)
    }
  }
  // Live backend allows one submission per assignment, so lock once submitted.
  const locked = mine?.status === 'graded' || (live && !!mine)

  const submit = async () => {
    setError('')
    if (!text.trim() && !fileUrl.trim())
      return setError('Type an answer or add a file link')
    if (d.overdue && !assignment.allowLate && !mine)
      return setError('This assignment is past due and late submissions are off.')
    if (busy) return
    setBusy(true)
    try {
      if (live) {
        await dsaApi.assignments.submit(assignment.id, {
          text: text.trim() || undefined,
          fileUrl: fileUrl.trim() || undefined,
        })
      } else {
        submitAssignment({
          assignmentId: assignment.id,
          studentKey,
          studentName,
          text,
          fileUrl,
          now: Date.now(),
        })
      }
      setOpen(false)
      onChange()
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to submit'
      setError(
        /already|duplicate|409/i.test(msg)
          ? 'You have already submitted this assignment.'
          : msg,
      )
    } finally {
      setBusy(false)
    }
  }

  const statusBadge = () => {
    if (!mine)
      return (
        <Badge className='bg-slate-100 text-slate-500 text-[8px] font-black'>
          Not submitted
        </Badge>
      )
    if (mine.status === 'graded')
      return (
        <Badge className='bg-emerald-50 text-emerald-600 text-[8px] font-black'>
          <Award size={9} className='mr-1' />
          {mine.score}/{assignment.maxScore}
        </Badge>
      )
    if (mine.status === 'late')
      return (
        <Badge className='bg-amber-50 text-amber-600 text-[8px] font-black'>
          Submitted late
        </Badge>
      )
    return (
      <Badge className='bg-blue-50 text-[#002EFF] text-[8px] font-black'>
        Submitted
      </Badge>
    )
  }

  return (
    <Card className='rounded-2xl border-none shadow-sm bg-white overflow-hidden'>
      <div className='p-4 flex items-center gap-3'>
        <div className='h-9 w-9 rounded-xl bg-blue-50 text-[#002EFF] flex items-center justify-center shrink-0'>
          <ClipboardList size={16} />
        </div>
        <div className='min-w-0 flex-1'>
          <p className='text-xs font-black text-gray-800 truncate'>
            {assignment.title}
          </p>
          <p
            className={`text-[10px] font-bold flex items-center gap-1 ${d.overdue ? 'text-rose-500' : 'text-slate-400'}`}
          >
            {d.overdue ? <AlertTriangle size={10} /> : <Clock size={10} />}{' '}
            {d.text} · /{assignment.maxScore}
          </p>
        </div>
        {statusBadge()}
        <button
          onClick={() => setOpen(!open)}
          className='p-1.5 text-slate-400 hover:text-[#002EFF]'
        >
          {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
      </div>

      {open && (
        <div className='px-4 pb-4 space-y-3 border-t border-slate-50 pt-3'>
          <p className='text-[11px] text-slate-600 whitespace-pre-wrap'>
            {assignment.instructions}
          </p>

          {mine?.status === 'graded' && (
            <div className='p-3 rounded-xl bg-emerald-50'>
              <p className='text-[11px] font-black text-emerald-700 flex items-center gap-1'>
                <CheckCircle2 size={13} /> Graded: {mine.score}/
                {assignment.maxScore}
              </p>
              {mine.feedback && (
                <p className='text-[11px] text-emerald-800 mt-1'>
                  “{mine.feedback}”
                </p>
              )}
            </div>
          )}

          {locked ? (
            mine?.status !== 'graded' && (
              <p className='text-[11px] font-bold text-slate-400'>
                Submitted — waiting for your tutor to grade it.
              </p>
            )
          ) : (
            <>
              {error && (
                <p className='text-[11px] font-bold text-rose-600'>{error}</p>
              )}
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder='Type your answer…'
                rows={3}
                className='w-full px-3 py-2 rounded-lg bg-slate-50 border border-transparent focus:border-[#002EFF]/30 focus:bg-white outline-none text-sm font-medium resize-none'
              />
              {cloudinaryConfigured() && (
                <div className='flex items-center gap-2 flex-wrap'>
                  <label className='inline-flex items-center gap-2 h-11 px-4 rounded-lg bg-slate-100 hover:bg-slate-200 cursor-pointer text-[11px] font-black uppercase text-slate-600 transition-colors'>
                    {uploadingFile ? (
                      <Loader2 size={14} className='animate-spin' />
                    ) : (
                      <Paperclip size={14} />
                    )}
                    {uploadingFile ? 'Uploading…' : 'Attach file'}
                    <input
                      type='file'
                      onChange={onPickFile}
                      disabled={uploadingFile}
                      className='hidden'
                    />
                  </label>
                  {uploadNote && (
                    <span className='text-[10px] font-bold text-slate-500 flex-1 min-w-[140px]'>
                      {uploadNote}
                    </span>
                  )}
                </div>
              )}
              <input
                value={fileUrl}
                onChange={(e) => setFileUrl(e.target.value)}
                placeholder='…or paste a file link (https://…)'
                className='w-full h-11 px-3 rounded-lg bg-slate-50 border border-transparent focus:border-[#002EFF]/30 focus:bg-white outline-none text-sm font-medium'
              />
              <button
                onClick={submit}
                disabled={busy}
                className='flex items-center justify-center gap-2 h-11 w-full bg-[#002EFF] text-white rounded-xl font-black text-[11px] uppercase tracking-wide hover:bg-blue-700 active:scale-[0.98] transition-all disabled:opacity-60'
              >
                <Send size={14} /> {busy ? 'Submitting…' : mine ? 'Update submission' : 'Submit'}
              </button>
            </>
          )}
        </div>
      )}
    </Card>
  )
}
