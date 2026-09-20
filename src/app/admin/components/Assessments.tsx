'use client'

// Quizzes and the question bank are two halves of one job — questions go in,
// quizzes come out — so they live under one tab with a switch between them.
// The old tab ids still land here, so a bookmarked ?tab=question-bank works.

import { useState } from 'react'
import { HelpCircle, FileSpreadsheet } from 'lucide-react'
import QuizBuilder from './QuizBuilder'
import QuestionBank from '@/components/dashboard/QuestionBank'

export type AssessmentView = 'quizzes' | 'bank'

export default function Assessments({
  initial = 'quizzes',
}: {
  initial?: AssessmentView
}) {
  const [view, setView] = useState<AssessmentView>(initial)

  return (
    <div className='space-y-4'>
      {/* The switch. Full width on a phone so both halves are easy to hit. */}
      <div className='flex rounded-2xl bg-white border border-slate-100 p-1 shadow-sm max-w-md'>
        {(
          [
            { id: 'quizzes', label: 'Quizzes', Icon: HelpCircle },
            { id: 'bank', label: 'Question bank', Icon: FileSpreadsheet },
          ] as const
        ).map(({ id, label, Icon }) => (
          <button
            key={id}
            onClick={() => setView(id)}
            className={`flex-1 flex items-center justify-center gap-1.5 h-10 rounded-xl text-[11px] font-black uppercase tracking-wide transition-colors ${
              view === id
                ? 'bg-[#002EFF] text-white'
                : 'text-slate-500 hover:text-[#002EFF]'
            }`}
            aria-pressed={view === id}
          >
            <Icon size={14} /> {label}
          </button>
        ))}
      </div>

      {view === 'quizzes' ? <QuizBuilder /> : <QuestionBank />}
    </div>
  )
}
