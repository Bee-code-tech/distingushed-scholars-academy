'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Header from '@/components/ui/Header'
import Footer from '@/components/ui/Footer'
import {
  ArrowRight,
  Zap,
  Clock,
  BarChart2,
  BookOpen,
  ShieldCheck,
  Brain,
  Flame,
  Target,
  TrendingUp,
  WifiOff,
  Trophy,
  CheckCircle2,
  GraduationCap,
  LogIn,
} from 'lucide-react'

// --- Services offered to everyone (from the product spec) ---
const services = [
  {
    icon: Clock,
    title: 'Real CBT Mode',
    desc: 'Exam-accurate simulation with a countdown timer, on-screen calculator, question flagging and instant scoring — just like the real JAMB hall.',
  },
  {
    icon: BookOpen,
    title: 'Practice Mode',
    desc: 'No pressure, no timer. Learn with hints, worked solutions and on-demand explanations so you understand the "why", not just the answer.',
  },
  {
    icon: ShieldCheck,
    title: 'Verified Answers',
    desc: 'Every answer is checked. No more studying wrong solutions — accuracy is the one thing we never compromise on.',
  },
  {
    icon: BarChart2,
    title: 'Huge Question Bank',
    desc: 'Thousands of past questions filterable by year, subject, topic, difficulty and institution across JAMB, WAEC, NECO and Post-UTME.',
  },
  {
    icon: Brain,
    title: 'AI Explanations',
    desc: 'Stuck on a question? Ask for a step-by-step breakdown that teaches the concept — your personal tutor, available any time.',
  },
  {
    icon: WifiOff,
    title: 'Offline Access',
    desc: 'Download materials and practice with little or no data — built for real Nigerian network conditions.',
  },
]

// --- How the JAMB quiz actually improves a student ---
const jambSteps = [
  {
    icon: Target,
    title: 'Practise under real conditions',
    desc: 'Sit full CBT mocks with the same timing and interface as JAMB, so exam day feels familiar instead of frightening.',
  },
  {
    icon: TrendingUp,
    title: 'See exactly where you are weak',
    desc: 'After every test we break down your accuracy and speed per subject and topic, then point you to the areas losing you marks.',
  },
  {
    icon: Brain,
    title: 'Understand, then master',
    desc: 'Verified worked solutions and AI explanations turn every wrong answer into a lesson — you improve on the topics that matter.',
  },
  {
    icon: GraduationCap,
    title: 'Track your projected score',
    desc: 'Watch your projected JAMB score climb as you practise, and compare yourself on the national leaderboard.',
  },
]

const jambBenefits = [
  'JAMB, WAEC, NECO & Post-UTME — all in one place',
  'Beat exam anxiety by rehearsing the real CBT experience',
  'Fix weak topics with targeted, verified practice',
  'Build speed so you finish every section on time',
  'Daily streaks, XP and badges to keep you consistent',
  'National, state and school leaderboards to push you further',
]

const tiers = [
  {
    name: 'Free',
    price: '₦0',
    period: 'forever',
    highlight: false,
    features: [
      '100 questions / day',
      'Basic CBT & practice mode',
      'Community leaderboard',
      'Limited explanations',
    ],
    cta: 'Start Free',
    href: '/auth/signup',
  },
  {
    name: 'Gold',
    price: '₦2,000',
    period: '/ month',
    highlight: true,
    features: [
      'Unlimited questions',
      'Full worked explanations',
      'Study notes & materials',
      'Performance dashboard',
    ],
    cta: 'Go Gold',
    href: '/auth/signup',
  },
  {
    name: 'Platinum',
    price: '₦4,000',
    period: '/ month',
    highlight: false,
    features: [
      'Everything in Gold',
      'AI tutor & study planner',
      'Unlimited mock exams',
      'Detailed analytics',
    ],
    cta: 'Go Platinum',
    href: '/auth/signup',
  },
]

export default function Quiz360ProLanding() {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  if (!mounted) return <div className='min-h-screen bg-[#F8FAFF]' />

  return (
    <main className='relative bg-white'>
      <Header />

      {/* ================= HERO ================= */}
      <section className='relative overflow-hidden bg-[#f8f9ff] pt-32 pb-20 md:pt-40 md:pb-28'>
        <div className='absolute -top-24 -right-24 w-96 h-96 bg-[#002EFF]/5 rounded-full blur-3xl pointer-events-none' />
        <div className='absolute -bottom-24 -left-24 w-96 h-96 bg-[#FCB900]/10 rounded-full blur-3xl pointer-events-none' />

        <div className='relative z-10 max-w-4xl mx-auto px-6 text-center'>
          <div
            data-aos='fade-up'
            className='inline-flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-full mb-6 border border-blue-100'
          >
            <span className='w-2 h-2 bg-[#002EFF] rounded-full' />
            <span className='text-[#002EFF] text-[10px] md:text-xs font-black uppercase tracking-[0.2em]'>
              Quiz360Pro · Nigeria's Smart CBT Platform
            </span>
          </div>

          <h1
            data-aos='fade-up'
            data-aos-delay='100'
            className='text-3xl md:text-5xl font-black text-gray-900 leading-[1.1] tracking-tight'
          >
            Pass JAMB, WAEC & Post-UTME with{' '}
            <span className='text-[#002EFF]'>confidence</span>.
          </h1>

          <p
            data-aos='fade-up'
            data-aos-delay='200'
            className='mt-6 text-base md:text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed font-medium'
          >
            Quiz360Pro is a complete CBT practice platform built for Nigerian
            students. Simulate the real exam, study smarter with verified
            answers and AI explanations, and watch your score climb.
          </p>

          <div
            data-aos='fade-up'
            data-aos-delay='300'
            className='mt-10 flex flex-col sm:flex-row items-center justify-center gap-4'
          >
            <Link
              href='/rapid-quiz'
              className='w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 bg-[#FCB900] text-black rounded-2xl font-black text-sm uppercase tracking-wide shadow-xl shadow-yellow-100 hover:bg-[#002EFF] hover:text-white transition-all active:scale-95 group'
            >
              <Zap size={18} />
              Try a Free CBT Now
              <ArrowRight
                size={18}
                className='group-hover:translate-x-1 transition-transform'
              />
            </Link>
            <Link
              href='/auth/signin'
              className='w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 border-2 border-gray-200 bg-white text-gray-700 rounded-2xl font-bold text-sm uppercase tracking-wide hover:border-[#002EFF] hover:text-[#002EFF] transition-all active:scale-95'
            >
              <LogIn size={18} />
              Login to Portal
            </Link>
          </div>

          <p
            data-aos='fade-up'
            data-aos-delay='400'
            className='mt-6 text-xs text-gray-400 font-semibold uppercase tracking-widest'
          >
            No sign-up needed to try · Free plan available
          </p>
        </div>
      </section>

      {/* ================= SERVICES FOR EVERYONE ================= */}
      <section className='py-20 md:py-28 bg-white'>
        <div className='max-w-6xl mx-auto px-6'>
          <div className='text-center mb-14'>
            <p
              data-aos='fade-up'
              className='text-[#002EFF] text-xs font-black uppercase tracking-[0.2em] mb-3'
            >
              What you get
            </p>
            <h2
              data-aos='fade-up'
              data-aos-delay='100'
              className='text-3xl md:text-4xl font-black text-gray-900 tracking-tight'
            >
              One platform for every exam
            </h2>
            <div className='w-20 h-1.5 bg-[#FCB900] mx-auto mt-4 rounded-full' />
            <p
              data-aos='fade-up'
              data-aos-delay='200'
              className='mt-5 text-gray-500 max-w-2xl mx-auto font-medium'
            >
              Whether you are preparing for JAMB, WAEC, NECO or a Post-UTME
              screening, Quiz360Pro gives every student the same powerful tools.
            </p>
          </div>

          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'>
            {services.map((s, i) => {
              const Icon = s.icon
              return (
                <div
                  key={s.title}
                  data-aos='fade-up'
                  data-aos-delay={i * 60}
                  className='group bg-white p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-blue-50 hover:border-[#002EFF]/20 transition-all'
                >
                  <div className='w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-[#002EFF] transition-colors'>
                    <Icon
                      size={26}
                      className='text-[#002EFF] group-hover:text-white transition-colors'
                    />
                  </div>
                  <h3 className='text-lg font-black text-gray-900 tracking-tight'>
                    {s.title}
                  </h3>
                  <p className='text-gray-500 mt-2 text-sm leading-relaxed font-medium'>
                    {s.desc}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ================= JAMB-FOCUSED SECTION ================= */}
      <section className='py-20 md:py-28 bg-[#f8f9ff] relative overflow-hidden'>
        <div className='absolute top-0 right-0 w-80 h-80 bg-[#002EFF]/5 rounded-full blur-3xl pointer-events-none' />
        <div className='max-w-6xl mx-auto px-6 relative z-10'>
          <div className='text-center mb-16'>
            <div
              data-aos='fade-up'
              className='inline-flex items-center gap-2 px-4 py-2 bg-[#002EFF] rounded-full mb-4'
            >
              <GraduationCap size={16} className='text-[#FCB900]' />
              <span className='text-white text-[10px] md:text-xs font-black uppercase tracking-[0.2em]'>
                For Jambites
              </span>
            </div>
            <h2
              data-aos='fade-up'
              data-aos-delay='100'
              className='text-3xl md:text-4xl font-black text-gray-900 tracking-tight max-w-3xl mx-auto'
            >
              How Quiz360Pro raises your{' '}
              <span className='text-[#002EFF]'>JAMB score</span>
            </h2>
            <p
              data-aos='fade-up'
              data-aos-delay='200'
              className='mt-5 text-gray-500 max-w-2xl mx-auto font-medium'
            >
              JAMB is a race against the clock. We don't just give you questions
              — we train you to be faster, more accurate and exam-ready.
            </p>
          </div>

          {/* 4-step improvement journey */}
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16'>
            {jambSteps.map((step, i) => {
              const Icon = step.icon
              return (
                <div
                  key={step.title}
                  data-aos='fade-up'
                  data-aos-delay={i * 80}
                  className='relative bg-white p-7 rounded-3xl border border-gray-100 shadow-sm'
                >
                  <span className='absolute -top-3 -left-2 w-9 h-9 bg-[#FCB900] text-black rounded-xl flex items-center justify-center font-black text-sm shadow-md'>
                    {i + 1}
                  </span>
                  <div className='w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center mb-5 mt-2'>
                    <Icon size={22} className='text-[#002EFF]' />
                  </div>
                  <h3 className='font-black text-gray-900 tracking-tight leading-snug'>
                    {step.title}
                  </h3>
                  <p className='text-gray-500 mt-2 text-sm leading-relaxed font-medium'>
                    {step.desc}
                  </p>
                </div>
              )
            })}
          </div>

          {/* Benefit checklist + highlight card */}
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch'>
            <div
              data-aos='fade-right'
              className='bg-white rounded-3xl border border-gray-100 shadow-sm p-8 md:p-10'
            >
              <h3 className='text-xl font-black text-gray-900 tracking-tight mb-6'>
                Why Jambites choose Quiz360Pro
              </h3>
              <ul className='space-y-4'>
                {jambBenefits.map((b) => (
                  <li key={b} className='flex items-start gap-3'>
                    <CheckCircle2
                      size={20}
                      className='text-[#002EFF] shrink-0 mt-0.5'
                    />
                    <span className='text-gray-600 font-medium text-sm md:text-base'>
                      {b}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div
              data-aos='fade-left'
              className='bg-[#002EFF] rounded-3xl p-8 md:p-10 text-white flex flex-col justify-between shadow-xl shadow-blue-200'
            >
              <div>
                <div className='flex items-center gap-3 mb-6'>
                  <Trophy size={28} className='text-[#FCB900]' />
                  <Flame size={28} className='text-[#FCB900]' />
                </div>
                <h3 className='text-2xl font-black tracking-tight leading-tight'>
                  Turn practice into results.
                </h3>
                <p className='mt-4 text-blue-100 font-medium leading-relaxed'>
                  Students who practise consistently with realistic mocks walk
                  into the exam hall calmer and finish on time. Build the habit
                  with daily streaks, then prove it on the national leaderboard.
                </p>
              </div>
              <Link
                href='/rapid-quiz'
                className='mt-8 inline-flex items-center justify-center gap-2 px-8 py-4 bg-[#FCB900] text-black rounded-2xl font-black text-sm uppercase tracking-wide hover:bg-white transition-all active:scale-95 group'
              >
                Take a Free JAMB Mock
                <ArrowRight
                  size={18}
                  className='group-hover:translate-x-1 transition-transform'
                />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ================= PRICING ================= */}
      <section className='py-20 md:py-28 bg-white'>
        <div className='max-w-6xl mx-auto px-6'>
          <div className='text-center mb-14'>
            <p
              data-aos='fade-up'
              className='text-[#002EFF] text-xs font-black uppercase tracking-[0.2em] mb-3'
            >
              Simple pricing
            </p>
            <h2
              data-aos='fade-up'
              data-aos-delay='100'
              className='text-3xl md:text-4xl font-black text-gray-900 tracking-tight'
            >
              Start free. Upgrade when you're ready.
            </h2>
            <div className='w-20 h-1.5 bg-[#FCB900] mx-auto mt-4 rounded-full' />
          </div>

          <div className='grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto'>
            {tiers.map((tier, i) => (
              <div
                key={tier.name}
                data-aos='fade-up'
                data-aos-delay={i * 80}
                className={`relative rounded-3xl p-8 border transition-all ${
                  tier.highlight
                    ? 'bg-[#002EFF] text-white border-[#002EFF] shadow-xl shadow-blue-200 md:-translate-y-3'
                    : 'bg-white text-gray-900 border-gray-100 shadow-sm'
                }`}
              >
                {tier.highlight && (
                  <span className='absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-[#FCB900] text-black rounded-full text-[10px] font-black uppercase tracking-widest'>
                    Most Popular
                  </span>
                )}
                <h3
                  className={`text-lg font-black uppercase tracking-tight ${tier.highlight ? 'text-[#FCB900]' : 'text-[#002EFF]'}`}
                >
                  {tier.name}
                </h3>
                <div className='mt-3 flex items-end gap-1'>
                  <span className='text-4xl font-black tracking-tight'>
                    {tier.price}
                  </span>
                  <span
                    className={`mb-1 text-sm font-bold ${tier.highlight ? 'text-blue-100' : 'text-gray-400'}`}
                  >
                    {tier.period}
                  </span>
                </div>
                <ul className='mt-6 space-y-3'>
                  {tier.features.map((f) => (
                    <li key={f} className='flex items-start gap-2.5'>
                      <CheckCircle2
                        size={18}
                        className={`shrink-0 mt-0.5 ${tier.highlight ? 'text-[#FCB900]' : 'text-[#002EFF]'}`}
                      />
                      <span
                        className={`text-sm font-medium ${tier.highlight ? 'text-blue-50' : 'text-gray-600'}`}
                      >
                        {f}
                      </span>
                    </li>
                  ))}
                </ul>
                <Link
                  href={tier.href}
                  className={`mt-8 flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl font-black text-sm uppercase tracking-wide transition-all active:scale-95 ${
                    tier.highlight
                      ? 'bg-[#FCB900] text-black hover:bg-white'
                      : 'bg-gray-900 text-white hover:bg-[#002EFF]'
                  }`}
                >
                  {tier.cta}
                </Link>
              </div>
            ))}
          </div>
          <p className='text-center text-xs text-gray-400 font-semibold mt-8'>
            Annual plans available at a discount · Pay with Paystack, Flutterwave
            or bank transfer
          </p>
        </div>
      </section>

      {/* ================= FINAL CTA ================= */}
      <section className='py-20 md:py-24 bg-[#f8f9ff]'>
        <div
          data-aos='zoom-in'
          className='max-w-4xl mx-auto px-6 text-center'
        >
          <h2 className='text-3xl md:text-4xl font-black text-gray-900 tracking-tight'>
            Ready to start practising?
          </h2>
          <p className='mt-4 text-gray-500 font-medium max-w-xl mx-auto'>
            Create your free account in under a minute, or log in to pick up
            where you left off.
          </p>
          <div className='mt-9 flex flex-col sm:flex-row items-center justify-center gap-4'>
            <Link
              href='/auth/signup'
              className='w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 bg-[#002EFF] text-white rounded-2xl font-black text-sm uppercase tracking-wide shadow-xl shadow-blue-200 hover:bg-blue-700 transition-all active:scale-95 group'
            >
              Create Free Account
              <ArrowRight
                size={18}
                className='group-hover:translate-x-1 transition-transform'
              />
            </Link>
            <Link
              href='/auth/signin'
              className='w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 border-2 border-gray-200 bg-white text-gray-700 rounded-2xl font-bold text-sm uppercase tracking-wide hover:border-[#002EFF] hover:text-[#002EFF] transition-all active:scale-95'
            >
              <LogIn size={18} />
              I already have an account
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
