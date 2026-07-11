'use client'

import { useState } from 'react'
import {
  History,
  TrendingUp,
  Search,
  Filter,
  ChevronRight,
  Clock,
  BookOpen,
  ArrowUpRight,
  MoreHorizontal,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'

export default function QuizHistoryView() {
  const [searchTerm, setSearchTerm] = useState('')

  const history = [
    {
      id: 1,
      name: 'Mathematics Mid-Term',
      score: 85,
      date: '2024-03-15',
      time: '45m',
      subject: 'Math',
      status: 'Passed',
    },
    {
      id: 2,
      name: 'Physics Simulation',
      score: 42,
      date: '2024-03-12',
      time: '60m',
      subject: 'Physics',
      status: 'Review',
    },
    {
      id: 3,
      name: 'Chemistry 360',
      score: 94,
      date: '2024-03-10',
      time: '30m',
      subject: 'Chemistry',
      status: 'Passed',
    },
  ]

  return (
    <div className='max-w-5xl mx-auto space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-700'>
      {/* --- PRO TOP SECTION: TREND & QUICK STATS --- */}
      <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
        <div className='md:col-span-2 bg-[#002EFF] rounded-4xl p-5 text-white flex justify-between items-center shadow-lg relative overflow-hidden'>
          <div className='z-10'>
            <div className='flex items-center gap-2 mb-1'>
              <TrendingUp size={16} className='text-[#FCB900]' />
              <span className='text-[10px] font-black uppercase tracking-widest text-blue-200'>
                Performance Trend
              </span>
            </div>
            <h3 className='text-xl font-black italic uppercase  tracking-tighter'>
              +12.4%{' '}
              <span className='text-xs not-italic font-medium text-blue-100 opacity-80 ml-1'>
                vs last month
              </span>
            </h3>
          </div>

          <div className='flex gap-2 z-10 items-end h-12'>
            {[40, 70, 45, 90, 65, 85].map((h, i) => (
              <div
                key={i}
                className={`w-2 rounded-full bg-white/${i === 5 ? '100' : '20'} transition-all`}
                style={{ height: `${h}%` }}
              />
            ))}
          </div>
          <div className='absolute -right-4 -top-4 w-24 h-24 bg-white/5 rounded-full blur-2xl' />
        </div>

        <Card className='rounded-4xl p-5 border-none bg-white shadow-sm flex flex-col justify-center'>
          <div className='flex justify-between items-start'>
            <div>
              <p className='text-[10px] font-black text-gray-400 uppercase'>
                Avg. Accuracy
              </p>
              <p className='text-2xl font-black text-[#002EFF]'>87.2%</p>
            </div>
            <div className='p-2 bg-emerald-50 rounded-xl'>
              <ArrowUpRight size={16} className='text-emerald-500' />
            </div>
          </div>
        </Card>
      </div>

      {/* --- DATA TABLE CONTAINER --- */}
      <div className='bg-white rounded-4xl border border-zinc-100 shadow-sm overflow-hidden'>
        {/* Table Header / Toolbar */}
        <div className='p-4 border-b border-zinc-50 flex flex-col sm:flex-row justify-between items-center gap-4'>
          <div className='flex items-center gap-3 w-full sm:w-auto'>
            <div className='h-8 w-8 rounded-xl bg-blue-50 flex items-center justify-center'>
              <History size={16} className='text-[#002EFF]' />
            </div>
            <h3 className='font-black uppercase text-xs tracking-tight text-zinc-800'>
              History Log
            </h3>
          </div>

          <div className='flex items-center gap-2 w-full sm:w-auto'>
            <div className='relative flex-1 sm:w-64'>
              <Search
                className='absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400'
                size={14}
              />
              <Input
                placeholder='Search quizzes...'
                className='h-9 pl-9 rounded-xl border-zinc-100 text-xs focus-visible:ring-[#002EFF]'
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button
              variant='outline'
              size='icon'
              className='h-9 w-9 rounded-xl border-zinc-100'
            >
              <Filter size={14} className='text-zinc-600' />
            </Button>
          </div>
        </div>

        {/* Pro Table */}
        <div className='overflow-x-auto custom-scrollbar'>
          <table className='w-full text-left border-collapse'>
            <thead>
              <tr className='bg-zinc-50/50'>
                <th className='px-6 py-3 text-[10px] font-black uppercase text-zinc-400 tracking-wider'>
                  Subject & Name
                </th>
                <th className='px-6 py-3 text-[10px] font-black uppercase text-zinc-400 tracking-wider'>
                  Performance
                </th>
                <th className='px-6 py-3 text-[10px] font-black uppercase text-zinc-400 tracking-wider'>
                  Status
                </th>
                <th className='px-6 py-3 text-[10px] font-black uppercase text-zinc-400 tracking-wider'>
                  Session Info
                </th>
                <th className='px-6 py-3'></th>
              </tr>
            </thead>
            <tbody className='divide-y divide-zinc-50'>
              {history.map((item) => (
                <tr
                  key={item.id}
                  className='group hover:bg-blue-50/20 transition-all cursor-pointer'
                >
                  <td className='px-6 py-4'>
                    <div className='flex items-center gap-3'>
                      <div className='h-9 w-9 rounded-xl bg-zinc-100 flex items-center justify-center group-hover:bg-[#002EFF] transition-colors'>
                        <BookOpen
                          size={16}
                          className='text-zinc-500 group-hover:text-white'
                        />
                      </div>
                      <div>
                        <p className='text-xs font-black text-zinc-800 leading-tight'>
                          {item.name}
                        </p>
                        <p className='text-[10px] font-bold text-zinc-400 uppercase tracking-tighter'>
                          {item.subject}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className='px-6 py-4'>
                    <div className='flex items-center gap-2'>
                      <span
                        className={`text-xs font-black ${item.score > 70 ? 'text-[#002EFF]' : 'text-orange-500'}`}
                      >
                        {item.score}%
                      </span>
                      <div className='w-12 h-1.5 bg-zinc-100 rounded-full overflow-hidden hidden sm:block'>
                        <div
                          className={`h-full ${item.score > 70 ? 'bg-[#002EFF]' : 'bg-orange-500'}`}
                          style={{ width: `${item.score}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className='px-6 py-4'>
                    <Badge
                      className={`rounded-lg px-2 py-0 text-[9px] font-black uppercase border-none ${
                        item.status === 'Passed'
                          ? 'bg-emerald-50 text-emerald-600'
                          : 'bg-orange-50 text-orange-600'
                      }`}
                    >
                      {item.status}
                    </Badge>
                  </td>
                  <td className='px-6 py-4'>
                    <div className='flex flex-col gap-1'>
                      <div className='flex items-center gap-1 text-zinc-500 text-[10px] font-bold'>
                        <Clock size={10} /> {item.time}
                      </div>
                      <div className='text-zinc-400 text-[9px] font-medium'>
                        {item.date}
                      </div>
                    </div>
                  </td>
                  <td className='px-6 py-4 text-right'>
                    <Button
                      variant='ghost'
                      size='icon'
                      className='h-8 w-8 rounded-lg text-zinc-400'
                    >
                      <ChevronRight size={14} />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer info */}
        <div className='p-3 bg-zinc-50/50 text-center border-t border-zinc-100'>
          <button className='text-[10px] font-black uppercase text-[#002EFF] tracking-widest hover:underline'>
            View Full Archive (244 Sessions)
          </button>
        </div>
      </div>
    </div>
  )
}