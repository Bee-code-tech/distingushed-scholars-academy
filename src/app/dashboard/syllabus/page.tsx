'use client'

import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Zap,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Download,
  Search,
  Crown,
  Target,
} from 'lucide-react'
import { Input } from '@/components/ui/input'

export default function SyllabusMastery() {
  const subjects = [
    {
      name: 'Physics',
      progress: 85,
      color: 'bg-blue-500',
      topics: 12,
      total: 15,
    },
    {
      name: 'Chemistry',
      progress: 45,
      color: 'bg-emerald-500',
      topics: 8,
      total: 18,
    },
    {
      name: 'Biology',
      progress: 92,
      color: 'bg-[#FCB900]',
      topics: 15,
      total: 16,
    },
    {
      name: 'English',
      progress: 60,
      color: 'bg-purple-500',
      topics: 10,
      total: 15,
    },
  ]

  return (
    <div className='space-y-4 animate-in fade-in duration-500 max-w-5xl mx-auto scale-[0.97] origin-top'>
      {/* --- MINI HEADER --- */}
      <div className='flex flex-col sm:flex-row sm:items-end justify-between gap-3 px-1'>
        <div>
          <div className='flex items-center gap-2'>
            <h2 className='text-xl font-black text-[#002EFF] italic uppercase tracking-tight'>
              Syllabus Mastery
            </h2>
            <Badge className='bg-[#002EFF]/10 text-[#002EFF] border-none text-[8px] font-black h-4 px-1.5'>
              PRO FEATURE
            </Badge>
          </div>
          <p className='text-[9px] font-bold text-gray-400 uppercase tracking-widest leading-none'>
            Curated UTME 2026 Roadmap
          </p>
        </div>

        <div className='flex items-center gap-2'>
          <div className='relative'>
            <Search
              className='absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-300'
              size={12}
            />
            <Input
              className='h-7 w-36 rounded-lg bg-white border-none text-[9px] pl-8 focus-visible:ring-1 focus-visible:ring-blue-100 shadow-sm'
              placeholder='Quick find...'
            />
          </div>
          <Button
            variant='outline'
            size='sm'
            className='h-7 rounded-lg font-black text-[9px] border-blue-100 text-[#002EFF] bg-white hover:bg-blue-50 px-2'
          >
            <Download size={12} className='mr-1.5' /> PDF
          </Button>
        </div>
      </div>

      {/* --- COMPACT SUBJECT GRID --- */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3'>
        {subjects.map((s) => (
          <Card
            key={s.name}
            className='p-4 rounded-3xl border-none shadow-sm bg-white hover:shadow-md transition-all duration-300 relative overflow-hidden group'
          >
            {/* Subtle subject background icon */}
            <BookOpen className='absolute -right-2 -top-2 h-16 w-16 text-gray-50 opacity-50 group-hover:text-blue-50 group-hover:rotate-12 transition-all' />

            <div className='relative z-10'>
              <div className='flex justify-between items-start mb-3'>
                <div className='flex items-center gap-2.5'>
                  <div
                    className={`w-8 h-8 rounded-xl bg-gray-50 flex items-center justify-center ${s.color.replace('bg-', 'text-')} transition-colors shadow-inner`}
                  >
                    <Target size={16} strokeWidth={3} />
                  </div>
                  <div>
                    <h3 className='font-black text-sm text-gray-800 uppercase italic'>
                      {s.name}
                    </h3>
                    <span className='text-[8px] font-black text-gray-400 uppercase tracking-tighter'>
                      {s.topics} of {s.total} Topics
                    </span>
                  </div>
                </div>
                <div className='text-right'>
                  <span className='text-lg font-black text-gray-800 leading-none'>
                    {s.progress}%
                  </span>
                </div>
              </div>

              <div className='space-y-3'>
                <Progress
                  value={s.progress}
                  className='h-1.5 bg-gray-50 rounded-full'
                />

                <div className='flex items-center justify-between'>
                  <div className='flex -space-x-1.5'>
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className='w-4 h-4 rounded-full border border-white bg-emerald-50 flex items-center justify-center'
                      >
                        <CheckCircle2
                          size={8}
                          className='text-emerald-500'
                          strokeWidth={4}
                        />
                      </div>
                    ))}
                  </div>
                  <Button
                    size='sm'
                    variant='ghost'
                    className='h-6 px-2 text-[#002EFF] font-black text-[8px] hover:bg-blue-50 rounded-lg uppercase tracking-tight'
                  >
                    Details <ChevronRight size={10} className='ml-0.5' />
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        ))}

        {/* --- PRO UPGRADE CARD --- */}
        <Card className='p-4 rounded-3xl border-2 border-dashed border-blue-100 bg-blue-50/30 flex flex-col items-center justify-center text-center gap-2 group cursor-pointer hover:bg-blue-50 transition-colors'>
          <div className='w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center text-[#FCB900] group-hover:scale-110 transition-transform'>
            <Crown size={16} fill='currentColor' />
          </div>
          <div>
            <p className='text-[10px] font-black text-gray-800 uppercase'>
              Add More Subjects
            </p>
            <p className='text-[8px] font-bold text-gray-400 uppercase tracking-tighter'>
              Unlock full UTME catalog
            </p>
          </div>
        </Card>
      </div>

      {/* --- RECENT ACTIVITY (COMPACT) --- */}
      <Card className='p-4 rounded-3xl border-none shadow-sm bg-white'>
        <div className='flex items-center justify-between mb-3'>
          <h3 className='text-[9px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2'>
            <Zap size={10} className='text-[#FCB900] fill-[#FCB900]' /> Recent
            Mastery
          </h3>
          <Badge
            variant='outline'
            className='text-[7px] border-gray-100 text-gray-400 font-bold px-1 h-4'
          >
            VIEW HISTORY
          </Badge>
        </div>

        <div className='grid grid-cols-1 sm:grid-cols-2 gap-2'>
          {[
            { t: 'Organic Chemistry: Alkanols', date: 'JAN 24' },
            { t: 'Newtonian Mechanics', date: 'JAN 23' },
          ].map((item, i) => (
            <div
              key={i}
              className='flex items-center justify-between p-2 rounded-xl bg-gray-50/50 hover:bg-blue-50 transition-colors cursor-pointer border border-transparent hover:border-blue-100'
            >
              <div className='flex items-center gap-2 overflow-hidden'>
                <div className='bg-white p-1 rounded-md shadow-sm'>
                  <CheckCircle2
                    size={10}
                    className='text-emerald-500'
                    strokeWidth={3}
                  />
                </div>
                <span className='text-[10px] font-bold text-gray-700 truncate'>
                  {item.t}
                </span>
              </div>
              <span className='text-[7px] font-black text-gray-300 whitespace-nowrap ml-2'>
                {item.date}
              </span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}