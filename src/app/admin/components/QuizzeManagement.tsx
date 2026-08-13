//src/app/admin/components/QuizzeManagement.tsx
'use client'

import React, { useEffect, useState, useCallback } from 'react'
import {
  HelpCircle,
  Plus,
  Trash2,
  Power,
  Loader2,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  X,
  Layers,
  BookOpen,
  DollarSign,
  Clock,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'
import { getAdminToken } from '@/lib/admin-auth'

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  'https://api.distinguishedscholarsacademy.com'

export interface QuizQuestion {
  questionText: string
  options: string[]
  correctAnswer: string
  explanation?: string
}

export interface QuizSubject {
  name: string
  timeLimit: number // in minutes
  questions: QuizQuestion[]
}

export interface QuizItem {
  _id: string
  title: string
  description?: string
  type: 'practice' | 'exam' | 'assessment'
  isPaid: boolean
  amount: number
  accessCode?: string
  isActive?: boolean
  subjects: QuizSubject[]
  createdAt?: string
}

export default function QuizzeManagement() {
  const [loading, setLoading] = useState(true)
  const [quizzes, setQuizzes] = useState<QuizItem[]>([])
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [expandedQuizId, setExpandedQuizId] = useState<string | null>(null)
  const [statusMsg, setStatusMsg] = useState<{
    type: 'error' | 'success'
    text: string
  } | null>(null)

  // Fetch all quizzes (Admin Only)
  const fetchQuizzes = useCallback(async () => {
    setLoading(true)
    const token = getAdminToken()
    try {
      const res = await fetch(`${API_BASE_URL}/api/quizzes`, {
        method: 'GET',
        headers: {
          accept: '*/*',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      })
      if (!res.ok) throw new Error('Failed to fetch quizzes')
      const data = await res.json()
      if (data?.success && Array.isArray(data?.data)) {
        setQuizzes(data.data)
      } else {
        setQuizzes([])
      }
    } catch {
      setQuizzes([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchQuizzes()
  }, [fetchQuizzes])

  // Toggle Quiz Status
  const handleToggleStatus = async (id: string) => {
    const token = getAdminToken()
    try {
      const res = await fetch(`${API_BASE_URL}/api/quizzes/${id}/status`, {
        method: 'PATCH',
        headers: {
          accept: '*/*',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      })
      if (!res.ok) throw new Error('Failed to toggle quiz status')
      fetchQuizzes()
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Error toggling status')
    }
  }

  // Delete Quiz
  const handleDeleteQuiz = async (id: string) => {
    if (!confirm('Are you sure you want to delete this quiz?')) return
    const token = getAdminToken()
    try {
      const res = await fetch(`${API_BASE_URL}/api/quizzes/${id}`, {
        method: 'DELETE',
        headers: {
          accept: '*/*',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      })
      if (!res.ok) throw new Error('Failed to delete quiz')
      fetchQuizzes()
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Error deleting quiz')
    }
  }

  return (
    <div className='max-w-6xl mx-auto space-y-6 px-4 py-2'>
      {/* Header */}
      <div className='flex flex-wrap items-center justify-between gap-4'>
        <div>
          <h1 className='text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2'>
            <HelpCircle className='text-[#002EFF]' size={24} /> Quiz Management
          </h1>
          <p className='text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-1'>
            Manage assessments, nested subjects, and exam questions
          </p>
        </div>

        <div className='flex items-center gap-2'>
          <button
            onClick={fetchQuizzes}
            disabled={loading}
            className='flex items-center gap-1.5 px-3.5 py-2 bg-white border border-slate-200 text-slate-600 hover:text-[#002EFF] rounded-xl text-xs font-bold transition-all shadow-sm'
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>

          <button
            onClick={() => setShowCreateModal(true)}
            className='flex items-center gap-1.5 px-4 py-2 bg-[#002EFF] text-white rounded-xl text-xs font-black uppercase tracking-wider hover:bg-blue-700 transition-all shadow-md shadow-blue-200 active:scale-95'
          >
            <Plus size={16} /> Create Quiz
          </button>
        </div>
      </div>

      {statusMsg && (
        <div
          className={`flex items-center gap-2 p-3 rounded-xl text-xs font-bold ${
            statusMsg.type === 'error'
              ? 'bg-rose-50 text-rose-600 border border-rose-100'
              : 'bg-emerald-50 text-emerald-600 border border-emerald-100'
          }`}
        >
          {statusMsg.type === 'error' ? (
            <AlertCircle size={16} />
          ) : (
            <CheckCircle2 size={16} />
          )}
          <span>{statusMsg.text}</span>
        </div>
      )}

      {/* Quizzes List */}
      {loading ? (
        <div className='py-20 flex justify-center'>
          <Loader2 className='animate-spin text-[#002EFF]' size={32} />
        </div>
      ) : quizzes.length === 0 ? (
        <div className='bg-white rounded-3xl border border-slate-100 p-12 text-center space-y-3 shadow-sm'>
          <HelpCircle size={36} className='mx-auto text-slate-300' />
          <p className='text-sm font-black text-slate-700 uppercase'>
            No quizzes available
          </p>
          <p className='text-xs text-slate-400 max-w-sm mx-auto'>
            Create your first quiz with nested subjects and questions using the
            button above.
          </p>
        </div>
      ) : (
        <div className='space-y-3'>
          {quizzes.map((quiz) => {
            const isExpanded = expandedQuizId === quiz._id
            return (
              <div
                key={quiz._id}
                className='bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden transition-all hover:border-slate-200'
              >
                <div className='p-5 flex flex-wrap items-center justify-between gap-4'>
                  <div className='space-y-1'>
                    <div className='flex items-center gap-2'>
                      <h3 className='text-sm font-black text-slate-900 tracking-tight'>
                        {quiz.title}
                      </h3>
                      <span className='text-[9px] font-black uppercase bg-blue-50 text-[#002EFF] px-2 py-0.5 rounded'>
                        {quiz.type}
                      </span>
                      {quiz.isPaid && (
                        <span className='text-[9px] font-black uppercase bg-amber-50 text-amber-600 px-2 py-0.5 rounded'>
                          ₦{quiz.amount}
                        </span>
                      )}
                    </div>
                    {quiz.description && (
                      <p className='text-xs text-slate-500 font-medium'>
                        {quiz.description}
                      </p>
                    )}
                  </div>

                  <div className='flex items-center gap-3'>
                    <button
                      onClick={() => handleToggleStatus(quiz._id)}
                      className={`flex items-center gap-1 text-[10px] font-black uppercase px-3 py-1.5 rounded-xl transition-all ${
                        quiz.isActive !== false
                          ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                          : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                      }`}
                    >
                      <Power size={13} />{' '}
                      {quiz.isActive !== false ? 'Active' : 'Inactive'}
                    </button>

                    <button
                      onClick={() =>
                        setExpandedQuizId(isExpanded ? null : quiz._id)
                      }
                      className='flex items-center gap-1 text-[10px] font-black uppercase px-3 py-1.5 bg-slate-50 text-slate-600 hover:bg-slate-100 rounded-xl transition-all'
                    >
                      <Layers size={13} /> {quiz.subjects?.length || 0} Subjects{' '}
                      {isExpanded ? (
                        <ChevronUp size={13} />
                      ) : (
                        <ChevronDown size={13} />
                      )}
                    </button>

                    <button
                      onClick={() => handleDeleteQuiz(quiz._id)}
                      className='p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition-colors'
                      title='Delete Quiz'
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                {/* Expanded Subjects & Questions */}
                {isExpanded && (
                  <div className='bg-slate-50/75 border-t border-slate-100 p-5 space-y-4'>
                    <h4 className='text-[10px] font-black uppercase tracking-widest text-slate-400'>
                      Nested Subjects &amp; Questions
                    </h4>
                    {quiz.subjects?.map((subj, idx) => (
                      <div
                        key={idx}
                        className='bg-white rounded-xl p-4 border border-slate-200/60 space-y-3'
                      >
                        <div className='flex items-center justify-between'>
                          <span className='text-xs font-black text-slate-800 flex items-center gap-2'>
                            <BookOpen size={14} className='text-[#002EFF]' />{' '}
                            {subj.name}
                          </span>
                          <span className='text-[10px] font-bold text-slate-400 flex items-center gap-1'>
                            <Clock size={12} /> {subj.timeLimit} mins •{' '}
                            {subj.questions?.length || 0} Questions
                          </span>
                        </div>

                        <div className='space-y-2 pl-4 border-l-2 border-blue-100'>
                          {subj.questions?.map((q, qIdx) => (
                            <div key={qIdx} className='text-xs space-y-1'>
                              <p className='font-bold text-slate-700'>
                                Q{qIdx + 1}. {q.questionText}
                              </p>
                              <div className='flex flex-wrap gap-2 text-[10px]'>
                                {q.options.map((opt, oIdx) => (
                                  <span
                                    key={oIdx}
                                    className={`px-2 py-0.5 rounded-lg font-medium ${
                                      opt === q.correctAnswer
                                        ? 'bg-emerald-50 text-emerald-700 font-bold border border-emerald-200'
                                        : 'bg-slate-100 text-slate-600'
                                    }`}
                                  >
                                    {String.fromCharCode(65 + oIdx)}. {opt}
                                    {opt === q.correctAnswer && ' ✓'}
                                  </span>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Create Quiz Modal */}
      {showCreateModal && (
        <CreateQuizModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false)
            fetchQuizzes()
          }}
        />
      )}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Create Quiz Modal Component                                        */
/* ------------------------------------------------------------------ */
function CreateQuizModal({
  onClose,
  onSuccess,
}: {
  onClose: () => void
  onSuccess: () => void
}) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [type, setType] = useState<'practice' | 'exam' | 'assessment'>(
    'practice',
  )
  const [isPaid, setIsPaid] = useState(false)
  const [amount, setAmount] = useState<number>(0)
  const [accessCode, setAccessCode] = useState('')

  // Nested subjects state
  const [subjects, setSubjects] = useState<QuizSubject[]>([
    {
      name: 'Mathematics',
      timeLimit: 30,
      questions: [
        {
          questionText: 'What is 2 + 2?',
          options: ['3', '4', '5', '6'],
          correctAnswer: '4',
        },
      ],
    },
  ])

  const [submitting, setSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  // Add subject handler
  const addSubject = () => {
    setSubjects([
      ...subjects,
      {
        name: '',
        timeLimit: 20,
        questions: [
          {
            questionText: '',
            options: ['', '', '', ''],
            correctAnswer: '',
          },
        ],
      },
    ])
  }

  // Remove subject
  const removeSubject = (sIdx: number) => {
    setSubjects(subjects.filter((_, i) => i !== sIdx))
  }

  // Add question to subject
  const addQuestion = (sIdx: number) => {
    const updated = [...subjects]
    updated[sIdx].questions.push({
      questionText: '',
      options: ['', '', '', ''],
      correctAnswer: '',
    })
    setSubjects(updated)
  }

  // Remove question
  const removeQuestion = (sIdx: number, qIdx: number) => {
    const updated = [...subjects]
    updated[sIdx].questions = updated[sIdx].questions.filter(
      (_, i) => i !== qIdx,
    )
    setSubjects(updated)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg(null)

    if (!title.trim()) {
      setErrorMsg('Quiz title is required.')
      return
    }

    // Validation matching backend requirements
    for (const subj of subjects) {
      if (!subj.name.trim()) {
        setErrorMsg('Please add a subject name for all subjects.')
        return
      }
      if (!subj.timeLimit || subj.timeLimit <= 0) {
        setErrorMsg(
          `Please add a valid time limit for the subject "${subj.name}".`,
        )
        return
      }
    }

    setSubmitting(true)
    const token = getAdminToken()

    try {
      const payload = {
        title: title.trim(),
        description: description.trim(),
        type,
        isPaid,
        amount: isPaid ? Number(amount) : 0,
        accessCode: accessCode.trim() || undefined,
        subjects,
      }

      const res = await fetch(`${API_BASE_URL}/api/quizzes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          accept: '*/*',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      })

      const data = await res.json()
      if (!res.ok || data.success === false) {
        throw new Error(data?.message || 'Failed to create quiz')
      }

      onSuccess()
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm overflow-y-auto'>
      <div className='w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden my-8'>
        {/* Modal Header */}
        <div className='flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50'>
          <div className='flex items-center gap-2.5'>
            <div className='h-9 w-9 rounded-xl bg-[#002EFF] text-white flex items-center justify-center shadow-md shadow-blue-200'>
              <HelpCircle size={18} />
            </div>
            <div>
              <h3 className='text-xs font-black text-slate-900 uppercase tracking-wider'>
                Create New Quiz
              </h3>
              <p className='text-[9px] font-bold text-slate-400'>
                POST /api/quizzes
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className='p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors'
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Form */}
        <form
          onSubmit={handleSubmit}
          className='p-6 space-y-6 max-h-[75vh] overflow-y-auto'
        >
          {errorMsg && (
            <div className='flex items-start gap-2 p-3 bg-rose-50 border border-rose-100 text-rose-600 rounded-xl text-xs font-bold'>
              <AlertCircle size={16} className='shrink-0 mt-0.5' />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* General Details */}
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div className='space-y-1 md:col-span-2'>
              <label className='text-[9px] font-black uppercase tracking-widest text-slate-400 block'>
                Quiz Title <span className='text-rose-500'>*</span>
              </label>
              <input
                type='text'
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder='e.g. JAMB Mock Exam 2026'
                className='w-full h-10 px-3 rounded-xl bg-slate-50 border border-slate-200 focus:border-[#002EFF] focus:bg-white outline-none text-xs font-bold text-slate-800'
              />
            </div>

            <div className='space-y-1 md:col-span-2'>
              <label className='text-[9px] font-black uppercase tracking-widest text-slate-400 block'>
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder='Brief description of the quiz...'
                rows={2}
                className='w-full p-3 rounded-xl bg-slate-50 border border-slate-200 focus:border-[#002EFF] focus:bg-white outline-none text-xs font-medium text-slate-800'
              />
            </div>

            <div className='space-y-1'>
              <label className='text-[9px] font-black uppercase tracking-widest text-slate-400 block'>
                Type <span className='text-rose-500'>*</span>
              </label>
              <select
                value={type}
                onChange={(e) =>
                  setType(e.target.value as 'practice' | 'exam' | 'assessment')
                }
                className='w-full h-10 px-3 rounded-xl bg-slate-50 border border-slate-200 focus:border-[#002EFF] focus:bg-white outline-none text-xs font-bold text-slate-800'
              >
                <option value='practice'>Practice</option>
                <option value='exam'>Exam</option>
                <option value='assessment'>Assessment</option>
              </select>
            </div>

            <div className='space-y-1'>
              <label className='text-[9px] font-black uppercase tracking-widest text-slate-400 block'>
                Access Code <span className='text-slate-300'>(Optional)</span>
              </label>
              <input
                type='text'
                value={accessCode}
                onChange={(e) => setAccessCode(e.target.value)}
                placeholder='e.g. DSA-2026'
                className='w-full h-10 px-3 rounded-xl bg-slate-50 border border-slate-200 focus:border-[#002EFF] focus:bg-white outline-none text-xs font-bold text-slate-800'
              />
            </div>

            <div className='flex items-center gap-4 md:col-span-2 pt-2'>
              <label className='flex items-center gap-2 cursor-pointer'>
                <input
                  type='checkbox'
                  checked={isPaid}
                  onChange={(e) => setIsPaid(e.target.checked)}
                  className='w-4 h-4 rounded text-[#002EFF] focus:ring-[#002EFF]'
                />
                <span className='text-xs font-bold text-slate-700'>
                  Is Paid Quiz?
                </span>
              </label>

              {isPaid && (
                <div className='flex items-center gap-2 flex-1 max-w-xs'>
                  <span className='text-xs font-black text-slate-400'>₦</span>
                  <input
                    type='number'
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    placeholder='Amount'
                    className='w-full h-10 px-3 rounded-xl bg-slate-50 border border-slate-200 focus:border-[#002EFF] focus:bg-white outline-none text-xs font-bold text-slate-800'
                  />
                </div>
              )}
            </div>
          </div>

          <hr className='border-slate-100' />

          {/* Nested Subjects Builder */}
          <div className='space-y-4'>
            <div className='flex items-center justify-between'>
              <h4 className='text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5'>
                <BookOpen size={14} className='text-[#002EFF]' /> Nested
                Subjects ({subjects.length})
              </h4>
              <button
                type='button'
                onClick={addSubject}
                className='flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-[#002EFF] rounded-xl text-[10px] font-black uppercase hover:bg-blue-100 transition-all'
              >
                <Plus size={13} /> Add Subject
              </button>
            </div>

            {subjects.map((subj, sIdx) => (
              <div
                key={sIdx}
                className='bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-4'
              >
                <div className='flex items-center justify-between gap-3'>
                  <div className='flex-1 grid grid-cols-1 sm:grid-cols-3 gap-3'>
                    <div className='sm:col-span-2 space-y-1'>
                      <label className='text-[8px] font-black uppercase text-slate-400'>
                        Subject Name *
                      </label>
                      <input
                        type='text'
                        value={subj.name}
                        onChange={(e) => {
                          const updated = [...subjects]
                          updated[sIdx].name = e.target.value
                          setSubjects(updated)
                        }}
                        placeholder='e.g. Use of English'
                        className='w-full h-9 px-3 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-800 outline-none'
                      />
                    </div>
                    <div className='space-y-1'>
                      <label className='text-[8px] font-black uppercase text-slate-400'>
                        Time Limit (Mins) *
                      </label>
                      <input
                        type='number'
                        value={subj.timeLimit}
                        onChange={(e) => {
                          const updated = [...subjects]
                          updated[sIdx].timeLimit = Number(e.target.value)
                          setSubjects(updated)
                        }}
                        className='w-full h-9 px-3 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-800 outline-none'
                      />
                    </div>
                  </div>
                  {subjects.length > 1 && (
                    <button
                      type='button'
                      onClick={() => removeSubject(sIdx)}
                      className='p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition-colors self-end mb-0.5'
                      title='Remove Subject'
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>

                {/* Questions Builder */}
                <div className='space-y-3 pl-3 border-l-2 border-blue-200'>
                  <div className='flex items-center justify-between'>
                    <span className='text-[10px] font-black uppercase text-slate-500'>
                      Questions ({subj.questions.length})
                    </span>
                    <button
                      type='button'
                      onClick={() => addQuestion(sIdx)}
                      className='text-[10px] font-bold text-[#002EFF] hover:underline'
                    >
                      + Add Question
                    </button>
                  </div>

                  {subj.questions.map((q, qIdx) => (
                    <div
                      key={qIdx}
                      className='bg-white rounded-xl p-3 border border-slate-200 space-y-2'
                    >
                      <div className='flex items-center justify-between gap-2'>
                        <input
                          type='text'
                          value={q.questionText}
                          onChange={(e) => {
                            const updated = [...subjects]
                            updated[sIdx].questions[qIdx].questionText =
                              e.target.value
                            setSubjects(updated)
                          }}
                          placeholder={`Question ${qIdx + 1} text`}
                          className='w-full h-8 px-2 rounded-lg bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 outline-none'
                        />
                        {subj.questions.length > 1 && (
                          <button
                            type='button'
                            onClick={() => removeQuestion(sIdx, qIdx)}
                            className='text-rose-500 p-1 hover:bg-rose-50 rounded'
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>

                      {/* Options */}
                      <div className='grid grid-cols-2 gap-2'>
                        {q.options.map((opt, oIdx) => (
                          <input
                            key={oIdx}
                            type='text'
                            value={opt}
                            onChange={(e) => {
                              const updated = [...subjects]
                              updated[sIdx].questions[qIdx].options[oIdx] =
                                e.target.value
                              setSubjects(updated)
                            }}
                            placeholder={`Option ${String.fromCharCode(65 + oIdx)}`}
                            className='w-full h-8 px-2 rounded-lg bg-slate-50 border border-slate-200 text-xs font-medium text-slate-700 outline-none'
                          />
                        ))}
                      </div>

                      {/* Correct Answer */}
                      <div className='space-y-1 pt-1'>
                        <label className='text-[8px] font-black uppercase text-slate-400'>
                          Correct Answer (Must match one option exactly)
                        </label>
                        <input
                          type='text'
                          value={q.correctAnswer}
                          onChange={(e) => {
                            const updated = [...subjects]
                            updated[sIdx].questions[qIdx].correctAnswer =
                              e.target.value
                            setSubjects(updated)
                          }}
                          placeholder='e.g. 4'
                          className='w-full h-8 px-2 rounded-lg bg-emerald-50/50 border border-emerald-200 text-xs font-bold text-emerald-800 outline-none'
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Modal Actions */}
          <div className='flex items-center justify-end gap-2 pt-4 border-t border-slate-100'>
            <button
              type='button'
              onClick={onClose}
              className='px-4 h-10 rounded-xl bg-slate-100 text-slate-600 font-bold text-xs hover:bg-slate-200 transition-all'
            >
              Cancel
            </button>
            <button
              type='submit'
              disabled={submitting}
              className='flex items-center justify-center gap-2 px-6 h-10 bg-[#002EFF] text-white rounded-xl font-black text-xs uppercase tracking-wider hover:bg-blue-700 shadow-md shadow-blue-200 transition-all disabled:opacity-50 active:scale-95'
            >
              {submitting ? (
                <Loader2 size={16} className='animate-spin' />
              ) : (
                'Create Quiz'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}