// 'use client'
// import { motion } from 'framer-motion'
// import { AlertTriangle } from 'lucide-react'

// interface ExitModalProps {
//   onClose: () => void
//   onReset: () => void
// }

// export const ExitModal = ({ onClose, onReset }: ExitModalProps) => {
//   return (
//     <div className='fixed inset-0 bg-black/60 backdrop-blur-sm z-200 flex items-center justify-center p-4'>
//       <motion.div
//         initial={{ scale: 0.9, opacity: 0 }}
//         animate={{ scale: 1, opacity: 1 }}
//         className='bg-white p-8 rounded-3xl max-w-sm w-full text-center shadow-2xl'
//       >
//         <div className='w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4'>
//           <AlertTriangle size={32} />
//         </div>
//         <h3 className='text-xl font-black mb-2 text-zinc-900 uppercase tracking-tight'>
//           Exit Quiz?
//         </h3>
//         <p className='text-gray-500 text-sm mb-6'>
//           Progress is saved. Choose to exit to the website or restart the setup.
//         </p>
//         <div className='flex flex-col gap-2'>
//           <button
//             onClick={() => (window.location.href = '/')}
//             className='py-3 bg-zinc-900 text-white rounded-xl font-black text-[10px] uppercase hover:bg-black transition-colors'
//           >
//             Back to Website
//           </button>
//           <button
//             onClick={onReset}
//             className='py-3 bg-red-600 text-white rounded-xl font-black text-[10px] uppercase hover:bg-red-700 transition-colors'
//           >
//             New Quiz Setup
//           </button>
//           <button
//             onClick={onClose}
//             className='py-3 bg-gray-100 text-zinc-400 rounded-xl font-black text-[10px] uppercase hover:bg-gray-200 transition-colors'
//           >
//             Cancel
//           </button>
//         </div>
//       </motion.div>
//     </div>
//   )
// }

'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle, Home, RotateCcw, X, StopCircle } from 'lucide-react'

interface ExitModalProps {
  onClose: () => void
  onReset: () => void
}

export const ExitModal = ({ onClose, onReset }: ExitModalProps) => {
  const [countdown, setCountdown] = useState<number | null>(null)
  const [pendingAction, setPendingAction] = useState<'exit' | 'reset' | null>(
    null,
  )
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  const startSequence = (action: 'exit' | 'reset') => {
    setPendingAction(action)
    setCountdown(3)
  }

  const abortSequence = () => {
    if (timerRef.current) clearInterval(timerRef.current)
    setCountdown(null)
    setPendingAction(null)
  }

  useEffect(() => {
    if (countdown !== null && countdown > 0) {
      timerRef.current = setTimeout(() => setCountdown(countdown - 1), 1000)
    } else if (countdown === 0) {
      if (pendingAction === 'exit') window.location.href = '/'
      if (pendingAction === 'reset') onReset()
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [countdown, pendingAction, onReset])

  return (
    <div className='fixed inset-0 bg-zinc-950/60 backdrop-blur-md z-300 flex items-center justify-center p-6'>
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className='bg-white rounded-[2.5rem] max-w-[300px] w-full shadow-2xl border border-zinc-100 overflow-hidden relative'
      >
        <AnimatePresence mode='wait'>
          {countdown !== null ? (
            /* COUNTDOWN STATE */
            <motion.div
              key='counting'
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className='p-8 flex flex-col items-center text-center'
            >
              <div className='relative flex items-center justify-center mb-6'>
                <svg className='w-20 h-20 -rotate-90'>
                  <circle
                    cx='40'
                    cy='40'
                    r='36'
                    stroke='currentColor'
                    strokeWidth='4'
                    fill='transparent'
                    className='text-zinc-100'
                  />
                  <motion.circle
                    cx='40'
                    cy='40'
                    r='36'
                    stroke='currentColor'
                    strokeWidth='4'
                    fill='transparent'
                    strokeDasharray='226.2'
                    initial={{ strokeDashoffset: 0 }}
                    animate={{ strokeDashoffset: 226.2 }}
                    transition={{ duration: 3, ease: 'linear' }}
                    className='text-rose-500'
                  />
                </svg>
                <span className='absolute text-3xl font-black text-zinc-900'>
                  {countdown}
                </span>
              </div>

              <h3 className='text-[10px] font-black uppercase tracking-[0.2em] mb-2 text-zinc-400'>
                {pendingAction === 'reset'
                  ? 'Resetting Session'
                  : 'Exiting Portal'}
              </h3>
              <p className='text-[11px] font-bold text-zinc-500 mb-8 px-4'>
                Are you sure? This action cannot be undone.
              </p>

              <button
                onClick={abortSequence}
                className='w-full py-4 bg-zinc-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-black transition-all active:scale-95'
              >
                <StopCircle size={16} /> Abort Action
              </button>
            </motion.div>
          ) : (
            /* SELECTION STATE */
            <motion.div key='selection' exit={{ opacity: 0 }}>
              <div className='bg-rose-50/50 p-6 flex flex-col items-center text-center border-b border-rose-100/30'>
                <div className='w-12 h-12 bg-white text-rose-500 rounded-2xl flex items-center justify-center shadow-sm mb-3'>
                  <AlertTriangle size={24} />
                </div>
                <h3 className='text-xs font-black text-zinc-900 uppercase tracking-widest'>
                  Safety Confirmation
                </h3>
              </div>

              <div className='p-6'>
                <p className='text-[11px] text-zinc-500 font-medium leading-relaxed text-center mb-6'>
                  Progress is saved, but active sessions require confirmation
                  before termination.
                </p>

                <div className='grid gap-2'>
                  <button
                    onClick={() => startSequence('exit')}
                    className='flex items-center justify-center gap-2 py-3.5 bg-zinc-950 text-white rounded-xl font-black text-[9px] uppercase tracking-widest hover:bg-black transition-all'
                  >
                    <Home size={14} /> Back to Website
                  </button>

                  <div className='grid grid-cols-2 gap-2'>
                    <button
                      onClick={() => startSequence('reset')}
                      className='flex items-center justify-center gap-2 py-3 bg-rose-600 text-white rounded-xl font-black text-[9px] uppercase tracking-tighter hover:bg-rose-700 transition-all'
                    >
                      <RotateCcw size={14} /> New Quiz
                    </button>
                    <button
                      onClick={onClose}
                      className='flex items-center justify-center gap-2 py-3 bg-zinc-100 text-zinc-400 rounded-xl font-black text-[9px] uppercase tracking-tighter hover:bg-zinc-200 hover:text-zinc-600 transition-all'
                    >
                      <X size={14} /> Cancel
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}