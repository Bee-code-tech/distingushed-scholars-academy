'use client'

// Public "Free Quizzes" browse page — anyone (no account) can pick a free quiz
// and take it. Lists GET /public/quizzes; each card links to /q/:link (the
// existing anonymous take page).

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowRight, ArrowLeft, HelpCircle, Clock, ListChecks, Loader2 } from 'lucide-react'
import { dsaApi } from '@/lib/api'

const str = (v: unknown) => (v == null ? '' : String(v))
const num = (v: unknown) => (typeof v === 'number' ? v : Number(v) || 0)

type FreeQuiz = {
  title: string
  description?: string
  link: string
  timeLimit?: number | null
  questionCount?: number
  subject?: string | null
}

export default function FreeQuizzesPage() {
  const [quizzes, setQuizzes] = useState<FreeQuiz[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const rows = (await dsaApi.quizzes.listPublic()) as Record<string, unknown>[]
        if (cancelled) return
        setQuizzes(
          rows.map((q) => ({
            title: str(q.title) || 'Quiz',
            description: q.description ? str(q.description) : undefined,
            link: str(q.link ?? q.publicLink),
            timeLimit: q.timeLimit != null ? num(q.timeLimit) : null,
            questionCount: num(q.questionCount),
            subject: q.subject ? str(q.subject) : null,
          })).filter((q) => q.link),
        )
      } catch {
        if (!cancelled) setError('Could not load quizzes right now. Please try again.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <main className='min-h-screen bg-[#F8FAFF]'>
      <div className='max-w-5xl mx-auto px-4 py-10 sm:py-14'>
        <Link
          href='/'
          className='inline-flex items-center gap-1.5 text-[#002EFF] font-bold text-sm mb-6 hover:gap-2.5 transition-all'
        >
          <ArrowLeft size={16} /> Back to home
        </Link>

        <div className='mb-8'>
          <h1 className='text-3xl sm:text-4xl font-black text-slate-900 tracking-tight flex items-center gap-2'>
            <HelpCircle className='text-[#002EFF]' size={30} /> Free Quizzes
          </h1>
          <p className='text-slate-500 font-medium mt-2 max-w-xl'>
            Pick a quiz and start right away — no account needed. Enter your name
            and get your score at the end.
          </p>
        </div>

        {loading ? (
          <div className='py-20 flex justify-center'>
            <Loader2 className='animate-spin text-[#002EFF]' size={28} />
          </div>
        ) : error ? (
          <p className='text-rose-600 font-bold text-sm'>{error}</p>
        ) : quizzes.length === 0 ? (
          <div className='bg-white rounded-2xl shadow-sm border border-slate-100 p-10 text-center'>
            <HelpCircle className='mx-auto text-slate-300 mb-3' size={32} />
            <p className='font-black text-slate-700'>No free quizzes yet</p>
            <p className='text-slate-400 text-sm font-medium mt-1'>
              Check back soon — new practice quizzes are added regularly.
            </p>
          </div>
        ) : (
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
            {quizzes.map((q) => (
              <Link
                key={q.link}
                href={`/q/${q.link}`}
                className='group bg-white rounded-2xl shadow-sm border border-slate-100 p-5 flex flex-col hover:shadow-xl hover:border-[#002EFF]/20 transition-all'
              >
                {q.subject && (
                  <span className='self-start text-[9px] font-black uppercase tracking-wide bg-blue-50 text-[#002EFF] px-2 py-1 rounded-md mb-3'>
                    {q.subject}
                  </span>
                )}
                <h2 className='text-lg font-black text-slate-900 group-hover:text-[#002EFF] transition-colors leading-tight'>
                  {q.title}
                </h2>
                {q.description && (
                  <p className='text-slate-500 text-sm mt-2 line-clamp-2 flex-1'>
                    {q.description}
                  </p>
                )}
                <div className='flex items-center gap-3 mt-4 text-[11px] font-bold text-slate-400'>
                  <span className='inline-flex items-center gap-1'>
                    <ListChecks size={13} /> {q.questionCount || 0} question
                    {q.questionCount === 1 ? '' : 's'}
                  </span>
                  {q.timeLimit ? (
                    <span className='inline-flex items-center gap-1'>
                      <Clock size={13} /> {q.timeLimit} min
                    </span>
                  ) : null}
                </div>
                <span className='mt-4 inline-flex items-center gap-1 text-[#002EFF] font-black text-sm group-hover:gap-2 transition-all'>
                  Take quiz <ArrowRight size={16} />
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
