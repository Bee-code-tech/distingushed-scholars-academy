'use client'

// Public (free) quiz taker — no login. Anyone with the link enters their name
// and age, takes the quiz, sees their result, then is invited to the homepage.
// Backed by the no-auth endpoints in docs/backend-requests-2026-09-02.md §2.

import { useCallback, useEffect, useRef, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
  GraduationCap,
  Loader2,
  Clock,
  ArrowRight,
  Trophy,
  Sparkles,
  AlertCircle,
} from 'lucide-react'
import { dsaApi } from '@/lib/api'
import RichText from '@/components/ui/RichText'
import type { PublicQuizResult } from '@/lib/types'

const LETTERS = ['A', 'B', 'C', 'D', 'E'] as const

type RunQuestion = {
  questionId: string
  subject: string
  questionText: string
  options: string[]
  marks: number
}

const str = (v: unknown) => (v == null ? '' : String(v))

function mapQuiz(full: Record<string, unknown>): {
  title: string
  minutes: number
  questions: RunQuestion[]
} {
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
        marks: Number(qq.marks ?? qq.mark) || 1,
      })
    })
  })
  return { title: str(full.title ?? 'Quiz'), minutes, questions: flat }
}

function fmt(sec: number): string {
  const m = Math.floor(sec / 60)
  const s = sec % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

export default function PublicQuizPage() {
  const params = useParams()
  const router = useRouter()
  const link = String(params?.link ?? '')

  const [step, setStep] = useState<
    'loading' | 'details' | 'quiz' | 'result' | 'unavailable'
  >('loading')
  const [errorMsg, setErrorMsg] = useState('')
  const [title, setTitle] = useState('Quiz')
  const [questions, setQuestions] = useState<RunQuestion[]>([])
  const [minutes, setMinutes] = useState(0)

  const [name, setName] = useState('')
  const [age, setAge] = useState('')
  const [answers, setAnswers] = useState<Record<string, number>>({})
  const [remaining, setRemaining] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState<PublicQuizResult | null>(null)
  const totalTime = useRef(0)

  // Load the quiz for this link.
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const full = (await dsaApi.quizzes.getPublic(link)) as unknown as Record<
          string,
          unknown
        >
        if (cancelled) return
        const mapped = mapQuiz(full)
        if (mapped.questions.length === 0) {
          setErrorMsg('This quiz has no questions yet.')
          setStep('unavailable')
          return
        }
        setTitle(mapped.title)
        setQuestions(mapped.questions)
        setMinutes(mapped.minutes)
        setStep('details')
      } catch (e) {
        if (cancelled) return
        const msg = e instanceof Error ? e.message : ''
        // 404 → the link is wrong OR the public endpoint isn't live yet.
        setErrorMsg(
          /not found|404/i.test(msg)
            ? 'This quiz link is not available.'
            : 'This quiz could not be loaded right now.',
        )
        setStep('unavailable')
      }
    })()
    return () => {
      cancelled = true
    }
  }, [link])

  const submit = useCallback(
    async (auto = false) => {
      if (submitting) return
      setSubmitting(true)
      const timeTaken = Math.max(
        1,
        Math.round((totalTime.current || 0) - remaining),
      )
      try {
        const res = (await dsaApi.quizzes.submitPublic(link, {
          name: name.trim(),
          age: Number(age) || 0,
          answers: questions.map((q) => ({
            questionId: q.questionId,
            selectedOption:
              answers[q.questionId] === undefined ? -1 : answers[q.questionId],
          })),
          timeTaken,
        })) as PublicQuizResult
        setResult(res)
        setStep('result')
      } catch (e) {
        setErrorMsg(
          e instanceof Error ? e.message : 'Could not submit your answers.',
        )
        if (!auto) setSubmitting(false)
        return
      }
      setSubmitting(false)
    },
    [answers, age, link, name, questions, remaining, submitting],
  )

  // Countdown while taking the quiz.
  useEffect(() => {
    if (step !== 'quiz' || minutes <= 0) return
    const id = setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          clearInterval(id)
          void submit(true)
          return 0
        }
        return r - 1
      })
    }, 1000)
    return () => clearInterval(id)
  }, [step, minutes, submit])

  const start = () => {
    if (name.trim().length < 2) {
      setErrorMsg('Please enter your name.')
      return
    }
    const a = Number(age)
    if (!a || a < 3 || a > 120) {
      setErrorMsg('Please enter a valid age.')
      return
    }
    setErrorMsg('')
    const secs = minutes * 60
    totalTime.current = secs
    setRemaining(secs)
    setAnswers({})
    setStep('quiz')
  }

  const answered = Object.keys(answers).length
  const pct = result
    ? result.percentage != null
      ? result.percentage <= 1
        ? Math.round(result.percentage * 100)
        : Math.round(result.percentage)
      : result.totalMarks > 0
        ? Math.round((result.totalScore / result.totalMarks) * 100)
        : 0
    : 0

  return (
    <div className='min-h-screen bg-[#F8FAFF] flex flex-col'>
      {/* Header */}
      <header className='flex items-center gap-3 px-5 py-4'>
        <div className='bg-[#FCB900] p-1.5 rounded-lg'>
          <GraduationCap className='text-[#002EFF]' size={20} />
        </div>
        <span className='text-[#002EFF] font-black text-sm tracking-tighter uppercase'>
          DSA · Quiz
        </span>
        {step === 'quiz' && minutes > 0 && (
          <span className='ml-auto flex items-center gap-1.5 text-[12px] font-black text-[#002EFF] tabular-nums'>
            <Clock size={15} /> {fmt(remaining)}
          </span>
        )}
      </header>

      <main className='flex-1 w-full max-w-2xl mx-auto px-4 pb-10'>
        {step === 'loading' && (
          <div className='py-24 flex justify-center'>
            <Loader2 className='animate-spin text-[#002EFF]' size={28} />
          </div>
        )}

        {step === 'unavailable' && (
          <div className='mt-16 bg-white rounded-3xl shadow-sm p-8 text-center'>
            <div className='h-14 w-14 mx-auto rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center mb-3'>
              <AlertCircle size={26} />
            </div>
            <p className='text-sm font-black text-slate-800 uppercase'>
              Quiz unavailable
            </p>
            <p className='text-[12px] font-bold text-slate-400 mt-1 max-w-sm mx-auto'>
              {errorMsg}
            </p>
            <button
              onClick={() => router.push('/')}
              className='mt-5 inline-flex items-center gap-2 h-11 px-6 bg-[#002EFF] text-white rounded-xl font-black text-[11px] uppercase tracking-wide'
            >
              Go to DSA <ArrowRight size={14} />
            </button>
          </div>
        )}

        {step === 'details' && (
          <div className='mt-10 bg-white rounded-3xl shadow-sm p-6 sm:p-8'>
            <p className='text-[10px] font-black uppercase tracking-widest text-[#FCB900]'>
              Free quiz
            </p>
            <h1 className='text-2xl font-black text-slate-900 tracking-tight mt-1'>
              {title}
            </h1>
            <p className='text-[12px] font-bold text-slate-400 mt-1'>
              {questions.length} question{questions.length === 1 ? '' : 's'}
              {minutes > 0 ? ` · ${minutes} min` : ''}
            </p>

            <div className='mt-6 space-y-3'>
              <div>
                <label className='text-[9px] font-black uppercase text-slate-400'>
                  Your name
                </label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder='e.g. Amina Bello'
                  className='mt-1 w-full h-11 px-3 rounded-xl bg-slate-50 border border-transparent focus:border-[#002EFF]/30 focus:bg-white outline-none text-sm font-bold'
                />
              </div>
              <div>
                <label className='text-[9px] font-black uppercase text-slate-400'>
                  Age
                </label>
                <input
                  type='number'
                  min={3}
                  max={120}
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  placeholder='e.g. 16'
                  className='mt-1 w-full h-11 px-3 rounded-xl bg-slate-50 border border-transparent focus:border-[#002EFF]/30 focus:bg-white outline-none text-sm font-bold'
                />
              </div>
              {errorMsg && (
                <p className='text-[11px] font-bold text-rose-600'>{errorMsg}</p>
              )}
              <button
                onClick={start}
                className='w-full flex items-center justify-center gap-2 h-12 bg-[#002EFF] text-white rounded-xl font-black text-[12px] uppercase tracking-wide hover:bg-blue-700 active:scale-[0.98] transition-all'
              >
                Start quiz <ArrowRight size={15} />
              </button>
            </div>
          </div>
        )}

        {step === 'quiz' && (
          <div className='mt-4 space-y-3'>
            <p className='text-[11px] font-black uppercase tracking-widest text-slate-400'>
              {answered}/{questions.length} answered
            </p>
            {questions.map((q, i) => (
              <div
                key={q.questionId || i}
                className='bg-white rounded-2xl shadow-sm p-4'
              >
                <div className='flex items-start gap-2 mb-3'>
                  <span className='text-[11px] font-black text-[#002EFF]'>
                    {i + 1}.
                  </span>
                  <RichText className='text-[13px] font-bold text-slate-800 flex-1'>
                    {q.questionText}
                  </RichText>
                </div>
                <div className='space-y-1.5'>
                  {q.options.map((o, oi) => (
                    <button
                      key={oi}
                      onClick={() =>
                        setAnswers((a) => ({ ...a, [q.questionId]: oi }))
                      }
                      className={`w-full text-left px-3 py-2.5 rounded-xl text-[12px] font-bold border transition-all ${
                        answers[q.questionId] === oi
                          ? 'bg-[#002EFF] text-white border-[#002EFF]'
                          : 'bg-slate-50 text-slate-600 border-transparent hover:border-[#002EFF]/30'
                      }`}
                    >
                      <span className='font-black mr-1.5'>{LETTERS[oi]}.</span>
                      <RichText className='inline'>{o}</RichText>
                    </button>
                  ))}
                </div>
              </div>
            ))}
            {errorMsg && (
              <p className='text-[11px] font-bold text-rose-600'>{errorMsg}</p>
            )}
            <button
              onClick={() => submit(false)}
              disabled={submitting}
              className='w-full flex items-center justify-center gap-2 h-12 bg-[#002EFF] text-white rounded-xl font-black text-[12px] uppercase tracking-wide hover:bg-blue-700 active:scale-[0.98] transition-all disabled:opacity-60'
            >
              {submitting ? (
                <Loader2 size={16} className='animate-spin' />
              ) : (
                <>Submit answers</>
              )}
            </button>
          </div>
        )}

        {step === 'result' && result && (
          <div className='mt-10 bg-white rounded-3xl shadow-sm p-8 text-center'>
            <div
              className={`h-20 w-20 mx-auto rounded-3xl flex items-center justify-center font-black text-2xl ${
                pct >= 50
                  ? 'bg-emerald-50 text-emerald-600'
                  : 'bg-rose-50 text-rose-500'
              }`}
            >
              {pct}%
            </div>
            <p className='text-sm font-black text-slate-800 uppercase mt-4 flex items-center justify-center gap-1.5'>
              <Trophy size={16} className='text-[#FCB900]' />
              {name.split(' ')[0]}, you scored {result.totalScore}/
              {result.totalMarks}
            </p>
            <p className='text-[12px] font-bold text-slate-400 mt-1'>
              Well done for completing “{title}”.
            </p>

            <div className='mt-6 rounded-2xl bg-[#002EFF] p-5 text-white'>
              <Sparkles size={22} className='mx-auto text-[#FCB900] mb-2' />
              <p className='text-[13px] font-black'>Want more?</p>
              <p className='text-[11px] font-bold text-blue-100 mt-1'>
                Join Distinguished Scholars Academy for full courses, tutors,
                tracked progress and real exam prep.
              </p>
              <button
                onClick={() => router.push('/')}
                className='mt-4 inline-flex items-center gap-2 h-11 px-6 bg-[#FCB900] text-[#002EFF] rounded-xl font-black text-[11px] uppercase tracking-wide active:scale-95 transition-all'
              >
                Explore DSA <ArrowRight size={14} />
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
