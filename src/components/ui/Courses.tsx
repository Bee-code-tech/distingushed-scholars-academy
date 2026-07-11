'use client'
import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

import WAEC from '../../imges/waec.jpeg'
import NECO from '../../imges/neco.jpeg'
import JAMB from '../../imges/jamb.jpeg'
import Year1 from '../../imges/Year01.jpg'
import SUMMER from '../../imges/Summer-Coaching.jpg'
import Skills from '../../imges/skillAcquisition.jpg'

const programs = [
  {
    name: 'Full UTME Preparation',
    img: JAMB,
    desc: 'Complete JAMB tutoring with weekly tests, past questions, and full exam simulations.',
  },
  {
    name: 'Full WAEC Preparation',
    img: WAEC,
    desc: 'Master all WAEC subjects with detailed explanations, practice sessions, and revision plans.',
  },
  {
    name: 'Full NECO Preparation',
    img: NECO,
    desc: 'Comprehensive NECO coaching covering theory, objectives, practicals, and exam drills.',
  },
  {
    name: 'Summer Coaching',
    img: SUMMER,
    desc: 'Holiday lessons designed to strengthen weak areas and prepare students ahead.',
  },
  {
    name: 'Year 1 Tutorials',
    img: Year1,
    desc: 'Support classes for 100-level courses to help students adapt and excel academically.',
  },
  {
    name: 'Skills Acquisition',
    img: Skills,
    desc: 'Learn tech & creative skills including coding, graphics, video editing, and more.',
  },
]

export default function Programs() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <section id='programs' className='w-full py-24 bg-[#f8faff]'>
      <div className='max-w-7xl mx-auto px-10 md:px-20'>
        {/* TITLE */}
        <div
          data-aos='fade-up'
          data-aos-duration='600'
          className='text-center mb-16'
        >
          <span className='text-[#002EFF] font-bold tracking-widest text-sm uppercase'>
            Curriculum
          </span>
          <h2 className='text-3xl md:text-4xl font-extrabold text-black mt-2 uppercase'>
            Programs & <span className='text-[#002EFF]'>Courses</span>
          </h2>
          <div className='w-20 h-1.5 bg-[#FCB900] mx-auto mt-4 rounded-full'></div>
        </div>

        {/* GRID */}
        <div className='grid md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10'>
          {programs.map((program, index) => (
            <div
              key={`program-${index}`}
              data-aos='fade-up'
              data-aos-delay={index * 100}
              data-aos-duration='500'
              className='group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-2xl border border-gray-100 transition-all duration-300'
            >
              {/* Image Container - FIXED: Added 'relative' to allow Image 'fill' to work correctly */}
              <div className='relative aspect-video w-full overflow-hidden'>
                <Image
                  src={program.img}
                  fill
                  alt={program.name}
                  
                  sizes='(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw'
                  className='object-cover transition-transform duration-500 group-hover:scale-110'
                />
                <div className='absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors duration-300'></div>
              </div>

              <div className='p-6'>
                <h3 className='text-xl font-bold text-black group-hover:text-[#002EFF] transition-colors'>
                  {program.name}
                </h3>

                <p className='text-gray-600 text-sm mt-3 leading-relaxed h-12 line-clamp-2'>
                  {program.desc}
                </p>

                <div className='mt-6 pt-5 border-t border-gray-50 flex justify-between items-center'>
                  <Link
                    href='https://wa.link/7wim2w'
                    className='text-[#002EFF] font-bold text-sm flex items-center gap-1 hover:gap-2 transition-all'
                  >
                    Enrol Now <ArrowRight size={16} />
                  </Link>
                  <span className='text-[10px] font-bold text-gray-400 uppercase tracking-tighter'>
                    Available Now
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className='flex justify-center mt-16'>
          <button
            data-aos='zoom-in'
            data-aos-duration='400'
            className='px-10 py-4 bg-[#002EFF] text-white font-bold rounded-xl shadow-lg hover:bg-[#FCB900] hover:text-black transition-all duration-300 flex items-center gap-2 active:scale-95'
          >
            Explore All Programs
            <ArrowRight size={20} />
          </button>
        </div>
      </div>
    </section>
  )
}