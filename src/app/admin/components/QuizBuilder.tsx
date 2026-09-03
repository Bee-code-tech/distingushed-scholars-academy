'use client'

// Admin quiz builder — assemble a quiz from the tutor question bank. A quiz has
// one or more subject blocks, each with its own time limit and its chosen
// questions. See docs/quiz-feature.md.

import { useCallback, useEffect, useState } from 'react'
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
  // When set, the builder is editing an existing quiz's details (not creating).
  const [editingId, setEditingId] = useState<string | null>(null)

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  // Audience: which programme (+ department) the quiz targets. 'all' = everyone.
  const [track, setTrack] = useState<ExamTrack | 'all'>('all')
  const [department, setDepartment] = useState<Department>('science')
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
    setPublishing(true)
    setPublicLink(null)
    setCopied(false)
    // Free quizzes are always open to everyone — force the audience to 'all'.
    const isFree = accessMode === 'free'
    const effectiveTrack = isFree ? 'all' : track
    const dept =
      !isFree && effectiveTrack !== 'all' && isDeptSplitTrack(effectiveTrack)
        ? department
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
        )) as { link?: string } | undefined
        if (isFree) {
          // Show the shareable public link (backend returns a `link` slug).
          const slug = created?.link
          setPublicLink(
            slug ? `${window.location.origin}/q/${slug}` : 'link-pending',
          )
        }
      }
      const wasEditing = !!editingId
      setTitle('')
      setDescription('')
      setTrack('all')
      setDepartment('science')
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
    if (q.department) setDepartment(q.department as Department)
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
                : 'Your published quizzes'}
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
          <div className='rounded-2xl bg-slate-50/70 p-3 space-y-2'>
            <p className='text-[9px] font-black uppercase text-slate-400'>
              Who sees this quiz
            </p>
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
                  onChange={(e) => setDepartment(e.target.value as Department)}
                  className='h-9 px-2 rounded-lg bg-white border border-slate-200 outline-none text-[12px] font-black'
                >
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
      {!showBuilder && (
      <div className='space-y-2'>
        <p className='text-[11px] font-black uppercase tracking-widest text-slate-500'>
          Published quizzes
        </p>
        {loadingList ? (
          <div className='py-8 flex justify-center'>
            <Loader2 className='animate-spin text-[#002EFF]' />
          </div>
        ) : quizzes.length === 0 ? (
          <p className='text-[11px] font-bold text-slate-400 py-4'>
            No quizzes yet.
          </p>
        ) : (
          quizzes.map((q) => {
            const id = str(q.id ?? q._id)
            const code = str(q.accessCode)
            const subjects = Array.isArray(q.subjects) ? q.subjects.length : 0
            return (
              <div key={id} className='space-y-2'>
              <Card
                className='p-3 rounded-2xl border-none shadow-sm bg-white flex items-center gap-3'
              >
                <div className='min-w-0 flex-1'>
                  <p className='text-xs font-black text-gray-800 truncate'>
                    {str(q.title)}
                  </p>
                  <p className='text-[10px] font-bold text-slate-400'>
                    <span className='text-[#002EFF]'>
                      {audienceLabel(
                        (q.track as string) ?? null,
                        (q.department as string) ?? null,
                      )}
                    </span>{' '}
                    · {subjects} subject{subjects === 1 ? '' : 's'} ·{' '}
                    {str(q.totalMarks) || 0} marks
                    {code && (
                      <button
                        onClick={() => navigator.clipboard?.writeText(code)}
                        className='ml-2 inline-flex items-center gap-1 text-[#002EFF] hover:underline'
                        title='Copy access code'
                      >
                        <Copy size={9} /> {code}
                      </button>
                    )}
                  </p>
                </div>
                <button
                  onClick={() => startEdit(q)}
                  className='flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase bg-slate-100 text-slate-500 hover:text-[#002EFF]'
                  title='Edit quiz details'
                >
                  <Pencil size={11} /> Edit
                </button>
                <button
                  onClick={() =>
                    setOpenAttempts((cur) => (cur === id ? null : id))
                  }
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase ${
                    openAttempts === id
                      ? 'bg-[#002EFF] text-white'
                      : 'bg-blue-50 text-[#002EFF]'
                  }`}
                  title='View attempts, leaderboard & manage results'
                >
                  <Users size={11} /> Attempts
                </button>
                <button
                  onClick={() => toggleStatus(q)}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase ${
                    q.isActive
                      ? 'bg-emerald-50 text-emerald-600'
                      : 'bg-slate-100 text-slate-400'
                  }`}
                  title={q.isActive ? 'Published — click to unpublish' : 'Draft — click to publish'}
                >
                  <Power size={11} /> {q.isActive ? 'Live' : 'Draft'}
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
              </Card>
              {openAttempts === id && (
                <AttemptsPanel quizId={id} token={token} />
              )}
              </div>
            )
          })
        )}
      </div>
      )}
    </div>
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
                return (
                  <div
                    key={aid}
                    className={`flex items-center gap-2 rounded-xl bg-white px-3 py-2 ${withdrawn ? 'opacity-50' : ''}`}
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
        <div className='max-h-56 overflow-y-auto rounded-xl bg-slate-50 p-2 space-y-1'>
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
            bank.map((q) => (
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
                </span>
              </label>
            ))
          )}
        </div>
      )}
    </div>
  )
}
