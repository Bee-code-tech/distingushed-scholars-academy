'use client'
import { useState, useEffect } from 'react'
import Image from 'next/image'

import Emmanuel from '../../imges/Mr. Emmanuel.jpg'
import Hakeem from '../../imges/Mr. Hakeem.jpg'
import MissBetty from '../../imges/Miss.jpg'
import DrPhils from '../../imges/Dr. Phils.jpg'
import DhocthorJay from '../../imges/Dhocthor Jay.jpg'
import Timilehin from '../../imges/Mr. Timilehin.jpg'

const tutors = [
  {
    name: 'Mr. Timilehin',
    subject: 'Physics',
    img: Timilehin,
    formula: 'g = 9.8m/s²',
  },
  {
    name: 'Miss Betty',
    subject: 'English',
    img: MissBetty,
    formula: 'Subject + Verb',
  },
  { name: 'Mr. Hakeem', subject: 'Mathematics', img: Hakeem, formula: 'Σx/n' },
  {
    name: 'Dr. Jay',
    subject: 'Chemistry',
    img: DhocthorJay,
    formula: 'pH = -log[H+]',
  },
  { name: 'Dr. Phils', subject: 'Biology', img: DrPhils, formula: 'ATP → ADP' },
  {
    name: 'Mr. Emmanuel',
    subject: 'Chemistry',
    img: Emmanuel,
    formula: 'PV = nRT',
  },
]

export default function Tutors() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <section
      id='tutors'
      className='relative w-full py-24 bg-white overflow-hidden'
    >
      {/* --- BACKGROUND FLAIR --- */}
      <div
        className='absolute inset-0 pointer-events-none opacity-[0.03] select-none'
        style={{
          backgroundImage: `radial-gradient(#002EFF 1px, transparent 1px)`,
          backgroundSize: '30px 30px',
        }}
      />

      <div className='max-w-7xl mx-auto px-6 md:px-20 relative z-10'>
        {/* TITLE SECTION */}
        <div className='text-center mb-16'>
          <div
            data-aos='fade-up'
            className='inline-block px-4 py-1.5 bg-yellow-50 rounded-full mb-4 border border-yellow-100'
          >
            <span className='text-[#FCB900] text-[10px] font-black uppercase tracking-[0.2em]'>
              World Class Educators
            </span>
          </div>

          <h2
            data-aos='fade-up'
            data-aos-delay='100'
            data-aos-duration='600'
            className='text-4xl md:text-5xl font-black text-black uppercase tracking-tighter'
          >
            Meet Our <span className='text-[#002EFF]'>Expert Tutors</span>
          </h2>

          <div
            data-aos='zoom-in'
            data-aos-delay='200'
            className='w-24 h-1.5 bg-[#FCB900] mx-auto mt-4 rounded-full'
          ></div>

          <p
            data-aos='fade-up'
            data-aos-delay='300'
            data-aos-duration='700'
            className='text-gray-500 mt-6 max-w-xl mx-auto text-lg font-medium leading-relaxed'
          >
            Our educators are industry experts dedicated to simplifying complex
            topics and ensuring student success.
          </p>
        </div>

        {/* TUTORS GRID */}
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12'>
          {tutors.map((tutor, index) => (
            <div
              key={index}
              data-aos='fade-up'
              data-aos-delay={index * 100}
              data-aos-duration='500'
              className='group relative p-1 bg-gray-50 rounded-[40px] hover:bg-white hover:shadow-[0_30px_60px_rgba(0,46,255,0.12)] transition-all duration-500 border border-transparent hover:border-blue-50'
            >
              <div className='p-8 text-center md:text-left'>
                {/* Image Container with Floating Formula */}
                <div className='relative w-40 h-40 mx-auto'>
                  <div className='absolute inset-0 rounded-full border-2 border-dashed border-[#002EFF]/20 group-hover:rotate-180 transition-all duration-1000' />

                  <div className='absolute inset-2 rounded-full overflow-hidden border-4 border-white shadow-xl bg-white'>
                    <Image
                      src={tutor.img}
                      alt={tutor.name}
                      fill
                      className='object-cover object-top grayscale-50 group-hover:grayscale-0 transition-all duration-500 group-hover:scale-110'
                    />
                  </div>

                  {/* Subject Formula Bubble */}
                  <div
                    className='absolute -right-2 top-0 bg-white shadow-lg border border-gray-50 rounded-xl px-3 py-1 text-[10px] font-serif italic text-blue-600 font-bold animate-bounce'
                    style={{ animationDuration: '3s' }}
                  >
                    {tutor.formula}
                  </div>
                </div>

                <h3 className='text-2xl font-black text-black mt-8 group-hover:text-[#002EFF] transition-colors tracking-tight'>
                  {tutor.name}
                </h3>

                {/* Subject Badge */}
                <div className='inline-flex mt-4 px-6 py-2 rounded-2xl bg-white text-[#002EFF] text-[10px] font-black uppercase tracking-widest shadow-sm border border-gray-100 group-hover:bg-[#002EFF] group-hover:text-white group-hover:border-[#002EFF] transition-all duration-300'>
                  {tutor.subject}
                </div>

                {/* Social/Bio Hint */}
                <p className='mt-4 text-gray-400 text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300'>
                  Ready to help you excel in {tutor.subject}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
