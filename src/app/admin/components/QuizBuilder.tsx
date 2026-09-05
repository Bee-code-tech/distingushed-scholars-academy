'use client'

// Admin quiz builder — assemble a quiz from the tutor question bank. A quiz has
// one or more subject blocks, each with its own time limit and its chosen
// questions. See docs/quiz-feature.md.

import { useCallback, useEffect, useState, type ComponentType } from 'react'
import {
  Plus,
  Trash2,
  Loader2,
  HelpCircle,
  Check,
  Power,
  Copy,
  ListPlus,
  Clock,
  Users,
  Link as LinkIcon,
  ArrowLeft,
  Pencil,
  Search,
  FileQuestion,
  ClipboardList,
  Circle,
  ChevronLeft,
  ChevronRight,
  X,
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { dsaApi } from '@/lib/api'
import { canCreateQuiz, canDeleteQuiz } from '@/lib/quizPermissions'
import { JAMB_SUBJECTS } from '../constants/quiz'
import {
  EXAM_TRACKS,
  DEPARTMENT_LABELS,
  type ExamTrack,
  type Department,
} from '@/lib/studentProfile'
import {
  QUIZ_TRACKS,
  QUIZ_DEPARTMENTS,
  isDeptSplitTrack,
  audienceLabel,
} from '@/lib/quizAudience'

function adminToken(): string | undefined {
  if (typeof window === 'undefined') return undefined
  return (
    localStorage.getItem('admin_token') ||
    localStorage.getItem('token') ||
    undefined
  )
}

const LETTERS = ['A', 'B', 'C', 'D', 'E'] as const
const str = (v: unknown) => (v == null ? '' : String(v))

interface BankQ {
  id: string
  body: string
  topic?: string
  options: string[]
  correctOption: string
  imageUrl?: string
  mark: number
  batchName?: string
}
interface SubjectBlock {
  name: string
  timeLimit: number
  picked: BankQ[]
}

function normalizeQ(raw: Record<string, unknown>): BankQ {
  const labeled = (raw.optionsLabeled ?? {}) as Record<string, string>
  const options = Array.isArray(raw.options)
    ? (raw.options as string[])
    : LETTERS.map((l) => labeled[l]).filter(Boolean)
  return {
    id: str(raw.id ?? raw._id),
    body: str(raw.body ?? raw.questionText),
    topic: raw.topic ? str(raw.topic) : undefined,
    options,
    correctOption: str(raw.correctOption || LETTERS[Number(raw.correctAnswer) || 0]),
    imageUrl: raw.imageUrl ? str(raw.imageUrl) : undefined,
    mark: typeof raw.mark === 'number' ? raw.mark : Number(raw.marks) || 1,
    batchName: raw.batchName ? str(raw.batchName) : undefined,
  }
}

function toEmbed(q: BankQ) {
  const [A, B, C, D, E] = q.options
  return {
    body: q.body,
    topic: q.topic,
    A,
    B,
    C,
    D,
    E: E || undefined,
    Answer: q.correctOption,
    mark: q.mark,
    imageUrl: q.imageUrl,
  }
}

export default function QuizBuilder() {
  const token = adminToken()
  const canCreate = canCreateQuiz()
  const canDelete = canDeleteQuiz()
  const [quizzes, setQuizzes] = useState<Record<string, unknown>[]>([])
  const [loadingList, setLoadingList] = useState(true)
  const [openAttempts, setOpenAttempts] = useState<string | null>(null)
  // The list is the default view; the builder form opens on "Create New Quiz".
  const [showBuilder, setShowBuilder] = useState(false)
  // List dashboard controls.
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'live' | 'draft'>('all')
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'az'>('newest')
  const [page, setPage] = useState(1)
  const PAGE_SIZE = 8
  // When set, the builder is editing an existing quiz's details (not creating).
  const [editingId, setEditingId] = useState<string | null>(null)

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  // Audience: which programme (+ department) the quiz targets. 'all' = everyone.
  const [track, setTrack] = useState<ExamTrack | 'all'>('all')
  const [department, setDepartment] = useState<Department | ''>('')
  // Portal audience mode: by programme, or assigned to specific students.
  const [audienceMode, setAudienceMode] = useState<'programme' | 'students'>('programme')
  const [assignedStudents, setAssignedStudents] = useState<string[]>([])
  const [studentList, setStudentList] = useState<
    { id: string; name: string; email?: string }[]
  >([])
  const [studentSearch, setStudentSearch] = useState('')
  // Access mode: 'portal' (enrolled students, audience-filtered) or 'free'
  // (public link, anyone with name + age). Free quizzes are always 'all'.
  const [accessMode, setAccessMode] = useState<'portal' | 'free'>('portal')
  // Attempts & result controls. maxAttempts 0 = unlimited.
  const [maxAttempts, setMaxAttempts] = useState('1')
  const [showResults, setShowResults] = useState(true)
  const [showCorrections, setShowCorrections] = useState(true)
  const [blocks, setBlocks] = useState<SubjectBlock[]>([])
  const [publishing, setPublishing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  // Shareable public link shown after a free quiz is published.
  const [publicLink, setPublicLink] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const loadList = useCallback(async () => {
    setLoadingList(true)
    try {
      const rows = (await dsaApi.quizzes.list(token)) as Record<
        string,
        unknown
      >[]
      setQuizzes(rows)
    } catch {
      /* ignore */
    } finally {
      setLoadingList(false)
    }
  }, [token])

  useEffect(() => {
    loadList()
  }, [loadList])

  // Load the student roster once, for the "assign to selected students" picker.
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const rows = (await dsaApi.admin.listUsers('student', token)) as Record<
          string,
          unknown
        >[]
        if (cancelled) return
        setStudentList(
          rows.map((u) => ({
            id: str(u.id ?? u._id),
            name: str(u.fullname ?? u.fullName ?? u.username ?? 'Student'),
            email: u.email ? str(u.email) : undefined,
          })),
        )
      } catch {
        /* roster unavailable — the picker just shows nothing */
      }
    })()
    return () => {
      cancelled = true
    }
  }, [token])

  const flash = (m: string) => {
    setNotice(m)
    setTimeout(() => setNotice(null), 2500)
  }

  const addBlock = () =>
    setBlocks((b) => [
      ...b,
      { name: JAMB_SUBJECTS[0], timeLimit: 15, picked: [] },
    ])
  const removeBlock = (i: number) =>
    setBlocks((b) => b.filter((_, idx) => idx !== i))
  const patchBlock = (i: number, patch: Partial<SubjectBlock>) =>
    setBlocks((b) => b.map((blk, idx) => (idx === i ? { ...blk, ...patch } : blk)))

  const totalQuestions = blocks.reduce((n, b) => n + b.picked.length, 0)
  const totalMinutes = blocks.reduce((n, b) => n + (Number(b.timeLimit) || 0), 0)

  const publish = async () => {
    setError(null)
    if (title.trim().length < 3) return setError('Enter a quiz title.')
    // When editing, we update details only — questions aren't re-picked here.
    if (!editingId && totalQuestions === 0)
      return setError('Add at least one question.')
    if (
      accessMode === 'portal' &&
      audienceMode === 'students' &&
      assignedStudents.length === 0
    )
      return setError('Select at least one student to assign this quiz to.')
    // Dept-split programmes (WAEC / JAMB / Post-UTME) must carry a department so
    // Science / Art / Commercial students each see only their own quizzes.
    if (
      accessMode === 'portal' &&
      audienceMode === 'programme' &&
      track !== 'all' &&
      isDeptSplitTrack(track) &&
      !department
    )
      return setError(
        'Pick a department (Science, Art or Commercial) for this programme.',
      )
    setPublishing(true)
    setPublicLink(null)
    setCopied(false)
    // Free quizzes are always open to everyone — force the audience to 'all'.
    const isFree = accessMode === 'free'
    const effectiveTrack = isFree ? 'all' : track
    const dept =
      !isFree && effectiveTrack !== 'all' && isDeptSplitTrack(effectiveTrack)
        ? department || undefined
        : undefined
    // Shared detail fields (title, audience, access, attempts, result controls).
    const details: Record<string, unknown> = {
      title: title.trim(),
      description: description.trim() || title.trim(),
      accessMode,
      maxAttempts: Math.max(0, parseInt(maxAttempts, 10) || 0),
      showResults,
      showCorrections,
      track: effectiveTrack === 'all' ? 'all' : effectiveTrack,
      department: dept,
      audience: audienceLabel(
        effectiveTrack === 'all' ? null : effectiveTrack,
        dept,
      ),
    }
    // Assign to specific students (portal only). Assignment overrides the
    // programme audience, so the quiz only reaches the named students.
    if (!isFree && audienceMode === 'students') {
      details.assignedStudents = assignedStudents
      details.track = 'all'
      details.department = null
      details.audience = `${assignedStudents.length} selected student${assignedStudents.length === 1 ? '' : 's'}`
    } else {
      details.assignedStudents = []
    }
    try {
      if (editingId) {
        // Update details only — omitting `subjects` keeps the questions intact.
        await dsaApi.quizzes.update(editingId, details, token)
      } else {
        const created = (await dsaApi.quizzes.create(
          {
            ...details,
            type: 'general',
            subjects: blocks
              .filter((b) => b.picked.length)
              .map((b) => ({
                name: b.name,
                timeLimit: Number(b.timeLimit) || 0,
                questions: b.picked.map(toEmbed),
              })),
          } as Record<string, unknown>,
          token,
        )) as
          | { link?: string; publicLink?: string; data?: { publicLink?: string; link?: string } }
          | undefined
        if (isFree) {
          // The backend returns the slug as `publicLink` (inside the response
          // envelope's `data`). Read it robustly across shapes.
          const slug =
            created?.data?.publicLink ??
            created?.data?.link ??
            created?.publicLink ??
            created?.link
          setPublicLink(
            slug ? `${window.location.origin}/q/${slug}` : 'link-pending',
          )
        }
      }
      const wasEditing = !!editingId
      setTitle('')
      setDescription('')
      setTrack('all')
      setDepartment('')
      setAudienceMode('programme')
      setAssignedStudents([])
      setStudentSearch('')
      setAccessMode('portal')
      setMaxAttempts('1')
      setShowResults(true)
      setShowCorrections(true)
      setBlocks([])
      setEditingId(null)
      // Editing or a portal publish returns to the list; a free publish stays so
      // the shareable link shows.
      if (wasEditing || !isFree) setShowBuilder(false)
      flash(wasEditing ? 'Quiz updated' : isFree ? 'Free quiz published' : 'Quiz published')
      loadList()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not save the quiz.')
    } finally {
      setPublishing(false)
    }
  }

  // Open the builder pre-filled to edit a quiz's details.
  const startEdit = (q: Record<string, unknown>) => {
    const id = str(q.id ?? q._id)
    setEditingId(id)
    setTitle(str(q.title))
    setDescription(str(q.description))
    const mode = q.accessMode === 'free' ? 'free' : 'portal'
    setAccessMode(mode)
    const t = str(q.track || 'all')
    setTrack((t === 'all' ? 'all' : t) as ExamTrack | 'all')
    setDepartment((q.department as Department) || '')
    // Prefill the assignment picker from the quiz's assigned students.
    const assigned = Array.isArray(q.assignedStudents)
      ? (q.assignedStudents as unknown[]).map((s) =>
          s && typeof s === 'object'
            ? str((s as Record<string, unknown>).id ?? (s as Record<string, unknown>)._id)
            : str(s),
        )
      : []
    setAssignedStudents(assigned)
    setAudienceMode(assigned.length ? 'students' : 'programme')
    setStudentSearch('')
    setMaxAttempts(String(q.maxAttempts ?? 1))
    setShowResults(q.showResults !== false)
    setShowCorrections(q.showCorrections !== false)
    setBlocks([])
    setPublicLink(null)
    setError(null)
    setShowBuilder(true)
  }

  const toggleStatus = async (q: Record<string, unknown>) => {
    const id = str(q.id ?? q._id)
    const next = !q.isActive
    setQuizzes((qs) =>
      qs.map((x) => (str(x.id ?? x._id) === id ? { ...x, isActive: next } : x)),
    )
    try {
      await dsaApi.quizzes.setStatus(id, next, token)
    } catch {
      loadList()
    }
  }

  const removeQuiz = async (id: string) => {
    setQuizzes((qs) => qs.filter((x) => str(x.id ?? x._id) !== id))
    try {
      await dsaApi.quizzes.remove(id, token)
    } catch {
      loadList()
    }
  }

  return (
    <div className='max-w-4xl mx-auto space-y-6 px-1'>
      <div className='flex items-start justify-between gap-3'>
        <div>
          <h1 className='text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2'>
            <HelpCircle size={20} className='text-[#002EFF]' /> Quizzes
          </h1>
          <p className='text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-1'>
            {editingId
              ? 'Edit quiz details'
              : showBuilder
                ? 'Build a quiz from the tutor question bank'
                : 'Create and manage student assessments'}
          </p>
        </div>
        {(canCreate || showBuilder) && (
          <button
            onClick={() => {
              if (showBuilder) {
                // Leaving the builder — clear any in-progress edit.
                setEditingId(null)
                setShowBuilder(false)
              } else {
                setEditingId(null)
                setShowBuilder(true)
              }
            }}
            className='flex items-center gap-2 h-10 px-4 rounded-xl bg-[#002EFF] text-white font-black text-[11px] uppercase tracking-wide hover:bg-blue-700 active:scale-[0.98] shrink-0'
          >
            {showBuilder ? (
              <>
                <ArrowLeft size={15} /> Back to list
              </>
            ) : (
              <>
                <Plus size={15} /> Create New Quiz
              </>
            )}
          </button>
        )}
      </div>

      {notice && (
        <div className='flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-2.5'>
          <Check size={15} className='text-emerald-600' />
          <p className='text-[11px] font-bold text-emerald-700'>{notice}</p>
        </div>
      )}

      {publicLink && (
        <div className='rounded-2xl border border-[#FCB900]/50 bg-amber-50 px-4 py-3 space-y-2'>
          <p className='text-[10px] font-black uppercase tracking-widest text-amber-700 flex items-center gap-1.5'>
            <LinkIcon size={13} /> Shareable quiz link
          </p>
          {publicLink === 'link-pending' ? (
            <p className='text-[11px] font-bold text-amber-700'>
              The quiz is published as free. The public link will appear here once
              the backend returns its slug.
            </p>
          ) : (
            <div className='flex items-center gap-2'>
              <input
                readOnly
                value={publicLink}
                onFocus={(e) => e.currentTarget.select()}
                className='flex-1 h-9 px-2 rounded-lg bg-white border border-amber-200 text-[11px] font-bold text-slate-700 outline-none'
              />
              <button
                type='button'
                onClick={() => {
                  navigator.clipboard?.writeText(publicLink)
                  setCopied(true)
                  setTimeout(() => setCopied(false), 1800)
                }}
                className='h-9 px-3 rounded-lg bg-[#002EFF] text-white text-[10px] font-black uppercase flex items-center gap-1.5'
              >
                {copied ? <Check size={13} /> : <Copy size={13} />}
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>
          )}
          <p className='text-[9px] font-bold text-amber-600'>
            Anyone with this link can take the quiz — no account needed.
          </p>
        </div>
      )}

      {/* Builder — only when creating a new quiz */}
      {showBuilder && (
      <Card className='p-5 rounded-3xl border-none shadow-sm bg-white space-y-3'>
        {error && <p className='text-[11px] font-bold text-rose-600'>{error}</p>}
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder='Quiz title (e.g. JAMB Mock — Week 3)'
          className='w-full h-11 px-3 rounded-lg bg-slate-50 outline-none text-sm font-bold'
        />
        <input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder='Description (optional)'
          className='w-full h-10 px-3 rounded-lg bg-slate-50 outline-none text-sm font-medium'
        />

        {/* Access mode: portal (enrolled students) vs free (public link) */}
        <div className='rounded-2xl bg-slate-50/70 p-3 space-y-2'>
          <p className='text-[9px] font-black uppercase text-slate-400'>
            Access
          </p>
          <div className='grid grid-cols-2 gap-2'>
            <button
              type='button'
              onClick={() => setAccessMode('portal')}
              className={`flex flex-col items-start gap-0.5 rounded-xl px-3 py-2 border text-left transition-all ${
                accessMode === 'portal'
                  ? 'bg-[#002EFF] text-white border-[#002EFF] shadow'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-[#002EFF]/40'
              }`}
            >
              <span className='flex items-center gap-1.5 text-[11px] font-black'>
                <Users size={13} /> Portal
              </span>
              <span
                className={`text-[9px] font-bold ${accessMode === 'portal' ? 'text-blue-100' : 'text-slate-400'}`}
              >
                Enrolled students, by programme
              </span>
            </button>
            <button
              type='button'
              onClick={() => setAccessMode('free')}
              className={`flex flex-col items-start gap-0.5 rounded-xl px-3 py-2 border text-left transition-all ${
                accessMode === 'free'
                  ? 'bg-[#FCB900] text-[#002EFF] border-[#FCB900] shadow'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-[#FCB900]/60'
              }`}
            >
              <span className='flex items-center gap-1.5 text-[11px] font-black'>
                <LinkIcon size={13} /> Free (public link)
              </span>
              <span
                className={`text-[9px] font-bold ${accessMode === 'free' ? 'text-[#002EFF]/70' : 'text-slate-400'}`}
              >
                Anyone — just name &amp; age
              </span>
            </button>
          </div>
        </div>

        {/* Audience: which programme (+ department) sees this quiz (portal only) */}
        {accessMode === 'portal' ? (
          <div className='rounded-2xl bg-slate-50/70 p-3 space-y-2.5'>
            <p className='text-[9px] font-black uppercase text-slate-400'>
              Who sees this quiz
            </p>
            {/* By programme, or assigned to specific students */}
            <div className='inline-flex rounded-lg bg-white border border-slate-200 p-0.5'>
              <button
                type='button'
                onClick={() => setAudienceMode('programme')}
                className={`px-3 h-7 rounded-md text-[10px] font-black uppercase tracking-wide ${
                  audienceMode === 'programme'
                    ? 'bg-[#002EFF] text-white'
                    : 'text-slate-500'
                }`}
              >
                By programme
              </button>
              <button
                type='button'
                onClick={() => setAudienceMode('students')}
                className={`px-3 h-7 rounded-md text-[10px] font-black uppercase tracking-wide ${
                  audienceMode === 'students'
                    ? 'bg-[#002EFF] text-white'
                    : 'text-slate-500'
                }`}
              >
                Selected students
              </button>
            </div>

            {audienceMode === 'programme' ? (
              <div className='flex flex-wrap items-center gap-2'>
                <select
                  value={track}
                  onChange={(e) => setTrack(e.target.value as ExamTrack | 'all')}
                  className='h-9 px-2 rounded-lg bg-white border border-slate-200 outline-none text-[12px] font-black'
                >
                  <option value='all'>All students</option>
                  {QUIZ_TRACKS.map((t) => (
                    <option key={t} value={t}>
                      {EXAM_TRACKS[t].label}
                    </option>
                  ))}
                </select>
                {track !== 'all' && isDeptSplitTrack(track) && (
                  <select
                    value={department}
                    onChange={(e) =>
                      setDepartment(e.target.value as Department | '')
                    }
                    className={`h-9 px-2 rounded-lg bg-white border outline-none text-[12px] font-black ${
                      department ? 'border-slate-200' : 'border-rose-300'
                    }`}
                  >
                    <option value=''>Select department…</option>
                    {QUIZ_DEPARTMENTS.map((d) => (
                      <option key={d} value={d}>
                        {DEPARTMENT_LABELS[d]}
                      </option>
                    ))}
                  </select>
                )}
                <span className='text-[10px] font-bold text-slate-400'>
                  →{' '}
                  {audienceLabel(
                    track === 'all' ? null : track,
                    track !== 'all' && isDeptSplitTrack(track) ? department : null,
                  )}
                </span>
              </div>
            ) : (
              <StudentPicker
                all={studentList}
                selected={assignedStudents}
                onToggle={(id) =>
                  setAssignedStudents((prev) =>
                    prev.includes(id)
                      ? prev.filter((x) => x !== id)
                      : [...prev, id],
                  )
                }
                onClear={() => setAssignedStudents([])}
                search={studentSearch}
                setSearch={setStudentSearch}
              />
            )}
          </div>
        ) : (
          <p className='text-[10px] font-bold text-slate-400 px-1'>
            Open to <span className='text-[#002EFF]'>everyone</span> via a shareable
            link — no account needed. Takers enter their name and age, take the
            quiz, then see their result.
          </p>
        )}

        {/* Attempts & result controls */}
        <div className='rounded-2xl bg-slate-50/70 p-3 space-y-2.5'>
          <p className='text-[9px] font-black uppercase text-slate-400'>
            Attempts &amp; results
          </p>
          <label className='flex items-center justify-between gap-3'>
            <span className='text-[11px] font-bold text-slate-600'>
              Attempts allowed{' '}
              <span className='text-slate-400'>(0 = unlimited)</span>
            </span>
            <input
              type='number'
              min={0}
              value={maxAttempts}
              onChange={(e) => setMaxAttempts(e.target.value)}
              className='w-20 h-9 px-2 rounded-lg bg-white border border-slate-200 outline-none text-[12px] font-black text-center'
            />
          </label>
          <label className='flex items-center justify-between gap-3 cursor-pointer'>
            <span className='text-[11px] font-bold text-slate-600'>
              Show results to students
            </span>
            <input
              type='checkbox'
              checked={showResults}
              onChange={(e) => setShowResults(e.target.checked)}
              className='h-4 w-4 accent-[#002EFF]'
            />
          </label>
          <label
            className={`flex items-center justify-between gap-3 cursor-pointer ${!showResults ? 'opacity-50' : ''}`}
          >
            <span className='text-[11px] font-bold text-slate-600'>
              Allow viewing corrections
            </span>
            <input
              type='checkbox'
              checked={showCorrections && showResults}
              disabled={!showResults}
              onChange={(e) => setShowCorrections(e.target.checked)}
              className='h-4 w-4 accent-[#002EFF]'
            />
          </label>
        </div>

        {editingId ? (
          <p className='text-[10px] font-bold text-slate-400 rounded-xl bg-slate-50 px-3 py-2.5'>
            Editing this quiz&apos;s details (title, audience, access, attempts,
            result settings). The questions stay as they are — to change questions,
            create a new quiz.
          </p>
        ) : (
          <>
            {blocks.map((b, i) => (
              <SubjectBlockEditor
                key={i}
                block={b}
                token={token}
                onChange={(patch) => patchBlock(i, patch)}
                onRemove={() => removeBlock(i)}
              />
            ))}

            <button
              onClick={addBlock}
              className='w-full flex items-center justify-center gap-2 h-10 rounded-xl border-2 border-dashed border-slate-200 text-slate-500 text-[11px] font-black uppercase tracking-wide hover:border-[#002EFF]/40 hover:text-[#002EFF]'
            >
              <Plus size={14} /> Add subject
            </button>
          </>
        )}

        <div className='flex items-center justify-between pt-1'>
          <span className='text-[11px] font-black text-slate-400 flex items-center gap-1'>
            {editingId ? (
              'Editing details'
            ) : (
              <>
                {totalQuestions} question{totalQuestions === 1 ? '' : 's'} ·{' '}
                {blocks.length} subject{blocks.length === 1 ? '' : 's'}
                {totalMinutes > 0 && (
                  <>
                    {' '}
                    · <Clock size={11} /> {totalMinutes} min total
                  </>
                )}
              </>
            )}
          </span>
          <button
            onClick={publish}
            disabled={publishing}
            className='flex items-center gap-2 h-10 px-5 bg-[#002EFF] text-white rounded-xl font-black text-[11px] uppercase tracking-wide hover:bg-blue-700 active:scale-[0.98] disabled:opacity-50'
          >
            {publishing ? (
              <Loader2 size={15} className='animate-spin' />
            ) : (
              <Check size={15} />
            )}
            {editingId ? 'Save changes' : 'Publish quiz'}
          </button>
        </div>
      </Card>
      )}

      {/* Existing quizzes — the default list view */}
      {!showBuilder && (() => {
        const total = quizzes.length
        const live = quizzes.filter((q) => q.isActive).length
        const draft = total - live
        const knowAttempts = quizzes.some(
          (q) => q.attemptsCount != null || q.attempts != null || q.takenCount != null,
        )
        const totalAttempts = quizzes.reduce(
          (n, q) => n + (Number(q.attemptsCount ?? q.attempts ?? q.takenCount) || 0),
          0,
        )

        const term = search.trim().toLowerCase()
        const list = quizzes
          .filter((q) => {
            if (statusFilter === 'live' && !q.isActive) return false
            if (statusFilter === 'draft' && q.isActive) return false
            if (!term) return true
            return `${str(q.title)} ${str(q.accessCode)}`
              .toLowerCase()
              .includes(term)
          })
          .sort((a, b) => {
            if (sortBy === 'az') return str(a.title).localeCompare(str(b.title))
            const ta = new Date(str(a.createdAt)).getTime() || 0
            const tb = new Date(str(b.createdAt)).getTime() || 0
            return sortBy === 'oldest' ? ta - tb : tb - ta
          })

        const pageCount = Math.max(1, Math.ceil(list.length / PAGE_SIZE))
        const safePage = Math.min(page, pageCount)
        const paged = list.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)

        return (
          <div className='space-y-4'>
            {/* Summary */}
            <div className='grid grid-cols-2 sm:grid-cols-4 gap-3'>
              <StatCard label='Total quizzes' value={total} icon={ClipboardList} tint='text-[#002EFF] bg-blue-50' />
              <StatCard label='Live' value={live} icon={Circle} tint='text-emerald-600 bg-emerald-50' />
              <StatCard label='Draft' value={draft} icon={Circle} tint='text-amber-600 bg-amber-50' />
              <StatCard label='Attempts' value={knowAttempts ? totalAttempts : '—'} icon={Users} tint='text-violet-600 bg-violet-50' />
            </div>

            {/* Search + filters */}
            <div className='flex flex-col sm:flex-row gap-2'>
              <div className='relative flex-1'>
                <Search size={14} className='absolute left-3 top-1/2 -translate-y-1/2 text-slate-400' />
                <input
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(1) }}
                  placeholder='Search by quiz name or code…'
                  className='w-full h-10 pl-9 pr-3 rounded-xl bg-white border border-slate-200 focus:border-[#002EFF]/40 outline-none text-sm font-medium'
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => { setStatusFilter(e.target.value as 'all' | 'live' | 'draft'); setPage(1) }}
                className='h-10 px-3 rounded-xl bg-white border border-slate-200 outline-none text-[12px] font-bold'
              >
                <option value='all'>All status</option>
                <option value='live'>Live</option>
                <option value='draft'>Draft</option>
              </select>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'newest' | 'oldest' | 'az')}
                className='h-10 px-3 rounded-xl bg-white border border-slate-200 outline-none text-[12px] font-bold'
              >
                <option value='newest'>Newest</option>
                <option value='oldest'>Oldest</option>
                <option value='az'>A–Z</option>
              </select>
            </div>

            {/* List */}
            {loadingList ? (
              <div className='py-10 flex justify-center'>
                <Loader2 className='animate-spin text-[#002EFF]' />
              </div>
            ) : total === 0 ? (
              <div className='py-14 flex flex-col items-center gap-2 text-center'>
                <FileQuestion size={30} className='text-slate-300' />
                <p className='text-sm font-black text-slate-600'>No quizzes yet</p>
                <p className='text-[11px] font-bold text-slate-400 max-w-[220px]'>
                  Create your first quiz to start assessing your students.
                </p>
                {canCreate && (
                  <button
                    onClick={() => setShowBuilder(true)}
                    className='mt-2 flex items-center gap-1.5 h-9 px-4 bg-[#002EFF] text-white rounded-xl font-black text-[10px] uppercase tracking-wide hover:bg-blue-700'
                  >
                    <Plus size={14} /> Create New Quiz
                  </button>
                )}
              </div>
            ) : list.length === 0 ? (
              <div className='py-14 flex flex-col items-center gap-2 text-center'>
                <Search size={26} className='text-slate-300' />
                <p className='text-sm font-black text-slate-600'>No quizzes found</p>
                <p className='text-[11px] font-bold text-slate-400'>
                  Nothing matches your search or filter.
                </p>
                <button
                  onClick={() => { setSearch(''); setStatusFilter('all'); setPage(1) }}
                  className='mt-1 text-[10px] font-black uppercase text-[#002EFF] hover:underline'
                >
                  Clear filters
                </button>
              </div>
            ) : (
              <div className='space-y-2'>
                {paged.map((q) => {
                  const id = str(q.id ?? q._id)
                  const code = str(q.accessCode)
                  const subjects = Array.isArray(q.subjects) ? q.subjects.length : 0
                  const open = openAttempts === id
                  return (
                    <div key={id} className='space-y-2'>
                      <Card className='p-3.5 rounded-2xl border border-slate-100 shadow-sm bg-white'>
                        <div className='flex flex-wrap items-center gap-3'>
                          {/* Quiz info */}
                          <div className='min-w-0 flex-1'>
                            <div className='flex items-center gap-2'>
                              <p className='text-sm font-black text-gray-800 truncate'>
                                {str(q.title)}
                              </p>
                              <StatusBadge live={Boolean(q.isActive)} />
                            </div>
                            <p className='text-[10px] font-bold text-slate-400 mt-0.5 flex items-center flex-wrap gap-x-1.5'>
                              <span className='text-[#002EFF]'>
                                {audienceLabel(
                                  (q.track as string) ?? null,
                                  (q.department as string) ?? null,
                                )}
                              </span>
                              · {subjects} subject{subjects === 1 ? '' : 's'}
                              · {str(q.totalMarks) || 0} marks
                              {code && (
                                <button
                                  onClick={() => navigator.clipboard?.writeText(code)}
                                  className='inline-flex items-center gap-1 text-[#002EFF] hover:underline'
                                  title='Copy access code'
                                >
                                  <Copy size={9} /> {code}
                                </button>
                              )}
                            </p>
                          </div>
                          {/* Actions */}
                          <div className='flex items-center gap-1.5 shrink-0'>
                            <button
                              onClick={() => setOpenAttempts((cur) => (cur === id ? null : id))}
                              className={`flex items-center gap-1 px-2.5 h-8 rounded-lg text-[10px] font-black uppercase ${
                                open ? 'bg-[#002EFF] text-white' : 'bg-blue-50 text-[#002EFF] hover:bg-blue-100'
                              }`}
                              title='View attempts, leaderboard & manage results'
                            >
                              <Users size={11} /> Attempts
                            </button>
                            <button
                              onClick={() => startEdit(q)}
                              className='flex items-center gap-1 px-2.5 h-8 rounded-lg text-[10px] font-black uppercase bg-slate-100 text-slate-500 hover:text-[#002EFF]'
                              title='Edit quiz details'
                            >
                              <Pencil size={11} /> Edit
                            </button>
                            <button
                              onClick={() => toggleStatus(q)}
                              className='flex items-center gap-1 px-2.5 h-8 rounded-lg text-[10px] font-black uppercase bg-slate-100 text-slate-500 hover:text-[#002EFF]'
                              title={q.isActive ? 'Unpublish (make draft)' : 'Publish (go live)'}
                            >
                              <Power size={11} /> {q.isActive ? 'Unpublish' : 'Publish'}
                            </button>
                            {canDelete && (
                              <button
                                onClick={() => removeQuiz(id)}
                                className='p-1.5 text-slate-300 hover:text-rose-500'
                                title='Delete quiz'
                              >
                                <Trash2 size={14} />
                              </button>
                            )}
                          </div>
                        </div>
                      </Card>
                      {open && <AttemptsPanel quizId={id} token={token} />}
                    </div>
                  )
                })}

                {/* Pagination */}
                {pageCount > 1 && (
                  <div className='flex items-center justify-between pt-2'>
                    <span className='text-[10px] font-bold text-slate-400'>
                      Showing {(safePage - 1) * PAGE_SIZE + 1}–
                      {Math.min(safePage * PAGE_SIZE, list.length)} of {list.length}
                    </span>
                    <div className='flex items-center gap-1'>
                      <button
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={safePage <= 1}
                        className='h-8 w-8 flex items-center justify-center rounded-lg bg-white border border-slate-200 text-slate-500 disabled:opacity-40 hover:border-[#002EFF]/40'
                      >
                        <ChevronLeft size={15} />
                      </button>
                      <span className='text-[11px] font-black text-slate-600 px-2 tabular-nums'>
                        {safePage} / {pageCount}
                      </span>
                      <button
                        onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
                        disabled={safePage >= pageCount}
                        className='h-8 w-8 flex items-center justify-center rounded-lg bg-white border border-slate-200 text-slate-500 disabled:opacity-40 hover:border-[#002EFF]/40'
                      >
                        <ChevronRight size={15} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )
      })()}
    </div>
  )
}

/** Compact summary tile for the quizzes dashboard. */
function StatCard({
  label,
  value,
  icon: Icon,
  tint,
}: {
  label: string
  value: number | string
  icon: ComponentType<{ size?: number; className?: string }>
  tint: string
}) {
  return (
    <Card className='p-3 rounded-2xl border border-slate-100 shadow-sm bg-white flex items-center gap-2.5'>
      <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${tint}`}>
        <Icon size={15} />
      </div>
      <div className='min-w-0'>
        <p className='text-lg font-black text-slate-900 leading-none tabular-nums'>{value}</p>
        <p className='text-[8px] font-black uppercase tracking-widest text-slate-400 mt-1 truncate'>
          {label}
        </p>
      </div>
    </Card>
  )
}

/** Search + multi-select roster for assigning a quiz to specific students. */
function StudentPicker({
  all,
  selected,
  onToggle,
  onClear,
  search,
  setSearch,
}: {
  all: { id: string; name: string; email?: string }[]
  selected: string[]
  onToggle: (id: string) => void
  onClear: () => void
  search: string
  setSearch: (v: string) => void
}) {
  const term = search.trim().toLowerCase()
  const filtered = term
    ? all.filter(
        (s) =>
          s.name.toLowerCase().includes(term) ||
          (s.email ?? '').toLowerCase().includes(term),
      )
    : all
  const nameFor = (id: string) => all.find((s) => s.id === id)?.name ?? 'Student'

  return (
    <div className='space-y-2'>
      <div className='relative'>
        <Search size={13} className='absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400' />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder='Search students by name or email…'
          className='w-full h-9 pl-8 pr-3 rounded-lg bg-white border border-slate-200 outline-none text-[12px] font-medium'
        />
      </div>

      {selected.length > 0 && (
        <div className='flex flex-wrap items-center gap-1.5'>
          {selected.map((id) => (
            <span
              key={id}
              className='inline-flex items-center gap-1 pl-2 pr-1 py-0.5 rounded-full bg-blue-50 text-[#002EFF] text-[10px] font-bold'
            >
              {nameFor(id)}
              <button
                type='button'
                onClick={() => onToggle(id)}
                className='hover:text-rose-600'
                title='Remove'
              >
                <X size={11} />
              </button>
            </span>
          ))}
          <button
            type='button'
            onClick={onClear}
            className='text-[9px] font-black uppercase text-slate-400 hover:text-rose-500 ml-1'
          >
            Clear
          </button>
        </div>
      )}

      <div className='max-h-44 overflow-y-auto rounded-lg border border-slate-200 bg-white divide-y divide-slate-50'>
        {all.length === 0 ? (
          <p className='text-[11px] font-bold text-slate-400 px-3 py-3'>
            No students found.
          </p>
        ) : filtered.length === 0 ? (
          <p className='text-[11px] font-bold text-slate-400 px-3 py-3'>
            No match for “{search}”.
          </p>
        ) : (
          filtered.map((s) => {
            const on = selected.includes(s.id)
            return (
              <button
                type='button'
                key={s.id}
                onClick={() => onToggle(s.id)}
                className='w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-slate-50'
              >
                <span
                  className={`h-4 w-4 rounded flex items-center justify-center shrink-0 border ${
                    on
                      ? 'bg-[#002EFF] border-[#002EFF] text-white'
                      : 'border-slate-300'
                  }`}
                >
                  {on && <Check size={11} />}
                </span>
                <span className='min-w-0'>
                  <span className='block text-[12px] font-black text-slate-700 truncate'>
                    {s.name}
                  </span>
                  {s.email && (
                    <span className='block text-[9px] font-bold text-slate-400 truncate'>
                      {s.email}
                    </span>
                  )}
                </span>
              </button>
            )
          })
        )}
      </div>
      <p className='text-[10px] font-bold text-slate-400'>
        {selected.length} student{selected.length === 1 ? '' : 's'} assigned — only
        they will see this quiz.
      </p>
    </div>
  )
}

/** Live / Draft status badge — information, not an action. */
function StatusBadge({ live }: { live: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wide shrink-0 ${
        live ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'
      }`}
    >
      <Circle size={7} className='fill-current' /> {live ? 'Live' : 'Draft'}
    </span>
  )
}

/** Admin panel: who took a quiz, the leaderboard, and per-attempt controls.
 *  Live-first — degrades to an empty/"not available" state until the backend
 *  ships the attempts routes (docs/backend-requests-2026-09-02.md §6). */
function AttemptsPanel({ quizId, token }: { quizId: string; token?: string }) {
  const [attempts, setAttempts] = useState<Record<string, unknown>[]>([])
  const [board, setBoard] = useState<Record<string, unknown>[]>([])
  const [loading, setLoading] = useState(true)
  const [ready, setReady] = useState(true)
  // Per-student score breakdown (View button).
  const [openDetail, setOpenDetail] = useState<string | null>(null)
  const [resultsById, setResultsById] = useState<
    Record<string, Record<string, unknown>>
  >({})
  const [questionMap, setQuestionMap] = useState<
    Record<string, { subject: string }>
  >({})
  const [detailLoading, setDetailLoading] = useState(false)

  // Load the per-question results + the quiz's question→subject map, once.
  const loadDetailData = useCallback(async () => {
    if (Object.keys(resultsById).length) return
    setDetailLoading(true)
    try {
      const [results, quiz] = await Promise.all([
        dsaApi.quizzes.results(quizId, token) as Promise<
          Record<string, unknown>[]
        >,
        dsaApi.quizzes.get(quizId, token) as Promise<Record<string, unknown>>,
      ])
      const byId: Record<string, Record<string, unknown>> = {}
      results.forEach((r) => {
        byId[str(r.id ?? r._id)] = r
      })
      setResultsById(byId)
      const qmap: Record<string, { subject: string }> = {}
      const subjects = Array.isArray(quiz?.subjects) ? quiz.subjects : []
      subjects.forEach((s: Record<string, unknown>) => {
        const qs = Array.isArray(s.questions) ? s.questions : []
        qs.forEach((q: Record<string, unknown>) => {
          qmap[str(q._id ?? q.id)] = { subject: str(s.name || 'General') }
        })
      })
      setQuestionMap(qmap)
    } catch {
      /* results endpoint unavailable — the detail just won't populate */
    } finally {
      setDetailLoading(false)
    }
  }, [quizId, token, resultsById])

  const openStudent = (aid: string) => {
    if (openDetail === aid) {
      setOpenDetail(null)
      return
    }
    setOpenDetail(aid)
    loadDetailData()
  }

  // Compute a student's per-subject correct/total from their stored answers.
  const breakdownFor = (aid: string) => {
    const result = resultsById[aid]
    const answers = Array.isArray(result?.answers)
      ? (result!.answers as Record<string, unknown>[])
      : []
    if (!answers.length) return null
    const bySubject: Record<string, { correct: number; total: number }> = {}
    answers.forEach((a) => {
      const subj = questionMap[str(a.questionId)]?.subject || 'General'
      if (!bySubject[subj]) bySubject[subj] = { correct: 0, total: 0 }
      bySubject[subj].total += 1
      if (a.isCorrect) bySubject[subj].correct += 1
    })
    const correct = answers.filter((a) => a.isCorrect).length
    return { bySubject, correct, total: answers.length, answers }
  }

  const load = useCallback(async () => {
    setLoading(true)
    const [a, b] = await Promise.allSettled([
      dsaApi.quizzes.attempts(quizId, token) as Promise<Record<string, unknown>[]>,
      dsaApi.quizzes.getLeaderboard(quizId, token) as unknown as Promise<
        Record<string, unknown>[]
      >,
    ])
    setAttempts(a.status === 'fulfilled' && Array.isArray(a.value) ? a.value : [])
    setBoard(b.status === 'fulfilled' && Array.isArray(b.value) ? b.value : [])
    // If the attempts route isn't live yet, flag it so we show a hint.
    setReady(a.status === 'fulfilled')
    setLoading(false)
  }, [quizId, token])

  useEffect(() => {
    load()
  }, [load])

  const rowId = (r: Record<string, unknown>) =>
    str(r.attemptId ?? r.id ?? r._id)

  const del = async (aid: string) => {
    try {
      await dsaApi.quizzes.deleteAttempt(quizId, aid, token)
      setAttempts((prev) => prev.filter((r) => rowId(r) !== aid))
    } catch {
      /* ignore — a reload reflects the true state */
    }
  }
  const withdraw = async (aid: string) => {
    try {
      await dsaApi.quizzes.withdrawAttempt(quizId, aid, token)
      setAttempts((prev) =>
        prev.map((r) => (rowId(r) === aid ? { ...r, withdrawn: true } : r)),
      )
    } catch {
      /* ignore */
    }
  }

  const pctOf = (r: Record<string, unknown>) => {
    const p = Number(r.percentage)
    if (!isNaN(p) && r.percentage != null) return p <= 1 ? Math.round(p * 100) : Math.round(p)
    const s = Number(r.score ?? r.totalScore)
    const t = Number(r.totalMarks ?? r.total)
    return t > 0 ? Math.round((s / t) * 100) : 0
  }

  return (
    <Card className='p-4 rounded-2xl border-none shadow-sm bg-slate-50/70 space-y-3'>
      {loading ? (
        <div className='py-4 flex justify-center'>
          <Loader2 className='animate-spin text-[#002EFF]' size={16} />
        </div>
      ) : (
        <>
          <p className='text-[9px] font-black uppercase tracking-widest text-slate-400'>
            {attempts.length} student{attempts.length === 1 ? '' : 's'} took this quiz
          </p>

          {board.length > 0 && (
            <div>
              <p className='text-[9px] font-black uppercase text-slate-400 mb-1'>
                Leaderboard
              </p>
              <div className='space-y-1'>
                {board.slice(0, 5).map((r, i) => (
                  <div
                    key={str(r.userId ?? r.username ?? i)}
                    className='flex items-center gap-2 text-[11px] font-bold text-slate-600'
                  >
                    <span className='w-5 text-[#FCB900] font-black'>
                      #{Number(r.rank) || i + 1}
                    </span>
                    <span className='flex-1 truncate'>
                      {str(r.username ?? r.studentName ?? 'Student')}
                    </span>
                    <span className='font-black text-[#002EFF]'>
                      {str(r.score)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {attempts.length === 0 ? (
            <p className='text-[11px] font-bold text-slate-400'>
              {ready
                ? 'No attempts yet.'
                : 'Attempt list will appear here once the backend endpoint is live.'}
            </p>
          ) : (
            <div className='space-y-1.5'>
              {attempts.map((r) => {
                const aid = rowId(r)
                const withdrawn = !!r.withdrawn
                const isOpen = openDetail === aid
                const detail = isOpen ? breakdownFor(aid) : null
                return (
                  <div key={aid} className='rounded-xl bg-white overflow-hidden'>
                    <div
                      className={`flex items-center gap-2 px-3 py-2 ${withdrawn ? 'opacity-50' : ''}`}
                    >
                      <div className='min-w-0 flex-1'>
                        <p className='text-[11px] font-black text-slate-700 truncate'>
                          {str(r.studentName ?? r.fullname ?? r.username ?? 'Student')}
                          {withdrawn && (
                            <span className='ml-1 text-[9px] font-black uppercase text-rose-500'>
                              · withdrawn
                            </span>
                          )}
                        </p>
                        <p className='text-[9px] font-bold text-slate-400'>
                          {pctOf(r)}% · {str(r.score ?? r.totalScore)}/
                          {str(r.totalMarks ?? r.total)}
                          {r.submittedAt
                            ? ` · ${new Date(str(r.submittedAt)).toLocaleDateString()}`
                            : ''}
                        </p>
                      </div>
                      <button
                        onClick={() => openStudent(aid)}
                        className={`px-2 py-1 rounded-lg text-[9px] font-black uppercase ${
                          isOpen
                            ? 'bg-[#002EFF] text-white'
                            : 'bg-blue-50 text-[#002EFF]'
                        }`}
                        title='View this student’s score breakdown'
                      >
                        View
                      </button>
                      {!withdrawn && (
                        <button
                          onClick={() => withdraw(aid)}
                          className='px-2 py-1 rounded-lg bg-amber-50 text-amber-600 text-[9px] font-black uppercase'
                          title='Withdraw result (keeps the record, voids the score)'
                        >
                          Withdraw
                        </button>
                      )}
                      <button
                        onClick={() => del(aid)}
                        className='p-1 text-slate-300 hover:text-rose-500'
                        title='Delete attempt'
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>

                    {isOpen && (
                      <div className='px-3 pb-3 pt-1 border-t border-slate-100 bg-slate-50/60'>
                        {detailLoading && !detail ? (
                          <div className='py-3 flex justify-center'>
                            <Loader2 size={14} className='animate-spin text-[#002EFF]' />
                          </div>
                        ) : !detail ? (
                          <p className='text-[10px] font-bold text-slate-400 py-2'>
                            No per-question breakdown available for this result.
                          </p>
                        ) : (
                          <div className='space-y-2 pt-1'>
                            <p className='text-[10px] font-black text-slate-600'>
                              {detail.correct}/{detail.total} correct ·{' '}
                              {str(r.score ?? r.totalScore)}/{str(r.totalMarks ?? r.total)} marks
                            </p>
                            <div className='space-y-1'>
                              {Object.entries(detail.bySubject).map(([subj, v]) => {
                                const pct = v.total ? Math.round((v.correct / v.total) * 100) : 0
                                return (
                                  <div key={subj} className='flex items-center gap-2'>
                                    <span className='text-[10px] font-bold text-slate-500 w-24 truncate'>
                                      {subj}
                                    </span>
                                    <div className='flex-1 h-1.5 rounded-full bg-slate-200 overflow-hidden'>
                                      <div
                                        className={`h-full rounded-full ${pct >= 50 ? 'bg-emerald-500' : 'bg-rose-400'}`}
                                        style={{ width: `${pct}%` }}
                                      />
                                    </div>
                                    <span className='text-[10px] font-black text-slate-600 w-12 text-right tabular-nums'>
                                      {v.correct}/{v.total}
                                    </span>
                                  </div>
                                )
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </>
      )}
    </Card>
  )
}

/** One subject block with its time limit and picked questions from the bank. */
function SubjectBlockEditor({
  block,
  token,
  onChange,
  onRemove,
}: {
  block: SubjectBlock
  token?: string
  onChange: (patch: Partial<SubjectBlock>) => void
  onRemove: () => void
}) {
  const [bank, setBank] = useState<BankQ[]>([])
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const [batchFilter, setBatchFilter] = useState('')

  const loadBank = useCallback(
    async (subject: string) => {
      setLoading(true)
      try {
        const rows = (await dsaApi.questions.list(
          { subject },
          token,
        )) as Record<string, unknown>[]
        setBank(rows.map(normalizeQ))
      } catch {
        setBank([])
      } finally {
        setLoading(false)
      }
    },
    [token],
  )

  const pickedIds = new Set(block.picked.map((q) => q.id))
  // Distinct import batches in the loaded bank, for the filter dropdown.
  const batches = [
    ...new Set(bank.map((q) => q.batchName).filter(Boolean) as string[]),
  ]
  const shown = batchFilter
    ? bank.filter((q) => q.batchName === batchFilter)
    : bank
  const toggle = (q: BankQ) => {
    if (pickedIds.has(q.id))
      onChange({ picked: block.picked.filter((x) => x.id !== q.id) })
    else onChange({ picked: [...block.picked, q] })
  }

  return (
    <div className='rounded-2xl border border-slate-100 p-3 space-y-2'>
      <div className='flex items-center gap-2'>
        <select
          value={block.name}
          onChange={(e) => {
            onChange({ name: e.target.value, picked: [] })
            setBank([])
            setOpen(false)
          }}
          className='h-9 px-2 rounded-lg bg-slate-50 outline-none text-[12px] font-black flex-1'
        >
          {JAMB_SUBJECTS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <div className='flex items-center gap-1' title='Time limit (minutes)'>
          <Clock size={13} className='text-[#002EFF]' />
          <input
            type='number'
            min={0}
            value={block.timeLimit}
            onChange={(e) => onChange({ timeLimit: Number(e.target.value) })}
            className='w-14 h-9 px-2 rounded-lg bg-slate-50 outline-none text-[12px] font-bold text-center'
          />
          <span className='text-[9px] font-black text-slate-400'>MIN</span>
        </div>
        <button
          onClick={onRemove}
          className='p-1.5 text-slate-300 hover:text-rose-500'
          title='Remove subject'
        >
          <Trash2 size={13} />
        </button>
      </div>

      <div className='flex items-center justify-between'>
        <span className='text-[10px] font-black text-slate-500'>
          {block.picked.length} question{block.picked.length === 1 ? '' : 's'} picked
        </span>
        <button
          onClick={() => {
            const next = !open
            setOpen(next)
            if (next && bank.length === 0) loadBank(block.name)
          }}
          className='flex items-center gap-1.5 text-[10px] font-black uppercase text-[#002EFF] hover:underline'
        >
          <ListPlus size={12} /> {open ? 'Hide bank' : 'Pick from bank'}
        </button>
      </div>

      {open && (
        <div className='rounded-xl bg-slate-50 p-2 space-y-2'>
          {/* Filter by import batch */}
          {batches.length > 0 && (
            <select
              value={batchFilter}
              onChange={(e) => setBatchFilter(e.target.value)}
              title='Filter by the Excel upload (batch) the questions came from'
              className='h-8 w-full px-2 rounded-lg bg-white border border-slate-200 outline-none text-[11px] font-bold'
            >
              <option value=''>All batches ({bank.length})</option>
              {batches.map((b) => (
                <option key={b} value={b}>
                  {b} ({bank.filter((q) => q.batchName === b).length})
                </option>
              ))}
            </select>
          )}
          <div className='max-h-56 overflow-y-auto space-y-1'>
            {loading ? (
              <div className='py-4 flex justify-center'>
                <Loader2 size={16} className='animate-spin text-[#002EFF]' />
              </div>
            ) : bank.length === 0 ? (
              <p className='text-[10px] font-bold text-slate-400 py-3 text-center'>
                No questions in the bank for {block.name} yet. Tutors add them in
                the Question Bank.
              </p>
            ) : (
              shown.map((q) => (
                <label
                  key={q.id}
                  className={`flex items-start gap-2 p-2 rounded-lg cursor-pointer ${
                    pickedIds.has(q.id) ? 'bg-white shadow-sm' : 'hover:bg-white/60'
                  }`}
                >
                  <input
                    type='checkbox'
                    checked={pickedIds.has(q.id)}
                    onChange={() => toggle(q)}
                    className='mt-0.5 accent-[#002EFF]'
                  />
                  <span className='text-[11px] font-medium text-slate-700'>
                    {q.body}
                    <span className='text-emerald-600 font-black'>
                      {' '}
                      ({q.correctOption})
                    </span>
                    {q.batchName && (
                      <span className='ml-1.5 inline-block align-middle text-[8px] font-black uppercase tracking-wide text-[#002EFF] bg-blue-50 px-1.5 py-0.5 rounded'>
                        {q.batchName}
                      </span>
                    )}
                  </span>
                </label>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
