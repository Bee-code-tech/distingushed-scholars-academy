'use client'

import {
  UserPlus,
  Compass,
  BookOpen,
  Presentation,
  ClipboardCheck,
  Timer,
  Award,
} from 'lucide-react'

// The student journey from sign-up to final exam. Generic process — reduces the
// "what happens after I enrol?" uncertainty parents have.
const STEPS = [
  { icon: UserPlus, title: 'Register', desc: 'Create your account and choose your exam track.' },
  { icon: Compass, title: 'Orientation', desc: 'Meet your tutors and learn how the programme works.' },
  { icon: BookOpen, title: 'Access Materials', desc: 'Get notes, e-books and past questions instantly.' },
  { icon: Presentation, title: 'Attend Classes', desc: 'Join live or on-campus lessons every week.' },
  { icon: ClipboardCheck, title: 'Weekly Assessments', desc: 'Track progress with regular tests and feedback.' },
  { icon: Timer, title: 'Mock Exams', desc: 'Practise full CBT simulations under real conditions.' },
  { icon: Award, title: 'Final Examination', desc: 'Walk in prepared, confident and ready to excel.' },
]

export default function AdmissionsTimeline() {
  return (
    <section
      id='how-it-works'
      className='w-full py-24 bg-white relative overflow-hidden'
    >
      <div className='max-w-6xl mx-auto px-6 md:px-12'>
        <div data-aos='fade-up' className='text-center mb-16'>
          <span className='inline-block px-4 py-1.5 bg-blue-50 rounded-full mb-4 border border-blue-100'>
            <span className='text-[#002EFF] text-[10px] font-black uppercase tracking-widest'>
              How It Works
            </span>
          </span>
          <h2 className='text-3xl md:text-4xl font-black text-gray-900 uppercase tracking-tight'>
            Your Path to <span className='text-[#002EFF]'>Success</span>
          </h2>
          <p className='text-gray-500 text-sm mt-3 max-w-md mx-auto font-medium'>
            A clear, step-by-step journey from the day you register to exam day.
          </p>
        </div>

        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5'>
          {STEPS.map((step, i) => {
            const Icon = step.icon
            return (
              <div
                key={step.title}
                data-aos='fade-up'
                data-aos-delay={(i % 4) * 80}
                className='relative p-6 rounded-3xl bg-[#f8f9ff] border border-transparent hover:border-[#002EFF]/20 hover:bg-white hover:shadow-xl transition-all group'
              >
                <span className='absolute top-4 right-5 text-4xl font-black text-blue-100 group-hover:text-[#FCB900]/40 transition-colors'>
                  {i + 1}
                </span>
                <div className='h-12 w-12 rounded-2xl bg-[#002EFF] text-white flex items-center justify-center mb-4 shadow-lg shadow-blue-200'>
                  <Icon size={22} strokeWidth={2.5} />
                </div>
                <h3 className='text-sm font-black text-gray-900 uppercase tracking-tight'>
                  {step.title}
                </h3>
                <p className='text-[11px] text-gray-500 mt-2 leading-relaxed font-medium'>
                  {step.desc}
                </p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
