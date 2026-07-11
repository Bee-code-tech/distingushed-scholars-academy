'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Play, Youtube } from 'lucide-react'
import Clip1 from '../../imges/JAMB-Students-Must-Know.jpg'
import Clip2 from '../../imges/solubility.jpg'
import Clip3 from '../../imges/5-COMMON-ENGLISH-MISTAKES.jpg'

const clips = [
  {
    title:
      '5 Things Every JAMB Student Must Know to Pass 2026 UTME | Score 300+',
    img: Clip1,
    link: 'https://youtu.be/UOcRJXGQ-6A?si=QuA5PO8-uXBdPyLH',
  },
  {
    title:
      'Solubility Product (Ksp) Made Easy | Chemistry Tutorial for WAEC, JAMB, NECO',
    img: Clip2,
    link: 'https://youtu.be/SxDwqL3GHy0?si=HBBeDwlP9l6cTwfU',
  },
  {
    title: '3 Common English Mistakes Students Make | UTME 2026 English Tips',
    img: Clip3,
    link: 'https://youtube.com/shorts/nxETM2TpuUg?si=fPmPaAHt5iFm5w7a',
  },
]

export default function WatchUs() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <section id='watch-us' className='w-full py-24 bg-[#f8faff]'>
      <div className='max-w-7xl mx-auto px-10 md:px-20'>
        {/* TITLE SECTION */}
        <div className='text-center mb-16'>
          <h2
            data-aos='fade-up'
            data-aos-duration='600'
            className='text-3xl md:text-4xl font-extrabold text-black uppercase'
          >
            Watch <span className='text-[#002EFF]'>Us</span>
          </h2>
          <div className='w-16 h-1 bg-[#FCB900] mx-auto mt-4 rounded-full'></div>

          <p
            data-aos='fade-up'
            data-aos-delay='200'
            data-aos-duration='700'
            className='mt-6 text-gray-600 max-w-2xl mx-auto text-lg'
          >
            Watch clips of real classes, tutorials, and success stories. Our
            lessons feature clear explanations and exam-based examples.
          </p>
        </div>

        {/* Video Clips Grid */}
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8'>
          {clips.map((clip, index) => (
            <div
              key={`video-clip-${index}`}
              data-aos='fade-up'
              data-aos-delay={index * 100}
              data-aos-duration='600'
              className='group relative rounded-2xl overflow-hidden shadow-sm bg-white border border-gray-100'
            >
              <div className='relative aspect-video w-full overflow-hidden bg-black'>
                <Image
                  src={clip.img}
                  alt={clip.title}
                  fill
                  sizes='(max-width: 768px) 100vw, 33vw'
                  className='object-cover opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500'
                />

                <div className='absolute inset-0 flex items-center justify-center'>
                  <div className='w-14 h-14 bg-[#002EFF]/90 rounded-full flex items-center justify-center text-white shadow-xl group-hover:bg-[#FCB900] group-hover:text-black transition-all duration-300 transform group-hover:scale-110'>
                    <Play size={24} fill='currentColor' />
                  </div>
                </div>
              </div>

              <div className='p-6'>
                <h3 className='text-sm md:text-base font-bold text-gray-800 line-clamp-2 min-h-12 group-hover:text-[#002EFF] transition-colors'>
                  {clip.title}
                </h3>

                <a
                  href={clip.link}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='mt-4 inline-flex items-center gap-2 text-[#002EFF] font-bold text-sm hover:underline'
                >
                  Watch Video <Youtube size={18} className='text-red-600' />
                </a>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div
          data-aos='fade-up'
          data-aos-delay='400'
          data-aos-duration='700'
          className='mt-16 text-center'
        >
          <a
            href='https://www.youtube.com/@learnwithdsa'
            target='_blank'
            rel='noopener noreferrer'
            className='inline-flex items-center gap-3 px-10 py-4 bg-[#002EFF] text-white font-bold rounded-xl shadow-lg hover:bg-[#FCB900] hover:text-black transition-all duration-300 active:scale-95'
          >
            <Youtube size={24} />
            Watch More on YouTube
          </a>
        </div>
      </div>
    </section>
  )
}
