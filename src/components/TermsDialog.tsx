'use client'

// The Terms & Conditions pop-up. Reading it is optional — the sign-up form only
// needs the checkbox ticked — so this just has to be easy to open, scroll and
// close on a phone. Full-screen sheet below `sm`, centred card above.

import { useEffect } from 'react'
import { X, ScrollText } from 'lucide-react'
import { TERMS, TERMS_UPDATED } from '@/lib/terms'

export default function TermsDialog({
  open,
  onClose,
  onAccept,
}: {
  open: boolean
  onClose: () => void
  /** Optional: an "I agree" button that also ticks the box for the reader. */
  onAccept?: () => void
}) {
  // Escape closes; the page behind should not scroll while it is up.
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div className='fixed inset-0 z-[100] flex items-end justify-center sm:items-center sm:p-4'>
      <button
        className='absolute inset-0 bg-slate-900/50'
        onClick={onClose}
        aria-label='Close terms'
      />
      <div
        role='dialog'
        aria-modal='true'
        aria-labelledby='terms-title'
        className='relative flex h-[92dvh] w-full flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl sm:h-auto sm:max-h-[85vh] sm:max-w-2xl sm:rounded-3xl'
      >
        <div className='flex items-start gap-3 border-b border-slate-100 px-5 py-4'>
          <div className='grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-blue-50 text-[#002EFF]'>
            <ScrollText size={18} />
          </div>
          <div className='min-w-0 flex-1'>
            <h2 id='terms-title' className='text-[15px] font-black text-slate-900'>
              Terms &amp; Conditions
            </h2>
            <p className='text-[10px] font-bold uppercase tracking-wide text-slate-400'>
              Distinguished Scholars Academy · updated {TERMS_UPDATED}
            </p>
          </div>
          <button
            onClick={onClose}
            className='grid h-9 w-9 shrink-0 place-items-center rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-700'
            aria-label='Close'
          >
            <X size={18} />
          </button>
        </div>

        <div className='min-h-0 flex-1 overflow-y-auto px-5 py-4 custom-scrollbar'>
          <p className='mb-4 text-[12px] font-medium leading-relaxed text-slate-500'>
            The short version: be honest, be kind in the rooms, don&apos;t share our
            materials outside the academy, and we look after your information. The
            full terms are below.
          </p>
          <div className='space-y-5'>
            {TERMS.map((s) => (
              <section key={s.title}>
                <h3 className='mb-1.5 text-[12px] font-black text-slate-900'>{s.title}</h3>
                <div className='space-y-2'>
                  {s.body.map((p, i) => (
                    <p key={i} className='text-[12px] font-medium leading-relaxed text-slate-600'>
                      {p}
                    </p>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </div>

        <div className='flex gap-2 border-t border-slate-100 px-5 py-3'>
          <button
            onClick={onClose}
            className='h-11 flex-1 rounded-xl border border-slate-200 text-[11px] font-black uppercase text-slate-600 hover:bg-slate-50'
          >
            Close
          </button>
          {onAccept && (
            <button
              onClick={() => {
                onAccept()
                onClose()
              }}
              className='h-11 flex-1 rounded-xl bg-[#002EFF] text-[11px] font-black uppercase text-white hover:bg-blue-700'
            >
              I agree
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
