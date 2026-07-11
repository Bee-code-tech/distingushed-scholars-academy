'use client'

import React, { useState } from 'react'
import {
  Trophy,
  Medal,
  Search,
  ShieldCheck,
  RotateCcw,
  Eye,
  Crown,
  Filter,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export default function Leaderboard() {
  const [view, setView] = useState<'global' | 'pending'>('global')

  const topRankers = [
    {
      rank: 1,
      name: 'Tobi Adeyemi',
      score: 342,
      subject: 'Engineering',
      accuracy: '94%',
      time: '1h 12m',
      trend: 'up',
    },
    {
      rank: 2,
      name: 'Fatima Musa',
      score: 338,
      subject: 'Medicine',
      accuracy: '91%',
      time: '1h 24m',
      trend: 'stable',
    },
    {
      rank: 3,
      name: 'Uche Okafor',
      score: 335,
      subject: 'Law Mix',
      accuracy: '89%',
      time: '1h 18m',
      trend: 'down',
    },
  ]

  return (
    <div className='max-w-6xl mx-auto space-y-6 animate-in fade-in duration-500 pb-10 px-4'>
      {/* Header & Controls */}
      <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4'>
        <div>
          <h1 className='text-2xl font-black text-slate-900 tracking-tight'>
            Hall of Fame
          </h1>
          <p className='text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1'>
            Global Rankings & Performance Verification
          </p>
        </div>

        <div className='flex bg-slate-100 p-1 rounded-xl border border-slate-200 w-full sm:w-auto'>
          {(['global', 'pending'] as const).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-[10px] font-black uppercase transition-all ${
                view === v
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {v === 'global' ? <Crown size={12} /> : <ShieldCheck size={12} />}
              {v === 'global' ? 'Global' : 'Review'}
            </button>
          ))}
        </div>
      </div>

      {/* Podium Grid */}
      <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
        {topRankers.map((student, i) => (
          <motion.div
            key={student.rank}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className={`relative p-5 rounded-2xl border transition-all hover:shadow-md ${
              i === 0
                ? 'bg-slate-900 border-slate-800 text-white md:scale-105 z-10'
                : 'bg-white border-slate-200 text-slate-900'
            }`}
          >
            <div className='flex justify-between items-start mb-4'>
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center ${i === 0 ? 'bg-blue-600' : 'bg-slate-50'}`}
              >
                {i === 0 ? (
                  <Trophy size={20} className='text-white' />
                ) : (
                  <Medal size={20} className='text-blue-500' />
                )}
              </div>
              <div className='text-right'>
                <p className='text-[8px] font-black uppercase opacity-50 tracking-tighter'>
                  Score Index
                </p>
                <p className='text-xl font-black'>{student.score}</p>
              </div>
            </div>

            <div className='mb-4'>
              <p className='font-black text-sm flex items-center gap-2 truncate'>
                {student.name}
                {i === 0 && (
                  <CheckCircle2 size={14} className='text-blue-400' />
                )}
              </p>
              <p
                className={`text-[10px] font-bold uppercase tracking-tight ${i === 0 ? 'text-slate-400' : 'text-slate-500'}`}
              >
                {student.subject}
              </p>
            </div>

            <div
              className={`flex items-center justify-between pt-3 border-t ${i === 0 ? 'border-slate-800' : 'border-slate-100'}`}
            >
              <div className='text-center'>
                <p className='text-[8px] font-bold opacity-50 uppercase'>
                  Accuracy
                </p>
                <p className='text-xs font-black'>{student.accuracy}</p>
              </div>
              <div className='text-center'>
                <p className='text-[8px] font-bold opacity-50 uppercase'>
                  Time
                </p>
                <p className='text-xs font-black'>{student.time}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Main Ranking Table */}
      <div className='bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden'>
        <div className='px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/30'>
          <h3 className='font-black text-slate-900 uppercase tracking-widest text-[10px]'>
            Candidate Performance Log
          </h3>
          <div className='flex gap-2'>
            <div className='relative'>
              <Search
                className='absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400'
                size={12}
              />
              <input
                type='text'
                placeholder='Find candidate...'
                className='pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-[10px] font-bold outline-none focus:ring-2 focus:ring-blue-500/10 w-40'
              />
            </div>
            <button className='p-1.5 bg-white border border-slate-200 text-slate-400 rounded-lg hover:text-blue-600 transition-all'>
              <Filter size={14} />
            </button>
          </div>
        </div>

        <div className='overflow-x-auto'>
          <table className='w-full text-left'>
            <thead>
              <tr className='bg-slate-50/50'>
                <th className='px-6 py-3 text-[9px] font-black uppercase text-slate-400'>
                  Rank
                </th>
                <th className='px-6 py-3 text-[9px] font-black uppercase text-slate-400'>
                  Candidate
                </th>
                <th className='px-6 py-3 text-[9px] font-black uppercase text-slate-400'>
                  Accuracy
                </th>
                <th className='px-6 py-3 text-[9px] font-black uppercase text-slate-400'>
                  Time
                </th>
                <th className='px-6 py-3 text-[9px] font-black uppercase text-slate-400'>
                  Status
                </th>
                <th className='px-6 py-3 text-[9px] font-black uppercase text-slate-400 text-right'>
                  Review
                </th>
              </tr>
            </thead>
            <tbody className='divide-y divide-slate-50'>
              {[4, 5, 6, 7].map((rank) => (
                <tr
                  key={rank}
                  className='group hover:bg-blue-50/20 transition-colors'
                >
                  <td className='px-6 py-3 text-xs font-black text-slate-400 italic'>
                    #{rank}
                  </td>
                  <td className='px-6 py-3'>
                    <div className='flex items-center gap-3'>
                      <div className='w-7 h-7 rounded bg-slate-100 flex items-center justify-center text-[9px] font-black text-slate-500'>
                        S{rank}
                      </div>
                      <div>
                        <p className='font-bold text-slate-800 text-xs'>
                          Adekule Balogun
                        </p>
                        <p className='text-[9px] text-slate-400 font-bold uppercase'>
                          Engineering Mix
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className='px-6 py-3 text-xs font-black text-slate-700'>
                    88.4%
                  </td>
                  <td className='px-6 py-3 text-slate-500 text-[10px] font-bold'>
                    1h 05m
                  </td>
                  <td className='px-6 py-3'>
                    <div className='flex items-center gap-1.5 px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded-md border border-emerald-100 w-fit'>
                      <div className='w-1 h-1 rounded-full bg-emerald-500' />
                      <span className='text-[9px] font-black uppercase tracking-tight'>
                        Verified
                      </span>
                    </div>
                  </td>
                  <td className='px-6 py-3 text-right'>
                    <div className='flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity'>
                      <button className='p-1.5 text-slate-400 hover:text-blue-600 hover:bg-white rounded-md transition-all shadow-sm'>
                        <Eye size={14} />
                      </button>
                      <button className='p-1.5 text-slate-400 hover:text-rose-600 hover:bg-white rounded-md transition-all shadow-sm'>
                        <RotateCcw size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
