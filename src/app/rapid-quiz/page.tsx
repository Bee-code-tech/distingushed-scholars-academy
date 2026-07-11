// src/app/rapid-quiz/page.tsx
'use client'

import { useState, useEffect, useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Calculator, Home, AlertCircle, Loader2 } from 'lucide-react'

// Component Imports
import { ScientificCalculator } from './components/Calculator'
import { SetupView } from './components/SetupView'
import { QuizView } from './components/QuizView'
import { ResultModal } from './components/ResultModal'
import { ExitModal } from './components/ExitModal'

// Utility Imports
import { questionBank } from './questions'
import { calculateScore, getSubjectStats } from './utils/quizHelpers'
import { downloadPDF } from './utils/pdfGenerator'

export default function RapidQuizPortal() {
  const [mounted, setMounted] = useState(false)
  const [step, setStep] = useState<'setup' | 'quiz' | 'result' | 'review'>(
    'setup',
  )

  // Quiz State
  const [selectedSubs, setSelectedSubs] = useState<string[]>([])
  const [qPerSubject, setQPerSubject] = useState(10)
  const [totalMinutes, setTotalMinutes] = useState(15)
  const [isStudyMode, setIsStudyMode] = useState(false)
  const [quizData, setQuizData] = useState<any[]>([])
  const [currentIdx, setCurrentIdx] = useState(0)
  const [answers, setAnswers] = useState<(number | null)[]>([])
  const [flagged, setFlagged] = useState<boolean[]>([])
  const [timeLeft, setTimeLeft] = useState(0)

  // Submission & UI State
  const [isConfirming, setIsConfirming] = useState(false)
  const [abortCountdown, setAbortCountdown] = useState<number | null>(null)
  const [showCalc, setShowCalc] = useState(false)
  const [showExitConfirm, setShowExitConfirm] = useState(false)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Main Quiz Timer
  useEffect(() => {
    if (step === 'quiz' && timeLeft > 0 && !isConfirming) {
      const t = setInterval(() => setTimeLeft((p) => p - 1), 1000)
      return () => clearInterval(t)
    } else if (timeLeft === 0 && step === 'quiz') {
      handleFinishQuiz()
    }
  }, [timeLeft, step, isConfirming])

  // Submission Abort Timer
  useEffect(() => {
    if (abortCountdown !== null && abortCountdown > 0) {
      timerRef.current = setTimeout(
        () => setAbortCountdown(abortCountdown - 1),
        1000,
      )
    } else if (abortCountdown === 0) {
      handleFinishQuiz()
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [abortCountdown])

  const handleStart = () => {
    let pool: any[] = []
    selectedSubs.forEach((sub) => {
      const filtered = questionBank
        .filter((q) => q.subject === sub)
        .sort(() => 0.5 - Math.random())
        .slice(0, qPerSubject)
      pool = [...pool, ...filtered]
    })
    const shuffled = pool.sort(() => 0.5 - Math.random())
    setQuizData(shuffled)
    setAnswers(new Array(shuffled.length).fill(null))
    setFlagged(new Array(shuffled.length).fill(false))
    setTimeLeft(totalMinutes * 60)
    setCurrentIdx(0)
    setStep('quiz')
  }

  const handleFinishQuiz = () => {
    setAbortCountdown(null)
    setIsConfirming(false)
    setStep('result')
  }

  const abortSubmit = () => {
    setAbortCountdown(null)
    setIsConfirming(false)
    if (timerRef.current) clearTimeout(timerRef.current)
  }

  const answeredCount = answers.filter((a) => a !== null).length
  const { correctCount, percent: userScore } = calculateScore(answers, quizData)
  const stats = getSubjectStats(quizData, answers)
  const secondsUsed = totalMinutes * 60 - timeLeft

  if (!mounted) return null

  return (
    <div className='min-h-screen bg-[#F8FAFF] font-sans antialiased'>
      <AnimatePresence>
        {/* --- PROFESSIONAL SUBMISSION OVERLAY --- */}
        {isConfirming && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className='fixed inset-0 z-300 bg-white/90 backdrop-blur-xl flex items-center justify-center p-6'
          >
            <div className='max-w-sm w-full bg-white shadow-2xl rounded-4xl p-8 border border-gray-100 text-center'>
              {abortCountdown === null ? (
                <>
                  <div className='w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6'>
                    <AlertCircle size={32} />
                  </div>
                  <h2 className='text-2xl font-black text-zinc-900 uppercase tracking-tight mb-2'>
                    Submit Quiz?
                  </h2>
                  <p className='text-gray-400 text-[10px] font-bold uppercase mb-6'>
                    Confirm your progress below
                  </p>

                  <div className='flex justify-center gap-8 mb-8'>
                    <div>
                      <p className='text-3xl font-black text-blue-600'>
                        {answeredCount}
                      </p>
                      <p className='text-[10px] font-bold text-gray-400 uppercase tracking-widest'>
                        Solved
                      </p>
                    </div>
                    <div className='w-px h-10 bg-gray-100 self-center' />
                    <div>
                      <p className='text-3xl font-black text-red-500'>
                        {quizData.length - answeredCount}
                      </p>
                      <p className='text-[10px] font-bold text-gray-400 uppercase tracking-widest'>
                        Empty
                      </p>
                    </div>
                  </div>

                  <div className='flex flex-col gap-3'>
                    <button
                      onClick={() => setAbortCountdown(3)}
                      className='w-full py-4 bg-blue-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-100'
                    >
                      Confirm & Submit
                    </button>
                    <button
                      onClick={() => setIsConfirming(false)}
                      className='w-full py-4 text-zinc-400 font-bold uppercase text-[10px] tracking-widest'
                    >
                      Review Questions
                    </button>
                  </div>
                </>
              ) : (
                <div className='py-10'>
                  <div className='relative w-24 h-24 mx-auto mb-6'>
                    <Loader2
                      className='w-full h-full text-blue-600 animate-spin opacity-10'
                      size={96}
                    />
                    <div className='absolute inset-0 flex items-center justify-center text-4xl font-black text-zinc-900'>
                      {abortCountdown}
                    </div>
                  </div>
                  <h2 className='text-xl font-black text-zinc-900 uppercase tracking-tighter mb-6'>
                    Processing Results...
                  </h2>
                  <button
                    onClick={abortSubmit}
                    className='px-10 py-3 bg-red-50 text-red-600 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-red-100 transition-all'
                  >
                    Abort Submission
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {showCalc && (
          <ScientificCalculator onClose={() => setShowCalc(false)} />
        )}
        {showExitConfirm && (
          <ExitModal
            onClose={() => setShowExitConfirm(false)}
            onReset={() => setStep('setup')}
          />
        )}
      </AnimatePresence>

      {step === 'setup' ? (
        <SetupView
          selectedSubs={selectedSubs}
          setSelectedSubs={setSelectedSubs}
          qPerSubject={qPerSubject}
          setQPerSubject={setQPerSubject}
          totalMinutes={totalMinutes}
          setTotalMinutes={setTotalMinutes}
          isStudyMode={isStudyMode}
          setIsStudyMode={setIsStudyMode}
          handleStart={handleStart}
        />
      ) : (
        <div className='flex flex-col min-h-screen'>
          <nav className='bg-white/70 backdrop-blur-md border-b px-6 py-4 sticky top-0 z-40 flex justify-between items-center'>
            <div className='flex items-center gap-3'>
              <button
                onClick={() => setShowExitConfirm(true)}
                className='p-2 text-zinc-400 hover:text-black hover:bg-zinc-100 rounded-xl transition-all'
              >
                <Home size={20} />
              </button>
              {step === 'quiz' && (
                <button
                  onClick={() => setShowCalc(!showCalc)}
                  className={`p-2 rounded-xl border transition-all ${showCalc ? 'bg-black text-white border-black' : 'text-zinc-400 border-zinc-100 hover:bg-zinc-50'}`}
                >
                  <Calculator size={20} />
                </button>
              )}
            </div>

            <div className='flex items-center gap-4'>
              {step !== 'review' ? (
                <>
                  <div
                    className={`px-5 py-2 rounded-2xl font-mono font-black text-sm border-2 ${timeLeft < 60 ? 'bg-red-50 text-red-600 border-red-100 animate-pulse' : 'bg-zinc-50 text-zinc-900 border-transparent'}`}
                  >
                    {Math.floor(timeLeft / 60)}:
                    {(timeLeft % 60).toString().padStart(2, '0')}
                  </div>
                  <button
                    onClick={() => setIsConfirming(true)}
                    className='bg-black text-white px-8 py-2 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-zinc-200 active:scale-95 transition-all'
                  >
                    Finish
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setStep('result')}
                  className='bg-[#002EFF] text-white px-8 py-2 rounded-2xl font-black text-[10px] uppercase tracking-widest'
                >
                  Summary
                </button>
              )}
            </div>
          </nav>

          <QuizView
            currentQ={quizData[currentIdx]}
            currentIdx={currentIdx}
            quizData={quizData}
            answers={answers}
            flagged={flagged}
            isReview={step === 'review'}
            isStudyMode={isStudyMode}
            setAnswers={setAnswers}
            setFlagged={setFlagged}
            setCurrentIdx={setCurrentIdx}
            onSubmit={() => setIsConfirming(true)}
          />
        </div>
      )}

      <AnimatePresence>
        {step === 'result' && (
          <ResultModal
            userScore={userScore}
            subjectStats={stats}
            onReview={() => {
              setCurrentIdx(0)
              setStep('review')
            }}
            onDownload={() =>
              downloadPDF(userScore, quizData, correctCount, secondsUsed, stats)
            }
            onRetake={() => setStep('setup')}
            onHome={() => setStep('setup')}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
