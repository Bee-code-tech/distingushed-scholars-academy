'use client'

import React, { useEffect, useMemo, useState } from 'react'
import {
  FileText,
  Video,
  PlayCircle,
  ScrollText,
  Presentation,
  Link as LinkIcon,
  Download,
  Eye,
  CheckCircle2,
  Circle,
  Plus,
  Trash2,
  Loader2,
  BookOpen,
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  getCourses,
  getMaterials,
  getMaterialsForTrack,
  addMaterial,
  removeMaterial,
  getCompleted,
  toggleComplete,
  trackProgress,
} from '@/lib/coursesStore'
import { getUser } from '@/lib/auth'
import { normaliseTrack } from '@/lib/studentProfile'
import type { Course, CourseMaterial, MaterialType } from '@/lib/types'

const TYPE_META: Record<MaterialType, { label: string; icon: React.ElementType; tint: string }> = {
  pdf: { label: 'PDF', icon: FileText, tint: 'bg-rose-50 text-rose-600' },
  video: { label: 'Video', icon: Video, tint: 'bg-blue-50 text-blue-600' },
  recording: { label: 'Recording', icon: PlayCircle, tint: 'bg-purple-50 text-purple-600' },
  syllabus: { label: 'Syllabus', icon: ScrollText, tint: 'bg-amber-50 text-amber-600' },
  slide: { label: 'Slides', icon: Presentation, tint: 'bg-emerald-50 text-emerald-600' },
  link: { label: 'Link', icon: LinkIcon, tint: 'bg-slate-100 text-slate-600' },
}

function MaterialIcon({ type }: { type: MaterialType }) {
  const { icon: Icon, tint } = TYPE_META[type]
  return (
    <div className={`h-9 w-9 rounded-xl flex items-center justify-center shrink-0 ${tint}`}>
      <Icon size={16} strokeWidth={2.5} />
    </div>
  )
}

export default function CourseMaterials({
  mode,
  studentKey,
  track: trackProp,
}: {
  mode: 'tutor' | 'student'
  studentKey?: string
  track?: string
}) {
  const [mounted, setMounted] = useState(false)
  const [tick, setTick] = useState(0) // bump to refresh after mutations
  const refresh = () => setTick((t) => t + 1)

  useEffect(() => setMounted(true), [])

  // Resolve the student's track (from prop or their profile).
  const track = useMemo(() => {
    if (trackProp) return trackProp
    const u = getUser()
    return normaliseTrack(u?.level || u?.examType || 'jamb')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trackProp, mounted])

  if (!mounted) {
    return (
      <div className='py-16 flex justify-center'>
        <Loader2 className='animate-spin text-[#002EFF]' />
      </div>
    )
  }

  return mode === 'tutor' ? (
    <TutorMaterials key={tick} onChange={refresh} />
  ) : (
    <StudentMaterials key={tick} track={track} studentKey={studentKey || 'me'} onChange={refresh} />
  )
}

/* ---------------- Tutor: upload & manage ---------------- */
function TutorMaterials({ onChange }: { onChange: () => void }) {
  const courses = getCourses()
  const [courseId, setCourseId] = useState(courses[0]?.id ?? '')
  const materials = courseId ? getMaterials(courseId) : []

  const [title, setTitle] = useState('')
  const [type, setType] = useState<MaterialType>('pdf')
  const [url, setUrl] = useState('')
  const [duration, setDuration] = useState('')
  const [downloadable, setDownloadable] = useState(true)
  const [error, setError] = useState('')

  const add = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (title.trim().length < 2) return setError('Enter a title')
    if (!/^https?:\/\/|^\//.test(url.trim())) return setError('Enter a valid URL (https://…)')
    addMaterial({
      courseId,
      title,
      type,
      url,
      isDownloadable: downloadable,
      durationLabel: duration.trim() || undefined,
      now: Date.now(),
    })
    setTitle(''); setUrl(''); setDuration(''); setType('pdf'); setDownloadable(true)
    onChange()
  }

  return (
    <div className='space-y-5'>
      <div>
        <h2 className='text-2xl font-black text-[#002EFF] italic uppercase'>Course Materials</h2>
        <p className='text-[11px] font-bold text-slate-400'>
          Upload syllabus, PDFs, videos &amp; recordings for your students.
        </p>
      </div>

      {/* Course picker */}
      <div className='flex items-center gap-2 flex-wrap'>
        <BookOpen size={15} className='text-slate-400' />
        <select
          value={courseId}
          onChange={(e) => setCourseId(e.target.value)}
          className='h-10 px-3 rounded-lg bg-slate-50 border border-transparent focus:border-[#002EFF]/30 focus:bg-white outline-none text-sm font-bold'
        >
          {courses.map((c: Course) => (
            <option key={c.id} value={c.id}>
              {c.title}
            </option>
          ))}
        </select>
      </div>

      {/* Add form */}
      <Card className='p-5 rounded-3xl border-none shadow-sm bg-white'>
        <form onSubmit={add} className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
          {error && (
            <p className='sm:col-span-2 text-[11px] font-bold text-rose-600'>{error}</p>
          )}
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder='Title (e.g. Week 3 — Trigonometry)'
            className='h-11 px-3 rounded-lg bg-slate-50 border border-transparent focus:border-[#002EFF]/30 focus:bg-white outline-none text-sm font-medium'
          />
          <select
            value={type}
            onChange={(e) => setType(e.target.value as MaterialType)}
            className='h-11 px-3 rounded-lg bg-slate-50 border border-transparent focus:border-[#002EFF]/30 focus:bg-white outline-none text-sm font-bold'
          >
            {(Object.keys(TYPE_META) as MaterialType[]).map((tp) => (
              <option key={tp} value={tp}>{TYPE_META[tp].label}</option>
            ))}
          </select>
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder='File / video URL (https://…)'
            className='sm:col-span-2 h-11 px-3 rounded-lg bg-slate-50 border border-transparent focus:border-[#002EFF]/30 focus:bg-white outline-none text-sm font-medium'
          />
          {(type === 'video' || type === 'recording') && (
            <input
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              placeholder='Duration (e.g. 12:40)'
              className='h-11 px-3 rounded-lg bg-slate-50 border border-transparent focus:border-[#002EFF]/30 focus:bg-white outline-none text-sm font-medium'
            />
          )}
          <label className='flex items-center gap-2 text-[11px] font-bold text-slate-500'>
            <input type='checkbox' checked={downloadable} onChange={(e) => setDownloadable(e.target.checked)} />
            Allow download
          </label>
          <button
            type='submit'
            className='sm:col-span-2 flex items-center justify-center gap-2 h-11 bg-[#002EFF] text-white rounded-xl font-black text-[11px] uppercase tracking-wide hover:bg-blue-700 active:scale-[0.98] transition-all'
          >
            <Plus size={15} /> Add Material
          </button>
        </form>
        <p className='text-[10px] font-medium text-slate-400 mt-3'>
          Paste a link for now. Direct file upload arrives when the backend adds
          storage (<code>POST /uploads/sign</code> — spec §14).
        </p>
      </Card>

      {/* Existing materials */}
      <div className='space-y-2'>
        {materials.length === 0 ? (
          <p className='text-xs font-bold text-slate-400 py-6 text-center'>No materials yet for this course.</p>
        ) : (
          materials.map((m) => (
            <Card key={m.id} className='p-3 rounded-2xl border-none shadow-sm bg-white flex items-center gap-3'>
              <MaterialIcon type={m.type} />
              <div className='min-w-0 flex-1'>
                <p className='text-xs font-black text-gray-800 truncate'>{m.title}</p>
                <p className='text-[10px] font-bold text-slate-400'>
                  {TYPE_META[m.type].label}
                  {m.durationLabel ? ` · ${m.durationLabel}` : ''}
                  {m.isDownloadable ? ' · downloadable' : ''}
                </p>
              </div>
              <a href={m.url} target='_blank' rel='noreferrer' className='p-2 text-slate-400 hover:text-[#002EFF]' title='Open'>
                <Eye size={15} />
              </a>
              <button
                onClick={() => { removeMaterial(m.id); onChange() }}
                className='p-2 text-slate-400 hover:text-rose-600'
                title='Remove'
              >
                <Trash2 size={15} />
              </button>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}

/* ---------------- Student: browse, download, mark complete ---------------- */
function StudentMaterials({
  track,
  studentKey,
  onChange,
}: {
  track: string
  studentKey: string
  onChange: () => void
}) {
  const groups = getMaterialsForTrack(track)
  const courseIds = Object.keys(groups)
  const done = new Set(getCompleted(studentKey))
  const progress = trackProgress(studentKey, track)

  return (
    <div className='space-y-5'>
      <div>
        <h2 className='text-2xl font-black text-[#002EFF] italic uppercase'>Course Materials</h2>
        <p className='text-[11px] font-bold text-slate-400'>
          Your syllabus, notes, videos &amp; class recordings.
        </p>
      </div>

      {/* Progress */}
      <Card className='p-4 rounded-3xl border-none shadow-sm bg-white'>
        <div className='flex items-center justify-between mb-2'>
          <span className='text-[10px] font-black uppercase text-gray-400'>Course Progress</span>
          <span className='text-xs font-black text-[#002EFF]'>{progress}%</span>
        </div>
        <div className='h-2.5 bg-slate-100 rounded-full overflow-hidden'>
          <div className='h-full bg-[#002EFF] rounded-full transition-all' style={{ width: `${progress}%` }} />
        </div>
      </Card>

      {courseIds.length === 0 ? (
        <p className='text-xs font-bold text-slate-400 py-8 text-center'>
          No materials published for your track yet.
        </p>
      ) : (
        courseIds.map((cid) => {
          const course = getCourses().find((c) => c.id === cid)
          const mats: CourseMaterial[] = groups[cid]
          return (
            <div key={cid} className='space-y-2'>
              <h3 className='text-[11px] font-black uppercase tracking-widest text-slate-500'>
                {course?.title ?? cid}
              </h3>
              {mats.map((m) => {
                const completed = done.has(m.id)
                return (
                  <Card key={m.id} className='p-3 rounded-2xl border-none shadow-sm bg-white flex items-center gap-3'>
                    <MaterialIcon type={m.type} />
                    <div className='min-w-0 flex-1'>
                      <p className='text-xs font-black text-gray-800 truncate'>{m.title}</p>
                      <p className='text-[10px] font-bold text-slate-400'>
                        {TYPE_META[m.type].label}
                        {m.durationLabel ? ` · ${m.durationLabel}` : ''}
                      </p>
                    </div>
                    <a
                      href={m.url}
                      target='_blank'
                      rel='noreferrer'
                      className='flex items-center gap-1 px-3 h-8 rounded-lg bg-blue-50 text-[#002EFF] text-[10px] font-black uppercase'
                    >
                      {m.isDownloadable ? <Download size={13} /> : <Eye size={13} />}
                      {m.isDownloadable ? 'Download' : 'View'}
                    </a>
                    <button
                      onClick={() => { toggleComplete(studentKey, m.id); onChange() }}
                      className={`p-1.5 ${completed ? 'text-emerald-600' : 'text-slate-300 hover:text-slate-500'}`}
                      title={completed ? 'Completed' : 'Mark complete'}
                    >
                      {completed ? <CheckCircle2 size={20} /> : <Circle size={20} />}
                    </button>
                  </Card>
                )
              })}
            </div>
          )
        })
      )}

      {courseIds.length > 0 && (
        <div className='flex flex-wrap gap-2 pt-1'>
          <Badge className='bg-slate-100 text-slate-500 text-[9px] font-black'>
            Tip: mark items complete to grow your progress bar
          </Badge>
        </div>
      )}
    </div>
  )
}
