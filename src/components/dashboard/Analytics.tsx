'use client'

import React, { useEffect, useState } from 'react'
import {
  BarChart3,
  TrendingUp,
  CalendarCheck,
  ClipboardCheck,
  BookOpen,
  Users,
  AlertTriangle,
  Award,
  Loader2,
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { getCourses, getMaterialsForTrack, getCompleted, trackProgress } from '@/lib/coursesStore'
import { getAssignments, getAssignmentsForTrack, getSubmissions, getMySubmission } from '@/lib/assignmentsStore'
import { getStudentAttendance, getTodayCheckIns } from '@/lib/attendanceStore'
import { getStudents } from '@/lib/studentsStore'
import { getUser } from '@/lib/auth'
import { normaliseTrack } from '@/lib/studentProfile'

function StatTile({ label, value, sub, icon: Icon, tint }: {
  label: string; value: string | number; sub?: string; icon: React.ElementType; tint: string
}) {
  return (
    <Card className='p-4 rounded-2xl border-none shadow-sm bg-white'>
      <div className='flex items-center gap-3'>
        <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${tint}`}>
          <Icon size={18} strokeWidth={2.5} />
        </div>
        <div>
          <p className='text-[8px] font-black text-gray-400 uppercase leading-none mb-1'>{label}</p>
          <p className='text-lg font-black text-gray-900 leading-none'>{value}</p>
          {sub && <p className='text-[9px] font-bold text-slate-400 mt-1'>{sub}</p>}
        </div>
      </div>
    </Card>
  )
}

function Bar({ label, pct, tintDanger = false }: { label: string; pct: number; tintDanger?: boolean }) {
  return (
    <div className='flex items-center gap-3'>
      <span className='w-28 text-[10px] font-black text-gray-600 uppercase text-right truncate'>{label}</span>
      <div className='flex-1 h-6 bg-slate-100 rounded-lg overflow-hidden'>
        <div
          className={`h-full rounded-lg flex items-center justify-end pr-2 transition-all ${
            tintDanger && pct < 70 ? 'bg-amber-400' : 'bg-[#002EFF]'
          }`}
          style={{ width: `${Math.max(pct, 6)}%` }}
        >
          <span className='text-[9px] font-black text-white'>{pct}%</span>
        </div>
      </div>
    </div>
  )
}

export default function Analytics({
  mode,
  studentKey,
  track: trackProp,
}: {
  mode: 'tutor' | 'student'
  studentKey?: string
  track?: string
}) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  if (!mounted) {
    return <div className='py-16 flex justify-center'><Loader2 className='animate-spin text-[#002EFF]' /></div>
  }
  if (mode === 'tutor') return <TutorAnalytics />
  const u = getUser()
  const track = trackProp || normaliseTrack(u?.level || u?.examType || 'jamb')
  return <StudentAnalytics track={track} studentKey={studentKey || u?.username || 'me'} />
}

/* ---------------- Student ---------------- */
function StudentAnalytics({ track, studentKey }: { track: string; studentKey: string }) {
  const progress = trackProgress(studentKey, track)

  // Assignment performance from graded submissions on the student's track.
  const groups = getAssignmentsForTrack(track)
  let scored = 0, maxTotal = 0, gradedCount = 0, submittedCount = 0, totalAssignments = 0
  Object.values(groups).flat().forEach((a) => {
    totalAssignments++
    const mine = getMySubmission(a.id, studentKey)
    if (mine) submittedCount++
    if (mine && mine.status === 'graded' && mine.score != null) {
      scored += mine.score
      maxTotal += a.maxScore
      gradedCount++
    }
  })
  const assignmentAvg = maxTotal ? Math.round((scored / maxTotal) * 100) : 0

  const att = getStudentAttendance(studentKey)

  // Per-course progress (materials completed / total).
  const completed = new Set(getCompleted(studentKey))
  const matGroups = getMaterialsForTrack(track)
  const perCourse = Object.entries(matGroups).map(([cid, mats]) => {
    const course = getCourses().find((c) => c.id === cid)
    const done = mats.filter((m) => completed.has(m.id)).length
    return { title: course?.title ?? cid, pct: mats.length ? Math.round((done / mats.length) * 100) : 0 }
  })

  return (
    <div className='space-y-6'>
      <div>
        <h2 className='text-2xl font-black text-[#002EFF] italic uppercase'>My Performance</h2>
        <p className='text-[11px] font-bold text-slate-400'>Your progress, grades &amp; attendance at a glance.</p>
      </div>

      <div className='grid grid-cols-2 md:grid-cols-4 gap-3'>
        <StatTile label='Course Progress' value={`${progress}%`} icon={TrendingUp} tint='bg-blue-50 text-blue-600' />
        <StatTile label='Assignment Avg' value={gradedCount ? `${assignmentAvg}%` : '—'} sub={gradedCount ? `${gradedCount} graded` : 'none graded yet'} icon={Award} tint='bg-emerald-50 text-emerald-600' />
        <StatTile label='Attendance' value={att.total ? `${att.rate}%` : '—'} sub={att.total ? `${att.present}/${att.total} days` : 'no sessions yet'} icon={CalendarCheck} tint='bg-amber-50 text-amber-600' />
        <StatTile label='Assignments' value={`${submittedCount}/${totalAssignments}`} sub='submitted' icon={ClipboardCheck} tint='bg-purple-50 text-purple-600' />
      </div>

      <Card className='p-6 rounded-3xl border-none shadow-sm bg-white'>
        <p className='text-[10px] font-black uppercase text-gray-400 mb-4 flex items-center gap-2'>
          <BookOpen size={13} className='text-[#002EFF]' /> Progress by course
        </p>
        {perCourse.length === 0 ? (
          <p className='text-[11px] font-bold text-slate-400'>No course materials for your track yet.</p>
        ) : (
          <div className='space-y-3'>
            {perCourse.map((c) => <Bar key={c.title} label={c.title} pct={c.pct} />)}
          </div>
        )}
      </Card>

      {gradedCount > 0 && (
        <Card className='p-6 rounded-3xl border-none shadow-sm bg-white'>
          <p className='text-[10px] font-black uppercase text-gray-400 mb-4'>Graded assignments</p>
          <div className='space-y-2'>
            {Object.values(groups).flat().map((a) => {
              const mine = getMySubmission(a.id, studentKey)
              if (!mine || mine.status !== 'graded' || mine.score == null) return null
              const pct = Math.round((mine.score / a.maxScore) * 100)
              return (
                <div key={a.id} className='flex items-center justify-between p-3 rounded-xl bg-slate-50/70'>
                  <span className='text-[11px] font-black text-gray-700'>{a.title}</span>
                  <span className={`text-[11px] font-black ${pct >= 70 ? 'text-emerald-600' : 'text-amber-600'}`}>
                    {mine.score}/{a.maxScore} · {pct}%
                  </span>
                </div>
              )
            })}
          </div>
        </Card>
      )}
    </div>
  )
}

/* ---------------- Tutor ---------------- */
function TutorAnalytics() {
  const students = getStudents()
  const withAvg = students.filter((s) => s.avg != null)
  const classAvg = withAvg.length ? Math.round(withAvg.reduce((n, s) => n + (s.avg ?? 0), 0) / withAvg.length) : 0
  const atRisk = students.filter((s) => s.avg != null && (s.avg ?? 100) < 70)
  const todayPresent = getTodayCheckIns().length

  // Per-course assignment stats.
  const courseStats = getCourses().map((c) => {
    const assignments = getAssignments(c.id)
    let subs = 0, graded = 0, scoreSum = 0, maxSum = 0
    assignments.forEach((a) => {
      const ss = getSubmissions(a.id)
      subs += ss.length
      ss.forEach((s) => {
        if (s.status === 'graded' && s.score != null) { graded++; scoreSum += s.score; maxSum += a.maxScore }
      })
    })
    return {
      title: c.title,
      assignments: assignments.length,
      subs,
      graded,
      avg: maxSum ? Math.round((scoreSum / maxSum) * 100) : null,
    }
  }).filter((c) => c.assignments > 0)

  return (
    <div className='space-y-6'>
      <div>
        <h2 className='text-2xl font-black text-[#002EFF] italic uppercase'>Class Analytics</h2>
        <p className='text-[11px] font-bold text-slate-400'>How your students are performing.</p>
      </div>

      <div className='grid grid-cols-2 md:grid-cols-4 gap-3'>
        <StatTile label='Students' value={students.length} icon={Users} tint='bg-blue-50 text-blue-600' />
        <StatTile label='Class Avg' value={withAvg.length ? `${classAvg}%` : '—'} icon={BarChart3} tint='bg-emerald-50 text-emerald-600' />
        <StatTile label='Present Today' value={`${todayPresent}/${students.length}`} icon={CalendarCheck} tint='bg-amber-50 text-amber-600' />
        <StatTile label='At Risk' value={atRisk.length} sub='avg below 70%' icon={AlertTriangle} tint='bg-rose-50 text-rose-600' />
      </div>

      <Card className='p-6 rounded-3xl border-none shadow-sm bg-white'>
        <p className='text-[10px] font-black uppercase text-gray-400 mb-4'>Average score by student</p>
        <div className='space-y-3'>
          {withAvg.length === 0 ? (
            <p className='text-[11px] font-bold text-slate-400'>No graded scores yet.</p>
          ) : (
            withAvg.map((s) => <Bar key={s.key} label={s.name} pct={s.avg ?? 0} tintDanger />)
          )}
        </div>
      </Card>

      <Card className='rounded-3xl border-none shadow-sm bg-white overflow-hidden'>
        <div className='px-6 py-4 border-b border-slate-50'>
          <p className='text-[10px] font-black uppercase text-gray-400'>Assignments by course</p>
        </div>
        {courseStats.length === 0 ? (
          <p className='px-6 py-6 text-[11px] font-bold text-slate-400'>No assignments created yet.</p>
        ) : (
          <div className='overflow-x-auto'>
            <table className='w-full text-left min-w-[520px]'>
              <thead>
                <tr className='bg-slate-50/60 text-[9px] font-black uppercase text-gray-400'>
                  <th className='px-6 py-3'>Course</th>
                  <th className='px-4 py-3'>Assignments</th>
                  <th className='px-4 py-3'>Submissions</th>
                  <th className='px-4 py-3'>Graded</th>
                  <th className='px-4 py-3'>Avg</th>
                </tr>
              </thead>
              <tbody className='divide-y divide-slate-50'>
                {courseStats.map((c) => (
                  <tr key={c.title}>
                    <td className='px-6 py-3 text-xs font-black text-gray-800'>{c.title}</td>
                    <td className='px-4 py-3 text-xs font-bold text-slate-600'>{c.assignments}</td>
                    <td className='px-4 py-3 text-xs font-bold text-slate-600'>{c.subs}</td>
                    <td className='px-4 py-3 text-xs font-bold text-slate-600'>{c.graded}</td>
                    <td className='px-4 py-3'>
                      {c.avg == null ? (
                        <span className='text-[10px] font-bold text-slate-300'>—</span>
                      ) : (
                        <Badge className={`text-[8px] font-black ${c.avg >= 70 ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>{c.avg}%</Badge>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {atRisk.length > 0 && (
        <Card className='p-6 rounded-3xl border-none shadow-sm bg-white'>
          <p className='text-[10px] font-black uppercase text-gray-400 mb-3 flex items-center gap-2'>
            <AlertTriangle size={13} className='text-rose-500' /> Students needing attention
          </p>
          <div className='space-y-2'>
            {atRisk.map((s) => (
              <div key={s.key} className='flex items-center justify-between p-3 rounded-xl bg-rose-50/60'>
                <span className='text-xs font-black text-gray-800'>{s.name}</span>
                <span className='text-xs font-black text-rose-500'>{s.avg}% avg</span>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}
