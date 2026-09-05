'use client'

// Admin payments — manage plans & their amounts, set the L1/L2 access caps, and
// review offline-payment proofs. See docs/payment-plan.md & backend-request-payments.md.

import { useCallback, useEffect, useState } from 'react'
import {
  Wallet,
  Plus,
  Trash2,
  Loader2,
  Check,
  X,
  Power,
  ExternalLink,
  SlidersHorizontal,
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { dsaApi } from '@/lib/api'
import { DEFAULT_CAPS, type AccessCaps } from '@/lib/access'

function adminToken(): string | undefined {
  if (typeof window === 'undefined') return undefined
  return (
    localStorage.getItem('admin_token') ||
    localStorage.getItem('token') ||
    undefined
  )
}
const str = (v: unknown) => (v == null ? '' : String(v))
const naira = (n: number) => `₦${(n || 0).toLocaleString()}`

export default function PaymentsAdmin() {
  const token = adminToken()
  return (
    <div className='max-w-4xl mx-auto space-y-6 px-1'>
      <div>
        <h1 className='text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2'>
          <Wallet size={20} className='text-[#002EFF]' /> Payments
        </h1>
        <p className='text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-1'>
          Plans · access caps · offline proof review
        </p>
      </div>
      <PlansSection token={token} />
      <CapsSection token={token} />
      <OfflineQueueSection token={token} />
    </div>
  )
}

/* ------------------------------ Plans ------------------------------ */
// Programme a plan is for. Empty = shown to every student. Values match the
// backend exam-track scoping (waec, jamb, postutme, undergrad, preclinical,
// afterschool).
const PLAN_TRACKS: { value: string; label: string }[] = [
  { value: '', label: 'All programmes' },
  { value: 'waec', label: 'WAEC' },
  { value: 'jamb', label: 'JAMB' },
  { value: 'postutme', label: 'Post-UTME' },
  { value: 'undergrad', label: '100 Level' },
  { value: 'preclinical', label: 'Preclinical' },
  { value: 'afterschool', label: 'After-School' },
]
const trackLabel = (v?: unknown) =>
  PLAN_TRACKS.find((t) => t.value === String(v ?? ''))?.label ?? String(v ?? '')

function PlansSection({ token }: { token?: string }) {
  const [plans, setPlans] = useState<Record<string, unknown>[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [kind, setKind] = useState<'portal' | 'tutorial'>('tutorial')
  const [amount, setAmount] = useState(8000)
  const [months, setMonths] = useState(1)
  const [track, setTrack] = useState('')
  const [note, setNote] = useState('')
  const [busy, setBusy] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      setPlans((await dsaApi.plans.adminList(token)) as Record<string, unknown>[])
      setError(null)
    } catch {
      setError('Plans endpoint not live yet — this will populate once the backend ships it.')
    } finally {
      setLoading(false)
    }
  }, [token])
  useEffect(() => {
    load()
  }, [load])

  const create = async () => {
    if (name.trim().length < 2) return setError('Enter a plan name.')
    setBusy(true)
    setError(null)
    try {
      await dsaApi.plans.create(
        {
          name: name.trim(),
          kind,
          amount: Number(amount) || 0,
          durationMonths: kind === 'portal' ? 0 : Number(months) || 1,
          grantsLevel: kind === 'portal' ? 'portal' : 'tutorial',
          track: track || undefined,
          note: note.trim() || undefined,
          active: true,
        },
        token,
      )
      setName('')
      setNote('')
      load()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not create the plan.')
    } finally {
      setBusy(false)
    }
  }

  const toggle = async (p: Record<string, unknown>) => {
    const id = str(p.id ?? p._id)
    try {
      await dsaApi.plans.update(id, { active: !p.active }, token)
      load()
    } catch {
      /* ignore */
    }
  }
  const remove = async (id: string) => {
    try {
      await dsaApi.plans.remove(id, token)
    } catch {
      /* ignore */
    }
    load()
  }

  return (
    <Card className='p-5 rounded-3xl border-none shadow-sm bg-white space-y-3'>
      <p className='text-[11px] font-black uppercase text-slate-500'>Payment plans</p>
      {error && <p className='text-[11px] font-bold text-amber-600'>{error}</p>}

      <div className='grid grid-cols-2 sm:grid-cols-6 gap-2'>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder='Plan name'
          className='col-span-2 h-10 px-3 rounded-lg bg-slate-50 outline-none text-sm font-bold'
        />
        <select
          value={kind}
          onChange={(e) => setKind(e.target.value as 'portal' | 'tutorial')}
          className='h-10 px-2 rounded-lg bg-slate-50 outline-none text-[12px] font-bold'
        >
          <option value='portal'>Portal (₦2k)</option>
          <option value='tutorial'>Tutorial</option>
        </select>
        <select
          value={track}
          onChange={(e) => setTrack(e.target.value)}
          title='Programme this plan is for'
          className='h-10 px-2 rounded-lg bg-slate-50 outline-none text-[12px] font-bold'
        >
          {PLAN_TRACKS.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
        <input
          type='number'
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value))}
          placeholder='Amount ₦'
          className='h-10 px-2 rounded-lg bg-slate-50 outline-none text-sm font-bold'
        />
        {kind === 'tutorial' ? (
          <input
            type='number'
            value={months}
            min={1}
            onChange={(e) => setMonths(Number(e.target.value))}
            title='Months'
            className='h-10 px-2 rounded-lg bg-slate-50 outline-none text-sm font-bold'
          />
        ) : (
          <div className='h-10 flex items-center text-[10px] font-bold text-slate-400'>
            one-time
          </div>
        )}
      </div>
      <input
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder='Short description (optional) — e.g. “2 months, ₦2k discount”'
        className='w-full h-10 px-3 rounded-lg bg-slate-50 outline-none text-sm font-medium'
      />
      <button
        onClick={create}
        disabled={busy}
        className='flex items-center gap-2 h-9 px-4 bg-[#002EFF] text-white rounded-lg font-black text-[10px] uppercase tracking-wide hover:bg-blue-700 disabled:opacity-50'
      >
        {busy ? <Loader2 size={13} className='animate-spin' /> : <Plus size={13} />}
        Add plan
      </button>

      <div className='space-y-1.5 pt-1'>
        {loading ? (
          <div className='py-4 flex justify-center'>
            <Loader2 className='animate-spin text-[#002EFF]' size={18} />
          </div>
        ) : plans.length === 0 ? (
          <p className='text-[11px] font-bold text-slate-400'>No plans yet.</p>
        ) : (
          plans.map((p) => {
            const id = str(p.id ?? p._id)
            return (
              <div
                key={id}
                className='flex items-center gap-2 p-2.5 rounded-xl bg-slate-50'
              >
                <div className='min-w-0 flex-1'>
                  <p className='text-xs font-black text-slate-800 truncate'>
                    {str(p.name)}
                  </p>
                  <p className='text-[10px] font-bold text-slate-400'>
                    {naira(Number(p.amount))}
                    {Number(p.durationMonths) > 0 && ` · ${str(p.durationMonths)} mo`}
                    {' · '}
                    {str(p.kind)}
                    {' · '}
                    {trackLabel(p.track)}
                  </p>
                  {p.note ? (
                    <p className='text-[10px] font-medium text-slate-500 truncate'>
                      {str(p.note)}
                    </p>
                  ) : null}
                </div>
                <button
                  onClick={() => toggle(p)}
                  className={`px-2 py-1 rounded-lg text-[9px] font-black uppercase ${
                    p.active
                      ? 'bg-emerald-50 text-emerald-600'
                      : 'bg-slate-200 text-slate-400'
                  }`}
                >
                  <Power size={10} className='inline' /> {p.active ? 'On' : 'Off'}
                </button>
                <button
                  onClick={() => remove(id)}
                  className='p-1 text-slate-300 hover:text-rose-500'
                >
                  <Trash2 size={13} />
                </button>
              </div>
            )
          })
        )}
      </div>
    </Card>
  )
}

/* ------------------------------ Caps ------------------------------ */
function CapsSection({ token }: { token?: string }) {
  const [caps, setCaps] = useState<AccessCaps>(DEFAULT_CAPS)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    ;(async () => {
      try {
        const c = (await dsaApi.payments.getCaps(token)) as Partial<AccessCaps>
        if (c && typeof c === 'object')
          setCaps((prev) => ({ ...prev, ...c }))
      } catch {
        /* use defaults until backend ships */
      }
    })()
  }, [token])

  const field = (key: keyof AccessCaps, label: string) => (
    <label className='flex items-center justify-between gap-2'>
      <span className='text-[11px] font-bold text-slate-500'>{label}</span>
      <input
        type='number'
        min={0}
        value={caps[key]}
        onChange={(e) =>
          setCaps((c) => ({ ...c, [key]: Number(e.target.value) }))
        }
        className='w-20 h-9 px-2 rounded-lg bg-slate-50 outline-none text-sm font-bold text-center'
      />
    </label>
  )

  const save = async () => {
    setSaving(true)
    try {
      await dsaApi.payments.setCaps(caps as unknown as Record<string, number>, token)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch {
      /* backend not live yet */
    } finally {
      setSaving(false)
    }
  }

  return (
    <Card className='p-5 rounded-3xl border-none shadow-sm bg-white space-y-3'>
      <p className='text-[11px] font-black uppercase text-slate-500 flex items-center gap-1.5'>
        <SlidersHorizontal size={14} /> Access caps (Free / Portal — Tutorial is unlimited)
      </p>
      <div className='grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2'>
        <p className='text-[10px] font-black uppercase text-slate-400 sm:col-span-2 mt-1'>
          Free (L1)
        </p>
        {field('freeTests', 'Free tests')}
        {field('freeMaterials', 'Learning materials')}
        {field('freeLiveClasses', 'Live classes')}
        <p className='text-[10px] font-black uppercase text-slate-400 sm:col-span-2 mt-2'>
          Portal Access (L2)
        </p>
        {field('portalTests', 'Tests')}
        {field('portalMaterials', 'Learning materials')}
        {field('portalLiveClasses', 'Live classes')}
      </div>
      <button
        onClick={save}
        disabled={saving}
        className='flex items-center gap-2 h-9 px-4 bg-[#002EFF] text-white rounded-lg font-black text-[10px] uppercase tracking-wide hover:bg-blue-700 disabled:opacity-50'
      >
        {saving ? (
          <Loader2 size={13} className='animate-spin' />
        ) : saved ? (
          <Check size={13} />
        ) : null}
        {saved ? 'Saved' : 'Save caps'}
      </button>
    </Card>
  )
}

/* ------------------------ Offline review queue ------------------------ */
function OfflineQueueSection({ token }: { token?: string }) {
  const [rows, setRows] = useState<Record<string, unknown>[]>([])
  const [loading, setLoading] = useState(true)
  const [note, setNote] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      setRows((await dsaApi.payments.offlineQueue(token)) as Record<string, unknown>[])
      setNote(null)
    } catch {
      setNote('Offline queue endpoint not live yet — proofs will appear here once it ships.')
    } finally {
      setLoading(false)
    }
  }, [token])
  useEffect(() => {
    load()
  }, [load])

  const review = async (id: string, decision: 'approve' | 'reject') => {
    setRows((r) => r.filter((x) => str(x.id ?? x._id) !== id))
    try {
      await dsaApi.payments.review(id, decision, token)
    } catch {
      load()
    }
  }

  return (
    <Card className='p-5 rounded-3xl border-none shadow-sm bg-white space-y-3'>
      <p className='text-[11px] font-black uppercase text-slate-500'>
        Offline payment proofs
      </p>
      {note && <p className='text-[11px] font-bold text-amber-600'>{note}</p>}
      {loading ? (
        <div className='py-4 flex justify-center'>
          <Loader2 className='animate-spin text-[#002EFF]' size={18} />
        </div>
      ) : rows.length === 0 ? (
        <p className='text-[11px] font-bold text-slate-400'>
          No pending proofs.
        </p>
      ) : (
        rows.map((r) => {
          const id = str(r.id ?? r._id)
          const proof = str(r.proofUrl)
          const who =
            str(
              (r.student as Record<string, unknown>)?.fullname ??
                r.studentName ??
                r.studentId,
            ) || 'Student'
          return (
            <div
              key={id}
              className='flex items-center gap-2 p-2.5 rounded-xl bg-slate-50'
            >
              <div className='min-w-0 flex-1'>
                <p className='text-xs font-black text-slate-800 truncate'>{who}</p>
                <p className='text-[10px] font-bold text-slate-400'>
                  {naira(Number(r.amount))} · {str(r.method) || 'offline'}
                  {r.reference ? ` · ${str(r.reference)}` : ''}
                </p>
              </div>
              {proof && (
                <a
                  href={proof}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='flex items-center gap-1 text-[10px] font-black text-[#002EFF] hover:underline'
                >
                  <ExternalLink size={11} /> Proof
                </a>
              )}
              <button
                onClick={() => review(id, 'approve')}
                className='p-1.5 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                title='Approve'
              >
                <Check size={14} />
              </button>
              <button
                onClick={() => review(id, 'reject')}
                className='p-1.5 rounded-lg bg-rose-50 text-rose-500 hover:bg-rose-100'
                title='Reject / disable'
              >
                <X size={14} />
              </button>
            </div>
          )
        })
      )}
    </Card>
  )
}
