// import React, { useState } from 'react'
// import { useQuizManagement } from './useQuizManagement'
// import { QuizModal } from './QuizModal'
// import { Quiz } from './types'

// export const QuizManagement: React.FC = () => {
//   const {
//     quizzes,
//     loading,
//     error,
//     createQuiz,
//     updateQuiz,
//     deleteQuiz,
//     toggleStatus,
//   } = useQuizManagement()

//   const [isModalOpen, setIsModalOpen] = useState(false)
//   const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null)
//   const [searchQuery, setSearchQuery] = useState('')
//   const [typeFilter, setTypeFilter] = useState<'all' | 'general' | 'singular'>(
//     'all',
//   )

//   const handleOpenCreate = () => {
//     setSelectedQuiz(null)
//     setIsModalOpen(true)
//   }

//   const handleOpenEdit = (quiz: Quiz) => {
//     setSelectedQuiz(quiz)
//     setIsModalOpen(true)
//   }

//   const handleFormSubmit = async (formData: any) => {
//     if (selectedQuiz) {
//       await updateQuiz(selectedQuiz._id || selectedQuiz.id, formData)
//     } else {
//       await createQuiz(formData)
//     }
//     setIsModalOpen(false)
//   }

//   // Calculate total questions across all subjects in a quiz
//   const getTotalQuestionsCount = (quiz: Quiz): number => {
//     if (!quiz.subjects || !Array.isArray(quiz.subjects)) return 0
//     return quiz.subjects.reduce((acc, subject) => {
//       return acc + (subject.questions?.length || 0)
//     }, 0)
//   }

//   // Filter quizzes based on search & type
//   const filteredQuizzes = quizzes.filter((quiz) => {
//     const matchesSearch =
//       quiz.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
//       quiz.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
//       quiz.accessCode?.toLowerCase().includes(searchQuery.toLowerCase())
//     const matchesType = typeFilter === 'all' || quiz.type === typeFilter
//     return matchesSearch && matchesType
//   })

//   return (
//     <div className='p-6 max-w-7xl mx-auto space-y-6 relative'>
//       {/* Top Bar Header */}
//       <div className='flex items-center justify-between gap-4'>
//         <div>
//           <h1 className='text-2xl font-black text-slate-900 tracking-tight'>
//             Quiz Management
//           </h1>
//           <p className='text-xs font-semibold text-slate-500 mt-0.5'>
//             Manage, configure, and monitor all student assessments
//           </p>
//         </div>
//         <button
//           type='button'
//           onClick={handleOpenCreate}
//           className='h-11 px-5 rounded-xl bg-[#002EFF] hover:bg-[#0028e0] text-white text-xs font-black uppercase tracking-wider transition-colors shadow-xs cursor-pointer flex items-center gap-2'
//         >
//           <span>+</span> Create Quiz
//         </button>
//       </div>

//       {/* Control Tools / Filters */}
//       <div className='flex flex-col sm:flex-row gap-3'>
//         <input
//           type='text'
//           placeholder='Search by title, description, or access code...'
//           value={searchQuery}
//           onChange={(e) => setSearchQuery(e.target.value)}
//           className='flex-1 h-11 px-4 rounded-xl bg-white border border-slate-200 focus:border-[#002EFF] outline-none text-xs font-bold text-slate-800 shadow-xs placeholder:text-slate-400'
//         />
//         <select
//           value={typeFilter}
//           onChange={(e) =>
//             setTypeFilter(e.target.value as 'all' | 'general' | 'singular')
//           }
//           className='h-11 px-4 rounded-xl bg-white border border-slate-200 focus:border-[#002EFF] outline-none text-xs font-bold text-slate-800 shadow-xs cursor-pointer'
//         >
//           <option value='all'>All Types</option>
//           <option value='singular'>Singular</option>
//           <option value='general'>General</option>
//         </select>
//       </div>

//       {/* Inline Error Notice */}
//       {error && (
//         <div className='p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center justify-between'>
//           <span>{error}</span>
//         </div>
//       )}

//       {/* Content Area */}
//       {loading && quizzes.length === 0 ? (
//         <div className='p-16 text-center text-xs font-bold text-slate-400'>
//           Loading quizzes...
//         </div>
//       ) : filteredQuizzes.length === 0 ? (
//         <div className='p-12 text-center bg-white rounded-2xl border border-slate-200 space-y-2 shadow-xs'>
//           <p className='text-sm font-bold text-slate-700'>No quizzes found</p>
//           <p className='text-xs text-slate-400'>
//             {searchQuery || typeFilter !== 'all'
//               ? 'Try adjusting your search query or filter.'
//               : 'Click "Create Quiz" above to set up your first evaluation.'}
//           </p>
//         </div>
//       ) : (
//         <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
//           {filteredQuizzes.map((quiz) => (
//             <div
//               key={quiz._id || quiz.id}
//               className='p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between space-y-4 hover:border-slate-300 transition-all'
//             >
//               <div className='space-y-3'>
//                 {/* Badges & Status Header */}
//                 <div className='flex items-center justify-between gap-2'>
//                   <div className='flex items-center gap-1.5 flex-wrap'>
//                     <span className='px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-slate-100 text-slate-700'>
//                       {quiz.type}
//                     </span>
//                     {quiz.fileUrl && (
//                       <a
//                         href={quiz.fileUrl}
//                         target='_blank'
//                         rel='noreferrer'
//                         className='px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors'
//                       >
//                         Attachment
//                       </a>
//                     )}
//                   </div>
//                   <div className='flex items-center gap-1.5'>
//                     <button
//                       type='button'
//                       onClick={() =>
//                         toggleStatus(quiz._id || quiz.id, quiz.isActive)
//                       }
//                       className={`px-2 py-0.5 rounded text-[10px] font-black uppercase transition-colors cursor-pointer ${
//                         quiz.isActive
//                           ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
//                           : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
//                       }`}
//                     >
//                       {quiz.isActive ? 'Active' : 'Inactive'}
//                     </button>
//                     <span
//                       className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded ${
//                         quiz.isPaid
//                           ? 'bg-emerald-50 text-emerald-600'
//                           : 'bg-slate-50 text-slate-500'
//                       }`}
//                     >
//                       {quiz.isPaid
//                         ? `₦${(quiz.amount || 0).toLocaleString()}`
//                         : 'Free'}
//                     </span>
//                   </div>
//                 </div>

//                 {/* Info */}
//                 <div>
//                   <h3 className='text-sm font-black text-slate-900 leading-snug line-clamp-1'>
//                     {quiz.title}
//                   </h3>
//                   {quiz.description && (
//                     <p className='text-xs text-slate-500 line-clamp-2 mt-1 leading-relaxed'>
//                       {quiz.description}
//                     </p>
//                   )}
//                 </div>

//                 {/* Metadata */}
//                 <div className='flex items-center justify-between pt-2 text-[11px] font-bold text-slate-400 border-t border-slate-100'>
//                   <span>
//                     {quiz.subjects?.length || 0} Subject
//                     {(quiz.subjects?.length || 0) === 1 ? '' : 's'} •{' '}
//                     {getTotalQuestionsCount(quiz)} Question
//                     {getTotalQuestionsCount(quiz) === 1 ? '' : 's'}
//                   </span>
//                   {quiz.accessCode && (
//                     <span className='font-mono text-slate-600 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-200'>
//                       {quiz.accessCode}
//                     </span>
//                   )}
//                 </div>
//               </div>

//               {/* Toolbar Actions */}
//               <div className='flex items-center gap-2 pt-3 border-t border-slate-100'>
//                 <button
//                   type='button'
//                   onClick={() => handleOpenEdit(quiz)}
//                   className='flex-1 h-8 rounded-lg bg-slate-900 text-white text-[10px] font-bold uppercase tracking-wider hover:bg-slate-800 transition-colors cursor-pointer'
//                 >
//                   Edit Quiz
//                 </button>
//                 <button
//                   type='button'
//                   onClick={() => deleteQuiz(quiz._id || quiz.id)}
//                   className='h-8 px-3 rounded-lg border border-rose-200 text-rose-600 text-[10px] font-bold uppercase hover:bg-rose-50 transition-colors cursor-pointer'
//                 >
//                   Delete
//                 </button>
//               </div>
//             </div>
//           ))}
//         </div>
//       )}

//       {/* Form Modal */}
//       <QuizModal
//         isOpen={isModalOpen}
//         onClose={() => setIsModalOpen(false)}
//         onSubmit={handleFormSubmit}
//         initialData={selectedQuiz}
//       />
//     </div>
//   )
// }

// export default QuizManagement

import React, { useState } from 'react'
import {
  AlertTriangle,
  Pencil,
  Plus,
  Search,
  Trash2,
  Paperclip,
} from 'lucide-react'
import { useQuizManagement } from './useQuizManagement'
import { QuizModal } from './QuizModal'
import { Quiz } from './types'

// Reusable Confirmation Modal
interface ConfirmModalProps {
  isOpen: boolean
  title: string
  message: string
  confirmText: string
  cancelText?: string
  variant?: 'danger' | 'primary'
  onConfirm: () => void
  onCancel: () => void
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  message,
  confirmText,
  cancelText = 'Cancel',
  variant = 'danger',
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in duration-200'>
      <div className='w-full max-w-sm bg-white rounded-2xl shadow-2xl border border-slate-100 p-6 space-y-4 text-center'>
        <div
          className={`w-12 h-12 rounded-full mx-auto flex items-center justify-center ${
            variant === 'danger'
              ? 'bg-rose-50 text-rose-600'
              : 'bg-blue-50 text-[#002EFF]'
          }`}
        >
          {variant === 'danger' ? (
            <AlertTriangle className='w-6 h-6' />
          ) : (
            <Pencil className='w-5 h-5' />
          )}
        </div>
        <div className='space-y-1'>
          <h3 className='text-sm font-black text-slate-900'>{title}</h3>
          <p className='text-xs font-medium text-slate-500 leading-relaxed'>
            {message}
          </p>
        </div>
        <div className='flex items-center gap-2 pt-2'>
          <button
            type='button'
            onClick={onCancel}
            className='flex-1 h-10 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 transition-colors cursor-pointer'
          >
            {cancelText}
          </button>
          <button
            type='button'
            onClick={onConfirm}
            className={`flex-1 h-10 rounded-xl text-white text-xs font-black uppercase tracking-wider transition-colors cursor-pointer shadow-xs ${
              variant === 'danger'
                ? 'bg-rose-600 hover:bg-rose-700'
                : 'bg-[#002EFF] hover:bg-[#0028e0]'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}

export const QuizManagement: React.FC = () => {
  const {
    quizzes,
    loading,
    error,
    createQuiz,
    updateQuiz,
    deleteQuiz,
    toggleStatus,
  } = useQuizManagement()

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState<'all' | 'general' | 'singular'>(
    'all',
  )

  // Confirmation Alert States
  const [confirmConfig, setConfirmConfig] = useState<{
    isOpen: boolean
    title: string
    message: string
    confirmText: string
    variant: 'danger' | 'primary'
    action: () => Promise<void> | void
  }>({
    isOpen: false,
    title: '',
    message: '',
    confirmText: '',
    variant: 'danger',
    action: () => {},
  })

  const handleOpenCreate = () => {
    setSelectedQuiz(null)
    setIsModalOpen(true)
  }

  // Prompt confirmation before Editing
  const handleOpenEdit = (quiz: Quiz) => {
    setConfirmConfig({
      isOpen: true,
      title: 'Edit Quiz Assessment?',
      message: `Are you sure you want to edit "${quiz.title}"? Unsaved changes in any active form might be lost.`,
      confirmText: 'Yes, Edit',
      variant: 'primary',
      action: () => {
        setSelectedQuiz(quiz)
        setIsModalOpen(true)
      },
    })
  }

  // Prompt confirmation before Deleting
  const handleDeleteQuiz = (quiz: Quiz) => {
    const quizId = quiz._id || quiz.id
    setConfirmConfig({
      isOpen: true,
      title: 'Delete Quiz Assessment?',
      message: `Are you sure you want to permanently delete "${quiz.title}"? This action cannot be undone.`,
      confirmText: 'Yes, Delete',
      variant: 'danger',
      action: async () => {
        await deleteQuiz(quizId)
      },
    })
  }

  const handleFormSubmit = async (formData: any) => {
    if (selectedQuiz) {
      await updateQuiz(selectedQuiz._id || selectedQuiz.id, formData)
    } else {
      await createQuiz(formData)
    }
    setIsModalOpen(false)
  }

  const getTotalQuestionsCount = (quiz: Quiz): number => {
    if (!quiz.subjects || !Array.isArray(quiz.subjects)) return 0
    return quiz.subjects.reduce((acc, subject) => {
      return acc + (subject.questions?.length || 0)
    }, 0)
  }

  const filteredQuizzes = quizzes.filter((quiz) => {
    const matchesSearch =
      quiz.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      quiz.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      quiz.accessCode?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesType = typeFilter === 'all' || quiz.type === typeFilter
    return matchesSearch && matchesType
  })

  return (
    <div className='p-6 max-w-7xl mx-auto space-y-6 relative'>
      {/* Top Bar Header */}
      <div className='flex items-center justify-between gap-4'>
        <div>
          <h1 className='text-2xl font-black text-slate-900 tracking-tight'>
            Quiz Management
          </h1>
          <p className='text-xs font-semibold text-slate-500 mt-0.5'>
            Manage, configure, and monitor all student assessments
          </p>
        </div>
        <button
          type='button'
          onClick={handleOpenCreate}
          className='h-11 px-5 rounded-xl bg-[#002EFF] hover:bg-[#0028e0] text-white text-xs font-black uppercase tracking-wider transition-colors shadow-xs cursor-pointer flex items-center gap-2'
        >
          <Plus className='w-4 h-4' /> Create Quiz
        </button>
      </div>

      {/* Control Tools / Filters */}
      <div className='flex flex-col sm:flex-row gap-3'>
        <div className='relative flex-1'>
          <Search className='w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none' />
          <input
            type='text'
            placeholder='Search by title, description, or access code...'
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className='w-full h-11 pl-10 pr-4 rounded-xl bg-white border border-slate-200 focus:border-[#002EFF] outline-none text-xs font-bold text-slate-800 shadow-xs placeholder:text-slate-400'
          />
        </div>
        <select
          value={typeFilter}
          onChange={(e) =>
            setTypeFilter(e.target.value as 'all' | 'general' | 'singular')
          }
          className='h-11 px-4 rounded-xl bg-white border border-slate-200 focus:border-[#002EFF] outline-none text-xs font-bold text-slate-800 shadow-xs cursor-pointer'
        >
          <option value='all'>All Types</option>
          <option value='singular'>Singular</option>
          <option value='general'>General</option>
        </select>
      </div>

      {/* Inline Error Notice */}
      {error && (
        <div className='p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-2'>
          <AlertTriangle className='w-4 h-4 shrink-0' />
          <span>{error}</span>
        </div>
      )}

      {/* Content Area */}
      {loading && quizzes.length === 0 ? (
        <div className='p-16 text-center text-xs font-bold text-slate-400'>
          Loading quizzes...
        </div>
      ) : filteredQuizzes.length === 0 ? (
        <div className='p-12 text-center bg-white rounded-2xl border border-slate-200 space-y-2 shadow-xs'>
          <p className='text-sm font-bold text-slate-700'>No quizzes found</p>
          <p className='text-xs text-slate-400'>
            {searchQuery || typeFilter !== 'all'
              ? 'Try adjusting your search query or filter.'
              : 'Click "Create Quiz" above to set up your first evaluation.'}
          </p>
        </div>
      ) : (
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
          {filteredQuizzes.map((quiz) => (
            <div
              key={quiz._id || quiz.id}
              className='p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between space-y-4 hover:border-slate-300 transition-all'
            >
              <div className='space-y-3'>
                {/* Badges & Status Header */}
                <div className='flex items-center justify-between gap-2'>
                  <div className='flex items-center gap-1.5 flex-wrap'>
                    <span className='px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-slate-100 text-slate-700'>
                      {quiz.type}
                    </span>
                    {quiz.fileUrl && (
                      <a
                        href={quiz.fileUrl}
                        target='_blank'
                        rel='noreferrer'
                        className='inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors'
                      >
                        <Paperclip className='w-3 h-3' />
                        Attachment
                      </a>
                    )}
                  </div>
                  <div className='flex items-center gap-1.5'>
                    <button
                      type='button'
                      onClick={() =>
                        toggleStatus(quiz._id || quiz.id, quiz.isActive)
                      }
                      className={`px-2 py-0.5 rounded text-[10px] font-black uppercase transition-colors cursor-pointer ${
                        quiz.isActive
                          ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                          : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                      }`}
                    >
                      {quiz.isActive ? 'Active' : 'Inactive'}
                    </button>
                    <span
                      className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded ${
                        quiz.isPaid
                          ? 'bg-emerald-50 text-emerald-600'
                          : 'bg-slate-50 text-slate-500'
                      }`}
                    >
                      {quiz.isPaid
                        ? `₦${(quiz.amount || 0).toLocaleString()}`
                        : 'Free'}
                    </span>
                  </div>
                </div>

                {/* Info */}
                <div>
                  <h3 className='text-sm font-black text-slate-900 leading-snug line-clamp-1'>
                    {quiz.title}
                  </h3>
                  {quiz.description && (
                    <p className='text-xs text-slate-500 line-clamp-2 mt-1 leading-relaxed'>
                      {quiz.description}
                    </p>
                  )}
                </div>

                {/* Metadata */}
                <div className='flex items-center justify-between pt-2 text-[11px] font-bold text-slate-400 border-t border-slate-100'>
                  <span>
                    {quiz.subjects?.length || 0} Subject
                    {(quiz.subjects?.length || 0) === 1 ? '' : 's'} •{' '}
                    {getTotalQuestionsCount(quiz)} Question
                    {getTotalQuestionsCount(quiz) === 1 ? '' : 's'}
                  </span>
                  {quiz.accessCode && (
                    <span className='font-mono text-slate-600 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-200'>
                      {quiz.accessCode}
                    </span>
                  )}
                </div>
              </div>

              {/* Toolbar Actions */}
              <div className='flex items-center gap-2 pt-3 border-t border-slate-100'>
                <button
                  type='button'
                  onClick={() => handleOpenEdit(quiz)}
                  className='flex-1 h-8 rounded-lg bg-slate-900 text-white text-[10px] font-bold uppercase tracking-wider hover:bg-slate-800 transition-colors cursor-pointer flex items-center justify-center gap-1.5'
                >
                  <Pencil className='w-3 h-3' />
                  Edit Quiz
                </button>
                <button
                  type='button'
                  onClick={() => handleDeleteQuiz(quiz)}
                  className='h-8 px-3 rounded-lg border border-rose-200 text-rose-600 text-[10px] font-bold uppercase hover:bg-rose-50 transition-colors cursor-pointer flex items-center gap-1'
                >
                  <Trash2 className='w-3 h-3' />
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Confirmation Modal Alert */}
      <ConfirmModal
        isOpen={confirmConfig.isOpen}
        title={confirmConfig.title}
        message={confirmConfig.message}
        confirmText={confirmConfig.confirmText}
        variant={confirmConfig.variant}
        onConfirm={async () => {
          setConfirmConfig((prev) => ({ ...prev, isOpen: false }))
          await confirmConfig.action()
        }}
        onCancel={() =>
          setConfirmConfig((prev) => ({ ...prev, isOpen: false }))
        }
      />

      {/* Form Modal */}
      <QuizModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleFormSubmit}
        initialData={selectedQuiz}
      />
    </div>
  )
}

export default QuizManagement