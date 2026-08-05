'use client'

import { useEffect, useState } from 'react'
import {
  Users,
  UserPlus,
  ShieldCheck,
  CalendarCheck,
  CalendarDays,
  Megaphone,
  BookOpen,
  Loader2,
} from 'lucide-react'
import { getStudents } from '@/lib/studentsStore'
import { getStaff, getRoles } from '@/lib/staffStore'
import { getCourses } from '@/lib/coursesStore'

type Tab =
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

export default function AdminHome({ onNavigate }: { onNavigate: (tab: Tab) => void }) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  if (!mounted) {
    return <div className='py-20 flex justify-center'><Loader2 className='animate-spin text-[#002EFF]' /></div>
  }

  const students = getStudents()
  const staff = getStaff()
  const roles = getRoles()
  const courses = getCourses()

  const stats = [
    { label: 'Students', value: students.length, icon: Users, tint: 'bg-blue-50 text-blue-600' },
    { label: 'Staff Accounts', value: staff.length, icon: ShieldCheck, tint: 'bg-emerald-50 text-emerald-600' },
    { label: 'Roles', value: roles.length, icon: ShieldCheck, tint: 'bg-amber-50 text-amber-600' },
    { label: 'Courses', value: courses.length, icon: BookOpen, tint: 'bg-purple-50 text-purple-600' },
  ]

  const actions: { label: string; tab: Tab; icon: React.ElementType }[] = [
    { label: 'View Students', tab: 'students', icon: Users },
    { label: 'View Tutors', tab: 'view-tutors', icon: BookOpen },
    { label: 'View Guardians', tab: 'view-guardians', icon: Users },
    { label: 'Create Tutor', tab: 'create-tutor', icon: UserPlus },
    { label: 'Create Guardian', tab: 'create-guardian', icon: UserPlus },
    { label: 'Manage Courses', tab: 'courses', icon: BookOpen },
    { label: 'Take Attendance', tab: 'attendance', icon: CalendarCheck },
    { label: 'Edit Timetable', tab: 'timetable', icon: CalendarDays },
    { label: 'Send Announcement', tab: 'broadcast', icon: Megaphone },
    { label: 'Permissions', tab: 'roles', icon: ShieldCheck },
  ]

  return (
    <div className='max-w-6xl mx-auto space-y-6 px-4'>
      <div>
        <h1 className='text-2xl font-black text-slate-900 tracking-tight'>Admin Dashboard</h1>
        <p className='text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-1'>
          Manage students, staff, timetable &amp; announcements
        </p>
      </div>

      <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
        {stats.map((s) => (
          <div key={s.label} className='p-4 rounded-2xl bg-white shadow-sm border border-slate-100 flex items-center gap-3'>
            <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${s.tint}`}>
              <s.icon size={18} strokeWidth={2.5} />
            </div>
            <div>
              <p className='text-[8px] font-black text-gray-400 uppercase leading-none mb-1'>{s.label}</p>
              <p className='text-lg font-black text-gray-900 leading-none'>{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div>
        <p className='text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3'>Quick actions</p>
        <div className='grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3'>
          {actions.map((a) => (
            <button
              key={a.tab}
              onClick={() => onNavigate(a.tab)}
              className='flex items-center gap-3 p-4 rounded-2xl bg-white shadow-sm border border-slate-100 hover:border-[#002EFF]/30 hover:shadow-md transition-all text-left'
            >
              <div className='h-9 w-9 rounded-xl bg-blue-50 text-[#002EFF] flex items-center justify-center shrink-0'>
                <a.icon size={16} />
              </div>
              <span className='text-[11px] font-black text-slate-700 uppercase tracking-tight'>{a.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
