'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import {
  Mail,
  ArrowLeft,
  Loader2,
  CheckCircle2,
  AlertCircle,
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
import { Input } from '@/components/ui/input'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'

const emailSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
})

export default function ForgotPassword() {
  const [step, setStep] = useState<'email' | 'success'>('email')
  const [loading, setLoading] = useState(false)
  const [userEmail, setUserEmail] = useState('')
  const [error, setError] = useState('')
  const [resendStatus, setResendStatus] = useState<'idle' | 'sending' | 'sent'>(
    'idle',
  )

  const emailForm = useForm<z.infer<typeof emailSchema>>({
    resolver: zodResolver(emailSchema),
    defaultValues: { email: '' },
  })

  // Core function to call the API
  const sendResetLink = async (email: string) => {
    const response = await fetch(
      'https://api.distinguishedscholarsacademy.com/api/auth/forgot-password',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      },
    )

    // Check if the response is actually JSON before parsing
    const contentType = response.headers.get('content-type')
    if (contentType && contentType.indexOf('application/json') !== -1) {
      const data = await response.json()
      if (!response.ok) throw new Error(data.message || 'Something went wrong')
      return data
    } else {
      // If server returns HTML (like a 404 or 500), handle it gracefully
      if (!response.ok)
        throw new Error(
          `Server Error: ${response.status}. Please try again later.`,
        )
      return {}
    }
  }

  // STEP 1: Initial Submission
  async function onEmailSubmit(values: z.infer<typeof emailSchema>) {
    setLoading(true)
    setError('')
    try {
      await sendResetLink(values.email)
      setUserEmail(values.email)
      setStep('success')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Helper for "Resend" button on the success screen
  async function handleResend() {
    setResendStatus('sending')
    setError('')
    try {
      await sendResetLink(userEmail)
      setResendStatus('sent')
      setTimeout(() => setResendStatus('idle'), 3000) // Reset button text after 3s
    } catch (err: any) {
      setError(err.message)
      setResendStatus('idle')
    }
  }

  return (
    <div className='min-h-screen bg-[#F8FAFF] flex items-center justify-center p-6 font-sans'>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className='w-full max-w-md'
      >
        <Card className='rounded-[40px] shadow-2xl border-none overflow-hidden bg-white'>
          <div className='h-2 bg-[#002EFF]' />

          <AnimatePresence mode='wait'>
            {step === 'email' && (
              <motion.div
                key='email-step'
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
              >
                <CardHeader className='text-center pt-10 pb-2'>
                  <div className='bg-blue-50 text-[#002EFF] w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4'>
                    <Mail size={24} />
                  </div>
                  <CardTitle className='text-2xl font-black text-zinc-900 tracking-tight uppercase'>
                    Reset Password
                  </CardTitle>
                  <CardDescription className='font-medium text-xs text-gray-500'>
                    Enter your email to receive a password reset link.
                  </CardDescription>
                </CardHeader>

                <CardContent className='p-8'>
                  <Form {...emailForm}>
                    <form
                      onSubmit={emailForm.handleSubmit(onEmailSubmit)}
                      className='space-y-6'
                    >
                      <FormField
                        control={emailForm.control}
                        name='email'
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className='text-[10px] font-black uppercase text-gray-400 ml-1'>
                              Email Address
                            </FormLabel>
                            <FormControl>
                              <div className='relative'>
                                <Mail
                                  className='absolute left-4 top-1/2 -translate-y-1/2 text-gray-400'
                                  size={18}
                                />
                                <Input
                                  placeholder='name@example.com'
                                  {...field}
                                  className='h-14 pl-12 py-6 rounded-2xl bg-gray-50 border-none focus-visible:ring-2 focus-visible:ring-[#002EFF] font-bold text-gray-800'
                                />
                              </div>
                            </FormControl>
                            <FormMessage className='text-[10px]' />
                          </FormItem>
                        )}
                      />

                      {error && (
                        <Alert
                          variant='destructive'
                          className='rounded-2xl bg-rose-50 border-none text-rose-600'
                        >
                          <AlertCircle className='h-4 w-4' />
                          <AlertDescription className='text-xs font-bold uppercase'>
                            {error}
                          </AlertDescription>
                        </Alert>
                      )}

                      <Button
                        type='submit'
                        disabled={loading}
                        className='w-full py-7 bg-[#002EFF] text-white font-black rounded-2xl hover:bg-blue-700 transition-all shadow-xl shadow-blue-100'
                      >
                        {loading ? (
                          <Loader2 className='animate-spin' size={20} />
                        ) : (
                          'SEND RESET LINK'
                        )}
                      </Button>
                    </form>
                  </Form>
                  <div className='mt-8 text-center'>
                    <Link
                      href='/auth/login'
                      className='inline-flex items-center gap-2 text-gray-400 hover:text-[#002EFF] font-bold text-xs uppercase transition-colors'
                    >
                      <ArrowLeft size={14} /> Back to Login
                    </Link>
                  </div>
                </CardContent>
              </motion.div>
            )}

            {step === 'success' && (
              <motion.div
                key='success-step'
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className='p-12 text-center'
              >
                <div className='bg-green-50 text-green-500 w-20 h-20 rounded-[30px] flex items-center justify-center mx-auto mb-6 shadow-sm'>
                  <CheckCircle2 size={40} />
                </div>
                <h2 className='text-2xl font-black text-zinc-900 uppercase mb-3'>
                  Email Sent!
                </h2>
                <p className='text-gray-500 text-sm font-medium mb-6 px-4'>
                  We've sent a link to{' '}
                  <span className='text-[#002EFF] font-bold'>{userEmail}</span>.
                </p>

                <div className='space-y-4 mb-10'>
                  <Button
                    asChild
                    className='w-full py-7 bg-black text-white font-black rounded-2xl hover:bg-[#002EFF] transition-all shadow-xl'
                  >
                    <Link href='/auth/login'>RETURN TO LOGIN</Link>
                  </Button>

                  <button
                    onClick={handleResend}
                    disabled={resendStatus !== 'idle'}
                    className='text-[10px] font-black uppercase text-gray-400 hover:text-[#002EFF] transition-colors disabled:opacity-50'
                  >
                    {resendStatus === 'sending'
                      ? 'Sending...'
                      : resendStatus === 'sent'
                        ? 'Link Sent Again!'
                        : 'Resend Link'}
                  </button>
                </div>

                {error && (
                  <p className='text-rose-500 text-[10px] font-bold uppercase'>
                    {error}
                  </p>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </Card>
      </motion.div>
    </div>
  )
}
