'use client'
import { useEffect, useState, useRef } from 'react'
import Image from 'next/image'
import { CheckCircle, Award, BookOpen, Users, Lightbulb } from 'lucide-react'
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import DSAStudent from '../../imges/AboutDSA.jpg'

export default function AboutDSA() {
  const [offset, setOffset] = useState(0)

  // Ref for the 3D Tilt Effect
  const cardRef = useRef<HTMLDivElement>(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)

  const mouseXSpring = useSpring(x)
  const mouseYSpring = useSpring(y)

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ['10deg', '-10deg'])
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ['-10deg', '10deg'])

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    const width = rect.width
    const height = rect.height
    const mouseX = e.clientX - rect.left
    const mouseY = e.clientY - rect.top
    const xPct = mouseX / width - 0.5
    const yPct = mouseY / height - 0.5
    x.set(xPct)
    y.set(yPct)
  }

  const handleMouseLeave = () => {
    x.set(0)
    y.set(0)
  }

  useEffect(() => {
    const handleScroll = () => setOffset(window.pageYOffset)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <section
      id='about'
      className='relative w-full py-16 md:py-24 bg-white overflow-hidden'
    >
      {/* --- PARALLAX BACKGROUND ELEMENTS --- */}
      <div className='absolute inset-0 pointer-events-none opacity-10 select-none hidden md:block'>
        <div
          className='absolute top-20 left-10 text-4xl font-serif italic text-[#002EFF]'
          style={{ transform: `translateY(${offset * 0.15}px) rotate(-10deg)` }}
        >
          sin(θ) = o/h
        </div>
        <div
          className='absolute bottom-20 right-10 text-4xl font-serif italic text-[#002EFF]'
          style={{ transform: `translateY(-${offset * 0.1}px) rotate(10deg)` }}
        >
          NaCl + H₂O
        </div>
        <div
          className='absolute top-1/2 left-[45%] text-7xl font-serif italic text-[#002EFF]'
          style={{ transform: `translateY(${offset * 0.05}px)` }}
        >
          π
        </div>
      </div>

      <div className='max-w-7xl mx-auto px-6 md:px-12 lg:px-20 grid lg:grid-cols-2 gap-12 lg:gap-20 items-center'>
        {/* IMAGE CONTAINER WITH 3D TILT */}
        <motion.div
          ref={cardRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
          data-aos='fade-up'
          className='relative order-1 lg:order-2 perspective-1000'
        >
          {/* Orbital Ring */}
          <div className='absolute -inset-10 border border-blue-100 rounded-full animate-[spin_30s_linear_infinite] opacity-30' />

          <div className='relative w-full bg-[#002EFF] rounded-[30px] md:rounded-[40px] shadow-2xl p-1.5 md:p-2 overflow-visible'>
            {/* IMAGE BOX: 
                Switched to aspect-video (16:9) to capture more width 
                Switched to object-contain to ensure nobody is cut off 
            */}
            <div className='relative w-full aspect-video lg:aspect-3/2 overflow-hidden rounded-3xl md:rounded-[36px] bg-gray-100'>
              <Image
                src={DSAStudent}
                alt='DSA Students and Tutors'
                fill
                sizes='(max-width: 768px) 100vw, 50vw'
                className='object-contain bg-gray-50 hover:scale-105 transition-transform duration-700'
                priority
              />
            </div>

            {/* F=ma Badge (Floating above 3D card) */}
            <div
              style={{ transform: 'translateZ(50px)' }}
              className='absolute -top-6 -right-2 md:-top-10 md:right-4 z-20 bg-white shadow-xl p-2 md:p-4 rounded-xl border border-gray-100 text-[#002EFF] font-serif font-bold italic animate-pulse text-xs md:text-lg'
            >
              F = ma
            </div>

            {/* Excellence Badge (Floating above 3D card) */}
            <div
              style={{ transform: 'translateZ(40px)' }}
              className='absolute -bottom-6 -left-4 md:-bottom-8 md:-left-8 bg-white p-4 md:p-6 shadow-2xl rounded-[20px] md:rounded-[30px] flex items-center gap-3 border border-gray-50 z-10'
            >
              <div className='bg-[#FCB900] w-10 h-10 md:w-16 md:h-16 rounded-xl text-white font-black text-lg md:text-3xl flex items-center justify-center'>
                10+
              </div>
              <div className='flex flex-col'>
                <span className='text-[10px] md:text-sm font-black text-black uppercase'>
                  Years of
                </span>
                <span className='text-[10px] md:text-sm font-black text-[#002EFF] uppercase'>
                  Excellence
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* TEXT CONTENT */}
        <div data-aos='fade-right' className='relative z-10 order-2 lg:order-1'>
          <div className='flex items-center gap-2 mb-4'>
            <div className='h-0.5 w-8 bg-[#FCB900]' />
            <span className='text-[#002EFF] font-black tracking-[0.3em] text-xs uppercase'>
              Who We Are
            </span>
          </div>

          <h2 className='text-3xl md:text-5xl font-black text-black mt-2 leading-tight'>
            About Distinguished <br />
            <span className='text-[#002EFF]'>Scholars Academy</span>
          </h2>

          <p className='text-gray-500 mt-6 leading-relaxed text-base md:text-lg font-medium'>
            DSA is an educational institution dedicated to raising excellent
            students through effective teaching, consistent practice, and
            result-driven mentorship.
          </p>

          <div className='mt-8 p-6 border-l-8 border-[#FCB900] bg-gray-50 rounded-r-2xl'>
            <h3 className='font-black text-[#002EFF] text-lg uppercase mb-2'>
              Our Philosophy
            </h3>
            <p className='text-gray-700 text-base md:text-lg italic'>
              "Every student can become brilliant — all they need is the right
              support."
            </p>
          </div>

          <div className='grid grid-cols-2 gap-4 mt-10'>
            {[
              { label: 'Expert Tutors', icon: <Users size={20} /> },
              { label: 'CBT Practice', icon: <BookOpen size={20} /> },
              { label: 'Proven Results', icon: <Award size={20} /> },
              { label: 'Mentorship', icon: <CheckCircle size={20} /> },
            ].map((item) => (
              <div
                key={item.label}
                className='flex items-center gap-3 text-black font-bold'
              >
                <div className='bg-blue-50 p-2 rounded-lg text-[#002EFF]'>
                  {item.icon}
                </div>
                <span className='text-[10px] md:text-xs uppercase'>
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
