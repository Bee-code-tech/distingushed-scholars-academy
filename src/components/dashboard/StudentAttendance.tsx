'use client'

import { useState, useEffect } from 'react'
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
import { getUser } from '@/lib/auth'

const STATUS: Record<
  AttendanceStatus,
  { label: string; icon: typeof CheckCircle2; cls: string; dot: string }
> = {
  present: { label: 'Present', icon: CheckCircle2, cls: 'text-emerald-600', dot: 'bg-emerald-500' },
  late: { label: 'Late', icon: Clock, cls: 'text-amber-600', dot: 'bg-amber-500' },
  absent: { label: 'Absent', icon: XCircle, cls: 'text-rose-500', dot: 'bg-rose-500' },
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

export default function StudentAttendance() {
  const days = STUDENT_ATTENDANCE
  const rate = attendanceRate(days)
  const present = days.filter((d) => d.status === 'present').length
  const absent = days.filter((d) => d.status === 'absent').length
  let streak = 0
  for (let i = days.length - 1; i >= 0; i--) {
    if (days[i].status === 'absent') break
    streak++
  }

  // Self check-in state — loaded on the client to avoid hydration mismatch.
  const [session, setSession] = useState<AttendanceSession>({
    active: false,
    date: null,
    activatedAt: null,
  })
  const [me, setMe] = useState<{ key: string; name: string } | null>(null)
  const [myCheckIn, setMyCheckIn] = useState<CheckIn | null>(null)

  useEffect(() => {
    const u = getUser()
    const key = u?.username || u?.email || 'student'
    const name = u?.fullName || u?.username || 'Student'
    setMe({ key, name })
    setSession(getSession())
    setMyCheckIn(getMyCheckIn(key))
  }, [])

  const markPresent = () => {
    if (!me) return
    const entry = checkIn(me.key, me.name)
    if (entry) setMyCheckIn(entry)
    setSession(getSession())
  }

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
            className='mt-4 inline-flex items-center gap-2 px-8 h-11 bg-[#FCB900] text-[#002EFF] rounded-xl font-black text-[11px] uppercase shadow-lg hover:brightness-105 active:scale-95 transition-all'
          >
            <CheckCircle2 size={15} /> Mark Me Present
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
        {[...days].reverse().map((d, i) => {
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
        })}
      </Card>
    </div>
  )
}
