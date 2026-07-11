'use client'

import { useState, useEffect } from 'react'
import {
  Facebook,
  Instagram,
  Send,
  Mail,
  Phone,
  CheckCircle2,
} from 'lucide-react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import AOS from 'aos'
import 'aos/dist/aos.css'

const flyingFormulas = [
  { text: 'E = mc²', top: '10%', left: '-10%', duration: 25, delay: 0 },
  { text: '∫ e^x dx', top: '25%', left: '110%', duration: 30, delay: 2 },
  { text: 'PV = nRT', top: '50%', left: '-15%', duration: 28, delay: 5 },
  { text: 'λ = h/p', top: '70%', left: '105%', duration: 22, delay: 1 },
  { text: 'ΔG = ΔH - TΔS', top: '20%', left: '-20%', duration: 35, delay: 3 },
  {
    text: 'sin²θ + cos²θ = 1',
    top: '85%',
    left: '110%',
    duration: 27,
    delay: 4,
  },
  { text: 'F = Gm₁m₂/r²', top: '40%', left: '-12%', duration: 32, delay: 6 },
  { text: 'C₆H₁₂O₆', top: '65%', left: '115%', duration: 24, delay: 2 },
]

export default function Footer() {
  const [mounted, setMounted] = useState(false)
  const [year, setYear] = useState<number>(2026)
  const [email, setEmail] = useState('')
  const [subscribed, setSubscribed] = useState(false)

  useEffect(() => {
    setMounted(true)
    setYear(new Date().getFullYear())

    AOS.init({
      duration: 1000,
      once: true,
      easing: 'ease-out-quad',
      disable: 'mobile', // Optional: improves performance on small devices
    })
  }, [])

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault()
    if (email) {
      setSubscribed(true)
      setEmail('')
      setTimeout(() => setSubscribed(false), 5000)
    }
  }

  if (!mounted) return null

  return (
    <footer className='w-full bg-[#0a0e1a] text-gray-400 pt-16 pb-8 relative overflow-hidden'>
      {/* --- BACKGROUND ANIMATION: Only Formulas Move --- */}
      <div className='absolute inset-0 pointer-events-none select-none overflow-hidden opacity-20 z-0'>
        {flyingFormulas.map((f, i) => (
          <motion.div
            key={i}
            initial={{
              x: f.left.includes('-') ? '-10vw' : '100vw',
              opacity: 0,
            }}
            animate={{
              x: f.left.includes('-') ? '110vw' : '-110vw',
              y: [0, -30, 30, 0],
              opacity: [0, 1, 1, 0],
            }}
            transition={{
              duration: f.duration,
              repeat: Infinity,
              delay: f.delay,
              ease: 'linear',
            }}
            className='absolute font-serif italic text-white text-sm md:text-xl whitespace-nowrap'
            style={{ top: f.top }}
          >
            {f.text}
          </motion.div>
        ))}
      </div>

      {/* --- STATIC CONTENT: No movement on these containers --- */}
      <div className='max-w-7xl mx-auto px-6 md:px-12 relative z-10'>
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-white/5'>
          <div className='space-y-5' data-aos='fade-up'>
            <h3 className='text-white font-black text-lg tracking-tight uppercase'>
              Distinguished <span className='text-[#002EFF]'>Scholars</span>{' '}
              Academy
            </h3>
            <p className='text-xs leading-relaxed max-w-sm'>
              Empowering students with the right skills, speed, and confidence
              to dominate national exams and secure university admissions.
            </p>
            <div className='space-y-2.5'>
              <div className='flex items-center gap-3 text-[13px] group cursor-pointer'>
                <Phone
                  size={14}
                  className='text-[#FCB900] group-hover:scale-110 transition-transform'
                />
                <span className='hover:text-white transition-colors'>
                  +234 906 186 4717
                </span>
              </div>
              <div className='flex items-center gap-3 text-[13px] group cursor-pointer'>
                <Mail
                  size={14}
                  className='text-[#FCB900] group-hover:scale-110 transition-transform'
                />
                <span className='hover:text-white transition-colors'>
                  dsatutelage@gmail.com
                </span>
              </div>
            </div>
          </div>

          <div data-aos='fade-up' data-aos-delay='100'>
            <h4 className='text-white font-bold mb-5 uppercase tracking-widest text-[10px]'>
              Explore
            </h4>
            <ul className='space-y-3'>
              {['Programs', 'About Us', 'Blog', 'Rapid Quiz', 'FAQs'].map(
                (item) => (
                  <li key={item}>
                    <Link
                      href={`#${item.toLowerCase().replace(' ', '')}`}
                      className='text-[13px] hover:text-[#FCB900] transition-colors'
                    >
                      {item}
                    </Link>
                  </li>
                )
              )}
            </ul>
          </div>

          <div data-aos='fade-up' data-aos-delay='200'>
            <h4 className='text-white font-bold mb-5 uppercase tracking-widest text-[10px]'>
              Legal
            </h4>
            <ul className='space-y-3'>
              {['Terms & Conditions', 'Privacy Policy'].map((item) => (
                <li key={item}>
                  <Link
                    href='#'
                    className='text-[13px] hover:text-[#FCB900] transition-colors'
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div data-aos='fade-up' data-aos-delay='300'>
            <h4 className='text-white font-bold mb-5 uppercase tracking-widest text-[10px]'>
              Newsletter
            </h4>
            <p className='text-[13px] mb-4'>
              Subscribe for exam updates and study tips.
            </p>
            <form className='flex flex-col gap-2' onSubmit={handleSubscribe}>
              <div className='relative'>
                <input
                  type='email'
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className='w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-[#002EFF] transition-all'
                  placeholder='Email Address'
                  required
                />
              </div>
              <button
                type='submit'
                disabled={subscribed}
                className={`py-2.5 rounded-lg font-bold transition-all text-xs uppercase flex items-center justify-center gap-2 ${
                  subscribed
                    ? 'bg-green-500 text-white'
                    : 'bg-[#002EFF] text-white hover:bg-[#FCB900] hover:text-black'
                }`}
              >
                {subscribed ? (
                  <>
                    Subscribed <CheckCircle2 size={14} />
                  </>
                ) : (
                  'Subscribe'
                )}
              </button>
            </form>
          </div>
        </div>

        <div
          className='pt-8 flex flex-col md:flex-row items-center justify-between gap-6'
          data-aos='fade-in'
          data-aos-delay='400'
        >
          <p className='text-[11px] text-gray-500 text-center md:text-left'>
            © {year}{' '}
            <span className='text-gray-300 font-semibold'>
              Distinguished Scholars Academy
            </span>
            . <br className='md:hidden' /> Built for excellence.
          </p>

          <div className='flex items-center gap-3'>
            {[
              { Icon: Facebook, url: 'https://facebook.com' },
              { Icon: Instagram, url: 'https://instagram.com' },
              { Icon: Send, url: 'https://t.me' },
            ].map((item, i) => (
              <Link
                key={i}
                href={item.url}
                target='_blank'
                className='w-9 h-9 flex items-center justify-center rounded-lg bg-white/5 text-gray-400 hover:bg-[#FCB900] hover:text-black transition-all transform hover:-translate-y-1 shadow-lg'
              >
                <item.Icon size={18} />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
