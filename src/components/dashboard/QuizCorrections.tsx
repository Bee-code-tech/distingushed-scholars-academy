'use client'

// Renders a student's quiz corrections: the per-subject score breakdown, then
// every question with its options — the correct option marked green and the
// student's wrong pick marked red. Fed by GET /quizzes/:id/corrections/me (and
// reused for the submit-time review since the shape matches).

import { Card } from '@/components/ui/card'
import {
  ArrowLeft,
  Check,
  X,
  CheckCircle2,
  XCircle,
  HelpCircle,
} from 'lucide-react'

const str = (v: unknown) => (v == null ? '' : String(v))
const n = (v: unknown) => (typeof v === 'number' ? v : Number(v) || 0)

export type CorrectionQuestion = {
  questionId?: string
  subject?: string
  questionText?: string
  imageUrl?: string | null
  options: string[]
  correctIndex: number | null
  selectedIndex: number | null
  isCorrect: boolean
  marks?: number
  marksEarned?: number
  explanation?: string
}

export type CorrectionsData = {
  quizTitle?: string
  totalScore: number
  totalMarks: number
  percentage: number
  perSubject: {
    subject: string
    earned: number
    total: number
    correct: number
    count: number
    percentage: number
  }[]
  questions: CorrectionQuestion[]
}

const OPT_LETTER = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']

export default function QuizCorrections({
  data,
  onBack,
}: {
  data: CorrectionsData
  onBack?: () => void
}) {
  const pct = Math.round(
    data.percentage <= 1 && data.percentage > 0
      ? data.percentage * 100
      : data.percentage,
  )
  const good = pct >= 70

  return (
    <div className='max-w-2xl mx-auto space-y-4 pb-10'>
      {/* Header */}
      <div className='flex items-center gap-3'>
        {onBack && (
          <button
            onClick={onBack}
            className='h-9 w-9 flex items-center justify-center rounded-xl bg-blue-50 text-[#002EFF] hover:bg-blue-100 shrink-0'
            title='Back'
          >
            <ArrowLeft size={16} />
          </button>
        )}
        <div className='min-w-0'>
          <h2 className='text-2xl font-black text-[#002EFF] italic uppercase truncate'>
            Corrections
          </h2>
          <p className='text-[10px] font-bold text-gray-400 uppercase tracking-widest truncate'>
            {str(data.quizTitle) || 'Your answers reviewed'}
          </p>
        </div>
      </div>

      {/* Score */}
      <Card className='p-5 rounded-3xl border-none shadow-sm bg-white flex items-center justify-between'>
        <div>
          <p className='text-[10px] font-black uppercase tracking-widest text-slate-400'>
            Your score
          </p>
          <p className='text-2xl font-black text-slate-900'>
            {n(data.totalScore)}
            <span className='text-slate-400 text-base'>/{n(data.totalMarks)}</span>
          </p>
        </div>
        <span
          className={`text-lg font-black px-4 py-2 rounded-2xl ${
            good ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-500'
          }`}
        >
          {pct}%
        </span>
      </Card>

      {/* Per-subject breakdown */}
      {data.perSubject.length > 0 && (
        <Card className='p-5 rounded-3xl border-none shadow-sm bg-white space-y-3'>
          <p className='text-[10px] font-black uppercase tracking-widest text-slate-400'>
            Performance by subject
          </p>
          {data.perSubject.map((s) => {
            const sp = Math.round(s.percentage)
            return (
              <div key={s.subject} className='space-y-1'>
                <div className='flex items-center justify-between text-[11px] font-bold'>
                  <span className='text-slate-700'>{s.subject}</span>
                  <span className='text-slate-400'>
                    {s.correct}/{s.count} · {sp}%
                  </span>
                </div>
                <div className='h-2 bg-slate-100 rounded-full overflow-hidden'>
                  <div
                    className={`h-full rounded-full ${sp >= 70 ? 'bg-emerald-500' : sp >= 40 ? 'bg-[#FCB900]' : 'bg-rose-500'}`}
                    style={{ width: `${sp}%` }}
                  />
                </div>
              </div>
            )
          })}
        </Card>
      )}

      {/* Question map — jump to any question; colour shows correctness */}
      {data.questions.length > 0 && (
        <Card className='p-4 rounded-3xl border-none shadow-sm bg-white'>
          <p className='text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3'>
            Question map
          </p>
          <div className='flex flex-wrap gap-1.5'>
            {data.questions.map((q, i) => {
              const cls =
                q.selectedIndex == null
                  ? 'bg-amber-100 text-amber-700'
                  : q.isCorrect
                    ? 'bg-emerald-500 text-white'
                    : 'bg-rose-500 text-white'
              return (
                <a
                  key={i}
                  href={`#q-${i}`}
                  title={
                    q.isCorrect
                      ? 'Correct'
                      : q.selectedIndex == null
                        ? 'Not answered'
                        : 'Wrong'
                  }
                  className={`h-8 w-8 rounded-lg text-[11px] font-black flex items-center justify-center ${cls}`}
                >
                  {i + 1}
                </a>
              )
            })}
          </div>
        </Card>
      )}

      {/* Legend */}
      <div className='flex flex-wrap items-center gap-3 px-1 text-[10px] font-bold'>
        <span className='inline-flex items-center gap-1 text-emerald-600'>
          <CheckCircle2 size={13} /> Correct answer
        </span>
        <span className='inline-flex items-center gap-1 text-rose-500'>
          <XCircle size={13} /> Your wrong choice
        </span>
      </div>

      {/* Questions */}
      <div className='space-y-3'>
        {data.questions.map((q, i) => {
          const answered = q.selectedIndex != null
          return (
            <Card
              key={q.questionId || i}
              id={`q-${i}`}
              className='p-4 rounded-2xl border-none shadow-sm bg-white space-y-3 scroll-mt-4'
            >
              <div className='flex items-start gap-2'>
                <span
                  className={`h-6 w-6 shrink-0 rounded-lg flex items-center justify-center text-[11px] font-black ${
                    q.isCorrect
                      ? 'bg-emerald-50 text-emerald-600'
                      : 'bg-rose-50 text-rose-500'
                  }`}
                >
                  {q.isCorrect ? <Check size={13} /> : <X size={13} />}
                </span>
                <div className='min-w-0 flex-1'>
                  <div className='flex items-center gap-2 flex-wrap mb-1'>
                    <span className='text-[9px] font-black uppercase text-slate-400'>
                      Q{i + 1}
                    </span>
                    {q.subject && (
                      <span className='text-[9px] font-black uppercase bg-blue-50 text-[#002EFF] px-1.5 py-0.5 rounded'>
                        {q.subject}
                      </span>
                    )}
                    <span className='text-[9px] font-bold text-slate-400'>
                      {n(q.marksEarned)}/{n(q.marks) || 1} mark
                      {(n(q.marks) || 1) === 1 ? '' : 's'}
                    </span>
                  </div>
                  <p className='text-sm font-bold text-slate-800 whitespace-pre-wrap break-words'>
                    {q.questionText}
                  </p>
                </div>
              </div>

              {q.imageUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={q.imageUrl}
                  alt=''
                  className='rounded-xl max-h-56 object-contain'
                />
              )}

              <div className='space-y-1.5'>
                {q.options.map((opt, idx) => {
                  const isCorrect = idx === q.correctIndex
                  const isChosen = idx === q.selectedIndex
                  const chosenWrong = isChosen && !isCorrect
                  return (
                    <div
                      key={idx}
                      className={`flex items-start gap-2 rounded-xl px-3 py-2 text-[13px] font-medium border ${
                        isCorrect
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                          : chosenWrong
                            ? 'bg-rose-50 border-rose-200 text-rose-700'
                            : 'bg-slate-50 border-transparent text-slate-600'
                      }`}
                    >
                      <span className='font-black shrink-0'>
                        {OPT_LETTER[idx] ?? idx + 1}.
                      </span>
                      <span className='flex-1 break-words'>{opt}</span>
                      {isCorrect && (
                        <span className='shrink-0 text-[9px] font-black uppercase text-emerald-600 inline-flex items-center gap-1'>
                          <CheckCircle2 size={12} /> Correct
                        </span>
                      )}
                      {chosenWrong && (
                        <span className='shrink-0 text-[9px] font-black uppercase text-rose-500 inline-flex items-center gap-1'>
                          <XCircle size={12} /> Your answer
                        </span>
                      )}
                    </div>
                  )
                })}
              </div>

              {!answered && (
                <p className='text-[10px] font-bold text-amber-600'>
                  You didn&apos;t answer this question.
                </p>
              )}

              {q.explanation && (
                <div className='flex items-start gap-2 rounded-xl bg-blue-50/60 px-3 py-2'>
                  <HelpCircle size={13} className='text-[#002EFF] mt-0.5 shrink-0' />
                  <p className='text-[12px] font-medium text-slate-600'>
                    {q.explanation}
                  </p>
                </div>
              )}
            </Card>
          )
        })}
      </div>
    </div>
  )
}
