'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  LayoutDashboard,
  CreditCard,
  CalendarDays,
  CalendarCheck,
  Users,
  Megaphone,
  BarChart3,
  Loader2,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Lock,
  Send,
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import DashboardShell, {
  type NavItem,
} from '@/components/dashboard/DashboardShell'
import { useDashboardSession } from '@/components/dashboard/useDashboardSession'
import { useTabState } from '@/components/dashboard/useTabState'
import TakeAttendance from '@/components/dashboard/TakeAttendance'
import TimetableEditor from '@/components/dashboard/TimetableEditor'
import { getStudents, type StoredStudent } from '@/lib/studentsStore'
import {
  getRole,
  getPermissionsForStaff,
  permissionLabel,
} from '@/lib/staffStore'
import {
  DAYS,
  SLOTS,
  getEffectiveTimetable,
  tintForSubject,
  type TimetableGrid,
} from '@/lib/timetable'
import type { ExamTrack } from '@/lib/studentProfile'

// --- manual-payment status (browser-local stand-in for POST /api/payments/manual) ---
interface ManualPayment {
  method: string
  reference: string
  by: string
  at: string
}
const PAY_KEY = 'dsa_manual_payments'
function readPayments(): Record<string, ManualPayment> {
  if (typeof window === 'undefined') return {}
  try {
    return JSON.parse(localStorage.getItem(PAY_KEY) || '{}')
  } catch {
    return {}
  }
}
function savePayment(key: string, p: ManualPayment | null) {
  const all = readPayments()
  if (p) all[key] = p
  else delete all[key]
  localStorage.setItem(PAY_KEY, JSON.stringify(all))
}

export default function StaffDashboard() {
  const { user, loading, logout } = useDashboardSession('staff')
  const [view, setView] = useTabState<string>('overview')

  // Permissions resolved live from the staff member's role.
  const permissions = useMemo(() => {
    if (!user) return []
    return (
      (user.staffRoleId && getRole(user.staffRoleId)?.permissions) ||
      getPermissionsForStaff(user.email) ||
      []
    )
  }, [user])

  const can = (p: string) => permissions.includes(p)

  const nav: NavItem[] = useMemo(() => {
    const items: NavItem[] = [
      { key: 'overview', label: 'Overview', icon: LayoutDashboard },
    ]
    if (can('payments.verify') || can('payments.view'))
      items.push({ key: 'payments', label: 'Payments', icon: CreditCard })
    if (can('timetable.edit') || can('timetable.view'))
      items.push({ key: 'timetable', label: 'Timetable', icon: CalendarDays })
    if (can('attendance.manage'))
      items.push({ key: 'attendance', label: 'Attendance', icon: CalendarCheck })
    if (can('students.manage') || can('students.view'))
      items.push({ key: 'students', label: 'Students', icon: Users })
    if (can('announcements.send'))
      items.push({ key: 'announcements', label: 'Announcements', icon: Megaphone })
    if (can('reports.view'))
      items.push({ key: 'reports', label: 'Reports', icon: BarChart3 })
    return items
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [permissions])

  // If the active view is no longer permitted (role changed), fall back.
  useEffect(() => {
    if (!nav.some((n) => n.key === view)) setView('overview')
  }, [nav, view])

  if (loading || !user) {
    return (
      <div className='h-screen w-full flex flex-col items-center justify-center bg-[#F8FAFF]'>
        <Loader2 className='text-[#002EFF] animate-spin mb-4' size={40} />
        <p className='text-[10px] font-black uppercase tracking-[0.2em] text-[#002EFF]'>
          Loading Staff Portal
        </p>
      </div>
    )
  }

  const roleName = (user.staffRoleId && getRole(user.staffRoleId)?.name) || 'Staff'
  const name = user.fullName || user.username || 'Staff'
  const firstName = name.split(' ')[0]

  return (
    <DashboardShell
      roleLabel={roleName}
      userName={name}
      userAvatar={user.avatarUrl}
      nav={nav}
      activeKey={view}
      onNavigate={setView}
      onLogout={logout}
    >
      {view === 'overview' && (
        <OverviewPanel
          firstName={firstName}
          roleName={roleName}
          permissions={permissions}
          onGo={setView}
          canPayments={can('payments.verify') || can('payments.view')}
          canTimetable={can('timetable.edit') || can('timetable.view')}
        />
      )}

      {view === 'payments' && (
        <PaymentsPanel canVerify={can('payments.verify')} staffName={firstName} />
      )}

      {view === 'timetable' &&
        (can('timetable.edit') ? <TimetableEditor /> : <TimetableReadOnly />)}

      {view === 'attendance' && <TakeAttendance />}

      {view === 'students' && <StudentsPanel canManage={can('students.manage')} />}

      {view === 'announcements' && <AnnouncementsPanel staffName={firstName} />}

      {view === 'reports' && <ReportsPanel />}
    </DashboardShell>
  )
}

/* ---------------------------------------------------------------- */
function OverviewPanel({
  firstName,
  roleName,
  permissions,
  onGo,
  canPayments,
  canTimetable,
}: {
  firstName: string
  roleName: string
  permissions: string[]
  onGo: (v: string) => void
  canPayments: boolean
  canTimetable: boolean
}) {
  const [pending, setPending] = useState(0)
  useEffect(() => {
    const paid = readPayments()
    setPending(getStudents().filter((s) => !paid[s.key]).length)
  }, [])

  return (
    <div className='space-y-6'>
      <section className='relative overflow-hidden bg-[#002EFF] rounded-4xl p-8 text-white shadow-lg'>
        <h1 className='text-2xl md:text-3xl font-black uppercase italic tracking-tight'>
          Welcome, <span className='text-[#FCB900]'>{firstName}</span>
        </h1>
        <p className='text-blue-100 text-xs md:text-sm mt-2 font-medium'>
          You are signed in as{' '}
          <span className='font-black text-white'>{roleName}</span>. Your access
          is limited to the tools your role permits.
        </p>
      </section>

      <div className='grid grid-cols-2 md:grid-cols-3 gap-4'>
        {canPayments && (
          <button onClick={() => onGo('payments')} className='text-left'>
            <Card className='p-4 rounded-2xl border-none shadow-sm bg-white flex items-center gap-3 hover:shadow-md transition-all'>
              <div className='h-10 w-10 rounded-xl flex items-center justify-center shrink-0 bg-amber-50 text-amber-600'>
                <CreditCard size={18} strokeWidth={2.5} />
              </div>
              <div>
                <p className='text-[8px] font-black text-gray-400 uppercase leading-none mb-1'>
                  Awaiting Payment
                </p>
                <p className='text-lg font-black text-gray-900 leading-none'>
                  {pending}
                </p>
              </div>
            </Card>
          </button>
        )}
        {canTimetable && (
          <button onClick={() => onGo('timetable')} className='text-left'>
            <Card className='p-4 rounded-2xl border-none shadow-sm bg-white flex items-center gap-3 hover:shadow-md transition-all'>
              <div className='h-10 w-10 rounded-xl flex items-center justify-center shrink-0 bg-blue-50 text-blue-600'>
                <CalendarDays size={18} strokeWidth={2.5} />
              </div>
              <div>
                <p className='text-[8px] font-black text-gray-400 uppercase leading-none mb-1'>
                  Timetable
                </p>
                <p className='text-lg font-black text-gray-900 leading-none'>
                  Manage
                </p>
              </div>
            </Card>
          </button>
        )}
      </div>

      <Card className='p-6 rounded-3xl border-none shadow-sm bg-white'>
        <div className='flex items-center gap-2 mb-4'>
          <ShieldCheck size={16} className='text-[#002EFF]' />
          <h3 className='text-sm font-black uppercase text-gray-800'>
            Your Permissions
          </h3>
        </div>
        {permissions.length === 0 ? (
          <p className='text-xs text-gray-400 font-medium'>
            No permissions assigned yet. Ask an admin to update your role in the
            admin panel.
          </p>
        ) : (
          <div className='flex flex-wrap gap-2'>
            {permissions.map((p) => (
              <span
                key={p}
                className='px-3 py-1.5 rounded-lg bg-blue-50 text-[#002EFF] text-[10px] font-black uppercase tracking-wide'
              >
                {permissionLabel(p)}
              </span>
            ))}
          </div>
        )}
        <p className='text-[10px] text-gray-400 font-medium mt-4 border-t border-slate-50 pt-3'>
          Permissions are set by an admin under <b>Permissions → Role
          Permissions</b>, and enforced by the backend on every action.
        </p>
      </Card>
    </div>
  )
}

/* ---------------------------------------------------------------- */
function PaymentsPanel({
  canVerify,
  staffName,
}: {
  canVerify: boolean
  staffName: string
}) {
  const [students, setStudents] = useState<StoredStudent[]>([])
  const [paid, setPaid] = useState<Record<string, ManualPayment>>({})
  const [target, setTarget] = useState<StoredStudent | null>(null)
  const [method, setMethod] = useState('Bank Transfer')
  const [reference, setReference] = useState('')

  const load = () => {
    setStudents(getStudents())
    setPaid(readPayments())
  }
  useEffect(load, [])

  const confirm = () => {
    if (!target) return
    savePayment(target.key, {
      method,
      reference: reference.trim(),
      by: staffName,
      at: new Date().toISOString(),
    })
    setTarget(null)
    setReference('')
    setMethod('Bank Transfer')
    load()
  }

  return (
    <div className='space-y-4'>
      <div>
        <h2 className='text-2xl font-black text-[#002EFF] italic uppercase'>
          Manual Payments
        </h2>
        <p className='text-[11px] font-bold text-slate-400'>
          {canVerify
            ? 'Verify offline payments (bank transfer / cash) so the student’s portal is activated.'
            : 'Read-only view of payment status.'}
        </p>
      </div>

      <Card className='rounded-3xl border-none shadow-sm bg-white overflow-hidden'>
        <div className='grid grid-cols-12 px-5 py-3 bg-slate-50 text-[9px] font-black uppercase text-gray-400'>
          <span className='col-span-4'>Student</span>
          <span className='col-span-2'>Track</span>
          <span className='col-span-3'>Status</span>
          <span className='col-span-3 text-right'>Action</span>
        </div>
        {students.map((s) => {
          const p = paid[s.key]
          return (
            <div
              key={s.key}
              className='grid grid-cols-12 items-center px-5 py-4 border-t border-slate-50'
            >
              <span className='col-span-4 text-xs font-black text-gray-800'>
                {s.name}
              </span>
              <span className='col-span-2'>
                <Badge className='bg-blue-50 text-[#002EFF] text-[8px] font-black'>
                  {s.track}
                </Badge>
              </span>
              <span className='col-span-3'>
                {p ? (
                  <span className='inline-flex items-center gap-1 text-[10px] font-black text-emerald-600'>
                    <CheckCircle2 size={12} /> Paid · {p.method}
                  </span>
                ) : (
                  <span className='inline-flex items-center gap-1 text-[10px] font-black text-amber-600'>
                    <Clock size={12} /> Awaiting
                  </span>
                )}
              </span>
              <span className='col-span-3 text-right'>
                {p ? (
                  <span className='text-[9px] font-bold text-slate-400'>
                    by {p.by}
                  </span>
                ) : canVerify ? (
                  <Button
                    size='sm'
                    onClick={() => setTarget(s)}
                    className='bg-[#002EFF] text-white font-black text-[9px] rounded-lg h-8'
                  >
                    Verify
                  </Button>
                ) : (
                  <span className='inline-flex items-center gap-1 text-[9px] font-bold text-slate-300'>
                    <Lock size={10} /> No access
                  </span>
                )}
              </span>
            </div>
          )
        })}
        {students.length === 0 && (
          <p className='px-5 py-10 text-center text-xs font-bold text-slate-400'>
            No students yet.
          </p>
        )}
      </Card>

      {/* Verify modal */}
      {target && (
        <div className='fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm'>
          <div className='w-full max-w-sm bg-white rounded-3xl shadow-2xl p-6 space-y-4'>
            <div>
              <h3 className='text-sm font-black text-slate-900 uppercase'>
                Verify Payment
              </h3>
              <p className='text-[11px] font-bold text-slate-400'>
                {target.name} — ₦2,000 Portal Access Fee
              </p>
            </div>
            <label className='space-y-1.5 block'>
              <span className='text-[10px] font-black uppercase tracking-widest text-slate-400'>
                Method
              </span>
              <select
                value={method}
                onChange={(e) => setMethod(e.target.value)}
                className='w-full h-11 px-3 rounded-lg bg-slate-50 border border-transparent focus:border-[#002EFF]/30 focus:bg-white outline-none text-sm font-bold'
              >
                <option>Bank Transfer</option>
                <option>Cash</option>
                <option>POS</option>
                <option>Other</option>
              </select>
            </label>
            <label className='space-y-1.5 block'>
              <span className='text-[10px] font-black uppercase tracking-widest text-slate-400'>
                Reference (optional)
              </span>
              <input
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                placeholder='e.g. teller / transfer ref'
                className='w-full h-11 px-3 rounded-lg bg-slate-50 border border-transparent focus:border-[#002EFF]/30 focus:bg-white outline-none text-sm font-medium'
              />
            </label>
            <div className='flex gap-2 pt-1'>
              <Button
                onClick={() => setTarget(null)}
                variant='ghost'
                className='flex-1 rounded-xl font-black text-[10px] uppercase text-slate-500'
              >
                Cancel
              </Button>
              <Button
                onClick={confirm}
                className='flex-1 bg-[#002EFF] text-white rounded-xl font-black text-[10px] uppercase'
              >
                Mark Paid
              </Button>
            </div>
            <p className='text-[9px] font-medium text-slate-400 text-center'>
              Backend equivalent: <code>POST /api/payments/manual</code>
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

/* ---------------------------------------------------------------- */
function StudentsPanel({ canManage }: { canManage: boolean }) {
  const [students, setStudents] = useState<StoredStudent[]>([])
  useEffect(() => setStudents(getStudents()), [])
  return (
    <div className='space-y-4'>
      <h2 className='text-2xl font-black text-[#002EFF] italic uppercase'>
        Students {canManage ? '' : '(view only)'}
      </h2>
      <Card className='rounded-3xl border-none shadow-sm bg-white overflow-hidden'>
        <div className='grid grid-cols-12 px-5 py-3 bg-slate-50 text-[9px] font-black uppercase text-gray-400'>
          <span className='col-span-6'>Student</span>
          <span className='col-span-3'>Track</span>
          <span className='col-span-3'>Mode</span>
        </div>
        {students.map((s) => (
          <div
            key={s.key}
            className='grid grid-cols-12 items-center px-5 py-4 border-t border-slate-50'
          >
            <span className='col-span-6 text-xs font-black text-gray-800'>
              {s.name}
              {s.isNew && (
                <span className='ml-2 text-[8px] font-black uppercase text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded'>
                  New
                </span>
              )}
            </span>
            <span className='col-span-3'>
              <Badge className='bg-blue-50 text-[#002EFF] text-[8px] font-black'>
                {s.track}
              </Badge>
            </span>
            <span className='col-span-3 text-[10px] font-bold text-slate-500'>
              {s.mode === 'physical'
                ? 'On-Campus'
                : s.mode === 'online'
                  ? 'Online'
                  : '—'}
            </span>
          </div>
        ))}
      </Card>
    </div>
  )
}

/* ---------------------------------------------------------------- */
function AnnouncementsPanel({ staffName }: { staffName: string }) {
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [sent, setSent] = useState(false)
  return (
    <div className='space-y-4 max-w-xl'>
      <h2 className='text-2xl font-black text-[#002EFF] italic uppercase'>
        Send Announcement
      </h2>
      <Card className='p-6 rounded-3xl border-none shadow-sm bg-white space-y-4'>
        {sent && (
          <div className='flex items-center gap-2 p-3 rounded-xl bg-emerald-50 text-emerald-700 text-[11px] font-bold'>
            <CheckCircle2 size={15} /> Announcement queued (demo). The backend
            will deliver it to students.
          </div>
        )}
        <input
          value={title}
          onChange={(e) => {
            setTitle(e.target.value)
            setSent(false)
          }}
          placeholder='Title'
          className='w-full h-11 px-3 rounded-lg bg-slate-50 border border-transparent focus:border-[#002EFF]/30 focus:bg-white outline-none text-sm font-bold'
        />
        <textarea
          value={body}
          onChange={(e) => {
            setBody(e.target.value)
            setSent(false)
          }}
          placeholder='Write your message to students…'
          rows={5}
          className='w-full px-3 py-2 rounded-lg bg-slate-50 border border-transparent focus:border-[#002EFF]/30 focus:bg-white outline-none text-sm font-medium resize-none'
        />
        <div className='flex items-center justify-between'>
          <p className='text-[10px] font-bold text-slate-400'>By {staffName}</p>
          <Button
            disabled={title.trim().length < 2 || body.trim().length < 2}
            onClick={() => {
              setSent(true)
              setTitle('')
              setBody('')
            }}
            className='bg-[#002EFF] text-white rounded-xl font-black text-[10px] uppercase gap-2'
          >
            <Send size={13} /> Send
          </Button>
        </div>
      </Card>
    </div>
  )
}

/* ---------------------------------------------------------------- */
function ReportsPanel() {
  const [students, setStudents] = useState<StoredStudent[]>([])
  const [paidCount, setPaidCount] = useState(0)
  useEffect(() => {
    const list = getStudents()
    setStudents(list)
    const paid = readPayments()
    setPaidCount(list.filter((s) => paid[s.key]).length)
  }, [])
  const tiles = [
    { label: 'Total Students', value: students.length },
    { label: 'Payments Verified', value: paidCount },
    { label: 'Awaiting Payment', value: students.length - paidCount },
  ]
  return (
    <div className='space-y-4'>
      <h2 className='text-2xl font-black text-[#002EFF] italic uppercase'>
        Reports
      </h2>
      <div className='grid grid-cols-1 sm:grid-cols-3 gap-4'>
        {tiles.map((t) => (
          <Card
            key={t.label}
            className='p-6 rounded-3xl border-none shadow-sm bg-white'
          >
            <p className='text-[9px] font-black uppercase text-gray-400 mb-2'>
              {t.label}
            </p>
            <p className='text-3xl font-black text-[#002EFF]'>{t.value}</p>
          </Card>
        ))}
      </div>
      <p className='text-[10px] font-medium text-slate-400'>
        Read-only figures. Full analytics come from the backend reporting
        endpoints.
      </p>
    </div>
  )
}

/* ---------------------------------------------------------------- */
function TimetableReadOnly() {
  const TRACKS: { id: ExamTrack; label: string }[] = [
    { id: 'jamb', label: 'JAMB' },
    { id: 'waec', label: 'WAEC' },
    { id: 'postutme', label: 'Post-UTME' },
  ]
  const [track, setTrack] = useState<ExamTrack>('jamb')
  const [grid, setGrid] = useState<TimetableGrid>([])
  useEffect(() => setGrid(getEffectiveTimetable(track)), [track])

  return (
    <div className='space-y-4'>
      <div className='flex items-center justify-between flex-wrap gap-3'>
        <h2 className='text-2xl font-black text-[#002EFF] italic uppercase'>
          Timetable (view only)
        </h2>
        <div className='flex gap-1.5'>
          {TRACKS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTrack(t.id)}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wide transition-all ${
                track === t.id
                  ? 'bg-[#002EFF] text-white'
                  : 'bg-white text-slate-500 hover:bg-slate-50'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>
      <Card className='rounded-3xl border-none shadow-sm bg-white overflow-x-auto'>
        <table className='w-full text-left min-w-[640px]'>
          <thead>
            <tr className='bg-slate-50'>
              <th className='px-4 py-3 text-[9px] font-black uppercase text-gray-400'>
                Period
              </th>
              {DAYS.map((d) => (
                <th
                  key={d}
                  className='px-4 py-3 text-[9px] font-black uppercase text-gray-400'
                >
                  {d.slice(0, 3)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {SLOTS.map((slot, r) => (
              <tr key={slot.label} className='border-t border-slate-50'>
                <td className='px-4 py-3'>
                  <p className='text-[10px] font-black text-slate-700'>
                    {slot.label}
                  </p>
                  <p className='text-[9px] font-bold text-slate-400'>
                    {slot.time}
                  </p>
                </td>
                {DAYS.map((d, c) => {
                  const cell = grid[r]?.[c] ?? []
                  return (
                    <td key={d} className='px-3 py-3'>
                      {cell.length ? (
                        <div className='flex flex-col gap-1'>
                          {cell.map((s, i) => (
                            <span
                              key={i}
                              className={`inline-block px-2.5 py-1 rounded-lg text-[10px] font-black ${tintForSubject(s)}`}
                            >
                              {s}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className='text-[10px] text-slate-300'>—</span>
                      )}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  )
}
