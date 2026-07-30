'use client'

import Image from 'next/image'
import { GraduationCap, Stethoscope, Rocket, Quote } from 'lucide-react'

// Founder photo lives at public/founder.jpeg. Replace that file to change it.

const CREDENTIALS = [
  { icon: Rocket, text: 'Founder & Managing Director' },
  { icon: Stethoscope, text: 'Medical Student, University of Ibadan' },
  { icon: GraduationCap, text: 'Educational Entrepreneur' },
]

export default function MeetFounder() {
  return (
    <section className='w-full py-24 bg-[#f8f9ff] relative overflow-hidden'>
      <div className='max-w-5xl mx-auto px-6 md:px-12'>
        <div className='text-center mb-14' data-aos='fade-up'>
          <span className='inline-block px-4 py-1.5 bg-blue-50 rounded-full mb-4 border border-blue-100'>
            <span className='text-[#002EFF] text-[10px] font-black uppercase tracking-widest'>
              Meet Our Founder
            </span>
          </span>
          <h2 className='text-3xl md:text-4xl font-black text-gray-900 uppercase tracking-tight'>
            The Vision Behind <span className='text-[#002EFF]'>DSA</span>
          </h2>
        </div>

        <div className='grid md:grid-cols-5 gap-8 md:gap-12 items-center'>
          {/* Photo */}
          <div className='md:col-span-2' data-aos='fade-right'>
            <div className='relative w-full max-w-[280px] mx-auto aspect-4/5 rounded-[2rem] bg-[#002EFF] rotate-2 shadow-2xl'>
              <div className='absolute inset-1.5 -rotate-2 rounded-[1.8rem] border-4 border-white overflow-hidden bg-slate-100'>
                <Image
                  src='/founder.jpeg'
                  alt='Philip Idowu — Founder, Distinguished Scholars Academy'
                  fill
                  sizes='280px'
                  className='object-cover'
                />
              </div>
              <div className='absolute -bottom-4 -right-3 w-12 h-12 bg-[#FCB900] rounded-2xl flex items-center justify-center shadow-lg -rotate-12'>
                <GraduationCap className='text-[#002EFF]' size={24} />
              </div>
            </div>
          </div>

          {/* Details */}
          <div className='md:col-span-3' data-aos='fade-left'>
            <h3 className='text-2xl md:text-3xl font-black text-gray-900'>
              Philip Idowu
            </h3>
            <div className='mt-5 space-y-3'>
              {CREDENTIALS.map((cred) => {
                const Icon = cred.icon
                return (
                  <div key={cred.text} className='flex items-center gap-3'>
                    <div className='h-9 w-9 rounded-xl bg-white text-[#002EFF] flex items-center justify-center shadow-sm shrink-0'>
                      <Icon size={17} strokeWidth={2.5} />
                    </div>
                    <span className='text-sm font-bold text-gray-700'>
                      {cred.text}
                    </span>
                  </div>
                )
              })}
            </div>

            <div className='mt-7 p-5 bg-white rounded-2xl border-l-4 border-[#FCB900] shadow-sm flex gap-3'>
              <Quote className='text-[#FCB900] shrink-0' size={22} />
              <p className='text-sm md:text-base text-gray-700 font-medium italic leading-relaxed'>
                Helping students succeed academically since 2021 — founder of
                Distinguished Scholars Academy.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
