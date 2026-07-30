'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import {
  User,
  AtSign,
  Phone,
  Eye,
  EyeOff,
  Users,
  Loader2,
  ArrowRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { dsaApi } from '@/lib/api'

const schema = z
  .object({
    fullname: z.string().min(2, 'Full name is required'),
    username: z.string().min(3, 'Min 3 characters').regex(/^[a-zA-Z0-9_]+$/, 'No spaces/special characters'),
    email: z.string().email('Invalid email'),
    phone: z.string().min(10, 'Valid number required').regex(/^\d+$/, 'Numbers only'),
    password: z.string().min(6, 'Min. 6 characters'),
    confirmPassword: z.string(),
    wardId: z.string().min(3, "Enter your ward's username or student ID"),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

type FormValues = z.infer<typeof schema>

export default function GuardianForm() {
  const router = useRouter()
  const [showPass, setShowPass] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const { register, handleSubmit, formState } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      fullname: '', username: '', email: '', phone: '',
      password: '', confirmPassword: '', wardId: '',
    },
  })
  const errors = formState.errors

  const onSubmit = async (v: FormValues) => {
    setError('')
    setBusy(true)
    const username = v.username.toLowerCase()
    try {
      await dsaApi.auth.register({
        name: v.fullname,
        username,
        email: v.email.toLowerCase(),
        password: v.password,
        phoneNumber: v.phone,
        role: 'parent',
        wardId: v.wardId,
      })
    } catch {
      // Best-effort — the demo OTP flow still continues.
    }
    if (typeof window !== 'undefined') {
      localStorage.setItem('dsa_pending_email', v.email)
      localStorage.setItem(
        'dsa_pending_user',
        JSON.stringify({
          email: v.email.toLowerCase(),
          username,
          fullName: v.fullname,
          role: 'parent',
          phone: v.phone,
        }),
      )
    }
    router.push('/auth/verify-otp')
  }

  const field = (
    name: keyof FormValues,
    label: string,
    placeholder: string,
    Icon: React.ElementType,
    type = 'text',
  ) => (
    <div className='space-y-1.5'>
      <label className='text-[10px] font-bold text-slate-500 uppercase'>{label}</label>
      <div className='relative'>
        <Icon className='absolute left-3 top-1/2 -translate-y-1/2 text-slate-400' size={14} />
        <input
          type={type}
          {...register(name)}
          placeholder={placeholder}
          className='w-full h-11 pl-9 pr-3 rounded-lg bg-slate-50 border border-transparent focus:bg-white outline-none text-sm font-medium'
        />
      </div>
      {errors[name] && <p className='text-[10px] font-bold text-rose-500'>{errors[name]?.message as string}</p>}
    </div>
  )

  return (
    <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
      {error && (
        <div className='p-3 bg-rose-50 border border-rose-100 rounded-xl text-rose-600 text-[10px] font-bold text-center'>{error}</div>
      )}
      <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
        {field('fullname', 'Full Name', 'Jane Doe', User)}
        {field('username', 'Username', 'janedoe', AtSign)}
        {field('email', 'Email', 'you@example.com', AtSign, 'email')}
        {field('phone', 'Phone', '08012345678', Phone)}
      </div>

      <div className='space-y-1.5'>
        <label className='text-[10px] font-bold text-slate-500 uppercase'>Password</label>
        <div className='relative'>
          <input
            type={showPass ? 'text' : 'password'}
            {...register('password')}
            placeholder='••••••••'
            className='w-full h-11 px-3 pr-10 rounded-lg bg-slate-50 border border-transparent focus:bg-white outline-none text-sm font-medium'
          />
          <button type='button' onClick={() => setShowPass(!showPass)} className='absolute right-3 top-1/2 -translate-y-1/2 text-slate-400'>
            {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        </div>
        {errors.password && <p className='text-[10px] font-bold text-rose-500'>{errors.password.message}</p>}
      </div>

      <div className='space-y-1.5'>
        <label className='text-[10px] font-bold text-slate-500 uppercase'>Confirm Password</label>
        <input
          type='password'
          {...register('confirmPassword')}
          placeholder='••••••••'
          className='w-full h-11 px-3 rounded-lg bg-slate-50 border border-transparent focus:bg-white outline-none text-sm font-medium'
        />
        {errors.confirmPassword && <p className='text-[10px] font-bold text-rose-500'>{errors.confirmPassword.message}</p>}
      </div>

      <div className='space-y-1.5 p-4 rounded-xl bg-slate-50 border border-slate-100'>
        <div className='flex items-center gap-2 mb-1'>
          <Users size={14} className='text-[#002EFF]' />
          <span className='text-[10px] font-black uppercase tracking-widest text-slate-400'>Your Ward</span>
        </div>
        <label className='text-[10px] font-bold text-slate-500 uppercase'>Ward&apos;s Username / Student ID</label>
        <input
          {...register('wardId')}
          placeholder='e.g. johndoe123 or DSA-2024-001'
          className='w-full h-11 px-3 rounded-lg bg-white border border-slate-200 outline-none text-sm font-medium'
        />
        <p className='text-[10px] text-slate-400 font-medium'>Enter the username or ID your child registered with, so we can link you to their progress.</p>
        {errors.wardId && <p className='text-[10px] font-bold text-rose-500'>{errors.wardId.message}</p>}
      </div>

      <button
        type='submit'
        disabled={busy}
        className={cn('w-full flex items-center justify-center gap-2 h-12 rounded-xl bg-[#002EFF] text-white font-black text-[11px] uppercase shadow-lg shadow-blue-100 hover:bg-blue-700 active:scale-[0.98] transition-all disabled:opacity-60')}
      >
        {busy ? <Loader2 size={16} className='animate-spin' /> : (<>Create Guardian Account <ArrowRight size={15} /></>)}
      </button>
    </form>
  )
}
