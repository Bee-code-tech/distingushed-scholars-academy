'use client'

import { useState, useEffect } from 'react'
import {
  LayoutDashboard,
  Users,
  CalendarDays,
  CalendarCheck,
  BarChart3,
  Loader2,
  Video,
  CheckCircle2,
  BookOpen,
  ClipboardList,
  Megaphone,
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import DashboardShell, {
  type NavItem,
} from '@/components/dashboard/DashboardShell'
import { useDashboardSession } from '@/components/dashboard/useDashboardSession'
import TakeAttendance from '@/components/dashboard/TakeAttendance'
import ReadOnlyTimetable from '@/components/dashboard/ReadOnlyTimetable'
import LiveClasses from '@/components/dashboard/LiveClasses'
import CourseMaterials from '@/components/dashboard/CourseMaterials'
import Assignments from '@/components/dashboard/Assignments'
import Analytics from '@/components/dashboard/Analytics'
import Announcements from '@/components/dashboard/Announcements'
import { getStudents, type StoredStudent } from '@/lib/studentsStore'
import { getCourses } from '@/lib/coursesStore'
import { getAssignments, getSubmissions } from '@/lib/assignmentsStore'

const NAV: NavItem[] = [
  { key: 'overview', label: 'Overview', icon: LayoutDashboard },
  { key: 'students', label: 'My Students', icon: Users },
  { key: 'materials', label: 'Course Materials', icon: BookOpen },
  { key: 'assignments', label: 'Assignments', icon: ClipboardList },
  { key: 'announcements', label: 'Announcements', icon: Megaphone },
  { key: 'attendance', label: 'Take Attendance', icon: CalendarCheck },
  { key: 'live', label: 'Live Classes', icon: Video },
  { key: 'timetable', label: 'Timetable', icon: CalendarDays },
  { key: 'analytics', label: 'Analytics', icon: BarChart3 },
]

function StatTile({ label, value, icon: Icon, tint }: any) {
  return (
    <Card className='p-4 rounded-2xl border-none shadow-sm bg-white flex items-center gap-3'>
      <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${tint}`}>
        <Icon size={18} strokeWidth={2.5} />
      </div>
      <div>
        <p className='text-[8px] font-black text-gray-400 uppercase leading-none mb-1'>{label}</p>
        <p className='text-lg font-black text-gray-900 leading-none'>{value}</p>
      </div>
    </Card>
  )
}

function TrackBadge({ track }: { track: string }) {
  return (
    <Badge className='bg-blue-50 text-[#002EFF] text-[8px] font-black'>{track}</Badge>
  )
}

export default function TutorDashboard() {
  const { user, loading, logout } = useDashboardSession('tutor')
  const [view, setView] = useState('overview')
  // Loaded on the client (localStorage) — includes any student registered on
  // this browser, so the roster reflects real sign-ups.
  const [students, setStudents] = useState<StoredStudent[]>([])
  useEffect(() => setStudents(getStudents()), [])

  if (loading || !user) {
    return (
      <div className='h-screen w-full flex flex-col items-center justify-center bg-[#F8FAFF]'>
        <Loader2 className='text-[#002EFF] animate-spin mb-4' size={40} />
        <p className='text-[10px] font-black uppercase tracking-[0.2em] text-[#002EFF]'>
          Loading Tutor Portal
        </p>
      </div>
    )
  }

  const name = user.fullName || user.username || 'Tutor'
  // Drop any "(Tutor)" suffix demo names carry, and any leading title.
  const greeting = name.replace(/\s*\(.*\)$/, '').replace(/^(Mr|Mrs|Ms|Dr)\.?\s+/i, '')
  // Assignment metrics from the store (replaces the old quiz mock).
  let totalAssignments = 0
  let pendingGrading = 0
  getCourses().forEach((c) =>
    getAssignments(c.id).forEach((a) => {
      totalAssignments++
      getSubmissions(a.id).forEach((s) => {
        if (s.status !== 'graded') pendingGrading++
      })
    }),
  )

  return (
    <DashboardShell
      roleLabel='Tutor'
      userName={name}
      userAvatar={user.avatarUrl}
      nav={NAV}
      activeKey={view}
      onNavigate={setView}
      onLogout={logout}
    >
      {view === 'overview' && (
        <div className='space-y-6'>
          <section className='relative overflow-hidden bg-[#002EFF] rounded-4xl p-8 text-white shadow-lg'>
            <h1 className='text-2xl md:text-3xl font-black uppercase italic tracking-tight'>
              Welcome, <span className='text-[#FCB900]'>{greeting}</span>
            </h1>
            <p className='text-blue-100 text-xs md:text-sm mt-2 font-medium'>
              You have {pendingGrading} submission{pendingGrading === 1 ? '' : 's'}{' '}
              waiting to be graded.
            </p>
          </section>

          <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
            <StatTile label='My Students' value={students.length} icon={Users} tint='bg-blue-50 text-blue-600' />
            <StatTile label='Courses' value={getCourses().length} icon={BookOpen} tint='bg-emerald-50 text-emerald-600' />
            <StatTile label='Assignments' value={totalAssignments} icon={ClipboardList} tint='bg-amber-50 text-amber-600' />
            <StatTile label='To Grade' value={pendingGrading} icon={CheckCircle2} tint='bg-rose-50 text-rose-600' />
          </div>

          <Card className='p-6 rounded-3xl border-none shadow-sm bg-white'>
            <div className='flex items-center justify-between mb-4'>
              <h3 className='text-sm font-black uppercase text-gray-800'>Students Needing Attention</h3>
              <button onClick={() => setView('students')} className='text-[10px] font-black text-[#002EFF] uppercase'>
                View all
              </button>
            </div>
            <div className='space-y-2'>
              {students.filter((s) => (s.avg ?? 100) < 70).map((s) => (
                <div key={s.key} className='flex items-center justify-between p-3 rounded-2xl bg-rose-50/50'>
                  <div className='flex items-center gap-2'>
                    <span className='text-xs font-black text-gray-800'>{s.name}</span>
                    <TrackBadge track={s.track} />
                  </div>
                  <span className='text-xs font-black text-rose-500'>{s.avg}% avg</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {view === 'students' && (
        <div className='space-y-4'>
          <h2 className='text-2xl font-black text-[#002EFF] italic uppercase'>My Students</h2>
          <Card className='rounded-3xl border-none shadow-sm bg-white overflow-hidden'>
            <div className='grid grid-cols-12 px-5 py-3 bg-slate-50 text-[9px] font-black uppercase text-gray-400'>
              <span className='col-span-4'>Student</span>
              <span className='col-span-2'>Track</span>
              <span className='col-span-2'>Mode</span>
              <span className='col-span-2'>Avg</span>
              <span className='col-span-2'>Progress</span>
            </div>
            {students.map((s) => (
              <div key={s.key} className='grid grid-cols-12 items-center px-5 py-4 border-t border-slate-50'>
                <span className='col-span-4 text-xs font-black text-gray-800'>
                  {s.name}
                  {s.isNew && (
                    <span className='ml-2 text-[8px] font-black uppercase text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded'>
                      New
                    </span>
                  )}
                </span>
                <span className='col-span-2'><TrackBadge track={s.track} /></span>
                <span className='col-span-2'>
                  {s.mode ? (
                    <Badge
                      className={`text-[8px] font-black ${s.mode === 'physical' ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-[#002EFF]'}`}
                    >
                      {s.mode === 'physical' ? 'On-Campus' : 'Online'}
                    </Badge>
                  ) : (
                    <span className='text-[10px] font-bold text-slate-300'>—</span>
                  )}
                </span>
                <span className={`col-span-2 text-xs font-black ${s.avg == null ? 'text-slate-400' : s.avg >= 70 ? 'text-emerald-600' : 'text-rose-500'}`}>
                  {s.avg == null ? '—' : `${s.avg}%`}
                </span>
                <div className='col-span-2'>
                  <div className='h-2 bg-slate-100 rounded-full overflow-hidden'>
                    <div className='h-full bg-[#002EFF] rounded-full' style={{ width: `${s.progress ?? 0}%` }} />
                  </div>
                </div>
              </div>
            ))}
          </Card>
        </div>
      )}

      {view === 'materials' && <CourseMaterials mode='tutor' />}

      {view === 'assignments' && <Assignments mode='tutor' />}

      {view === 'announcements' && <Announcements mode='tutor' />}

      {view === 'attendance' && <TakeAttendance />}

      {view === 'live' && <LiveClasses mode='tutor' />}

      {view === 'timetable' && <ReadOnlyTimetable />}

      {view === 'analytics' && <Analytics mode='tutor' />}
    </DashboardShell>
  )
}
