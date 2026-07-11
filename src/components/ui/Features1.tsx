'use client'
import { useState, useEffect } from 'react'
import {
  BookOpen,
  Video,
  BarChart3,
  FileText,
  ClipboardCheck,
  AlarmClock,
  CalendarCheck,
  Trophy,
} from 'lucide-react'

const features = [
  { title: 'LMS Access', icon: BookOpen },
  { title: 'Recorded Classes', icon: Video },
  { title: 'Free E-books & Summaries', icon: FileText },
  { title: 'Dashboard Tracking', icon: BarChart3 },
  { title: 'Past Questions Practice', icon: ClipboardCheck },
  { title: 'Weekly Reviews', icon: AlarmClock },
  { title: 'Study Schedules', icon: CalendarCheck },
  { title: 'Leaderboard Competitions', icon: Trophy },
]

export default function Features() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <section id='materials' className='w-full py-24 bg-white'>
      <div className='max-w-7xl mx-auto px-10 md:px-20'>
        {/* TITLE */}
        <div
          data-aos='fade-up'
          data-aos-duration='600'
          className='text-center mb-16'
        >
          <span className='text-[#002EFF] font-bold tracking-widest text-sm uppercase italic'>
            Student Benefits
          </span>
          <h2 className='text-3xl md:text-4xl font-extrabold text-black mt-2 uppercase'>
            What Students <span className='text-[#002EFF]'>Get</span>
          </h2>
          <div className='w-16 h-1 bg-[#FCB900] mx-auto mt-4 rounded-full'></div>
        </div>

        {/* FEATURES GRID */}
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-14'>
          {features.map((feat, index) => {
            const Icon = feat.icon
            return (
              <div
                key={`feat-benefit-${index}`}
                data-aos='fade-up'
                data-aos-delay={index * 50} // Staggered reveal
                data-aos-duration='400'
                className='group p-6 rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-xl hover:border-[#002EFF]/20 hover:-translate-y-1 transition-all duration-300'
              >
                <div className='flex flex-col items-center text-center md:items-start md:text-left gap-4'>
                  <div className='w-12 h-12 rounded-xl bg-[#f0f4ff] flex items-center justify-center group-hover:bg-[#002EFF] transition-colors duration-300'>
                    <Icon
                      className='text-[#002EFF] group-hover:text-white transition-colors duration-300'
                      size={24}
                    />
                  </div>
                  <h3 className='text-base font-bold text-gray-800 leading-tight group-hover:text-[#002EFF] transition-colors'>
                    {feat.title}
                  </h3>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
