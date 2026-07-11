import { Edit3, Trash2 } from 'lucide-react'
import { Question } from '../../constants/quiz'

export default function QuestionCard({
  question,
  index,
  onEdit,
  onDelete,
}: {
  question: Question
  index: number
  onEdit: () => void
  onDelete: () => void
}) {
  return (
    <div className='bg-white p-5 rounded-2xl border border-slate-200 hover:border-indigo-400 transition-all group relative shadow-sm'>
      <div className='flex justify-between items-start mb-4'>
        <div className='flex flex-wrap gap-2'>
          <span className='bg-slate-900 text-white px-2 py-1 rounded-lg text-[10px] font-black'>
            #{index + 1}
          </span>
          <span className='px-3 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-[10px] font-black uppercase'>
            {question.subject}
          </span>
          <span className='px-3 py-1 bg-amber-50 text-amber-600 rounded-lg text-[10px] font-black uppercase'>
            {question.mark} Points
          </span>
        </div>
        <div className='flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity'>
          <button
            onClick={onEdit}
            className='p-2 text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100'
          >
            <Edit3 size={16} />
          </button>
          <button
            onClick={onDelete}
            className='p-2 text-red-600 bg-red-50 rounded-lg hover:bg-red-100'
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
      <p className='text-[14px] font-bold text-slate-800 leading-relaxed'>
        {question.body}
      </p>
    </div>
  )
}
