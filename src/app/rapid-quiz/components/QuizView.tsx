'use client'

import { motion } from 'framer-motion'
import {
  Flag,
  Info,
  CheckCircle2,
  LayoutGrid,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'

interface QuizViewProps {
  currentQ: any
  currentIdx: number
  quizData: any[]
  answers: (number | null)[]
  flagged: boolean[]
  isReview: boolean
  isStudyMode: boolean
  setAnswers: (a: any) => void
  setFlagged: (f: any) => void
  setCurrentIdx: (i: any) => void
  onSubmit: () => void
}

export const QuizView = ({
  currentQ,
  currentIdx,
  quizData,
  answers,
  flagged,
  isReview,
  isStudyMode,
  setAnswers,
  setFlagged,
  setCurrentIdx,
  onSubmit,
}: QuizViewProps) => {
  if (!currentQ) return null

  const handleFlag = () => {
    const f = [...flagged]
    f[currentIdx] = !f[currentIdx]
    setFlagged(f)
  }

  return (
    <main className='max-w-5xl mx-auto p-3 grid lg:grid-cols-[1fr_240px] gap-4 items-start font-sans selection:bg-blue-100'>
      <div className='flex flex-col gap-3'>
        {/* Question Card */}
        <div className='bg-white rounded-3xl shadow-sm border border-zinc-100 overflow-hidden'>
          <div className='p-6 md:p-7'>
            <div className='flex justify-between items-center mb-5'>
              <div className='flex gap-2 items-center'>
                <span className='px-2.5 py-1 bg-blue-50 text-blue-600 rounded-lg text-[8px] font-black uppercase tracking-widest border border-blue-100'>
                  {currentQ.subject}
                </span>
                {isStudyMode && (
                  <span className='flex items-center gap-1 text-[8px] font-black uppercase text-emerald-600'>
                    <span className='w-1 h-1 bg-emerald-500 rounded-full animate-pulse' />
                    Study Active
                  </span>
                )}
              </div>

              {!isReview && (
                <button
                  onClick={handleFlag}
                  className={`p-2 rounded-xl transition-all border ${flagged[currentIdx] ? 'bg-orange-500 border-orange-500 text-white shadow-md shadow-orange-100' : 'text-zinc-300 border-zinc-100 hover:bg-zinc-50'}`}
                >
                  <Flag
                    size={14}
                    fill={flagged[currentIdx] ? 'currentColor' : 'none'}
                  />
                </button>
              )}
            </div>

            <motion.h2
              key={`q-${currentIdx}`}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className='text-[17px] font-bold text-zinc-800 leading-snug mb-6'
            >
              <span className='text-blue-600/40 mr-1.5 font-black'>
                Q{currentIdx + 1}.
              </span>
              {currentQ.question}
            </motion.h2>

            <div className='grid gap-2'>
              {currentQ.options.map((opt: string, i: number) => {
                const isSelected = answers[currentIdx] === i
                const isCorrect = i === currentQ.correct
                const revealed =
                  isReview || (isStudyMode && answers[currentIdx] !== null)

                let style =
                  'bg-zinc-50 border-transparent text-zinc-600 hover:bg-zinc-100 hover:border-zinc-200'
                if (isSelected)
                  style =
                    'border-blue-600 bg-blue-50/50 text-blue-700 shadow-sm'

                if (revealed) {
                  if (isCorrect)
                    style =
                      'border-emerald-500 bg-emerald-50 text-emerald-700 shadow-sm'
                  else if (isSelected)
                    style = 'border-rose-500 bg-rose-50 text-rose-700 shadow-sm'
                }

                return (
                  <button
                    key={i}
                    disabled={revealed}
                    onClick={() => {
                      const a = [...answers]
                      a[currentIdx] = i
                      setAnswers(a)
                    }}
                    className={`p-3.5 rounded-xl border-2 text-left text-[12px] font-bold transition-all flex justify-between items-center group active:scale-[0.995] ${style}`}
                  >
                    <span className='flex gap-3'>
                      <span className='opacity-30'>
                        {String.fromCharCode(65 + i)}
                      </span>
                      {opt}
                    </span>
                    {revealed && isCorrect && (
                      <CheckCircle2
                        size={15}
                        className='text-emerald-500 shrink-0'
                      />
                    )}
                  </button>
                )
              })}
            </div>

            {/* Insight Section */}
            {(isReview || (isStudyMode && answers[currentIdx] !== null)) && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className='mt-6 p-4 bg-zinc-900 rounded-2xl border border-zinc-800'
              >
                <div className='flex items-center gap-2 mb-2'>
                  <Info size={12} className='text-blue-400' />
                  <span className='text-[8px] font-black text-white uppercase tracking-widest'>
                    Solution Insight
                  </span>
                </div>
                <p className='text-[11px] text-zinc-400 leading-relaxed font-medium'>
                  {currentQ.explanation}
                </p>
              </motion.div>
            )}
          </div>
        </div>

        {/* Action Bar */}
        <div className='flex justify-between items-center bg-white border border-zinc-100 p-2 rounded-2xl shadow-sm'>
          <button
            disabled={currentIdx === 0}
            onClick={() => setCurrentIdx((p: number) => p - 1)}
            className='flex items-center gap-1.5 px-4 py-2 text-[9px] font-black uppercase text-zinc-400 disabled:opacity-10 hover:text-zinc-900 transition-colors'
          >
            <ChevronLeft size={14} /> Prev
          </button>

          <div className='hidden sm:flex items-center gap-3'>
            <div className='w-32 h-1 bg-zinc-100 rounded-full overflow-hidden'>
              <motion.div
                className='h-full bg-blue-600'
                initial={{ width: 0 }}
                animate={{
                  width: `${((currentIdx + 1) / quizData.length) * 100}%`,
                }}
              />
            </div>
            <span className='text-[8px] font-black text-zinc-400 uppercase tabular-nums'>
              {Math.round(((currentIdx + 1) / quizData.length) * 100)}% Complete
            </span>
          </div>

          <button
            onClick={() =>
              currentIdx === quizData.length - 1
                ? onSubmit()
                : setCurrentIdx((p: number) => p + 1)
            }
            className={`px-7 py-2 rounded-xl font-black uppercase text-[9px] tracking-widest transition-all flex items-center gap-2 ${currentIdx === quizData.length - 1 ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-100' : 'bg-zinc-900 text-white hover:bg-black shadow-lg shadow-zinc-200'}`}
          >
            {currentIdx === quizData.length - 1 ? 'Finish' : 'Next'}{' '}
            <ChevronRight size={14} />
          </button>
        </div>
      </div>

      {/* Sidebar Grid */}
      <aside className='hidden lg:block sticky top-6'>
        <div className='bg-white p-4 rounded-3xl border border-zinc-100 shadow-sm'>
          <div className='flex items-center justify-between mb-4 px-1'>
            <div className='flex items-center gap-2 text-zinc-400'>
              <LayoutGrid size={12} />
              <span className='text-[8px] font-black uppercase tracking-widest'>
                Matrix
              </span>
            </div>
            <span className='text-[10px] font-black text-zinc-900 tabular-nums'>
              {currentIdx + 1}/{quizData.length}
            </span>
          </div>

          <div className='grid grid-cols-5 gap-1'>
            {quizData.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentIdx(i)}
                className={`aspect-square rounded-lg text-[9px] font-black border transition-all active:scale-90 flex items-center justify-center ${
                  currentIdx === i
                    ? 'ring-2 ring-blue-600 ring-offset-1 border-transparent'
                    : 'border-transparent'
                } ${
                  isReview
                    ? answers[i] === quizData[i].correct
                      ? 'bg-emerald-500 text-white'
                      : 'bg-rose-500 text-white'
                    : flagged[i]
                      ? 'bg-orange-500 text-white'
                      : answers[i] !== null
                        ? 'bg-zinc-900 text-white'
                        : 'bg-zinc-50 text-zinc-400'
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        </div>
      </aside>
    </main>
  )
}
