// src/app/admin/components/QuizzeManagement.tsx
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
  Clock,
  ChevronDown,
  ChevronUp,
  Tag,
  Key,
  DollarSign,
  Info,
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

/* ------------------------------------------------------------------ */
/* Main Component                                                     */
/* ------------------------------------------------------------------ */
export default function QuizzeManagement() {
  const [loading, setLoading] = useState(true)
  const [quizzes, setQuizzes] = useState<QuizItem[]>([])
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [expandedQuizId, setExpandedQuizId] = useState<string | null>(null)

  // Custom Modal States (Replacing window.alert and window.confirm)
  const [feedbackModal, setFeedbackModal] = useState<{
    isOpen: boolean
    type: 'success' | 'error'
    title: string
    message: string
  }>({ isOpen: false, type: 'success', title: '', message: '' })

  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean
    title: string
    message: string
    onConfirm: () => void
  }>({ isOpen: false, title: '', message: '', onConfirm: () => {} })

  // Helper function to trigger custom feedback alert modal
  const showAlert = (
    type: 'success' | 'error',
    title: string,
    message: string,
  ) => {
    setFeedbackModal({ isOpen: true, type, title, message })
  }

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
    } catch (err: unknown) {
      setQuizzes([])
      showAlert(
        'error',
        'Fetch Error',
        err instanceof Error ? err.message : 'Unable to load quizzes.',
      )
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchQuizzes()
  }, [fetchQuizzes])

  // Toggle Quiz Status
  const handleToggleStatus = async (id: string, currentStatus?: boolean) => {
    const token = getAdminToken()
    try {
      const res = await fetch(`${API_BASE_URL}/api/quizzes/${id}/status`, {
        method: 'PATCH',
        headers: {
          accept: '*/*',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      })
      if (!res.ok) throw new Error('Failed to toggle status')
      showAlert(
        'success',
        'Status Updated',
        `Quiz status changed to ${!currentStatus ? 'Active' : 'Inactive'}.`,
      )
      fetchQuizzes()
    } catch (err: unknown) {
      showAlert(
        'error',
        'Action Failed',
        err instanceof Error ? err.message : 'Error toggling status',
      )
    }
  }

  // Delete Quiz Request
  const requestDeleteQuiz = (id: string, title: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'Delete Quiz',
      message: `Are you sure you want to permanently delete "${title}"? This action cannot be undone.`,
      onConfirm: () => executeDeleteQuiz(id),
    })
  }

  // Execute Delete Quiz
  const executeDeleteQuiz = async (id: string) => {
    setConfirmModal((prev) => ({ ...prev, isOpen: false }))
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
      showAlert('success', 'Deleted', 'Quiz deleted successfully.')
      fetchQuizzes()
    } catch (err: unknown) {
      showAlert(
        'error',
        'Delete Error',
        err instanceof Error ? err.message : 'Error deleting quiz',
      )
    }
  }

  return (
    <div className='max-w-6xl mx-auto space-y-6 px-4 py-4'>
      {/* Header */}
      <div className='flex flex-wrap items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm'>
        <div>
          <h1 className='text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5'>
            <div className='p-2 bg-blue-50 text-[#002EFF] rounded-2xl'>
              <HelpCircle size={22} />
            </div>
            Quiz Management
          </h1>
          <p className='text-xs font-semibold text-slate-400 mt-1'>
            Configure assessments, subject structures, time limits, and answer keys
          </p>
        </div>

        <div className='flex items-center gap-2.5'>
          <button
            onClick={fetchQuizzes}
            disabled={loading}
            className='flex items-center gap-2 px-4 py-2.5 bg-slate-50 border border-slate-200 text-slate-600 hover:text-[#002EFF] hover:border-blue-200 rounded-xl text-xs font-bold transition-all active:scale-95'
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>

          <button
            onClick={() => setShowCreateModal(true)}
            className='flex items-center gap-2 px-5 py-2.5 bg-[#002EFF] text-white rounded-xl text-xs font-black uppercase tracking-wider hover:bg-blue-700 transition-all shadow-md shadow-blue-200 active:scale-95'
          >
            <Plus size={16} /> Create Quiz
          </button>
        </div>
      </div>

      {/* Quizzes List */}
      {loading ? (
        <div className='py-24 flex flex-col items-center justify-center gap-3 bg-white rounded-3xl border border-slate-100 shadow-sm'>
          <Loader2 className='animate-spin text-[#002EFF]' size={36} />
          <p className='text-xs font-bold text-slate-400 uppercase tracking-widest'>
            Loading Quizzes...
          </p>
        </div>
      ) : quizzes.length === 0 ? (
        <div className='bg-white rounded-3xl border border-slate-100 p-12 text-center space-y-3 shadow-sm'>
          <div className='h-16 w-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto text-slate-300'>
            <HelpCircle size={32} />
          </div>
          <p className='text-sm font-black text-slate-800 uppercase tracking-wide'>
            No Quizzes Found
          </p>
          <p className='text-xs text-slate-400 max-w-sm mx-auto font-medium'>
            There are currently no created quizzes. Click the button above to add a new quiz with nested subjects and questions.
          </p>
        </div>
      ) : (
        <div className='space-y-4'>
          {quizzes.map((quiz) => {
            const isExpanded = expandedQuizId === quiz._id
            const totalQuestions = quiz.subjects?.reduce(
              (acc, s) => acc + (s.questions?.length || 0),
              0,
            )

            return (
              <div
                key={quiz._id}
                className='bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden transition-all hover:border-slate-200'
              >
                <div className='p-5 flex flex-wrap items-center justify-between gap-4'>
                  <div className='space-y-2 max-w-xl'>
                    <div className='flex items-center flex-wrap gap-2'>
                      <h3 className='text-base font-black text-slate-900 tracking-tight'>
                        {quiz.title}
                      </h3>
                      <span className='text-[10px] font-black uppercase bg-blue-50 text-[#002EFF] px-2.5 py-1 rounded-lg border border-blue-100'>
                        {quiz.type}
                      </span>
                      {quiz.isPaid ? (
                        <span className='text-[10px] font-black uppercase bg-amber-50 text-amber-600 px-2.5 py-1 rounded-lg border border-amber-100 flex items-center gap-1'>
                          ₦{quiz.amount}
                        </span>
                      ) : (
                        <span className='text-[10px] font-black uppercase bg-emerald-50 text-emerald-600 px-2.5 py-1 rounded-lg border border-emerald-100'>
                          Free
                        </span>
                      )}
                      {quiz.accessCode && (
                        <span className='text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md flex items-center gap-1'>
                          <Key size={10} /> {quiz.accessCode}
                        </span>
                      )}
                    </div>
                    {quiz.description && (
                      <p className='text-xs text-slate-500 font-medium leading-relaxed'>
                        {quiz.description}
                      </p>
                    )}
                  </div>

                  <div className='flex items-center gap-2'>
                    <button
                      onClick={() =>
                        handleToggleStatus(quiz._id, quiz.isActive !== false)
                      }
                      className={`flex items-center gap-1.5 text-[11px] font-black uppercase px-3.5 py-2 rounded-xl transition-all ${
                        quiz.isActive !== false
                          ? 'bg-emerald-50 text-emerald-600 border border-emerald-100 hover:bg-emerald-100'
                          : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                      }`}
                    >
                      <Power size={13} />
                      {quiz.isActive !== false ? 'Active' : 'Inactive'}
                    </button>

                    <button
                      onClick={() =>
                        setExpandedQuizId(isExpanded ? null : quiz._id)
                      }
                      className='flex items-center gap-1.5 text-[11px] font-black uppercase px-3.5 py-2 bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200/60 rounded-xl transition-all'
                    >
                      <Layers size={13} className='text-[#002EFF]' />
                      <span>
                        {quiz.subjects?.length || 0} Subjects ({totalQuestions} Qs)
                      </span>
                      {isExpanded ? (
                        <ChevronUp size={13} />
                      ) : (
                        <ChevronDown size={13} />
                      )}
                    </button>

                    <button
                      onClick={() => requestDeleteQuiz(quiz._id, quiz.title)}
                      className='p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition-colors border border-transparent hover:border-rose-100'
                      title='Delete Quiz'
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                {/* Collapsible Subjects & Questions Breakdown */}
                {isExpanded && (
                  <div className='bg-slate-50/70 border-t border-slate-100 p-5 space-y-4'>
                    <div className='flex items-center justify-between'>
                      <h4 className='text-[10px] font-black uppercase tracking-widest text-slate-400'>
                        Subject &amp; Question Details
                      </h4>
                      <span className='text-[11px] font-bold text-slate-500'>
                        Created: {quiz.createdAt ? new Date(quiz.createdAt).toLocaleDateString() : 'N/A'}
                      </span>
                    </div>

                    {quiz.subjects?.map((subj, idx) => (
                      <div
                        key={idx}
                        className='bg-white rounded-2xl p-4 border border-slate-200/70 shadow-xs space-y-3'
                      >
                        <div className='flex items-center justify-between border-b border-slate-100 pb-3'>
                          <span className='text-xs font-black text-slate-800 flex items-center gap-2'>
                            <BookOpen size={15} className='text-[#002EFF]' />
                            {subj.name}
                          </span>
                          <span className='text-[10px] font-bold text-slate-500 bg-slate-50 border border-slate-100 px-2.5 py-1 rounded-lg flex items-center gap-1.5'>
                            <Clock size={12} className='text-amber-500' />{' '}
                            {subj.timeLimit} mins • {subj.questions?.length || 0} Questions
                          </span>
                        </div>

                        <div className='space-y-3 pl-2'>
                          {subj.questions?.map((q, qIdx) => (
                            <div
                              key={qIdx}
                              className='bg-slate-50/50 rounded-xl p-3 border border-slate-100 space-y-2'
                            >
                              <p className='text-xs font-bold text-slate-800'>
                                <span className='text-[#002EFF] font-black mr-1'>
                                  Q{qIdx + 1}.
                                </span>{' '}
                                {q.questionText}
                              </p>

                              <div className='grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1'>
                                {q.options.map((opt, oIdx) => {
                                  const isCorrect = opt === q.correctAnswer
                                  return (
                                    <div
                                      key={oIdx}
                                      className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center justify-between ${
                                        isCorrect
                                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold'
                                          : 'bg-white text-slate-600 border border-slate-100'
                                      }`}
                                    >
                                      <span>
                                        <strong className='mr-1.5 text-[10px] opacity-70'>
                                          {String.fromCharCode(65 + oIdx)}.
                                        </strong>
                                        {opt}
                                      </span>
                                      {isCorrect && (
                                        <CheckCircle2
                                          size={13}
                                          className='text-emerald-600 shrink-0'
                                        />
                                      )}
                                    </div>
                                  )
                                })}
                              </div>

                              {q.explanation && (
                                <p className='text-[11px] text-slate-500 bg-blue-50/40 p-2 rounded-lg border border-blue-50/60 mt-1 italic'>
                                  <strong>Explanation:</strong> {q.explanation}
                                </p>
                              )}
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
            showAlert(
              'success',
              'Quiz Created',
              'The new quiz has been saved successfully.',
            )
            fetchQuizzes()
          }}
          showAlert={showAlert}
        />
      )}

      {/* Custom Confirmation Modal */}
      {confirmModal.isOpen && (
        <ConfirmModal
          title={confirmModal.title}
          message={confirmModal.message}
          onConfirm={confirmModal.onConfirm}
          onCancel={() =>
            setConfirmModal((prev) => ({ ...prev, isOpen: false }))
          }
        />
      )}

      {/* Custom Feedback Modal (Alert) */}
      {feedbackModal.isOpen && (
        <FeedbackModal
          type={feedbackModal.type}
          title={feedbackModal.title}
          message={feedbackModal.message}
          onClose={() =>
            setFeedbackModal((prev) => ({ ...prev, isOpen: false }))
          }
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
  showAlert,
}: {
  onClose: () => void
  onSuccess: () => void
  showAlert: (type: 'success' | 'error', title: string, message: string) => void
}) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [type, setType] = useState<'practice' | 'exam' | 'assessment'>(
    'practice',
  )
  const [isPaid, setIsPaid] = useState(false)
  const [amount, setAmount] = useState<number>(0)
  const [accessCode, setAccessCode] = useState('')

  // Nested subjects state initialization
  const [subjects, setSubjects] = useState<QuizSubject[]>([
    {
      name: 'General Knowledge',
      timeLimit: 20,
      questions: [
        {
          questionText: '',
          options: ['', '', '', ''],
          correctAnswer: '',
          explanation: '',
        },
      ],
    },
  ])

  const [submitting, setSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  // Handlers for dynamic subject & question updates
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
            explanation: '',
          },
        ],
      },
    ])
  }

  const removeSubject = (sIdx: number) => {
    setSubjects(subjects.filter((_, i) => i !== sIdx))
  }

  const addQuestion = (sIdx: number) => {
    const updated = [...subjects]
    updated[sIdx].questions.push({
      questionText: '',
      options: ['', '', '', ''],
      correctAnswer: '',
      explanation: '',
    })
    setSubjects(updated)
  }

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

    // Form Validations
    if (!title.trim()) {
      setErrorMsg('Quiz title is required.')
      return
    }

    if (isPaid && amount <= 0) {
      setErrorMsg('Please specify a valid payment amount for paid quizzes.')
      return
    }

    if (subjects.length === 0) {
      setErrorMsg('At least one subject is required.')
      return
    }

    for (let sIdx = 0; sIdx < subjects.length; sIdx++) {
      const subj = subjects[sIdx]
      if (!subj.name.trim()) {
        setErrorMsg(`Subject #${sIdx + 1} needs a valid name.`)
        return
      }
      if (!subj.timeLimit || subj.timeLimit <= 0) {
        setErrorMsg(`Please specify a valid time limit for "${subj.name}".`)
        return
      }
      if (subj.questions.length === 0) {
        setErrorMsg(`Subject "${subj.name}" must contain at least 1 question.`)
        return
      }

      for (let qIdx = 0; qIdx < subj.questions.length; qIdx++) {
        const q = subj.questions[qIdx]
        if (!q.questionText.trim()) {
          setErrorMsg(
            `Question #${qIdx + 1} in "${subj.name}" has no prompt text.`,
          )
          return
        }
        const validOpts = q.options.filter((opt) => opt.trim() !== '')
        if (validOpts.length < 2) {
          setErrorMsg(
            `Question #${qIdx + 1} in "${subj.name}" needs at least two options.`,
          )
          return
        }
        if (!q.correctAnswer || !q.options.includes(q.correctAnswer)) {
          setErrorMsg(
            `Select a valid correct answer for Question #${qIdx + 1} in "${subj.name}".`,
          )
          return
        }
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
      const msg = err instanceof Error ? err.message : 'An error occurred'
      setErrorMsg(msg)
      showAlert('error', 'Creation Error', msg)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto'>
      <div className='w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden my-8'>
        {/* Modal Header */}
        <div className='flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50'>
          <div className='flex items-center gap-3'>
            <div className='h-10 w-10 rounded-xl bg-[#002EFF] text-white flex items-center justify-center shadow-md shadow-blue-200'>
              <HelpCircle size={20} />
            </div>
            <div>
              <h3 className='text-sm font-black text-slate-900 uppercase tracking-wider'>
                Create New Assessment / Quiz
              </h3>
              <p className='text-[10px] font-bold text-slate-400'>
                Define nested subjects, time limits, and answer keys
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className='p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition-colors'
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Form */}
        <form
          onSubmit={handleSubmit}
          className='p-6 space-y-6 max-h-[80vh] overflow-y-auto'
        >
          {errorMsg && (
            <div className='flex items-start gap-2.5 p-3.5 bg-rose-50 border border-rose-100 text-rose-600 rounded-2xl text-xs font-bold'>
              <AlertCircle size={18} className='shrink-0 mt-0.5' />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Configuration Card */}
          <div className='bg-slate-50/60 rounded-2xl p-5 border border-slate-100 space-y-4'>
            <h4 className='text-[10px] font-black uppercase tracking-widest text-[#002EFF] flex items-center gap-1.5'>
              <Tag size={13} /> General Configuration
            </h4>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div className='space-y-1.5 md:col-span-2'>
                <label className='text-[10px] font-black uppercase tracking-wider text-slate-500 block'>
                  Quiz Title <span className='text-rose-500'>*</span>
                </label>
                <input
                  type='text'
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder='e.g. UTME / JAMB Comprehensive Mock Exam'
                  className='w-full h-11 px-3.5 rounded-xl bg-white border border-slate-200 focus:border-[#002EFF] outline-none text-xs font-bold text-slate-800 shadow-xs'
                />
              </div>

              <div className='space-y-1.5 md:col-span-2'>
                <label className='text-[10px] font-black uppercase tracking-wider text-slate-500 block'>
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder='Write a concise overview of what candidates should expect...'
                  rows={2}
                  className='w-full p-3 rounded-xl bg-white border border-slate-200 focus:border-[#002EFF] outline-none text-xs font-medium text-slate-800 shadow-xs'
                />
              </div>

              <div className='space-y-1.5'>
                <label className='text-[10px] font-black uppercase tracking-wider text-slate-500 block'>
                  Type <span className='text-rose-500'>*</span>
                </label>
                <select
                  value={type}
                  onChange={(e) =>
                    setType(
                      e.target.value as 'practice' | 'exam' | 'assessment',
                    )
                  }
                  className='w-full h-11 px-3.5 rounded-xl bg-white border border-slate-200 focus:border-[#002EFF] outline-none text-xs font-bold text-slate-800 shadow-xs'
                >
                  <option value='practice'>Practice Quiz</option>
                  <option value='exam'>Examination</option>
                  <option value='assessment'>Assessment</option>
                </select>
              </div>

              <div className='space-y-1.5'>
                <label className='text-[10px] font-black uppercase tracking-wider text-slate-500 block'>
                  Access Code <span className='text-slate-400'>(Optional)</span>
                </label>
                <input
                  type='text'
                  value={accessCode}
                  onChange={(e) => setAccessCode(e.target.value)}
                  placeholder='e.g. PASS-2026'
                  className='w-full h-11 px-3.5 rounded-xl bg-white border border-slate-200 focus:border-[#002EFF] outline-none text-xs font-bold text-slate-800 shadow-xs'
                />
              </div>

              <div className='flex items-center gap-6 md:col-span-2 pt-2 border-t border-slate-200/60'>
                <label className='flex items-center gap-2.5 cursor-pointer select-none'>
                  <input
                    type='checkbox'
                    checked={isPaid}
                    onChange={(e) => setIsPaid(e.target.checked)}
                    className='w-4 h-4 rounded border-slate-300 text-[#002EFF] focus:ring-[#002EFF]'
                  />
                  <span className='text-xs font-black text-slate-700'>
                    Require Payment Access
                  </span>
                </label>

                {isPaid && (
                  <div className='flex items-center gap-2 flex-1 max-w-xs'>
                    <span className='text-xs font-black text-slate-400'>₦</span>
                    <input
                      type='number'
                      value={amount}
                      onChange={(e) => setAmount(Number(e.target.value))}
                      placeholder='Amount (NGN)'
                      className='w-full h-10 px-3 rounded-xl bg-white border border-slate-200 focus:border-[#002EFF] outline-none text-xs font-bold text-slate-800 shadow-xs'
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Subjects Builder */}
          <div className='space-y-4'>
            <div className='flex items-center justify-between'>
              <div>
                <h4 className='text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5'>
                  <BookOpen size={16} className='text-[#002EFF]' /> Subjects &amp;
                  Questions ({subjects.length})
                </h4>
                <p className='text-[10px] text-slate-400 font-medium'>
                  Organize questions by subject and configure individual time limits
                </p>
              </div>
              <button
                type='button'
                onClick={addSubject}
                className='flex items-center gap-1.5 px-3.5 py-2 bg-blue-50 text-[#002EFF] rounded-xl text-xs font-black uppercase hover:bg-blue-100 transition-all border border-blue-100'
              >
                <Plus size={14} /> Add Subject
              </button>
            </div>

            {subjects.map((subj, sIdx) => (
              <div
                key={sIdx}
                className='bg-slate-50/80 rounded-2xl p-5 border border-slate-200/80 space-y-4 shadow-xs'
              >
                <div className='flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-slate-200/60'>
                  <div className='flex-1 grid grid-cols-1 sm:grid-cols-3 gap-3'>
                    <div className='sm:col-span-2 space-y-1'>
                      <label className='text-[9px] font-black uppercase text-slate-400'>
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
                        placeholder='e.g. Mathematics'
                        className='w-full h-9 px-3 rounded-lg bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 outline-none focus:border-[#002EFF] focus:bg-white'
                      />
                    </div>
                    <div className='space-y-1'>
                      <label className='text-[9px] font-black uppercase text-slate-400'>
                        Time Limit (Minutes) *
                      </label>
                      <input
                        type='number'
                        value={subj.timeLimit}
                        onChange={(e) => {
                          const updated = [...subjects]
                          updated[sIdx].timeLimit = Number(e.target.value)
                          setSubjects(updated)
                        }}
                        className='w-full h-9 px-3 rounded-lg bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 outline-none focus:border-[#002EFF] focus:bg-white'
                      />
                    </div>
                  </div>
                  {subjects.length > 1 && (
                    <button
                      type='button'
                      onClick={() => removeSubject(sIdx)}
                      className='p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors border border-transparent hover:border-rose-100 self-end mb-0.5'
                      title='Remove Subject'
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>

                {/* Questions Builder */}
                <div className='space-y-3 pl-2 sm:pl-4 border-l-2 border-blue-200'>
                  <div className='flex items-center justify-between'>
                    <span className='text-[10px] font-black uppercase text-slate-500 tracking-wider'>
                      Questions for {subj.name || 'Subject'} ({subj.questions.length})
                    </span>
                    <button
                      type='button'
                      onClick={() => addQuestion(sIdx)}
                      className='text-xs font-black text-[#002EFF] hover:underline flex items-center gap-1'
                    >
                      <Plus size={12} /> Add Question
                    </button>
                  </div>

                  {subj.questions.map((q, qIdx) => (
                    <div
                      key={qIdx}
                      className='bg-white rounded-xl p-4 border border-slate-200 space-y-3 shadow-xs'
                    >
                      <div className='flex items-center justify-between gap-2'>
                        <span className='text-[10px] font-black text-[#002EFF] uppercase bg-blue-50 px-2 py-0.5 rounded'>
                          Q{qIdx + 1}
                        </span>
                        <input
                          type='text'
                          value={q.questionText}
                          onChange={(e) => {
                            const updated = [...subjects]
                            updated[sIdx].questions[qIdx].questionText =
                              e.target.value
                            setSubjects(updated)
                          }}
                          placeholder={`Enter question ${qIdx + 1} text...`}
                          className='flex-1 h-9 px-3 rounded-lg bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 outline-none focus:bg-white focus:border-[#002EFF]'
                        />
                        {subj.questions.length > 1 && (
                          <button
                            type='button'
                            onClick={() => removeQuestion(sIdx, qIdx)}
                            className='text-rose-500 p-1.5 hover:bg-rose-50 rounded-lg transition-colors'
                            title='Remove Question'
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>

                      {/* Options Matrix */}
                      <div className='grid grid-cols-1 sm:grid-cols-2 gap-2 pl-2'>
                        {q.options.map((opt, oIdx) => (
                          <div
                            key={oIdx}
                            className='flex items-center gap-1.5'
                          >
                            <span className='text-[10px] font-black text-slate-400 w-4 text-center'>
                              {String.fromCharCode(65 + oIdx)}
                            </span>
                            <input
                              type='text'
                              value={opt}
                              onChange={(e) => {
                                const updated = [...subjects]
                                const newVal = e.target.value
                                const oldVal =
                                  updated[sIdx].questions[qIdx].options[oIdx]
                                updated[sIdx].questions[qIdx].options[oIdx] =
                                  newVal

                                // Update correctAnswer if it matched the old value
                                if (
                                  updated[sIdx].questions[qIdx].correctAnswer ===
                                  oldVal
                                ) {
                                  updated[sIdx].questions[qIdx].correctAnswer =
                                    newVal
                                }

                                setSubjects(updated)
                              }}
                              placeholder={`Option ${String.fromCharCode(65 + oIdx)}`}
                              className='w-full h-8 px-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs font-medium text-slate-700 outline-none focus:bg-white focus:border-[#002EFF]'
                            />
                          </div>
                        ))}
                      </div>

                      {/* Correct Answer Dropdown */}
                      <div className='grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 border-t border-slate-100'>
                        <div className='space-y-1'>
                          <label className='text-[9px] font-black uppercase text-emerald-700 block'>
                            Select Correct Answer *
                          </label>
                          <select
                            value={q.correctAnswer}
                            onChange={(e) => {
                              const updated = [...subjects]
                              updated[sIdx].questions[qIdx].correctAnswer =
                                e.target.value
                              setSubjects(updated)
                            }}
                            className='w-full h-8 px-2 rounded-lg bg-emerald-50/70 border border-emerald-200 text-xs font-bold text-emerald-900 outline-none'
                          >
                            <option value=''>-- Choose Correct Option --</option>
                            {q.options.map(
                              (opt, oIdx) =>
                                opt.trim() !== '' && (
                                  <option key={oIdx} value={opt}>
                                    Option {String.fromCharCode(65 + oIdx)}: {opt}
                                  </option>
                                ),
                            )}
                          </select>
                        </div>

                        <div className='space-y-1'>
                          <label className='text-[9px] font-black uppercase text-slate-400 block'>
                            Explanation (Optional)
                          </label>
                          <input
                            type='text'
                            value={q.explanation || ''}
                            onChange={(e) => {
                              const updated = [...subjects]
                              updated[sIdx].questions[qIdx].explanation =
                                e.target.value
                              setSubjects(updated)
                            }}
                            placeholder='Reason for correct answer...'
                            className='w-full h-8 px-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs font-medium text-slate-700 outline-none'
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className='flex items-center justify-end gap-3 pt-4 border-t border-slate-100'>
            <button
              type='button'
              onClick={onClose}
              className='px-5 h-11 rounded-xl bg-slate-100 text-slate-600 font-bold text-xs hover:bg-slate-200 transition-all'
            >
              Cancel
            </button>
            <button
              type='submit'
              disabled={submitting}
              className='flex items-center justify-center gap-2 px-7 h-11 bg-[#002EFF] text-white rounded-xl font-black text-xs uppercase tracking-wider hover:bg-blue-700 shadow-md shadow-blue-200 transition-all disabled:opacity-50 active:scale-95'
            >
              {submitting ? (
                <Loader2 size={16} className='animate-spin' />
              ) : (
                'Save & Create Quiz'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Reusable Custom Confirmation Modal                                 */
/* ------------------------------------------------------------------ */
function ConfirmModal({
  title,
  message,
  onConfirm,
  onCancel,
}: {
  title: string
  message: string
  onConfirm: () => void
  onCancel: () => void
}) {
  return (
    <div className='fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs'>
      <div className='w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-slate-100 space-y-4 animate-in fade-in zoom-in-95 duration-150'>
        <div className='flex items-center gap-3 text-rose-600'>
          <div className='p-2.5 bg-rose-50 rounded-2xl'>
            <AlertCircle size={22} />
          </div>
          <h3 className='text-base font-black text-slate-900'>{title}</h3>
        </div>

        <p className='text-xs text-slate-500 font-medium leading-relaxed'>
          {message}
        </p>

        <div className='flex items-center justify-end gap-2.5 pt-2'>
          <button
            onClick={onCancel}
            className='px-4 py-2.5 rounded-xl bg-slate-100 text-slate-600 text-xs font-bold hover:bg-slate-200 transition-all'
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className='px-5 py-2.5 rounded-xl bg-rose-600 text-white text-xs font-black uppercase tracking-wider hover:bg-rose-700 shadow-md shadow-rose-200 transition-all active:scale-95'
          >
            Confirm Delete
          </button>
        </div>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Reusable Custom Alert / Feedback Modal                             */
/* ------------------------------------------------------------------ */
function FeedbackModal({
  type,
  title,
  message,
  onClose,
}: {
  type: 'success' | 'error'
  title: string
  message: string
  onClose: () => void
}) {
  const isSuccess = type === 'success'

  return (
    <div className='fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs'>
      <div className='w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-slate-100 space-y-4 animate-in fade-in zoom-in-95 duration-150'>
        <div className='flex items-center gap-3'>
          <div
            className={`p-2.5 rounded-2xl ${
              isSuccess
                ? 'bg-emerald-50 text-emerald-600'
                : 'bg-rose-50 text-rose-600'
            }`}
          >
            {isSuccess ? <CheckCircle2 size={24} /> : <AlertCircle size={24} />}
          </div>
          <div>
            <h3 className='text-base font-black text-slate-900'>{title}</h3>
            <p className='text-[10px] font-bold text-slate-400 uppercase tracking-wider'>
              System Alert
            </p>
          </div>
        </div>

        <p className='text-xs text-slate-600 font-medium leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100'>
          {message}
        </p>

        <div className='flex items-center justify-end pt-2'>
          <button
            onClick={onClose}
            className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider text-white shadow-md transition-all active:scale-95 ${
              isSuccess
                ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200'
                : 'bg-rose-600 hover:bg-rose-700 shadow-rose-200'
            }`}
          >
            Acknowledge
          </button>
        </div>
      </div>
    </div>
  )
}