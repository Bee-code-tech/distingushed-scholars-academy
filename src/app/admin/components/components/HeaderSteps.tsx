'use client'
import { BookOpen, CheckCircle2 } from 'lucide-react'

interface Props {
  currentStep: number
}

export default function HeaderSteps({ currentStep }: Props) {
  const steps = [
    { id: 1, label: 'Setup' },
    { id: 2, label: 'Questions' },
    { id: 3, label: 'Finalize' },
  ]

  return (
    <header className='bg-white/90 backdrop-blur-md border-b border-slate-200 px-6 py-3 sticky top-0 z-40'>
      <div className='max-w-7xl mx-auto flex justify-between items-center'>
        <div className='flex items-center gap-3'>
          <div className='bg-indigo-600 p-2 rounded-xl text-white shadow-lg shadow-indigo-100'>
            <BookOpen size={18} />
          </div>
          <div className='hidden sm:block'>
            <h1 className='text-sm font-black text-slate-800 leading-tight tracking-tight'>
              ExamBuilder <span className='text-indigo-600'>Pro</span>
            </h1>
            <p className='text-[9px] font-bold text-slate-400 uppercase tracking-widest'>
              Unified Assessment Engine
            </p>
          </div>
        </div>

        <div className='flex items-center bg-slate-100 p-1 rounded-full px-2 gap-4'>
          {steps.map((s) => (
            <div key={s.id} className='flex items-center gap-2'>
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black transition-all ${
                  currentStep === s.id
                    ? 'bg-indigo-600 text-white shadow-md'
                    : currentStep > s.id
                      ? 'bg-emerald-500 text-white'
                      : 'text-slate-400'
                }`}
              >
                {currentStep > s.id ? <CheckCircle2 size={12} /> : s.id}
              </div>
              {currentStep === s.id && (
                <span className='text-[10px] font-black text-slate-700 uppercase pr-2'>
                  {s.label}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </header>
  )
}
