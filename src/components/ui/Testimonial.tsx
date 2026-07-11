'use client'

import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, Quote, Award } from 'lucide-react'
import Image from 'next/image'

import GloryAdeyemi from '../../imges/Glory Adeyemi.jpg'
import OpeyemiElizabeth from '../../imges/Opeyemi Elizabeth.jpg'
import BankolePerfect from '../../imges/Bankole Perfect.jpg'
import EwataUyoyo from '../../imges/Ewata Uyoyo.jpg'

const testimonials = [
  {
    name: 'Opeyemi Elizabeth',
    rating: 5,
    text: `DSA has really helped me a lot. It built my reading skill and strengthened my understanding of every subject. Whenever I didn't understand a topic, I could freely chat with the teachers and they were always ready to explain in a clear way.`,
    image: OpeyemiElizabeth,
    tag: 'Academic Growth',
  },
  {
    name: 'Ewata Uyoyo',
    rating: 5,
    text: `Distinguished Scholars Academy is excellent and dedicated to the success of all their students. They provide support throughout the entire learning journey—from JAMB lessons to post-UTME preparation.`,
    image: EwataUyoyo,
    tag: 'Full Support',
  },
  {
    name: 'Perfect Bankole',
    rating: 5,
    text: `I joined DSA for the 2025 UTME. I scored 306 in UTME and 75.5 in the UI Post-UTME, eventually gaining admission to study Mechanical Engineering at UI. DSA is the right vehicle for your success!`,
    image: BankolePerfect,
    tag: '306 JAMB Score',
  },
  {
    name: 'Glory Adeyemi',
    rating: 5,
    text: `Distinguished Scholars Academy is the best place for anyone preparing for JAMB. They are blessed with the most dedicated tutors. With DSA, you don’t just learn; you build confidence.`,
    image: GloryAdeyemi,
    tag: 'JAMB Success',
  },
]

export default function Testimonials() {
  const [index, setIndex] = useState(0)
  const [mounted, setMounted] = useState(false)
  const [isExiting, setIsExiting] = useState(false)

  useEffect(() => {
    setMounted(true)
    const timer = setInterval(() => {
      handleNext()
    }, 8000)
    return () => clearInterval(timer)
  }, [index])

  const handleNext = () => {
    setIsExiting(true)
    setTimeout(() => {
      setIndex((prev) => (prev + 1) % testimonials.length)
      setIsExiting(false)
    }, 300)
  }

  const handlePrev = () => {
    setIsExiting(true)
    setTimeout(() => {
      setIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length)
      setIsExiting(false)
    }, 300)
  }

  const handleDotClick = (i: number) => {
    setIsExiting(true)
    setTimeout(() => {
      setIndex(i)
      setIsExiting(false)
    }, 300)
  }

  if (!mounted) return null

  return (
    <section
      id='testimonials'
      className='w-full py-24 bg-white relative overflow-hidden'
    >
      {/* Background Decoration */}
      <div className='absolute top-1/2 -right-20 -translate-y-1/2 opacity-[0.03] pointer-events-none'>
        <Quote size={600} className='text-[#002EFF] rotate-180' />
      </div>

      <div className='max-w-7xl mx-auto px-6 md:px-20 relative z-10'>
        {/* TITLE SECTION */}
        <div className='mb-16'>
          <div
            data-aos='fade-right'
            className='inline-flex items-center gap-2 px-4 py-1.5 bg-yellow-50 rounded-full mb-4 border border-yellow-100'
          >
            <Award size={14} className='text-[#FCB900]' />
            <span className='text-[#FCB900] text-[10px] font-black uppercase tracking-[0.2em]'>
              Proven Results
            </span>
          </div>

          <h2
            data-aos='fade-right'
            data-aos-delay='100'
            className='text-4xl md:text-5xl font-black text-black uppercase tracking-tighter'
          >
            Student <span className='text-[#002EFF]'>Success Stories</span>
          </h2>
          <div
            data-aos='stretch-width' // Custom concept or use zoom-in
            data-aos-delay='200'
            className='w-24 h-1.5 bg-[#FCB900] mt-4 rounded-full shadow-sm'
          ></div>
        </div>

        {/* SLIDER CONTENT */}
        <div
          className={`relative min-h-[450px] md:min-h-[400px] transition-all duration-300 ease-in-out ${
            isExiting
              ? 'opacity-0 -translate-x-5'
              : 'opacity-100 translate-x-0'
          }`}
        >
          <div className='grid md:grid-cols-[1.2fr_2fr] gap-8 md:gap-20 items-center'>
            {/* LEFT: PHOTO */}
            <div className='relative flex justify-center'>
              <div className='absolute inset-0 bg-[#002EFF] blur-[80px] opacity-10 scale-110 rounded-full' />

              <div className='relative'>
                <div
                  className='relative w-64 h-80 bg-gray-100 shadow-2xl overflow-hidden group border-4 border-white'
                  style={{
                    clipPath: 'polygon(10% 0%, 100% 0%, 90% 100%, 0% 100%)',
                    borderRadius: '32px',
                  }}
                >
                  <Image
                    src={testimonials[index].image}
                    alt={testimonials[index].name}
                    fill
                    className='object-cover object-top transition-transform duration-1000 group-hover:scale-110'
                  />
                </div>

                {/* FLOATING SUCCESS TAG */}
                <div className='absolute -bottom-4 -right-4 bg-[#FCB900] text-black font-black px-6 py-2 rounded-2xl shadow-xl text-xs uppercase tracking-widest border-2 border-white rotate-[5deg]'>
                  {testimonials[index].tag}
                </div>
              </div>
            </div>

            {/* RIGHT: CONTENT */}
            <div className='text-left space-y-6'>
              <div className='flex gap-1'>
                {[...Array(5)].map((_, i) => (
                  <span
                    key={i}
                    className='text-[#FCB900] text-2xl animate-pulse'
                  >
                    ★
                  </span>
                ))}
              </div>

              <div className='relative'>
                <Quote
                  size={40}
                  className='absolute -top-6 -left-8 text-[#002EFF]/10'
                />
                <p className='text-gray-600 text-xl md:text-3xl font-bold italic leading-[1.4] tracking-tight relative z-10'>
                  {testimonials[index].text}
                </p>
              </div>

              <div className='pt-4'>
                <h3 className='text-3xl font-black text-black tracking-tighter uppercase'>
                  {testimonials[index].name}
                </h3>
                <p className='text-[#002EFF] font-black text-xs uppercase tracking-[0.3em] mt-2'>
                  Verified DSA Scholar
                </p>
              </div>

              {/* CONTROLS */}
              <div className='flex gap-4 pt-4'>
                <button
                  onClick={handlePrev}
                  className='w-14 h-14 flex items-center justify-center rounded-[20px] bg-gray-50 text-[#002EFF] hover:bg-[#002EFF] hover:text-white transition-all shadow-sm active:scale-95'
                >
                  <ChevronLeft size={24} strokeWidth={3} />
                </button>
                <button
                  onClick={handleNext}
                  className='w-14 h-14 flex items-center justify-center rounded-[20px] bg-gray-50 text-[#002EFF] hover:bg-[#002EFF] hover:text-white transition-all shadow-sm active:scale-95'
                >
                  <ChevronRight size={24} strokeWidth={3} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* PROGRESS NAVIGATION */}
        <div className='flex gap-3 mt-16'>
          {testimonials.map((_, i) => (
            <button
              key={i}
              onClick={() => handleDotClick(i)}
              className={`h-2 rounded-full transition-all duration-500 ${
                i === index ? 'w-16 bg-[#002EFF]' : 'w-4 bg-gray-200'
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
