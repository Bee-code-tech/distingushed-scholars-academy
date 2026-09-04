'use client'

// Support tickets — the in-app "Support / customer care" inbox. Visible to
// admins and to support agents (staff with the support.view permission). Closing
// a ticket needs support.manage (enforced by the backend too).

import { useCallback, useEffect, useState } from 'react'
import {
  LifeBuoy,
  Loader2,
  Mail,
  CheckCircle2,
  RotateCcw,
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { dsaApi } from '@/lib/api'
import { getUser } from '@/lib/auth'

const str = (v: unknown) => (v == null ? '' : String(v))

function supportToken(): string | undefined {
  if (typeof window === 'undefined') return undefined
  return (
    localStorage.getItem('admin_token') ||
    localStorage.getItem('token') ||
    undefined
  )
}

type Ticket = {
  id: string
  name: string
  email: string
  role?: string
  subject: string
  message: string
  status: string
  createdAt?: string
}

export default function SupportTickets() {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<'all' | 'open' | 'closed'>('open')
  const [busyId, setBusyId] = useState<string | null>(null)

  const u = getUser() as Record<string, unknown> | null
  const perms = Array.isArray(u?.permissions) ? (u!.permissions as string[]) : []
  const canManage =
    u?.role === 'admin' ||
    perms.includes('support.manage') ||
    perms.includes('staff.manage')

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const rows = (await dsaApi.support.list(
        filter === 'all' ? undefined : filter,
        supportToken(),
      )) as Record<string, unknown>[]
      setTickets(
        rows.map((t) => ({
          id: str(t.id ?? t._id),
          name: str(t.name),
          email: str(t.email),
          role: t.role ? str(t.role) : undefined,
          subject: str(t.subject),
          message: str(t.message),
          status: str(t.status) || 'open',
          createdAt: t.createdAt ? str(t.createdAt) : undefined,
        })),
      )
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : 'Could not load support tickets. You may not have permission.',
      )
    } finally {
      setLoading(false)
    }
  }, [filter])

  useEffect(() => {
    load()
  }, [load])

  const setStatus = async (id: string, status: 'open' | 'closed') => {
    setBusyId(id)
    try {
      await dsaApi.support.setStatus(id, status, supportToken())
      setTickets((prev) =>
        prev
          .map((t) => (t.id === id ? { ...t, status } : t))
          // If filtering by open/closed, drop the row that no longer matches.
          .filter((t) => filter === 'all' || t.status === filter),
      )
    } catch {
      /* leave as-is; a reload reflects the true state */
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div className='max-w-4xl mx-auto space-y-4 px-4'>
      <div className='flex items-start justify-between gap-3'>
        <div>
          <h1 className='text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2'>
            <LifeBuoy size={20} className='text-[#002EFF]' /> Support
          </h1>
          <p className='text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-1'>
            Messages from students, tutors &amp; guardians
          </p>
        </div>
        <div className='inline-flex rounded-xl bg-white border border-slate-200 p-0.5 shrink-0'>
          {(['open', 'closed', 'all'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 h-8 rounded-lg text-[10px] font-black uppercase tracking-wide ${
                filter === f ? 'bg-[#002EFF] text-white' : 'text-slate-500'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <p className='text-[11px] font-bold text-rose-600 px-1'>{error}</p>
      )}

      {loading ? (
        <div className='py-14 flex justify-center'>
          <Loader2 className='animate-spin text-[#002EFF]' />
        </div>
      ) : tickets.length === 0 ? (
        <Card className='p-10 rounded-2xl border-none shadow-sm bg-white flex flex-col items-center gap-2 text-center'>
          <LifeBuoy size={28} className='text-slate-300' />
          <p className='text-sm font-black text-slate-600'>
            No {filter === 'all' ? '' : filter} tickets
          </p>
          <p className='text-[11px] font-bold text-slate-400'>
            Support messages people send will show up here.
          </p>
        </Card>
      ) : (
        <div className='space-y-2'>
          {tickets.map((t) => {
            const closed = t.status === 'closed'
            return (
              <Card
                key={t.id}
                className={`p-4 rounded-2xl border border-slate-100 shadow-sm bg-white ${closed ? 'opacity-70' : ''}`}
              >
                <div className='flex items-start justify-between gap-3'>
                  <div className='min-w-0 flex-1'>
                    <div className='flex items-center gap-2 flex-wrap'>
                      <p className='text-sm font-black text-slate-800 truncate'>
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
                    <p className='text-[10px] font-bold text-slate-400 mt-0.5 flex items-center gap-1.5 flex-wrap'>
                      <span className='text-slate-600'>{t.name || 'Someone'}</span>
                      {t.role && <span className='uppercase'>· {t.role}</span>}
                      {t.email && (
                        <span className='inline-flex items-center gap-1'>
                          · <Mail size={10} /> {t.email}
                        </span>
                      )}
                      {t.createdAt && (
                        <span>
                          · {new Date(t.createdAt).toLocaleDateString()}
                        </span>
                      )}
                    </p>
                  </div>
                  {canManage && (
                    <button
                      onClick={() => setStatus(t.id, closed ? 'open' : 'closed')}
                      disabled={busyId === t.id}
                      className={`flex items-center gap-1 px-2.5 h-8 rounded-lg text-[10px] font-black uppercase shrink-0 disabled:opacity-50 ${
                        closed
                          ? 'bg-blue-50 text-[#002EFF]'
                          : 'bg-emerald-50 text-emerald-600'
                      }`}
                    >
                      {busyId === t.id ? (
                        <Loader2 size={12} className='animate-spin' />
                      ) : closed ? (
                        <>
                          <RotateCcw size={12} /> Reopen
                        </>
                      ) : (
                        <>
                          <CheckCircle2 size={12} /> Close
                        </>
                      )}
                    </button>
                  )}
                </div>
                <p className='text-[12px] font-medium text-slate-600 mt-2 whitespace-pre-wrap break-words'>
                  {t.message}
                </p>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
