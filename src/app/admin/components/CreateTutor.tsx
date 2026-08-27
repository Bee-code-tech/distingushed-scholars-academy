// //src/app/admin/components/CreateTutor.tsx
// 'use client'

// import React, { useState } from 'react'
// import {
//   UserPlus,
//   User,
//   AtSign,
//   Mail,
//   Phone,
//   Lock,
//   BookOpen,
//   Loader2,
//   CheckCircle2,
//   AlertCircle,
//   Eye,
//   EyeOff,
// } from 'lucide-react'
// import { dsaApi } from '@/lib/api'
// import { addTutor } from '@/lib/directoryStore'

// interface FieldState {
//   fullname: string
//   username: string
//   email: string
//   phone: string
//   subject: string
//   password: string
// }

// const EMPTY: FieldState = {
//   fullname: '',
//   username: '',
//   email: '',
//   phone: '',
//   subject: '',
//   password: '',
// }

// // Simple, self-generating password suggestion so admins don't have to invent one.
// function suggestPassword() {
//   // Fixed-ish readable pattern; admin can edit. Not security-critical here —
//   // the tutor resets it on first login.
//   return 'DSAtutor' + Math.floor(1000 + ((Date.now() / 1000) % 9000)) // varies by call
// }

// export default function CreateTutor() {
//   const [values, setValues] = useState<FieldState>(EMPTY)
//   const [showPass, setShowPass] = useState(false)
//   const [loading, setLoading] = useState(false)
//   const [error, setError] = useState('')
//   const [success, setSuccess] = useState('')

//   const set = (k: keyof FieldState, v: string) =>
//     setValues((prev) => ({ ...prev, [k]: v }))

//   const validate = (): string | null => {
//     if (values.fullname.trim().length < 2) return 'Enter the tutor’s full name'
//     if (!/^[a-zA-Z0-9_]{3,}$/.test(values.username))
//       return 'Username: min 3 characters, letters/numbers/underscore only'
//     if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(values.email))
//       return 'Enter a valid email address'
//     if (!/^\d{10,}$/.test(values.phone))
//       return 'Enter a valid phone number (numbers only)'
//     if (values.password.length < 6) return 'Password must be at least 6 characters'
//     return null
//   }

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault()
//     setError('')
//     setSuccess('')
//     const problem = validate()
//     if (problem) {
//       setError(problem)
//       return
//     }

//     setLoading(true)
//     try {
//       // Admin creates the tutor via the register endpoint with role: 'tutor'.
//       // NOTE: this endpoint is currently public; a dedicated admin-only
//       // "create user" endpoint is requested in docs/backend-requests.md.
//       await dsaApi.auth.register({
//         name: values.fullname,
//         username: values.username.toLowerCase(),
//         email: values.email.toLowerCase(),
//         password: values.password,
//         phoneNumber: values.phone,
//         role: 'tutor',
//         subjectsOfInterest: values.subject ? [values.subject] : [],
//       })

//       // Record locally so the admin's "View Tutors" list shows them (until the
//       // backend has a list-users endpoint).
//       addTutor({
//         key: values.username.toLowerCase(),
//         name: values.fullname,
//         email: values.email.toLowerCase(),
//         extra: values.subject || undefined,
//       })

//       setSuccess(
//         `Tutor "${values.fullname}" created. They can now sign in with ${values.email.toLowerCase()}.`,
//       )
//       setValues(EMPTY)
//     } catch (err) {
//       setError(err instanceof Error ? err.message : 'Failed to create tutor.')
//     } finally {
//       setLoading(false)
//     }
//   }

//   const Field = ({
//     icon: Icon,
//     label,
//     value,
//     onChange,
//     placeholder,
//     type = 'text',
//   }: {
//     icon: React.ElementType
//     label: string
//     value: string
//     onChange: (v: string) => void
//     placeholder: string
//     type?: string
//   }) => (
//     <div className='space-y-1.5'>
//       <label className='text-[10px] font-black uppercase tracking-widest text-slate-400'>
//         {label}
//       </label>
//       <div className='relative'>
//         <Icon
//           className='absolute left-3 top-1/2 -translate-y-1/2 text-slate-400'
//           size={15}
//         />
//         <input
//           type={type}
//           value={value}
//           onChange={(e) => onChange(e.target.value)}
//           placeholder={placeholder}
//           className='w-full h-11 pl-9 pr-3 rounded-lg bg-slate-50 border border-transparent focus:border-[#002EFF]/30 focus:bg-white outline-none text-sm font-medium transition-all'
//         />
//       </div>
//     </div>
//   )

//   return (
//     <div className='max-w-2xl mx-auto'>
//       <div className='flex items-center gap-3 mb-6'>
//         <div className='h-11 w-11 rounded-2xl bg-[#002EFF] text-white flex items-center justify-center shadow-lg shadow-blue-200'>
//           <UserPlus size={20} />
//         </div>
//         <div>
//           <h2 className='text-xl font-black text-slate-900 uppercase tracking-tight'>
//             Create Tutor
//           </h2>
//           <p className='text-[11px] font-bold text-slate-400'>
//             Add a new tutor account. They sign in on the normal login page.
//           </p>
//         </div>
//       </div>

//       <form
//         onSubmit={handleSubmit}
//         className='bg-white rounded-3xl border border-slate-100 shadow-sm p-6 md:p-8 space-y-5'
//       >
//         {success && (
//           <div className='flex items-center gap-2 p-3 rounded-xl bg-emerald-50 text-emerald-700 text-[11px] font-bold'>
//             <CheckCircle2 size={16} className='shrink-0' /> {success}
//           </div>
//         )}
//         {error && (
//           <div className='flex items-center gap-2 p-3 rounded-xl bg-rose-50 text-rose-600 text-[11px] font-bold'>
//             <AlertCircle size={16} className='shrink-0' /> {error}
//           </div>
//         )}

//         <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
//           <Field
//             icon={User}
//             label='Full Name'
//             value={values.fullname}
//             onChange={(v) => set('fullname', v)}
//             placeholder='e.g. Mr. Hakeem Bello'
//           />
//           <Field
//             icon={AtSign}
//             label='Username'
//             value={values.username}
//             onChange={(v) => set('username', v)}
//             placeholder='hakeem_bello'
//           />
//           <Field
//             icon={Mail}
//             label='Email'
//             type='email'
//             value={values.email}
//             onChange={(v) => set('email', v)}
//             placeholder='tutor@example.com'
//           />
//           <Field
//             icon={Phone}
//             label='Phone'
//             value={values.phone}
//             onChange={(v) => set('phone', v)}
//             placeholder='08012345678'
//           />
//           <Field
//             icon={BookOpen}
//             label='Subject / Specialty'
//             value={values.subject}
//             onChange={(v) => set('subject', v)}
//             placeholder='e.g. Mathematics'
//           />
//           <div className='space-y-1.5'>
//             <label className='text-[10px] font-black uppercase tracking-widest text-slate-400'>
//               Temporary Password
//             </label>
//             <div className='relative'>
//               <Lock
//                 className='absolute left-3 top-1/2 -translate-y-1/2 text-slate-400'
//                 size={15}
//               />
//               <input
//                 type={showPass ? 'text' : 'password'}
//                 value={values.password}
//                 onChange={(e) => set('password', e.target.value)}
//                 placeholder='min 6 characters'
//                 className='w-full h-11 pl-9 pr-10 rounded-lg bg-slate-50 border border-transparent focus:border-[#002EFF]/30 focus:bg-white outline-none text-sm font-medium transition-all'
//               />
//               <button
//                 type='button'
//                 onClick={() => setShowPass(!showPass)}
//                 className='absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#002EFF]'
//               >
//                 {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
//               </button>
//             </div>
//           </div>
//         </div>

//         <button
//           type='button'
//           onClick={() => set('password', suggestPassword())}
//           className='text-[10px] font-black uppercase text-[#002EFF] hover:underline'
//         >
//           Generate a password
//         </button>

//         <div className='pt-2 flex items-center justify-between gap-3 border-t border-slate-50'>
//           <p className='text-[10px] font-bold text-slate-400'>
//             Share the email &amp; temporary password with the tutor. They can
//             change it after signing in.
//           </p>
//           <button
//             type='submit'
//             disabled={loading}
//             className='shrink-0 flex items-center gap-2 px-6 h-11 bg-[#002EFF] text-white rounded-xl font-black text-[11px] uppercase tracking-wide shadow-lg shadow-blue-200 hover:bg-blue-700 active:scale-95 transition-all disabled:opacity-60'
//           >
//             {loading ? (
//               <Loader2 size={16} className='animate-spin' />
//             ) : (
//               <>
//                 <UserPlus size={15} /> Create Tutor
//               </>
//             )}
//           </button>
//         </div>
//       </form>
//     </div>
//   )
// }

'use client'

import React, { useState, useEffect } from 'react'
import {
  UserPlus,
  User,
  AtSign,
  Mail,
  Phone,
  Lock,
  BookOpen,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
} from 'lucide-react'
import { adminApi } from '@/lib/admin-api'
import { addTutor } from '@/lib/directoryStore'
import { fetchExistingEmails, adminToken } from '@/lib/existingUsers'

interface FieldState {
  fullname: string
  username: string
  email: string
  phone: string
  subject: string
  password: string
}

const EMPTY: FieldState = {
  fullname: '',
  username: '',
  email: '',
  phone: '',
  subject: '',
  password: '',
}

function suggestPassword() {
  return 'DSAtutor' + Math.floor(1000 + ((Date.now() / 1000) % 9000))
}

// Defined at module scope (NOT inside CreateTutor). If this lived inside the
// component, every keystroke re-created the Field function, so React would
// unmount/remount the <input> and the field would lose focus after one char.
function Field({
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
}) {
  return (
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
}

export default function CreateTutor() {
  const [values, setValues] = useState<FieldState>(EMPTY)
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  // Known emails across all roles → instant "already registered" warning.
  const [existingEmails, setExistingEmails] = useState<Set<string>>(new Set())
  useEffect(() => {
    let cancelled = false
    fetchExistingEmails(adminToken())
      .then((s) => !cancelled && setExistingEmails(s))
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [])

  const emailTaken =
    values.email.trim().length > 0 &&
    existingEmails.has(values.email.trim().toLowerCase())

  const set = (k: keyof FieldState, v: string) =>
    setValues((prev) => ({ ...prev, [k]: v }))

  const validate = (): string | null => {
    if (values.fullname.trim().length < 2) return 'Enter the tutor’s full name'
    if (!/^[a-zA-Z0-9_]{3,}$/.test(values.username))
      return 'Username: min 3 characters, letters/numbers/underscore only'
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(values.email))
      return 'Enter a valid email address'
    if (emailTaken)
      return 'That email is already registered to another user. Use a different email.'
    if (!/^\d{10,}$/.test(values.phone))
      return 'Enter a valid phone number (numbers only)'
    if (values.password.length < 6)
      return 'Password must be at least 6 characters'
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
      // Direct call to adminApi.createStaff matching backend swagger payload
      await adminApi.createStaff({
        fullname: values.fullname,
        username: values.username.toLowerCase(),
        email: values.email.toLowerCase(),
        password: values.password,
        role: 'tutor',
        phoneNumber: values.phone,
        subjects: values.subject ? [values.subject] : [],
      })

      // Sync local store
      addTutor({
        key: values.username.toLowerCase(),
        name: values.fullname,
        email: values.email.toLowerCase(),
        extra: values.subject || undefined,
      })

      setSuccess(
        `Tutor "${values.fullname}" created successfully. They can now sign in with ${values.email.toLowerCase()}.`,
      )
      setValues(EMPTY)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to create tutor.'
      // The backend returns a generic Mongoose duplicate-key message
      // ("Duplicate field value entered") without naming the field. Translate
      // it into something an admin can act on: email/username/phone are unique
      // across ALL users, so a collision with any existing account triggers it.
      setError(
        /duplicate/i.test(msg)
          ? 'That email, username, or phone number is already registered to another user. Use different details.'
          : msg,
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='max-w-2xl mx-auto'>
      <div className='flex items-center gap-3 mb-6'>
        <div className='h-11 w-11 rounded-2xl bg-[#002EFF] text-white flex items-center justify-center shadow-lg shadow-blue-200'>
          <UserPlus size={20} />
        </div>
        <div>
          <h2 className='text-xl font-black text-slate-900 uppercase tracking-tight'>
            Create Tutor
          </h2>
          <p className='text-[11px] font-bold text-slate-400'>
            Add a new tutor account. They sign in on the normal login page.
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
            placeholder='e.g. Mr. Hakeem Bello'
          />
          <Field
            icon={AtSign}
            label='Username'
            value={values.username}
            onChange={(v) => set('username', v)}
            placeholder='hakeem_bello'
          />
          <div>
            <Field
              icon={Mail}
              label='Email'
              type='email'
              value={values.email}
              onChange={(v) => set('email', v)}
              placeholder='tutor@example.com'
            />
            {emailTaken && (
              <p className='mt-1 flex items-center gap-1 text-[10px] font-bold text-rose-500'>
                <AlertCircle size={11} /> Already registered to another account.
              </p>
            )}
          </div>
          <Field
            icon={Phone}
            label='Phone'
            value={values.phone}
            onChange={(v) => set('phone', v)}
            placeholder='08012345678'
          />
          <Field
            icon={BookOpen}
            label='Subject / Specialty'
            value={values.subject}
            onChange={(v) => set('subject', v)}
            placeholder='e.g. Mathematics'
          />
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
            Share the email &amp; temporary password with the tutor. They can
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
                <UserPlus size={15} /> Create Tutor
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}