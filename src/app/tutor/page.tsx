'use client'

import { useState, useEffect } from 'react'
import {
  LayoutDashboard,
  Users,
  CalendarDays,
  CalendarCheck,
  FileText,
  BarChart3,
  Loader2,
  MapPin,
  Video,
  Clock,
  CheckCircle2,
  PlusCircle,
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import DashboardShell, {
  type NavItem,
} from '@/components/dashboard/DashboardShell'
import { useDashboardSession } from '@/components/dashboard/useDashboardSession'
import TakeAttendance from '@/components/dashboard/TakeAttendance'
import TimetableEditor from '@/components/dashboard/TimetableEditor'
import { getStudents, type StoredStudent } from '@/lib/studentsStore'

// --- Mock data (replace with API once tutor endpoints exist) ----------------

const CLASSES = [
  { day: 'MON', date: '28 JUL', title: 'Mathematics — Algebra', time: '9:00 AM', where: 'Hall B, Campus', mode: 'physical', live: true },
  { day: 'WED', date: '30 JUL', title: 'Mathematics — Live Q&A', time: '6:00 PM', where: 'DSA Portal', mode: 'online', live: false },
  { day: 'FRI', date: '01 AUG', title: 'Further Maths Revision', time: '10:00 AM', where: 'Hall A, Campus', mode: 'physical', live: false },
]

const QUIZZES = [
  { title: 'Algebra Speed Test', subject: 'Mathematics', submissions: 24, graded: 24, status: 'closed' },
  { title: 'Indices & Logarithms', subject: 'Mathematics', submissions: 18, graded: 11, status: 'grading' },
  { title: 'Mock CBT — Paper 1', subject: 'Mathematics', submissions: 31, graded: 0, status: 'open' },
]

const SUBJECT_PERF = [
  { subject: 'Algebra', score: 84 },
  { subject: 'Geometry', score: 71 },
  { subject: 'Calculus', score: 63 },
  { subject: 'Statistics', score: 78 },
  { subject: 'Trigonometry', score: 69 },
]

const NAV: NavItem[] = [
  { key: 'overview', label: 'Overview', icon: LayoutDashboard },
  { key: 'students', label: 'My Students', icon: Users },
  { key: 'attendance', label: 'Take Attendance', icon: CalendarCheck },
  { key: 'timetable', label: 'Timetable', icon: CalendarDays },
  { key: 'schedule', label: 'Class Schedule', icon: CalendarDays },
  { key: 'quizzes', label: 'Quizzes', icon: FileText },
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
  const pendingGrading = QUIZZES.reduce((n, q) => n + (q.submissions - q.graded), 0)

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
              You have {pendingGrading} submissions waiting to be graded and{' '}
              {CLASSES.filter((c) => c.live).length} class live today.
            </p>
          </section>

          <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
            <StatTile label='My Students' value={students.length} icon={Users} tint='bg-blue-50 text-blue-600' />
            <StatTile label='Classes / wk' value={CLASSES.length} icon={CalendarDays} tint='bg-emerald-50 text-emerald-600' />
            <StatTile label='Quizzes' value={QUIZZES.length} icon={FileText} tint='bg-amber-50 text-amber-600' />
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

      {view === 'attendance' && <TakeAttendance />}

      {view === 'timetable' && <TimetableEditor />}

      {view === 'schedule' && (
        <div className='space-y-4'>
          <h2 className='text-2xl font-black text-[#002EFF] italic uppercase'>Class Schedule</h2>
          {CLASSES.map((c, i) => (
            <Card key={i} className='p-4 rounded-3xl border-none shadow-sm bg-white flex items-center justify-between'>
              <div className='flex items-center gap-5'>
                <div className={`text-center p-3 rounded-2xl min-w-[68px] ${c.live ? 'bg-[#FCB900] text-[#002EFF]' : 'bg-blue-50 text-gray-700'}`}>
                  <p className='text-[10px] font-black uppercase'>{c.day}</p>
                  <p className='text-sm font-black'>{c.date}</p>
                </div>
                <div className='space-y-1'>
                  <div className='flex items-center gap-2'>
                    <h4 className='text-sm font-black text-gray-800 uppercase'>{c.title}</h4>
                    {c.live && <Badge className='bg-red-500 text-white text-[8px] font-black animate-pulse'>LIVE</Badge>}
                  </div>
                  <div className='flex items-center gap-4 text-gray-400'>
                    <span className='flex items-center gap-1 text-[10px] font-bold'><Clock size={12} /> {c.time}</span>
                    <span className='flex items-center gap-1 text-[10px] font-bold'>
                      {c.mode === 'physical' ? <MapPin size={12} /> : <Video size={12} />} {c.where}
                    </span>
                  </div>
                </div>
              </div>
              <Button size='sm' className='bg-[#002EFF] text-white font-black text-[10px] rounded-xl'>
                {c.mode === 'online' ? 'START' : 'DETAILS'}
              </Button>
            </Card>
          ))}
        </div>
      )}

      {view === 'quizzes' && (
        <div className='space-y-4'>
          <div className='flex items-center justify-between'>
            <h2 className='text-2xl font-black text-[#002EFF] italic uppercase'>Quizzes</h2>
            <Button className='bg-[#002EFF] text-white font-black text-[10px] rounded-xl'>
              <PlusCircle size={14} className='mr-2' /> NEW QUIZ
            </Button>
          </div>
          {QUIZZES.map((q, i) => {
            const pct = q.submissions ? Math.round((q.graded / q.submissions) * 100) : 0
            return (
              <Card key={i} className='p-5 rounded-3xl border-none shadow-sm bg-white'>
                <div className='flex items-center justify-between'>
                  <div>
                    <h4 className='text-sm font-black text-gray-800 uppercase'>{q.title}</h4>
                    <p className='text-[10px] font-bold text-gray-400 uppercase'>{q.subject}</p>
                  </div>
                  <Badge
                    className={`text-[8px] font-black ${
                      q.status === 'open' ? 'bg-emerald-50 text-emerald-600'
                      : q.status === 'grading' ? 'bg-amber-50 text-amber-600'
                      : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {q.status.toUpperCase()}
                  </Badge>
                </div>
                <div className='flex items-center gap-3 mt-4'>
                  <div className='flex-1 h-2 bg-slate-100 rounded-full overflow-hidden'>
                    <div className='h-full bg-[#002EFF] rounded-full' style={{ width: `${pct}%` }} />
                  </div>
                  <span className='text-[10px] font-black text-gray-500'>
                    {q.graded}/{q.submissions} graded
                  </span>
                  {q.graded < q.submissions && (
                    <Button size='sm' className='bg-[#FCB900] text-[#002EFF] font-black text-[10px] rounded-xl h-8'>
                      GRADE
                    </Button>
                  )}
                </div>
              </Card>
            )
          })}
        </div>
      )}

      {view === 'analytics' && (
        <div className='space-y-4'>
          <h2 className='text-2xl font-black text-[#002EFF] italic uppercase'>Student Analytics</h2>
          <Card className='p-6 rounded-3xl border-none shadow-sm bg-white'>
            <p className='text-[10px] font-black uppercase text-gray-400 mb-5'>
              Average class score by topic
            </p>
            <div className='space-y-4'>
              {SUBJECT_PERF.map((s) => (
                <div key={s.subject} className='flex items-center gap-3'>
                  <span className='w-24 text-[10px] font-black text-gray-600 uppercase text-right'>{s.subject}</span>
                  <div className='flex-1 h-6 bg-slate-100 rounded-lg overflow-hidden'>
                    <div
                      className={`h-full rounded-lg flex items-center justify-end pr-2 ${s.score >= 70 ? 'bg-[#002EFF]' : 'bg-amber-400'}`}
                      style={{ width: `${s.score}%` }}
                    >
                      <span className='text-[9px] font-black text-white'>{s.score}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}
    </DashboardShell>
  )
}
