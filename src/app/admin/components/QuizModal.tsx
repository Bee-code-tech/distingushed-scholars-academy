// // //QuizModal.tsx
// 'use client'

// import React, { useState } from 'react'
// import { QuizFormState, QuizSubject, QuestionItem } from './types'

// interface QuizModalProps {
//   isOpen: boolean
//   onClose: () => void
//   activeTab: 'details' | 'questions'
//   setActiveTab: (tab: 'details' | 'questions') => void
//   formData: QuizFormState
//   setFormData: React.Dispatch<React.SetStateAction<QuizFormState>>
//   onSave: () => Promise<void>
//   saving: boolean
//   uploadingFile: boolean
//   onFileUpload: (file: File) => Promise<void>
//   isEditing: boolean
// }

// export function QuizModal({
//   isOpen,
//   onClose,
//   activeTab,
//   setActiveTab,
//   formData,
//   setFormData,
//   onSave,
//   saving,
//   uploadingFile,
//   onFileUpload,
//   isEditing,
// }: QuizModalProps) {
//   const [selectedSubjectIndex, setSelectedSubjectIndex] = useState<number>(0)

//   // Temporary single question form state for creation
//   const [newQuestion, setNewQuestion] = useState<QuestionItem>({
//     questionText: '',
//     options: ['', ''],
//     correctAnswer: 0,
//     correctAnswerIndex: 0,
//     explanation: '',
//     marks: 1,
//   })

//   if (!isOpen) return null

//   const currentSubject = formData.subjects[selectedSubjectIndex] || {
//     name: 'General',
//     description: '',
//     timeLimit: 30,
//     questions: [],
//   }

//   // Handle updates to basic quiz fields
//   const handleDetailChange = (
//     field: keyof QuizFormState,
//     value: string | number | boolean,
//   ) => {
//     setFormData((prev) => ({
//       ...prev,
//       [field]: value,
//     }))
//   }

//   // File Upload
//   const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0]
//     if (file) {
//       await onFileUpload(file)
//     }
//   }

//   // Subject Handlers
//   const handleAddSubject = () => {
//     const newSubject: QuizSubject = {
//       name: `Subject ${formData.subjects.length + 1}`,
//       description: '',
//       timeLimit: 30,
//       questions: [],
//     }
//     setFormData((prev) => ({
//       ...prev,
//       subjects: [...prev.subjects, newSubject],
//     }))
//     setSelectedSubjectIndex(formData.subjects.length)
//   }

//   const handleUpdateSubject = (field: keyof QuizSubject, value: any) => {
//     setFormData((prev) => ({
//       ...prev,
//       subjects: prev.subjects.map((sub, idx) =>
//         idx === selectedSubjectIndex ? { ...sub, [field]: value } : sub,
//       ),
//     }))
//   }

//   // Option Handlers for New Question
//   const handleOptionChange = (optIndex: number, value: string) => {
//     setNewQuestion((prev) => ({
//       ...prev,
//       options: prev.options.map((opt, idx) => (idx === optIndex ? value : opt)),
//     }))
//   }

//   const handleAddOption = () => {
//     setNewQuestion((prev) => ({
//       ...prev,
//       options: [...prev.options, ''],
//     }))
//   }

//   const handleRemoveOption = (optIndex: number) => {
//     if (newQuestion.options.length <= 2) return
//     setNewQuestion((prev) => {
//       const updatedOptions = prev.options.filter((_, idx) => idx !== optIndex)
//       const adjustedCorrect =
//         prev.correctAnswer >= updatedOptions.length ? 0 : prev.correctAnswer
//       return {
//         ...prev,
//         options: updatedOptions,
//         correctAnswer: adjustedCorrect,
//         correctAnswerIndex: adjustedCorrect,
//       }
//     })
//   }

//   // Add question to subject & global questions list
//   const handleAddQuestion = () => {
//     if (!newQuestion.questionText.trim()) return

//     const questionToAdd: QuestionItem = {
//       ...newQuestion,
//       id: `q-${Date.now()}`,
//       correctAnswerIndex: newQuestion.correctAnswer,
//     }

//     setFormData((prev) => {
//       const updatedSubjects = prev.subjects.map((sub, idx) => {
//         if (idx !== selectedSubjectIndex) return sub
//         return {
//           ...sub,
//           questions: [...(sub.questions || []), questionToAdd],
//         }
//       })

//       const updatedGlobalQuestions = [...(prev.questions || []), questionToAdd]

//       return {
//         ...prev,
//         subjects: updatedSubjects,
//         questions: updatedGlobalQuestions,
//       }
//     })

//     // Reset new question form
//     setNewQuestion({
//       questionText: '',
//       options: ['', ''],
//       correctAnswer: 0,
//       correctAnswerIndex: 0,
//       explanation: '',
//       marks: 1,
//     })
//   }

//   // Remove Question
//   const handleRemoveQuestion = (qIndex: number) => {
//     setFormData((prev) => {
//       const updatedSubjects = prev.subjects.map((sub, idx) => {
//         if (idx !== selectedSubjectIndex) return sub
//         return {
//           ...sub,
//           questions: (sub.questions || []).filter((_, i) => i !== qIndex),
//         }
//       })

//       return {
//         ...prev,
//         subjects: updatedSubjects,
//         questions: (prev.questions || []).filter((_, i) => i !== qIndex),
//       }
//     })
//   }

//   return (
//     <div className='fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in duration-200'>
//       <div className='w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-slate-100 flex flex-col max-h-[90vh] overflow-hidden'>
//         {/* Modal Header */}
//         <div className='px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50'>
//           <div>
//             <h2 className='text-base font-black text-slate-900'>
//               {isEditing ? 'Edit Quiz Assessment' : 'Create New Quiz'}
//             </h2>
//             <p className='text-xs text-slate-500 font-medium'>
//               Configure quiz setup, parameters, and evaluation items
//             </p>
//           </div>
//           <button
//             type='button'
//             onClick={onClose}
//             className='w-8 h-8 rounded-lg bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-700 flex items-center justify-center text-sm font-bold transition-colors cursor-pointer'
//           >
//             ✕
//           </button>
//         </div>

//         {/* Tab Switcher */}
//         <div className='flex border-b border-slate-100 px-6 bg-white'>
//           <button
//             type='button'
//             onClick={() => setActiveTab('details')}
//             className={`py-3 px-4 text-xs font-black uppercase tracking-wider border-b-2 transition-colors cursor-pointer ${
//               activeTab === 'details'
//                 ? 'border-[#002EFF] text-[#002EFF]'
//                 : 'border-transparent text-slate-400 hover:text-slate-600'
//             }`}
//           >
//             1. Quiz Details
//           </button>
//           <button
//             type='button'
//             onClick={() => setActiveTab('questions')}
//             className={`py-3 px-4 text-xs font-black uppercase tracking-wider border-b-2 transition-colors cursor-pointer ${
//               activeTab === 'questions'
//                 ? 'border-[#002EFF] text-[#002EFF]'
//                 : 'border-transparent text-slate-400 hover:text-slate-600'
//             }`}
//           >
//             2. Questions & Subjects (
//             {formData.questions?.length ||
//               formData.subjects.reduce(
//                 (acc, s) => acc + (s.questions?.length || 0),
//                 0,
//               )}
//             )
//           </button>
//         </div>

//         {/* Modal Content Body */}
//         <div className='p-6 overflow-y-auto flex-1 space-y-6'>
//           {activeTab === 'details' ? (
//             <div className='space-y-4'>
//               {/* Title & Type */}
//               <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
//                 <div className='md:col-span-2 space-y-1.5'>
//                   <label className='text-xs font-black text-slate-700 uppercase tracking-wider'>
//                     Quiz Title *
//                   </label>
//                   <input
//                     type='text'
//                     placeholder='e.g., Mathematics Mid-Term Assessment'
//                     value={formData.title}
//                     onChange={(e) =>
//                       handleDetailChange('title', e.target.value)
//                     }
//                     className='w-full h-11 px-4 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 focus:border-[#002EFF] outline-none'
//                   />
//                 </div>
//                 <div className='space-y-1.5'>
//                   <label className='text-xs font-black text-slate-700 uppercase tracking-wider'>
//                     Type
//                   </label>
//                   <select
//                     value={formData.type}
//                     onChange={(e) =>
//                       handleDetailChange(
//                         'type',
//                         e.target.value as 'singular' | 'general',
//                       )
//                     }
//                     className='w-full h-11 px-4 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 focus:border-[#002EFF] outline-none cursor-pointer'
//                   >
//                     <option value='general'>General</option>
//                     <option value='singular'>Singular</option>
//                   </select>
//                 </div>
//               </div>

//               {/* Description */}
//               <div className='space-y-1.5'>
//                 <label className='text-xs font-black text-slate-700 uppercase tracking-wider'>
//                   Description
//                 </label>
//                 <textarea
//                   rows={3}
//                   placeholder='Brief summary or instructions for students...'
//                   value={formData.description}
//                   onChange={(e) =>
//                     handleDetailChange('description', e.target.value)
//                   }
//                   className='w-full p-4 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 focus:border-[#002EFF] outline-none resize-none'
//                 />
//               </div>

//               {/* Payment & Access */}
//               <div className='grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-slate-100'>
//                 <div className='space-y-1.5'>
//                   <label className='text-xs font-black text-slate-700 uppercase tracking-wider'>
//                     Payment Type
//                   </label>
//                   <div className='flex items-center h-11 px-3 rounded-xl border border-slate-200 gap-2'>
//                     <input
//                       type='checkbox'
//                       id='isPaidToggle'
//                       checked={formData.isPaid}
//                       onChange={(e) =>
//                         handleDetailChange('isPaid', e.target.checked)
//                       }
//                       className='w-4 h-4 rounded text-[#002EFF] focus:ring-0 cursor-pointer'
//                     />
//                     <label
//                       htmlFor='isPaidToggle'
//                       className='text-xs font-bold text-slate-700 cursor-pointer'
//                     >
//                       Requires Payment
//                     </label>
//                   </div>
//                 </div>

//                 {formData.isPaid && (
//                   <div className='space-y-1.5'>
//                     <label className='text-xs font-black text-slate-700 uppercase tracking-wider'>
//                       Amount (₦)
//                     </label>
//                     <input
//                       type='number'
//                       value={formData.amount}
//                       onChange={(e) =>
//                         handleDetailChange('amount', Number(e.target.value))
//                       }
//                       className='w-full h-11 px-4 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 focus:border-[#002EFF] outline-none'
//                     />
//                   </div>
//                 )}

//                 <div className='space-y-1.5'>
//                   <label className='text-xs font-black text-slate-700 uppercase tracking-wider'>
//                     Access Code (Optional)
//                   </label>
//                   <input
//                     type='text'
//                     placeholder='e.g., MATH2024'
//                     value={formData.accessCode || ''}
//                     onChange={(e) =>
//                       handleDetailChange('accessCode', e.target.value)
//                     }
//                     className='w-full h-11 px-4 rounded-xl border border-slate-200 text-xs font-bold font-mono text-slate-800 focus:border-[#002EFF] outline-none'
//                   />
//                 </div>
//               </div>

//               {/* File Attachment */}
//               <div className='space-y-1.5 pt-2 border-t border-slate-100'>
//                 <label className='text-xs font-black text-slate-700 uppercase tracking-wider'>
//                   Attachment / Resource Material
//                 </label>
//                 <div className='flex items-center gap-3'>
//                   <input
//                     type='file'
//                     onChange={handleFileChange}
//                     disabled={uploadingFile}
//                     className='text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200 cursor-pointer'
//                   />
//                   {uploadingFile && (
//                     <span className='text-xs font-bold text-slate-400 animate-pulse'>
//                       Uploading...
//                     </span>
//                   )}
//                 </div>
//                 {formData.fileUrl && (
//                   <p className='text-[11px] font-medium text-emerald-600 truncate mt-1'>
//                     Uploaded: {formData.fileUrl}
//                   </p>
//                 )}
//               </div>
//             </div>
//           ) : (
//             <div className='space-y-6'>
//               {/* Subject Tabs Header */}
//               <div className='space-y-2'>
//                 <div className='flex items-center justify-between'>
//                   <label className='text-xs font-black text-slate-700 uppercase tracking-wider'>
//                     Subjects / Sections
//                   </label>
//                   <button
//                     type='button'
//                     onClick={handleAddSubject}
//                     className='px-3 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer'
//                   >
//                     + Add Subject
//                   </button>
//                 </div>
//                 <div className='flex gap-2 overflow-x-auto pb-1'>
//                   {formData.subjects.map((sub, idx) => (
//                     <button
//                       key={idx}
//                       type='button'
//                       onClick={() => setSelectedSubjectIndex(idx)}
//                       className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
//                         selectedSubjectIndex === idx
//                           ? 'bg-slate-900 text-white'
//                           : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
//                       }`}
//                     >
//                       {sub.name || `Subject ${idx + 1}`} (
//                       {sub.questions?.length || 0})
//                     </button>
//                   ))}
//                 </div>
//               </div>

//               {/* Selected Subject Configuration */}
//               <div className='p-4 rounded-xl bg-slate-50 border border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-4'>
//                 <div className='space-y-1'>
//                   <label className='text-[10px] font-black uppercase text-slate-500'>
//                     Subject Name
//                   </label>
//                   <input
//                     type='text'
//                     value={currentSubject.name}
//                     onChange={(e) =>
//                       handleUpdateSubject('name', e.target.value)
//                     }
//                     className='w-full h-9 px-3 rounded-lg bg-white border border-slate-200 text-xs font-bold text-slate-800 focus:border-[#002EFF] outline-none'
//                   />
//                 </div>
//                 <div className='space-y-1'>
//                   <label className='text-[10px] font-black uppercase text-slate-500'>
//                     Time Limit (Minutes)
//                   </label>
//                   <input
//                     type='number'
//                     value={currentSubject.timeLimit}
//                     onChange={(e) =>
//                       handleUpdateSubject('timeLimit', Number(e.target.value))
//                     }
//                     className='w-full h-9 px-3 rounded-lg bg-white border border-slate-200 text-xs font-bold text-slate-800 focus:border-[#002EFF] outline-none'
//                   />
//                 </div>
//               </div>

//               {/* Add New Question Section */}
//               <div className='p-4 rounded-2xl border border-slate-200 space-y-4 bg-white shadow-xs'>
//                 <h3 className='text-xs font-black uppercase tracking-wider text-slate-900'>
//                   Add Question to {currentSubject.name}
//                 </h3>

//                 <div className='space-y-1.5'>
//                   <label className='text-[11px] font-bold text-slate-600'>
//                     Question Text
//                   </label>
//                   <textarea
//                     rows={2}
//                     placeholder='Type question here...'
//                     value={newQuestion.questionText}
//                     onChange={(e) =>
//                       setNewQuestion((prev) => ({
//                         ...prev,
//                         questionText: e.target.value,
//                       }))
//                     }
//                     className='w-full p-3 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 focus:border-[#002EFF] outline-none resize-none'
//                   />
//                 </div>

//                 {/* Options list */}
//                 <div className='space-y-2'>
//                   <label className='text-[11px] font-bold text-slate-600'>
//                     Options & Correct Answer Selection
//                   </label>
//                   {newQuestion.options.map((optionText, optIdx) => (
//                     <div key={optIdx} className='flex items-center gap-2'>
//                       <input
//                         type='radio'
//                         name='correctOption'
//                         checked={newQuestion.correctAnswer === optIdx}
//                         onChange={() =>
//                           setNewQuestion((prev) => ({
//                             ...prev,
//                             correctAnswer: optIdx,
//                             correctAnswerIndex: optIdx,
//                           }))
//                         }
//                         className='w-4 h-4 text-[#002EFF] cursor-pointer'
//                       />
//                       <input
//                         type='text'
//                         placeholder={`Option ${optIdx + 1}`}
//                         value={optionText}
//                         onChange={(e) =>
//                           handleOptionChange(optIdx, e.target.value)
//                         }
//                         className='flex-1 h-9 px-3 rounded-lg border border-slate-200 text-xs font-semibold text-slate-800 focus:border-[#002EFF] outline-none'
//                       />
//                       {newQuestion.options.length > 2 && (
//                         <button
//                           type='button'
//                           onClick={() => handleRemoveOption(optIdx)}
//                           className='h-9 px-2 text-xs text-rose-500 font-bold hover:bg-rose-50 rounded-lg'
//                         >
//                           ✕
//                         </button>
//                       )}
//                     </div>
//                   ))}
//                   <button
//                     type='button'
//                     onClick={handleAddOption}
//                     className='text-xs font-bold text-[#002EFF] hover:underline cursor-pointer'
//                   >
//                     + Add Option
//                   </button>
//                 </div>

//                 {/* Question Explanation & Add Button */}
//                 <div className='grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2'>
//                   <div className='sm:col-span-2 space-y-1'>
//                     <label className='text-[10px] font-bold text-slate-500'>
//                       Explanation (Optional)
//                     </label>
//                     <input
//                       type='text'
//                       placeholder='Reason for correct answer...'
//                       value={newQuestion.explanation || ''}
//                       onChange={(e) =>
//                         setNewQuestion((prev) => ({
//                           ...prev,
//                           explanation: e.target.value,
//                         }))
//                       }
//                       className='w-full h-9 px-3 rounded-lg border border-slate-200 text-xs font-medium text-slate-800 focus:border-[#002EFF] outline-none'
//                     />
//                   </div>
//                   <div className='flex items-end'>
//                     <button
//                       type='button'
//                       onClick={handleAddQuestion}
//                       className='w-full h-9 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-black uppercase tracking-wider transition-colors cursor-pointer'
//                     >
//                       Add Question
//                     </button>
//                   </div>
//                 </div>
//               </div>

//               {/* Questions List inside active Subject */}
//               <div className='space-y-3'>
//                 <h4 className='text-xs font-black uppercase text-slate-500'>
//                   Current Questions ({currentSubject.questions?.length || 0})
//                 </h4>
//                 {(!currentSubject.questions ||
//                   currentSubject.questions.length === 0) && (
//                   <p className='text-xs text-slate-400 italic text-center py-4'>
//                     No questions added to this subject yet.
//                   </p>
//                 )}
//                 {currentSubject.questions?.map((q, idx) => (
//                   <div
//                     key={q.id || idx}
//                     className='p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-start justify-between gap-3'
//                   >
//                     <div className='space-y-1'>
//                       <p className='text-xs font-bold text-slate-800'>
//                         {idx + 1}. {q.questionText}
//                       </p>
//                       <div className='flex flex-wrap gap-2'>
//                         {q.options.map((opt, oIdx) => (
//                           <span
//                             key={oIdx}
//                             className={`text-[10px] px-2 py-0.5 rounded font-semibold ${
//                               (q.correctAnswerIndex ?? q.correctAnswer) === oIdx
//                                 ? 'bg-emerald-100 text-emerald-800 font-bold'
//                                 : 'bg-white border border-slate-200 text-slate-600'
//                             }`}
//                           >
//                             {opt}
//                           </span>
//                         ))}
//                       </div>
//                     </div>
//                     <button
//                       type='button'
//                       onClick={() => handleRemoveQuestion(idx)}
//                       className='text-xs text-rose-600 font-bold hover:bg-rose-100 px-2 py-1 rounded transition-colors cursor-pointer'
//                     >
//                       Delete
//                     </button>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           )}
//         </div>

//         {/* Modal Footer Controls */}
//         <div className='px-6 py-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/50'>
//           <button
//             type='button'
//             onClick={onClose}
//             className='h-10 px-4 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-100 transition-colors cursor-pointer'
//           >
//             Cancel
//           </button>
//           <button
//             type='button'
//             disabled={saving || !formData.title.trim()}
//             onClick={onSave}
//             className='h-10 px-6 rounded-xl bg-[#002EFF] hover:bg-[#0028e0] disabled:opacity-50 text-white text-xs font-black uppercase tracking-wider transition-colors cursor-pointer shadow-xs'
//           >
//             {saving ? 'Saving...' : isEditing ? 'Update Quiz' : 'Save Quiz'}
//           </button>
//         </div>
//       </div>
//     </div>
//   )
// }

'use client'

import React, { useState, useEffect } from 'react'
import { Quiz, CreateQuizPayload, QuizSubject, QuestionOption } from './types'

interface QuizFormState extends Omit<
  CreateQuizPayload,
  'courseId' | 'fileUrl'
> {
  accessCode?: string
  fileUrl?: string | null
  courseId?: string | null
  questions?: QuestionOption[]
}

interface QuizModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: CreateQuizPayload) => Promise<void>
  initialData?: Quiz | null
  uploadingFile?: boolean
  onFileUpload?: (file: File) => Promise<string | void>
}

export const QuizModal: React.FC<QuizModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  uploadingFile = false,
  onFileUpload,
}) => {
  const [activeTab, setActiveTab] = useState<'details' | 'questions'>('details')
  const [selectedSubjectIndex, setSelectedSubjectIndex] = useState<number>(0)
  const [submitting, setSubmitting] = useState<boolean>(false)

  // Editing state for existing questions
  const [editingQuestionIndex, setEditingQuestionIndex] = useState<
    number | null
  >(null)

  // Form State
  const [formData, setFormData] = useState<QuizFormState>({
    title: '',
    description: '',
    type: 'general',
    isPaid: false,
    amount: 0,
    accessCode: '',
    fileUrl: '',
    courseId: null,
    subjects: [
      {
        name: 'General',
        description: '',
        timeLimit: 30,
        questions: [],
      },
    ],
    questions: [],
  })

  // Temporary question builder state
  const [newQuestion, setNewQuestion] = useState<QuestionOption>({
    questionText: '',
    options: ['', ''],
    correctAnswer: 0,
    explanation: '',
    marks: 1,
  })

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || '',
        description: initialData.description || '',
        type: initialData.type || 'general',
        isPaid: initialData.isPaid || false,
        amount: initialData.amount || 0,
        accessCode: initialData.accessCode || '',
        fileUrl: initialData.fileUrl || '',
        courseId: initialData.courseId || null,
        subjects: initialData.subjects?.length
          ? initialData.subjects
          : [
              {
                name: 'General',
                description: '',
                timeLimit: 30,
                questions: [],
              },
            ],
        questions: (initialData as any).questions || [],
      })
    } else {
      setFormData({
        title: '',
        description: '',
        type: 'general',
        isPaid: false,
        amount: 0,
        accessCode: '',
        fileUrl: '',
        courseId: null,
        subjects: [
          { name: 'General', description: '', timeLimit: 30, questions: [] },
        ],
        questions: [],
      })
    }
    setActiveTab('details')
    setSelectedSubjectIndex(0)
    setEditingQuestionIndex(null)
  }, [initialData, isOpen])

  if (!isOpen) return null

  const currentSubject = formData.subjects[selectedSubjectIndex] || {
    name: 'General',
    description: '',
    timeLimit: 30,
    questions: [],
  }

  // Basic Field Handlers
  const handleDetailChange = (
    field: keyof QuizFormState,
    value: string | number | boolean | null,
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  // File Upload
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && onFileUpload) {
      const url = await onFileUpload(file)
      if (typeof url === 'string') {
        setFormData((prev) => ({ ...prev, fileUrl: url }))
      }
    }
  }

  // Subject Handlers
  const handleAddSubject = () => {
    const newSub: QuizSubject = {
      name: `Subject ${formData.subjects.length + 1}`,
      description: '',
      timeLimit: 30,
      questions: [],
    }
    setFormData((prev) => ({
      ...prev,
      subjects: [...prev.subjects, newSub],
    }))
    setSelectedSubjectIndex(formData.subjects.length)
    setEditingQuestionIndex(null)
  }

  const handleUpdateSubject = (field: keyof QuizSubject, value: any) => {
    setFormData((prev) => ({
      ...prev,
      subjects: prev.subjects.map((sub, idx) =>
        idx === selectedSubjectIndex ? { ...sub, [field]: value } : sub,
      ),
    }))
  }

  // Question Option Handlers
  const handleOptionChange = (optIndex: number, value: string) => {
    setNewQuestion((prev) => ({
      ...prev,
      options: prev.options.map((opt, idx) => (idx === optIndex ? value : opt)),
    }))
  }

  const handleAddOption = () => {
    setNewQuestion((prev) => ({
      ...prev,
      options: [...prev.options, ''],
    }))
  }

  const handleRemoveOption = (optIndex: number) => {
    if (newQuestion.options.length <= 2) return
    setNewQuestion((prev) => {
      const updatedOptions = prev.options.filter((_, idx) => idx !== optIndex)
      const adjustedCorrect =
        prev.correctAnswer >= updatedOptions.length ? 0 : prev.correctAnswer
      return {
        ...prev,
        options: updatedOptions,
        correctAnswer: adjustedCorrect,
      }
    })
  }

  // Start Editing Question
  const handleEditQuestion = (qIndex: number) => {
    const targetQuestion = currentSubject.questions?.[qIndex]
    if (!targetQuestion) return

    setEditingQuestionIndex(qIndex)
    setNewQuestion({
      questionText: targetQuestion.questionText || '',
      options: targetQuestion.options ? [...targetQuestion.options] : ['', ''],
      correctAnswer: targetQuestion.correctAnswer ?? 0,
      explanation: targetQuestion.explanation || '',
      marks: targetQuestion.marks ?? 1,
      id: targetQuestion.id,
      _id: targetQuestion._id,
    })
  }

  const handleCancelQuestionEdit = () => {
    setEditingQuestionIndex(null)
    setNewQuestion({
      questionText: '',
      options: ['', ''],
      correctAnswer: 0,
      explanation: '',
      marks: 1,
    })
  }

  // Add / Update Question to current Subject
  const handleSaveQuestion = () => {
    if (!newQuestion.questionText.trim()) return

    if (editingQuestionIndex !== null) {
      // Update Existing Question
      setFormData((prev) => {
        const updatedSubjects = prev.subjects.map((sub, sIdx) => {
          if (sIdx !== selectedSubjectIndex) return sub
          const updatedQs = [...(sub.questions || [])]
          updatedQs[editingQuestionIndex] = { ...newQuestion }
          return { ...sub, questions: updatedQs }
        })

        return { ...prev, subjects: updatedSubjects }
      })
    } else {
      // Add New Question
      const questionToAdd: QuestionOption = {
        ...newQuestion,
        id: `q-${Date.now()}`,
      }

      setFormData((prev) => {
        const updatedSubjects = prev.subjects.map((sub, idx) => {
          if (idx !== selectedSubjectIndex) return sub
          return {
            ...sub,
            questions: [...(sub.questions || []), questionToAdd],
          }
        })

        const updatedGlobalQuestions = [
          ...(prev.questions || []),
          questionToAdd,
        ]

        return {
          ...prev,
          subjects: updatedSubjects,
          questions: updatedGlobalQuestions,
        }
      })
    }

    handleCancelQuestionEdit()
  }

  const handleRemoveQuestion = (qIndex: number) => {
    if (editingQuestionIndex === qIndex) {
      handleCancelQuestionEdit()
    }

    setFormData((prev) => {
      const updatedSubjects = prev.subjects.map((sub, idx) => {
        if (idx !== selectedSubjectIndex) return sub
        return {
          ...sub,
          questions: (sub.questions || []).filter((_, i) => i !== qIndex),
        }
      })

      return {
        ...prev,
        subjects: updatedSubjects,
        questions: (prev.questions || []).filter((_, i) => i !== qIndex),
      }
    })
  }

  // Form Submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title.trim()) return

    setSubmitting(true)
    try {
      const payload: CreateQuizPayload = {
        title: formData.title,
        description: formData.description,
        type: formData.type,
        courseId: formData.courseId ?? null,
        fileUrl: formData.fileUrl ?? null,
        isPaid: formData.isPaid,
        amount: formData.amount,
        subjects: formData.subjects,
      }
      await onSubmit(payload)
      onClose()
    } catch (err) {
      console.error(err)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in duration-200'>
      <div className='w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-slate-100 flex flex-col max-h-[90vh] overflow-hidden'>
        {/* Header */}
        <div className='px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50'>
          <div>
            <h2 className='text-base font-black text-slate-900'>
              {initialData ? 'Edit Quiz Assessment' : 'Create New Quiz'}
            </h2>
            <p className='text-xs text-slate-500 font-medium'>
              Configure parameters, evaluation sections, and test questions
            </p>
          </div>
          <button
            type='button'
            onClick={onClose}
            className='w-8 h-8 rounded-lg bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center text-sm font-bold transition-colors cursor-pointer'
          >
            ✕
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className='flex border-b border-slate-100 px-6 bg-white'>
          <button
            type='button'
            onClick={() => setActiveTab('details')}
            className={`py-3 px-4 text-xs font-black uppercase tracking-wider border-b-2 transition-colors cursor-pointer ${
              activeTab === 'details'
                ? 'border-[#002EFF] text-[#002EFF]'
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            1. Quiz Details
          </button>
          <button
            type='button'
            onClick={() => setActiveTab('questions')}
            className={`py-3 px-4 text-xs font-black uppercase tracking-wider border-b-2 transition-colors cursor-pointer ${
              activeTab === 'questions'
                ? 'border-[#002EFF] text-[#002EFF]'
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            2. Questions & Subjects (
            {formData.questions?.length ||
              formData.subjects.reduce(
                (acc, s) => acc + (s.questions?.length || 0),
                0,
              )}
            )
          </button>
        </div>

        {/* Content Body */}
        <div className='p-6 overflow-y-auto flex-1 space-y-6'>
          {activeTab === 'details' ? (
            <div className='space-y-4'>
              <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                <div className='md:col-span-2 space-y-1.5'>
                  <label className='text-xs font-black text-slate-700 uppercase tracking-wider'>
                    Quiz Title *
                  </label>
                  <input
                    type='text'
                    required
                    placeholder='e.g., Mathematics Mid-Term Assessment'
                    value={formData.title}
                    onChange={(e) =>
                      handleDetailChange('title', e.target.value)
                    }
                    className='w-full h-11 px-4 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 focus:border-[#002EFF] outline-none'
                  />
                </div>
                <div className='space-y-1.5'>
                  <label className='text-xs font-black text-slate-700 uppercase tracking-wider'>
                    Type
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) =>
                      handleDetailChange(
                        'type',
                        e.target.value as 'singular' | 'general',
                      )
                    }
                    className='w-full h-11 px-4 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 focus:border-[#002EFF] outline-none cursor-pointer'
                  >
                    <option value='general'>General</option>
                    <option value='singular'>Singular</option>
                  </select>
                </div>
              </div>

              <div className='space-y-1.5'>
                <label className='text-xs font-black text-slate-700 uppercase tracking-wider'>
                  Description
                </label>
                <textarea
                  rows={3}
                  placeholder='Brief summary or instructions for students...'
                  value={formData.description}
                  onChange={(e) =>
                    handleDetailChange('description', e.target.value)
                  }
                  className='w-full p-4 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 focus:border-[#002EFF] outline-none resize-none'
                />
              </div>

              <div className='grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-slate-100'>
                <div className='space-y-1.5'>
                  <label className='text-xs font-black text-slate-700 uppercase tracking-wider'>
                    Payment Type
                  </label>
                  <div className='flex items-center h-11 px-3 rounded-xl border border-slate-200 gap-2'>
                    <input
                      type='checkbox'
                      id='isPaidToggle'
                      checked={formData.isPaid}
                      onChange={(e) =>
                        handleDetailChange('isPaid', e.target.checked)
                      }
                      className='w-4 h-4 rounded text-[#002EFF] focus:ring-0 cursor-pointer'
                    />
                    <label
                      htmlFor='isPaidToggle'
                      className='text-xs font-bold text-slate-700 cursor-pointer'
                    >
                      Requires Payment
                    </label>
                  </div>
                </div>

                {formData.isPaid && (
                  <div className='space-y-1.5'>
                    <label className='text-xs font-black text-slate-700 uppercase tracking-wider'>
                      Amount (₦)
                    </label>
                    <input
                      type='number'
                      value={formData.amount}
                      onChange={(e) =>
                        handleDetailChange('amount', Number(e.target.value))
                      }
                      className='w-full h-11 px-4 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 focus:border-[#002EFF] outline-none'
                    />
                  </div>
                )}

                <div className='space-y-1.5'>
                  <label className='text-xs font-black text-slate-700 uppercase tracking-wider'>
                    Access Code (Optional)
                  </label>
                  <input
                    type='text'
                    placeholder='e.g., MATH2024'
                    value={formData.accessCode || ''}
                    onChange={(e) =>
                      handleDetailChange('accessCode', e.target.value)
                    }
                    className='w-full h-11 px-4 rounded-xl border border-slate-200 text-xs font-bold font-mono text-slate-800 focus:border-[#002EFF] outline-none'
                  />
                </div>
              </div>

              <div className='space-y-1.5 pt-2 border-t border-slate-100'>
                <label className='text-xs font-black text-slate-700 uppercase tracking-wider'>
                  Attachment / Resource Material
                </label>
                <div className='flex items-center gap-3'>
                  <input
                    type='file'
                    onChange={handleFileChange}
                    disabled={uploadingFile}
                    className='text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200 cursor-pointer'
                  />
                  {uploadingFile && (
                    <span className='text-xs font-bold text-slate-400 animate-pulse'>
                      Uploading...
                    </span>
                  )}
                </div>
                {formData.fileUrl && (
                  <p className='text-[11px] font-medium text-emerald-600 truncate mt-1'>
                    Uploaded: {formData.fileUrl}
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className='space-y-6'>
              {/* Subjects Bar */}
              <div className='space-y-2'>
                <div className='flex items-center justify-between'>
                  <label className='text-xs font-black text-slate-700 uppercase tracking-wider'>
                    Subjects / Sections
                  </label>
                  <button
                    type='button'
                    onClick={handleAddSubject}
                    className='px-3 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer'
                  >
                    + Add Subject
                  </button>
                </div>
                <div className='flex gap-2 overflow-x-auto pb-1'>
                  {formData.subjects.map((sub, idx) => (
                    <button
                      key={idx}
                      type='button'
                      onClick={() => {
                        setSelectedSubjectIndex(idx)
                        handleCancelQuestionEdit()
                      }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
                        selectedSubjectIndex === idx
                          ? 'bg-slate-900 text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {sub.name || `Subject ${idx + 1}`} (
                      {sub.questions?.length || 0})
                    </button>
                  ))}
                </div>
              </div>

              {/* Active Subject Config */}
              <div className='p-4 rounded-xl bg-slate-50 border border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-4'>
                <div className='space-y-1'>
                  <label className='text-[10px] font-black uppercase text-slate-500'>
                    Subject Name
                  </label>
                  <input
                    type='text'
                    value={currentSubject.name}
                    onChange={(e) =>
                      handleUpdateSubject('name', e.target.value)
                    }
                    className='w-full h-9 px-3 rounded-lg bg-white border border-slate-200 text-xs font-bold text-slate-800 focus:border-[#002EFF] outline-none'
                  />
                </div>
                <div className='space-y-1'>
                  <label className='text-[10px] font-black uppercase text-slate-500'>
                    Time Limit (Minutes)
                  </label>
                  <input
                    type='number'
                    value={currentSubject.timeLimit}
                    onChange={(e) =>
                      handleUpdateSubject('timeLimit', Number(e.target.value))
                    }
                    className='w-full h-9 px-3 rounded-lg bg-white border border-slate-200 text-xs font-bold text-slate-800 focus:border-[#002EFF] outline-none'
                  />
                </div>
              </div>

              {/* Add / Edit Question Builder */}
              <div
                className={`p-4 rounded-2xl border transition-colors space-y-4 bg-white shadow-xs ${
                  editingQuestionIndex !== null
                    ? 'border-[#002EFF] ring-1 ring-[#002EFF]/20'
                    : 'border-slate-200'
                }`}
              >
                <div className='flex items-center justify-between'>
                  <h3 className='text-xs font-black uppercase tracking-wider text-slate-900'>
                    {editingQuestionIndex !== null
                      ? `Edit Question #${editingQuestionIndex + 1} in ${currentSubject.name}`
                      : `Add Question to ${currentSubject.name}`}
                  </h3>
                  {editingQuestionIndex !== null && (
                    <button
                      type='button'
                      onClick={handleCancelQuestionEdit}
                      className='text-xs font-bold text-slate-500 hover:text-slate-800 underline cursor-pointer'
                    >
                      Cancel Edit
                    </button>
                  )}
                </div>

                <div className='space-y-1.5'>
                  <label className='text-[11px] font-bold text-slate-600'>
                    Question Text
                  </label>
                  <textarea
                    rows={2}
                    placeholder='Type question here...'
                    value={newQuestion.questionText}
                    onChange={(e) =>
                      setNewQuestion((prev) => ({
                        ...prev,
                        questionText: e.target.value,
                      }))
                    }
                    className='w-full p-3 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 focus:border-[#002EFF] outline-none resize-none'
                  />
                </div>

                <div className='space-y-2'>
                  <label className='text-[11px] font-bold text-slate-600'>
                    Options & Correct Answer Selection
                  </label>
                  {newQuestion.options.map((optionText, optIdx) => (
                    <div key={optIdx} className='flex items-center gap-2'>
                      <input
                        type='radio'
                        name='correctOption'
                        checked={newQuestion.correctAnswer === optIdx}
                        onChange={() =>
                          setNewQuestion((prev) => ({
                            ...prev,
                            correctAnswer: optIdx,
                          }))
                        }
                        className='w-4 h-4 text-[#002EFF] cursor-pointer'
                      />
                      <input
                        type='text'
                        placeholder={`Option ${optIdx + 1}`}
                        value={optionText}
                        onChange={(e) =>
                          handleOptionChange(optIdx, e.target.value)
                        }
                        className='flex-1 h-9 px-3 rounded-lg border border-slate-200 text-xs font-semibold text-slate-800 focus:border-[#002EFF] outline-none'
                      />
                      {newQuestion.options.length > 2 && (
                        <button
                          type='button'
                          onClick={() => handleRemoveOption(optIdx)}
                          className='h-9 px-2 text-xs text-rose-500 font-bold hover:bg-rose-50 rounded-lg cursor-pointer'
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type='button'
                    onClick={handleAddOption}
                    className='text-xs font-bold text-[#002EFF] hover:underline cursor-pointer'
                  >
                    + Add Option
                  </button>
                </div>

                <div className='grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2'>
                  <div className='sm:col-span-2 space-y-1'>
                    <label className='text-[10px] font-bold text-slate-500'>
                      Explanation (Optional)
                    </label>
                    <input
                      type='text'
                      placeholder='Reason for correct answer...'
                      value={newQuestion.explanation || ''}
                      onChange={(e) =>
                        setNewQuestion((prev) => ({
                          ...prev,
                          explanation: e.target.value,
                        }))
                      }
                      className='w-full h-9 px-3 rounded-lg border border-slate-200 text-xs font-medium text-slate-800 focus:border-[#002EFF] outline-none'
                    />
                  </div>
                  <div className='flex items-end'>
                    <button
                      type='button'
                      onClick={handleSaveQuestion}
                      className='w-full h-9 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-black uppercase tracking-wider transition-colors cursor-pointer'
                    >
                      {editingQuestionIndex !== null
                        ? 'Update Question'
                        : 'Add Question'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Questions List */}
              <div className='space-y-3'>
                <h4 className='text-xs font-black uppercase text-slate-500'>
                  Current Questions ({currentSubject.questions?.length || 0})
                </h4>
                {(!currentSubject.questions ||
                  currentSubject.questions.length === 0) && (
                  <p className='text-xs text-slate-400 italic text-center py-4'>
                    No questions added to this subject yet.
                  </p>
                )}
                {currentSubject.questions?.map(
                  (q: QuestionOption, idx: number) => (
                    <div
                      key={q.id || q._id || idx}
                      className={`p-3 rounded-xl bg-slate-50 border transition-colors flex items-start justify-between gap-3 ${
                        editingQuestionIndex === idx
                          ? 'border-[#002EFF] bg-blue-50/20'
                          : 'border-slate-200'
                      }`}
                    >
                      <div className='space-y-1.5 flex-1'>
                        <p className='text-xs font-bold text-slate-800'>
                          {idx + 1}. {q.questionText}
                        </p>
                        <div className='flex flex-wrap gap-2'>
                          {q.options.map((opt, oIdx) => (
                            <span
                              key={oIdx}
                              className={`text-[10px] px-2 py-0.5 rounded font-semibold ${
                                q.correctAnswer === oIdx
                                  ? 'bg-emerald-100 text-emerald-800 font-bold'
                                  : 'bg-white border border-slate-200 text-slate-600'
                              }`}
                            >
                              {opt}
                            </span>
                          ))}
                        </div>
                        {q.explanation && (
                          <p className='text-[11px] text-slate-500 italic'>
                            <span className='font-bold non-italic text-slate-600'>
                              Explanation:{' '}
                            </span>
                            {q.explanation}
                          </p>
                        )}
                      </div>
                      <div className='flex items-center gap-1'>
                        <button
                          type='button'
                          onClick={() => handleEditQuestion(idx)}
                          className='text-xs text-[#002EFF] font-bold hover:bg-blue-100 px-2 py-1 rounded transition-colors cursor-pointer'
                        >
                          Edit
                        </button>
                        <button
                          type='button'
                          onClick={() => handleRemoveQuestion(idx)}
                          className='text-xs text-rose-600 font-bold hover:bg-rose-100 px-2 py-1 rounded transition-colors cursor-pointer'
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ),
                )}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className='px-6 py-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/50'>
          <button
            type='button'
            onClick={onClose}
            className='h-10 px-4 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-100 transition-colors cursor-pointer'
          >
            Cancel
          </button>
          <button
            type='button'
            disabled={submitting || !formData.title.trim()}
            onClick={handleSubmit}
            className='h-10 px-6 rounded-xl bg-[#002EFF] hover:bg-[#0028e0] disabled:opacity-50 text-white text-xs font-black uppercase tracking-wider transition-colors cursor-pointer shadow-xs'
          >
            {submitting
              ? 'Saving...'
              : initialData
                ? 'Update Quiz'
                : 'Save Quiz'}
          </button>
        </div>
      </div>
    </div>
  )
}