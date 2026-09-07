'use client'

// Landing-page section inviting visitors to take a free quiz. Links to the
// public /quizzes browse page where they pick from the available free quizzes
// and take one without an account.

import Link from 'next/link'
import { ArrowRight, HelpCircle, Sparkles } from 'lucide-react'

export default function FreeQuizCTA() {
  return (
    <section className='py-14 px-4'>
      <div className='max-w-6xl mx-auto'>
        <div className='relative overflow-hidden rounded-3xl bg-[#002EFF] text-white px-6 py-10 sm:px-12 sm:py-14 shadow-lg'>
          <div className='relative z-10 max-w-2xl'>
            <span className='inline-flex items-center gap-1.5 bg-[#FCB900] text-[#002EFF] text-[11px] font-black uppercase tracking-wide px-3 py-1 rounded-full'>
              <Sparkles size={13} /> Free · No account needed
            </span>
            <h2 className='text-3xl sm:text-4xl font-black tracking-tight mt-4 leading-tight'>
              Take a Free Quiz
            </h2>
            <p className='text-blue-100 mt-3 text-sm sm:text-base font-medium'>
              Test yourself in minutes. Pick from our available practice quizzes,
              answer, and get your score instantly — no sign-up required.
            </p>
            <Link
              href='/quizzes'
              className='inline-flex items-center gap-2 mt-6 bg-[#FCB900] text-[#002EFF] font-black text-sm rounded-xl px-6 h-12 shadow-lg shadow-yellow-500/20 hover:gap-3 active:scale-95 transition-all'
            >
              Browse free quizzes <ArrowRight size={18} />
            </Link>
          </div>
          <HelpCircle
            size={220}
            className='text-white/10 absolute -right-8 -bottom-10 rotate-12 pointer-events-none'
          />
        </div>
      </div>
    </section>
  )
}
