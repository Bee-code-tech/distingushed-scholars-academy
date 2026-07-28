'use client'

import { useState, useEffect } from 'react'
import {
  LayoutDashboard,
  TrendingUp,
  CalendarCheck,
  Timer,
  Wallet,
  Loader2,
  CheckCircle2,
  XCircle,
  Target,
  Receipt,
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import DashboardShell, {
  type NavItem,
} from '@/components/dashboard/DashboardShell'
import { useDashboardSession } from '@/components/dashboard/useDashboardSession'
import {
  EXAM_TRACKS,
  examCountdown,
  DEPARTMENT_LABELS,
  type Countdown,
} from '@/lib/studentProfile'

// --- The ward (child) this guardian oversees. Mock until the API links
// guardians to students. ---------------------------------------------------
const WARD = {
  name: 'Tomiwa Adeyemi',
  track: 'waec' as const,
  department: 'science' as const,
  mode: 'physical' as const,
  avgScore: 76,
  accuracy: 88,
  topicsDone: 34,
  rank: 18,
}

const ATTENDANCE = [
  { week: 'Week of 14 Jul', present: 5, total: 5 },
  { week: 'Week of 07 Jul', present: 4, total: 5 },
  { week: 'Week of 30 Jun', present: 5, total: 5 },
  { week: 'Week of 23 Jun', present: 3, total: 5 },
]

const FEES = [
  { item: 'Term 2 Tuition', amount: 45000, status: 'paid', date: '02 Jun 2026' },
  { item: 'Study Materials', amount: 8000, status: 'paid', date: '02 Jun 2026' },
  { item: 'Term 3 Tuition', amount: 45000, status: 'due', date: 'Due 05 Sep 2026' },
]

const naira = (n: number) => `₦${n.toLocaleString('en-NG')}`

const NAV: NavItem[] = [
  { key: 'overview', label: 'Overview', icon: LayoutDashboard },
  { key: 'performance', label: 'Performance', icon: TrendingUp },
  { key: 'attendance', label: 'Attendance', icon: CalendarCheck },
  { key: 'countdown', label: 'Exam Countdown', icon: Timer },
  { key: 'fees', label: 'Fees', icon: Wallet },
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

export default function GuardianDashboard() {
  const { user, loading, logout } = useDashboardSession('parent')
  const [view, setView] = useState('overview')

  const track = EXAM_TRACKS[WARD.track]
  const [time, setTime] = useState<Countdown>(() => examCountdown(track.nextExamDate))
  useEffect(() => {
    const id = setInterval(() => setTime(examCountdown(track.nextExamDate)), 1000)
    return () => clearInterval(id)
  }, [track.nextExamDate])

  if (loading || !user) {
    return (
      <div className='h-screen w-full flex flex-col items-center justify-center bg-[#F8FAFF]'>
        <Loader2 className='text-[#002EFF] animate-spin mb-4' size={40} />
        <p className='text-[10px] font-black uppercase tracking-[0.2em] text-[#002EFF]'>
          Loading Guardian Portal
        </p>
      </div>
    )
  }

  const name = user.fullName || user.username || 'Guardian'
  const outstanding = FEES.filter((f) => f.status === 'due').reduce((n, f) => n + f.amount, 0)

  return (
    <DashboardShell
      roleLabel='Guardian'
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
            <p className='text-[10px] font-black uppercase tracking-widest text-blue-200 mb-1'>Your Ward</p>
            <h1 className='text-2xl md:text-3xl font-black uppercase italic tracking-tight'>
              {WARD.name}
            </h1>
            <div className='flex items-center gap-2 mt-3'>
              <Badge className='bg-[#FCB900] text-[#002EFF] font-black'>{track.label}</Badge>
              <Badge className='bg-white/15 text-white font-bold'>{DEPARTMENT_LABELS[WARD.department]}</Badge>
              <Badge className='bg-white/15 text-white font-bold'>On-Campus</Badge>
            </div>
            <Target size={150} className='text-white/10 absolute -right-6 -bottom-6 rotate-12 pointer-events-none' />
          </section>

          <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
            <StatTile label='Avg Score' value={`${WARD.avgScore}%`} icon={TrendingUp} tint='bg-blue-50 text-blue-600' />
            <StatTile label='Accuracy' value={`${WARD.accuracy}%`} icon={Target} tint='bg-emerald-50 text-emerald-600' />
            <StatTile label='Class Rank' value={`#${WARD.rank}`} icon={CheckCircle2} tint='bg-amber-50 text-amber-600' />
            <StatTile label='Outstanding' value={outstanding ? naira(outstanding) : 'Nil'} icon={Wallet} tint='bg-rose-50 text-rose-600' />
          </div>

          <Card className='rounded-4xl p-6 bg-white border-none shadow-sm text-center'>
            <p className='text-[10px] font-black uppercase tracking-widest text-blue-400 mb-4'>
              {track.label} {new Date(track.nextExamDate).getFullYear()} — Countdown
            </p>
            {time.elapsed ? (
              <p className='text-sm font-black text-gray-800 uppercase py-3'>Exam period is here</p>
            ) : (
              <div className='flex items-center justify-center gap-2'>
                {[['days', time.days], ['hrs', time.hours], ['min', time.minutes], ['sec', time.seconds]].map(
                  ([l, v], i) => (
                    <div key={i} className='flex flex-col items-center'>
                      <span className='text-3xl font-black text-[#002EFF] tabular-nums'>
                        {String(v).padStart(2, '0')}
                      </span>
                      <span className='text-[7px] font-bold text-gray-400 uppercase'>{l}</span>
                    </div>
                  ),
                )}
              </div>
            )}
          </Card>
        </div>
      )}

      {view === 'performance' && (
        <div className='space-y-4'>
          <h2 className='text-2xl font-black text-[#002EFF] italic uppercase'>{WARD.name}&apos;s Performance</h2>
          <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
            <StatTile label='Avg Score' value={`${WARD.avgScore}%`} icon={TrendingUp} tint='bg-blue-50 text-blue-600' />
            <StatTile label='Accuracy' value={`${WARD.accuracy}%`} icon={Target} tint='bg-emerald-50 text-emerald-600' />
            <StatTile label='Topics Done' value={`${WARD.topicsDone}/${track.totalTopics}`} icon={CheckCircle2} tint='bg-amber-50 text-amber-600' />
            <StatTile label='Class Rank' value={`#${WARD.rank}`} icon={Timer} tint='bg-indigo-50 text-indigo-600' />
          </div>
          <Card className='p-6 rounded-3xl border-none shadow-sm bg-white'>
            <p className='text-[10px] font-black uppercase text-gray-400 mb-3'>Exam readiness</p>
            <div className='h-3 bg-slate-100 rounded-full overflow-hidden'>
              <div className='h-full bg-linear-to-r from-[#002EFF] to-[#FCB900] rounded-full' style={{ width: `${WARD.avgScore}%` }} />
            </div>
            <p className='text-[11px] font-bold text-gray-500 mt-3'>
              {WARD.name.split(' ')[0]} is tracking at {WARD.avgScore}% readiness for {track.fullName}.
            </p>
          </Card>
        </div>
      )}

      {view === 'attendance' && (
        <div className='space-y-4'>
          <h2 className='text-2xl font-black text-[#002EFF] italic uppercase'>Attendance</h2>
          {ATTENDANCE.map((a, i) => {
            const full = a.present === a.total
            return (
              <Card key={i} className='p-4 rounded-3xl border-none shadow-sm bg-white flex items-center justify-between'>
                <div className='flex items-center gap-3'>
                  {full ? <CheckCircle2 className='text-emerald-500' size={20} /> : <XCircle className='text-amber-500' size={20} />}
                  <span className='text-xs font-black text-gray-800 uppercase'>{a.week}</span>
                </div>
                <span className={`text-sm font-black ${full ? 'text-emerald-600' : 'text-amber-600'}`}>
                  {a.present}/{a.total} days
                </span>
              </Card>
            )
          })}
        </div>
      )}

      {view === 'countdown' && (
        <div className='space-y-4'>
          <h2 className='text-2xl font-black text-[#002EFF] italic uppercase'>Exam Countdown</h2>
          <Card className='rounded-4xl p-8 bg-[#002EFF] text-white border-none shadow-lg text-center'>
            <p className='text-[10px] font-black uppercase tracking-widest text-blue-200 mb-4'>
              {track.fullName} · {new Date(track.nextExamDate).getFullYear()}
            </p>
            {time.elapsed ? (
              <p className='text-lg font-black uppercase py-4'>Exam period is here — best of luck!</p>
            ) : (
              <div className='flex items-center justify-center gap-3'>
                {[['days', time.days], ['hrs', time.hours], ['min', time.minutes], ['sec', time.seconds]].map(
                  ([l, v], i) => (
                    <div key={i} className='flex flex-col items-center'>
                      <span className='text-4xl md:text-5xl font-black text-[#FCB900] tabular-nums'>
                        {String(v).padStart(2, '0')}
                      </span>
                      <span className='text-[8px] font-bold text-blue-200 uppercase'>{l}</span>
                    </div>
                  ),
                )}
              </div>
            )}
          </Card>
        </div>
      )}

      {view === 'fees' && (
        <div className='space-y-4'>
          <div className='flex items-center justify-between'>
            <h2 className='text-2xl font-black text-[#002EFF] italic uppercase'>Fees & Payments</h2>
            {outstanding > 0 && (
              <Button className='bg-[#FCB900] text-[#002EFF] font-black text-[10px] rounded-xl'>
                PAY {naira(outstanding)}
              </Button>
            )}
          </div>
          {FEES.map((f, i) => (
            <Card key={i} className='p-4 rounded-3xl border-none shadow-sm bg-white flex items-center justify-between'>
              <div className='flex items-center gap-3'>
                <div className='h-9 w-9 bg-blue-50 rounded-xl flex items-center justify-center text-[#002EFF]'>
                  <Receipt size={16} />
                </div>
                <div>
                  <p className='text-xs font-black text-gray-800 uppercase'>{f.item}</p>
                  <p className='text-[10px] font-bold text-gray-400'>{f.date}</p>
                </div>
              </div>
              <div className='text-right'>
                <p className='text-sm font-black text-gray-800'>{naira(f.amount)}</p>
                <Badge className={`text-[8px] font-black ${f.status === 'paid' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-500'}`}>
                  {f.status.toUpperCase()}
                </Badge>
              </div>
            </Card>
          ))}
        </div>
      )}
    </DashboardShell>
  )
}
