'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { GraduationCap, ArrowLeft } from 'lucide-react'

import { Card, CardContent } from '@/components/ui/card'
import StudentWizard from './StudentWizard'

export default function DSASignUp() {
  return (
    <div className='min-h-screen bg-[#F8FAFF] py-8 px-4 flex flex-col items-center'>
      <div className='w-full max-w-xl mb-4'>
        <Link
          href='/'
          className='inline-flex items-center gap-2 px-4 py-2 bg-white text-slate-500 hover:text-[#002EFF] rounded-xl shadow-sm border border-slate-100 text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 group'
        >
          <ArrowLeft size={14} className='group-hover:-translate-x-1 transition-transform' />
          Back to Home
        </Link>
      </div>

      <div className='text-center mb-6'>
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className='inline-flex p-2 bg-white rounded-xl shadow-sm mb-4'
        >
          <div className='bg-[#002EFF] text-white p-2 rounded-lg'>
            <GraduationCap size={24} />
          </div>
        </motion.div>
        <h1 className='text-2xl font-black text-slate-900'>Student Registration</h1>
        <p className='text-slate-500 text-sm font-medium'>
          Join the Distinguished Scholars Academy
        </p>
      </div>

      <Card className='w-full max-w-xl rounded-[24px] shadow-lg border-slate-100 overflow-hidden bg-white'>
        <CardContent className='p-6 md:p-8 space-y-6'>
          {/* Students self-register here. Tutors and guardians/parents are
              created by an admin from the admin panel. */}
          <StudentWizard />

          <div className='text-center pt-2 border-t border-slate-50'>
            <p className='text-gray-400 font-bold text-[10px] uppercase tracking-widest'>
              Already have an account?{' '}
              <Link href='/auth/signin' className='text-[#002EFF] ml-1 font-black hover:underline'>
                Sign in
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
