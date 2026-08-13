'use client'

import { useState, useEffect, useCallback } from 'react'
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
import { dsaApi } from '@/lib/api'
import { getToken } from '@/lib/auth'
import { isDemoToken } from '@/lib/demoAccounts'

/** Live path = a real (non-demo) JWT is present; otherwise we run on the
 *  browser-local attendance store so the preview still works offline/demo. */
function isLive(): boolean {
  const t = getToken()
  return !!t && !isDemoToken(t)
}

function todayKey(): string {
  return new Date().toISOString().slice(0, 10)
}

/** Normalise a check-in row from the API to the component's CheckIn shape. */
function mapApiCheckIn(row: Record<string, unknown>): CheckIn {
  return {
    key: String(row.studentId ?? row.id ?? row.studentCode ?? ''),
    name: String(row.fullname ?? row.name ?? 'Student'),
    at: String(row.at ?? ''),
  }
}

/**
 * Tutor/admin attendance control.
 *
 * The tutor/admin ACTIVATES attendance for the day; students then mark
 * themselves present from their own dashboard. This screen shows who has
 * checked in and at what time — it does not mark students manually
 * (students self-mark from their own dashboard).
 *
 * Live-first: with a real JWT it drives the backend attendance API
 * (docs/attendance.md); on demo/offline it falls back to the local store.
 */
export default function TakeAttendance() {
  const [session, setSession] = useState<AttendanceSession>({
    active: false,
    date: null,
    activatedAt: null,
  })
  const [checkIns, setCheckIns] = useState<CheckIn[]>([])
  const [expected, setExpected] = useState(0)
  const [source, setSource] = useState<'live' | 'local'>('local')
  const [busy, setBusy] = useState(false)

  const refresh = useCallback(async () => {
    setExpected(getStudents().length)
    if (isLive()) {
      try {
        const [cur, rows] = await Promise.all([
          dsaApi.attendance.current(),
          dsaApi.attendance.checkIns(),
        ])
        const c = (cur ?? {}) as Record<string, unknown>
        setSession({
          active: !!c.active,
          date: (c.date as string) ?? null,
          activatedAt: (c.activatedAt as string) ?? null,
        })
        setCheckIns((rows as Record<string, unknown>[]).map(mapApiCheckIn))
        setSource('live')
        return
      } catch {
        // fall through to local store on any API/connectivity error
      }
    }
    setSession(getSession())
    setCheckIns(getTodayCheckIns())
    setSource('local')
  }, [])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const dateLabel = new Date().toLocaleDateString('en-NG', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })

  const activate = async () => {
    if (busy) return
    setBusy(true)
    try {
      if (isLive()) {
        try {
          await dsaApi.attendance.activate({})
        } catch {
          activateAttendance()
        }
      } else {
        activateAttendance()
      }
      await refresh()
    } finally {
      setBusy(false)
    }
  }

  const close = async () => {
    if (busy) return
    setBusy(true)
    try {
      if (isLive()) {
        try {
          await dsaApi.attendance.close(session.date ?? todayKey())
        } catch {
          closeAttendance()
        }
      } else {
        closeAttendance()
      }
      await refresh()
    } finally {
      setBusy(false)
    }
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
        <div className='flex items-center gap-2'>
          <Badge
            className={`text-[9px] font-black ${source === 'live' ? 'bg-blue-50 text-[#002EFF]' : 'bg-slate-100 text-slate-400'}`}
          >
            {source === 'live' ? 'LIVE' : 'LOCAL'}
          </Badge>
          <Badge
            className={`text-[9px] font-black ${session.active ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}
          >
            {session.active ? 'ACTIVE TODAY' : 'NOT ACTIVATED'}
          </Badge>
        </div>
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
            disabled={busy}
            className='mt-5 inline-flex items-center gap-2 px-6 h-11 bg-[#002EFF] text-white rounded-xl font-black text-[11px] uppercase shadow-lg shadow-blue-200 hover:bg-blue-700 active:scale-95 transition-all disabled:opacity-60'
          >
            <Power size={15} /> {busy ? 'Activating…' : 'Activate Attendance'}
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
                disabled={busy}
                className='flex items-center gap-1 px-3 h-9 rounded-xl bg-white/10 hover:bg-white/20 text-[10px] font-black uppercase transition-all disabled:opacity-60'
              >
                <PowerOff size={13} /> {busy ? '…' : 'Close'}
              </button>
            </div>
          </Card>

          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-2 text-gray-500'>
              <Users size={15} />
              <span className='text-[11px] font-black uppercase'>
                {checkIns.length}
                {expected ? `/${expected}` : ''} checked in
              </span>
            </div>
            <button
              onClick={() => void refresh()}
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
              checkIns.map((c, i) => (
                <div
                  key={c.key || i}
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
