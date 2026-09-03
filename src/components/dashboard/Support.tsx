'use client'

// In-app support / customer-care contact form. Submits { subject, message } to
// POST /support (the backend routes it to support + emails a copy). Name & email
// come from the signed-in user. See docs/backend-requests-2026-09-03.md §7.

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import {
  LifeBuoy,
  Send,
  Loader2,
  Check,
  AlertCircle,
  Mail,
} from 'lucide-react'
import { dsaApi } from '@/lib/api'
import { getUser } from '@/lib/auth'

export default function Support() {
  const user = getUser()
  const name = user?.fullName || user?.username || ''
  const email = user?.email || ''

  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const submit = async () => {
    setError(null)
    if (subject.trim().length < 3) return setError('Add a short subject.')
    if (message.trim().length < 10)
      return setError('Tell us a bit more (at least 10 characters).')
    setBusy(true)
    try {
      await dsaApi.support.create({
        subject: subject.trim(),
        message: message.trim(),
      })
      setDone(true)
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : 'Could not send your message. Please try again.',
      )
    } finally {
      setBusy(false)
    }
  }

  if (done) {
    return (
      <div className='max-w-lg mx-auto'>
        <Card className='p-8 rounded-3xl border-none shadow-sm bg-white text-center'>
          <div className='h-14 w-14 mx-auto rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3'>
            <Check size={26} />
          </div>
          <p className='text-sm font-black text-slate-800 uppercase'>
            Message sent
          </p>
          <p className='text-[12px] font-bold text-slate-400 mt-1'>
            Our team will get back to you at {email || 'your email'}.
          </p>
          <button
            onClick={() => {
              setDone(false)
              setSubject('')
              setMessage('')
            }}
            className='mt-5 text-[11px] font-black uppercase text-[#002EFF]'
          >
            Send another
          </button>
        </Card>
      </div>
    )
  }

  return (
    <div className='max-w-lg mx-auto space-y-4'>
      <div>
        <h2 className='text-2xl font-black text-[#002EFF] italic uppercase flex items-center gap-2'>
          <LifeBuoy size={22} /> Support
        </h2>
        <p className='text-[11px] font-bold text-slate-400'>
          Have a question or an issue? Send us a message — we&apos;ll reply by
          email.
        </p>
      </div>

      <Card className='p-5 rounded-3xl border-none shadow-sm bg-white space-y-3'>
        <div className='flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2.5'>
          <Mail size={14} className='text-slate-400' />
          <span className='text-[11px] font-bold text-slate-500 truncate'>
            {name ? `${name} · ` : ''}
            {email || 'your account email'}
          </span>
        </div>

        <input
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder='Subject — e.g. Payment not reflecting'
          className='w-full h-11 px-3 rounded-lg bg-slate-50 border border-transparent focus:border-[#002EFF]/30 focus:bg-white outline-none text-sm font-bold'
        />
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder='Describe your question or issue…'
          rows={5}
          className='w-full px-3 py-2 rounded-lg bg-slate-50 border border-transparent focus:border-[#002EFF]/30 focus:bg-white outline-none text-sm font-medium resize-none'
        />

        {error && (
          <p className='flex items-center gap-1.5 text-[11px] font-bold text-rose-600'>
            <AlertCircle size={13} /> {error}
          </p>
        )}

        <button
          onClick={submit}
          disabled={busy}
          className='w-full flex items-center justify-center gap-2 h-12 bg-[#002EFF] text-white rounded-2xl font-black text-[11px] uppercase tracking-wide hover:bg-blue-700 active:scale-[0.98] disabled:opacity-50'
        >
          {busy ? (
            <Loader2 size={16} className='animate-spin' />
          ) : (
            <Send size={16} />
          )}
          Send message
        </button>
      </Card>
    </div>
  )
}
