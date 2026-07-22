'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Timer,
  Zap,
  Trophy,
  CheckCircle2,
  Flame,
  Target,
  Rocket,
  MapPin,
  Video,
  CalendarClock,
} from 'lucide-react'
import {
  examCountdown,
  type StudentProfile,
  type Countdown,
} from '@/lib/studentProfile'

interface OverviewUIProps {
  setView: (view: any) => void
  isDSAite: boolean
  student: StudentProfile
}

function SmallStat({ label, value, icon: Icon, color }: any) {
  return (
    <Card className='p-3 rounded-2xl border-none shadow-sm bg-white flex items-center gap-3'>
      <div
        className={`h-9 w-9 bg-blue-50/50 ${color} rounded-xl flex items-center justify-center shrink-0 shadow-inner`}
      >
        <Icon size={18} strokeWidth={3} />
      </div>
      <div>
        <p className='text-[8px] font-black text-gray-400 uppercase leading-none mb-0.5'>
          {label}
        </p>
        <p className='text-xs font-black text-gray-900 leading-none'>{value}</p>
      </div>
    </Card>
  )
}

/**
 * Mode-specific card. Physical students see their next on-campus class + venue;
 * online students get a live-class join card. Same slot, different content.
 */
function ModeCard({ student }: { student: StudentProfile }) {
  if (student.mode === 'physical') {
    return (
      <Card className='rounded-4xl p-6 bg-white border-none shadow-sm flex flex-col justify-between'>
        <div className='flex items-center justify-between mb-4'>
          <p className='text-[10px] font-black uppercase tracking-widest text-blue-400'>
            Next Campus Class
          </p>
          <Badge className='bg-emerald-50 text-emerald-600 text-[8px] font-black'>
            ON-CAMPUS
          </Badge>
        </div>
        <div className='space-y-1'>
          <h3 className='text-lg font-black text-gray-900 uppercase leading-tight'>
            Mathematics — Paper 2
          </h3>
          <div className='flex items-center gap-2 text-gray-400'>
            <CalendarClock size={13} />
            <span className='text-[11px] font-bold'>Tomorrow · 9:00 AM</span>
          </div>
          <div className='flex items-center gap-2 text-gray-400'>
            <MapPin size={13} />
            <span className='text-[11px] font-bold'>Hall B, DSA Campus</span>
          </div>
        </div>
        <div className='mt-4 flex items-center justify-between p-3 bg-blue-50/60 rounded-2xl'>
          <div>
            <p className='text-[8px] font-black text-blue-400 uppercase leading-none'>
              Attendance
            </p>
            <p className='text-sm font-black text-[#002EFF] mt-0.5'>
              18 / 20 classes
            </p>
          </div>
          <div className='flex items-center gap-1 text-emerald-500'>
            <Flame size={14} />
            <span className='text-xs font-black'>90%</span>
          </div>
        </div>
      </Card>
    )
  }

  return (
    <Card className='rounded-4xl p-6 bg-white border-none shadow-sm flex flex-col justify-between'>
      <div className='flex items-center justify-between mb-4'>
        <p className='text-[10px] font-black uppercase tracking-widest text-blue-400'>
          Next Live Class
        </p>
        <Badge className='bg-rose-50 text-rose-500 text-[8px] font-black animate-pulse'>
          ONLINE
        </Badge>
      </div>
      <div className='space-y-1'>
        <h3 className='text-lg font-black text-gray-900 uppercase leading-tight'>
          English — Comprehension
        </h3>
        <div className='flex items-center gap-2 text-gray-400'>
          <CalendarClock size={13} />
          <span className='text-[11px] font-bold'>Today · 6:00 PM (WAT)</span>
        </div>
        <div className='flex items-center gap-2 text-gray-400'>
          <Video size={13} />
          <span className='text-[11px] font-bold'>Live on DSA Portal</span>
        </div>
      </div>
      <Button className='mt-4 bg-[#002EFF] text-white font-black rounded-xl text-[10px] h-10 shadow-lg shadow-blue-200 active:scale-95 transition-transform'>
        JOIN LIVE CLASS <Video className='ml-2' size={14} />
      </Button>
    </Card>
  )
}

export default function OverviewUI({
  setView,
  isDSAite,
  student,
}: OverviewUIProps) {
  const { trackConfig, modeConfig } = student
  const ModeIcon = modeConfig.icon

  const [time, setTime] = useState<Countdown>(() =>
    examCountdown(trackConfig.nextExamDate),
  )

  useEffect(() => {
    setTime(examCountdown(trackConfig.nextExamDate))
    const id = setInterval(
      () => setTime(examCountdown(trackConfig.nextExamDate)),
      1000,
    )
    return () => clearInterval(id)
  }, [trackConfig.nextExamDate])

  return (
    <div className='space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500 max-w-6xl mx-auto'>
      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
        {/* --- MAIN WELCOME BANNER --- */}
        <section className='lg:col-span-2 relative overflow-hidden bg-[#002EFF] rounded-4xl p-8 text-white shadow-lg'>
          <div className='relative z-10 space-y-4'>
            <div className='flex items-center gap-2'>
              <Badge className='bg-[#FCB900] text-[#002EFF] hover:bg-[#FCB900] border-none font-black px-3 py-1'>
                <Flame size={12} className='mr-1 fill-[#002EFF]' /> 15 DAY STREAK
              </Badge>
              <Badge className='bg-white/15 text-white border-none font-bold px-3 py-1'>
                <ModeIcon size={11} className='mr-1' />
                {modeConfig.label}
              </Badge>
            </div>
            <h1 className='text-3xl md:text-4xl font-black uppercase italic tracking-tight'>
              Road to{' '}
              <span className='text-[#FCB900]'>{trackConfig.label}</span>
            </h1>
            <p className='text-blue-100 text-xs md:text-sm max-w-sm font-medium'>
              &ldquo;{trackConfig.tagline}&rdquo;
            </p>
            <div className='flex gap-3'>
              <Button
                onClick={() => setView('quiz360')}
                className='bg-[#FCB900] text-[#002EFF] font-black rounded-xl text-[10px] px-8 h-10 shadow-lg shadow-yellow-400/20 active:scale-95 transition-transform'
              >
                LAUNCH QUIZ360 <Rocket className='ml-2' size={14} />
              </Button>

              {isDSAite && (
                <Badge
                  variant='outline'
                  className='border-white/20 text-white font-bold px-4'
                >
                  PRO MEMBER
                </Badge>
              )}
            </div>
          </div>
          <Target
            size={180}
            className='text-white/10 absolute -right-8 -bottom-8 rotate-12 pointer-events-none'
          />
        </section>

        {/* --- DYNAMIC COUNTDOWN CARD --- */}
        <Card className='rounded-4xl p-6 bg-white border-none shadow-sm flex flex-col items-center justify-center text-center overflow-hidden'>
          <p className='text-[10px] font-black uppercase tracking-widest text-blue-400 mb-4'>
            {trackConfig.examLabel} COUNTDOWN
          </p>

          {time.elapsed ? (
            <div className='flex flex-col items-center gap-2 py-3'>
              <CheckCircle2 size={36} className='text-emerald-500' />
              <p className='text-sm font-black text-gray-800 uppercase'>
                Exam period is here
              </p>
              <p className='text-[10px] font-bold text-gray-400 max-w-[180px]'>
                Best of luck in your {trackConfig.fullName}. Keep revising with
                past questions.
              </p>
            </div>
          ) : (
            <div className='flex items-center gap-1.5'>
              <div className='flex flex-col items-center'>
                <span className='text-4xl font-black text-[#002EFF] tracking-tighter tabular-nums'>
                  {time.days}
                </span>
                <span className='text-[7px] font-bold text-gray-400'>DAYS</span>
              </div>
              <span className='text-xl font-black text-gray-200 pb-4'>:</span>
              <div className='flex flex-col items-center'>
                <span className='text-4xl font-black text-[#002EFF] tracking-tighter tabular-nums'>
                  {String(time.hours).padStart(2, '0')}
                </span>
                <span className='text-[7px] font-bold text-gray-400'>HRS</span>
              </div>
              <span className='text-xl font-black text-gray-200 pb-4'>:</span>
              <div className='flex flex-col items-center'>
                <span className='text-4xl font-black text-[#002EFF] tracking-tighter tabular-nums'>
                  {String(time.minutes).padStart(2, '0')}
                </span>
                <span className='text-[7px] font-bold text-gray-400'>MIN</span>
              </div>
              <span className='text-xl font-black text-gray-200 pb-4'>:</span>
              <div className='flex flex-col items-center'>
                <span className='text-4xl font-black text-[#FCB900] tracking-tighter tabular-nums'>
                  {String(time.seconds).padStart(2, '0')}
                </span>
                <span className='text-[7px] font-bold text-gray-400'>SEC</span>
              </div>
            </div>
          )}

          <div className='w-full mt-6 h-2 bg-blue-50 rounded-full overflow-hidden'>
            <div
              className='bg-linear-to-r from-[#002EFF] to-[#FCB900] h-full transition-all duration-1000'
              style={{ width: time.elapsed ? '100%' : '65%' }}
            />
          </div>
        </Card>
      </div>

      {/* --- MODE-SPECIFIC + STATS --- */}
      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
        <ModeCard student={student} />

        <div className='lg:col-span-2 grid grid-cols-2 gap-4 content-start'>
          <SmallStat
            label='Avg Score'
            value='78%'
            icon={Timer}
            color='text-blue-600'
          />
          <SmallStat
            label='Topics'
            value={`12/${trackConfig.totalTopics}`}
            icon={Zap}
            color='text-yellow-500'
          />
          <SmallStat
            label='Global Rank'
            value='#12'
            icon={Trophy}
            color='text-orange-500'
          />
          <SmallStat
            label='Accuracy'
            value='92%'
            icon={CheckCircle2}
            color='text-emerald-500'
          />
          <Card className='col-span-2 p-4 rounded-2xl border border-blue-50 bg-blue-50/40 flex items-center gap-3'>
            <div className='h-9 w-9 bg-white rounded-xl flex items-center justify-center shrink-0 text-[#002EFF] shadow-sm'>
              <trackConfig.icon size={18} strokeWidth={2.5} />
            </div>
            <div>
              <p className='text-[8px] font-black text-blue-400 uppercase leading-none mb-0.5'>
                Your Track
              </p>
              <p className='text-[11px] font-black text-gray-800 leading-none'>
                {trackConfig.fullName} · {trackConfig.subjectRule}
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
