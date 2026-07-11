'use client'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  ChevronRight,
  Plus,
  Bell,
  MoreVertical,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react'

export default function ExamSchedule() {
  const scheduleItems = [
    {
      day: 'MON',
      date: '27 JAN',
      title: 'Biology Live Quiz',
      time: '10:00 AM',
      status: 'live',
      category: 'Interactive',
      location: 'Main Portal',
    },
    {
      day: 'WED',
      date: '29 JAN',
      title: 'Full CBT Simulation',
      time: '02:30 PM',
      status: 'upcoming',
      category: 'Exam',
      location: 'CBT Simulator',
    },
    {
      day: 'FRI',
      date: '31 JAN',
      title: 'Physics Formula Review',
      time: '09:00 AM',
      status: 'upcoming',
      category: 'Study',
      location: 'Syllabus Mastery',
    },
    {
      day: 'SUN',
      date: '02 FEB',
      title: 'Global Mock Ranking #4',
      time: '04:00 PM',
      status: 'upcoming',
      category: 'Tournament',
      location: 'Global Rankings',
    },
  ]

  return (
    <div className='max-w-4xl mx-auto space-y-6 animate-in slide-in-from-right-4 duration-500'>
      {/* --- HEADER --- */}
      <div className='flex items-center justify-between'>
        <div>
          <h2 className='text-2xl font-black text-[#002EFF] italic uppercase flex items-center gap-2'>
            <CalendarIcon size={24} /> Exam Schedule
          </h2>
          <p className='text-[10px] font-bold text-gray-400 uppercase tracking-widest'>
            Your upcoming academic roadmap
          </p>
        </div>
        <div className='flex gap-2'>
          <Button
            variant='outline'
            size='sm'
            className='rounded-xl border-blue-100 h-9'
          >
            <Bell size={16} className='text-[#002EFF]' />
          </Button>
          <Button className='bg-[#002EFF] text-white font-black text-[10px] rounded-xl px-4 h-9 shadow-lg shadow-blue-200'>
            <Plus size={16} className='mr-2' /> ADD PERSONAL TASK
          </Button>
        </div>
      </div>

      {/* --- QUICK STATS --- */}
      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
        <Card className='p-4 rounded-3xl bg-[#002EFF] text-white border-none flex items-center justify-between'>
          <div className='flex items-center gap-4'>
            <div className='h-10 w-10 bg-white/10 rounded-xl flex items-center justify-center'>
              <Clock size={20} className='text-[#FCB900]' />
            </div>
            <div>
              <p className='text-[10px] font-black text-blue-200 uppercase leading-none'>
                Total Study Time
              </p>
              <p className='text-lg font-black'>
                14h 20m{' '}
                <span className='text-[10px] font-medium text-blue-100 opacity-60'>
                  / this week
                </span>
              </p>
            </div>
          </div>
        </Card>
        <Card className='p-4 rounded-3xl bg-white border-none shadow-sm flex items-center justify-between'>
          <div className='flex items-center gap-4'>
            <div className='h-10 w-10 bg-emerald-50 rounded-xl flex items-center justify-center'>
              <CheckCircle2 size={20} className='text-emerald-500' />
            </div>
            <div>
              <p className='text-[10px] font-black text-gray-400 uppercase leading-none'>
                Completed Goals
              </p>
              <p className='text-lg font-black text-gray-800'>
                08/12{' '}
                <span className='text-[10px] font-medium text-gray-400 opacity-60'>
                  / this month
                </span>
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* --- TIMELINE LIST --- */}
      <div className='space-y-3 relative before:absolute before:left-8 before:top-4 before:bottom-4 before:w-0.5 before:bg-blue-100/50'>
        {scheduleItems.map((item, i) => (
          <Card
            key={i}
            className='p-4 rounded-3xl border-none shadow-sm bg-white flex items-center justify-between group hover:shadow-md transition-all relative z-10'
          >
            <div className='flex items-center gap-6'>
              {/* Date Box */}
              <div
                className={`text-center p-3 rounded-2xl min-w-[70px] shadow-sm transition-colors ${item.status === 'live' ? 'bg-[#FCB900] text-[#002EFF]' : 'bg-blue-50 text-gray-700 group-hover:bg-blue-100'}`}
              >
                <p className='text-[10px] font-black uppercase'>{item.day}</p>
                <p className='text-sm font-black'>{item.date}</p>
              </div>

              {/* Details */}
              <div className='space-y-1'>
                <div className='flex items-center gap-2'>
                  <Badge
                    variant='outline'
                    className='text-[8px] font-black uppercase px-2 py-0 border-blue-100 text-[#002EFF]'
                  >
                    {item.category}
                  </Badge>
                  {item.status === 'live' && (
                    <Badge className='bg-red-500 text-white text-[8px] font-black animate-pulse'>
                      LIVE NOW
                    </Badge>
                  )}
                </div>
                <h4 className='text-sm font-black text-gray-800 uppercase'>
                  {item.title}
                </h4>
                <div className='flex items-center gap-4 text-gray-400'>
                  <div className='flex items-center gap-1 text-[10px] font-bold'>
                    <Clock size={12} /> {item.time}
                  </div>
                  <div className='flex items-center gap-1 text-[10px] font-bold'>
                    <MapPin size={12} /> {item.location}
                  </div>
                </div>
              </div>
            </div>

            <div className='flex items-center gap-2'>
              <Button
                size='icon'
                variant='ghost'
                className='rounded-xl text-gray-300 hover:text-gray-600'
              >
                <MoreVertical size={18} />
              </Button>
              <Button
                size='sm'
                variant='ghost'
                className={`rounded-xl font-black text-[10px] ${item.status === 'live' ? 'bg-[#002EFF] text-white hover:bg-blue-700' : 'text-[#002EFF] hover:bg-blue-50'}`}
              >
                {item.status === 'live' ? (
                  'JOIN NOW'
                ) : (
                  <ChevronRight size={20} />
                )}
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* --- INFO FOOTER --- */}
      <div className='flex items-start gap-3 p-4 bg-orange-50 rounded-3xl border border-orange-100 mt-8'>
        <AlertCircle className='text-orange-500 shrink-0 mt-0.5' size={18} />
        <div>
          <p className='text-[11px] font-black text-orange-700 uppercase'>
            Proctor Notice
          </p>
          <p className='text-[10px] font-bold text-orange-600/80 leading-relaxed'>
            The mock schedules are synchronized with Nigerian Standard Time
            (WAT). Ensure your device clock is set correctly to avoid missing
            your session.
          </p>
        </div>
      </div>
    </div>
  )
}
