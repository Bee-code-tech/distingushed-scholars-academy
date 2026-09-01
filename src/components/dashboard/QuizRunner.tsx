'use client'

// Student quiz runner — list published quizzes, take one against a countdown
// timer (auto-submits at zero), then see the score + per-question breakdown.

import { useCallback, useEffect, useRef, useState } from 'react'
import {
  Loader2,
  Clock,
  Play,
  CheckCircle2,
  XCircle,
  Trophy,
  ArrowLeft,
  AlertTriangle,
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { dsaApi } from '@/lib/api'
import { getToken, getUser } from '@/lib/auth'
import { capFor } from '@/lib/access'
import { CapReachedCard } from '@/components/dashboard/LockedNotice'

const LETTERS = ['A', 'B', 'C', 'D', 'E'] as const
const str = (v: unknown) => (v == null ? '' : String(v))

interface RunQuestion {
  questionId: string
  subject: string
  questionText: string
  options: string[]
  imageUrl?: string
  marks: number
}
interface ResultData {
  totalScore: number
  totalMarks: number
  percentage: number
  breakdown: {
    questionId: string
    isCorrect: boolean
    marksEarned: number
    questionText?: string
  }[]
}

function mm(sec: number): string {
  const m = Math.floor(sec / 60)
  const s = sec % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

export default function QuizRunner() {
  const token = getToken() ?? undefined
  const [view, setView] = useState<'list' | 'take' | 'result'>('list')
  const [quizzes, setQuizzes] = useState<Record<string, unknown>[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Active attempt
  const [quiz, setQuiz] = useState<Record<string, unknown> | null>(null)
  const [questions, setQuestions] = useState<RunQuestion[]>([])
  const [answers, setAnswers] = useState<Record<string, number>>({})
  const [remaining, setRemaining] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState<ResultData | null>(null)
  const startedAt = useRef(0)
  const totalTime = useRef(0)
  // Anti-cheating: count times the student leaves the quiz (tab switch, minimise,
  // split-screen). Auto-submit after more than two.
  const [breaches, setBreaches] = useState(0)
  const breachRef = useRef(0)
  const MAX_BREACHES = 2

  const loadList = useCallback(async () => {
    setLoading(true)
    try {
      const rows = (await dsaApi.quizzes.list(token)) as Record<
        string,
        unknown
      >[]
      setQuizzes(rows.filter((q) => q.isActive))
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not load quizzes.')
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => {
    if (view === 'list') loadList()
  }, [view, loadList])

  // Countdown while taking.
  const submit = useCallback(
    async (auto = false) => {
      if (submitting || !quiz) return
      setSubmitting(true)
      setError(null)
      const id = str(quiz.id ?? quiz._id)
      const timeTaken = Math.max(1, Math.round((totalTime.current || 0) - remaining))
      try {
        const res = (await dsaApi.quizzes.submit(
          id,
          {
            timeTaken,
            answers: questions.map((q) => ({
              questionId: q.questionId,
              selectedOption:
                answers[q.questionId] === undefined ? -1 : answers[q.questionId],
            })),
          } as never,
          token,
        )) as { data?: ResultData } | ResultData
        const data = (res as { data?: ResultData }).data ?? (res as ResultData)
        setResult(data)
        setView('result')
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Could not submit.')
        if (auto) setView('list')
      } finally {
        setSubmitting(false)
      }
    },
    [submitting, quiz, remaining, questions, answers, token],
  )

  useEffect(() => {
    if (view !== 'take' || totalTime.current === 0) return
    const id = setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          clearInterval(id)
          submit(true)
          return 0
        }
        return r - 1
      })
    }, 1000)
    return () => clearInterval(id)
  }, [view, submit])

  // Register a "left the quiz" breach; the 3rd one auto-submits.
  const registerBreach = useCallback(() => {
    breachRef.current += 1
    setBreaches(breachRef.current)
    if (breachRef.current > MAX_BREACHES) submit(true)
  }, [submit])

  // Anti-cheating: detect tab switches, minimising and split-screen (focus loss)
  // while taking. Dedupe leave/return so one exit counts once.
  useEffect(() => {
    if (view !== 'take') return
    let away = false
    const leave = () => {
      if (away) return
      away = true
      registerBreach()
    }
    const back = () => {
      away = false
    }
    const onVis = () => (document.hidden ? leave() : back())
    window.addEventListener('blur', leave)
    window.addEventListener('focus', back)
    document.addEventListener('visibilitychange', onVis)
    return () => {
      window.removeEventListener('blur', leave)
      window.removeEventListener('focus', back)
      document.removeEventListener('visibilitychange', onVis)
    }
  }, [view, registerBreach])

  const start = async (q: Record<string, unknown>) => {
    setError(null)
    setLoading(true)
    try {
      const full = (await dsaApi.quizzes.get(str(q.id ?? q._id), token)) as Record<
        string,
        unknown
      >
      const subjects = Array.isArray(full.subjects) ? full.subjects : []
      const flat: RunQuestion[] = []
      let minutes = 0
      subjects.forEach((s: Record<string, unknown>) => {
        minutes += Number(s.timeLimit) || 0
        const qs = Array.isArray(s.questions) ? s.questions : []
        qs.forEach((qq: Record<string, unknown>) => {
          const labeled = (qq.optionsLabeled ?? {}) as Record<string, string>
          flat.push({
            questionId: str(qq.id ?? qq._id),
            subject: str(s.name),
            questionText: str(qq.questionText ?? qq.body),
            options: Array.isArray(qq.options)
              ? (qq.options as string[])
              : LETTERS.map((l) => labeled[l]).filter(Boolean),
            imageUrl: qq.imageUrl ? str(qq.imageUrl) : undefined,
            marks: Number(qq.marks ?? qq.mark) || 1,
          })
        })
      })
      if (flat.length === 0) {
        setError('This quiz has no questions yet.')
        return
      }
      setQuiz(full)
      setQuestions(flat)
      setAnswers({})
      setResult(null)
      breachRef.current = 0
      setBreaches(0)
      const secs = (minutes || Number(full.timeLimit) || 0) * 60
      totalTime.current = secs
      setRemaining(secs)
      startedAt.current = 0
      setView('take')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not open the quiz.')
    } finally {
      setLoading(false)
    }
  }

  // ---------- RESULT ----------
  if (view === 'result' && result) {
    // Compute from marks so it's correct regardless of how the API scales
    // `percentage` (it returns a 0–1 ratio, not 0–100).
    const pct =
      result.totalMarks > 0
        ? Math.round((result.totalScore / result.totalMarks) * 100)
        : 0
    return (
      <div className='max-w-2xl mx-auto space-y-5'>
        <Card className='p-8 rounded-4xl border-none shadow-sm bg-[#002EFF] text-white text-center'>
          <Trophy size={40} className='mx-auto text-[#FCB900] mb-2' />
          <p className='text-[11px] font-black uppercase tracking-widest text-blue-200'>
            Your Score
          </p>
          <p className='text-5xl font-black mt-1'>{pct}%</p>
          <p className='text-sm font-bold text-blue-100 mt-1'>
            {result.totalScore} / {result.totalMarks} marks
          </p>
        </Card>
        <div className='space-y-2'>
          {result.breakdown?.map((b, i) => (
            <Card
              key={b.questionId || i}
              className='p-3 rounded-2xl border-none shadow-sm bg-white flex items-start gap-2'
            >
              {b.isCorrect ? (
                <CheckCircle2 size={16} className='text-emerald-500 mt-0.5 shrink-0' />
              ) : (
                <XCircle size={16} className='text-rose-500 mt-0.5 shrink-0' />
              )}
              <p className='text-[12px] font-medium text-slate-700'>
                {b.questionText || `Question ${i + 1}`}
              </p>
            </Card>
          ))}
        </div>
        <button
          onClick={() => setView('list')}
          className='flex items-center gap-2 text-[11px] font-black uppercase text-[#002EFF]'
        >
          <ArrowLeft size={14} /> Back to quizzes
        </button>
      </div>
    )
  }

  // ---------- TAKING ----------
  if (view === 'take') {
    const answered = Object.keys(answers).length
    return (
      <div className='max-w-2xl mx-auto space-y-4'>
        <div className='sticky top-0 z-10 flex items-center justify-between bg-white/90 backdrop-blur rounded-2xl px-4 py-3 shadow-sm'>
          <div>
            <p className='text-sm font-black text-slate-800 truncate'>
              {str(quiz?.title)}
            </p>
            <p className='text-[10px] font-bold text-slate-400'>
              {answered}/{questions.length} answered
            </p>
          </div>
          {totalTime.current > 0 && (
            <span
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-black tabular-nums text-sm ${
                remaining < 60
                  ? 'bg-rose-50 text-rose-600'
                  : 'bg-blue-50 text-[#002EFF]'
              }`}
            >
              <Clock size={15} /> {mm(remaining)}
            </span>
          )}
        </div>

        {/* Anti-cheating notice */}
        <div
          className={`flex items-center gap-2 rounded-2xl px-4 py-2.5 ${
            breaches > 0
              ? 'bg-rose-50 border border-rose-200'
              : 'bg-amber-50 border border-amber-100'
          }`}
        >
          <AlertTriangle
            size={15}
            className={breaches > 0 ? 'text-rose-500 shrink-0' : 'text-amber-600 shrink-0'}
          />
          <p
            className={`text-[11px] font-bold ${breaches > 0 ? 'text-rose-600' : 'text-amber-700'}`}
          >
            {breaches > 0
              ? `Warning ${breaches}/${MAX_BREACHES} — leaving the quiz again will auto-submit it.`
              : 'Stay on this screen — no tab-switching, minimising or split-screen. The quiz auto-submits after 2 warnings.'}
          </p>
        </div>

        {error && <p className='text-[11px] font-bold text-rose-600 px-1'>{error}</p>}

        {questions.map((q, i) => (
          <Card key={q.questionId} className='p-4 rounded-2xl border-none shadow-sm bg-white'>
            <div className='flex items-start gap-2 mb-3'>
              <span className='text-[11px] font-black text-[#002EFF]'>{i + 1}.</span>
              <div className='flex-1'>
                <p className='text-[13px] font-bold text-slate-800 whitespace-pre-wrap'>
                  {q.questionText}
                </p>
                {q.imageUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={q.imageUrl}
                    alt='question'
                    className='mt-2 rounded-xl max-h-52'
                  />
                )}
              </div>
            </div>
            <div className='space-y-1.5'>
              {q.options.map((o, oi) => (
                <button
                  key={oi}
                  onClick={() =>
                    setAnswers((a) => ({ ...a, [q.questionId]: oi }))
                  }
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left text-[13px] font-medium transition-colors ${
                    answers[q.questionId] === oi
                      ? 'bg-[#002EFF] text-white'
                      : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <span className='font-black'>{LETTERS[oi]}</span>
                  {o}
                </button>
              ))}
            </div>
          </Card>
        ))}

        <button
          onClick={() => submit(false)}
          disabled={submitting}
          className='w-full flex items-center justify-center gap-2 h-12 bg-[#002EFF] text-white rounded-2xl font-black text-[11px] uppercase tracking-wide hover:bg-blue-700 disabled:opacity-50'
        >
          {submitting ? (
            <Loader2 size={16} className='animate-spin' />
          ) : (
            <CheckCircle2 size={16} />
          )}
          Submit quiz
        </button>
      </div>
    )
  }

  // ---------- LIST ----------
  return (
    <div className='max-w-2xl mx-auto space-y-4'>
      <div>
        <h2 className='text-2xl font-black text-[#002EFF] italic uppercase'>
          Quizzes
        </h2>
        <p className='text-[10px] font-bold text-gray-400 uppercase tracking-widest'>
          Take a CBT and see your score instantly
        </p>
      </div>
      {error && <p className='text-[11px] font-bold text-rose-600 px-1'>{error}</p>}
      {loading ? (
        <div className='py-10 flex justify-center'>
          <Loader2 className='animate-spin text-[#002EFF]' />
        </div>
      ) : quizzes.length === 0 ? (
        <p className='text-[11px] font-bold text-slate-400 py-8 text-center'>
          No quizzes available right now. Check back soon.
        </p>
      ) : (
        <>
          {quizzes.slice(0, capFor('tests', getUser())).map((q) => {
          const subjects = Array.isArray(q.subjects) ? q.subjects : []
          const qCount = subjects.reduce(
            (n: number, s: Record<string, unknown>) =>
              n + (Array.isArray(s.questions) ? s.questions.length : 0),
            0,
          )
          const mins = subjects.reduce(
            (n: number, s: Record<string, unknown>) => n + (Number(s.timeLimit) || 0),
            0,
          )
          return (
            <Card
              key={str(q.id ?? q._id)}
              className='p-4 rounded-2xl border-none shadow-sm bg-white flex items-center gap-3'
            >
              <div className='min-w-0 flex-1'>
                <p className='text-sm font-black text-slate-800 truncate'>
                  {str(q.title)}
                </p>
                <p className='text-[10px] font-bold text-slate-400'>
                  {qCount} question{qCount === 1 ? '' : 's'}
                  {mins > 0 && ` · ${mins} min`}
                  {' · '}
                  {str(q.totalMarks) || 0} marks
                </p>
              </div>
              <button
                onClick={() => start(q)}
                className='flex items-center gap-1.5 h-10 px-4 bg-[#002EFF] text-white rounded-xl font-black text-[11px] uppercase tracking-wide hover:bg-blue-700'
              >
                <Play size={14} /> Start
              </button>
            </Card>
          )
          })}
          {quizzes.length > capFor('tests', getUser()) && (
            <CapReachedCard what='free tests' cap={capFor('tests', getUser())} />
          )}
        </>
      )}
    </div>
  )
}
