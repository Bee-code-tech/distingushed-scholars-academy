'use client'

import { useState, useEffect, MouseEvent } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Menu, X, ArrowRight, ChevronUp } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import DSALogo from '../../imges/DSA_2026_WASSCE_WORKSHOP.png'

const navLinks = [
  { id: 'home', name: 'Home', href: '#home' },
  { id: 'about', name: 'About', href: '#about' },
  { id: 'programs', name: 'Programs', href: '#programs' },
  { id: 'tutors', name: 'Tutors', href: '#tutors' },
  { id: 'Quiz360Pro', name: 'Quiz360Pro', href: '#Quiz360Pro' },
  { id: 'contact', name: 'Contact', href: '#contact' },
]

export default function Header() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [activeSection, setActiveSection] = useState('home')
  const [scrollWidth, setScrollWidth] = useState(0)

  const handleSmoothScroll = (
    e: MouseEvent<HTMLAnchorElement | HTMLButtonElement> | null,
    id: string
  ) => {
    if (e) e.preventDefault()
    const element = document.getElementById(id)
    if (element) {
      const offset = 100
      const bodyRect = document.body.getBoundingClientRect().top
      const elementRect = element.getBoundingClientRect().top
      const elementPosition = elementRect - bodyRect
      const offsetPosition = elementPosition - offset

      window.scrollTo({ top: offsetPosition, behavior: 'smooth' })
    }
    setOpen(false)
  }

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY
      setScrolled(scrollY > 100)

      const winScroll =
        document.body.scrollTop || document.documentElement.scrollTop
      const height =
        document.documentElement.scrollHeight -
        document.documentElement.clientHeight
      const scrolledTotal = (winScroll / height) * 100
      setScrollWidth(scrolledTotal)

      const sections = navLinks.map((link) => document.getElementById(link.id))
      const scrollPosition = scrollY + 150

      sections.forEach((section) => {
        if (section) {
          const sectionTop = section.offsetTop
          const sectionHeight = section.offsetHeight
          if (
            scrollPosition >= sectionTop &&
            scrollPosition < sectionTop + sectionHeight
          ) {
            setActiveSection(section.id)
          }
        }
      })
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <>
      {/* 1. TOP HEADER */}
      <div className='fixed top-0 left-0 w-full z-50 px-4 py-4 md:px-6 lg:px-8'>
        <header
          className={`mx-auto max-w-7xl transition-all duration-700 ease-in-out relative ${
            scrolled
              ? 'bg-white/90 backdrop-blur-xl shadow-lg py-2 rounded-3xl border border-white/20'
              : 'bg-transparent py-4'
          }`}
        >
          {scrolled && (
            <div className='absolute bottom-0 left-1/2 -translate-x-1/2 w-[calc(100%-60px)] h-[3px] bg-[#002EFF]/5 overflow-hidden rounded-full'>
              <div
                className='h-full bg-[#002EFF] mx-auto rounded-full transition-all duration-700'
                style={{
                  width: `${scrollWidth}%`,
                  transitionTimingFunction: 'cubic-bezier(0.23, 1, 0.32, 1)',
                }}
              />
            </div>
          )}

          <div className='px-4 flex items-center justify-between'>
            <Link
              href='/'
              className='flex items-center gap-3 group transition-transform hover:scale-[1.02] shrink-0'
            >
              <div className='relative h-10 w-10 md:h-12 md:w-12'>
                <Image
                  src={DSALogo}
                  alt='DSA Logo'
                  fill
                  className='object-contain'
                  priority
                />
              </div>
              <div className='flex flex-col'>
                <span className='text-[#002EFF] font-black text-sm md:text-lg tracking-tighter leading-none'>
                  DISTINGUISHED
                </span>
                <span className='text-gray-500 font-bold text-[8px] md:text-[10px] tracking-widest uppercase'>
                  Scholars Academy
                </span>
              </div>
            </Link>

            <nav className='hidden md:flex items-center gap-1 bg-gray-100/50 p-1 rounded-2xl border border-gray-200/50 relative'>
              {navLinks.map((link) => (
                <a
                  key={link.id}
                  href={link.href}
                  onClick={(e) => handleSmoothScroll(e, link.id)}
                  className={`relative px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-colors duration-500 z-10 ${
                    activeSection === link.id
                      ? 'text-[#002EFF]'
                      : 'text-gray-400 hover:text-black'
                  }`}
                >
                  {link.name}
                  {activeSection === link.id && (
                    <motion.div
                      layoutId='nav-pill'
                      className='absolute inset-0 bg-white shadow-sm ring-1 ring-black/5 rounded-xl -z-10'
                      transition={{
                        type: 'spring',
                        bounce: 0.2,
                        duration: 0.6,
                      }}
                    />
                  )}
                </a>
              ))}
            </nav>

            <div className='flex items-center gap-4'>
              <Link
                href='https://wa.link/7wim2w'
                target='_blank'
                className='hidden md:flex items-center gap-2 px-6 py-3 bg-[#002EFF] text-white rounded-2xl font-black text-xs uppercase hover:bg-blue-600 transition-all active:scale-95 group'
              >
                Enrol Now{' '}
                <ArrowRight
                  size={14}
                  className='group-hover:translate-x-1 transition-transform'
                />
              </Link>
              <button
                onClick={() => setOpen(!open)}
                className='md:hidden p-2.5 bg-gray-100 text-[#002EFF] rounded-xl active:scale-90 transition-transform'
              >
                {open ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </header>
      </div>

      {/* 2. SIDE DOT NAVIGATION */}
      <nav className='fixed right-6 top-1/2 -translate-y-1/2 z-40 hidden lg:flex flex-col gap-4'>
        {navLinks.map((link) => (
          <button
            key={link.id}
            onClick={(e) => handleSmoothScroll(e, link.id)}
            className='group relative flex items-center justify-end'
          >
            <span
              className={`mr-4 text-[10px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0 ${
                activeSection === link.id ? 'text-[#002EFF]' : 'text-gray-400'
              }`}
            >
              {link.name}
            </span>
            <div
              className={`w-2.5 h-2.5 rounded-full border-2 transition-all duration-500 ${
                activeSection === link.id
                  ? 'bg-[#002EFF] border-[#002EFF] scale-150'
                  : 'bg-transparent border-gray-300 group-hover:border-[#002EFF]'
              }`}
            />
          </button>
        ))}
      </nav>

      {/* 3. BACK TO TOP */}
      <AnimatePresence>
        {scrolled && (
          <motion.button
            initial={{ opacity: 0, scale: 0.5, x: 20 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.5, x: 20 }}
            onClick={() => handleSmoothScroll(null, 'home')}
            className='fixed bottom-8 right-8 z-40 p-4 bg-white text-[#002EFF] border border-gray-100 shadow-2xl rounded-2xl hover:bg-[#002EFF] hover:text-white transition-all group'
          >
            <ChevronUp
              size={24}
              className='group-hover:-translate-y-1 transition-transform'
            />
          </motion.button>
        )}
      </AnimatePresence>

      {/* 4. COMPACT MOBILE MENU */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className='fixed inset-0 bg-[#002EFF]/10 backdrop-blur-md z-100 md:hidden'
            />
            <motion.div
              initial={{ x: '100%', opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: '100%', opacity: 0 }}
              transition={{ type: 'spring', damping: 28, stiffness: 220 }}
              className='fixed top-4 right-4 w-[85%] max-w-[320px] h-[calc(100vh-32px)] bg-white z-110 shadow-2xl flex flex-col md:hidden rounded-[2.5rem] border border-gray-100 overflow-hidden'
            >
              {/* Header inside Sidebar */}
              <div className='flex justify-between items-center p-6 pb-2'>
                <span className='font-black text-[#002EFF] tracking-[0.2em] text-[10px] uppercase'>
                  Menu
                </span>
                <button
                  onClick={() => setOpen(false)}
                  className='p-2 bg-gray-50 text-gray-400 rounded-xl active:scale-95'
                >
                  <X size={18} />
                </button>
              </div>

              {/* Scrollable Content Area */}
              <div className='flex-1 overflow-y-auto px-6 py-2 custom-scrollbar'>
                <div className='flex flex-col gap-1 mb-6'>
                  {navLinks.map((link, index) => (
                    <motion.button
                      key={link.id}
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.05 + index * 0.05 }}
                      onClick={(e) => handleSmoothScroll(e, link.id)}
                      className={`text-left px-5 py-3.5 rounded-2xl font-black uppercase tracking-widest text-[11px] transition-all group flex justify-between items-center ${
                        activeSection === link.id
                          ? 'bg-[#002EFF] text-white shadow-lg shadow-blue-200'
                          : 'text-gray-400 hover:text-black hover:bg-gray-50'
                      }`}
                    >
                      {link.name}
                      <ArrowRight
                        size={14}
                        className={`transition-transform duration-300 ${
                          activeSection === link.id
                            ? 'opacity-100 translate-x-0'
                            : 'opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0'
                        }`}
                      />
                    </motion.button>
                  ))}
                </div>

                <div className='pb-6'>
                  <div className='p-5 bg-blue-50/50 rounded-3xl mb-4'>
                    <p className='text-[#002EFF] font-bold text-[10px] uppercase tracking-wider mb-1'>
                      Success Awaits
                    </p>
                    <p className='text-gray-500 text-[10px] leading-tight'>
                      Ready to excel? Let's start your journey today.
                    </p>
                  </div>
                  <Link
                    href='https://wa.link/7wim2w'
                    target='_blank'
                    className='w-full py-4 bg-[#FCB900] text-black rounded-2xl font-black uppercase tracking-widest text-[11px] text-center flex items-center justify-center gap-2 shadow-lg hover:brightness-105 active:scale-95 transition-all'
                  >
                    Enrol Now <ArrowRight size={16} />
                  </Link>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 10px;
        }
      `}</style>
    </>
  )
}
