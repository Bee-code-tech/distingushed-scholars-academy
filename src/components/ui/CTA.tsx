'use client'
import { useState, useEffect } from 'react'
import { ArrowRight, MessageCircle, GraduationCap } from 'lucide-react'

// Academic symbols for the final push
const ctaFormulas = [
  { text: 'E = hf', top: '15%', left: '10%', rotate: -15 },
  { text: 'CH₄ + 2O₂', top: '20%', right: '15%', rotate: 12 },
  { text: 'lim x→0', top: '70%', left: '12%', rotate: -8 },
  { text: 'v² = u² + 2as', top: '75%', right: '10%', rotate: 15 },
  { text: 'ΔS > 0', top: '45%', left: '5%', rotate: 25 },
]

// Array of images featuring African students
const studentAvatars = [
  'https://images.pexels.com/photos/5905497/pexels-photo-5905497.jpeg?auto=compress&cs=tinysrgb&w=150', // African male student
  'https://images.pexels.com/photos/6238120/pexels-photo-6238120.jpeg?auto=compress&cs=tinysrgb&w=150', // African female student
  'https://images.pexels.com/photos/5676744/pexels-photo-5676744.jpeg?auto=compress&cs=tinysrgb&w=150', // African student laughing
  'https://images.pexels.com/photos/1007066/pexels-photo-1007066.jpeg?auto=compress&cs=tinysrgb&w=150', // Young African male
]

export default function FinalCTA() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <section
      id='contact'
      className='relative w-full py-24 bg-[#002EFF] overflow-hidden'
    >
      {/* --- ACADEMIC BACKGROUND OVERLAY --- */}
      <style jsx>{`
        @keyframes floatCTA {
          0%,
          100% {
            transform: translateY(0) rotate(var(--base-rot));
          }
          50% {
            transform: translateY(-15px) rotate(calc(var(--base-rot) + 5deg));
          }
        }
        .cta-formula-float {
          animation: floatCTA 5s ease-in-out infinite;
          opacity: 0.15;
        }
      `}</style>

      <div className='absolute inset-0 pointer-events-none select-none overflow-hidden'>
        {/* Decorative Circles */}
        <div className='absolute top-[-10%] left-[-5%] w-64 h-64 border-4 border-white/10 rounded-full' />
        <div className='absolute bottom-[-10%] right-[-5%] w-96 h-96 border-8 border-white/10 rounded-full' />

        {/* Floating Formulas */}
        {ctaFormulas.map((f, i) => (
          <div
            key={i}
            className='absolute font-serif italic text-white text-xl md:text-3xl whitespace-nowrap hidden sm:block cta-formula-float'
            style={
              {
                top: f.top,
                left: f.left,
                right: f.right,
                '--base-rot': `${f.rotate}deg`,
                animationDelay: `${i * 0.5}s`,
                animationDuration: `${4 + i}s`,
              } as any
            }
          >
            {f.text}
          </div>
        ))}
      </div>

      <div className='max-w-7xl mx-auto px-6 md:px-20 text-center relative z-10'>
        <div data-aos='fade-up' data-aos-duration='600'>
          <span className='inline-flex items-center gap-2 px-5 py-2 bg-white/10 text-white text-xs font-black uppercase tracking-[0.3em] rounded-full mb-8 backdrop-blur-md border border-white/20'>
            <span className='w-2 h-2 bg-[#FCB900] rounded-full animate-ping' />
            Limited Slots for 2026
          </span>

          <h2 className='text-4xl md:text-6xl font-black text-white leading-[1.1] tracking-tighter uppercase'>
            Ready to Achieve <br />
            <span className='text-[#FCB900]'>Academic Excellence?</span>
          </h2>
        </div>

        <p
          data-aos='fade-up'
          data-aos-delay='200'
          data-aos-duration='700'
          className='text-white/80 mt-8 text-lg md:text-xl max-w-2xl mx-auto font-medium leading-relaxed'
        >
          Join thousands of students improving their scores, building
          confidence, and excelling in exams with DSA’s proven learning system.
        </p>

        <div
          data-aos='zoom-in'
          data-aos-delay='400'
          data-aos-duration='500'
          className='mt-12 flex flex-col sm:flex-row justify-center items-center gap-6'
        >
          {/* Primary CTA */}
          <a
            className='group w-full sm:w-auto px-12 py-6 bg-[#FCB900] text-black font-black text-lg rounded-2xl flex items-center justify-center gap-3 hover:bg-white hover:scale-105 transition-all shadow-[0_20px_40px_rgba(252,185,0,0.3)] active:scale-95'
            href='https://wa.link/7wim2w'
            target='_blank'
            rel='noopener noreferrer'
          >
            <GraduationCap size={28} />
            ENROL NOW
            <ArrowRight
              size={22}
              className='group-hover:translate-x-2 transition-transform'
            />
          </a>

          {/* Secondary CTA */}
          <a
            className='w-full sm:w-auto px-12 py-6 border-2 border-white/30 text-white font-black text-lg rounded-2xl hover:bg-white hover:text-[#002EFF] hover:border-white transition-all flex items-center justify-center gap-3 active:scale-95'
            href='https://wa.link/xtiui2'
            target='_blank'
            rel='noopener noreferrer'
          >
            <MessageCircle size={28} />
            FREE CLASSES
          </a>
        </div>

        {/* Social Proof */}
        <div
          data-aos='fade-up'
          data-aos-delay='600'
          className='mt-12 flex flex-col items-center gap-4'
        >
          <p className='text-white/40 text-sm font-bold uppercase tracking-widest'>
            No credit card required to start
          </p>
          <div className='flex -space-x-3'>
            {studentAvatars.map((url, i) => (
              <div
                key={i}
                className='w-12 h-12 rounded-full border-2 border-[#002EFF] bg-gray-200 overflow-hidden'
              >
                <img
                  src={url}
                  alt='Student from Africa'
                  className='w-full h-full object-cover'
                />
              </div>
            ))}
            <div className='w-12 h-12 rounded-full border-2 border-[#002EFF] bg-[#FCB900] flex items-center justify-center text-[10px] font-black'>
              +2k
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
