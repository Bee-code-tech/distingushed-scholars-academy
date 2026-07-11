'use client'

import React, { useState, useRef } from 'react'
import {
  Plus,
  FileSpreadsheet,
  Zap,
  Search,
  UploadCloud,
  Settings,
} from 'lucide-react'
import { Question } from '../../constants/quiz'
import { parseExcelQuestions } from '../../utils/excelParser'
import QuestionCard from './QuestionCard' 

interface Props {
  questions: Question[]
  setQuestions: (q: Question[]) => void
  onNext: () => void
}

export default function Step2QuestionEditor({
  questions,
  setQuestions,
  onNext,
}: Props) {
  const [searchQuery, setSearchQuery] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [globalMark, setGlobalMark] = useState(1)
  const bulkInputRef = useRef<HTMLInputElement>(null)

  // Form State
  const [form, setForm] = useState<Partial<Question>>({
    subject: 'Mathematics',
    options: { A: '', B: '', C: '', D: '', E: '' },
    correctOption: 'A',
    mark: 1,
  })

  const handleBulkUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (evt) => {
      try {
        const parsed = parseExcelQuestions(
          evt.target?.result as ArrayBuffer,
          questions.length,
        )
        setQuestions([...questions, ...parsed])
      } catch (err) {
        alert('Invalid Excel format.')
      }
    }
    reader.readAsArrayBuffer(file)
  }

  const saveQuestion = () => {
    if (!form.body?.trim()) return alert('Question body is required')

    const newQ = {
      ...form,
      id: editingId || crypto.randomUUID(),
    } as Question

    if (editingId) {
      setQuestions(questions.map((q) => (q.id === editingId ? newQ : q)))
      setEditingId(null)
    } else {
      setQuestions([...questions, newQ])
    }
    // Reset partial form but keep subject/mark for speed
    setForm({ ...form, body: '', explanation: '', image: null })
  }

  return (
    <div className='grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in duration-500'>
      {/* LEFT: FORM EDITOR */}
      <div className='lg:col-span-5'>
        <div className='bg-white p-6 rounded-3xl shadow-sm border border-slate-200 sticky top-24'>
          <div className='flex justify-between items-center mb-6'>
            <h3 className='font-black text-slate-800 text-[12px] uppercase tracking-widest flex items-center gap-2'>
              {editingId ? (
                <Zap size={16} className='text-amber-500' />
              ) : (
                <Plus size={16} className='text-indigo-600' />
              )}
              {editingId ? 'Modify Question' : 'New Question'}
            </h3>
            <button
              onClick={() => bulkInputRef.current?.click()}
              className='text-[10px] font-black uppercase text-emerald-600 bg-emerald-50 px-4 py-2 rounded-xl hover:bg-emerald-100 transition-all flex items-center gap-2'
            >
              <FileSpreadsheet size={14} /> Import Excel
            </button>
            <input
              type='file'
              ref={bulkInputRef}
              hidden
              onChange={handleBulkUpload}
              accept='.xlsx, .xls'
            />
          </div>

          <div className='space-y-4'>
            {/* ... (The Form Inputs from your original code go here) ... */}
            <button
              onClick={saveQuestion}
              className='w-full py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase text-[11px] tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100'
            >
              {editingId ? 'Save Changes' : 'Add to Pool'}
            </button>
          </div>
        </div>
      </div>

      {/* RIGHT: QUESTION POOL */}
      <div className='lg:col-span-7 space-y-5'>
        <div className='bg-white p-5 rounded-3xl border border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4'>
          <div className='relative w-full md:w-64'>
            <Search
              className='absolute left-3 top-1/2 -translate-y-1/2 text-slate-400'
              size={14}
            />
            <input
              placeholder='Search questions...'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className='w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[11px] font-bold outline-none'
            />
          </div>
          {/* Global Mark Tool */}
          <div className='flex items-center gap-2 bg-indigo-50/50 p-1.5 rounded-2xl border border-indigo-100'>
            <span className='text-[10px] font-black text-indigo-900 uppercase px-2'>
              Quick Mark:
            </span>
            <input
              type='number'
              className='w-8 bg-transparent text-[11px] font-black text-center outline-none'
              value={globalMark}
              onChange={(e) => setGlobalMark(Number(e.target.value))}
            />
            <button
              onClick={() =>
                setQuestions(questions.map((q) => ({ ...q, mark: globalMark })))
              }
              className='px-4 py-2 bg-indigo-600 text-white rounded-xl text-[9px] font-black uppercase'
            >
              Apply All
            </button>
          </div>
        </div>

        <div className='space-y-4'>
          {questions.length === 0 ? (
            <div className='bg-white border-2 border-dashed border-slate-200 rounded-3xl p-20 flex flex-col items-center text-slate-400'>
              <UploadCloud size={48} className='opacity-20 mb-4' />
              <p className='text-[12px] font-black uppercase tracking-widest'>
                Question Pool is Empty
              </p>
            </div>
          ) : (
            questions
              .filter((q) =>
                q.body.toLowerCase().includes(searchQuery.toLowerCase()),
              )
              .map((q, idx) => (
                <QuestionCard
                  key={q.id}
                  question={q}
                  index={idx}
                  onEdit={() => {
                    setEditingId(q.id)
                    setForm(q)
                    window.scrollTo(0, 0)
                  }}
                  onDelete={() =>
                    setQuestions(questions.filter((item) => item.id !== q.id))
                  }
                />
              ))
          )}
        </div>

        {questions.length > 0 && (
          <button
            onClick={onNext}
            className='w-full py-5 bg-slate-900 text-white rounded-2xl text-[12px] font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-indigo-600 transition-all shadow-xl shadow-slate-200'
          >
            Configure Exam Logistics <Settings size={18} />
          </button>
        )}
      </div>
    </div>
  )
}
