'use client'

import React, { useEffect, useState } from 'react'
import {
  Users,
  User,
  AtSign,
  Mail,
  Phone,
  Lock,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  GraduationCap,
} from 'lucide-react'
import { dsaApi } from '@/lib/api'
import { getStudents, type StoredStudent } from '@/lib/studentsStore'
import { addGuardian } from '@/lib/directoryStore'

interface FieldState {
  fullname: string
  username: string
  email: string
  phone: string
  wardKey: string
  password: string
}

const EMPTY: FieldState = {
  fullname: '',
  username: '',
  email: '',
  phone: '',
  wardKey: '',
  password: '',
}

// Readable suggestion so admins don't invent one; the guardian resets it later.
function suggestPassword() {
  return 'DSAparent' + Math.floor(1000 + ((Date.now() / 1000) % 9000))
}

export default function CreateGuardian() {
  const [values, setValues] = useState<FieldState>(EMPTY)
  const [students, setStudents] = useState<StoredStudent[]>([])
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Ward list comes from the students store (same source the tutor roster uses).
  useEffect(() => setStudents(getStudents()), [])

  const set = (k: keyof FieldState, v: string) =>
    setValues((prev) => ({ ...prev, [k]: v }))

  const validate = (): string | null => {
    if (values.fullname.trim().length < 2) return 'Enter the guardian’s full name'
    if (!/^[a-zA-Z0-9_]{3,}$/.test(values.username))
      return 'Username: min 3 characters, letters/numbers/underscore only'
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(values.email))
      return 'Enter a valid email address'
    if (!/^\d{10,}$/.test(values.phone))
      return 'Enter a valid phone number (numbers only)'
    if (!values.wardKey) return 'Select the ward (student) this guardian oversees'
    if (values.password.length < 6) return 'Password must be at least 6 characters'
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    const problem = validate()
    if (problem) {
      setError(problem)
      return
    }

    setLoading(true)
    try {
      // Admin creates the guardian via register with role 'parent' and the
      // ward link. NOTE: a dedicated admin-only "create user" endpoint + a
      // server-verified ward relationship are requested in
      // docs/backend-requests.md (§5). The ward link MUST be verified backend-
      // side — a guardian must not see a child's data just by naming them.
      await dsaApi.auth.register({
        name: values.fullname,
        username: values.username.toLowerCase(),
        email: values.email.toLowerCase(),
        password: values.password,
        phoneNumber: values.phone,
        role: 'parent',
        wardId: values.wardKey,
      })

      const ward = students.find((s) => s.key === values.wardKey)
      // Record locally so the admin's "View Guardians" list shows them.
      addGuardian({
        key: values.username.toLowerCase(),
        name: values.fullname,
        email: values.email.toLowerCase(),
        extra: ward?.name,
      })

      setSuccess(
        `Guardian "${values.fullname}" created${
          ward ? ` for ${ward.name}` : ''
        }. They can now sign in with ${values.email.toLowerCase()}.`,
      )
      setValues(EMPTY)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create guardian.')
    } finally {
      setLoading(false)
    }
  }

  const Field = ({
    icon: Icon,
    label,
    value,
    onChange,
    placeholder,
    type = 'text',
  }: {
    icon: React.ElementType
    label: string
    value: string
    onChange: (v: string) => void
    placeholder: string
    type?: string
  }) => (
    <div className='space-y-1.5'>
      <label className='text-[10px] font-black uppercase tracking-widest text-slate-400'>
        {label}
      </label>
      <div className='relative'>
        <Icon
          className='absolute left-3 top-1/2 -translate-y-1/2 text-slate-400'
          size={15}
        />
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className='w-full h-11 pl-9 pr-3 rounded-lg bg-slate-50 border border-transparent focus:border-[#002EFF]/30 focus:bg-white outline-none text-sm font-medium transition-all'
        />
      </div>
    </div>
  )

  return (
    <div className='max-w-2xl mx-auto'>
      <div className='flex items-center gap-3 mb-6'>
        <div className='h-11 w-11 rounded-2xl bg-[#002EFF] text-white flex items-center justify-center shadow-lg shadow-blue-200'>
          <Users size={20} />
        </div>
        <div>
          <h2 className='text-xl font-black text-slate-900 uppercase tracking-tight'>
            Create Guardian
          </h2>
          <p className='text-[11px] font-bold text-slate-400'>
            Add a parent/guardian account and link them to their ward.
          </p>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className='bg-white rounded-3xl border border-slate-100 shadow-sm p-6 md:p-8 space-y-5'
      >
        {success && (
          <div className='flex items-center gap-2 p-3 rounded-xl bg-emerald-50 text-emerald-700 text-[11px] font-bold'>
            <CheckCircle2 size={16} className='shrink-0' /> {success}
          </div>
        )}
        {error && (
          <div className='flex items-center gap-2 p-3 rounded-xl bg-rose-50 text-rose-600 text-[11px] font-bold'>
            <AlertCircle size={16} className='shrink-0' /> {error}
          </div>
        )}

        <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
          <Field
            icon={User}
            label='Full Name'
            value={values.fullname}
            onChange={(v) => set('fullname', v)}
            placeholder='e.g. Mrs. Adeyemi'
          />
          <Field
            icon={AtSign}
            label='Username'
            value={values.username}
            onChange={(v) => set('username', v)}
            placeholder='mrs_adeyemi'
          />
          <Field
            icon={Mail}
            label='Email'
            type='email'
            value={values.email}
            onChange={(v) => set('email', v)}
            placeholder='guardian@example.com'
          />
          <Field
            icon={Phone}
            label='Phone'
            value={values.phone}
            onChange={(v) => set('phone', v)}
            placeholder='08012345678'
          />

          {/* Ward (student) link */}
          <div className='space-y-1.5 sm:col-span-2'>
            <label className='text-[10px] font-black uppercase tracking-widest text-slate-400'>
              Ward (Student)
            </label>
            <div className='relative'>
              <GraduationCap
                className='absolute left-3 top-1/2 -translate-y-1/2 text-slate-400'
                size={15}
              />
              <select
                value={values.wardKey}
                onChange={(e) => set('wardKey', e.target.value)}
                className='w-full h-11 pl-9 pr-3 rounded-lg bg-slate-50 border border-transparent focus:border-[#002EFF]/30 focus:bg-white outline-none text-sm font-bold transition-all'
              >
                <option value=''>Select the student to link…</option>
                {students.map((s) => (
                  <option key={s.key} value={s.key}>
                    {s.name} — {s.track}
                    {s.mode ? ` · ${s.mode === 'physical' ? 'On-Campus' : 'Online'}` : ''}
                  </option>
                ))}
              </select>
            </div>
            <p className='text-[10px] font-medium text-slate-400'>
              The guardian will only see this ward’s progress, attendance &amp;
              fees. The backend must verify this link.
            </p>
          </div>

          <div className='space-y-1.5'>
            <label className='text-[10px] font-black uppercase tracking-widest text-slate-400'>
              Temporary Password
            </label>
            <div className='relative'>
              <Lock
                className='absolute left-3 top-1/2 -translate-y-1/2 text-slate-400'
                size={15}
              />
              <input
                type={showPass ? 'text' : 'password'}
                value={values.password}
                onChange={(e) => set('password', e.target.value)}
                placeholder='min 6 characters'
                className='w-full h-11 pl-9 pr-10 rounded-lg bg-slate-50 border border-transparent focus:border-[#002EFF]/30 focus:bg-white outline-none text-sm font-medium transition-all'
              />
              <button
                type='button'
                onClick={() => setShowPass(!showPass)}
                className='absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#002EFF]'
              >
                {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>
        </div>

        <button
          type='button'
          onClick={() => set('password', suggestPassword())}
          className='text-[10px] font-black uppercase text-[#002EFF] hover:underline'
        >
          Generate a password
        </button>

        <div className='pt-2 flex items-center justify-between gap-3 border-t border-slate-50'>
          <p className='text-[10px] font-bold text-slate-400'>
            Share the email &amp; temporary password with the guardian. They can
            change it after signing in.
          </p>
          <button
            type='submit'
            disabled={loading}
            className='shrink-0 flex items-center gap-2 px-6 h-11 bg-[#002EFF] text-white rounded-xl font-black text-[11px] uppercase tracking-wide shadow-lg shadow-blue-200 hover:bg-blue-700 active:scale-95 transition-all disabled:opacity-60'
          >
            {loading ? (
              <Loader2 size={16} className='animate-spin' />
            ) : (
              <>
                <Users size={15} /> Create Guardian
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
