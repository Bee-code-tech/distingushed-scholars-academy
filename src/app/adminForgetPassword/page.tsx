'use client'

import React, { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Mail,
  Fingerprint,
  ArrowRight,
  AlertCircle,
  Loader2,
  ChevronLeft,
  CheckCircle2,
  KeyRound,
  Lock,
  Eye,
  EyeOff,
  RefreshCcw,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'

export default function AdminForgetPassword() {
  const router = useRouter()
  const [step, setStep] = useState(1) // 1: Email, 2: OTP, 3: Reset
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [isComplete, setIsComplete] = useState(false)

  // Timer State
  const [timeLeft, setTimeLeft] = useState(60)
  const [canResend, setCanResend] = useState(false)

  useEffect(() => {
    let timer: NodeJS.Timeout
    if (step === 2 && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1)
      }, 1000)
    } else if (timeLeft === 0) {
      setCanResend(true)
    }
    return () => clearInterval(timer)
  }, [step, timeLeft])

  const handleResend = () => {
    if (!canResend) return
    setTimeLeft(60)
    setCanResend(false)
    // Add logic here to trigger a new email API call
  }

  const handleRequestCode = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    await new Promise((resolve) => setTimeout(resolve, 1200))

    if (email.includes('@')) {
      setStep(2)
      setTimeLeft(60)
    } else {
      setError('System Error: Unauthorized email format.')
    }
    setLoading(false)
  }

  const handleVerifyCode = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    setLoading(true)
    setError('')
    await new Promise((resolve) => setTimeout(resolve, 1500))

    if (code.length === 6) {
      setStep(3)
    } else {
      setError('Validation Failed: Security code must be 6 digits.')
    }
    setLoading(false)
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    await new Promise((resolve) => setTimeout(resolve, 1500))

    if (newPassword.length < 8) {
      setError('Policy Violation: Minimum 8 characters required.')
      setLoading(false)
      return
    }

    setIsComplete(true)
    setTimeout(() => router.push('/adminLogin'), 2000)
  }

  return (
    <div className='min-h-screen bg-slate-950 flex items-center justify-center p-6 relative overflow-hidden'>
      {/* Cinematic Background */}
      <div className='absolute inset-0 pointer-events-none'>
        <div className='absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/10 rounded-full blur-[120px]' />
        <div className='absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-600/10 rounded-full blur-[120px]' />
        <div className='absolute inset-0 bg-[url("https://grainy-gradients.vercel.app/noise.svg")] opacity-20 mix-blend-overlay'></div>
      </div>

      <motion.div layout className='w-full max-w-md z-10'>
        <header className='text-center mb-10'>
          <motion.div
            animate={isComplete ? { scale: 1.1, rotate: 360 } : { scale: 1 }}
            className={`inline-flex p-4 rounded-4xl bg-slate-900 border ${isComplete ? 'border-emerald-500/50 shadow-emerald-500/10' : 'border-slate-800 shadow-blue-500/10'} shadow-2xl mb-5 transition-all duration-700`}
          >
            {isComplete ? (
              <CheckCircle2 size={42} className='text-emerald-500' />
            ) : (
              <Fingerprint size={42} className='text-blue-500' />
            )}
          </motion.div>
          <h1 className='text-2xl font-black text-white tracking-tight uppercase italic'>
            {isComplete ? 'Identity Restored' : 'Access Recovery'}
          </h1>
          <div className='flex items-center justify-center gap-2 mt-2'>
            <span
              className={`h-1 w-8 rounded-full ${step >= 1 ? 'bg-blue-500' : 'bg-slate-800'} transition-colors`}
            />
            <span
              className={`h-1 w-8 rounded-full ${step >= 2 ? 'bg-blue-500' : 'bg-slate-800'} transition-colors`}
            />
            <span
              className={`h-1 w-8 rounded-full ${step >= 3 ? 'bg-blue-500' : 'bg-slate-800'} transition-colors`}
            />
          </div>
        </header>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className='bg-slate-900/40 backdrop-blur-2xl border border-slate-800/50 rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden'
        >
          <AnimatePresence mode='wait'>
            {!isComplete ? (
              <motion.form
                key={step}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                onSubmit={
                  step === 1
                    ? handleRequestCode
                    : step === 2
                      ? handleVerifyCode
                      : handleResetPassword
                }
                className='space-y-6'
              >
                {step === 1 && (
                  <InputField
                    label='Admin Credentials'
                    icon={Mail}
                    type='email'
                    placeholder='admin@dsa-terminal.com'
                    onChange={setEmail}
                  />
                )}

                {step === 2 && (
                  <div className='space-y-6'>
                    <div className='flex items-baseline justify-between'>
                      <label className='text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1'>
                        Security Code
                      </label>
                      <span className='text-[10px] font-mono font-bold text-blue-400'>
                        00:{timeLeft < 10 ? `0${timeLeft}` : timeLeft}
                      </span>
                    </div>

                    <OTPInput onComplete={setCode} />

                    <div className='flex justify-center'>
                      <button
                        type='button'
                        onClick={handleResend}
                        disabled={!canResend}
                        className={`text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all ${canResend ? 'text-slate-300 hover:text-white pointer-events-auto' : 'text-slate-700 pointer-events-none'}`}
                      >
                        <RefreshCcw
                          size={12}
                          className={!canResend ? '' : 'animate-pulse'}
                        />
                        Resend Code
                      </button>
                    </div>
                  </div>
                )}

                {step === 3 && (
                  <InputField
                    label='Initialize New Key'
                    icon={Lock}
                    type='password'
                    isPassword
                    placeholder='Create secure password'
                    onChange={setNewPassword}
                  />
                )}

                {error && (
                  <motion.div
                    initial={{ x: -10 }}
                    animate={{ x: 0 }}
                    transition={{ type: 'spring', stiffness: 500 }}
                  >
                    <ErrorBox message={error} />
                  </motion.div>
                )}

                <button
                  type='submit'
                  disabled={loading || (step === 2 && code.length < 6)}
                  className='w-full bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800/50 disabled:text-slate-600 text-white rounded-2xl py-4 text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-xl active:scale-95'
                >
                  {loading ? (
                    <Loader2 className='animate-spin' size={18} />
                  ) : (
                    <>
                      {step === 1
                        ? 'Generate Recovery Code'
                        : step === 2
                          ? 'Authenticate Code'
                          : 'Finalize Encryption'}
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>
              </motion.form>
            ) : (
              <div className='py-8 text-center space-y-6'>
                <div className='space-y-2'>
                  <p className='text-white font-bold'>
                    System Update Successful
                  </p>
                  <p className='text-slate-400 text-xs leading-relaxed'>
                    Encryption keys updated. Initializing secure handshaking
                    with login terminal.
                  </p>
                </div>
                <div className='flex justify-center items-center gap-3'>
                  <div className='h-1 w-12 bg-emerald-500/20 rounded-full overflow-hidden'>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: '100%' }}
                      transition={{ duration: 2 }}
                      className='h-full bg-emerald-500'
                    />
                  </div>
                  <Loader2
                    className='animate-spin text-emerald-500'
                    size={20}
                  />
                </div>
              </div>
            )}
          </AnimatePresence>
        </motion.div>

        <footer className='mt-10 text-center'>
          <Link
            href='/adminLogin'
            className='inline-flex items-center gap-2 text-slate-500 hover:text-slate-200 transition-all text-[11px] font-black uppercase tracking-widest group'
          >
            <ChevronLeft
              size={14}
              className='group-hover:-translate-x-1 transition-transform'
            />
            Abort Recovery
          </Link>
        </footer>
      </motion.div>
    </div>
  )
}

// --- OTP COMPONENT ---

function OTPInput({ onComplete }: { onComplete: (val: string) => void }) {
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  const handleChange = (value: string, index: number) => {
    if (/[^0-9]/.test(value)) return
    const newOtp = [...otp]
    newOtp[index] = value.substring(value.length - 1)
    setOtp(newOtp)
    onComplete(newOtp.join(''))

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  return (
    <div className='flex justify-between gap-3'>
      {otp.map((data, index) => (
        <input
          key={index}
          type='text'
          inputMode='numeric'
          ref={(el) => {
            inputRefs.current[index] = el
          }}
          value={data}
          onChange={(e) => handleChange(e.target.value, index)}
          onKeyDown={(e) => handleKeyDown(e, index)}
          className='w-full h-16 bg-slate-950/50 border border-slate-800 rounded-2xl text-center text-2xl font-black text-blue-500 outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/50 transition-all shadow-inner'
        />
      ))}
    </div>
  )
}

// --- SHARED COMPONENTS ---

function InputField({
  label,
  icon: Icon,
  type,
  placeholder,
  onChange,
  isPassword,
}: any) {
  const [show, setShow] = useState(false)
  return (
    <div className='space-y-2'>
      <label className='text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1'>
        {label}
      </label>
      <div className='relative group'>
        <Icon
          className='absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-blue-500 transition-colors'
          size={18}
        />
        <input
          type={isPassword ? (show ? 'text' : 'password') : type}
          required
          placeholder={placeholder}
          className='w-full bg-slate-950/50 border border-slate-800 rounded-2xl px-12 py-4 text-sm text-white outline-none focus:ring-2 focus:ring-blue-500/20 placeholder:text-slate-700 transition-all focus:border-blue-500/50'
          onChange={(e) => onChange(e.target.value)}
        />
        {isPassword && (
          <button
            type='button'
            onClick={() => setShow(!show)}
            className='absolute right-4 top-1/2 -translate-y-1/2 text-slate-600 hover:text-blue-400 transition-colors'
          >
            {show ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>
    </div>
  )
}

function ErrorBox({ message }: { message: string }) {
  return (
    <div className='flex items-center gap-3 p-4 rounded-2xl bg-rose-500/5 border border-rose-500/20 text-rose-500 text-[11px] font-bold'>
      <AlertCircle size={16} className='shrink-0' />
      <span className='uppercase tracking-tight'>{message}</span>
    </div>
  )
}
