'use client'

import React from 'react'
import {
  TrendingUp,
  Target,
  Users,
  BrainCircuit,
  BarChart,
  PieChart,
  ArrowUpRight,
  ArrowDownRight,
  Download,
  Calendar,
} from 'lucide-react'
import { motion } from 'framer-motion'

export default function Analytics() {
  return (
    <div className='space-y-8 animate-in fade-in duration-700 pb-20'>
      {/* Header & Export */}
      <div className='flex flex-col md:flex-row md:items-center justify-between gap-4'>
        <div>
          <h1 className='text-2xl font-black text-slate-900'>
            Intelligence Engine
          </h1>
          <p className='text-sm text-[#FCB900] font-medium'>
            Data-driven insights into student performance
          </p>
        </div>
        <div className='flex items-center gap-3'>
          <button className='flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-black uppercase text-slate-600 hover:bg-slate-50 transition-all'>
            <Calendar size={14} /> Last 30 Days
          </button>
          <button className='flex items-center gap-2 px-4 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-black uppercase shadow-lg shadow-slate-200 hover:bg-slate-800 transition-all'>
            <Download size={14} /> Export CSV
          </button>
        </div>
      </div>

      {/* Primary Metrics */}
      <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
        <MetricCard
          title='Avg. JAMB Score'
          value='242'
          sub='Based on 4.2k mocks'
          trend='+14 pts'
          trendUp={true}
          icon={Target}
          color='text-blue-600'
          bg='bg-blue-50'
        />
        <MetricCard
          title='Completion Rate'
          value='88.4%'
          sub='Started vs. Finished'
          trend='+2.1%'
          trendUp={true}
          icon={TrendingUp}
          color='text-emerald-600'
          bg='bg-emerald-50'
        />
        <MetricCard
          title='Avg. Time/Question'
          value='42s'
          sub='Target: 38s'
          trend='-4s'
          trendUp={false}
          icon={BrainCircuit}
          color='text-purple-600'
          bg='bg-purple-50'
        />
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
        {/* Score Distribution Chart Placeholder */}
        <div className='bg-white rounded-[2.5rem] border border-slate-200 p-8 shadow-sm'>
          <div className='flex items-center justify-between mb-8'>
            <h3 className='font-black text-slate-900 uppercase tracking-widest text-[10px]'>
              Score Distribution
            </h3>
            <div className='flex gap-2'>
              <div className='flex items-center gap-1.5'>
                <div className='w-2 h-2 rounded-full bg-blue-500' />{' '}
                <span className='text-[10px] font-bold text-slate-400 uppercase'>
                  Premium
                </span>
              </div>
              <div className='flex items-center gap-1.5'>
                <div className='w-2 h-2 rounded-full bg-slate-200' />{' '}
                <span className='text-[10px] font-bold text-slate-400 uppercase'>
                  Free
                </span>
              </div>
            </div>
          </div>

          {/* Visual Placeholder for a Bar Chart */}
          <div className='h-64 flex items-end justify-between gap-2 px-4'>
            {[40, 65, 80, 55, 95, 70, 85, 60].map((h, i) => (
              <div key={i} className='flex-1 flex flex-col items-center gap-2'>
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${h}%` }}
                  transition={{ delay: i * 0.05, duration: 1 }}
                  className={`w-full max-w-[30px] rounded-t-lg ${i === 4 ? 'bg-blue-600' : 'bg-slate-200'}`}
                />
                <span className='text-[8px] font-black text-slate-500'>
                  {200 + i * 20}
                </span>
              </div>
            ))}
          </div>
          <p className='text-center mt-6 text-[10px] font-black text-slate-500 uppercase tracking-widest'>
            Calculated across all subjects
          </p>
        </div>

        {/* Top & Bottom Subjects */}
        <div className='bg-white rounded-[2.5rem] border border-slate-200 p-8 shadow-sm'>
          <h3 className='font-black text-slate-900 uppercase tracking-widest text-[10px] mb-8'>
            Subject Proficiency
          </h3>
          <div className='space-y-6'>
            <SubjectRank name='Physics' score={82} color='bg-emerald-500' />
            <SubjectRank
              name='English Language'
              score={74}
              color='bg-blue-500'
            />
            <SubjectRank name='Biology' score={51} color='bg-amber-500' />
            <SubjectRank name='Chemistry' score={28} color='bg-rose-500' />
          </div>

          <div className='mt-8 p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-start gap-4'>
            <div className='p-2 bg-rose-500 text-white rounded-xl'>
              <BarChart size={16} />
            </div>
            <div>
              <p className='text-[10px] font-black text-rose-900 uppercase'>
                AI Suggestion
              </p>
              <p className='text-xs font-bold text-slate-600 leading-tight'>
                Increase question frequency for Chemistry Topics: 'Redox
                Reactions'. Avg. score is dropping below platform baseline.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function MetricCard({
  title,
  value,
  sub,
  trend,
  trendUp,
  icon: Icon,
  color,
  bg,
}: any) {
  return (
    <div className='bg-white p-6 rounded-4xl border border-slate-200 shadow-sm flex flex-col gap-4'>
      <div className='flex justify-between items-start'>
        <div className={`p-3 rounded-2xl ${bg} ${color}`}>
          <Icon size={20} />
        </div>
        <div
          className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-black ${trendUp ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}
        >
          {trendUp ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}{' '}
          {trend}
        </div>
      </div>
      <div>
        <p className='text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1'>
          {title}
        </p>
        <div className='flex items-baseline gap-2'>
          <span className='text-3xl font-black text-slate-900'>{value}</span>
          <span className='text-[10px] font-bold text-slate-400'>{sub}</span>
        </div>
      </div>
    </div>
  )
}

function SubjectRank({ name, score, color }: any) {
  return (
    <div>
      <div className='flex justify-between items-end mb-2'>
        <span className='text-xs font-black text-slate-700'>{name}</span>
        <span className='text-[10px] font-black text-slate-400'>
          {score}% Mastery
        </span>
      </div>
      <div className='h-1.5 w-full bg-slate-100 rounded-full overflow-hidden'>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className={`h-full ${color}`}
        />
      </div>
    </div>
  )
}
