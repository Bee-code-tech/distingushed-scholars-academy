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
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { dsaApi } from '@/lib/api'
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
  const [quizzes, setQuizzes] = useState<Record<string, unknown>[]>([])
  const [loadingList, setLoadingList] = useState(true)

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  // Audience: which programme (+ department) the quiz targets. 'all' = everyone.
  const [track, setTrack] = useState<ExamTrack | 'all'>('all')
  const [department, setDepartment] = useState<Department>('science')
  // Access mode: 'portal' (enrolled students, audience-filtered) or 'free'
  // (public link, anyone with name + age). Free quizzes are always 'all'.
  const [accessMode, setAccessMode] = useState<'portal' | 'free'>('portal')
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
    if (totalQuestions === 0) return setError('Add at least one question.')
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
    try {
      const created = (await dsaApi.quizzes.create(
        {
          title: title.trim(),
          description: description.trim() || title.trim(),
          type: 'general',
          accessMode,
          // Audience targeting — students only see quizzes for their programme.
          track: effectiveTrack === 'all' ? 'all' : effectiveTrack,
          department: dept,
          audience: audienceLabel(
            effectiveTrack === 'all' ? null : effectiveTrack,
            dept,
          ),
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
        // Show the shareable public link (the backend returns a `link` slug).
        const slug = created?.link
        setPublicLink(
          slug
            ? `${window.location.origin}/q/${slug}`
            : 'link-pending', // backend hasn't shipped the slug yet
        )
      }
      setTitle('')
      setDescription('')
      setTrack('all')
      setDepartment('science')
      setAccessMode('portal')
      setBlocks([])
      flash(isFree ? 'Free quiz published' : 'Quiz published')
      loadList()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not publish the quiz.')
    } finally {
      setPublishing(false)
    }
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
      <div>
        <h1 className='text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2'>
          <HelpCircle size={20} className='text-[#002EFF]' /> Quizzes
        </h1>
        <p className='text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-1'>
          Build a quiz from the tutor question bank
        </p>
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

      {/* Builder */}
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

        <div className='flex items-center justify-between pt-1'>
          <span className='text-[11px] font-black text-slate-400 flex items-center gap-1'>
            {totalQuestions} question{totalQuestions === 1 ? '' : 's'} ·{' '}
            {blocks.length} subject{blocks.length === 1 ? '' : 's'}
            {totalMinutes > 0 && (
              <>
                {' '}
                · <Clock size={11} /> {totalMinutes} min total
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
            Publish quiz
          </button>
        </div>
      </Card>

      {/* Existing quizzes */}
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
              <Card
                key={id}
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
                <button
                  onClick={() => removeQuiz(id)}
                  className='p-1.5 text-slate-300 hover:text-rose-500'
                  title='Delete quiz'
                >
                  <Trash2 size={14} />
                </button>
              </Card>
            )
          })
        )}
      </div>
    </div>
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
