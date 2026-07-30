'use client'

import Image from 'next/image'
import { GraduationCap } from 'lucide-react'

// Founder photo lives at public/founder.jpeg. Replace that file to change it.

const BIO = [
  'Philip Idowu Olamide is the Founder and Managing Director of Distinguished Scholars Academy (DSA), an educational institution committed to helping students achieve academic excellence through quality teaching, mentorship, and technology-driven learning.',
  'Founded in 2021, DSA has supported thousands of students in preparing for JAMB, WAEC, Post-UTME, and university-level studies through structured tutorials, CBT practice, and personalized academic guidance.',
  'Philip is a medical student at the University of Ibadan and also the Founder of TechUp Academy & Innovations, where he is passionate about using education and technology to empower young people with the knowledge and skills they need to succeed.',
]

const VISION =
  'His vision is simple: to make quality education accessible, engaging, and impactful for every student.'

const HIGHLIGHTS = [
  '🎓 Medical Student, University of Ibadan',
  '📚 Founder & Managing Director, Distinguished Scholars Academy',
  '💻 Founder, TechUp Academy & Innovations',
  '🚀 Creator of ScholarsDrill',
  '👨‍🎓 Helping students succeed since 2021',
]

export default function MeetFounder() {
  return (
    <section className='w-full py-24 bg-[#f8f9ff] relative overflow-hidden'>
      <div className='max-w-6xl mx-auto px-6 md:px-12'>
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

        <div className='grid md:grid-cols-5 gap-8 md:gap-12'>
          {/* Photo + name */}
          <div className='md:col-span-2' data-aos='fade-right'>
            <div className='md:sticky md:top-28'>
              <div className='relative w-full max-w-[300px] mx-auto aspect-4/5 rounded-[2rem] bg-[#002EFF] rotate-2 shadow-2xl'>
                <div className='absolute inset-1.5 -rotate-2 rounded-[1.8rem] border-4 border-white overflow-hidden bg-slate-100'>
                  <Image
                    src='/founder.jpeg'
                    alt='Philip Idowu Olamide — Founder, Distinguished Scholars Academy'
                    fill
                    sizes='300px'
                    className='object-cover'
                  />
                </div>
                <div className='absolute -bottom-4 -right-3 w-12 h-12 bg-[#FCB900] rounded-2xl flex items-center justify-center shadow-lg -rotate-12'>
                  <GraduationCap className='text-[#002EFF]' size={24} />
                </div>
              </div>
              <div className='text-center mt-8'>
                <h3 className='text-2xl font-black text-gray-900'>
                  Philip Idowu Olamide
                </h3>
                <p className='text-[11px] font-black uppercase tracking-widest text-[#002EFF] mt-1'>
                  Founder &amp; Managing Director, DSA
                </p>
              </div>
            </div>
          </div>

          {/* Bio + highlights */}
          <div className='md:col-span-3' data-aos='fade-left'>
            <div className='space-y-4'>
              {BIO.map((para, i) => (
                <p
                  key={i}
                  className='text-sm md:text-base text-gray-600 leading-relaxed font-medium'
                >
                  {para}
                </p>
              ))}
              <p className='text-sm md:text-base text-[#002EFF] font-bold italic leading-relaxed'>
                {VISION}
              </p>
            </div>

            <div className='mt-8 p-6 bg-white rounded-3xl shadow-sm border border-blue-50'>
              <p className='text-[10px] font-black uppercase tracking-widest text-gray-400 mb-4'>
                Highlights
              </p>
              <div className='space-y-3'>
                {HIGHLIGHTS.map((h) => (
                  <p
                    key={h}
                    className='text-sm font-bold text-gray-700 leading-snug'
                  >
                    {h}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
