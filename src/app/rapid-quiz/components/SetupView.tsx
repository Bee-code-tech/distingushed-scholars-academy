'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  Home,
  Globe,
  GraduationCap,
  ChevronDown,
  Zap,
  Target,
  Save,
  CheckCircle2,
  RotateCcw,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface SetupProps {
  selectedSubs: string[]
  setSelectedSubs: any
  qPerSubject: number
  setQPerSubject: (val: number) => void
  totalMinutes: number
  setTotalMinutes: (val: number) => void
  isStudyMode: boolean
  setIsStudyMode: (val: boolean) => void
  handleStart: () => void
}

export const SetupView = ({
  selectedSubs,
  setSelectedSubs,
  qPerSubject,
  setQPerSubject,
  totalMinutes,
  setTotalMinutes,
  isStudyMode,
  setIsStudyMode,
  handleStart,
}: SetupProps) => {
  const [showSavedToast, setShowSavedToast] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('simulator_prefs')
    if (saved) {
      const {
        selectedSubs: s,
        qPerSubject: q,
        totalMinutes: t,
        isStudyMode: m,
      } = JSON.parse(saved)
      setSelectedSubs(s || [])
      setQPerSubject(q || 10)
      setTotalMinutes(t || 15)
      setIsStudyMode(m || false)
    }
  }, [setSelectedSubs, setQPerSubject, setTotalMinutes, setIsStudyMode])

  const savePreference = () => {
    localStorage.setItem(
      'simulator_prefs',
      JSON.stringify({ selectedSubs, qPerSubject, totalMinutes, isStudyMode }),
    )
    setShowSavedToast(true)
    setTimeout(() => setShowSavedToast(false), 2000)
  }

  return (
    <div className='min-h-[90vh] flex flex-col items-center justify-center p-4 selection:bg-blue-100 font-sans'>
      {/* Lean Nav */}
      <nav className='mb-4 flex items-center gap-1 bg-white/70 p-1 rounded-full border border-zinc-200/50 shadow-sm backdrop-blur-md'>
        <NavLink
          href='/dashboard'
          icon={<Home size={11} />}
          label='Dashboard'
          color='text-blue-600'
        />
        <div className='w-px h-3 bg-zinc-200 mx-0.5' />
        <NavLink
          href='/'
          icon={<Globe size={11} />}
          label='Main Website'
          color='text-zinc-400'
        />
      </nav>

      <div className='bg-white rounded-3xl shadow-[0_15px_50px_-12px_rgba(0,46,255,0.1)] max-w-[340px] w-full border border-zinc-100 relative overflow-hidden'>
        {/* Status indicator */}
        <div className='absolute top-0 right-0 bg-zinc-950 text-[6px] font-black uppercase tracking-[0.2em] text-white px-3 py-1.5 rounded-bl-xl flex items-center gap-1.5'>
          <span className='w-1 h-1 bg-blue-500 rounded-full animate-pulse' />
          PRO MODULE
        </div>

        <div className='p-6'>
          <header className='flex flex-col items-center mb-6'>
            <div className='w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-2 shadow-inner'>
              <Target size={20} />
            </div>
            <h2 className='text-lg font-black text-zinc-900 uppercase tracking-tighter'>
              Quiz360<span className='text-blue-600'>Pro</span>
            </h2>
          </header>

          <div className='space-y-5'>
            {/* Subject Matrix */}
            <section>
              <div className='flex justify-between items-end mb-2 px-1'>
                <h3 className='text-[8px] font-black text-zinc-400 uppercase tracking-widest'>
                  Track
                </h3>
                <button
                  onClick={() => setSelectedSubs([])}
                  className='text-[8px] font-black text-zinc-300 hover:text-red-500 transition-colors flex items-center gap-1 uppercase'
                >
                  <RotateCcw size={9} /> Reset
                </button>
              </div>
              <div className='flex flex-wrap gap-1'>
                {['ENG', 'MATH', 'PHY', 'CHEM', 'BIO'].map((s) => (
                  <button
                    key={s}
                    onClick={() =>
                      setSelectedSubs((p: string[]) =>
                        p.includes(s) ? p.filter((x) => x !== s) : [...p, s],
                      )
                    }
                    className={`flex-1 min-w-[50px] py-1.5 rounded-lg text-[9px] font-black transition-all active:scale-95 border ${
                      selectedSubs.includes(s)
                        ? 'bg-blue-600 border-blue-600 text-white shadow-sm'
                        : 'bg-zinc-50 border-zinc-100 text-zinc-400 hover:bg-zinc-100'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </section>

            <div className='grid grid-cols-2 gap-2.5'>
              <ConfigSelect
                label='Qty'
                value={qPerSubject}
                onChange={setQPerSubject}
                options={[5, 10, 20, 40, 60]}
                suffix='Qs'
              />
              <ConfigSelect
                label='Time'
                value={totalMinutes}
                onChange={setTotalMinutes}
                options={[30, 60, 90, 120]}
                suffix='Min'
              />
            </div>

            {/* Toggle */}
            <button
              onClick={() => setIsStudyMode(!isStudyMode)}
              className={`w-full p-2.5 rounded-xl border flex items-center justify-between transition-all ${
                isStudyMode
                  ? 'bg-emerald-50/50 border-emerald-500/20'
                  : 'bg-zinc-50 border-transparent hover:bg-zinc-100'
              }`}
            >
              <div className='flex items-center gap-2.5'>
                <div
                  className={`p-1.5 rounded-lg ${isStudyMode ? 'bg-emerald-500 text-white' : 'bg-white text-zinc-300 shadow-sm'}`}
                >
                  <GraduationCap size={14} />
                </div>
                <div className='text-left leading-tight'>
                  <p
                    className={`font-black text-[8px] uppercase tracking-wide ${isStudyMode ? 'text-emerald-700' : 'text-zinc-500'}`}
                  >
                    Study Assistant
                  </p>
                  <p className='text-[6px] text-zinc-400 font-bold uppercase'>
                    Instant feedback
                  </p>
                </div>
              </div>
              <div
                className={`w-7 h-4 rounded-full relative transition-colors ${isStudyMode ? 'bg-emerald-500' : 'bg-zinc-300'}`}
              >
                <motion.div
                  animate={{ x: isStudyMode ? 14 : 2 }}
                  className='absolute top-0.5 w-3 h-3 bg-white rounded-full shadow-sm'
                />
              </div>
            </button>
          </div>

          <footer className='mt-6 space-y-3'>
            <button
              onClick={handleStart}
              disabled={selectedSubs.length === 0}
              className='w-full py-3.5 bg-[#FCB900] hover:bg-[#FFC800] text-zinc-950 font-black rounded-xl shadow-md disabled:opacity-20 transition-all active:scale-[0.98] text-[9px] uppercase tracking-[0.15em] flex items-center justify-center gap-2'
            >
              Start Simulator <Zap size={11} className='fill-current' />
            </button>

            <button
              onClick={savePreference}
              className='w-full flex items-center justify-center gap-2 text-[7px] font-black text-zinc-400 uppercase tracking-widest hover:text-blue-600 transition-colors'
            >
              <AnimatePresence mode='wait'>
                {showSavedToast ? (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className='text-emerald-500 flex items-center gap-1'
                  >
                    <CheckCircle2 size={9} /> Sync complete
                  </motion.span>
                ) : (
                  <span className='flex items-center gap-1.5'>
                    <Save size={9} /> Sync Prefs
                  </span>
                )}
              </AnimatePresence>
            </button>
          </footer>
        </div>
      </div>
    </div>
  )
}

const NavLink = ({ href, icon, label, color }: any) => (
  <Link
    href={href}
    className={`flex items-center gap-1 px-2.5 py-1 font-black uppercase text-[8px] tracking-tighter transition-opacity hover:opacity-70 ${color}`}
  >
    {icon} {label}
  </Link>
)

const ConfigSelect = ({ label, value, onChange, options, suffix }: any) => (
  <div className='space-y-1'>
    <label className='text-[7px] font-black text-zinc-400 uppercase tracking-widest ml-1'>
      {label}
    </label>
    <div className='relative'>
      <select
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className='w-full p-2.5 bg-zinc-50 border border-zinc-100 rounded-lg text-[9px] font-black outline-none appearance-none cursor-pointer focus:bg-white transition-all'
      >
        {options.map((n: number) => (
          <option key={n} value={n}>
            {n} {suffix}
          </option>
        ))}
      </select>
      <ChevronDown
        size={9}
        className='absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none'
      />
    </div>
  </div>
)