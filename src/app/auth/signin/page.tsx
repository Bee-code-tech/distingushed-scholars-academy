'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Lock,
  LogIn,
  Loader2,
  AlertCircle,
  Eye,
  EyeOff,
  AtSign,
  CheckCircle2,
  ChevronLeft,
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
import { Checkbox } from '@/components/ui/checkbox'

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().default(false).optional(),
})

function LoginContent() {
  const [loading, setLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)
  const [error, setError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  const router = useRouter()
  const searchParams = useSearchParams()

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  })

  // Initialize form with remembered email & check query params
  useEffect(() => {
    const rememberedEmail = localStorage.getItem('dsa_remembered_email')
    if (rememberedEmail) {
      form.setValue('email', rememberedEmail)
      form.setValue('rememberMe', true)
    }

    if (searchParams.get('reset') === 'success') {
      setSuccessMsg('Password updated successfully! Please log in.')
    }
    if (searchParams.get('verified') === 'true') {
      setSuccessMsg('Account verified successfully! You can now log in.')
    }
  }, [searchParams, form])

  async function onSubmit(values: z.infer<typeof loginSchema>) {
    setLoading(true)
    setError('')
    setSuccessMsg('')

    try {
      // --- ADMIN BYPASS LOGIC ---
      if (
        values.email === 'admin@dsa.com' &&
        values.password === 'dsaadminpass'
      ) {
        localStorage.setItem('user_role', 'super_admin')
        localStorage.setItem('dsa_token', 'admin-session-active')
        document.cookie = 'admin_token=true; path=/; max-age=3600; SameSite=Lax'
        setSuccessMsg('ADMIN ACCESS GRANTED. REDIRECTING...')
        setTimeout(() => router.push('/admin'), 800)
        return
      }

      // --- PRODUCTION API LOGIN ---
      const response = await fetch(
        'https://api.distinguishedscholarsacademy.com/api/auth/login',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify({
            email: values.email,
            password: values.password,
          }),
        },
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Invalid email or password.')
      }

      // Handle Success & Persistence
      if (data.token) {
        localStorage.setItem('dsa_token', data.token)
        localStorage.setItem('dsa_user', JSON.stringify(data.user))
        localStorage.setItem('user_role', data.user.role || 'student')

        if (values.rememberMe) {
          localStorage.setItem('dsa_remembered_email', values.email)
        } else {
          localStorage.removeItem('dsa_remembered_email')
        }
      }

      setSuccessMsg('Login successful! Redirecting...')
      router.push('/dashboard')
      router.refresh()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='w-full max-w-md space-y-6'>
      <Link
        href='/'
        className='inline-flex items-center gap-2 text-[10px] font-black uppercase text-gray-400 hover:text-[#002EFF] transition-colors ml-4'
      >
        <ChevronLeft size={14} /> Back to home
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className='rounded-[48px] shadow-2xl border-none overflow-hidden bg-white'>
          <div className='h-2 bg-[#002EFF]' />

          <CardHeader className='text-center pt-12 pb-4'>
            <CardTitle className='text-3xl font-black text-zinc-900 tracking-tighter uppercase'>
              Sign In
            </CardTitle>
            <CardDescription className='font-bold uppercase text-[10px] tracking-[0.25em] text-[#002EFF]'>
              DSA Student Portal
            </CardDescription>
          </CardHeader>

          <CardContent className='p-8 md:p-10'>
            <AnimatePresence mode='wait'>
              {(successMsg || error) && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className='mb-6'
                >
                  <Alert
                    className={`rounded-2xl border-none flex items-center gap-3 ${
                      error
                        ? 'bg-rose-50 text-rose-600'
                        : 'bg-emerald-50 text-emerald-600'
                    }`}
                  >
                    {error ? (
                      <AlertCircle className='h-4 w-4' />
                    ) : (
                      <CheckCircle2 className='h-4 w-4' />
                    )}
                    <AlertDescription className='text-[10px] font-black uppercase leading-tight'>
                      {error || successMsg}
                    </AlertDescription>
                  </Alert>
                </motion.div>
              )}
            </AnimatePresence>

            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className='space-y-5'
              >
                <FormField
                  control={form.control}
                  name='email'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className='text-[10px] font-black uppercase text-gray-400 ml-1 tracking-widest'>
                        Email Address
                      </FormLabel>
                      <FormControl>
                        <div className='relative'>
                          <AtSign
                            className='absolute left-5 top-1/2 -translate-y-1/2 text-gray-300'
                            size={18}
                          />
                          <Input
                            {...field}
                            placeholder='name@example.com'
                            className='h-16 pl-14 py-6 rounded-2xl bg-gray-50 border-none focus-visible:ring-4 focus-visible:ring-blue-50 font-bold text-gray-800 transition-all text-sm'
                          />
                        </div>
                      </FormControl>
                      <FormMessage className='text-[10px] font-bold uppercase' />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='password'
                  render={({ field }) => (
                    <FormItem>
                      <div className='flex justify-between items-center'>
                        <FormLabel className='text-[10px] font-black uppercase text-gray-400 ml-1 tracking-widest'>
                          Password
                        </FormLabel>
                        <Link
                          href='/auth/forgot-password'
                          className='text-[10px] font-black text-[#002EFF] uppercase hover:opacity-70'
                        >
                          Forgot?
                        </Link>
                      </div>
                      <FormControl>
                        <div className='relative'>
                          <Lock
                            className='absolute left-5 top-1/2 -translate-y-1/2 text-gray-300'
                            size={18}
                          />
                          <Input
                            {...field}
                            type={showPass ? 'text' : 'password'}
                            placeholder='••••••••'
                            className='h-16 pl-14 pr-14 py-6 rounded-2xl bg-gray-50 border-none focus-visible:ring-4 focus-visible:ring-blue-50 font-bold text-gray-800 transition-all text-sm'
                          />
                          <button
                            type='button'
                            onClick={() => setShowPass(!showPass)}
                            className='absolute right-5 top-1/2 -translate-y-1/2 text-gray-300 hover:text-[#002EFF] transition-colors'
                          >
                            {showPass ? (
                              <EyeOff size={18} />
                            ) : (
                              <Eye size={18} />
                            )}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage className='text-[10px] font-bold uppercase' />
                    </FormItem>
                  )}
                />

                <div className='flex items-center justify-between py-2'>
                  <FormField
                    control={form.control}
                    name='rememberMe'
                    render={({ field }) => (
                      <FormItem className='flex flex-row items-center space-x-2 space-y-0'>
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            className='rounded-md border-gray-200 data-[state=checked]:bg-[#002EFF] data-[state=checked]:border-[#002EFF]'
                          />
                        </FormControl>
                        <FormLabel className='text-[10px] font-black text-gray-400 uppercase cursor-pointer select-none'>
                          Remember me
                        </FormLabel>
                      </FormItem>
                    )}
                  />
                </div>

                <Button
                  type='submit'
                  disabled={loading}
                  className='w-full py-8 bg-[#002EFF] text-white font-black rounded-2xl hover:bg-blue-700 transition-all flex items-center justify-center gap-3 shadow-xl shadow-blue-100 disabled:opacity-70 active:scale-[0.97]'
                >
                  {loading ? (
                    <Loader2 className='animate-spin' size={20} />
                  ) : (
                    <>
                      SECURE LOG IN <LogIn size={20} />
                    </>
                  )}
                </Button>
              </form>
            </Form>

            <div className='mt-10 text-center'>
              <p className='text-gray-400 font-bold text-[10px] uppercase tracking-widest'>
                Don&apos;t have an account?{' '}
                <Link
                  href='/auth/signup'
                  className='text-[#002EFF] ml-1 font-black hover:underline'
                >
                  Create one now
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <p className='text-center text-[10px] font-bold text-gray-300 uppercase tracking-[0.3em]'>
        Distinguished Scholars Academy
      </p>
    </div>
  )
}

export default function LoginPage() {
  return (
    <div className='min-h-screen bg-[#F8FAFF] flex flex-col items-center justify-center p-4 md:p-6 font-sans'>
      <Suspense
        fallback={
          <div className='flex flex-col items-center gap-4'>
            <Loader2 className='animate-spin text-[#002EFF]' size={40} />
            <p className='text-[10px] font-black text-gray-400 uppercase tracking-widest'>
              Loading Portal...
            </p>
          </div>
        }
      >
        <LoginContent />
      </Suspense>
    </div>
  )
}