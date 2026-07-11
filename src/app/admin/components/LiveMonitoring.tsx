'use client'

import React, { useState, useEffect } from 'react'
import {
  Activity,
  Eye,
  AlertTriangle,
  Zap,
  ShieldAlert,
  Search,
  Timer,
  MoreHorizontal,
  Terminal,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export default function LiveMonitoring() {
  const [pulse, setPulse] = useState(true)

  useEffect(() => {
    const interval = setInterval(() => setPulse((p) => !p), 2000)
    return () => clearInterval(interval)
  }, [])

  const liveUsers = [
    {
      id: '1',
      name: 'Kelechi Iheanacho',
      exam: 'MOCK #4',
      progress: 85,
      status: 'Stable',
      alerts: 0,
      time: '14:20',
    },
    {
      id: '2',
      name: 'Sarah Jakes',
      exam: 'Post-UTME',
      progress: 42,
      status: 'Warning',
      alerts: 3,
      time: '14:45',
    },
    {
      id: '3',
      name: 'David Hundeyin',
      exam: 'MOCK #4',
      progress: 12,
      status: 'Stable',
      alerts: 0,
      time: '15:10',
    },
    {
      id: '4',
      name: 'Yinka Shonibare',
      exam: 'Biology',
      progress: 98,
      status: 'Critical',
      alerts: 12,
      time: '14:05',
    },
  ]

  return (
    <div className='max-w-6xl mx-auto space-y-4 animate-in fade-in duration-500 pb-10 px-4'>
      {/* High-Density Stats Bar */}
      <div className='grid grid-cols-1 md:grid-cols-4 gap-3'>
        <div className='md:col-span-3 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between'>
          <div className='flex items-center gap-4'>
            <div className='relative'>
              <Activity size={32} className='text-blue-600' />
              <div
                className={`absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white ${pulse ? 'animate-ping' : ''}`}
              />
            </div>
            <div>
              <h1 className='text-xl font-black text-slate-900 leading-none'>
                1,204{' '}
                <span className='text-blue-600 text-sm font-bold uppercase ml-1'>
                  Live
                </span>
              </h1>
              <p className='text-[10px] text-[#FCB900] font-bold uppercase tracking-tight mt-1'>
                42 Concurrent Sessions Active
              </p>
            </div>
          </div>
          <div className='flex gap-4 border-l border-slate-100 pl-6'>
            <StatMini label='Uptime' value='99.9%' color='text-emerald-500' />
            <StatMini label='Avg Latency' value='24ms' color='text-blue-500' />
          </div>
        </div>

        <div className='bg-slate-900 p-5 rounded-2xl text-white flex flex-col justify-center'>
          <div className='flex justify-between items-center mb-2'>
            <span className='text-[9px] font-black text-blue-400 uppercase tracking-widest'>
              Load
            </span>
            <span className='text-xs font-black'>12%</span>
          </div>
          <div className='h-1 w-full bg-slate-800 rounded-full overflow-hidden'>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: '12%' }}
              className='h-full bg-blue-500'
            />
          </div>
        </div>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-12 gap-4'>
        {/* Session Monitor Feed */}
        <div className='lg:col-span-8 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden'>
          <div className='px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/30'>
            <h3 className='font-black text-slate-900 uppercase text-[10px] tracking-widest flex items-center gap-2'>
              <Terminal size={14} className='text-blue-600' /> Session Watch
            </h3>
            <div className='flex items-center gap-2'>
              <div className='relative'>
                <Search
                  size={14}
                  className='absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400'
                />
                <input
                  placeholder='Filter...'
                  className='pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-[10px] outline-none focus:ring-2 focus:ring-blue-500/10 w-32'
                />
              </div>
            </div>
          </div>

          <div className='divide-y divide-slate-50'>
            {liveUsers.map((user) => (
              <div
                key={user.id}
                className='p-4 flex items-center justify-between hover:bg-blue-50/20 transition-colors group'
              >
                <div className='flex items-center gap-3'>
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-black text-white ${
                      user.status === 'Critical'
                        ? 'bg-rose-500'
                        : user.status === 'Warning'
                          ? 'bg-amber-500'
                          : 'bg-blue-600'
                    }`}
                  >
                    {user.name
                      .split(' ')
                      .map((n) => n[0])
                      .join('')}
                  </div>
                  <div>
                    <p className='font-bold text-slate-900 text-xs'>
                      {user.name}
                    </p>
                    <p className='text-[9px] text-slate-400 font-medium uppercase'>
                      {user.exam} • {user.time}
                    </p>
                  </div>
                </div>

                <div className='flex items-center gap-6'>
                  <div className='hidden sm:block w-20'>
                    <div className='h-1 w-full bg-slate-100 rounded-full overflow-hidden'>
                      <div
                        className='h-full bg-blue-600'
                        style={{ width: `${user.progress}%` }}
                      />
                    </div>
                  </div>
                  <div className='flex items-center gap-2'>
                    {user.alerts > 0 && (
                      <span className='flex items-center gap-1 px-2 py-0.5 bg-rose-50 text-rose-600 rounded text-[9px] font-black animate-pulse'>
                        <ShieldAlert size={10} /> {user.alerts}
                      </span>
                    )}
                    <button className='p-2 text-slate-300 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all'>
                      <Eye size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Security & Insights Sidebar */}
        <div className='lg:col-span-4 space-y-4'>
          <div className='bg-rose-50/50 border border-rose-100 rounded-2xl p-5'>
            <div className='flex items-center gap-2 mb-4 text-rose-600'>
              <AlertTriangle size={16} />
              <h3 className='font-black uppercase text-[10px] tracking-wider'>
                Threat Intel
              </h3>
            </div>
            <div className='space-y-2'>
              <div className='p-3 bg-white border border-rose-100 rounded-xl shadow-sm'>
                <div className='flex justify-between items-start mb-1'>
                  <p className='text-[10px] font-black text-rose-900'>
                    Tab Focus Lost
                  </p>
                  <span className='text-[8px] font-bold text-rose-400'>
                    JUST NOW
                  </span>
                </div>
                <p className='text-[10px] text-rose-700 leading-tight mb-2'>
                  Student #4902 triggered 4 integrity bypass attempts.
                </p>
                <button className='w-full py-1.5 bg-rose-600 text-white rounded-md text-[9px] font-black uppercase hover:bg-rose-700 transition-colors'>
                  Terminate
                </button>
              </div>
            </div>
          </div>

          <div className='bg-white border border-slate-200 rounded-2xl p-5 shadow-sm'>
            <h3 className='font-black text-slate-400 uppercase tracking-widest text-[9px] mb-4'>
              Traffic by Subject
            </h3>
            <div className='space-y-3'>
              <SubjectProgress
                label='Mathematics'
                count={420}
                percent={70}
                color='bg-blue-500'
              />
              <SubjectProgress
                label='English'
                count={182}
                percent={35}
                color='bg-blue-300'
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function StatMini({ label, value, color }: any) {
  return (
    <div className='text-right'>
      <p className='text-[8px] font-black text-slate-400 uppercase tracking-tighter leading-none mb-1'>
        {label}
      </p>
      <p className={`text-sm font-black ${color} leading-none`}>{value}</p>
    </div>
  )
}

function SubjectProgress({ label, count, percent, color }: any) {
  return (
    <div>
      <div className='flex justify-between items-center text-[10px] mb-1.5'>
        <span className='font-bold text-slate-700'>{label}</span>
        <span className='font-black text-slate-900'>{count}</span>
      </div>
      <div className='h-1 w-full bg-slate-50 rounded-full'>
        <div
          className={`h-full ${color} rounded-full`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  )
}
