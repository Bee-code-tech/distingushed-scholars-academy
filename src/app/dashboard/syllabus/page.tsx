'use client'

import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Sparkles, Target } from 'lucide-react'

/**
 * Syllabus Mastery — placeholder.
 *
 * The previous version showed fabricated mastery percentages, a fake "UTME
 * catalog", and non-working search/download. There is no backend for
 * per-topic mastery yet, so we show an honest "coming soon" state instead of
 * mock data (see the "unpopulate anything not in the database" cleanup).
 */
export default function SyllabusMastery() {
  return (
    <div className='max-w-3xl mx-auto'>
      <div className='mb-6'>
        <h2 className='text-2xl font-black text-[#002EFF] italic uppercase flex items-center gap-2'>
          <Target size={24} /> Syllabus Mastery
        </h2>
        <p className='text-[11px] font-bold text-slate-400'>
          Track your progress topic-by-topic across your subjects.
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
          Topic-level mastery tracking is on the way. For now, follow your
          course progress under{' '}
          <span className='text-[#002EFF]'>My Courses</span> and{' '}
          <span className='text-[#002EFF]'>Course Materials</span>.
        </p>
        <Badge className='bg-blue-50 text-[#002EFF] border-none font-black text-[8px]'>
          IN DEVELOPMENT
        </Badge>
      </Card>
    </div>
  )
}
