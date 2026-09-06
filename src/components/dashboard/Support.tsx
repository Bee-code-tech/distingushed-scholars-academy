'use client'

// In-app support / customer care. A student submits { subject, message } to
// POST /support and then sees the conversation in-app: staff replies appear in
// the thread (GET /support) and the student can reply back
// (POST /support/:id/reply). See docs/backend-requests-2026-09-03.md §7.

import { useCallback, useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import {
  LifeBuoy,
  Send,
  Loader2,
  Check,
  AlertCircle,
  Mail,
  MessageSquare,
} from 'lucide-react'
import { dsaApi } from '@/lib/api'
import { getUser, getToken } from '@/lib/auth'

const str = (v: unknown) => (v == null ? '' : String(v))

type ThreadMessage = {
  authorRole?: string
  authorName?: string
  body: string
  createdAt?: string
}
type Ticket = {
  id: string
  subject: string
  message: string
  messages: ThreadMessage[]
  status: string
  createdAt?: string
}

function mapTicket(t: Record<string, unknown>): Ticket {
  const msgs = Array.isArray(t.messages)
    ? (t.messages as Record<string, unknown>[]).map((m) => ({
        authorRole: m.authorRole ? str(m.authorRole) : undefined,
        authorName: m.authorName ? str(m.authorName) : undefined,
        body: str(m.body),
        createdAt: m.createdAt ? str(m.createdAt) : undefined,
      }))
    : []
  return {
    id: str(t.id ?? t._id),
    subject: str(t.subject),
    message: str(t.message),
    messages: msgs,
    status: str(t.status) || 'open',
    createdAt: t.createdAt ? str(t.createdAt) : undefined,
  }
}

export default function Support() {
  const user = getUser()
  const name = user?.fullName || user?.username || ''
  const email = user?.email || ''

  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [tickets, setTickets] = useState<Ticket[]>([])
  const [loadingTickets, setLoadingTickets] = useState(true)
  const [replyText, setReplyText] = useState<Record<string, string>>({})
  const [replyingId, setReplyingId] = useState<string | null>(null)

  const loadTickets = useCallback(async () => {
    setLoadingTickets(true)
    try {
      const rows = (await dsaApi.support.listMine(
        getToken() || undefined,
      )) as Record<string, unknown>[]
      setTickets(rows.map(mapTicket))
    } catch {
      /* endpoint may not be live yet — the form still works */
    } finally {
      setLoadingTickets(false)
    }
  }, [])

  useEffect(() => {
    loadTickets()
  }, [loadTickets])

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
      setSubject('')
      setMessage('')
      setSent(true)
      setTimeout(() => setSent(false), 4000)
      loadTickets()
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

  const sendReply = async (id: string) => {
    const body = (replyText[id] || '').trim()
    if (!body) return
    setReplyingId(id)
    try {
      const updated = (await dsaApi.support.replyMine(
        id,
        body,
        getToken() || undefined,
      )) as Record<string, unknown>
      const shaped = mapTicket(updated)
      setTickets((prev) => prev.map((t) => (t.id === id ? shaped : t)))
      setReplyText((prev) => ({ ...prev, [id]: '' }))
    } catch {
      /* keep the draft for retry */
    } finally {
      setReplyingId(null)
    }
  }

  return (
    <div className='max-w-lg mx-auto space-y-4'>
      <div>
        <h2 className='text-2xl font-black text-[#002EFF] italic uppercase flex items-center gap-2'>
          <LifeBuoy size={22} /> Support
        </h2>
        <p className='text-[11px] font-bold text-slate-400'>
          Have a question or an issue? Send us a message — replies show up here.
        </p>
      </div>

      {/* New message */}
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
          rows={4}
          className='w-full px-3 py-2 rounded-lg bg-slate-50 border border-transparent focus:border-[#002EFF]/30 focus:bg-white outline-none text-sm font-medium resize-none'
        />

        {error && (
          <p className='flex items-center gap-1.5 text-[11px] font-bold text-rose-600'>
            <AlertCircle size={13} /> {error}
          </p>
        )}
        {sent && (
          <p className='flex items-center gap-1.5 text-[11px] font-bold text-emerald-600'>
            <Check size={13} /> Message sent — we&apos;ll reply here and by email.
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

      {/* Your messages / threads */}
      <div>
        <p className='text-[11px] font-black uppercase tracking-widest text-slate-400 px-1 mb-2 flex items-center gap-1.5'>
          <MessageSquare size={13} /> Your messages
        </p>

        {loadingTickets ? (
          <div className='py-8 flex justify-center'>
            <Loader2 className='animate-spin text-[#002EFF]' size={18} />
          </div>
        ) : tickets.length === 0 ? (
          <p className='text-[11px] font-bold text-slate-400 px-1'>
            No messages yet. Anything you send will appear here with our replies.
          </p>
        ) : (
          <div className='space-y-2'>
            {tickets.map((t) => {
              const closed = t.status === 'closed'
              return (
                <Card
                  key={t.id}
                  className='p-4 rounded-2xl border border-slate-100 shadow-sm bg-white'
                >
                  <div className='flex items-center gap-2 flex-wrap'>
                    <p className='text-sm font-black text-slate-800'>
                      {t.subject || '(no subject)'}
                    </p>
                    <span
                      className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full ${
                        closed
                          ? 'bg-slate-100 text-slate-400'
                          : 'bg-emerald-50 text-emerald-600'
                      }`}
                    >
                      {closed ? 'Closed' : 'Open'}
                    </span>
                  </div>

                  {/* Opener */}
                  <div className='mt-2 rounded-xl bg-slate-50 p-3 mr-6'>
                    <p className='text-[12px] font-medium text-slate-700 whitespace-pre-wrap break-words'>
                      {t.message}
                    </p>
                  </div>

                  {/* Thread */}
                  {t.messages.length > 0 && (
                    <div className='mt-2 space-y-2'>
                      {t.messages.map((m, i) => {
                        const fromStaff =
                          m.authorRole === 'admin' ||
                          m.authorRole === 'staff' ||
                          m.authorRole === 'moderator'
                        return (
                          <div
                            key={i}
                            className={`rounded-xl p-3 ${
                              fromStaff ? 'bg-blue-50 ml-6' : 'bg-slate-50 mr-6'
                            }`}
                          >
                            <p className='text-[9px] font-black uppercase tracking-wide text-slate-400 mb-1'>
                              {fromStaff ? 'Support' : 'You'}
                              {m.createdAt && (
                                <span className='text-slate-300'>
                                  {' '}
                                  · {new Date(m.createdAt).toLocaleString()}
                                </span>
                              )}
                            </p>
                            <p className='text-[12px] font-medium text-slate-700 whitespace-pre-wrap break-words'>
                              {m.body}
                            </p>
                          </div>
                        )
                      })}
                    </div>
                  )}

                  {/* Reply */}
                  <div className='mt-3 flex items-end gap-2'>
                    <textarea
                      value={replyText[t.id] || ''}
                      onChange={(e) =>
                        setReplyText((prev) => ({
                          ...prev,
                          [t.id]: e.target.value,
                        }))
                      }
                      placeholder='Reply…'
                      rows={2}
                      className='flex-1 rounded-xl bg-slate-50 border border-slate-200 focus:border-[#002EFF] focus:bg-white outline-none text-[12px] font-medium text-slate-800 px-3 py-2 resize-y'
                    />
                    <button
                      onClick={() => sendReply(t.id)}
                      disabled={
                        replyingId === t.id || !(replyText[t.id] || '').trim()
                      }
                      className='flex items-center gap-1.5 px-3 h-9 rounded-xl bg-[#002EFF] text-white font-black text-[10px] uppercase tracking-wide hover:bg-blue-700 disabled:opacity-40 shrink-0'
                    >
                      {replyingId === t.id ? (
                        <Loader2 size={13} className='animate-spin' />
                      ) : (
                        <>
                          <Send size={13} /> Reply
                        </>
                      )}
                    </button>
                  </div>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
