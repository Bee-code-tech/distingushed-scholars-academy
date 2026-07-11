'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import {
  ArrowRight,
  Loader2,
  Mail,
  RefreshCcw,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from '@/components/ui/input-otp'
import { Card, CardContent } from '@/components/ui/card'

const formSchema = z.object({
  otp: z.string().length(6, 'Enter the full 6-digit code'),
})

const RESEND_COOLDOWN = 180

export default function VerifyOTP() {
  const [email, setEmail] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const [apiError, setApiError] = useState<string | null>(null)
  const [apiSuccess, setApiSuccess] = useState<string | null>(null)
  const router = useRouter()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { otp: '' },
  })

  // Watch the OTP value for real-time button states
  const otpValue = form.watch('otp')

  useEffect(() => {
    const storedEmail = localStorage.getItem('dsa_pending_email')
    if (!storedEmail) {
      router.push('/auth/signup')
      return
    }
    setEmail(storedEmail)

    const savedExpiry = localStorage.getItem('otp_expiry')
    if (savedExpiry) {
      const remaining = Math.floor((parseInt(savedExpiry) - Date.now()) / 1000)
      if (remaining > 0) setCountdown(remaining)
    }
  }, [router])

  useEffect(() => {
    if (countdown <= 0) return
    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1)
    }, 1000)
    return () => clearInterval(timer)
  }, [countdown])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const startCooldown = () => {
    const expiry = Date.now() + RESEND_COOLDOWN * 1000
    localStorage.setItem('otp_expiry', expiry.toString())
    setCountdown(RESEND_COOLDOWN)
  }

  const handleResendOTP = async () => {
    if (!email || countdown > 0) return
    setIsResending(true)
    setApiError(null)
    setApiSuccess(null)

    try {
      const response = await fetch(
        'https://api.distinguishedscholarsacademy.com/api/auth/send-otp',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
        },
      )
      const data = await response.json()
      if (!response.ok) throw new Error(data.message || 'Failed to resend code')

      setApiSuccess('A fresh verification code has been sent.')
      startCooldown()
    } catch (error: any) {
      setApiError(error.message)
    } finally {
      setIsResending(false)
    }
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!email) return
    setApiError(null)
    setApiSuccess(null)
    setIsLoading(true)

    try {
      const response = await fetch(
        'https://api.distinguishedscholarsacademy.com/api/auth/verify-otp',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: email,
            otp: values.otp,
          }),
        },
      )

      const data = await response.json()
      if (!response.ok)
        throw new Error(data.message || 'Invalid code. Please try again.')

      localStorage.setItem('dsa_auth_token', data.token)
      localStorage.removeItem('dsa_pending_email')
      localStorage.removeItem('otp_expiry')
      router.push('/dashboard?welcome=true')
    } catch (error: any) {
      setApiError(error.message)
      form.setValue('otp', '')
    } finally {
      setIsLoading(false)
    }
  }

  if (!email) return null

  return (
    <div className='min-h-screen bg-[#F8FAFF] py-12 px-4 flex flex-col items-center font-sans'>
      <div className='text-center mb-8'>
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className='bg-[#002EFF] text-white w-16 h-16 rounded-[24px] flex items-center justify-center mx-auto mb-4 shadow-2xl shadow-blue-200'
        >
          <Mail size={32} />
        </motion.div>
        <h1 className='text-2xl font-black text-zinc-900 uppercase tracking-tight'>
          Email Verification
        </h1>
        <p className='text-[10px] font-bold text-gray-400 mt-2 uppercase tracking-[0.2em]'>
          We sent a code to <span className='text-[#002EFF]'>{email}</span>
        </p>
      </div>

      <Card className='w-full max-w-md rounded-[48px] shadow-2xl border-none overflow-hidden bg-white'>
        <div className='h-2 bg-[#002EFF]' />

        <CardContent className='p-8 md:p-12'>
          <AnimatePresence mode='wait'>
            {(apiError || apiSuccess) && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className={`mb-6 p-4 rounded-2xl text-[11px] font-bold uppercase tracking-wider flex items-center justify-center gap-2 ${
                  apiError
                    ? 'bg-rose-50 text-rose-600 border border-rose-100'
                    : 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                }`}
              >
                {apiError ? (
                  <AlertCircle size={14} />
                ) : (
                  <CheckCircle2 size={14} />
                )}
                {apiError || apiSuccess}
              </motion.div>
            )}
          </AnimatePresence>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-8'>
              <FormField
                control={form.control}
                name='otp'
                render={({ field }) => (
                  <FormItem className='flex flex-col items-center'>
                    <FormLabel className='text-[10px] font-black uppercase text-gray-400 text-center block mb-6 tracking-widest'>
                      Enter Security Code
                    </FormLabel>
                    <FormControl>
                      {/* FIXED: Using direct child pattern to prevent the 'undefined (reading 0)' crash */}
                      <InputOTP
                        maxLength={6}
                        {...field}
                        onComplete={() => form.handleSubmit(onSubmit)()}
                      >
                        <InputOTPGroup className='gap-2 md:gap-3'>
                          {[0, 1, 2, 3, 4, 5].map((idx) => (
                            <InputOTPSlot
                              key={idx}
                              index={idx}
                              className='w-10 h-14 md:w-12 md:h-16 text-2xl font-black rounded-xl border-none bg-gray-50 focus-visible:ring-2 focus-visible:ring-[#002EFF]'
                            />
                          ))}
                        </InputOTPGroup>
                      </InputOTP>
                    </FormControl>
                    <FormMessage className='text-[10px] text-center font-bold mt-4 uppercase' />
                  </FormItem>
                )}
              />

              <div className='space-y-4'>
                <Button
                  type='submit'
                  disabled={isLoading || otpValue.length < 6}
                  className='w-full bg-[#002EFF] hover:bg-blue-700 h-16 rounded-[24px] font-black uppercase tracking-widest text-xs shadow-xl shadow-blue-100 transition-transform active:scale-95'
                >
                  {isLoading ? (
                    <Loader2 className='animate-spin' size={20} />
                  ) : (
                    <>
                      Verify Securely <ArrowRight className='ml-2' size={18} />
                    </>
                  )}
                </Button>

                <div className='text-center'>
                  {countdown > 0 ? (
                    <p className='text-[10px] font-black uppercase text-gray-300 py-3'>
                      Resend available in{' '}
                      <span className='text-zinc-900'>
                        {formatTime(countdown)}
                      </span>
                    </p>
                  ) : (
                    <button
                      type='button'
                      onClick={handleResendOTP}
                      disabled={isResending}
                      className='group w-full flex items-center justify-center gap-2 text-[10px] font-black uppercase text-gray-400 hover:text-[#002EFF] transition-all py-3'
                    >
                      {isResending ? (
                        <Loader2 className='animate-spin' size={14} />
                      ) : (
                        <RefreshCcw
                          size={14}
                          className='group-hover:rotate-180 transition-transform duration-500'
                        />
                      )}
                      Request New Code
                    </button>
                  )}
                </div>
              </div>
            </form>
          </Form>

          <div className='mt-10 pt-8 border-t border-gray-50 text-center'>
            <button
              onClick={() => {
                localStorage.removeItem('dsa_pending_email')
                router.push('/auth/signup')
              }}
              className='text-[10px] font-black uppercase text-gray-400 hover:text-rose-500 transition-colors'
            >
              Cancel and use a different email
            </button>
          </div>
        </CardContent>
      </Card>

      <p className='mt-8 text-[10px] font-bold text-gray-300 uppercase tracking-widest'>
        Secured by DSA Authentication Systems
      </p>
    </div>
  )
}
