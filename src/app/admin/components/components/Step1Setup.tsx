'use client'
import { ArrowRight } from 'lucide-react'
import { QuizConfig } from '../../constants/quiz'

interface Props {
  config: QuizConfig
  setConfig: (c: QuizConfig) => void
  onNext: () => void
}

export default function Step1Setup({ config, setConfig, onNext }: Props) {
  return (
    <div className='max-w-xl mx-auto mt-8 bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden animate-in slide-in-from-bottom-4 duration-500'>
      <div className='p-10'>
        <h2 className='text-2xl font-black text-slate-800 mb-2'>
          Assessment Details
        </h2>
        <p className='text-slate-500 mb-8 font-medium'>
          Define the basic rules and identity of your examination.
        </p>

        <div className='space-y-6'>
          <div>
            <label className='block text-[10px] font-black uppercase text-slate-400 mb-2 ml-1 tracking-widest'>
              Exam Name
            </label>
            <input
              value={config.title}
              onChange={(e) => setConfig({ ...config, title: e.target.value })}
              className='w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold focus:border-indigo-500 outline-none transition-all'
              placeholder='e.g. 2026 JAMB Mock Examination'
            />
          </div>

          <div>
            <label className='block text-[10px] font-black uppercase text-slate-400 mb-2 ml-1 tracking-widest'>
              Candidate Instructions
            </label>
            <textarea
              value={config.description}
              onChange={(e) =>
                setConfig({ ...config, description: e.target.value })
              }
              rows={4}
              className='w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-indigo-500 outline-none transition-all resize-none font-medium'
              placeholder='Describe how students should approach this test...'
            />
          </div>

          <button
            onClick={onNext}
            disabled={!config.title}
            className='w-full py-4 bg-slate-900 text-white rounded-2xl font-black uppercase text-[12px] tracking-widest hover:bg-indigo-600 disabled:bg-slate-200 transition-all flex justify-center items-center gap-2 shadow-xl shadow-slate-200'
          >
            Start Building Questions <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  )
}
