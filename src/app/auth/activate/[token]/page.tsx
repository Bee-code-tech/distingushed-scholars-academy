'use client'

// The one-tap activation link an admin emails to a student who never entered
// their code. Opening it activates the account and signs them in.

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { GraduationCap, Loader2, CheckCircle2, AlertCircle } from 'lucide-react'
import { dsaApi, isBackendUnreachable } from '@/lib/api'
import { setSession, dashboardPathForRole } from '@/lib/auth'

export default function ActivatePage() {
  const { token } = useParams<{ token: string }>()
  const router = useRouter()
  const [state, setState] = useState<'working' | 'done' | 'failed'>('working')
  const [message, setMessage] = useState('')

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const data = await dsaApi.auth.activate(String(token || ''))
        if (cancelled) return
        if (data.token) {
          setSession({ token: data.token, user: data.user, role: data.user?.role || 'student' })
        }
        localStorage.removeItem('dsa_pending_email')
        localStorage.removeItem('dsa_pending_user')
        localStorage.removeItem('otp_expiry')
        setState('done')
        setTimeout(() => router.replace(dashboardPathForRole(data.user?.role || 'student')), 900)
      } catch (err) {
        if (cancelled) return
        setState('failed')
        setMessage(
          isBackendUnreachable(err)
            ? 'We could not reach the server. Check your connection and open the link again.'
            : err instanceof Error
              ? err.message
              : 'This link did not work.',
        )
      }
    })()
    return () => {
      cancelled = true
    }
  }, [token, router])

  return (
    <div className='min-h-screen bg-[#F8FAFF] flex flex-col items-center justify-center px-4 py-10'>
      <div className='w-full max-w-sm rounded-[24px] bg-white p-8 text-center shadow-lg border border-slate-100'>
        <div className='mx-auto mb-5 grid h-14 w-14 place-items-center rounded-2xl bg-[#002EFF] text-white'>
          <GraduationCap size={26} />
        </div>
        {state === 'working' && (
          <>
            <Loader2 className='mx-auto mb-3 animate-spin text-[#002EFF]' size={28} />
            <h1 className='text-lg font-black text-slate-900'>Activating your account…</h1>
            <p className='mt-1 text-[12px] font-medium text-slate-500'>One moment.</p>
          </>
        )}
        {state === 'done' && (
          <>
            <CheckCircle2 className='mx-auto mb-3 text-emerald-500' size={30} />
            <h1 className='text-lg font-black text-slate-900'>You&apos;re in</h1>
            <p className='mt-1 text-[12px] font-medium text-slate-500'>Your account is active. Opening your dashboard…</p>
          </>
        )}
        {state === 'failed' && (
          <>
            <AlertCircle className='mx-auto mb-3 text-rose-500' size={30} />
            <h1 className='text-lg font-black text-slate-900'>That link did not work</h1>
            <p className='mt-2 text-[12px] font-medium leading-relaxed text-slate-500'>{message}</p>
            <div className='mt-5 flex flex-col gap-2'>
              <Link href='/auth/signin' className='h-11 rounded-xl bg-[#002EFF] text-[11px] font-black uppercase leading-[44px] text-white hover:bg-blue-700'>
                Sign in
              </Link>
              <Link href='/auth/verify-otp' className='h-11 rounded-xl border border-slate-200 text-[11px] font-black uppercase leading-[44px] text-slate-600 hover:bg-slate-50'>
                Enter a code instead
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
