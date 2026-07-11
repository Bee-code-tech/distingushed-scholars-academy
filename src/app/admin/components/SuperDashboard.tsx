'use client'

import React from 'react'
import {
  Users,
  Zap,
  Trophy,
  TrendingUp,
  BookOpen,
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
  ChevronRight,
  Target,
  Activity,
  ShieldCheck,
} from 'lucide-react'
import { motion } from 'framer-motion'

export default function SuperDashboard() {
  const stats = [
    {
      label: 'Total Scholars',
      value: '12,840',
      change: '+12%',
      trending: 'up',
      icon: Users,
      color: 'text-[#002EFF]',
      bg: 'bg-blue-50',
    },
    {
      label: 'Active Today',
      value: '1,204',
      change: '+5%',
      trending: 'up',
      icon: Zap,
      color: 'text-[#FCB900]',
      bg: 'bg-yellow-50',
    },
    {
      label: 'Avg. Score',
      value: '64.2%',
      change: '-2%',
      trending: 'down',
      icon: Target,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
    },
    {
      label: 'Tests Taken',
      value: '45,902',
      change: '+18%',
      trending: 'up',
      icon: BookOpen,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
    },
  ]

  return (
    <div className='w-full max-w-350 mx-auto space-y-4 pb-10 px-4'>
      {/* --- REFINED HEADER --- */}
      <header className='flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4 pt-2'>
        <div className='flex items-center gap-3'>
          <div className='bg-[#002EFF] p-1.5 rounded-lg text-white shadow-lg shadow-blue-200'>
            <ShieldCheck size={18} />
          </div>
          <div>
            <h1 className='text-base font-black text-slate-900 tracking-tight leading-none'>
              Admin <span className='text-[#002EFF]'>CORE</span>
            </h1>
            <p className='text-slate-400 text-[9px] font-bold uppercase tracking-widest mt-1'>
              Operational Intelligence Center
            </p>
          </div>
        </div>

        <div className='flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-full'>
          <div className='w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse' />
          <span className='text-[10px] font-bold text-slate-600 uppercase tracking-tighter'>
            Live Node: Active
          </span>
        </div>
      </header>

      {/* --- KPI GRID: DENSE SCALE --- */}
      <div className='grid grid-cols-2 lg:grid-cols-4 gap-3'>
        {stats.map((stat, i) => (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            key={stat.label}
            className='bg-white p-4 rounded-2xl border border-slate-200 shadow-[0_1px_2px_rgba(0,0,0,0.02)] hover:border-[#002EFF]/30 transition-all'
          >
            <div className='flex justify-between items-center mb-2'>
              <div className={`p-2 rounded-xl ${stat.bg} ${stat.color}`}>
                <stat.icon size={16} />
              </div>
              <div
                className={`px-1.5 py-0.5 rounded text-[9px] font-bold flex items-center gap-0.5 ${
                  stat.trending === 'up' ? 'text-emerald-600' : 'text-rose-600'
                }`}
              >
                {stat.change}
                {stat.trending === 'up' ? (
                  <ArrowUpRight size={10} />
                ) : (
                  <ArrowDownRight size={10} />
                )}
              </div>
            </div>
            <p className='text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-0.5'>
              {stat.label}
            </p>
            <p className='text-lg font-black text-slate-900 tracking-tight'>
              {stat.value}
            </p>
          </motion.div>
        ))}
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-4'>
        {/* INTERVENTION: FOCUSED MODERATE SIZE */}
        <div className='lg:col-span-2 bg-white border border-slate-200 rounded-3xl p-6 relative overflow-hidden'>
          <div className='flex items-center gap-2 mb-6 border-b border-slate-50 pb-4'>
            <AlertCircle size={14} className='text-rose-500' />
            <h3 className='font-bold text-slate-800 text-[10px] uppercase tracking-widest'>
              System Diagnostics
            </h3>
          </div>

          <div className='flex flex-col md:flex-row md:items-center justify-between gap-6'>
            <div className='space-y-4'>
              <p className='text-slate-600 text-sm leading-relaxed max-w-md'>
                Detected{' '}
                <span className='font-black text-rose-600 bg-rose-50 px-1 rounded'>
                  72% loss velocity
                </span>{' '}
                in
                <span className='ml-1 font-black text-slate-900 underline decoration-2 decoration-[#FCB900] underline-offset-4'>
                  Organic Chemistry Core
                </span>
              </p>
              <div className='flex gap-6'>
                <div>
                  <p className='text-[8px] text-slate-400 font-bold uppercase'>
                    Mean Solve
                  </p>
                  <p className='text-base font-black text-slate-900'>12.4s</p>
                </div>
                <div>
                  <p className='text-[8px] text-slate-400 font-bold uppercase'>
                    Precision
                  </p>
                  <p className='text-base font-black text-rose-500'>14.2%</p>
                </div>
              </div>
            </div>
            <button className='shrink-0 h-fit px-5 py-2.5 bg-slate-900 text-[#FCB900] rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-[#002EFF] hover:text-white transition-all flex items-center gap-2 shadow-lg shadow-slate-200'>
              Intervene <ChevronRight size={14} />
            </button>
          </div>
        </div>

        {/* PERFORMANCE: DARK TERMINAL STYLE */}
        <div className='bg-slate-900 rounded-3xl p-6 text-white'>
          <h3 className='text-[9px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-6'>
            Live Competency
          </h3>
          <div className='space-y-5'>
            {[
              { name: 'Physics', score: 88, color: 'bg-[#FCB900]' },
              { name: 'Government', score: 72, color: 'bg-[#002EFF]' },
              { name: 'Biology', score: 45, color: 'bg-rose-500' },
            ].map((subject) => (
              <div key={subject.name}>
                <div className='flex justify-between items-center mb-1.5'>
                  <span className='text-[10px] font-bold tracking-tight text-slate-400'>
                    {subject.name}
                  </span>
                  <span className='text-[10px] font-black text-white'>
                    {subject.score}%
                  </span>
                </div>
                <div className='h-1 w-full bg-white/10 rounded-full overflow-hidden'>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${subject.score}%` }}
                    className={`h-full ${subject.color}`}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* --- FOOTER ACTION STRIP --- */}
      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
        <div className='bg-[#002EFF] rounded-2xl p-4 text-white flex items-center justify-between shadow-lg shadow-blue-100'>
          <div>
            <p className='text-[8px] font-bold text-blue-200 uppercase tracking-widest'>
              Net Revenue (MTD)
            </p>
            <p className='text-xl font-black tracking-tighter'>₦1,240,500.00</p>
          </div>
          <div className='h-8 w-8 bg-white/10 rounded-lg flex items-center justify-center'>
            <TrendingUp size={16} />
          </div>
        </div>

        <div className='bg-white border border-slate-200 rounded-2xl p-4 flex items-center gap-4'>
          <div className='w-10 h-10 bg-yellow-50 text-[#FCB900] rounded-xl flex items-center justify-center border border-yellow-100 shrink-0'>
            <Trophy size={20} />
          </div>
          <div>
            <p className='text-[9px] font-black text-slate-900 uppercase tracking-widest leading-none'>
              Platform Index
            </p>
            <p className='text-[11px] text-slate-500 font-bold mt-1'>
              Predicted JAMB Mean:{' '}
              <span className='text-[#002EFF] font-black text-sm'>268.4</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
