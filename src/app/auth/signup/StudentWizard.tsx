'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import { motion } from 'framer-motion'
import {
  User,
  AtSign,
  Phone,
  Eye,
  EyeOff,
  Camera,
  Trash2,
  ArrowRight,
  ArrowLeft,
  Loader2,
  CheckCircle2,
  Lock,
  ShieldCheck,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { dsaApi } from '@/lib/api'
import { rememberEnrolmentChoice } from '@/lib/studentProfile'
import {
  GENDERS,
  CLASS_LEVELS,
  LEARNING_MODES,
  PROGRAMMES,
  NIGERIAN_STATES,
  PORTAL_ACCESS_FEE,
  deriveTrackFromProgrammes,
  usernameFromEmail,
} from '@/lib/registration'
import { payWithPaystack } from '@/lib/paystack'
import { addStudent } from '@/lib/studentsStore'

const schema = z
  .object({
    // Step 1
    fullname: z.string().min(2, 'Full name is required'),
    email: z.string().email('Enter a valid email'),
    whatsapp: z.string().min(10, 'Valid number required').regex(/^\d+$/, 'Numbers only'),
    password: z.string().min(6, 'Min. 6 characters'),
    confirmPassword: z.string(),
    // Step 2
    gender: z.string().min(1, 'Select your gender'),
    dob: z.string().min(1, 'Select your date of birth'),
    state: z.string().min(1, 'Select your state'),
    school: z.string().min(2, 'Enter your school'),
    classLevel: z.string().min(1, 'Select your class/level'),
    learningMode: z.string().min(1, 'Select a learning mode'),
    passport: z.string().optional(),
    // Step 3
    programmes: z.array(z.string()).min(1, 'Select at least one programme'),
    // Step 4
    guardianName: z.string().min(2, 'Parent/Guardian name is required'),
    guardianPhone: z.string().min(10, 'Valid number required').regex(/^\d+$/, 'Numbers only'),
    guardianEmail: z.string().email('Enter a valid email').or(z.literal('')).optional(),
    // Step 5
    acceptTerms: z.literal(true, {
      errorMap: () => ({ message: 'You must accept the Terms & Conditions' }),
    }),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

type FormValues = z.infer<typeof schema>

const STEP_FIELDS: Record<number, (keyof FormValues)[]> = {
  1: ['fullname', 'email', 'whatsapp', 'password', 'confirmPassword'],
  2: ['gender', 'dob', 'state', 'school', 'classLevel', 'learningMode'],
  3: ['programmes'],
  4: ['guardianName', 'guardianPhone', 'guardianEmail'],
  5: ['acceptTerms'],
}

const STEPS = [
  'Account',
  'Profile',
  'Programmes',
  'Guardian',
  'Terms',
]

export default function StudentWizard() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [showPass, setShowPass] = useState(false)
  const [busy, setBusy] = useState(false)
  const [status, setStatus] = useState('')
  const [error, setError] = useState('')

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    mode: 'onTouched',
    defaultValues: {
      fullname: '', email: '', whatsapp: '', password: '', confirmPassword: '',
      gender: '', dob: '', state: '', school: '', classLevel: '', learningMode: '',
      passport: '', programmes: [], guardianName: '', guardianPhone: '',
      guardianEmail: '', acceptTerms: false as unknown as true,
    },
  })
  const { register, watch, setValue, trigger, getValues, formState } = form
  const errors = formState.errors

  const passport = watch('passport')
  const programmes = watch('programmes')
  const gender = watch('gender')
  const learningMode = watch('learningMode')
  const classLevel = watch('classLevel')

  const next = async () => {
    setError('')
    const ok = await trigger(STEP_FIELDS[step], { shouldFocus: true })
    if (ok) setStep((s) => Math.min(5, s + 1))
  }
  const back = () => {
    setError('')
    setStep((s) => Math.max(1, s - 1))
  }

  const handlePassport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/'))
      return form.setError('passport', { message: 'Choose an image file' })
    if (file.size > 2 * 1024 * 1024)
      return form.setError('passport', { message: 'Image must be under 2MB' })
    const reader = new FileReader()
    reader.onloadend = () => setValue('passport', reader.result as string)
    reader.readAsDataURL(file)
  }

  const toggleProgramme = (p: string) => {
    const curr = getValues('programmes')
    const nextList = curr.includes(p)
      ? curr.filter((x) => x !== p)
      : [...curr, p]
    setValue('programmes', nextList, { shouldValidate: true })
  }

  // Final action: pay the portal fee, then move to OTP verification.
  const completeRegistration = async () => {
    setError('')
    const ok = await trigger()
    if (!ok) {
      setError('Please review the form — some fields need attention.')
      return
    }
    const v = getValues()
    setBusy(true)
    setStatus('Opening secure payment…')

    const pay = await payWithPaystack({
      email: v.email,
      amountNaira: PORTAL_ACCESS_FEE,
      metadata: { fullname: v.fullname, purpose: 'Portal Access Fee' },
    })

    // Payment is mandatory — verification only happens after a successful
    // charge. Nothing proceeds unless Paystack returns success.
    if (pay.status !== 'success') {
      setBusy(false)
      setStatus('')
      setError(
        pay.status === 'cancelled'
          ? `Payment was not completed. Please pay the ₦${PORTAL_ACCESS_FEE.toLocaleString()} portal access fee to finish registering.`
          : 'Payment could not be started. Please check your connection and try again.',
      )
      return
    }

    setStatus('Creating your account…')
    const username = usernameFromEmail(v.email)
    const track = deriveTrackFromProgrammes(v.programmes)
    const mode = v.learningMode === 'Physical' ? 'physical' : 'online'

    // Best-effort backend register. Extra fields are sent for when the backend
    // supports them; unknown fields are ignored today.
    try {
      await dsaApi.auth.register({
        name: v.fullname,
        username,
        email: v.email.toLowerCase(),
        password: v.password,
        phoneNumber: v.whatsapp,
        role: 'student',
        level: track,
        subjectsOfInterest: v.programmes,
        isDsaStudent: mode === 'physical',
        profilePic: v.passport || '',
        gender: v.gender,
        dateOfBirth: v.dob,
        stateOfResidence: v.state,
        school: v.school,
        classLevel: v.classLevel,
        programmes: v.programmes,
        guardianName: v.guardianName,
        guardianPhone: v.guardianPhone,
        guardianEmail: v.guardianEmail || '',
        paymentReference: pay.reference || '',
      })
    } catch {
      // Ignore — the demo OTP flow continues so the client can preview it.
    }

    rememberEnrolmentChoice({ track, mode })
    // Record the student so the tutor/admin roster shows them (browser-local
    // until the backend links students to tutors — see studentsStore.ts).
    addStudent({
      key: username,
      name: v.fullname,
      track: track.toUpperCase(),
      mode,
    })
    // Stash the profile so the OTP screen can open the dashboard on 1111.
    if (typeof window !== 'undefined') {
      localStorage.setItem('dsa_pending_email', v.email)
      localStorage.setItem(
        'dsa_pending_user',
        JSON.stringify({
          email: v.email.toLowerCase(),
          username,
          fullName: v.fullname,
          role: 'student',
          level: track,
          isDsaStudent: mode === 'physical',
          phone: v.whatsapp,
          avatarUrl: v.passport || undefined,
          subjectsOfInterest: v.programmes,
        }),
      )
    }
    router.push('/auth/verify-otp')
  }

  // --- small field helpers ---
  const input = (
    name: keyof FormValues,
    label: string,
    placeholder: string,
    type = 'text',
    Icon?: React.ElementType,
  ) => (
    <div className='space-y-1.5'>
      <label className='text-[10px] font-bold text-slate-500 uppercase'>{label}</label>
      <div className='relative'>
        {Icon && (
          <Icon className='absolute left-3 top-1/2 -translate-y-1/2 text-slate-400' size={14} />
        )}
        <input
          type={type}
          {...register(name)}
          placeholder={placeholder}
          className={cn(
            'w-full h-11 rounded-lg bg-slate-50 border border-transparent focus:bg-white focus:border-[#002EFF]/30 outline-none text-sm font-medium transition-all',
            Icon ? 'pl-9 pr-3' : 'px-3',
          )}
        />
      </div>
      {errors[name] && (
        <p className='text-[10px] font-bold text-rose-500'>
          {errors[name]?.message as string}
        </p>
      )}
    </div>
  )

  const pill = (active: boolean) =>
    cn(
      'cursor-pointer py-2.5 px-3 rounded-lg border text-xs font-bold text-center transition-all',
      active
        ? 'bg-blue-50 border-[#002EFF] text-[#002EFF]'
        : 'bg-white border-slate-100 text-slate-600 hover:bg-slate-50',
    )

  return (
    <div className='space-y-6'>
      {/* Progress */}
      <div className='flex items-center justify-between'>
        {STEPS.map((label, i) => {
          const n = i + 1
          const done = n < step
          const active = n === step
          return (
            <div key={label} className='flex flex-col items-center flex-1'>
              <div
                className={cn(
                  'h-8 w-8 rounded-full flex items-center justify-center text-[11px] font-black transition-all',
                  active
                    ? 'bg-[#002EFF] text-white'
                    : done
                      ? 'bg-emerald-500 text-white'
                      : 'bg-slate-100 text-slate-400',
                )}
              >
                {done ? <CheckCircle2 size={15} /> : n}
              </div>
              <span
                className={cn(
                  'text-[8px] font-black uppercase mt-1 tracking-wide',
                  active ? 'text-[#002EFF]' : 'text-slate-400',
                )}
              >
                {label}
              </span>
            </div>
          )
        })}
      </div>

      {error && (
        <div className='p-3 bg-rose-50 border border-rose-100 rounded-xl text-rose-600 text-[10px] font-bold text-center'>
          {error}
        </div>
      )}

      <div className='min-h-[1px]'>
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.2 }}
          className='space-y-4'
        >
          {step === 1 && (
            <>
              <h3 className='text-sm font-black text-slate-800'>Create Your Account</h3>
              {input('fullname', 'Full Name *', 'John Doe', 'text', User)}
              {input('email', 'Email Address *', 'you@example.com', 'email', AtSign)}
              {input('whatsapp', 'WhatsApp Number *', '08012345678', 'text', Phone)}
              <div className='space-y-1.5'>
                <label className='text-[10px] font-bold text-slate-500 uppercase'>Password *</label>
                <div className='relative'>
                  <Lock className='absolute left-3 top-1/2 -translate-y-1/2 text-slate-400' size={14} />
                  <input
                    type={showPass ? 'text' : 'password'}
                    {...register('password')}
                    placeholder='••••••••'
                    className='w-full h-11 pl-9 pr-10 rounded-lg bg-slate-50 border border-transparent focus:bg-white outline-none text-sm font-medium'
                  />
                  <button type='button' onClick={() => setShowPass(!showPass)} className='absolute right-3 top-1/2 -translate-y-1/2 text-slate-400'>
                    {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                {errors.password && <p className='text-[10px] font-bold text-rose-500'>{errors.password.message}</p>}
              </div>
              {input('confirmPassword', 'Confirm Password *', '••••••••', 'password')}
            </>
          )}

          {step === 2 && (
            <>
              <h3 className='text-sm font-black text-slate-800'>Complete Your Profile</h3>

              {/* Passport */}
              <div className='flex flex-col items-center gap-2 pb-2'>
                <label htmlFor='wiz-passport' className='relative h-24 w-24 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 flex items-center justify-center cursor-pointer overflow-hidden hover:border-[#002EFF] group'>
                  {passport ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={passport} alt='Passport' className='h-full w-full object-cover' />
                  ) : (
                    <div className='flex flex-col items-center text-slate-400 group-hover:text-[#002EFF]'>
                      <Camera size={20} />
                      <span className='text-[8px] font-black uppercase mt-1'>Passport</span>
                    </div>
                  )}
                  <input id='wiz-passport' type='file' accept='image/*' className='hidden' onChange={handlePassport} />
                </label>
                {passport && (
                  <button type='button' onClick={() => setValue('passport', '')} className='flex items-center gap-1 text-[9px] font-black uppercase text-rose-500'>
                    <Trash2 size={11} /> Remove
                  </button>
                )}
                {errors.passport && <p className='text-[10px] font-bold text-rose-500'>{errors.passport.message as string}</p>}
              </div>

              {/* Gender */}
              <div className='space-y-1.5'>
                <label className='text-[10px] font-bold text-slate-500 uppercase'>Gender *</label>
                <div className='grid grid-cols-2 gap-2'>
                  {GENDERS.map((g) => (
                    <div key={g} onClick={() => setValue('gender', g, { shouldValidate: true })} className={pill(gender === g)}>
                      {g}
                    </div>
                  ))}
                </div>
                {errors.gender && <p className='text-[10px] font-bold text-rose-500'>{errors.gender.message}</p>}
              </div>

              {input('dob', 'Date of Birth *', '', 'date')}

              {/* State */}
              <div className='space-y-1.5'>
                <label className='text-[10px] font-bold text-slate-500 uppercase'>State of Residence *</label>
                <select {...register('state')} className='w-full h-11 px-3 rounded-lg bg-slate-50 border border-transparent focus:bg-white outline-none text-sm font-medium'>
                  <option value=''>Select your state</option>
                  {NIGERIAN_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
                {errors.state && <p className='text-[10px] font-bold text-rose-500'>{errors.state.message}</p>}
              </div>

              {input('school', 'Current School/Institution *', 'e.g. Government College', 'text')}

              {/* Class level */}
              <div className='space-y-1.5'>
                <label className='text-[10px] font-bold text-slate-500 uppercase'>Current Class/Level *</label>
                <div className='grid grid-cols-3 sm:grid-cols-5 gap-2'>
                  {CLASS_LEVELS.map((c) => (
                    <div key={c} onClick={() => setValue('classLevel', c, { shouldValidate: true })} className={pill(classLevel === c)}>
                      {c}
                    </div>
                  ))}
                </div>
                {errors.classLevel && <p className='text-[10px] font-bold text-rose-500'>{errors.classLevel.message}</p>}
              </div>

              {/* Learning mode */}
              <div className='space-y-1.5'>
                <label className='text-[10px] font-bold text-slate-500 uppercase'>Preferred Learning Mode *</label>
                <div className='grid grid-cols-2 gap-2'>
                  {LEARNING_MODES.map((m) => (
                    <div key={m} onClick={() => setValue('learningMode', m, { shouldValidate: true })} className={pill(learningMode === m)}>
                      {m}
                    </div>
                  ))}
                </div>
                {errors.learningMode && <p className='text-[10px] font-bold text-rose-500'>{errors.learningMode.message}</p>}
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <h3 className='text-sm font-black text-slate-800'>Programme Enrollment</h3>
              <p className='text-[11px] text-slate-500 font-medium'>Select the programmes you want to enrol in.</p>
              <div className='grid grid-cols-1 sm:grid-cols-2 gap-2'>
                {PROGRAMMES.map((p) => {
                  const active = programmes.includes(p)
                  return (
                    <div key={p} onClick={() => toggleProgramme(p)} className={cn('cursor-pointer p-3 rounded-xl border flex items-center gap-2 transition-all', active ? 'bg-blue-50 border-[#002EFF]' : 'bg-white border-slate-100 hover:bg-slate-50')}>
                      <div className={cn('h-4 w-4 rounded flex items-center justify-center shrink-0', active ? 'bg-[#002EFF] text-white' : 'border border-slate-300')}>
                        {active && <CheckCircle2 size={12} />}
                      </div>
                      <span className={cn('text-[11px] font-bold', active ? 'text-[#002EFF]' : 'text-slate-600')}>{p}</span>
                    </div>
                  )
                })}
              </div>
              {errors.programmes && <p className='text-[10px] font-bold text-rose-500'>{errors.programmes.message as string}</p>}
            </>
          )}

          {step === 4 && (
            <>
              <h3 className='text-sm font-black text-slate-800'>Parent/Guardian Information</h3>
              {input('guardianName', 'Parent/Guardian Name *', 'Full name', 'text', User)}
              {input('guardianPhone', 'Parent/Guardian Phone *', '08012345678', 'text', Phone)}
              {input('guardianEmail', 'Parent/Guardian Email (Optional)', 'guardian@example.com', 'email', AtSign)}
            </>
          )}

          {step === 5 && (
            <>
              <h3 className='text-sm font-black text-slate-800'>Terms &amp; Conditions</h3>
              <div className='p-4 rounded-xl bg-slate-50 border border-slate-100 text-[11px] text-slate-500 font-medium leading-relaxed max-h-40 overflow-y-auto'>
                By registering you agree to attend classes, complete assessments, and abide by the academy&apos;s code of conduct. The Portal Access Fee is a one-time charge for access to the DSA learning portal and is non-refundable once access is granted.
              </div>
              <label className='flex items-start gap-3 cursor-pointer'>
                <input type='checkbox' {...register('acceptTerms')} className='mt-0.5 h-4 w-4 accent-[#002EFF]' />
                <span className='text-[11px] font-bold text-slate-600'>I accept the DSA Terms &amp; Conditions</span>
              </label>
              {errors.acceptTerms && <p className='text-[10px] font-bold text-rose-500'>{errors.acceptTerms.message as string}</p>}

              <div className='flex items-center gap-3 p-4 rounded-xl bg-blue-50 border border-blue-100'>
                <ShieldCheck className='text-[#002EFF] shrink-0' size={20} />
                <div>
                  <p className='text-[11px] font-black text-[#002EFF] uppercase'>Portal Access Fee — ₦{PORTAL_ACCESS_FEE.toLocaleString()}</p>
                  <p className='text-[10px] font-bold text-slate-500'>You&apos;ll pay this securely to activate your portal, then verify your account.</p>
                </div>
              </div>
            </>
          )}
        </motion.div>
      </div>

      {/* Nav */}
      <div className='flex items-center gap-3 pt-2'>
        {step > 1 && (
          <button type='button' onClick={back} disabled={busy} className='flex items-center gap-1 px-5 h-12 rounded-xl border border-slate-200 text-slate-500 font-black text-[11px] uppercase hover:bg-slate-50 disabled:opacity-50'>
            <ArrowLeft size={15} /> Back
          </button>
        )}
        {step < 5 ? (
          <button type='button' onClick={next} className='flex-1 flex items-center justify-center gap-2 h-12 rounded-xl bg-[#002EFF] text-white font-black text-[11px] uppercase shadow-lg shadow-blue-100 hover:bg-blue-700 active:scale-[0.98] transition-all'>
            {step === 1 ? 'Create Account' : 'Continue'} <ArrowRight size={15} />
          </button>
        ) : (
          <button type='button' onClick={completeRegistration} disabled={busy} className='flex-1 flex items-center justify-center gap-2 h-12 rounded-xl bg-[#FCB900] text-[#002EFF] font-black text-[11px] uppercase shadow-lg shadow-yellow-100 hover:brightness-105 active:scale-[0.98] transition-all disabled:opacity-60'>
            {busy ? (<><Loader2 size={16} className='animate-spin' /> {status || 'Processing…'}</>) : (<>Complete Registration — Pay ₦{PORTAL_ACCESS_FEE.toLocaleString()}</>)}
          </button>
        )}
      </div>
    </div>
  )
}
