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
  Target,
  Receipt,
  GraduationCap,
  BookOpen,
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import DashboardShell, {
  type NavItem,
} from '@/components/dashboard/DashboardShell'
import { useDashboardSession } from '@/components/dashboard/useDashboardSession'
import {
  EXAM_TRACKS,
  examCountdown,
  type Countdown,
  type ExamTrack,
} from '@/lib/studentProfile'
import { getToken } from '@/lib/auth'
import { isDemoToken } from '@/lib/demoAccounts'
import { dsaApi } from '@/lib/api'

const naira = (n: number) => `₦${n.toLocaleString('en-NG')}`

const NAV: NavItem[] = [
  { key: 'overview', label: 'Overview', icon: LayoutDashboard },
  { key: 'performance', label: 'Performance', icon: TrendingUp },
  { key: 'attendance', label: 'Attendance', icon: CalendarCheck },
  { key: 'countdown', label: 'Exam Countdown', icon: Timer },
  { key: 'fees', label: 'Fees', icon: Wallet },
]

function isLive(): boolean {
  const t = getToken()
  return !!t && !isDemoToken(t)
}

function toTrack(v: unknown): ExamTrack {
  const t = String(v || '').toLowerCase()
  if (t === 'waec' || t === 'postutme') return t
  return 'jamb'
}

type Ward = {
  id: string
  studentId: string
  name: string
  track: ExamTrack
  level?: string
  mode?: string
  isPaid?: boolean
}
type Perf = {
  averageScore: number | null
  progressPercent: number
  attendanceRate: number
  present: number
  totalSessions: number
  perSubject: { courseId: string; average: number | null }[]
}
type Fee = { amount: number; status: string; paidAt?: string; reference?: string }

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

  const [ward, setWard] = useState<Ward | null>(null)
  const [perf, setPerf] = useState<Perf | null>(null)
  const [fee, setFee] = useState<Fee | null>(null)
  const [dataLoading, setDataLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      if (!isLive()) {
        setDataLoading(false)
        return
      }
      try {
        const wards = (await dsaApi.guardian.wards()) as Record<string, unknown>[]
        if (cancelled) return
        const w = wards[0]
        if (!w) {
          setDataLoading(false)
          return
        }
        const id = String(w.id ?? w._id ?? '')
        setWard({
          id,
          studentId: String(w.studentId ?? ''),
          name: String(w.fullname ?? w.fullName ?? 'Ward'),
          track: toTrack(w.examTrack ?? w.level),
          level: w.level ? String(w.level) : undefined,
          mode: w.learningMode ? String(w.learningMode) : undefined,
          isPaid: !!w.isPaid,
        })
        const [p, f] = await Promise.allSettled([
          dsaApi.guardian.performance(id) as Promise<Record<string, unknown>>,
          dsaApi.guardian.fees(id) as Promise<Record<string, unknown>>,
        ])
        if (cancelled) return
        if (p.status === 'fulfilled' && p.value) {
          const d = p.value
          setPerf({
            averageScore:
              typeof d.averageScore === 'number' ? d.averageScore : null,
            progressPercent: Number(d.progressPercent ?? 0),
            attendanceRate: Math.min(100, Number(d.attendanceRate ?? 0)),
            present: Number(d.present ?? 0),
            totalSessions: Number(d.totalSessions ?? 0),
            perSubject: Array.isArray(d.perSubject)
              ? (d.perSubject as Record<string, unknown>[]).map((s) => ({
                  courseId: String(s.courseId ?? ''),
                  average: typeof s.average === 'number' ? s.average : null,
                }))
              : [],
          })
        }
        if (f.status === 'fulfilled' && f.value) {
          const d = f.value
          setFee({
            amount: Number(d.amount ?? 0),
            status: String(d.status ?? ''),
            paidAt: d.paidAt ? String(d.paidAt) : undefined,
            reference: d.paymentReference ? String(d.paymentReference) : undefined,
          })
        }
      } catch {
        /* leave empty */
      } finally {
        if (!cancelled) setDataLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const track = EXAM_TRACKS[ward?.track ?? 'jamb']
  const [time, setTime] = useState<Countdown>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    elapsed: false,
  })
  useEffect(() => {
    setTime(examCountdown(track.nextExamDate))
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
  const feeDue = fee && fee.status !== 'paid' ? fee.amount : 0
  const paidDate = fee?.paidAt
    ? new Date(fee.paidAt).toLocaleDateString('en-NG', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : undefined

  const NoWard = (
    <Card className='rounded-3xl border-none shadow-sm bg-white p-10 text-center'>
      <div className='h-14 w-14 mx-auto rounded-2xl bg-blue-50 text-[#002EFF] flex items-center justify-center mb-3'>
        <GraduationCap size={26} />
      </div>
      <p className='text-sm font-black text-gray-800 uppercase'>No ward linked yet</p>
      <p className='text-[11px] font-bold text-gray-400 mt-1 max-w-xs mx-auto'>
        {isLive()
          ? 'The academy will link your child to your account. Once linked, their progress, attendance and fees appear here.'
          : 'Sign in with the guardian account the academy created for you to see your ward.'}
      </p>
    </Card>
  )

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
          {dataLoading ? (
            <div className='py-16 flex justify-center'>
              <Loader2 className='animate-spin text-[#002EFF]' />
            </div>
          ) : !ward ? (
            NoWard
          ) : (
            <>
              <section className='relative overflow-hidden bg-[#002EFF] rounded-4xl p-8 text-white shadow-lg'>
                <p className='text-[10px] font-black uppercase tracking-widest text-blue-200 mb-1'>Your Ward</p>
                <h1 className='text-2xl md:text-3xl font-black uppercase italic tracking-tight'>
                  {ward.name}
                </h1>
                <div className='flex items-center gap-2 mt-3 flex-wrap'>
                  <Badge className='bg-[#FCB900] text-[#002EFF] font-black'>{track.label}</Badge>
                  {ward.level && <Badge className='bg-white/15 text-white font-bold'>{ward.level}</Badge>}
                  <Badge className='bg-white/15 text-white font-bold'>
                    {ward.mode === 'physical' ? 'On-Campus' : 'Online'}
                  </Badge>
                  {ward.isPaid && <Badge className='bg-emerald-400/90 text-emerald-950 font-black'>Fees paid</Badge>}
                </div>
                <Target size={150} className='text-white/10 absolute -right-6 -bottom-6 rotate-12 pointer-events-none' />
              </section>

              <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
                <StatTile label='Avg Score' value={perf?.averageScore != null ? `${perf.averageScore}%` : '—'} icon={TrendingUp} tint='bg-blue-50 text-blue-600' />
                <StatTile label='Progress' value={perf ? `${perf.progressPercent}%` : '—'} icon={BookOpen} tint='bg-emerald-50 text-emerald-600' />
                <StatTile label='Attendance' value={perf && perf.totalSessions ? `${perf.attendanceRate}%` : '—'} icon={CalendarCheck} tint='bg-amber-50 text-amber-600' />
                <StatTile label='Fees' value={fee ? (fee.status === 'paid' ? 'Paid' : naira(feeDue)) : '—'} icon={Wallet} tint='bg-rose-50 text-rose-600' />
              </div>

              <Card className='rounded-4xl p-6 bg-white border-none shadow-sm text-center'>
                {!track.hasExam ? (
                  // Programme wards (undergrad / preclinical / after-school) have
                  // no external exam — show their programme, not a countdown.
                  <>
                    <p className='text-[10px] font-black uppercase tracking-widest text-blue-400 mb-3'>
                      Programme
                    </p>
                    <p className='text-base font-black text-gray-800 uppercase leading-none'>
                      {track.fullName}
                    </p>
                    <p className='text-[11px] font-bold text-gray-400 mt-2'>
                      {track.subjectRule}
                    </p>
                  </>
                ) : (
                  <>
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
                  </>
                )}
              </Card>
            </>
          )}
        </div>
      )}

      {view === 'performance' && (
        <div className='space-y-4'>
          <h2 className='text-2xl font-black text-[#002EFF] italic uppercase'>
            {ward ? `${ward.name}'s Performance` : 'Performance'}
          </h2>
          {!ward ? (
            NoWard
          ) : (
            <>
              <div className='grid grid-cols-2 md:grid-cols-3 gap-4'>
                <StatTile label='Avg Score' value={perf?.averageScore != null ? `${perf.averageScore}%` : '—'} icon={TrendingUp} tint='bg-blue-50 text-blue-600' />
                <StatTile label='Course Progress' value={perf ? `${perf.progressPercent}%` : '—'} icon={BookOpen} tint='bg-emerald-50 text-emerald-600' />
                <StatTile label='Attendance' value={perf && perf.totalSessions ? `${perf.attendanceRate}%` : '—'} icon={CalendarCheck} tint='bg-amber-50 text-amber-600' />
              </div>
              <Card className='p-6 rounded-3xl border-none shadow-sm bg-white'>
                <p className='text-[10px] font-black uppercase text-gray-400 mb-3'>Exam readiness</p>
                <div className='h-3 bg-slate-100 rounded-full overflow-hidden'>
                  <div className='h-full bg-linear-to-r from-[#002EFF] to-[#FCB900] rounded-full' style={{ width: `${perf?.averageScore ?? 0}%` }} />
                </div>
                <p className='text-[11px] font-bold text-gray-500 mt-3'>
                  {ward.name.split(' ')[0]} is tracking at {perf?.averageScore ?? 0}% average for {track.fullName}.
                </p>
              </Card>
              {perf && perf.perSubject.length > 0 && (
                <Card className='p-6 rounded-3xl border-none shadow-sm bg-white'>
                  <p className='text-[10px] font-black uppercase text-gray-400 mb-3'>Score by subject</p>
                  <div className='space-y-3'>
                    {perf.perSubject.map((s, i) => (
                      <div key={s.courseId || i} className='flex items-center gap-3'>
                        <span className='w-24 text-[10px] font-black text-gray-600 uppercase text-right truncate'>
                          Subject {i + 1}
                        </span>
                        <div className='flex-1 h-5 bg-slate-100 rounded-lg overflow-hidden'>
                          <div className='h-full bg-[#002EFF] rounded-lg flex items-center justify-end pr-2' style={{ width: `${Math.max(s.average ?? 0, 6)}%` }}>
                            <span className='text-[9px] font-black text-white'>{s.average ?? 0}%</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              )}
            </>
          )}
        </div>
      )}

      {view === 'attendance' && (
        <div className='space-y-4'>
          <h2 className='text-2xl font-black text-[#002EFF] italic uppercase'>Attendance</h2>
          {!ward || !perf ? (
            NoWard
          ) : (
            <>
              <div className='grid grid-cols-3 gap-4'>
                <StatTile label='Rate' value={perf.totalSessions ? `${perf.attendanceRate}%` : '—'} icon={CalendarCheck} tint='bg-blue-50 text-blue-600' />
                <StatTile label='Present' value={perf.present} icon={CheckCircle2} tint='bg-emerald-50 text-emerald-600' />
                <StatTile label='Sessions' value={perf.totalSessions} icon={Timer} tint='bg-amber-50 text-amber-600' />
              </div>
              <Card className='p-6 rounded-3xl border-none shadow-sm bg-white'>
                <p className='text-[11px] font-bold text-gray-500'>
                  {ward.name.split(' ')[0]} has attended <b className='text-gray-800'>{perf.present}</b> of{' '}
                  <b className='text-gray-800'>{perf.totalSessions}</b> class sessions so far.
                </p>
              </Card>
            </>
          )}
        </div>
      )}

      {view === 'countdown' && (
        <div className='space-y-4'>
          <h2 className='text-2xl font-black text-[#002EFF] italic uppercase'>
            {track.hasExam ? 'Exam Countdown' : 'Programme'}
          </h2>
          <Card className='rounded-4xl p-8 bg-[#002EFF] text-white border-none shadow-lg text-center'>
            {!track.hasExam ? (
              <div className='flex flex-col items-center gap-2 py-2'>
                <p className='text-[10px] font-black uppercase tracking-widest text-blue-200'>
                  {ward?.name.split(' ')[0] ?? 'Your ward'}&apos;s programme
                </p>
                <p className='text-xl md:text-2xl font-black uppercase text-[#FCB900] leading-tight'>
                  {track.fullName}
                </p>
                <p className='text-[11px] font-bold text-blue-100 max-w-sm'>
                  {track.subjectRule}. This is a continuous programme — no fixed
                  external exam date.
                </p>
              </div>
            ) : (
              <>
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
              </>
            )}
          </Card>
        </div>
      )}

      {view === 'fees' && (
        <div className='space-y-4'>
          <h2 className='text-2xl font-black text-[#002EFF] italic uppercase'>Fees &amp; Payments</h2>
          {!ward || !fee ? (
            NoWard
          ) : (
            <Card className='p-5 rounded-3xl border-none shadow-sm bg-white flex items-center justify-between gap-3'>
              <div className='flex items-center gap-3 min-w-0'>
                <div className='h-10 w-10 bg-blue-50 rounded-xl flex items-center justify-center text-[#002EFF] shrink-0'>
                  <Receipt size={18} />
                </div>
                <div className='min-w-0'>
                  <p className='text-xs font-black text-gray-800 uppercase'>Portal Access Fee</p>
                  <p className='text-[10px] font-bold text-gray-400 truncate'>
                    {fee.status === 'paid' && paidDate ? `Paid ${paidDate}` : 'Outstanding'}
                    {fee.reference ? ` · ${fee.reference}` : ''}
                  </p>
                </div>
              </div>
              <div className='text-right shrink-0'>
                <p className='text-sm font-black text-gray-800'>{naira(fee.amount)}</p>
                <Badge className={`text-[8px] font-black ${fee.status === 'paid' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-500'}`}>
                  {(fee.status || 'due').toUpperCase()}
                </Badge>
              </div>
            </Card>
          )}
        </div>
      )}
    </DashboardShell>
  )
}
