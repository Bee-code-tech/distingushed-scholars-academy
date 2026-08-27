// src/app/admin/components/CourseLibraryWrapper.tsx
'use client'

import React, { useState, useEffect } from 'react'
import { BookOpen, FolderPlus, Loader2 } from 'lucide-react'
import Library from './Library'

interface CourseOption {
  id: string
  code: string
  title: string
}

export default function CourseLibraryWrapper() {
  const [courses, setCourses] = useState<CourseOption[]>([])
  const [selectedCourseId, setSelectedCourseId] = useState<string>('')
  const [isFetchingCourses, setIsFetchingCourses] = useState(false)

  // Demo fallback data if API isn't populated yet
  const fallbackCourses: CourseOption[] = [
    {
      id: 'course_mth202',
      code: 'MTH 202',
      title: 'Elementary Set Theory & Logic',
    },
    {
      id: 'course_csc101',
      code: 'CSC 101',
      title: 'Introduction to Computer Science',
    },
    {
      id: 'course_web201',
      code: 'WEB 201',
      title: 'Full-Stack Web Development',
    },
  ]

  useEffect(() => {
    // Select first course by default from fallback
    setCourses(fallbackCourses)
    if (fallbackCourses.length > 0) {
      setSelectedCourseId(fallbackCourses[0].id)
    }
  }, [])

  return (
    <div className='flex flex-col h-screen w-full bg-slate-900'>
      {/* HEADER: Admin Selects Course to Manage/Upload Materials */}
      <div className='bg-slate-950 border-b border-slate-800 px-6 py-3 flex items-center justify-between shrink-0 z-10'>
        <div className='flex items-center gap-3'>
          <div className='w-8 h-8 rounded-lg bg-[#002EFF]/10 border border-[#002EFF]/30 flex items-center justify-center text-[#002EFF]'>
            <BookOpen size={16} />
          </div>
          <div>
            <h2 className='text-xs font-black uppercase text-white tracking-wide'>
              Course Material Management
            </h2>
            <p className='text-[10px] text-slate-400 font-bold'>
              Select a course to ingest or review library materials
            </p>
          </div>
        </div>

        <div className='flex items-center gap-3'>
          <label className='text-[10px] font-black uppercase text-slate-400 tracking-wider'>
            Active Course:
          </label>
          <select
            value={selectedCourseId}
            onChange={(e) => setSelectedCourseId(e.target.value)}
            className='bg-slate-900 text-slate-100 text-xs font-bold px-3 py-2 rounded-lg border border-slate-700 focus:outline-none focus:border-[#002EFF] shadow-inner cursor-pointer min-w-[240px]'
          >
            <option value=''>-- Select Course --</option>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.code} - {c.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* BODY: Library View and Ingest Modal */}
      <div className='flex-1 overflow-hidden relative'>
        {selectedCourseId ? (
          <Library courseId={selectedCourseId} />
        ) : (
          <div className='h-full flex flex-col items-center justify-center text-slate-400 gap-3 p-6 text-center'>
            <FolderPlus size={40} className='text-slate-600' />
            <div>
              <p className='text-sm font-black text-slate-200 uppercase'>
                No Course Selected
              </p>
              <p className='text-xs text-slate-500 max-w-sm mt-1'>
                Select a course from the dropdown above to view, upload, or
                manage materials.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
