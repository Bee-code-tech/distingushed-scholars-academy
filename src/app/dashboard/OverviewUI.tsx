'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Timer,
  Zap,
  Trophy,
  CheckCircle2,
  Flame,
  Target,
  MapPin,
  Video,
  CalendarClock,
  CalendarCheck,
} from 'lucide-react'
import {
  examCountdown,
  DEPARTMENT_LABELS,
  type StudentProfile,
  type Countdown,
} from '@/lib/studentProfile'
import { getMeetLink } from '@/lib/liveClass'
import {
  getEffectiveTimetable,
  getNextClass,
  gridFromApi,
  type NextClass,
} from '@/lib/timetable'
import { getToken } from '@/lib/auth'
import { isDemoToken } from '@/lib/demoAccounts'
import { dsaApi } from '@/lib/api'

interface OverviewUIProps {
  setView: (view: any) => void
  isDSAite: boolean
  student: StudentProfile
}

function isLive(): boolean {
  const t = getToken()
  return !!t && !isDemoToken(t)
}

// Consecutive most-recent sessions the student was marked present.
function currentStreak(records: { date?: string; status?: string }[]): number {
  const sorted = [...records].sort((a, b) =>
    String(a.date).localeCompare(String(b.date)),
  )
  let s = 0
  for (let i = sorted.length - 1; i >= 0; i--) {
    if (sorted[i].status === 'present') s++
    else break
  }
  return s
}

function SmallStat({ label, value, icon: Icon, color }: any) {
  return (
    <Card className='p-3 rounded-2xl border-none shadow-sm bg-white flex items-center gap-3'>
      <div
        className={`h-9 w-9 bg-blue-50/50 ${color} rounded-xl flex items-center justify-center shrink-0 shadow-inner`}
      >
        <Icon size={18} strokeWidth={3} />
      </div>
      <div>
        <p className='text-[8px] font-black text-gray-400 uppercase leading-none mb-0.5'>
          {label}
        </p>
        <p className='text-xs font-black text-gray-900 leading-none'>{value}</p>
      </div>
    </Card>
  )
}

/**
 * Mode-specific card. Physical students see their next on-campus class + venue;
 * online students get a live-class join card. Same slot, different content.
 */
function ModeCard({ student }: { student: StudentProfile }) {
  // Google Meet link + next class (client-only to avoid a hydration mismatch —
  // getNextClass reads the current time). Live-first: a real JWT reads the live
  // timetable (GET /timetable/:track) for the next class and GET
  // /live-classes/next for the Meet link + join state; demo/offline falls back
  // to the local stores.
  const [meetLink, setMeetLink] = useState('')
  const [canJoin, setCanJoin] = useState(false)
  const [live, setLive] = useState(false)
  const [next, setNext] = useState<NextClass | null>(null)
  useEffect(() => {
    let cancelled = false
    const local = () => {
      if (cancelled) return
      setMeetLink(getMeetLink(student.track))
      setCanJoin(false)
      setLive(false)
      setNext(
        getNextClass(getEffectiveTimetable(student.track, student.department)),
      )
    }
    const t = getToken()
    if (t && !isDemoToken(t)) {
      Promise.allSettled([
        dsaApi.timetable.get(student.track),
        dsaApi.liveClasses.next(student.track),
      ])
        .then(([tt, lc]) => {
          if (cancelled) return
          setLive(true)
          const apiGrid =
            tt.status === 'fulfilled'
              ? (tt.value as { grid?: unknown })?.grid
              : undefined
          setNext(
            getNextClass(
              Array.isArray(apiGrid)
                ? gridFromApi(apiGrid)
                : getEffectiveTimetable(student.track, student.department),
            ),
          )
          const d =
            lc.status === 'fulfilled' && lc.value && typeof lc.value === 'object'
              ? (lc.value as { meetLink?: string; canJoin?: boolean })
              : null
          setMeetLink(d?.meetLink || '')
          setCanJoin(!!d?.canJoin)
        })
        .catch(local)
    } else local()
    return () => {
      cancelled = true
    }
  }, [student.track, student.department])

  const title = next ? `${next.subject}` : 'No class scheduled'
  const timing = next ? `${next.when} · ${next.time}` : 'Check your timetable'
  // Live: the backend decides join state (status === "live" and a link exists).
  // Local fallback: any known link is joinable, as before.
  const joinable = live ? canJoin : !!meetLink
  const linkUploadedNotLive = live && !!meetLink && !canJoin

  if (student.mode === 'physical') {
    return (
      <Card className='rounded-4xl p-6 bg-white border-none shadow-sm flex flex-col justify-between'>
        <div className='flex items-center justify-between mb-4'>
          <p className='text-[10px] font-black uppercase tracking-widest text-blue-400'>
            Next Campus Class
          </p>
          <Badge className='bg-emerald-50 text-emerald-600 text-[8px] font-black'>
            ON-CAMPUS
          </Badge>
        </div>
        <div className='space-y-1'>
          <h3 className='text-lg font-black text-gray-900 uppercase leading-tight'>
            {title}
          </h3>
          <div className='flex items-center gap-2 text-gray-400'>
            <CalendarClock size={13} />
            <span className='text-[11px] font-bold'>{timing}</span>
          </div>
          <div className='flex items-center gap-2 text-gray-400'>
            <MapPin size={13} />
            <span className='text-[11px] font-bold'>DSA Campus</span>
          </div>
        </div>
        <div className='mt-4 flex items-center justify-between p-3 bg-blue-50/60 rounded-2xl'>
          <div>
            <p className='text-[8px] font-black text-blue-400 uppercase leading-none'>
              Attendance
            </p>
            <p className='text-sm font-black text-[#002EFF] mt-0.5'>
              18 / 20 classes
            </p>
          </div>
          <div className='flex items-center gap-1 text-emerald-500'>
            <Flame size={14} />
            <span className='text-xs font-black'>90%</span>
          </div>
        </div>
      </Card>
    )
  }

  return (
    <Card className='rounded-4xl p-6 bg-white border-none shadow-sm flex flex-col justify-between'>
      <div className='flex items-center justify-between mb-4'>
        <p className='text-[10px] font-black uppercase tracking-widest text-blue-400'>
          Next Live Class
        </p>
        <Badge className='bg-rose-50 text-rose-500 text-[8px] font-black animate-pulse'>
          ONLINE
        </Badge>
      </div>
      <div className='space-y-1'>
        <h3 className='text-lg font-black text-gray-900 uppercase leading-tight'>
          {title}
        </h3>
        <div className='flex items-center gap-2 text-gray-400'>
          <CalendarClock size={13} />
          <span className='text-[11px] font-bold'>{timing} (WAT)</span>
        </div>
        <div className='flex items-center gap-2 text-gray-400'>
          <Video size={13} />
          <span className='text-[11px] font-bold'>
            {meetLink ? 'Live on Google Meet' : 'Live on DSA Portal'}
          </span>
        </div>
      </div>
      {joinable ? (
        <a
          href={meetLink}
          target='_blank'
          rel='noopener noreferrer'
          className='mt-4 flex items-center justify-center bg-[#002EFF] text-white font-black rounded-xl text-[10px] h-10 shadow-lg shadow-blue-200 active:scale-95 transition-transform hover:bg-blue-700'
        >
          JOIN LIVE CLASS <Video className='ml-2' size={14} />
        </a>
      ) : (
        <Button
          disabled
          className='mt-4 bg-slate-200 text-slate-400 font-black rounded-xl text-[10px] h-10 cursor-not-allowed'
        >
          {linkUploadedNotLive ? 'WAITING TO GO LIVE' : 'LINK NOT SET YET'}
          <Video className='ml-2' size={14} />
        </Button>
      )}
    </Card>
  )
}

export default function OverviewUI({
  setView,
  isDSAite,
  student,
}: OverviewUIProps) {
  const { trackConfig, modeConfig } = student
  const ModeIcon = modeConfig.icon

  // Start with a static value so the server-rendered HTML matches the first
  // client render (examCountdown uses Date.now(), which would otherwise differ
  // by a second and cause a hydration mismatch). The real value is computed on
  // the client in the effect below.
  const [time, setTime] = useState<Countdown>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    elapsed: false,
  })

  // Real performance figures (null until loaded / for demo sessions).
  const [perf, setPerf] = useState<{
    avg: number | null
    progress: number
    rate: number
    present: number
    total: number
  } | null>(null)
  const [streak, setStreak] = useState(0)

  useEffect(() => {
    setTime(examCountdown(trackConfig.nextExamDate))
    const id = setInterval(
      () => setTime(examCountdown(trackConfig.nextExamDate)),
      1000,
    )
    return () => clearInterval(id)
  }, [trackConfig.nextExamDate])

  useEffect(() => {
    if (!isLive()) return
    let cancelled = false
    ;(async () => {
      try {
        const [a, me] = await Promise.all([
          dsaApi.analytics.me() as Promise<Record<string, unknown>>,
          dsaApi.attendance.me() as Promise<Record<string, unknown>>,
        ])
        if (cancelled) return
        setPerf({
          avg: typeof a.averageScore === 'number' ? a.averageScore : null,
          progress: typeof a.progressPercent === 'number' ? a.progressPercent : 0,
          rate: typeof a.attendanceRate === 'number' ? a.attendanceRate : 0,
          present: typeof a.present === 'number' ? a.present : 0,
          total: typeof a.totalSessions === 'number' ? a.totalSessions : 0,
        })
        const recs = Array.isArray(me.records)
          ? (me.records as { date?: string; status?: string }[])
          : []
        setStreak(currentStreak(recs))
      } catch {
        /* leave figures blank */
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div className='space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500 max-w-6xl mx-auto'>
      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
        {/* --- MAIN WELCOME BANNER --- */}
        <section className='lg:col-span-2 relative overflow-hidden bg-[#002EFF] rounded-4xl p-8 text-white shadow-lg'>
          <div className='relative z-10 space-y-4'>
            <div className='flex items-center gap-2'>
              {streak > 0 && (
                <Badge className='bg-[#FCB900] text-[#002EFF] hover:bg-[#FCB900] border-none font-black px-3 py-1'>
                  <Flame size={12} className='mr-1 fill-[#002EFF]' /> {streak} DAY
                  STREAK
                </Badge>
              )}
              <Badge className='bg-white/15 text-white border-none font-bold px-3 py-1'>
                <ModeIcon size={11} className='mr-1' />
                {modeConfig.label}
              </Badge>
              {student.department && (
                <Badge className='bg-white/15 text-white border-none font-bold px-3 py-1'>
                  {DEPARTMENT_LABELS[student.department]}
                </Badge>
              )}
              {!trackConfig.hasExam && student.yearLabel && (
                <Badge className='bg-white/15 text-white border-none font-bold px-3 py-1'>
                  {student.yearLabel}
                </Badge>
              )}
            </div>
            <h1 className='text-3xl md:text-4xl font-black uppercase italic tracking-tight'>
              {trackConfig.hasExam ? (
                <>
                  Road to{' '}
                  <span className='text-[#FCB900]'>{trackConfig.label}</span>
                </>
              ) : (
                <span className='text-[#FCB900]'>{trackConfig.fullName}</span>
              )}
            </h1>
            <p className='text-blue-100 text-xs md:text-sm max-w-sm font-medium'>
              &ldquo;{trackConfig.tagline}&rdquo;
            </p>
            <div className='flex gap-3'>
              <Button
                onClick={() => setView('attendance')}
                className='bg-[#FCB900] text-[#002EFF] font-black rounded-xl text-[10px] px-8 h-10 shadow-lg shadow-yellow-400/20 active:scale-95 transition-transform'
              >
                VIEW ATTENDANCE <CalendarCheck className='ml-2' size={14} />
              </Button>

              {isDSAite && (
                <Badge
                  variant='outline'
                  className='border-white/20 text-white font-bold px-4'
                >
                  PRO MEMBER
                </Badge>
              )}
            </div>
          </div>
          <Target
            size={180}
            className='text-white/10 absolute -right-8 -bottom-8 rotate-12 pointer-events-none'
          />
        </section>

        {/* --- DYNAMIC COUNTDOWN / PROGRAMME CARD --- */}
        <Card className='rounded-4xl p-6 bg-white border-none shadow-sm flex flex-col items-center justify-center text-center overflow-hidden'>
          {!trackConfig.hasExam ? (
            // Programme tracks (undergrad / preclinical / after-school) have no
            // external exam — show the programme + year focus, not a countdown.
            <div className='flex flex-col items-center gap-2 py-2'>
              <p className='text-[10px] font-black uppercase tracking-widest text-blue-400'>
                {trackConfig.examLabel} FOCUS
              </p>
              <div className='h-14 w-14 rounded-2xl bg-blue-50 flex items-center justify-center my-1'>
                <trackConfig.icon
                  size={26}
                  className='text-[#002EFF]'
                  strokeWidth={2.2}
                />
              </div>
              <p className='text-base font-black text-gray-800 uppercase leading-none'>
                {student.yearLabel ?? trackConfig.label}
              </p>
              <p className='text-[10px] font-bold text-gray-400 max-w-[190px]'>
                {trackConfig.subjectRule}
              </p>
            </div>
          ) : (
            <>
              <p className='text-[10px] font-black uppercase tracking-widest text-blue-400 mb-4'>
                {trackConfig.examLabel} COUNTDOWN
              </p>

              {time.elapsed ? (
            <div className='flex flex-col items-center gap-2 py-3'>
              <CheckCircle2 size={36} className='text-emerald-500' />
              <p className='text-sm font-black text-gray-800 uppercase'>
                Exam period is here
              </p>
              <p className='text-[10px] font-bold text-gray-400 max-w-[180px]'>
                Best of luck in your {trackConfig.fullName}. Keep revising with
                past questions.
              </p>
            </div>
          ) : (
            <div className='flex items-center gap-1.5'>
              <div className='flex flex-col items-center'>
                <span className='text-4xl font-black text-[#002EFF] tracking-tighter tabular-nums'>
                  {time.days}
                </span>
                <span className='text-[7px] font-bold text-gray-400'>DAYS</span>
              </div>
              <span className='text-xl font-black text-gray-200 pb-4'>:</span>
              <div className='flex flex-col items-center'>
                <span className='text-4xl font-black text-[#002EFF] tracking-tighter tabular-nums'>
                  {String(time.hours).padStart(2, '0')}
                </span>
                <span className='text-[7px] font-bold text-gray-400'>HRS</span>
              </div>
              <span className='text-xl font-black text-gray-200 pb-4'>:</span>
              <div className='flex flex-col items-center'>
                <span className='text-4xl font-black text-[#002EFF] tracking-tighter tabular-nums'>
                  {String(time.minutes).padStart(2, '0')}
                </span>
                <span className='text-[7px] font-bold text-gray-400'>MIN</span>
              </div>
              <span className='text-xl font-black text-gray-200 pb-4'>:</span>
              <div className='flex flex-col items-center'>
                <span className='text-4xl font-black text-[#FCB900] tracking-tighter tabular-nums'>
                  {String(time.seconds).padStart(2, '0')}
                </span>
                <span className='text-[7px] font-bold text-gray-400'>SEC</span>
              </div>
            </div>
              )}
            </>
          )}
        </Card>
      </div>

      {/* --- MODE-SPECIFIC + STATS --- */}
      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
        <ModeCard student={student} />

        <div className='lg:col-span-2 grid grid-cols-2 gap-4 content-start'>
          <SmallStat
            label='Avg Score'
            value={perf?.avg != null ? `${perf.avg}%` : '—'}
            icon={Timer}
            color='text-blue-600'
          />
          <SmallStat
            label='Progress'
            value={perf ? `${perf.progress}%` : '—'}
            icon={Zap}
            color='text-yellow-500'
          />
          <SmallStat
            label='Attendance'
            value={perf && perf.total ? `${perf.rate}%` : '—'}
            icon={CheckCircle2}
            color='text-emerald-500'
          />
          <SmallStat
            label='Present'
            value={perf ? `${perf.present}/${perf.total}` : '—'}
            icon={CalendarCheck}
            color='text-orange-500'
          />
          <Card className='col-span-2 p-4 rounded-2xl border border-blue-50 bg-blue-50/40 flex items-center gap-3'>
            <div className='h-9 w-9 bg-white rounded-xl flex items-center justify-center shrink-0 text-[#002EFF] shadow-sm'>
              <trackConfig.icon size={18} strokeWidth={2.5} />
            </div>
            <div>
              <p className='text-[8px] font-black text-blue-400 uppercase leading-none mb-0.5'>
                Your Track
              </p>
              <p className='text-[11px] font-black text-gray-800 leading-none'>
                {trackConfig.fullName}
                {student.department
                  ? ` · ${DEPARTMENT_LABELS[student.department]} Department`
                  : ` · ${trackConfig.subjectRule}`}
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
