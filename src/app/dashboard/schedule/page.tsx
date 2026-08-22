'use client'

import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CalendarClock, Sparkles } from 'lucide-react'

/**
 * Exam Schedule — placeholder.
 *
 * The previous version showed hardcoded class schedules, study-time totals,
 * "completed goals" and personal tasks with no backend. The real weekly
 * schedule already lives in the Timetable tab, and exam countdowns come from
 * the Overview. Rather than show fabricated data we present an honest
 * "coming soon" state (part of the "unpopulate anything not in the database"
 * cleanup).
 */
export default function ExamSchedule(_props: { mode?: string } = {}) {
  return (
    <div className='max-w-3xl mx-auto'>
      <div className='mb-6'>
        <h2 className='text-2xl font-black text-[#002EFF] italic uppercase flex items-center gap-2'>
          <CalendarClock size={24} /> Exam Schedule
        </h2>
        <p className='text-[11px] font-bold text-slate-400'>
          Your exam dates, study planner and personal tasks.
        </p>
      </div>

      <Card className='rounded-3xl border-none shadow-sm bg-white p-10 flex flex-col items-center justify-center text-center gap-3 min-h-[320px]'>
        <div className='h-14 w-14 rounded-2xl bg-blue-50 text-[#002EFF] flex items-center justify-center'>
          <Sparkles size={26} />
        </div>
        <h3 className='text-sm font-black text-gray-800 uppercase italic'>
          Coming soon
        </h3>
        <p className='text-[11px] font-bold text-slate-400 max-w-xs leading-relaxed'>
          A study planner with personal tasks is on the way. For now, your
          weekly classes are under <span className='text-[#002EFF]'>Timetable</span>{' '}
          and your exam countdown is on the{' '}
          <span className='text-[#002EFF]'>Overview</span>.
        </p>
        <Badge className='bg-blue-50 text-[#002EFF] border-none font-black text-[8px]'>
          IN DEVELOPMENT
        </Badge>
      </Card>
    </div>
  )
}
