'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  CalendarCheck,
  Power,
  CheckCircle2,
  Clock,
  RefreshCw,
  Users,
  PowerOff,
} from 'lucide-react'
import {
  getSession,
  activateAttendance,
  closeAttendance,
  getTodayCheckIns,
  formatTime,
  type AttendanceSession,
  type CheckIn,
} from '@/lib/attendanceStore'
import { getStudents } from '@/lib/studentsStore'

/**
 * Tutor/admin attendance control.
 *
 * The tutor/admin ACTIVATES attendance for the day; students then mark
 * themselves present from their own dashboard. This screen shows who has
 * checked in and at what time — it does not mark students manually
 * (students self-mark from their own dashboard).
 */
export default function TakeAttendance() {
  const [session, setSession] = useState<AttendanceSession>({
    active: false,
    date: null,
    activatedAt: null,
  })
  const [checkIns, setCheckIns] = useState<CheckIn[]>([])
  const [expected, setExpected] = useState(0)

  const refresh = () => {
    setSession(getSession())
    setCheckIns(getTodayCheckIns())
    setExpected(getStudents().length)
  }
  useEffect(refresh, [])

  const dateLabel = new Date().toLocaleDateString('en-NG', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })

  const activate = () => {
    activateAttendance()
    refresh()
  }
  const close = () => {
    closeAttendance()
    refresh()
  }

  return (
    <div className='space-y-6 max-w-3xl mx-auto'>
      <div className='flex items-center justify-between'>
        <div>
          <h2 className='text-2xl font-black text-[#002EFF] italic uppercase flex items-center gap-2'>
            <CalendarCheck size={24} /> Attendance
          </h2>
          <p className='text-[10px] font-bold text-gray-400 uppercase tracking-widest'>
            {dateLabel}
          </p>
        </div>
        <Badge
          className={`text-[9px] font-black ${session.active ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}
        >
          {session.active ? 'ACTIVE TODAY' : 'NOT ACTIVATED'}
        </Badge>
      </div>

      {!session.active ? (
        <Card className='rounded-3xl border-none shadow-sm bg-white p-8 text-center'>
          <div className='h-14 w-14 mx-auto rounded-2xl bg-blue-50 text-[#002EFF] flex items-center justify-center mb-4'>
            <Power size={26} />
          </div>
          <h3 className='text-sm font-black text-gray-800 uppercase'>
            Activate today&apos;s attendance
          </h3>
          <p className='text-[11px] font-medium text-gray-500 mt-1 max-w-sm mx-auto'>
            Once you activate, students can mark themselves present from their own
            dashboard. Do this once each day.
          </p>
          <button
            onClick={activate}
            className='mt-5 inline-flex items-center gap-2 px-6 h-11 bg-[#002EFF] text-white rounded-xl font-black text-[11px] uppercase shadow-lg shadow-blue-200 hover:bg-blue-700 active:scale-95 transition-all'
          >
            <Power size={15} /> Activate Attendance
          </button>
        </Card>
      ) : (
        <>
          <Card className='rounded-3xl border-none shadow-sm bg-[#002EFF] text-white p-5'>
            <div className='flex items-center justify-between'>
              <div className='flex items-center gap-3'>
                <div className='h-10 w-10 rounded-xl bg-white/15 flex items-center justify-center'>
                  <CheckCircle2 size={20} className='text-[#FCB900]' />
                </div>
                <div>
                  <p className='text-[10px] font-black uppercase tracking-widest text-blue-200'>
                    Attendance is open
                  </p>
                  <p className='text-xs font-bold'>
                    Students can now mark themselves present
                    {session.activatedAt
                      ? ` · opened ${formatTime(session.activatedAt)}`
                      : ''}
                  </p>
                </div>
              </div>
              <button
                onClick={close}
                className='flex items-center gap-1 px-3 h-9 rounded-xl bg-white/10 hover:bg-white/20 text-[10px] font-black uppercase transition-all'
              >
                <PowerOff size={13} /> Close
              </button>
            </div>
          </Card>

          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-2 text-gray-500'>
              <Users size={15} />
              <span className='text-[11px] font-black uppercase'>
                {checkIns.length}/{expected} checked in
              </span>
            </div>
            <button
              onClick={refresh}
              className='flex items-center gap-1 text-[10px] font-black uppercase text-[#002EFF] hover:underline'
            >
              <RefreshCw size={12} /> Refresh
            </button>
          </div>

          <Card className='rounded-3xl border-none shadow-sm bg-white overflow-hidden'>
            {checkIns.length === 0 ? (
              <div className='p-8 text-center'>
                <Clock size={26} className='text-slate-300 mx-auto mb-2' />
                <p className='text-[11px] font-bold text-slate-400'>
                  No check-ins yet. Students will appear here as they mark
                  themselves present.
                </p>
              </div>
            ) : (
              checkIns.map((c) => (
                <div
                  key={c.key}
                  className='flex items-center justify-between px-5 py-3.5 border-t border-slate-50 first:border-t-0'
                >
                  <div className='flex items-center gap-3'>
                    <div className='h-9 w-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-xs font-black'>
                      {c.name.charAt(0)}
                    </div>
                    <p className='text-xs font-black text-gray-800'>{c.name}</p>
                  </div>
                  <Badge className='bg-emerald-50 text-emerald-600 text-[10px] font-black flex items-center gap-1'>
                    <CheckCircle2 size={13} /> {formatTime(c.at)}
                  </Badge>
                </div>
              ))
            )}
          </Card>
        </>
      )}
    </div>
  )
}
