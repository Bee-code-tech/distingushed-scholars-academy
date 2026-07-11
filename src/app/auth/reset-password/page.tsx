'use client'

import { useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import {
  Lock,
  Loader2,
  CheckCircle2,
  Eye,
  EyeOff,
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

const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
      .regex(/[0-9]/, 'Must contain at least one number'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  })

export default function SetNewPassword() {
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const params = useParams()
  const token = params?.token as string

  const form = useForm<z.infer<typeof resetPasswordSchema>>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: '', confirmPassword: '' },
    mode: 'onChange',
  })

  const passwordValue = form.watch('password') || ''
  const hasMinLength = passwordValue.length >= 8
  const hasUppercase = /[A-Z]/.test(passwordValue)
  const hasNumber = /[0-9]/.test(passwordValue)

  async function onSubmit(values: z.infer<typeof resetPasswordSchema>) {
    if (!token) {
      setError('Invalid or expired reset link. Please try the process again.')
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await fetch(
        `https://api.distinguishedscholarsacademy.com/api/auth/reset-password/${token}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify({
            newPassword: values.password,
          }),
        },
      )

      // --- ROBUST JSON CHECK ---
      const contentType = response.headers.get('content-type')
      let data

      if (contentType && contentType.includes('application/json')) {
        data = await response.json()
      } else {
        // Handle non-JSON responses (like HTML 404/500 pages)
        throw new Error(
          `Server returned an unexpected error (${response.status}). Please try again later.`,
        )
      }

      if (!response.ok) {
        throw new Error(
          data.message ||
            'Failed to reset password. The link may have expired.',
        )
      }

      await new Promise((resolve) => setTimeout(resolve, 800))
      router.push('/auth/login?reset=success')
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.')
    } finally {
      setLoading(false)
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

          <CardHeader className='text-center pt-10 pb-2'>
            <div className='bg-blue-50 text-[#002EFF] w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4'>
              <Lock size={24} />
            </div>
            <CardTitle className='text-2xl font-black text-zinc-900 tracking-tight uppercase'>
              New Password
            </CardTitle>
            <CardDescription className='font-medium text-xs text-gray-500'>
              Please create a strong password that you don&apos;t use elsewhere.
            </CardDescription>
          </CardHeader>

          <CardContent className='p-8'>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className='space-y-5'
              >
                <FormField
                  control={form.control}
                  name='password'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className='text-[10px] font-black uppercase text-gray-400 ml-1'>
                        New Password
                      </FormLabel>
                      <FormControl>
                        <div className='relative'>
                          <Lock
                            className='absolute left-4 top-1/2 -translate-y-1/2 text-gray-400'
                            size={18}
                          />
                          <Input
                            type={showPassword ? 'text' : 'password'}
                            placeholder='••••••••'
                            {...field}
                            className='h-14 pl-12 pr-12 py-6 rounded-2xl bg-gray-50 border-none focus-visible:ring-2 focus-visible:ring-[#002EFF] font-bold text-gray-800 transition-all outline-none'
                          />
                          <button
                            type='button'
                            onClick={() => setShowPassword(!showPassword)}
                            className='absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#002EFF] transition-colors'
                          >
                            {showPassword ? (
                              <EyeOff size={18} />
                            ) : (
                              <Eye size={18} />
                            )}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage className='text-[10px]' />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='confirmPassword'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className='text-[10px] font-black uppercase text-gray-400 ml-1'>
                        Confirm Password
                      </FormLabel>
                      <FormControl>
                        <div className='relative'>
                          <CheckCircle2
                            className='absolute left-4 top-1/2 -translate-y-1/2 text-gray-400'
                            size={18}
                          />
                          <Input
                            type='password'
                            placeholder='••••••••'
                            {...field}
                            className='h-14 pl-12 py-6 rounded-2xl bg-gray-50 border-none focus-visible:ring-2 focus-visible:ring-[#002EFF] font-bold text-gray-800 transition-all outline-none'
                          />
                        </div>
                      </FormControl>
                      <FormMessage className='text-[10px]' />
                    </FormItem>
                  )}
                />

                {/* Requirement Checklist */}
                <div className='bg-blue-50/50 p-4 rounded-2xl space-y-2 border border-blue-50'>
                  <p className='text-[9px] font-black uppercase text-blue-400 tracking-wider'>
                    Security Requirements
                  </p>
                  <ul className='text-[11px] font-bold text-zinc-500 space-y-1.5'>
                    <li className='flex items-center gap-2'>
                      <div
                        className={`w-1.5 h-1.5 rounded-full transition-colors duration-300 ${hasMinLength ? 'bg-green-500' : 'bg-gray-300'}`}
                      />
                      <span
                        className={`transition-colors ${hasMinLength ? 'text-zinc-900' : ''}`}
                      >
                        At least 8 characters
                      </span>
                    </li>
                    <li className='flex items-center gap-2'>
                      <div
                        className={`w-1.5 h-1.5 rounded-full transition-colors duration-300 ${hasUppercase ? 'bg-green-500' : 'bg-gray-300'}`}
                      />
                      <span
                        className={`transition-colors ${hasUppercase ? 'text-zinc-900' : ''}`}
                      >
                        One uppercase letter
                      </span>
                    </li>
                    <li className='flex items-center gap-2'>
                      <div
                        className={`w-1.5 h-1.5 rounded-full transition-colors duration-300 ${hasNumber ? 'bg-green-500' : 'bg-gray-300'}`}
                      />
                      <span
                        className={`transition-colors ${hasNumber ? 'text-zinc-900' : ''}`}
                      >
                        One number
                      </span>
                    </li>
                  </ul>
                </div>

                {error && (
                  <Alert
                    variant='destructive'
                    className='rounded-2xl bg-rose-50 border-none text-rose-600'
                  >
                    <AlertCircle className='h-4 w-4 text-rose-600' />
                    <AlertDescription className='text-xs font-bold uppercase'>
                      {error}
                    </AlertDescription>
                  </Alert>
                )}

                <Button
                  type='submit'
                  disabled={loading}
                  className='w-full py-7 bg-black text-white font-black rounded-2xl hover:bg-[#002EFF] transition-all flex items-center justify-center gap-2 shadow-xl shadow-blue-100 disabled:opacity-70 active:scale-[0.98]'
                >
                  {loading ? (
                    <Loader2 className='animate-spin' size={20} />
                  ) : (
                    'UPDATE PASSWORD'
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
