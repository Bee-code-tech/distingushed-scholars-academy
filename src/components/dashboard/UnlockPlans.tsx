'use client'

// "Unlock more features" — the student picks a plan and pays online (Paystack)
// or submits proof of an offline payment. See docs/payment-plan.md. Payment
// plans are admin-managed; while the backend has none we show sensible defaults.

import { useCallback, useEffect, useRef, useState } from 'react'
import {
  Loader2,
  Check,
  CreditCard,
  Upload,
  ArrowLeft,
  ShieldCheck,
  Sparkles,
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { dsaApi } from '@/lib/api'
import { getToken, getUser } from '@/lib/auth'
import { uploadToCloudinary } from '@/lib/cloudinary'
import { resumePaystack } from '@/lib/paystack'
import { accessLevel, LEVEL_LABEL } from '@/lib/access'

const str = (v: unknown) => (v == null ? '' : String(v))
const naira = (n: number) => `₦${(n || 0).toLocaleString()}`

interface Plan {
  id: string
  name: string
  kind: string // 'portal' | 'tutorial'
  amount: number // naira
  durationMonths: number
  grantsLevel: string
  note?: string
}

// Shown until the admin creates plans on the backend.
const DEFAULT_PLANS: Plan[] = [
  {
    id: 'portal',
    name: 'Portal Access',
    kind: 'portal',
    amount: 2000,
    durationMonths: 0,
    grantsLevel: 'portal',
    note: 'One-time — unlocks Community & more of the portal',
  },
  {
    id: 'silver',
    name: 'Silver — Essential Prep',
    kind: 'tutorial',
    amount: 8000,
    durationMonths: 1,
    grantsLevel: 'tutorial',
    note: 'Tutorial classes, assessments, CBT mock',
  },
  {
    id: 'gold',
    name: 'Gold — Complete Prep',
    kind: 'tutorial',
    amount: 12000,
    durationMonths: 1,
    grantsLevel: 'tutorial',
    note: 'Everything in Silver + parent portal & analytics',
  },
  {
    id: 'elite',
    name: 'Elite — Premium Prep',
    kind: 'tutorial',
    amount: 17000,
    durationMonths: 1,
    grantsLevel: 'tutorial',
    note: 'Everything in Gold + premium CBT & 1-on-1 support',
  },
]

function normalizePlan(raw: Record<string, unknown>): Plan {
  return {
    id: str(raw.id ?? raw._id),
    name: str(raw.name),
    kind: str(raw.kind) || 'tutorial',
    amount: Number(raw.amount) || 0,
    durationMonths: Number(raw.durationMonths) || 0,
    grantsLevel: str(raw.grantsLevel) || 'tutorial',
    note: raw.note ? str(raw.note) : undefined,
  }
}

export default function UnlockPlans() {
  const token = getToken() ?? undefined
  const level = accessLevel(getUser())
  const [plans, setPlans] = useState<Plan[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<Plan | null>(null)
  const [mode, setMode] = useState<'choose' | 'offline'>('choose')
  const [busy, setBusy] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState<string | null>(null)

  // Offline form
  const [proofUrl, setProofUrl] = useState('')
  const [reference, setReference] = useState('')
  const [amountPaid, setAmountPaid] = useState<number>(0)
  // Chosen subscription length for tutorial plans (1, 2 or 3 months).
  const [months, setMonths] = useState(1)
  const proofInput = useRef<HTMLInputElement | null>(null)

  // Tutorial plans are billed per month; portal access is a one-time fee.
  const isTutorial = selected?.kind === 'tutorial'
  const effectiveAmount = selected
    ? isTutorial
      ? selected.amount * months
      : selected.amount
    : 0

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const rows = (await dsaApi.plans.list(token)) as Record<string, unknown>[]
      setPlans(rows.length ? rows.map(normalizePlan) : DEFAULT_PLANS)
    } catch {
      setPlans(DEFAULT_PLANS) // backend plans not live yet — show defaults
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => {
    load()
  }, [load])

  const openPlan = (p: Plan) => {
    setSelected(p)
    setMode('choose')
    setError(null)
    setDone(null)
    setProofUrl('')
    setReference('')
    setMonths(1)
    setAmountPaid(p.amount)
  }

  const payOnline = async () => {
    if (!selected) return
    setError(null)
    setBusy(true)
    try {
      const res = (await dsaApi.payments.initOnline(
        {
          planId: selected.id,
          months: isTutorial ? months : selected.durationMonths || undefined,
          amount: effectiveAmount,
        },
        token,
      )) as { accessCode?: string }
      if (!res?.accessCode)
        throw new Error('Online payment is not available yet — please pay offline.')
      const outcome = await resumePaystack({ accessCode: res.accessCode })
      if (outcome.status === 'success') {
        setDone('Payment received. Your access will update shortly.')
        setSelected(null)
      } else if (outcome.status === 'cancelled') {
        setError('Payment cancelled.')
      } else {
        setError('Could not start the payment. Try offline instead.')
      }
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : 'Online payment is not available yet — please pay offline.',
      )
    } finally {
      setBusy(false)
    }
  }

  const onProof = async (file: File | null) => {
    if (!file) return
    setError(null)
    setUploading(true)
    try {
      const res = await uploadToCloudinary(file, 'dsa/payments')
      setProofUrl(res.url)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not upload the proof.')
    } finally {
      setUploading(false)
    }
  }

  const submitOffline = async () => {
    if (!selected) return
    if (!proofUrl) return setError('Please upload your proof of payment.')
    setError(null)
    setBusy(true)
    try {
      await dsaApi.payments.offline(
        {
          planId: selected.id,
          months: isTutorial ? months : selected.durationMonths || undefined,
          amount: amountPaid || effectiveAmount,
          method: 'offline',
          reference: reference || undefined,
          proofUrl,
        },
        token,
      )
      setDone(
        'Proof submitted. You have provisional access now — the admin will confirm your payment.',
      )
      setSelected(null)
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : 'Could not submit your proof. Please try again.',
      )
    } finally {
      setBusy(false)
    }
  }

  // ----- Detail (a plan is selected) -----
  if (selected) {
    return (
      <div className='max-w-lg mx-auto space-y-4'>
        <button
          onClick={() => setSelected(null)}
          className='flex items-center gap-1.5 text-[11px] font-black uppercase text-[#002EFF]'
        >
          <ArrowLeft size={14} /> All plans
        </button>

        <Card className='p-6 rounded-3xl border-none shadow-sm bg-[#002EFF] text-white'>
          <p className='text-[10px] font-black uppercase tracking-widest text-blue-200'>
            {selected.kind === 'portal' ? 'Portal Access' : 'Tutorial Plan'}
          </p>
          <h3 className='text-xl font-black mt-1'>{selected.name}</h3>
          <p className='text-3xl font-black mt-2'>
            {naira(effectiveAmount)}
            {isTutorial && (
              <span className='text-sm font-bold text-blue-200'>
                {' '}
                / {months} month{months === 1 ? '' : 's'}
              </span>
            )}
          </p>
          {selected.note && (
            <p className='text-[12px] text-blue-100 mt-2'>{selected.note}</p>
          )}
        </Card>

        {/* Duration — tutorial plans can be bought for 1, 2 or 3 months */}
        {isTutorial && (
          <Card className='p-3 rounded-2xl border-none shadow-sm bg-white'>
            <p className='text-[9px] font-black uppercase tracking-widest text-slate-400 mb-2'>
              Duration
            </p>
            <div className='grid grid-cols-3 gap-2'>
              {[1, 2, 3].map((m) => (
                <button
                  key={m}
                  onClick={() => {
                    setMonths(m)
                    setAmountPaid(selected.amount * m)
                  }}
                  className={`rounded-xl px-2 py-2.5 text-center border transition-all ${
                    months === m
                      ? 'bg-[#002EFF] text-white border-[#002EFF]'
                      : 'bg-slate-50 text-slate-600 border-transparent hover:border-[#002EFF]/30'
                  }`}
                >
                  <span className='block text-[13px] font-black'>
                    {m} month{m === 1 ? '' : 's'}
                  </span>
                  <span
                    className={`block text-[10px] font-bold ${months === m ? 'text-blue-100' : 'text-slate-400'}`}
                  >
                    {naira(selected.amount * m)}
                  </span>
                </button>
              ))}
            </div>
          </Card>
        )}

        {error && <p className='text-[11px] font-bold text-rose-600 px-1'>{error}</p>}

        {mode === 'choose' ? (
          <div className='grid grid-cols-1 gap-2'>
            <button
              onClick={payOnline}
              disabled={busy}
              className='flex items-center justify-center gap-2 h-12 bg-[#002EFF] text-white rounded-2xl font-black text-[11px] uppercase tracking-wide hover:bg-blue-700 disabled:opacity-50'
            >
              {busy ? (
                <Loader2 size={16} className='animate-spin' />
              ) : (
                <CreditCard size={16} />
              )}
              Pay Online
            </button>
            <button
              onClick={() => {
                setMode('offline')
                setError(null)
              }}
              className='flex items-center justify-center gap-2 h-12 bg-white border-2 border-slate-200 text-slate-700 rounded-2xl font-black text-[11px] uppercase tracking-wide hover:border-[#002EFF]/40'
            >
              <Upload size={16} /> I&apos;ve Paid Offline
            </button>
          </div>
        ) : (
          <Card className='p-5 rounded-3xl border-none shadow-sm bg-white space-y-3'>
            <p className='text-[11px] font-black uppercase text-slate-500'>
              Upload proof of payment
            </p>
            <p className='text-[11px] font-medium text-slate-400'>
              Bank teller, transfer receipt or screenshot. The admin will confirm
              it — you get access straight away.
            </p>
            <button
              onClick={() => proofInput.current?.click()}
              disabled={uploading}
              className={`w-full flex items-center justify-center gap-2 h-11 rounded-xl text-[11px] font-black uppercase tracking-wide ${
                proofUrl
                  ? 'bg-emerald-50 text-emerald-700'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              } disabled:opacity-50`}
            >
              {uploading ? (
                <Loader2 size={15} className='animate-spin' />
              ) : proofUrl ? (
                <Check size={15} />
              ) : (
                <Upload size={15} />
              )}
              {proofUrl ? 'Proof uploaded' : 'Upload receipt / teller'}
            </button>
            <input
              ref={proofInput}
              type='file'
              accept='image/*,.pdf'
              hidden
              onChange={(e) => onProof(e.target.files?.[0] ?? null)}
            />
            <label className='block'>
              <span className='text-[10px] font-black uppercase text-slate-400'>
                Amount paid (₦)
              </span>
              <input
                type='number'
                min={0}
                value={amountPaid || ''}
                onChange={(e) => setAmountPaid(Number(e.target.value))}
                placeholder={String(selected.amount)}
                className='w-full h-11 px-3 rounded-lg bg-slate-50 outline-none text-sm font-bold mt-1'
              />
            </label>
            <input
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              placeholder='Transfer / teller reference (optional)'
              className='w-full h-11 px-3 rounded-lg bg-slate-50 outline-none text-sm font-medium'
            />
            <button
              onClick={submitOffline}
              disabled={busy}
              className='w-full flex items-center justify-center gap-2 h-12 bg-[#002EFF] text-white rounded-2xl font-black text-[11px] uppercase tracking-wide hover:bg-blue-700 disabled:opacity-50'
            >
              {busy ? <Loader2 size={16} className='animate-spin' /> : <Check size={16} />}
              Submit proof
            </button>
          </Card>
        )}
      </div>
    )
  }

  // ----- List -----
  return (
    <div className='max-w-2xl mx-auto space-y-4'>
      <div className='flex items-center justify-between flex-wrap gap-2'>
        <div>
          <h2 className='text-2xl font-black text-[#002EFF] italic uppercase flex items-center gap-2'>
            <Sparkles size={22} /> Unlock More
          </h2>
          <p className='text-[10px] font-bold text-gray-400 uppercase tracking-widest'>
            Choose a plan to unlock more of the portal
          </p>
        </div>
        <span className='flex items-center gap-1.5 text-[10px] font-black uppercase px-3 py-1.5 rounded-full bg-blue-50 text-[#002EFF]'>
          <ShieldCheck size={12} /> {LEVEL_LABEL[level]}
        </span>
      </div>

      {done && (
        <div className='flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3'>
          <Check size={16} className='text-emerald-600 shrink-0' />
          <p className='text-[11px] font-bold text-emerald-700'>{done}</p>
        </div>
      )}

      {loading ? (
        <div className='py-10 flex justify-center'>
          <Loader2 className='animate-spin text-[#002EFF]' />
        </div>
      ) : (
        plans.map((p) => (
          <Card
            key={p.id}
            className='p-4 rounded-2xl border-none shadow-sm bg-white flex items-center gap-3'
          >
            <div className='min-w-0 flex-1'>
              <p className='text-sm font-black text-slate-800'>{p.name}</p>
              {p.note && (
                <p className='text-[11px] font-medium text-slate-400'>{p.note}</p>
              )}
            </div>
            <div className='text-right shrink-0'>
              <p className='text-base font-black text-[#002EFF]'>
                {naira(p.amount)}
              </p>
              {p.durationMonths > 0 && (
                <p className='text-[9px] font-bold text-slate-400 uppercase'>
                  / {p.durationMonths} mo
                </p>
              )}
            </div>
            <button
              onClick={() => openPlan(p)}
              className='h-10 px-4 bg-[#002EFF] text-white rounded-xl font-black text-[11px] uppercase tracking-wide hover:bg-blue-700'
            >
              Choose
            </button>
          </Card>
        ))
      )}
    </div>
  )
}
