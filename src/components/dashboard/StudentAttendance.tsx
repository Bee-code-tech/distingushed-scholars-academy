'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  CalendarCheck,
  CheckCircle2,
  XCircle,
  Clock,
  Flame,
  Hand,
  Lock,
} from 'lucide-react'
import {
  STUDENT_ATTENDANCE,
  attendanceRate,
  type AttendanceStatus,
} from '@/lib/attendance'
import {
  getSession,
  getMyCheckIn,
  checkIn,
  formatTime,
  type CheckIn,
  type AttendanceSession,
} from '@/lib/attendanceStore'
import { getUser, getToken } from '@/lib/auth'
import { isDemoToken } from '@/lib/demoAccounts'
import { dsaApi } from '@/lib/api'

const STATUS: Record<
  AttendanceStatus,
  { label: string; icon: typeof CheckCircle2; cls: string; dot: string }
> = {
  present: { label: 'Present', icon: CheckCircle2, cls: 'text-emerald-600', dot: 'bg-emerald-500' },
  late: { label: 'Late', icon: Clock, cls: 'text-amber-600', dot: 'bg-amber-500' },
  absent: { label: 'Absent', icon: XCircle, cls: 'text-rose-500', dot: 'bg-rose-500' },
}

type Day = { date: string; status: AttendanceStatus }

function isLive(): boolean {
  const t = getToken()
  return !!t && !isDemoToken(t)
}

function todayKey(): string {
  return new Date().toISOString().slice(0, 10)
}

function normStatus(s: unknown): AttendanceStatus {
  return s === 'absent' || s === 'late' ? s : 'present'
}

function streakOf(days: Day[]): number {
  let streak = 0
  for (let i = days.length - 1; i >= 0; i--) {
    if (days[i].status === 'absent') break
    streak++
  }
  return streak
}

function Tile({ label, value, tint, icon: Icon }: any) {
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

/**
 * Student attendance — self check-in + own history.
 *
 * Live-first: with a real JWT it reads the backend (GET /attendance/me,
 * /attendance/sessions/current) and checks in via POST /attendance/check-in
 * (docs/attendance.md). On demo/offline it falls back to the local store and
 * the mock history so the preview still works.
 */
export default function StudentAttendance() {
  const mockDays: Day[] = STUDENT_ATTENDANCE
  const [days, setDays] = useState<Day[]>(mockDays)
  const [stats, setStats] = useState(() => {
    const present = mockDays.filter((d) => d.status === 'present').length
    const absent = mockDays.filter((d) => d.status === 'absent').length
    return { rate: attendanceRate(mockDays), present, absent }
  })

  // Self check-in state — loaded on the client to avoid hydration mismatch.
  const [session, setSession] = useState<AttendanceSession>({
    active: false,
    date: null,
    activatedAt: null,
  })
  const [me, setMe] = useState<{ key: string; name: string } | null>(null)
  const [myCheckIn, setMyCheckIn] = useState<CheckIn | null>(null)
  const [busy, setBusy] = useState(false)

  const applyMe = useCallback((data: Record<string, unknown>, name: string) => {
    const records = Array.isArray(data.records)
      ? (data.records as Record<string, unknown>[])
      : []
    const mapped: Day[] = records.map((r) => ({
      date: String(r.date ?? ''),
      status: normStatus(r.status),
    }))
    const present = Number(data.present ?? mapped.filter((d) => d.status === 'present').length)
    const total = Number(data.total ?? mapped.length)
    const rate = Number(data.rate ?? (total ? Math.round((present / total) * 100) : 0))
    if (mapped.length) setDays(mapped)
    setStats({ rate, present, absent: Math.max(0, total - present) })
    const today = records.find((r) => String(r.date) === todayKey() && normStatus(r.status) === 'present')
    if (today) setMyCheckIn({ key: '', name, at: String(today.at ?? '') })
  }, [])

  const load = useCallback(async () => {
    const u = getUser()
    const key = u?.username || u?.email || 'student'
    const name = u?.fullName || u?.username || 'Student'
    setMe({ key, name })

    if (isLive()) {
      try {
        const [cur, mine] = await Promise.all([
          dsaApi.attendance.current(),
          dsaApi.attendance.me(),
        ])
        const c = (cur ?? {}) as Record<string, unknown>
        setSession({
          active: !!c.active,
          date: (c.date as string) ?? null,
          activatedAt: (c.activatedAt as string) ?? null,
        })
        applyMe((mine ?? {}) as Record<string, unknown>, name)
        return
      } catch {
        // fall through to local store
      }
    }
    setSession(getSession())
    setMyCheckIn(getMyCheckIn(key))
  }, [applyMe])

  useEffect(() => {
    void load()
  }, [load])

  const markPresent = async () => {
    if (!me || busy) return
    setBusy(true)
    try {
      if (isLive()) {
        try {
          const res = (await dsaApi.attendance.checkIn()) as Record<string, unknown>
          setMyCheckIn({ key: me.key, name: me.name, at: String(res.at ?? new Date().toISOString()) })
          // refresh stats/history after a successful check-in
          try {
            const mine = (await dsaApi.attendance.me()) as Record<string, unknown>
            applyMe(mine, me.name)
          } catch {
            /* keep optimistic state */
          }
          return
        } catch {
          // if the backend is unreachable, fall back to a local check-in
        }
      }
      const entry = checkIn(me.key, me.name)
      if (entry) setMyCheckIn(entry)
      setSession(getSession())
    } finally {
      setBusy(false)
    }
  }

  const { rate, present, absent } = stats
  const streak = streakOf(days)

  return (
    <div className='space-y-6 max-w-4xl mx-auto'>
      <div>
        <h2 className='text-2xl font-black text-[#002EFF] italic uppercase flex items-center gap-2'>
          <CalendarCheck size={24} /> My Attendance
        </h2>
        <p className='text-[10px] font-bold text-gray-400 uppercase tracking-widest'>
          Mark yourself present when attendance is open
        </p>
      </div>

      {/* Self check-in */}
      {myCheckIn ? (
        <Card className='rounded-3xl border-none shadow-sm bg-emerald-500 text-white p-6 flex items-center gap-4'>
          <div className='h-12 w-12 rounded-2xl bg-white/20 flex items-center justify-center'>
            <CheckCircle2 size={26} />
          </div>
          <div>
            <p className='text-sm font-black uppercase'>You&apos;re marked present</p>
            <p className='text-[11px] font-bold text-emerald-50'>
              Checked in today at {formatTime(myCheckIn.at)}
            </p>
          </div>
        </Card>
      ) : session.active ? (
        <Card className='rounded-3xl border-none shadow-lg bg-[#002EFF] text-white p-6 text-center'>
          <div className='h-12 w-12 mx-auto rounded-2xl bg-white/15 flex items-center justify-center mb-3'>
            <Hand size={24} className='text-[#FCB900]' />
          </div>
          <h3 className='text-sm font-black uppercase'>Attendance is open</h3>
          <p className='text-[11px] font-medium text-blue-100 mt-1'>
            Tap below to mark yourself present. Your time will be recorded.
          </p>
          <button
            onClick={markPresent}
            disabled={busy}
            className='mt-4 inline-flex items-center gap-2 px-8 h-11 bg-[#FCB900] text-[#002EFF] rounded-xl font-black text-[11px] uppercase shadow-lg hover:brightness-105 active:scale-95 transition-all disabled:opacity-60'
          >
            <CheckCircle2 size={15} /> {busy ? 'Marking…' : 'Mark Me Present'}
          </button>
        </Card>
      ) : (
        <Card className='rounded-3xl border-none shadow-sm bg-white p-6 flex items-center gap-4'>
          <div className='h-12 w-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center'>
            <Lock size={22} />
          </div>
          <div>
            <p className='text-sm font-black text-gray-800 uppercase'>Attendance not open yet</p>
            <p className='text-[11px] font-bold text-gray-400'>
              Your tutor will activate attendance for today. Check back then.
            </p>
          </div>
        </Card>
      )}

      <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
        <Tile label='Attendance Rate' value={`${rate}%`} tint='bg-blue-50 text-blue-600' icon={CalendarCheck} />
        <Tile label='Present' value={present} tint='bg-emerald-50 text-emerald-600' icon={CheckCircle2} />
        <Tile label='Absent' value={absent} tint='bg-rose-50 text-rose-500' icon={XCircle} />
        <Tile label='Streak' value={`${streak} days`} tint='bg-amber-50 text-amber-600' icon={Flame} />
      </div>

      <Card className='rounded-3xl border-none shadow-sm bg-white overflow-hidden'>
        <div className='px-5 py-3 bg-slate-50 flex items-center justify-between'>
          <span className='text-[10px] font-black uppercase text-gray-400'>Recent Days</span>
          <span className='text-[10px] font-black uppercase text-gray-400'>Status</span>
        </div>
        {days.length === 0 ? (
          <div className='px-5 py-8 text-center text-[11px] font-bold text-slate-400'>
            No attendance recorded yet.
          </div>
        ) : (
          [...days].reverse().map((d, i) => {
            const s = STATUS[d.status]
            const Icon = s.icon
            return (
              <div key={i} className='flex items-center justify-between px-5 py-3.5 border-t border-slate-50'>
                <div className='flex items-center gap-3'>
                  <span className={`h-2 w-2 rounded-full ${s.dot}`} />
                  <span className='text-xs font-black text-gray-700'>{d.date}</span>
                </div>
                <Badge className={`bg-transparent ${s.cls} text-[10px] font-black flex items-center gap-1`}>
                  <Icon size={13} /> {s.label}
                </Badge>
              </div>
            )
          })
        )}
      </Card>
    </div>
  )
}
