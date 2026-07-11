'use client'

import { useState, useEffect, useRef } from 'react'
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
} from 'lucide-react'

interface OverviewUIProps {
  setView: (view: any) => void
  isDSAite: boolean
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

export default function OverviewUI({ setView, isDSAite }: OverviewUIProps) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    ms: 0,
  })

  useEffect(() => {
    // Target: Mid-April 2026 for JAMB UTME
    const targetDate = new Date('2026-04-18T00:00:00').getTime()

    const updateTimer = () => {
      const now = new Date().getTime()
      const diff = targetDate - now

      if (diff > 0) {
        setTimeLeft({
          days: Math.floor(diff / (1000 * 60 * 60 * 24)),
          hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((diff % (1000 * 60)) / 1000),
          ms: Math.floor((diff % 1000) / 10), // Two digits for milliseconds
        })
        requestAnimationFrame(updateTimer)
      }
    }

    const animFrame = requestAnimationFrame(updateTimer)
    return () => cancelAnimationFrame(animFrame)
  }, [])

  return (
    <div className='space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500 max-w-6xl mx-auto'>
      <style
        dangerouslySetInnerHTML={{
          __html: `
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #002EFF; border-radius: 10px; }
      `,
        }}
      />

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
        {/* --- MAIN WELCOME BANNER --- */}
        <section className='lg:col-span-2 relative overflow-hidden bg-[#002EFF] rounded-4xl p-8 text-white shadow-lg'>
          <div className='relative z-10 space-y-4'>
            <Badge className='bg-[#FCB900] text-[#002EFF] hover:bg-[#FCB900] border-none font-black px-3 py-1'>
              <Flame size={12} className='mr-1 fill-[#002EFF]' /> 15 DAY STREAK
            </Badge>
            <h1 className='text-3xl md:text-4xl font-black uppercase italic tracking-tight'>
              Road to <span className='text-[#FCB900]'>JAMB 2026</span>
            </h1>
            <p className='text-blue-100 text-xs md:text-sm max-w-sm font-medium'>
              "The beautiful thing about learning is that no one can take it
              away from you."
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
            UTME 2026 COUNTDOWN
          </p>

          <div className='flex items-center gap-1.5'>
            {/* Days */}
            <div className='flex flex-col items-center'>
              <span className='text-4xl font-black text-[#002EFF] tracking-tighter tabular-nums'>
                {timeLeft.days}
              </span>
              <span className='text-[7px] font-bold text-gray-400'>DAYS</span>
            </div>

            <span className='text-xl font-black text-gray-200 pb-4'>:</span>

            {/* Hours */}
            <div className='flex flex-col items-center'>
              <span className='text-4xl font-black text-[#002EFF] tracking-tighter tabular-nums'>
                {String(timeLeft.hours).padStart(2, '0')}
              </span>
              <span className='text-[7px] font-bold text-gray-400'>HRS</span>
            </div>

            <span className='text-xl font-black text-gray-200 pb-4'>:</span>

            {/* Minutes */}
            <div className='flex flex-col items-center'>
              <span className='text-4xl font-black text-[#002EFF] tracking-tighter tabular-nums'>
                {String(timeLeft.minutes).padStart(2, '0')}
              </span>
              <span className='text-[7px] font-bold text-gray-400'>MIN</span>
            </div>

            <span className='text-xl font-black text-gray-200 pb-4'>:</span>

            {/* Seconds & Milliseconds */}
            <div className='flex flex-col items-center'>
              <div className='flex items-baseline'>
                <span className='text-4xl font-black text-[#002EFF] tracking-tighter tabular-nums'>
                  {String(timeLeft.seconds).padStart(2, '0')}
                </span>
                <span className='text-lg font-black text-[#FCB900] w-[2ch] text-left tabular-nums'>
                  .{String(timeLeft.ms).padStart(2, '0')}
                </span>
              </div>
              <span className='text-[7px] font-bold text-gray-400'>SEC</span>
            </div>
          </div>

          <div className='w-full mt-6 h-2 bg-blue-50 rounded-full overflow-hidden'>
            <div
              className='bg-linear-to-r from-[#002EFF] to-[#FCB900] h-full transition-all duration-1000'
              style={{ width: '65%' }}
            />
          </div>
        </Card>
      </div>

      {/* --- QUICK STATS GRID --- */}
      <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
        <SmallStat
          label='Avg Score'
          value='78%'
          icon={Timer}
          color='text-blue-600'
        />
        <SmallStat
          label='Topics'
          value='12/40'
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
      </div>
    </div>
  )
}
