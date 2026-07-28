'use client'

import { MessageCircle } from 'lucide-react'

/**
 * Floating "Chat with us" button — bottom-right, marketing pages only.
 *
 * Uses the academy's existing WhatsApp link. If the number/link changes, update
 * WHATSAPP_LINK here. (Section CTAs still route to sign-up by design; this is the
 * one deliberate WhatsApp entry point.)
 */
const WHATSAPP_LINK = 'https://wa.link/7wim2w'

export default function WhatsAppFab() {
  return (
    <a
      href={WHATSAPP_LINK}
      target='_blank'
      rel='noopener noreferrer'
      aria-label='Chat with us on WhatsApp'
      className='fixed bottom-6 right-6 z-50 flex items-center gap-2 pl-3 pr-4 py-3 rounded-full bg-[#25D366] text-white font-black text-xs shadow-2xl shadow-green-500/30 hover:scale-105 active:scale-95 transition-transform group'
    >
      <span className='relative flex h-6 w-6 items-center justify-center'>
        <span className='absolute inline-flex h-full w-full rounded-full bg-white/40 opacity-75 animate-ping' />
        <MessageCircle size={18} className='relative' fill='currentColor' />
      </span>
      <span className='hidden sm:inline uppercase tracking-wide'>
        Chat with us
      </span>
    </a>
  )
}
