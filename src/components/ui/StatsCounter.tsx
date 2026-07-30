'use client'

import { GraduationCap, Trophy, Users, Star } from 'lucide-react'

/**
 * Social-proof counter strip. Figures below were supplied by the academy —
 * update them here as they change.
 */
const STATS = [
  { icon: GraduationCap, label: 'Students Trained', value: '2,000+' },
  { icon: Trophy, label: 'Admissions Secured', value: '1,000+' },
  { icon: Users, label: 'Experienced Tutors', value: '30+' },
  { icon: Star, label: 'Student Satisfaction', value: '4.9/5' },
]

export default function StatsCounter() {
  return (
    <section className='w-full py-16 bg-[#002EFF]'>
      <div className='max-w-6xl mx-auto px-6 md:px-12'>
        <p
          data-aos='fade-up'
          className='text-center text-[10px] font-black uppercase tracking-[0.3em] text-blue-200 mb-10'
        >
          Trusted by Students Across Nigeria
        </p>
        <div className='grid grid-cols-2 md:grid-cols-4 gap-6'>
          {STATS.map((s, i) => {
            const Icon = s.icon
            return (
              <div
                key={s.label}
                data-aos='fade-up'
                data-aos-delay={i * 80}
                className='flex flex-col items-center text-center'
              >
                <div className='h-12 w-12 rounded-2xl bg-white/10 flex items-center justify-center mb-3 text-[#FCB900]'>
                  <Icon size={22} strokeWidth={2.5} />
                </div>
                <span className='text-3xl md:text-4xl font-black text-white tabular-nums leading-none'>
                  {s.value}
                </span>
                <span className='text-[10px] font-bold uppercase tracking-wider text-blue-200 mt-2'>
                  {s.label}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
