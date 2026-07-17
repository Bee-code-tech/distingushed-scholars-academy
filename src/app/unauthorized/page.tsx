'use client'

import Link from 'next/link'
import { ShieldAlert, ArrowLeft } from 'lucide-react'

export default function UnauthorizedPage() {
  return (
    <div className='min-h-screen flex items-center justify-center bg-neutralGrayLight dark:bg-neutralBlack px-6'>
      <div className='w-full max-w-md text-center'>
        <div className='inline-flex p-4 rounded-3xl bg-rose-50 dark:bg-rose-500/10 mb-6'>
          <ShieldAlert className='text-rose-500' size={40} />
        </div>
        <h1 className='text-2xl font-black uppercase tracking-tight text-neutralBlack dark:text-neutralWhite'>
          Access Denied
        </h1>
        <p className='mt-3 text-sm text-neutralGrayDark dark:text-gray-400'>
          You don&apos;t have permission to view this page. If you believe this
          is a mistake, please sign in with an authorized account.
        </p>
        <div className='mt-8 flex flex-col sm:flex-row gap-3 justify-center'>
          <Link
            href='/auth/signin'
            className='inline-flex items-center justify-center gap-2 rounded-xl bg-[#002EFF] px-5 py-3 text-xs font-black uppercase tracking-widest text-white transition hover:opacity-90'
          >
            Sign In
          </Link>
          <Link
            href='/'
            className='inline-flex items-center justify-center gap-2 rounded-xl border border-neutralGrayDark/20 px-5 py-3 text-xs font-black uppercase tracking-widest text-neutralGrayDark dark:text-gray-300 transition hover:bg-neutralWhite/50 dark:hover:bg-white/5'
          >
            <ArrowLeft size={14} /> Back to Home
          </Link>
        </div>
      </div>
    </div>
  )
}
