'use client'
import {
  Trophy,
  Clock,
  Shuffle,
  Save,
  ArrowLeft,
  AlertTriangle,
} from 'lucide-react'
import { QuizConfig } from '../../constants/quiz'
import { useState } from 'react'

interface Props {
  config: QuizConfig
  setConfig: (c: QuizConfig) => void
  onPublish: () => void
  onBack: () => void
}

export default function Step3Logistics({
  config,
  setConfig,
  onPublish,
  onBack,
}: Props) {
  const [showConfirm, setShowConfirm] = useState(false)

  return (
    <div className='max-w-md mx-auto mt-4 animate-in zoom-in-95 duration-300'>
      <div className='bg-white rounded-4xl shadow-2xl border border-slate-200 overflow-hidden'>
        <div className='bg-indigo-600 p-8 text-white text-center'>
          <div className='w-16 h-16 bg-white/20 rounded-3xl flex items-center justify-center mx-auto mb-4 backdrop-blur-md'>
            <Trophy className='text-yellow-300' size={32} />
          </div>
          <h2 className='text-xl font-black uppercase tracking-tighter'>
            Ready for Deployment
          </h2>
        </div>

        <div className='p-8 space-y-6'>
          {/* Duration Input */}
          <div className='flex items-center justify-between p-4 bg-slate-50 rounded-2xl border-2 border-slate-100'>
            <div className='flex items-center gap-4'>
              <div className='bg-orange-100 p-3 rounded-xl text-orange-600'>
                <Clock size={20} />
              </div>
              <div>
                <p className='font-black text-slate-800 text-[11px] uppercase'>
                  Duration
                </p>
                <p className='text-[10px] text-slate-400 font-bold'>
                  Total Minutes
                </p>
              </div>
            </div>
            <input
              type='number'
              value={config.timeLimit}
              onChange={(e) =>
                setConfig({ ...config, timeLimit: Number(e.target.value) })
              }
              className='w-16 p-3 text-center font-black bg-white border-2 border-slate-200 rounded-xl text-sm outline-none focus:border-indigo-500'
            />
          </div>

          {/* Toggle Switches */}
          <div className='grid grid-cols-2 gap-4'>
            {[
              {
                label: 'Randomize Pool',
                key: 'shuffleQuestions',
                icon: <Shuffle size={18} />,
              },
              {
                label: 'Live Leaderboard',
                key: 'showLeaderboard',
                icon: <Trophy size={18} />,
              },
            ].map((item) => (
              <button
                key={item.key}
                onClick={() =>
                  setConfig({
                    ...config,
                    [item.key]: !config[item.key as keyof QuizConfig],
                  })
                }
                className={`p-5 rounded-3xl border-2 transition-all text-left ${config[item.key as keyof QuizConfig] ? 'border-indigo-500 bg-indigo-50' : 'border-slate-100 bg-slate-50/50'}`}
              >
                <div
                  className={`mb-3 ${config[item.key as keyof QuizConfig] ? 'text-indigo-600' : 'text-slate-400'}`}
                >
                  {item.icon}
                </div>
                <p className='text-[10px] font-black uppercase text-slate-800'>
                  {item.label}
                </p>
              </button>
            ))}
          </div>

          {/* Access Code */}
          <div>
            <label className='block text-[10px] font-black uppercase text-slate-400 mb-2 ml-1 tracking-widest'>
              Security Access Code
            </label>
            <input
              placeholder='Leave empty for public'
              value={config.accessCode}
              onChange={(e) =>
                setConfig({ ...config, accessCode: e.target.value })
              }
              className='w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-black text-center text-sm tracking-[0.5em] outline-none focus:border-indigo-500'
            />
          </div>

          <div className='pt-4 space-y-3'>
            <button
              onClick={() => setShowConfirm(true)}
              className='w-full py-4 bg-emerald-600 text-white rounded-2xl font-black uppercase text-[12px] tracking-widest hover:bg-emerald-700 shadow-xl shadow-emerald-100 transition-all flex justify-center items-center gap-3'
            >
              <Save size={18} /> Launch Examination
            </button>
            <button
              onClick={onBack}
              className='w-full py-2 text-slate-400 font-black uppercase text-[10px] flex justify-center items-center gap-2'
            >
              <ArrowLeft size={14} /> Adjust Questions
            </button>
          </div>
        </div>
      </div>

      {/* Confirmation Overlay */}
      {showConfirm && (
        <div className='fixed inset-0 z-100 flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm'>
          <div className='bg-white rounded-3xl max-w-sm w-full p-8 shadow-2xl text-center'>
            <div className='w-20 h-20 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center mx-auto mb-6'>
              <AlertTriangle size={40} />
            </div>
            <h3 className='text-xl font-black text-slate-800 mb-2'>
              Final Confirmation
            </h3>
            <p className='text-slate-500 text-[13px] mb-8'>
              Candidates will be able to access this exam immediately upon
              publishing.
            </p>
            <div className='flex flex-col gap-3'>
              <button
                onClick={onPublish}
                className='w-full py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase text-[11px]'
              >
                Confirm & Publish
              </button>
              <button
                onClick={() => setShowConfirm(false)}
                className='w-full py-4 bg-slate-100 text-slate-500 rounded-2xl font-black uppercase text-[11px]'
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
