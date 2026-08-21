// 'use client'

// import { useEffect, useState } from 'react'
// import { Users, Loader2, Cloud, HardDrive } from 'lucide-react'
// import { Badge } from '@/components/ui/badge'
// import { getStudents, type StoredStudent } from '@/lib/studentsStore'
// import { dsaApi } from '@/lib/api'

// // Map a backend user record (shape TBD) to the row we render, defensively.
// function mapStudent(u: Record<string, unknown>): StoredStudent {
//   const s = u as Record<string, string | boolean | undefined>
//   const mode =
//     (s.learningMode as string) ||
//     (s.mode as string) ||
//     (s.isDsaStudent ? 'physical' : s.isDsaStudent === false ? 'online' : undefined)
//   return {
//     key: String(s.studentId || s.username || s.email || s.id || s.fullname || Math.random()),
//     name: String(s.fullname || s.fullName || s.name || 'Student'),
//     track: String(s.examTrack || s.level || s.track || '—').toUpperCase(),
//     mode,
//   }
// }

// export default function StudentRoster() {
//   const [loading, setLoading] = useState(true)
//   const [students, setStudents] = useState<StoredStudent[]>([])
//   const [source, setSource] = useState<'server' | 'local'>('local')

//   useEffect(() => {
//     let cancelled = false
//     ;(async () => {
//       // Live-first: try the backend list, fall back to the local roster.
//       try {
//         const rows = await dsaApi.admin.listUsers('student')
//         if (!cancelled && Array.isArray(rows) && rows.length > 0) {
//           setStudents(rows.map(mapStudent))
//           setSource('server')
//           return
//         }
//         throw new Error('no server data')
//       } catch {
//         if (!cancelled) {
//           setStudents(getStudents())
//           setSource('local')
//         }
//       } finally {
//         if (!cancelled) setLoading(false)
//       }
//     })()
//     return () => {
//       cancelled = true
//     }
//   }, [])

//   if (loading) {
//     return <div className='py-20 flex justify-center'><Loader2 className='animate-spin text-[#002EFF]' /></div>
//   }

//   return (
//     <div className='max-w-5xl mx-auto space-y-4 px-4'>
//       <div className='flex items-center gap-2'>
//         <Users size={18} className='text-[#002EFF]' />
//         <h1 className='text-2xl font-black text-slate-900 tracking-tight'>Students</h1>
//         <Badge className={`text-[8px] font-black ${source === 'server' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>
//           {source === 'server' ? <><Cloud size={9} className='mr-1' /> Live</> : <><HardDrive size={9} className='mr-1' /> Local</>}
//         </Badge>
//         <span className='ml-auto text-[10px] font-black uppercase text-slate-400'>{students.length} total</span>
//       </div>

//       <div className='bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden'>
//         <div className='grid grid-cols-12 px-5 py-3 bg-slate-50 text-[9px] font-black uppercase text-gray-400'>
//           <span className='col-span-5'>Student</span>
//           <span className='col-span-3'>Track</span>
//           <span className='col-span-4'>Mode</span>
//         </div>
//         {students.length === 0 ? (
//           <p className='px-5 py-10 text-center text-xs font-bold text-slate-400'>No students yet.</p>
//         ) : (
//           students.map((s) => (
//             <div key={s.key} className='grid grid-cols-12 items-center px-5 py-4 border-t border-slate-50'>
//               <span className='col-span-5 text-xs font-black text-gray-800'>
//                 {s.name}
//                 {s.isNew && (
//                   <span className='ml-2 text-[8px] font-black uppercase text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded'>New</span>
//                 )}
//               </span>
//               <span className='col-span-3'>
//                 <Badge className='bg-blue-50 text-[#002EFF] text-[8px] font-black'>{s.track}</Badge>
//               </span>
//               <span className='col-span-4 text-[10px] font-bold text-slate-500'>
//                 {s.mode === 'physical' ? 'On-Campus' : s.mode === 'online' ? 'Online' : '—'}
//               </span>
//             </div>
//           ))
//         )}
//       </div>
//       <p className='text-[10px] font-medium text-slate-400'>
//         {source === 'server'
//           ? 'Live from the server.'
//           : 'Showing this browser’s list — the server students API (GET /admin/users?role=student) is not live yet, so registered students from other devices won’t appear until the backend ships it.'}
//       </p>
//     </div>
//   )
// }

// 'use client'

// import { useEffect, useState } from 'react'
// import {
//   Users,
//   Loader2,
//   Cloud,
//   HardDrive,
//   CreditCard,
//   CheckCircle2,
//   AlertCircle,
//   X,
//   DollarSign,
//   Receipt,
// } from 'lucide-react'
// import { Badge } from '@/components/ui/badge'
// import { getStudents, type StoredStudent } from '@/lib/studentsStore'
// import { adminApi } from '@/lib/admin-api'

// export interface ExtendedStudent extends StoredStudent {
//   studentId: string
//   email?: string
//   isPaid?: boolean
// }

// // Map backend user record to internal student object
// function mapStudent(u: Record<string, unknown>): ExtendedStudent {
//   const s = u as Record<string, string | boolean | number | undefined>
//   const mode =
//     (s.learningMode as string) ||
//     (s.mode as string) ||
//     (s.isDsaStudent
//       ? 'physical'
//       : s.isDsaStudent === false
//         ? 'online'
//         : undefined)

//   const rawId = String(s.studentId || s.studentCode || s.id || s.username || '')

//   return {
//     key: String(rawId || s.email || s.fullname || Math.random()),
//     studentId: rawId,
//     name: String(s.fullname || s.fullName || s.name || 'Student'),
//     track: String(s.examTrack || s.level || s.track || '—').toUpperCase(),
//     mode,
//     email: String(s.email || ''),
//     isPaid: Boolean(s.isPaid || s.paid),
//   }
// }

// export default function StudentRoster() {
//   const [loading, setLoading] = useState(true)
//   const [students, setStudents] = useState<ExtendedStudent[]>([])
//   const [source, setSource] = useState<'server' | 'local'>('local')
//   const [selectedStudent, setSelectedStudent] =
//     useState<ExtendedStudent | null>(null)
//   const [showPaymentModal, setShowPaymentModal] = useState(false)

//   const fetchStudents = async () => {
//     try {
//       // Calls adminApi.getUsers('student') -> GET /api/admin/users?role=student
//       const rows = await adminApi.getUsers<Record<string, unknown>[]>('student')
//       if (Array.isArray(rows) && rows.length > 0) {
//         setStudents(rows.map(mapStudent))
//         setSource('server')
//         return
//       }
//       throw new Error('No server data')
//     } catch {
//       setStudents(
//         getStudents().map((s) => ({
//           ...s,
//           studentId: s.key || 'DSA/LOCAL-001',
//         })),
//       )
//       setSource('local')
//     } finally {
//       setLoading(false)
//     }
//   }

//   useEffect(() => {
//     fetchStudents()
//   }, [])

//   const handleOpenPaymentModal = (student?: ExtendedStudent) => {
//     if (student) setSelectedStudent(student)
//     else setSelectedStudent(null)
//     setShowPaymentModal(true)
//   }

//   if (loading) {
//     return (
//       <div className='py-20 flex justify-center'>
//         <Loader2 className='animate-spin text-[#002EFF]' />
//       </div>
//     )
//   }

//   return (
//     <div className='max-w-5xl mx-auto space-y-4 px-4 py-2'>
//       {/* Header */}
//       <div className='flex flex-wrap items-center justify-between gap-3'>
//         <div className='flex items-center gap-2'>
//           <Users size={18} className='text-[#002EFF]' />
//           <h1 className='text-2xl font-black text-slate-900 tracking-tight'>
//             Students
//           </h1>
//           <Badge
//             className={`text-[8px] font-black ${
//               source === 'server'
//                 ? 'bg-emerald-50 text-emerald-600'
//                 : 'bg-slate-100 text-slate-500'
//             }`}
//           >
//             {source === 'server' ? (
//               <>
//                 <Cloud size={9} className='mr-1' /> Live
//               </>
//             ) : (
//               <>
//                 <HardDrive size={9} className='mr-1' /> Local
//               </>
//             )}
//           </Badge>
//           <span className='text-[10px] font-black uppercase text-slate-400 ml-2'>
//             {students.length} total
//           </span>
//         </div>

//         {/* Global Manual Payment Action */}
//         <button
//           onClick={() => handleOpenPaymentModal()}
//           className='flex items-center gap-1.5 px-3.5 py-2 bg-[#002EFF] text-white rounded-xl text-[10px] font-black uppercase tracking-wide hover:bg-blue-700 transition-all shadow-md shadow-blue-200 active:scale-95'
//         >
//           <CreditCard size={14} /> Mark Manual Payment
//         </button>
//       </div>

//       {/* Roster Table */}
//       <div className='bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden'>
//         <div className='grid grid-cols-12 px-5 py-3 bg-slate-50 text-[9px] font-black uppercase text-gray-400'>
//           <span className='col-span-4'>Student</span>
//           <span className='col-span-2'>Track</span>
//           <span className='col-span-3'>Mode</span>
//           <span className='col-span-3 text-right'>Action / Status</span>
//         </div>
//         {students.length === 0 ? (
//           <p className='px-5 py-10 text-center text-xs font-bold text-slate-400'>
//             No students found.
//           </p>
//         ) : (
//           students.map((s) => (
//             <div
//               key={s.key}
//               className='grid grid-cols-12 items-center px-5 py-4 border-t border-slate-50 hover:bg-slate-50/50 transition-colors'
//             >
//               {/* Student Name & ID */}
//               <div className='col-span-4 flex flex-col'>
//                 <span className='text-xs font-black text-gray-800 flex items-center gap-1.5'>
//                   {s.name}
//                   {s.isNew && (
//                     <span className='text-[8px] font-black uppercase text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded'>
//                       New
//                     </span>
//                   )}
//                 </span>
//                 {s.studentId && (
//                   <span className='text-[9px] font-mono text-slate-400 font-bold'>
//                     {s.studentId}
//                   </span>
//                 )}
//               </div>

//               {/* Track */}
//               <span className='col-span-2'>
//                 <Badge className='bg-blue-50 text-[#002EFF] text-[8px] font-black'>
//                   {s.track}
//                 </Badge>
//               </span>

//               {/* Mode */}
//               <span className='col-span-3 text-[10px] font-bold text-slate-500'>
//                 {s.mode === 'physical'
//                   ? 'On-Campus'
//                   : s.mode === 'online'
//                     ? 'Online'
//                     : '—'}
//               </span>

//               {/* Status / Action */}
//               <div className='col-span-3 flex items-center justify-end gap-2'>
//                 {s.isPaid ? (
//                   <span className='inline-flex items-center gap-1 text-[9px] font-black text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg'>
//                     <CheckCircle2 size={11} /> Paid
//                   </span>
//                 ) : (
//                   <button
//                     onClick={() => handleOpenPaymentModal(s)}
//                     className='flex items-center gap-1 text-[9px] font-bold text-[#002EFF] bg-blue-50 hover:bg-blue-100 px-2.5 py-1 rounded-lg transition-all active:scale-95'
//                   >
//                     <DollarSign size={11} /> Mark Paid
//                   </button>
//                 )}
//               </div>
//             </div>
//           ))
//         )}
//       </div>

//       <p className='text-[10px] font-medium text-slate-400'>
//         {source === 'server'
//           ? 'Live from the server.'
//           : 'Showing this browser’s list — the server students API (GET /api/admin/users?role=student) is not live yet.'}
//       </p>

//       {/* Manual Payment Modal */}
//       {showPaymentModal && (
//         <ManualPaymentModal
//           student={selectedStudent}
//           onClose={() => setShowPaymentModal(false)}
//           onSuccess={() => {
//             fetchStudents()
//           }}
//         />
//       )}
//     </div>
//   )
// }

// /* ------------------------------------------------------------------ */
// /* Modal Component: POST /api/admin/payments/manual via adminApi     */
// /* ------------------------------------------------------------------ */
// function ManualPaymentModal({
//   student,
//   onClose,
//   onSuccess,
// }: {
//   student?: ExtendedStudent | null
//   onClose: () => void
//   onSuccess: () => void
// }) {
//   const [studentId, setStudentId] = useState(student?.studentId || '')
//   const [amount, setAmount] = useState<number | ''>(200000)
//   const [method, setMethod] = useState<
//     'cash' | 'bank_transfer' | 'cheque' | string
//   >('cash')
//   const [reference, setReference] = useState('BANK-TRANSFER-001')
//   const [submitting, setSubmitting] = useState(false)
//   const [statusMsg, setStatusMsg] = useState<{
//     type: 'error' | 'success'
//     text: string
//   } | null>(null)

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault()
//     setStatusMsg(null)

//     if (!studentId.trim()) {
//       setStatusMsg({ type: 'error', text: 'Student ID is required.' })
//       return
//     }
//     if (!amount || Number(amount) <= 0) {
//       setStatusMsg({
//         type: 'error',
//         text: 'Please enter a valid payment amount.',
//       })
//       return
//     }

//     setSubmitting(true)

//     try {
//       // Calls adminApi.markManualPayment -> POST /api/admin/payments/manual
//       await adminApi.markManualPayment({
//         studentId: studentId.trim(),
//         amount: Number(amount),
//         reference: reference.trim() || undefined,
//         method,
//       } as Parameters<typeof adminApi.markManualPayment>[0])

//       setStatusMsg({
//         type: 'success',
//         text: `Successfully marked student ${studentId} as paid!`,
//       })
//       onSuccess()
//       setTimeout(onClose, 1200)
//     } catch (err: unknown) {
//       const errorText = err instanceof Error ? err.message : 'An error occurred'
//       setStatusMsg({
//         type: 'error',
//         text: errorText, // Displays "Student not found" directly on 404
//       })
//     } finally {
//       setSubmitting(false)
//     }
//   }

//   return (
//     <div className='fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200'>
//       <div className='w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden'>
//         {/* Modal Header */}
//         <div className='flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50'>
//           <div className='flex items-center gap-2.5'>
//             <div className='h-8 w-8 rounded-xl bg-[#002EFF] text-white flex items-center justify-center shadow-md shadow-blue-200'>
//               <Receipt size={16} />
//             </div>
//             <div>
//               <h3 className='text-xs font-black text-slate-900 uppercase tracking-wider'>
//                 Mark Manual Payment
//               </h3>
//               <p className='text-[9px] font-bold text-slate-400'>
//                 POST /api/admin/payments/manual
//               </p>
//             </div>
//           </div>
//           <button
//             onClick={onClose}
//             className='p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors'
//           >
//             <X size={16} />
//           </button>
//         </div>

//         {/* Modal Form */}
//         <form onSubmit={handleSubmit} className='p-6 space-y-4'>
//           {statusMsg && (
//             <div
//               className={`flex items-start gap-2 p-3 rounded-xl text-[11px] font-bold ${
//                 statusMsg.type === 'error'
//                   ? 'bg-rose-50 text-rose-600 border border-rose-100'
//                   : 'bg-emerald-50 text-emerald-600 border border-emerald-100'
//               }`}
//             >
//               <AlertCircle size={14} className='shrink-0 mt-0.5' />
//               <span>{statusMsg.text}</span>
//             </div>
//           )}

//           {/* Student ID Input */}
//           <div className='space-y-1'>
//             <label className='text-[9px] font-black uppercase tracking-widest text-slate-400 block'>
//               Student ID <span className='text-rose-500'>*</span>
//             </label>
//             <input
//               type='text'
//               value={studentId}
//               onChange={(e) => setStudentId(e.target.value)}
//               placeholder='e.g. DSA/2026-8903DS'
//               className='w-full h-10 px-3 rounded-xl bg-slate-50 border border-slate-200 focus:border-[#002EFF] focus:bg-white outline-none text-xs font-mono font-bold text-slate-800 transition-all'
//             />
//           </div>

//           {/* Amount Input */}
//           <div className='space-y-1'>
//             <label className='text-[9px] font-black uppercase tracking-widest text-slate-400 block'>
//               Amount (₦) <span className='text-rose-500'>*</span>
//             </label>
//             <input
//               type='number'
//               value={amount}
//               onChange={(e) =>
//                 setAmount(e.target.value ? Number(e.target.value) : '')
//               }
//               placeholder='200000'
//               className='w-full h-10 px-3 rounded-xl bg-slate-50 border border-slate-200 focus:border-[#002EFF] focus:bg-white outline-none text-xs font-bold text-slate-800 transition-all'
//             />
//           </div>

//           {/* Payment Method */}
//           <div className='space-y-1'>
//             <label className='text-[9px] font-black uppercase tracking-widest text-slate-400 block'>
//               Payment Method
//             </label>
//             <select
//               value={method}
//               onChange={(e) => setMethod(e.target.value)}
//               className='w-full h-10 px-3 rounded-xl bg-slate-50 border border-slate-200 focus:border-[#002EFF] focus:bg-white outline-none text-xs font-bold text-slate-800 transition-all'
//             >
//               <option value='cash'>Cash</option>
//               <option value='bank_transfer'>Bank Transfer</option>
//               <option value='cheque'>Cheque</option>
//               <option value='pos'>POS / Offline Card</option>
//             </select>
//           </div>

//           {/* Reference Input */}
//           <div className='space-y-1'>
//             <label className='text-[9px] font-black uppercase tracking-widest text-slate-400 block'>
//               Reference / Note{' '}
//               <span className='text-slate-300'>(Optional)</span>
//             </label>
//             <input
//               type='text'
//               value={reference}
//               onChange={(e) => setReference(e.target.value)}
//               placeholder='e.g. BANK-TRANSFER-001'
//               className='w-full h-10 px-3 rounded-xl bg-slate-50 border border-slate-200 focus:border-[#002EFF] focus:bg-white outline-none text-xs font-medium text-slate-800 transition-all'
//             />
//           </div>

//           {/* Actions */}
//           <div className='flex items-center justify-end gap-2 pt-3 border-t border-slate-100'>
//             <button
//               type='button'
//               onClick={onClose}
//               className='px-4 h-10 rounded-xl bg-slate-100 text-slate-600 font-bold text-xs hover:bg-slate-200 transition-all'
//             >
//               Cancel
//             </button>
//             <button
//               type='submit'
//               disabled={submitting}
//               className='flex items-center justify-center gap-2 px-5 h-10 bg-[#002EFF] text-white rounded-xl font-black text-xs uppercase tracking-wider hover:bg-blue-700 shadow-md shadow-blue-200 transition-all disabled:opacity-50 active:scale-95'
//             >
//               {submitting ? (
//                 <Loader2 size={14} className='animate-spin' />
//               ) : (
//                 'Confirm Payment'
//               )}
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   )
// }

'use client'

import { useEffect, useState, useCallback } from 'react'
import {
  GraduationCap,
  Mail,
  Loader2,
  Cloud,
  HardDrive,
  UserCheck,
  UserX,
  Trash2,
  Plus,
  Search,
  BookOpen,
  X,
  AlertCircle,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { adminApi, type AdminUserListItem } from '@/lib/admin-api'

export interface ExtendedStudentPerson {
  id?: string
  key: string
  name: string
  email: string
  extra?: string
  status?: 'active' | 'suspended' | 'pending_payment' | 'pending_otp' | string
  examTrack?: string
  learningMode?: string
  studentCode?: string
}

function mapStudent(
  u: AdminUserListItem | Record<string, unknown>,
  fallbackIndex: number,
): ExtendedStudentPerson {
  const s = u as Record<string, unknown>
  const derivedId = String(s.id || s._id || s.studentId || '')

  return {
    id: derivedId,
    key: derivedId || `student-${fallbackIndex}`,
    name: String(s.fullname || s.fullName || s.name || 'Student'),
    email: String(s.email || ''),
    extra: String(s.examTrack || s.learningMode || 'General'),
    examTrack: typeof s.examTrack === 'string' ? s.examTrack : undefined,
    learningMode:
      typeof s.learningMode === 'string' ? s.learningMode : undefined,
    studentCode:
      typeof s.studentId === 'string'
        ? s.studentId
        : typeof s.studentCode === 'string'
          ? s.studentCode
          : undefined,
    status: (s.status ||
      (s.isActive === false ? 'suspended' : 'active')) as string,
  }
}

export default function StudentRoster() {
  const [loading, setLoading] = useState(true)
  const [students, setStudents] = useState<ExtendedStudentPerson[]>([])
  const [source, setSource] = useState<'server' | 'local'>('local')
  const [searchQuery, setSearchQuery] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null)

  const fetchStudents = useCallback(async (query = '') => {
    setLoading(true)
    try {
      const response = await adminApi.getUsers({
        role: 'student',
        search: query || undefined,
      })

      const rows = Array.isArray(response)
        ? response
        : Array.isArray(response?.data)
          ? response.data
          : null

      if (rows) {
        setStudents(
          rows.map((r: AdminUserListItem, i: number) => mapStudent(r, i)),
        )
        setSource('server')
      } else {
        throw new Error('No server data')
      }
    } catch {
      // Fallback empty array or static mock with explicit types
      const localFallback: ExtendedStudentPerson[] = []
      setStudents(
        localFallback.map((s: ExtendedStudentPerson, i: number) => ({
          ...s,
          id: s.key || `local-${i}`,
          status: 'active',
        })),
      )
      setSource('local')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchStudents()
  }, [fetchStudents])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    fetchStudents(searchQuery)
  }

  const handleStatusChange = async (
    person: ExtendedStudentPerson,
    newStatus: 'active' | 'suspended',
  ) => {
    const targetId = person.id || person.key
    setActionLoadingId(targetId)

    try {
      if (source === 'server' && person.id) {
        const api = adminApi as unknown as {
          updateUserStatus?: (
            id: string,
            body: { status: string },
          ) => Promise<unknown>
          updateUser?: (
            id: string,
            body: { status: string },
          ) => Promise<unknown>
        }
        if (typeof api.updateUserStatus === 'function') {
          await api.updateUserStatus(person.id, { status: newStatus })
        } else if (typeof api.updateUser === 'function') {
          await api.updateUser(person.id, { status: newStatus })
        }
      }

      setStudents((prev) =>
        prev.map((p) =>
          p.id === targetId || p.key === targetId
            ? { ...p, status: newStatus }
            : p,
        ),
      )
    } catch (err) {
      alert(
        `Failed to ${newStatus === 'active' ? 'reactivate' : 'suspend'} student: ${
          err instanceof Error ? err.message : 'Unknown error'
        }`,
      )
    } finally {
      setActionLoadingId(null)
    }
  }

  const handleDelete = async (person: ExtendedStudentPerson) => {
    const targetId = person.id || person.key
    if (!confirm(`Are you sure you want to soft-delete ${person.name}?`)) return

    setActionLoadingId(targetId)

    try {
      if (source === 'server' && person.id) {
        const api = adminApi as unknown as {
          deleteUser?: (id: string) => Promise<unknown>
        }
        if (typeof api.deleteUser === 'function') {
          await api.deleteUser(person.id)
        }
      }

      setStudents((prev) =>
        prev.filter((p) => (p.id ? p.id !== targetId : p.key !== targetId)),
      )
    } catch (err) {
      alert(
        `Failed to delete student: ${
          err instanceof Error ? err.message : 'Unknown error'
        }`,
      )
    } finally {
      setActionLoadingId(null)
    }
  }

  return (
    <div className='max-w-5xl mx-auto space-y-4 px-4 py-2'>
      {/* Header Bar */}
      <div className='flex flex-wrap items-center justify-between gap-3'>
        <div className='flex items-center gap-2'>
          <GraduationCap size={22} className='text-[#002EFF]' />
          <h1 className='text-2xl font-black text-slate-900 tracking-tight'>
            Students
          </h1>
          <Badge
            className={`text-[8px] font-black ${
              source === 'server'
                ? 'bg-emerald-50 text-emerald-600'
                : 'bg-slate-100 text-slate-500'
            }`}
          >
            {source === 'server' ? (
              <>
                <Cloud size={9} className='mr-1' /> Live
              </>
            ) : (
              <>
                <HardDrive size={9} className='mr-1' /> Local
              </>
            )}
          </Badge>
          <span className='text-[10px] font-black uppercase text-slate-400 ml-2'>
            {students.length} Total
          </span>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className='flex items-center gap-1.5 px-3.5 py-2 bg-[#002EFF] text-white rounded-xl text-[10px] font-black uppercase tracking-wide hover:bg-blue-700 transition-all shadow-md shadow-blue-200 active:scale-95'
        >
          <Plus size={14} /> Add Student
        </button>
      </div>

      {/* Search Bar */}
      <form onSubmit={handleSearch} className='flex items-center gap-2'>
        <div className='relative flex-1'>
          <Search
            size={14}
            className='absolute left-3.5 top-3 text-slate-400'
          />
          <input
            type='text'
            placeholder='Search by name, email, or student ID...'
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className='w-full h-10 pl-9 pr-4 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:border-[#002EFF] transition-all'
          />
        </div>
        <button
          type='submit'
          className='px-4 h-10 bg-slate-900 text-white font-black text-[10px] uppercase rounded-xl hover:bg-slate-800 transition-all'
        >
          Search
        </button>
      </form>

      {/* Roster Table */}
      <div className='bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden'>
        <div className='grid grid-cols-12 px-5 py-3 bg-slate-50 text-[9px] font-black uppercase text-gray-400'>
          <span className='col-span-4'>Student Name</span>
          <span className='col-span-3'>Email</span>
          <span className='col-span-2'>Track / Mode</span>
          <span className='col-span-1 text-center'>Status</span>
          <span className='col-span-2 text-right'>Actions</span>
        </div>

        {loading ? (
          <div className='py-12 flex justify-center'>
            <Loader2 className='animate-spin text-[#002EFF]' />
          </div>
        ) : students.length === 0 ? (
          <p className='px-5 py-10 text-center text-xs font-bold text-slate-400'>
            No students found.
          </p>
        ) : (
          students.map((p) => {
            const rowId = p.id || p.key
            const isRowLoading = actionLoadingId === rowId
            const isSuspended = p.status === 'suspended'

            return (
              <div
                key={p.key}
                className={`grid grid-cols-12 items-center px-5 py-4 border-t border-slate-50 transition-colors ${
                  isSuspended ? 'bg-slate-50/50' : ''
                }`}
              >
                <div className='col-span-4 flex flex-col'>
                  <span className='text-xs font-black text-gray-800'>
                    {p.name}
                  </span>
                  {p.studentCode && (
                    <span className='text-[9px] font-bold text-slate-400'>
                      ID: {p.studentCode}
                    </span>
                  )}
                </div>

                <span className='col-span-3 text-[10px] font-bold text-slate-500 flex items-center gap-1 truncate'>
                  <Mail size={10} /> {p.email}
                </span>

                <span className='col-span-2 text-[10px] font-bold text-slate-500 truncate flex items-center gap-1'>
                  <BookOpen size={10} className='text-slate-400' />
                  {p.examTrack || p.learningMode || p.extra || '—'}
                </span>

                <span className='col-span-1 flex justify-center'>
                  <Badge
                    className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full ${
                      isSuspended
                        ? 'bg-amber-50 text-amber-600 border border-amber-200'
                        : 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                    }`}
                  >
                    {isSuspended ? 'Suspended' : 'Active'}
                  </Badge>
                </span>

                {/* Actions */}
                <span className='col-span-2 flex items-center justify-end gap-1'>
                  {isRowLoading ? (
                    <Loader2
                      size={14}
                      className='animate-spin text-slate-400 mr-2'
                    />
                  ) : (
                    <>
                      {isSuspended ? (
                        <button
                          onClick={() => handleStatusChange(p, 'active')}
                          title='Activate Student'
                          className='p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 transition-colors'
                        >
                          <UserCheck size={14} />
                        </button>
                      ) : (
                        <button
                          onClick={() => handleStatusChange(p, 'suspended')}
                          title='Suspend Student'
                          className='p-1.5 rounded-lg text-amber-600 hover:bg-amber-50 transition-colors'
                        >
                          <UserX size={14} />
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(p)}
                        title='Soft Delete Student'
                        className='p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 transition-colors'
                      >
                        <Trash2 size={14} />
                      </button>
                    </>
                  )}
                </span>
              </div>
            )
          })
        )}
      </div>

      <p className='text-[10px] font-medium text-slate-400'>
        {source === 'server'
          ? 'Live data from GET /api/admin/users?role=student'
          : 'Showing local fallback data. Server API not connected yet.'}
      </p>

      {/* Add Student Modal */}
      {showAddModal && (
        <CreateStudentModal
          onClose={() => setShowAddModal(false)}
          onSuccess={() => fetchStudents(searchQuery)}
        />
      )}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Modal Component: POST /api/admin/staff (Role = Student)           */
/* ------------------------------------------------------------------ */
function CreateStudentModal({
  onClose,
  onSuccess,
}: {
  onClose: () => void
  onSuccess: () => void
}) {
  const [fullname, setFullname] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('TempPass123')
  const [examTrack, setExamTrack] = useState('UTME')
  const [learningMode, setLearningMode] = useState('Online')

  const [submitting, setSubmitting] = useState(false)
  const [statusMsg, setStatusMsg] = useState<{
    type: 'error' | 'success'
    text: string
  } | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatusMsg(null)

    if (!fullname.trim() || !email.trim() || !password.trim()) {
      setStatusMsg({
        type: 'error',
        text: 'Fullname, email, and password are required.',
      })
      return
    }

    setSubmitting(true)
    try {
      const payload = {
        fullname: fullname.trim(),
        email: email.trim().toLowerCase(),
        password,
        role: 'student',
        examTrack,
        learningMode,
      }

      const api = adminApi as unknown as {
        createStaffAccount?: (
          data: typeof payload,
        ) => Promise<{ success?: boolean; message?: string }>
      }

      const res =
        typeof api.createStaffAccount === 'function'
          ? await api.createStaffAccount(payload)
          : null

      if (res?.success) {
        setStatusMsg({
          type: 'success',
          text: `Student account created! Credentials sent to ${email}`,
        })
        setTimeout(() => {
          onSuccess()
          onClose()
        }, 1200)
      } else {
        throw new Error(res?.message || 'Failed to create student account')
      }
    } catch (err: unknown) {
      setStatusMsg({
        type: 'error',
        text: err instanceof Error ? err.message : 'Failed to create student',
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200'>
      <div className='w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden'>
        <div className='flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50'>
          <div className='flex items-center gap-2.5'>
            <div className='h-8 w-8 rounded-xl bg-[#002EFF] text-white flex items-center justify-center shadow-md shadow-blue-200'>
              <GraduationCap size={16} />
            </div>
            <div>
              <h3 className='text-xs font-black text-slate-900 uppercase tracking-wider'>
                Add New Student
              </h3>
              <p className='text-[9px] font-bold text-slate-400'>
                POST /api/admin/staff
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className='p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors'
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className='p-6 space-y-4'>
          {statusMsg && (
            <div
              className={`flex items-start gap-2 p-3 rounded-xl text-[11px] font-bold ${
                statusMsg.type === 'error'
                  ? 'bg-rose-50 text-rose-600 border border-rose-100'
                  : 'bg-emerald-50 text-emerald-600 border border-emerald-100'
              }`}
            >
              <AlertCircle size={14} className='shrink-0 mt-0.5' />
              <span>{statusMsg.text}</span>
            </div>
          )}

          <div className='space-y-1'>
            <label className='text-[9px] font-black uppercase tracking-widest text-slate-400 block'>
              Full Name <span className='text-rose-500'>*</span>
            </label>
            <input
              type='text'
              value={fullname}
              onChange={(e) => setFullname(e.target.value)}
              placeholder='e.g. John Doe'
              className='w-full h-10 px-3 rounded-xl bg-slate-50 border border-slate-200 focus:border-[#002EFF] focus:bg-white outline-none text-xs font-bold text-slate-800 transition-all'
            />
          </div>

          <div className='space-y-1'>
            <label className='text-[9px] font-black uppercase tracking-widest text-slate-400 block'>
              Email Address <span className='text-rose-500'>*</span>
            </label>
            <input
              type='email'
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder='e.g. student@dsa.com'
              className='w-full h-10 px-3 rounded-xl bg-slate-50 border border-slate-200 focus:border-[#002EFF] focus:bg-white outline-none text-xs font-bold text-slate-800 transition-all'
            />
          </div>

          <div className='space-y-1'>
            <label className='text-[9px] font-black uppercase tracking-widest text-slate-400 block'>
              Temporary Password <span className='text-rose-500'>*</span>
            </label>
            <input
              type='text'
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className='w-full h-10 px-3 rounded-xl bg-slate-50 border border-slate-200 focus:border-[#002EFF] focus:bg-white outline-none text-xs font-bold text-slate-800 transition-all'
            />
          </div>

          <div className='grid grid-cols-2 gap-3'>
            <div className='space-y-1'>
              <label className='text-[9px] font-black uppercase tracking-widest text-slate-400 block'>
                Exam Track
              </label>
              <select
                value={examTrack}
                onChange={(e) => setExamTrack(e.target.value)}
                className='w-full h-10 px-3 rounded-xl bg-slate-50 border border-slate-200 focus:border-[#002EFF] focus:bg-white outline-none text-xs font-bold text-slate-800 transition-all'
              >
                <option value='UTME'>UTME / JAMB</option>
                <option value='WAEC'>WAEC / NECO</option>
                <option value='POST-UTME'>POST-UTME</option>
                <option value='A-LEVELS'>JUPEB / A-LEVELS</option>
              </select>
            </div>

            <div className='space-y-1'>
              <label className='text-[9px] font-black uppercase tracking-widest text-slate-400 block'>
                Learning Mode
              </label>
              <select
                value={learningMode}
                onChange={(e) => setLearningMode(e.target.value)}
                className='w-full h-10 px-3 rounded-xl bg-slate-50 border border-slate-200 focus:border-[#002EFF] focus:bg-white outline-none text-xs font-bold text-slate-800 transition-all'
              >
                <option value='Online'>Online</option>
                <option value='Physical'>Physical Class</option>
                <option value='Hybrid'>Hybrid</option>
              </select>
            </div>
          </div>

          <div className='flex items-center justify-end gap-2 pt-3 border-t border-slate-100'>
            <button
              type='button'
              onClick={onClose}
              className='px-4 h-10 rounded-xl bg-slate-100 text-slate-600 font-bold text-xs hover:bg-slate-200 transition-all'
            >
              Cancel
            </button>
            <button
              type='submit'
              disabled={submitting}
              className='flex items-center justify-center gap-2 px-5 h-10 bg-[#002EFF] text-white rounded-xl font-black text-xs uppercase tracking-wider hover:bg-blue-700 shadow-md shadow-blue-200 transition-all disabled:opacity-50 active:scale-95'
            >
              {submitting ? (
                <Loader2 size={14} className='animate-spin' />
              ) : (
                'Create Student'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}