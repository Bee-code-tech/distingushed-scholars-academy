'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import {
  GraduationCap,
  ArrowRight,
  User,
  Eye,
  EyeOff,
  AtSign,
  Loader2,
  Phone,
  CheckCircle2,
  BookOpen,
  ShieldCheck,
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { cn } from '@/lib/utils'

const SUBJECT_OPTIONS = [
  'Mathematics',
  'English Language',
  'Physics',
  'Chemistry',
  'Biology',
  'Economics',
  'Government',
  'Literature',
  'Commerce',
  'CRS/IRS',
  'Agric Science',
  'Geography',
  'Accounting',
  'Civic Education',
  'Further Maths',
]

const formSchema = z
  .object({
    fullname: z.string().min(2, 'Full name is required'),
    username: z
      .string()
      .min(3, 'Min 3 characters')
      .regex(/^[a-zA-Z0-9_]+$/, 'No spaces/special characters'),
    phone: z
      .string()
      .min(10, 'Valid phone required')
      .regex(/^\d+$/, 'Numbers only'),
    email: z.string().email('Invalid email'),
    password: z.string().min(6, 'Min. 6 characters'),
    confirmPassword: z.string(),
    examType: z.string().min(1, 'Select an exam'),
    subjects: z.array(z.string()),
    isDSA: z.enum(['yes', 'no']),
    studentId: z.string().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })
  .refine(
    (data) => {
      if (data.examType === 'jamb') return data.subjects.length === 4
      if (data.examType === 'waec')
        return data.subjects.length >= 8 && data.subjects.length <= 9
      if (data.examType === 'post utme') return data.subjects.length >= 1
      return data.subjects.length >= 4
    },
    {
      message: 'Invalid number of subjects for selected exam',
      path: ['subjects'],
    },
  )

export default function DSASignUp() {
  const [showPass, setShowPass] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)
  const router = useRouter()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullname: '',
      username: '',
      phone: '',
      email: '',
      password: '',
      confirmPassword: '',
      examType: 'jamb',
      isDSA: 'no',
      subjects: [],
      studentId: '',
    },
  })

  const { watch, setValue, handleSubmit, control, trigger } = form
  const watchIsDSA = watch('isDSA')
  const watchExam = watch('examType')
  const selectedSubjects = watch('subjects')

  useEffect(() => {
    if (selectedSubjects.length > 0) trigger('subjects')
  }, [watchExam, trigger, selectedSubjects.length])

  const getSubjectGuidance = () => {
    if (watchExam === 'jamb') return 'Select exactly 4 subjects'
    if (watchExam === 'waec') return 'Select 8 to 9 subjects'
    return 'Select your relevant subjects'
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setApiError(null)
    setIsLoading(true)
    try {
      const response = await fetch(
        'https://api.distinguishedscholarsacademy.com/api/auth/register',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: values.fullname,
            username: values.username.toLowerCase(),
            email: values.email.toLowerCase(),
            password: values.password,
            phoneNumber: values.phone,
            level: values.examType,
            subjectsOfInterest: values.subjects,
            role: 'student',
            isDsaStudent: values.isDSA === 'yes',
            dsaId: values.studentId || '',
          }),
        },
      )

      const data = await response.json()
      if (!response.ok) throw new Error(data.message || 'Registration failed')

      localStorage.setItem('dsa_pending_email', values.email)
      router.push('/auth/verify-otp')
    } catch (error) {
      setApiError(error instanceof Error ? error.message : 'Connection error.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className='min-h-screen bg-[#F8FAFF] py-8 px-4 flex flex-col items-center'>
      <div className='text-center mb-6'>
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className='inline-flex p-2 bg-white rounded-xl shadow-sm mb-4'
        >
          <div className='bg-[#002EFF] text-white p-2 rounded-lg'>
            <GraduationCap size={24} />
          </div>
        </motion.div>
        <h1 className='text-2xl font-black text-slate-900'>
          Student Registration
        </h1>
        <p className='text-slate-500 text-sm font-medium'>
          Join the Distinguished Scholars Academy
        </p>
      </div>

      <Card className='w-full max-w-xl rounded-[24px] shadow-lg border-slate-100 overflow-hidden bg-white'>
        <CardContent className='p-6 md:p-8'>
          <Form {...form}>
            <form onSubmit={handleSubmit(onSubmit)} className='space-y-8'>
              {/* Personal Identity */}
              <div className='space-y-4'>
                <div className='flex items-center gap-2 border-b border-slate-50 pb-2'>
                  <User size={14} className='text-[#002EFF]' />
                  <h2 className='text-[10px] font-black uppercase tracking-widest text-slate-400'>
                    Identity
                  </h2>
                </div>

                <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                  <FormField
                    control={control}
                    name='fullname'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className='text-[10px] font-bold text-slate-500'>
                          FULL NAME
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder='John Doe'
                            className='h-11 rounded-lg bg-slate-50 border-transparent focus:bg-white transition-all'
                          />
                        </FormControl>
                        <FormMessage className='text-[10px]' />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={control}
                    name='username'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className='text-[10px] font-bold text-slate-500'>
                          USERNAME
                        </FormLabel>
                        <FormControl>
                          <div className='relative'>
                            <AtSign
                              className='absolute left-3 top-3.5 text-slate-400'
                              size={14}
                            />
                            <Input
                              {...field}
                              placeholder='johndoe123'
                              className='pl-9 h-11 rounded-lg bg-slate-50 border-transparent focus:bg-white'
                            />
                          </div>
                        </FormControl>
                        <FormMessage className='text-[10px]' />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Security & Contact */}
              <div className='space-y-4'>
                <div className='flex items-center gap-2 border-b border-slate-50 pb-2'>
                  <ShieldCheck size={14} className='text-[#002EFF]' />
                  <h2 className='text-[10px] font-black uppercase tracking-widest text-slate-400'>
                    Security
                  </h2>
                </div>
                <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                  <FormField
                    control={control}
                    name='email'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className='text-[10px] font-bold text-slate-500'>
                          EMAIL
                        </FormLabel>
                        <FormControl>
                          <Input
                            type='email'
                            {...field}
                            placeholder='example@gmail.com'
                            className='h-11 rounded-lg bg-slate-50 border-transparent'
                          />
                        </FormControl>
                        <FormMessage className='text-[10px]' />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={control}
                    name='phone'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className='text-[10px] font-bold text-slate-500'>
                          WHATSAPP
                        </FormLabel>
                        <FormControl>
                          <div className='relative'>
                            <Phone
                              className='absolute left-3 top-3.5 text-slate-400'
                              size={14}
                            />
                            <Input
                              {...field}
                              placeholder='08012345678'
                              className='pl-9 h-11 rounded-lg bg-slate-50 border-transparent'
                            />
                          </div>
                        </FormControl>
                        <FormMessage className='text-[10px]' />
                      </FormItem>
                    )}
                  />
                </div>
                <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                  <FormField
                    control={control}
                    name='password'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className='text-[10px] font-bold text-slate-500'>
                          PASSWORD
                        </FormLabel>
                        <FormControl>
                          <div className='relative'>
                            <Input
                              type={showPass ? 'text' : 'password'}
                              {...field}
                              placeholder='••••••••'
                              className='h-11 rounded-lg bg-slate-50 border-transparent pr-10'
                            />
                            <button
                              type='button'
                              onClick={() => setShowPass(!showPass)}
                              className='absolute right-3 top-3 text-slate-400 hover:text-blue-600'
                            >
                              {showPass ? (
                                <EyeOff size={16} />
                              ) : (
                                <Eye size={16} />
                              )}
                            </button>
                          </div>
                        </FormControl>
                        <FormMessage className='text-[10px]' />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={control}
                    name='confirmPassword'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className='text-[10px] font-bold text-slate-500'>
                          CONFIRM
                        </FormLabel>
                        <FormControl>
                          <div className='relative'>
                            <Input
                              type={showConfirm ? 'text' : 'password'}
                              {...field}
                              placeholder='••••••••'
                              className='h-11 rounded-lg bg-slate-50 border-transparent pr-10'
                            />
                            <button
                              type='button'
                              onClick={() => setShowConfirm(!showConfirm)}
                              className='absolute right-3 top-3 text-slate-400 hover:text-blue-600'
                            >
                              {showConfirm ? (
                                <EyeOff size={16} />
                              ) : (
                                <Eye size={16} />
                              )}
                            </button>
                          </div>
                        </FormControl>
                        <FormMessage className='text-[10px]' />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Academic */}
              <div className='space-y-4'>
                <div className='flex items-center gap-2 border-b border-slate-50 pb-2'>
                  <BookOpen size={14} className='text-[#002EFF]' />
                  <h2 className='text-[10px] font-black uppercase tracking-widest text-slate-400'>
                    Academic
                  </h2>
                </div>
                <FormField
                  control={control}
                  name='examType'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className='text-[10px] font-bold text-slate-500'>
                        TARGET EXAM
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className='h-11 rounded-lg bg-slate-50 border-transparent font-bold'>
                            <SelectValue placeholder='Select Exam Type' />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value='jamb'>JAMB</SelectItem>
                          <SelectItem value='waec'>WAEC / NECO</SelectItem>
                          <SelectItem value='post utme'>Post-UTME</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />

                <div className='space-y-3'>
                  <div className='flex justify-between items-center'>
                    <p className='text-[10px] text-slate-400 font-bold uppercase'>
                      {getSubjectGuidance()}
                    </p>
                    <span
                      className={cn(
                        'text-[10px] font-black px-2 py-0.5 rounded-full',
                        selectedSubjects.length > 0
                          ? 'bg-blue-50 text-blue-600'
                          : 'bg-slate-50 text-slate-400',
                      )}
                    >
                      {selectedSubjects.length} SELECTED
                    </span>
                  </div>
                  <div className='grid grid-cols-2 lg:grid-cols-4 gap-2'>
                    {SUBJECT_OPTIONS.map((sub) => (
                      <div
                        key={sub}
                        onClick={() => {
                          const curr = [...selectedSubjects]
                          const idx = curr.indexOf(sub)
                          if (idx > -1) curr.splice(idx, 1)
                          else curr.push(sub)
                          setValue('subjects', curr, { shouldValidate: true })
                        }}
                        className={cn(
                          'cursor-pointer py-2 px-3 rounded-lg border text-[10px] font-bold transition-all text-center truncate',
                          selectedSubjects.includes(sub)
                            ? 'bg-blue-50 border-[#002EFF] text-[#002EFF]'
                            : 'bg-white border-slate-100 text-slate-600 hover:bg-slate-50',
                        )}
                      >
                        {sub}
                      </div>
                    ))}
                  </div>
                  <FormMessage className='text-[10px]' />
                </div>
              </div>

              {/* Physical Student ID */}
              <div className='p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-3'>
                <FormField
                  control={control}
                  name='isDSA'
                  render={({ field }) => (
                    <FormItem className='flex items-center justify-between space-y-0'>
                      <FormLabel className='text-[10px] font-black text-slate-500'>
                        PHYSICAL STUDENT?
                      </FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          value={field.value}
                          className='flex gap-4'
                        >
                          {['no', 'yes'].map((opt) => (
                            <div
                              key={opt}
                              className='flex items-center space-x-1'
                            >
                              <RadioGroupItem value={opt} id={`r-${opt}`} />
                              <label
                                htmlFor={`r-${opt}`}
                                className='text-[10px] font-bold uppercase cursor-pointer'
                              >
                                {opt}
                              </label>
                            </div>
                          ))}
                        </RadioGroup>
                      </FormControl>
                    </FormItem>
                  )}
                />
                <AnimatePresence>
                  {watchIsDSA === 'yes' && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                    >
                      <FormField
                        control={control}
                        name='studentId'
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input
                                {...field}
                                placeholder='e.g. DSA-2024-001'
                                className='h-10 text-xs font-bold border-blue-200'
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {apiError && (
                <div className='p-3 bg-rose-50 border border-rose-100 rounded-xl text-rose-600 text-[10px] font-bold text-center'>
                  {apiError}
                </div>
              )}

              <Button
                disabled={isLoading}
                className='w-full bg-[#002EFF] hover:bg-blue-700 h-14 rounded-xl font-black uppercase text-xs shadow-lg shadow-blue-100'
              >
                {isLoading ? (
                  <Loader2 className='animate-spin' />
                ) : (
                  <span className='flex items-center gap-2'>
                    Create Account <ArrowRight size={16} />
                  </span>
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <p className='mt-6 text-xs font-bold text-slate-400'>
        Already have an account?{' '}
        <Link
          href='/auth/signin'
          className='text-[#002EFF] hover:underline ml-1'
        >
          Sign In
        </Link>
      </p>
    </div>
  )
}
