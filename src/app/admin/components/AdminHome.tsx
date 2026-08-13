// 'use client'

// import { useEffect, useState } from 'react'
// import {
//   Users,
//   UserPlus,
//   ShieldCheck,
//   CalendarCheck,
//   CalendarDays,
//   Megaphone,
//   BookOpen,
//   Loader2,
// } from 'lucide-react'
// import { getStudents } from '@/lib/studentsStore'
// import { getStaff, getRoles } from '@/lib/staffStore'
// import { getCourses } from '@/lib/coursesStore'

// type Tab =
//   | 'students'
//   | 'create-tutor'
//   | 'create-guardian'
//   | 'view-tutors'
//   | 'view-guardians'
//   | 'courses'
//   | 'attendance'
//   | 'timetable'
//   | 'broadcast'
//   | 'roles'

// export default function AdminHome({ onNavigate }: { onNavigate: (tab: Tab) => void }) {
//   const [mounted, setMounted] = useState(false)
//   useEffect(() => setMounted(true), [])

//   if (!mounted) {
//     return <div className='py-20 flex justify-center'><Loader2 className='animate-spin text-[#002EFF]' /></div>
//   }

//   const students = getStudents()
//   const staff = getStaff()
//   const roles = getRoles()
//   const courses = getCourses()

//   const stats = [
//     { label: 'Students', value: students.length, icon: Users, tint: 'bg-blue-50 text-blue-600' },
//     { label: 'Staff Accounts', value: staff.length, icon: ShieldCheck, tint: 'bg-emerald-50 text-emerald-600' },
//     { label: 'Roles', value: roles.length, icon: ShieldCheck, tint: 'bg-amber-50 text-amber-600' },
//     { label: 'Courses', value: courses.length, icon: BookOpen, tint: 'bg-purple-50 text-purple-600' },
//   ]

//   const actions: { label: string; tab: Tab; icon: React.ElementType }[] = [
//     { label: 'View Students', tab: 'students', icon: Users },
//     { label: 'View Tutors', tab: 'view-tutors', icon: BookOpen },
//     { label: 'View Guardians', tab: 'view-guardians', icon: Users },
//     { label: 'Create Tutor', tab: 'create-tutor', icon: UserPlus },
//     { label: 'Create Guardian', tab: 'create-guardian', icon: UserPlus },
//     { label: 'Manage Courses', tab: 'courses', icon: BookOpen },
//     { label: 'Take Attendance', tab: 'attendance', icon: CalendarCheck },
//     { label: 'Edit Timetable', tab: 'timetable', icon: CalendarDays },
//     { label: 'Send Announcement', tab: 'broadcast', icon: Megaphone },
//     { label: 'Permissions', tab: 'roles', icon: ShieldCheck },
//   ]

//   return (
//     <div className='max-w-6xl mx-auto space-y-6 px-4'>
//       <div>
//         <h1 className='text-2xl font-black text-slate-900 tracking-tight'>Admin Dashboard</h1>
//         <p className='text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-1'>
//           Manage students, staff, timetable &amp; announcements
//         </p>
//       </div>

//       <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
//         {stats.map((s) => (
//           <div key={s.label} className='p-4 rounded-2xl bg-white shadow-sm border border-slate-100 flex items-center gap-3'>
//             <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${s.tint}`}>
//               <s.icon size={18} strokeWidth={2.5} />
//             </div>
//             <div>
//               <p className='text-[8px] font-black text-gray-400 uppercase leading-none mb-1'>{s.label}</p>
//               <p className='text-lg font-black text-gray-900 leading-none'>{s.value}</p>
//             </div>
//           </div>
//         ))}
//       </div>

//       <div>
//         <p className='text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3'>Quick actions</p>
//         <div className='grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3'>
//           {actions.map((a) => (
//             <button
//               key={a.tab}
//               onClick={() => onNavigate(a.tab)}
//               className='flex items-center gap-3 p-4 rounded-2xl bg-white shadow-sm border border-slate-100 hover:border-[#002EFF]/30 hover:shadow-md transition-all text-left'
//             >
//               <div className='h-9 w-9 rounded-xl bg-blue-50 text-[#002EFF] flex items-center justify-center shrink-0'>
//                 <a.icon size={16} />
//               </div>
//               <span className='text-[11px] font-black text-slate-700 uppercase tracking-tight'>{a.label}</span>
//             </button>
//           ))}
//         </div>
//       </div>
//     </div>
//   )
// }

// 'use client'

// import React, { useEffect, useState, useCallback } from 'react'
// import {
//   Users,
//   UserPlus,
//   ShieldCheck,
//   CalendarCheck,
//   CalendarDays,
//   Megaphone,
//   BookOpen,
//   GraduationCap,
//   Loader2,
//   RefreshCw,
// } from 'lucide-react'
// import { getAdminToken } from '@/lib/admin-auth'
// import { getStudents } from '@/lib/studentsStore'
// import { getStaff, getRoles } from '@/lib/staffStore'
// import { getCourses } from '@/lib/coursesStore'

// type Tab =
//   | 'students'
//   | 'create-tutor'
//   | 'create-guardian'
//   | 'view-tutors'
//   | 'view-guardians'
//   | 'courses'
//   | 'attendance'
//   | 'timetable'
//   | 'broadcast'
//   | 'roles'

// interface AdminHomeProps {
//   onNavigate: (tab: Tab) => void
// }

// interface StatCounts {
//   students: number
//   tutors: number
//   staff: number
//   parents: number
//   courses: number
//   roles: number
// }

// const API_BASE_URL =
//   process.env.NEXT_PUBLIC_API_URL ||
//   'https://api.distinguishedscholarsacademy.com'

// export default function AdminHome({ onNavigate }: AdminHomeProps) {
//   const [mounted, setMounted] = useState(false)
//   const [loading, setLoading] = useState(true)
//   const [counts, setCounts] = useState<StatCounts>({
//     students: 0,
//     tutors: 0,
//     staff: 0,
//     parents: 0,
//     courses: 0,
//     roles: 0,
//   })

//   // Fetch count for a specific user role from the API
//   const fetchRoleCount = async (
//     role: string,
//     token: string,
//   ): Promise<number> => {
//     try {
//       const res = await fetch(
//         `${API_BASE_URL}/api/admin/users?role=${role}&page=1&limit=1`,
//         {
//           method: 'GET',
//           headers: {
//             accept: 'application/json',
//             Authorization: `Bearer ${token}`,
//           },
//         },
//       )
//       if (!res.ok) return 0
//       const data = await res.json()
//       return typeof data?.count === 'number'
//         ? data.count
//         : data?.data?.length || 0
//     } catch {
//       return 0
//     }
//   }

//   const loadDashboardData = useCallback(async () => {
//     setLoading(true)
//     const token = getAdminToken()

//     // Fallbacks from client local stores
//     const localStudentsCount = getStudents().length
//     const localStaffCount = getStaff().length
//     const localRolesCount = getRoles().length
//     const localCoursesCount = getCourses().length

//     if (!token) {
//       setCounts({
//         students: localStudentsCount,
//         tutors: 0,
//         staff: localStaffCount,
//         parents: 0,
//         courses: localCoursesCount,
//         roles: localRolesCount,
//       })
//       setLoading(false)
//       return
//     }

//     try {
//       // Fetch live role counts in parallel from /api/admin/users
//       const [studentCount, tutorCount, staffCount, parentCount] =
//         await Promise.all([
//           fetchRoleCount('student', token),
//           fetchRoleCount('tutor', token),
//           fetchRoleCount('staff', token),
//           fetchRoleCount('parent', token),
//         ])

//       setCounts({
//         students: studentCount || localStudentsCount,
//         tutors: tutorCount,
//         staff: staffCount || localStaffCount,
//         parents: parentCount,
//         courses: localCoursesCount,
//         roles: localRolesCount,
//       })
//     } catch {
//       setCounts({
//         students: localStudentsCount,
//         tutors: 0,
//         staff: localStaffCount,
//         parents: 0,
//         courses: localCoursesCount,
//         roles: localRolesCount,
//       })
//     } finally {
//       setLoading(false)
//     }
//   }, [])

//   useEffect(() => {
//     setMounted(true)
//     loadDashboardData()
//   }, [loadDashboardData])

//   if (!mounted) {
//     return (
//       <div className='py-20 flex justify-center'>
//         <Loader2 className='animate-spin text-[#002EFF]' size={28} />
//       </div>
//     )
//   }

//   const stats = [
//     {
//       label: 'Students',
//       value: counts.students,
//       icon: Users,
//       tint: 'bg-blue-50 text-blue-600',
//     },
//     {
//       label: 'Tutors',
//       value: counts.tutors,
//       icon: GraduationCap,
//       tint: 'bg-purple-50 text-purple-600',
//     },
//     {
//       label: 'Staff Accounts',
//       value: counts.staff,
//       icon: ShieldCheck,
//       tint: 'bg-emerald-50 text-emerald-600',
//     },
//     {
//       label: 'Guardians',
//       value: counts.parents,
//       icon: Users,
//       tint: 'bg-amber-50 text-amber-600',
//     },
//   ]

//   const actions: { label: string; tab: Tab; icon: React.ElementType }[] = [
//     { label: 'View Students', tab: 'students', icon: Users },
//     { label: 'View Tutors', tab: 'view-tutors', icon: GraduationCap },
//     { label: 'View Guardians', tab: 'view-guardians', icon: Users },
//     { label: 'Create Tutor', tab: 'create-tutor', icon: UserPlus },
//     { label: 'Create Guardian', tab: 'create-guardian', icon: UserPlus },
//     { label: 'Manage Courses', tab: 'courses', icon: BookOpen },
//     { label: 'Take Attendance', tab: 'attendance', icon: CalendarCheck },
//     { label: 'Edit Timetable', tab: 'timetable', icon: CalendarDays },
//     { label: 'Send Announcement', tab: 'broadcast', icon: Megaphone },
//     { label: 'Permissions', tab: 'roles', icon: ShieldCheck },
//   ]

//   return (
//     <div className='max-w-6xl mx-auto space-y-6 px-4'>
//       <div className='flex items-center justify-between'>
//         <div>
//           <h1 className='text-2xl font-black text-slate-900 tracking-tight'>
//             Admin Dashboard
//           </h1>
//           <p className='text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-1'>
//             Manage students, staff, timetable &amp; announcements
//           </p>
//         </div>
//         <button
//           onClick={loadDashboardData}
//           disabled={loading}
//           className='flex items-center gap-2 px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-600 hover:text-[#002EFF] hover:border-blue-200 transition-all shadow-sm disabled:opacity-50'
//         >
//           <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
//           <span className='hidden sm:inline uppercase text-[10px] tracking-wider'>
//             Refresh
//           </span>
//         </button>
//       </div>

//       <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
//         {stats.map((s) => (
//           <div
//             key={s.label}
//             className='p-4 rounded-2xl bg-white shadow-sm border border-slate-100 flex items-center gap-3 transition-transform hover:scale-[1.01]'
//           >
//             <div
//               className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${s.tint}`}
//             >
//               <s.icon size={18} strokeWidth={2.5} />
//             </div>
//             <div>
//               <p className='text-[8px] font-black text-gray-400 uppercase leading-none mb-1'>
//                 {s.label}
//               </p>
//               {loading ? (
//                 <div className='h-5 w-8 bg-slate-100 animate-pulse rounded mt-0.5' />
//               ) : (
//                 <p className='text-lg font-black text-gray-900 leading-none'>
//                   {s.value}
//                 </p>
//               )}
//             </div>
//           </div>
//         ))}
//       </div>

//       <div>
//         <p className='text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3'>
//           Quick actions
//         </p>
//         <div className='grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3'>
//           {actions.map((a) => (
//             <button
//               key={a.tab}
//               onClick={() => onNavigate(a.tab)}
//               className='flex items-center gap-3 p-4 rounded-2xl bg-white shadow-sm border border-slate-100 hover:border-[#002EFF]/30 hover:shadow-md transition-all text-left group'
//             >
//               <div className='h-9 w-9 rounded-xl bg-blue-50 text-[#002EFF] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform'>
//                 <a.icon size={16} />
//               </div>
//               <span className='text-[11px] font-black text-slate-700 uppercase tracking-tight'>
//                 {a.label}
//               </span>
//             </button>
//           ))}
//         </div>
//       </div>
//     </div>
//   )
// }

'use client'

import React, { useEffect, useState, useCallback } from 'react'
import {
  Users,
  UserPlus,
  ShieldCheck,
  CalendarCheck,
  CalendarDays,
  Megaphone,
  BookOpen,
  GraduationCap,
  Loader2,
  RefreshCw,
  Clock,
  Plus,
  Timer,
  AlertCircle,
  CheckCircle2,
  X,
  Edit3,
} from 'lucide-react'
import { getAdminToken } from '@/lib/admin-auth'
import { getStudents } from '@/lib/studentsStore'
import { getStaff, getRoles } from '@/lib/staffStore'
import { getCourses } from '@/lib/coursesStore'

export type Tab =
  | 'students'
  | 'create-tutor'
  | 'create-guardian'
  | 'view-tutors'
  | 'view-guardians'
  | 'courses'
  | 'attendance'
  | 'timetable'
  | 'broadcast'
  | 'roles'
  | 'programs'

interface AdminHomeProps {
  onNavigate: (tab: Tab) => void
}

interface StatCounts {
  students: number
  tutors: number
  staff: number
  parents: number
  courses: number
  roles: number
  programs: number
}

export interface ProgramCountdown {
  _id?: string
  name: string
  endDate: string
  createdAt?: string
  updatedAt?: string
}

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  'https://api.distinguishedscholarsacademy.com'

export default function AdminHome({ onNavigate }: AdminHomeProps) {
  const [mounted, setMounted] = useState(false)
  const [loading, setLoading] = useState(true)
  const [programsLoading, setProgramsLoading] = useState(false)
  const [programs, setPrograms] = useState<ProgramCountdown[]>([])
  const [showProgramModal, setShowProgramModal] = useState(false)
  const [editingProgram, setEditingProgram] = useState<ProgramCountdown | null>(
    null,
  )

  const [counts, setCounts] = useState<StatCounts>({
    students: 0,
    tutors: 0,
    staff: 0,
    parents: 0,
    courses: 0,
    roles: 0,
    programs: 0,
  })

  // Fetch count for a specific user role from the API
  const fetchRoleCount = async (
    role: string,
    token: string,
  ): Promise<number> => {
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/admin/users?role=${role}&page=1&limit=1`,
        {
          method: 'GET',
          headers: {
            accept: 'application/json',
            Authorization: `Bearer ${token}`,
          },
        },
      )
      if (!res.ok) return 0
      const data = await res.json()
      return typeof data?.count === 'number'
        ? data.count
        : data?.data?.length || 0
    } catch {
      return 0
    }
  }

  // GET /api/programs
  const fetchPrograms = async (): Promise<ProgramCountdown[]> => {
    try {
      setProgramsLoading(true)
      const res = await fetch(`${API_BASE_URL}/api/programs`, {
        method: 'GET',
        headers: {
          accept: 'application/json',
        },
      })
      if (!res.ok) return []
      const data = await res.json()
      const list = Array.isArray(data?.data) ? data.data : []
      setPrograms(list)
      return list
    } catch {
      return []
    } finally {
      setProgramsLoading(false)
    }
  }

  const loadDashboardData = useCallback(async () => {
    setLoading(true)
    const token = getAdminToken()

    // Fallbacks from client local stores
    const localStudentsCount = getStudents().length
    const localStaffCount = getStaff().length
    const localRolesCount = getRoles().length
    const localCoursesCount = getCourses().length

    try {
      const fetchedPrograms = await fetchPrograms()

      if (!token) {
        setCounts({
          students: localStudentsCount,
          tutors: 0,
          staff: localStaffCount,
          parents: 0,
          courses: localCoursesCount,
          roles: localRolesCount,
          programs: fetchedPrograms.length,
        })
        setLoading(false)
        return
      }

      // Fetch live role counts in parallel from /api/admin/users
      const [studentCount, tutorCount, staffCount, parentCount] =
        await Promise.all([
          fetchRoleCount('student', token),
          fetchRoleCount('tutor', token),
          fetchRoleCount('staff', token),
          fetchRoleCount('parent', token),
        ])

      setCounts({
        students: studentCount || localStudentsCount,
        tutors: tutorCount,
        staff: staffCount || localStaffCount,
        parents: parentCount,
        courses: localCoursesCount,
        roles: localRolesCount,
        programs: fetchedPrograms.length,
      })
    } catch {
      setCounts({
        students: localStudentsCount,
        tutors: 0,
        staff: localStaffCount,
        parents: 0,
        courses: localCoursesCount,
        roles: localRolesCount,
        programs: 0,
      })
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    setMounted(true)
    loadDashboardData()
  }, [loadDashboardData])

  if (!mounted) {
    return (
      <div className='py-20 flex justify-center'>
        <Loader2 className='animate-spin text-[#002EFF]' size={28} />
      </div>
    )
  }

  const stats = [
    {
      label: 'Students',
      value: counts.students,
      icon: Users,
      tint: 'bg-blue-50 text-blue-600',
    },
    {
      label: 'Tutors',
      value: counts.tutors,
      icon: GraduationCap,
      tint: 'bg-purple-50 text-purple-600',
    },
    {
      label: 'Staff Accounts',
      value: counts.staff,
      icon: ShieldCheck,
      tint: 'bg-emerald-50 text-emerald-600',
    },
    {
      label: 'Guardians',
      value: counts.parents,
      icon: Users,
      tint: 'bg-amber-50 text-amber-600',
    },
    {
      label: 'Exam Countdowns',
      value: counts.programs,
      icon: Timer,
      tint: 'bg-rose-50 text-rose-600',
    },
  ]

  const actions: { label: string; tab: Tab; icon: React.ElementType }[] = [
    { label: 'View Students', tab: 'students', icon: Users },
    { label: 'View Tutors', tab: 'view-tutors', icon: GraduationCap },
    { label: 'View Guardians', tab: 'view-guardians', icon: Users },
    { label: 'Manage Countdowns', tab: 'programs', icon: Timer },
    { label: 'Create Tutor', tab: 'create-tutor', icon: UserPlus },
    { label: 'Create Guardian', tab: 'create-guardian', icon: UserPlus },
    { label: 'Manage Courses', tab: 'courses', icon: BookOpen },
    { label: 'Take Attendance', tab: 'attendance', icon: CalendarCheck },
    { label: 'Edit Timetable', tab: 'timetable', icon: CalendarDays },
    { label: 'Send Announcement', tab: 'broadcast', icon: Megaphone },
    { label: 'Permissions', tab: 'roles', icon: ShieldCheck },
  ]

  // Calculate days remaining helper
  const getDaysRemaining = (targetDate: string) => {
    const target = new Date(targetDate).getTime()
    const now = new Date().getTime()
    const diff = target - now
    if (diff <= 0) return { expired: true, text: 'Expired' }
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    return { expired: false, text: `${days}d ${hours}h left`, days }
  }

  return (
    <div className='max-w-6xl mx-auto space-y-6 px-4'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-2xl font-black text-slate-900 tracking-tight'>
            Admin Dashboard
          </h1>
          <p className='text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-1'>
            Manage students, staff, exam countdowns &amp; announcements
          </p>
        </div>
        <button
          onClick={loadDashboardData}
          disabled={loading}
          className='flex items-center gap-2 px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-600 hover:text-[#002EFF] hover:border-blue-200 transition-all shadow-sm disabled:opacity-50'
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          <span className='hidden sm:inline uppercase text-[10px] tracking-wider'>
            Refresh
          </span>
        </button>
      </div>

      {/* Stats Grid */}
      <div className='grid grid-cols-2 md:grid-cols-5 gap-3'>
        {stats.map((s) => (
          <div
            key={s.label}
            className='p-4 rounded-2xl bg-white shadow-sm border border-slate-100 flex items-center gap-3 transition-transform hover:scale-[1.01]'
          >
            <div
              className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${s.tint}`}
            >
              <s.icon size={18} strokeWidth={2.5} />
            </div>
            <div>
              <p className='text-[8px] font-black text-gray-400 uppercase leading-none mb-1'>
                {s.label}
              </p>
              {loading ? (
                <div className='h-5 w-8 bg-slate-100 animate-pulse rounded mt-0.5' />
              ) : (
                <p className='text-lg font-black text-gray-900 leading-none'>
                  {s.value}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Program / Exam Countdown Management Card */}
      <div className='bg-white rounded-3xl border border-slate-100 p-6 shadow-sm space-y-4'>
        <div className='flex flex-wrap items-center justify-between gap-3'>
          <div className='flex items-center gap-2.5'>
            <div className='h-9 w-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center'>
              <Timer size={18} />
            </div>
            <div>
              <h2 className='text-sm font-black text-slate-900 uppercase tracking-wider'>
                Program / Exam Countdowns
              </h2>
              <p className='text-[10px] font-bold text-slate-400'>
                GET &amp; POST /api/programs
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              setEditingProgram(null)
              setShowProgramModal(true)
            }}
            className='flex items-center gap-1.5 px-3.5 py-2 bg-[#002EFF] text-white rounded-xl text-[10px] font-black uppercase tracking-wider hover:bg-blue-700 transition-all shadow-md shadow-blue-200 active:scale-95'
          >
            <Plus size={14} /> Add / Edit Countdown
          </button>
        </div>

        {/* Countdowns List */}
        {programsLoading ? (
          <div className='py-8 flex justify-center items-center text-slate-400 gap-2'>
            <Loader2 className='animate-spin text-[#002EFF]' size={18} />
            <span className='text-xs font-bold'>Loading countdowns...</span>
          </div>
        ) : programs.length === 0 ? (
          <div className='p-6 rounded-2xl bg-slate-50 border border-dashed border-slate-200 text-center space-y-2'>
            <Clock size={24} className='mx-auto text-slate-300' />
            <p className='text-xs font-bold text-slate-500'>
              No program countdowns found.
            </p>
            <p className='text-[10px] text-slate-400'>
              Create one (e.g. "JAMB Countdown") to display target dates to
              students.
            </p>
          </div>
        ) : (
          <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3'>
            {programs.map((prog) => {
              const status = getDaysRemaining(prog.endDate)
              return (
                <div
                  key={prog._id || prog.name}
                  className='p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:border-slate-200 transition-all space-y-2 relative group'
                >
                  <div className='flex items-start justify-between gap-2'>
                    <h3 className='text-xs font-black text-slate-900 uppercase tracking-tight'>
                      {prog.name}
                    </h3>
                    <button
                      onClick={() => {
                        setEditingProgram(prog)
                        setShowProgramModal(true)
                      }}
                      className='p-1 text-slate-400 hover:text-[#002EFF] rounded-lg hover:bg-white transition-colors'
                      title='Update Countdown'
                    >
                      <Edit3 size={13} />
                    </button>
                  </div>

                  <div className='flex items-center justify-between pt-1'>
                    <span className='text-[10px] font-mono font-bold text-slate-500'>
                      {new Date(prog.endDate).toLocaleDateString('en-GB', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                    <span
                      className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md ${
                        status.expired
                          ? 'bg-slate-200 text-slate-600'
                          : (status.days ?? 0) <= 30
                            ? 'bg-rose-100 text-rose-700'
                            : 'bg-emerald-100 text-emerald-700'
                      }`}
                    >
                      {status.text}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Quick Actions Grid */}
      <div>
        <p className='text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3'>
          Quick actions
        </p>
        <div className='grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3'>
          {actions.map((a) => (
            <button
              key={a.tab}
              onClick={() => onNavigate(a.tab)}
              className='flex items-center gap-3 p-4 rounded-2xl bg-white shadow-sm border border-slate-100 hover:border-[#002EFF]/30 hover:shadow-md transition-all text-left group'
            >
              <div className='h-9 w-9 rounded-xl bg-blue-50 text-[#002EFF] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform'>
                <a.icon size={16} />
              </div>
              <span className='text-[11px] font-black text-slate-700 uppercase tracking-tight'>
                {a.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Program Modal */}
      {showProgramModal && (
        <ProgramCountdownModal
          initialProgram={editingProgram}
          onClose={() => {
            setShowProgramModal(false)
            setEditingProgram(null)
          }}
          onSuccess={() => {
            loadDashboardData()
          }}
        />
      )}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Modal Component: POST /api/programs (Upsert Program Countdown)    */
/* ------------------------------------------------------------------ */
function ProgramCountdownModal({
  initialProgram,
  onClose,
  onSuccess,
}: {
  initialProgram: ProgramCountdown | null
  onClose: () => void
  onSuccess: () => void
}) {
  const [name, setName] = useState(initialProgram?.name || 'JAMB Countdown')
  const [endDate, setEndDate] = useState(
    initialProgram?.endDate
      ? new Date(initialProgram.endDate).toISOString().slice(0, 16)
      : '2026-05-01T00:00',
  )
  const [submitting, setSubmitting] = useState(false)
  const [statusMsg, setStatusMsg] = useState<{
    type: 'error' | 'success'
    text: string
  } | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatusMsg(null)

    if (!name.trim()) {
      setStatusMsg({ type: 'error', text: 'Program name is required.' })
      return
    }
    if (!endDate) {
      setStatusMsg({ type: 'error', text: 'Target end date is required.' })
      return
    }

    const token = getAdminToken()
    if (!token) {
      setStatusMsg({
        type: 'error',
        text: 'Admin token missing. Please log in again.',
      })
      return
    }

    setSubmitting(true)

    try {
      const payload = {
        name: name.trim(),
        endDate: new Date(endDate).toISOString(),
      }

      const res = await fetch(`${API_BASE_URL}/api/programs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          accept: '*/*',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      })

      const data = await res.json()

      if (!res.ok || data.success === false) {
        throw new Error(data?.message || 'Failed to upsert program countdown')
      }

      setStatusMsg({
        type: 'success',
        text: `Program "${payload.name}" updated successfully!`,
      })
      onSuccess()
      setTimeout(onClose, 1000)
    } catch (err: unknown) {
      const errorText = err instanceof Error ? err.message : 'An error occurred'
      setStatusMsg({
        type: 'error',
        text: errorText,
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200'>
      <div className='w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden'>
        {/* Header */}
        <div className='flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50'>
          <div className='flex items-center gap-2.5'>
            <div className='h-8 w-8 rounded-xl bg-[#002EFF] text-white flex items-center justify-center shadow-md shadow-blue-200'>
              <Timer size={16} />
            </div>
            <div>
              <h3 className='text-xs font-black text-slate-900 uppercase tracking-wider'>
                Upsert Program Countdown
              </h3>
              <p className='text-[9px] font-bold text-slate-400'>
                POST /api/programs
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

        {/* Form */}
        <form onSubmit={handleSubmit} className='p-6 space-y-4'>
          {statusMsg && (
            <div
              className={`flex items-start gap-2 p-3 rounded-xl text-[11px] font-bold ${
                statusMsg.type === 'error'
                  ? 'bg-rose-50 text-rose-600 border border-rose-100'
                  : 'bg-emerald-50 text-emerald-600 border border-emerald-100'
              }`}
            >
              {statusMsg.type === 'error' ? (
                <AlertCircle size={14} className='shrink-0 mt-0.5' />
              ) : (
                <CheckCircle2 size={14} className='shrink-0 mt-0.5' />
              )}
              <span>{statusMsg.text}</span>
            </div>
          )}

          {/* Name Input */}
          <div className='space-y-1'>
            <label className='text-[9px] font-black uppercase tracking-widest text-slate-400 block'>
              Program Name <span className='text-rose-500'>*</span>
            </label>
            <input
              type='text'
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder='e.g. JAMB Countdown'
              className='w-full h-10 px-3 rounded-xl bg-slate-50 border border-slate-200 focus:border-[#002EFF] focus:bg-white outline-none text-xs font-bold text-slate-800 transition-all'
            />
          </div>

          {/* End Date Input */}
          <div className='space-y-1'>
            <label className='text-[9px] font-black uppercase tracking-widest text-slate-400 block'>
              Target End Date &amp; Time{' '}
              <span className='text-rose-500'>*</span>
            </label>
            <input
              type='datetime-local'
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className='w-full h-10 px-3 rounded-xl bg-slate-50 border border-slate-200 focus:border-[#002EFF] focus:bg-white outline-none text-xs font-mono font-bold text-slate-800 transition-all'
            />
          </div>

          {/* Actions */}
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
                'Save Countdown'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}