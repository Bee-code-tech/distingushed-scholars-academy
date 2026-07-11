'use client'
import React, { useState, useEffect } from 'react'
import {
  Clock,
  Shuffle,
  Save,
  ArrowLeft,
  ChevronDown,
  LayoutList,
  CheckCircle2,
} from 'lucide-react'

export const LogisticsStep = ({
  config,
  setConfig,
  onBack,
  onDeploy,
  questions,
}: any) => {
  const [h, setH] = useState(Math.floor(config.timeLimit / 60))
  const [m, setM] = useState(config.timeLimit % 60)
  const [showReview, setShowReview] = useState(false)

  // Calculate stats for the review
  const totalMarks = questions.reduce(
    (acc: number, q: any) => acc + (q.mark || 0),
    0,
  )
  const subjectBreakdown = questions.reduce((acc: any, q: any) => {
    acc[q.subject] = (acc[q.subject] || 0) + 1
    return acc
  }, {})

  useEffect(() => {
    setConfig((prev: any) => ({ ...prev, timeLimit: h * 60 + m }))
  }, [h, m, setConfig])

  return (
    <div className='max-w-md mx-auto mt-4 space-y-6 animate-in slide-in-from-bottom-4 duration-500 pb-20'>
      <div className='bg-white rounded-[40px] shadow-2xl border border-slate-200 overflow-hidden'>
        {/* Header */}
        <div className='bg-slate-900 p-8 text-white text-center'>
          <h2 className='text-xl font-black uppercase tracking-tighter italic'>
            Final Deployment
          </h2>
          <p className='text-slate-400 text-[10px] uppercase font-bold tracking-[0.2em] mt-1'>
            Step 3: Configuration & Review
          </p>
        </div>

        <div className='p-8 space-y-6'>
          {/* 1. Review Accordion */}
          <div
            className={`border-2 rounded-[32px] transition-all duration-300 ${showReview ? 'border-indigo-500 bg-white' : 'border-slate-100 bg-slate-50/50'}`}
          >
            <button
              onClick={() => setShowReview(!showReview)}
              className='w-full p-5 flex items-center justify-between outline-none'
            >
              <div className='flex items-center gap-3'>
                <div className='bg-indigo-100 p-2 rounded-xl text-indigo-600'>
                  <LayoutList size={18} />
                </div>
                <div className='text-left'>
                  <p className='text-[10px] font-black uppercase text-slate-800 tracking-widest'>
                    Exam Summary
                  </p>
                  <p className='text-[9px] font-bold text-slate-400 uppercase'>
                    {questions.length} Questions Loaded
                  </p>
                </div>
              </div>
              <ChevronDown
                size={18}
                className={`text-slate-400 transition-transform ${showReview ? 'rotate-180' : ''}`}
              />
            </button>

            {showReview && (
              <div className='px-6 pb-6 space-y-4 animate-in fade-in slide-in-from-top-2'>
                <div className='h-px bg-slate-100 w-full' />
                <div className='grid grid-cols-2 gap-4'>
                  <div className='bg-slate-50 p-3 rounded-2xl'>
                    <p className='text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1'>
                      Total Marks
                    </p>
                    <p className='text-lg font-black text-indigo-600'>
                      {totalMarks}{' '}
                      <span className='text-[10px] text-slate-400'>pts</span>
                    </p>
                  </div>
                  <div className='bg-slate-50 p-3 rounded-2xl'>
                    <p className='text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1'>
                      Time Set
                    </p>
                    <p className='text-lg font-black text-indigo-600'>
                      {h}h {m}m
                    </p>
                  </div>
                </div>
                <div className='space-y-2'>
                  <p className='text-[8px] font-black text-slate-400 uppercase tracking-widest ml-1'>
                    Breakdown by Subject
                  </p>
                  {Object.entries(subjectBreakdown).map(
                    ([subject, count]: any) => (
                      <div
                        key={subject}
                        className='flex justify-between items-center bg-white border border-slate-100 p-2 px-4 rounded-xl shadow-sm'
                      >
                        <span className='text-[10px] font-bold text-slate-700'>
                          {subject}
                        </span>
                        <span className='text-[10px] font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md'>
                          {count} Qs
                        </span>
                      </div>
                    ),
                  )}
                </div>
              </div>
            )}
          </div>

          {/* 2. Duration Section */}
          <div className='p-6 bg-slate-50 rounded-[32px] border-2 border-slate-100'>
            <div className='flex items-center gap-3 mb-6'>
              <div className='bg-orange-100 p-2 rounded-xl text-orange-600'>
                <Clock size={18} />
              </div>
              <p className='font-black text-slate-800 text-[11px] uppercase tracking-widest'>
                Exam Duration
              </p>
            </div>

            <div className='flex items-center justify-center gap-4'>
              <div className='flex flex-col items-center gap-2'>
                <input
                  type='number'
                  value={h}
                  onChange={(e) => setH(Math.max(0, Number(e.target.value)))}
                  className='w-20 bg-white border-2 border-slate-200 rounded-2xl py-4 text-center font-black text-xl text-indigo-600 outline-none focus:border-indigo-500 transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none'
                />
                <span className='text-[9px] font-black text-slate-400 uppercase tracking-widest'>
                  Hours
                </span>
              </div>
              <span className='text-2xl font-black text-slate-300 pb-6'>:</span>
              <div className='flex flex-col items-center gap-2'>
                <input
                  type='number'
                  value={m}
                  min='0'
                  max='59'
                  onChange={(e) =>
                    setM(Math.max(0, Math.min(59, Number(e.target.value))))
                  }
                  className='w-20 bg-white border-2 border-slate-200 rounded-2xl py-4 text-center font-black text-xl text-indigo-600 outline-none focus:border-indigo-500 transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none'
                />
                <span className='text-[9px] font-black text-slate-400 uppercase tracking-widest'>
                  Mins
                </span>
              </div>
            </div>
          </div>

          {/* 3. Randomization Toggle */}
          <button
            onClick={() => setConfig({ ...config, shuffle: !config.shuffle })}
            className={`w-full p-5 rounded-[32px] border-2 transition-all text-left flex items-center justify-between ${config.shuffle ? 'border-indigo-500 bg-indigo-50 shadow-lg shadow-indigo-100/50' : 'border-slate-100 bg-slate-50/50'}`}
          >
            <div className='flex items-center gap-4'>
              <div
                className={`${config.shuffle ? 'text-indigo-600' : 'text-slate-400'}`}
              >
                <Shuffle size={20} />
              </div>
              <div>
                <p className='text-[10px] font-black uppercase text-slate-800 tracking-tight'>
                  Randomize Questions
                </p>
                <p className='text-[9px] font-bold text-slate-400 uppercase'>
                  Scramble Sequence
                </p>
              </div>
            </div>
            <div
              className={`w-10 h-6 rounded-full transition-colors relative ${config.shuffle ? 'bg-indigo-600' : 'bg-slate-200'}`}
            >
              <div
                className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${config.shuffle ? 'left-5' : 'left-1'}`}
              />
            </div>
          </button>

          {/* Action Buttons */}
          <div className='pt-4 space-y-3'>
            <button
              onClick={onDeploy}
              className='w-full py-5 bg-emerald-600 text-white rounded-[24px] font-black uppercase text-[12px] tracking-widest hover:bg-emerald-700 hover:-translate-y-1 shadow-xl shadow-emerald-100 flex justify-center items-center gap-3 transition-all active:scale-95'
            >
              <CheckCircle2 size={18} /> Launch Examination
            </button>
            <button
              onClick={onBack}
              className='w-full py-2 text-slate-400 font-black uppercase text-[10px] flex justify-center items-center gap-2 hover:text-slate-600 transition-colors'
            >
              <ArrowLeft size={14} /> Adjust Questions
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}