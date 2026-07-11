'use client'

import { useState, useEffect, useMemo } from 'react'
import {
  Monitor,
  Calculator,
  Flag,
  ChevronLeft,
  ChevronRight,
  Clock,
  ShieldCheck,
  Layers,
  BookOpen,
  Zap,
  RotateCcw,
  X,
  Trophy,
  Target,
  AlertTriangle,
  LogOut,
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { pastQuestions } from './pastquestions'

type Mode = 'jamb' | 'study' | null

export default function ExamSimulator() {
  const [mode, setMode] = useState<Mode>(null)
  const [activeSubject, setActiveSubject] = useState('Biology')
  const [currentIdx, setCurrentIdx] = useState(0)
  const [selectedAnswers, setSelectedAnswers] = useState<
    Record<string, number>
  >({})
  const [marked, setMarked] = useState<number[]>([])
  const [timeLeft, setTimeLeft] = useState(7200)

  const [showCalc, setShowCalc] = useState(false)
  const [showExit, setShowExit] = useState(false)
  const [showResults, setShowResults] = useState(false)

  const currentQuestions = useMemo(
    () => (pastQuestions as any)[activeSubject]?.bank || [],
    [activeSubject],
  )
  const question = currentQuestions[currentIdx]

  useEffect(() => {
    if (!mode || mode === 'study') return
    const timer = setInterval(
      () => setTimeLeft((p) => (p > 0 ? p - 1 : 0)),
      1000,
    )
    return () => clearInterval(timer)
  }, [mode])

  const formatTime = (s: number) => {
    const m = Math.floor((s % 3600) / 60),
      sec = s % 60
    return `${Math.floor(s / 3600)}:${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`
  }

  const handleSelect = (i: number) => {
    if (mode === 'study') return
    setSelectedAnswers((prev) => ({
      ...prev,
      [`${activeSubject}-${currentIdx}`]: i,
    }))
  }

  // --- MODULAR UI COMPONENTS ---

  if (!mode)
    return (
      <div className='min-h-screen flex items-center justify-center bg-zinc-50 p-6'>
        <div className='max-w-sm w-full space-y-6'>
          <div className='text-center'>
            <h1 className='text-2xl font-bold text-zinc-900 tracking-tight'>
              Exam Portal
            </h1>
            <p className='text-zinc-500 text-xs uppercase tracking-widest mt-1'>
              Select your simulation mode
            </p>
          </div>
          <div className='grid gap-3'>
            <Button
              onClick={() => setMode('jamb')}
              className='h-20 justify-start gap-4 bg-white border border-zinc-200 text-zinc-900 hover:bg-zinc-50 shadow-sm rounded-2xl px-6'
            >
              <Zap className='text-amber-500' />
              <div className='text-left'>
                <p className='font-bold'>JAMB Mode</p>
                <p className='text-[10px] text-zinc-500'>
                  Timed • Standard Rules
                </p>
              </div>
            </Button>
            <Button
              onClick={() => setMode('study')}
              className='h-20 justify-start gap-4 bg-white border border-zinc-200 text-zinc-900 hover:bg-zinc-50 shadow-sm rounded-2xl px-6'
            >
              <BookOpen className='text-blue-500' />
              <div className='text-left'>
                <p className='font-bold'>Study Mode</p>
                <p className='text-[10px] text-zinc-500'>
                  Untimed • Explanations
                </p>
              </div>
            </Button>
          </div>
        </div>
      </div>
    )

  return (
    <div className='max-w-5xl mx-auto p-4 md:p-6 space-y-4 animate-in fade-in'>
      {/* PROFESSIONAL HEADER */}
      <header className='flex items-center justify-between bg-white border border-zinc-200 p-2 pl-6 rounded-2xl shadow-sm'>
        <div className='flex items-center gap-4'>
          <Monitor size={16} className='text-zinc-400' />
          <div className='flex gap-1'>
            {Object.keys(pastQuestions).map((sub) => (
              <button
                key={sub}
                onClick={() => {
                  setActiveSubject(sub)
                  setCurrentIdx(0)
                }}
                className={`px-4 py-1.5 rounded-lg text-[11px] font-bold transition-all ${activeSubject === sub ? 'bg-zinc-900 text-white' : 'text-zinc-500 hover:bg-zinc-100'}`}
              >
                {sub}
              </button>
            ))}
          </div>
        </div>
        <div className='flex items-center gap-2'>
          {mode === 'jamb' && (
            <div className='px-4 py-1.5 bg-zinc-50 border rounded-lg flex items-center gap-2'>
              <Clock
                size={14}
                className={timeLeft < 600 ? 'text-red-500' : 'text-zinc-400'}
              />
              <span className='font-mono text-xs font-bold'>
                {formatTime(timeLeft)}
              </span>
            </div>
          )}
          <Button
            size='icon'
            variant='ghost'
            onClick={() => setShowCalc(!showCalc)}
          >
            <Calculator size={18} />
          </Button>
          <Button
            size='icon'
            variant='ghost'
            className='text-red-500'
            onClick={() => setShowExit(true)}
          >
            <LogOut size={18} />
          </Button>
        </div>
      </header>

      <div className='grid grid-cols-12 gap-5'>
        <main className='col-span-12 lg:col-span-8 space-y-4'>
          <Card className='p-8 md:p-10 rounded-3xl border-zinc-200 shadow-sm min-h-[550px] flex flex-col'>
            <div className='flex justify-between items-center mb-8'>
              <Badge
                variant='secondary'
                className='rounded-md font-bold text-[10px]'
              >
                {activeSubject} • Q{currentIdx + 1}
              </Badge>
              <button
                onClick={() =>
                  setMarked((p) =>
                    p.includes(currentIdx)
                      ? p.filter((i) => i !== currentIdx)
                      : [...p, currentIdx],
                  )
                }
                className={`text-[11px] font-bold flex items-center gap-2 ${marked.includes(currentIdx) ? 'text-amber-600' : 'text-zinc-400'}`}
              >
                <Flag
                  size={14}
                  fill={marked.includes(currentIdx) ? 'currentColor' : 'none'}
                />{' '}
                Review
              </button>
            </div>

            <div className='flex-1'>
              <h2 className='text-lg font-semibold text-zinc-800 leading-snug mb-8'>
                {question?.question}
              </h2>
              <div className='grid gap-3 max-w-xl'>
                {question?.options.map((opt: string, i: number) => {
                  const isSelected =
                    selectedAnswers[`${activeSubject}-${currentIdx}`] === i
                  const isCorrect = i === question.answer
                  return (
                    <button
                      key={i}
                      onClick={() => handleSelect(i)}
                      disabled={mode === 'study'}
                      className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left
                        ${
                          mode === 'study' && isCorrect
                            ? 'border-emerald-500 bg-emerald-50'
                            : isSelected
                              ? 'border-zinc-900 bg-zinc-900 text-white'
                              : 'border-zinc-100 hover:bg-zinc-50'
                        }`}
                    >
                      <span
                        className={`w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-bold 
                        ${isSelected ? 'bg-white/20' : 'bg-zinc-100 text-zinc-500'}`}
                      >
                        {String.fromCharCode(65 + i)}
                      </span>
                      <span className='text-sm font-medium'>{opt}</span>
                    </button>
                  )
                })}
              </div>

              {mode === 'study' && (
                <div className='mt-8 p-6 bg-blue-50 rounded-2xl border border-blue-100 animate-in fade-in'>
                  <div className='flex items-center gap-2 mb-3 text-blue-700'>
                    <Target size={14} />{' '}
                    <span className='text-[11px] font-bold uppercase'>
                      Explanation
                    </span>
                  </div>
                  <p className='text-sm text-blue-900/80 mb-4'>
                    {question?.explanation}
                  </p>
                  {question?.topic === 'Biology' && (
                    <div className='mt-2'>
                      [Image of biological cell structure diagram]
                    </div>
                  )}
                </div>
              )}
            </div>

            <footer className='flex items-center justify-between mt-12 pt-6 border-t border-zinc-100'>
              <Button
                variant='ghost'
                size='sm'
                onClick={() => setCurrentIdx((p) => Math.max(0, p - 1))}
                disabled={currentIdx === 0}
              >
                <ChevronLeft size={16} /> Previous
              </Button>
              <div className='flex gap-2'>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() => setShowResults(true)}
                >
                  Submit
                </Button>
                <Button
                  size='sm'
                  className='bg-zinc-900'
                  onClick={() =>
                    setCurrentIdx((p) =>
                      Math.min(currentQuestions.length - 1, p + 1),
                    )
                  }
                >
                  Next <ChevronRight size={16} />
                </Button>
              </div>
            </footer>
          </Card>
        </main>

        <aside className='col-span-12 lg:col-span-4 space-y-4'>
          <Card className='p-6 rounded-3xl border-zinc-200 shadow-sm'>
            <div className='flex justify-between items-center mb-6'>
              <h3 className='text-[11px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-2'>
                <Layers size={14} /> Navigator
              </h3>
              <span className='text-[10px] font-bold px-2 py-0.5 bg-zinc-100 rounded-full'>
                {Object.keys(selectedAnswers).length}/{currentQuestions.length}
              </span>
            </div>
            <div className='grid grid-cols-5 gap-2'>
              {currentQuestions.map((_: any, i: number) => (
                <button
                  key={i}
                  onClick={() => setCurrentIdx(i)}
                  className={`h-9 rounded-lg text-xs font-bold border transition-all ${
                    i === currentIdx
                      ? 'bg-zinc-900 text-white border-zinc-900'
                      : marked.includes(i)
                        ? 'bg-amber-100 text-amber-700 border-amber-200'
                        : selectedAnswers[`${activeSubject}-${i}`] !== undefined
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                          : 'bg-white text-zinc-400 border-zinc-100'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          </Card>

          <div className='p-6 bg-zinc-900 rounded-3xl text-white'>
            <div className='flex items-center gap-3 mb-6'>
              <ShieldCheck className='text-emerald-400' size={18} />
              <div>
                <p className='text-[10px] text-zinc-500 font-bold uppercase'>
                  Session ID
                </p>
                <p className='text-xs font-mono'>#CBT-2026-AFR</p>
              </div>
            </div>
            <Button
              variant='secondary'
              className='w-full rounded-xl bg-white/10 text-white hover:bg-white/20 border-none'
              onClick={() => setMode(null)}
            >
              <RotateCcw size={16} className='mr-2' /> Restart
            </Button>
          </div>
        </aside>
      </div>

      {/* MODALS (Simplified) */}
      {showResults && (
        <div className='fixed inset-0 z-100 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4'>
          <Card className='max-w-xs w-full p-8 rounded-3xl text-center space-y-4'>
            <Trophy className='mx-auto text-blue-500' size={40} />
            <h2 className='text-xl font-bold'>Review Completed</h2>
            <p className='text-sm text-zinc-500'>
              You've answered {Object.keys(selectedAnswers).length} questions.
            </p>
            <Button
              className='w-full bg-zinc-900'
              onClick={() => window.location.reload()}
            >
              Close Session
            </Button>
          </Card>
        </div>
      )}
    </div>
  )
}
