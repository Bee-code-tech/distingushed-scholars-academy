// //src/app/admin/components/examBuilder/index.tsx
// 'use client'
// import React, { useState, useMemo, useEffect } from 'react'
// import { useRouter } from 'next/navigation'
// import {
//   Settings,
//   AlertTriangle,
//   CheckCircle2,
//   Info,
//   LayoutList,
//   Save,
//   ArrowLeft,
// } from 'lucide-react'
// import { SetupStep } from './SetupStep'
// import { QuestionEditor } from './QuestionEditor'
// import { QuestionPool } from './QuestionPool'
// import { LogisticsStep } from './LogisticsStep'

// const JAMB_SUBJECTS = [
//   'Mathematics',
//   'English Language',
//   'Physics',
//   'Chemistry',
//   'Biology',
//   'Literature in English',
//   'Government',
//   'Economics',
//   'Commerce',
//   'CRK',
//   'IRK',
//   'Geography',
//   'History',
//   'Agricultural Science',
//   'Accounting',
// ]

// // Added onBack prop to handle navigation via state toggle in the parent
// export default function ExamBuilder({ onBack }: { onBack: () => void }) {
//   const router = useRouter()
//   const [step, setStep] = useState(1)
//   const [questions, setQuestions] = useState<any[]>([])
//   const [editingId, setEditingId] = useState<string | null>(null)
//   const [examEditingId, setExamEditingId] = useState<string | null>(null)
//   const [searchQuery, setSearchQuery] = useState('')
//   const [globalMark, setGlobalMark] = useState(1)

//   const [showConfirmModal, setShowConfirmModal] = useState(false)
//   const [alertConfig, setAlertConfig] = useState<{
//     show: boolean
//     type: 'success' | 'warning' | 'error'
//     title: string
//     message: string
//     action?: () => void
//   }>({ show: false, type: 'success', title: '', message: '' })

//   const [config, setConfig] = useState({
//     title: '',
//     description: '',
//     timeLimit: 30,
//     shuffle: false,
//     accessCode: '',
//   })

//   const [form, setForm] = useState({
//     id: '',
//     subject: JAMB_SUBJECTS[0],
//     topic: '',
//     body: '',
//     options: { A: '', B: '', C: '', D: '' },
//     correctOption: 'A',
//     explanation: '',
//     image: null as string | null,
//     mark: 1,
//   })

//   useEffect(() => {
//     const draft = localStorage.getItem('draft_exam_builder')
//     const pendingQs = localStorage.getItem('pending_exam_questions')

//     if (draft) {
//       const parsedDraft = JSON.parse(draft)
//       setConfig({
//         title: parsedDraft.title || '',
//         description: parsedDraft.description || '',
//         timeLimit: parsedDraft.timeLimit || 30,
//         shuffle: parsedDraft.shuffle || false,
//         accessCode: parsedDraft.accessCode || '',
//       })
//       if (parsedDraft.editingId) setExamEditingId(parsedDraft.editingId)
//     }

//     if (pendingQs) {
//       setQuestions(JSON.parse(pendingQs))
//     }
//   }, [])

//   const progress = useMemo(() => {
//     if (step === 1) return 20
//     if (step === 2) return 20 + Math.min((questions.length / 10) * 60, 60)
//     return 100
//   }, [step, questions.length])

//   const showAlert = (
//     title: string,
//     message: string,
//     type: 'success' | 'warning' | 'error' = 'warning',
//     action?: () => void,
//   ) => {
//     setAlertConfig({ show: true, title, message, type, action })
//   }

//   const handleSaveQuestion = () => {
//     if (!form.body.trim())
//       return showAlert(
//         'Missing Content',
//         'The question body cannot be empty.',
//         'error',
//       )

//     if (editingId) {
//       setQuestions(questions.map((q) => (q.id === editingId ? { ...form } : q)))
//       setEditingId(null)
//     } else {
//       const newQuestion = { ...form, id: Date.now().toString() }
//       setQuestions([...questions, newQuestion])
//     }

//     setForm({
//       ...form,
//       id: '',
//       body: '',
//       options: { A: '', B: '', C: '', D: '' },
//       correctOption: 'A',
//       explanation: '',
//       image: null,
//     })
//   }

//   const handleEdit = (q: any) => {
//     setEditingId(q.id)
//     setForm({ ...q })
//     window.scrollTo({ top: 0, behavior: 'smooth' })
//   }

//   const applyGlobalMark = () => {
//     setQuestions(questions.map((q) => ({ ...q, mark: globalMark })))
//     showAlert(
//       'Success',
//       `All questions updated to ${globalMark} marks.`,
//       'success',
//     )
//   }

//   const handleDeploy = () => {
//     const rawStorage = localStorage.getItem('my_quizzes')
//     const existingQuizzes = JSON.parse(rawStorage || '[]')

//     const finalExam = {
//       ...config,
//       id:
//         examEditingId ||
//         `QZ-${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
//       questions,
//       totalQuestions: questions.length,
//       url: `/take-exam/${examEditingId || Date.now()}`,
//       createdAt: new Date().toLocaleDateString(),
//       // CRASH PROTECTION: Always ensure attempts is an array
//       attempts: examEditingId
//         ? existingQuizzes.find((q: any) => q.id === examEditingId)?.attempts ||
//           []
//         : [],
//     }

//     let updatedQuizzes
//     if (examEditingId) {
//       updatedQuizzes = existingQuizzes.map((q: any) =>
//         q.id === examEditingId ? finalExam : q,
//       )
//     } else {
//       updatedQuizzes = [finalExam, ...existingQuizzes]
//     }

//     localStorage.setItem('my_quizzes', JSON.stringify(updatedQuizzes))
//     localStorage.removeItem('draft_exam_builder')
//     localStorage.removeItem('pending_exam_questions')

//     setShowConfirmModal(false)
//     showAlert(
//       examEditingId ? 'Update Successful!' : 'Published!',
//       examEditingId
//         ? 'The quiz has been successfully updated.'
//         : 'Your examination is now live.',
//       'success',
//       () => {
//         // Corrected: Use the callback prop to return to MyQuizzes view
//         onBack()
//       },
//     )
//   }

//   return (
//     <div className='min-h-screen bg-[#F8FAFC] pb-20'>
//       <nav className='sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200'>
//         <div className='h-1 bg-slate-100 w-full overflow-hidden'>
//           <div
//             className='h-full bg-indigo-600 transition-all duration-700 ease-out'
//             style={{ width: `${progress}%` }}
//           />
//         </div>
//         <div className='max-w-7xl mx-auto flex justify-between items-center p-4 px-8'>
//           <div className='flex items-center gap-6'>
//             {/* Back Button for better UX */}
//             <button
//               onClick={onBack}
//               className='p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500'
//             >
//               <ArrowLeft size={20} />
//             </button>
//             <div className='flex gap-8'>
//               {[1, 2, 3].map((s) => (
//                 <div
//                   key={s}
//                   className={`flex items-center gap-2 transition-all ${step >= s ? 'opacity-100' : 'opacity-30'}`}
//                 >
//                   <span
//                     className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black ${step >= s ? 'bg-indigo-600 text-white' : 'bg-slate-200'}`}
//                   >
//                     {s}
//                   </span>
//                   <span className='text-[10px] font-black uppercase tracking-widest hidden md:block'>
//                     {s === 1 ? 'Setup' : s === 2 ? 'Questions' : 'Logistics'}
//                   </span>
//                 </div>
//               ))}
//             </div>
//           </div>
//           {examEditingId && (
//             <div className='flex items-center gap-2 bg-amber-50 text-amber-600 px-4 py-1.5 rounded-full border border-amber-100'>
//               <Save size={14} />
//               <span className='text-[10px] font-black uppercase tracking-widest'>
//                 Editing Quiz
//               </span>
//             </div>
//           )}
//         </div>
//       </nav>

//       <main className='max-w-7xl mx-auto px-6 pt-8'>
//         {step === 1 && (
//           <SetupStep
//             config={config}
//             setConfig={setConfig}
//             onNext={() => setStep(2)}
//           />
//         )}
//         {step === 2 && (
//           <div className='grid grid-cols-1 lg:grid-cols-12 gap-8'>
//             <div className='lg:col-span-5'>
//               <QuestionEditor
//                 form={form}
//                 setForm={setForm}
//                 onSave={handleSaveQuestion}
//                 editingId={editingId}
//                 setEditingId={setEditingId}
//                 JAMB_SUBJECTS={JAMB_SUBJECTS}
//                 onBulkUpload={() => {}}
//               />
//             </div>
//             <div className='lg:col-span-7'>
//               <div className='mb-4 flex items-center justify-between px-2'>
//                 <div className='flex items-center gap-2'>
//                   <LayoutList size={16} className='text-slate-400' />
//                   <span className='text-[10px] font-black uppercase text-slate-500 tracking-widest'>
//                     Total Questions: {questions.length}
//                   </span>
//                 </div>
//               </div>
//               <QuestionPool
//                 questions={questions}
//                 setQuestions={setQuestions}
//                 searchQuery={searchQuery}
//                 setSearchQuery={setSearchQuery}
//                 globalMark={globalMark}
//                 setGlobalMark={setGlobalMark}
//                 applyGlobalMark={applyGlobalMark}
//                 onEdit={handleEdit}
//               />
//               {questions.length > 0 && !editingId && (
//                 <button
//                   onClick={() => setStep(3)}
//                   className='w-full mt-6 py-5 bg-slate-900 text-white rounded-[32px] text-[12px] font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-indigo-600 transition-all shadow-xl'
//                 >
//                   Configure Logistics <Settings size={18} />
//                 </button>
//               )}
//             </div>
//           </div>
//         )}
//         {step === 3 && (
//           <LogisticsStep
//             config={config}
//             setConfig={setConfig}
//             onBack={() => setStep(2)}
//             onDeploy={() => setShowConfirmModal(true)}
//             questions={questions}
//           />
//         )}
//       </main>

//       {/* MODALS RENDERED BELOW */}
//       {alertConfig.show && (
//         <div className='fixed inset-0 z-[110] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md'>
//           <div className='bg-white rounded-[40px] max-w-sm w-full p-10 shadow-2xl text-center border border-slate-200'>
//             <div
//               className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${alertConfig.type === 'success' ? 'bg-emerald-50 text-emerald-500' : 'bg-amber-50 text-amber-500'}`}
//             >
//               {alertConfig.type === 'success' ? (
//                 <CheckCircle2 size={40} />
//               ) : (
//                 <Info size={40} />
//               )}
//             </div>
//             <h3 className='text-xl font-black text-slate-800 mb-2 uppercase tracking-tighter'>
//               {alertConfig.title}
//             </h3>
//             <p className='text-slate-500 text-[13px] mb-8 font-medium leading-relaxed'>
//               {alertConfig.message}
//             </p>
//             <button
//               onClick={() => {
//                 setAlertConfig({ ...alertConfig, show: false })
//                 if (alertConfig.action) alertConfig.action()
//               }}
//               className='w-full py-4 bg-slate-900 text-white rounded-2xl font-black uppercase text-[11px] tracking-widest hover:bg-indigo-600 transition-all'
//             >
//               Continue
//             </button>
//           </div>
//         </div>
//       )}

//       {showConfirmModal && (
//         <div className='fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-sm'>
//           <div className='bg-white rounded-[40px] max-w-sm w-full p-10 shadow-2xl text-center border border-slate-200'>
//             <div className='w-20 h-20 bg-indigo-50 text-indigo-500 rounded-full flex items-center justify-center mx-auto mb-6'>
//               <Settings size={40} className='text-indigo-400' />
//             </div>
//             <h3 className='text-xl font-black text-slate-800 mb-2 uppercase tracking-tighter'>
//               {examEditingId ? 'Update Exam?' : 'Launch Exam?'}
//             </h3>
//             <p className='text-slate-500 text-[13px] mb-8 leading-relaxed'>
//               Confirming will make{' '}
//               <span className='font-bold text-indigo-600'>
//                 "{config.title}"
//               </span>{' '}
//               live.
//             </p>
//             <div className='flex flex-col gap-3'>
//               <button
//                 onClick={handleDeploy}
//                 className='w-full py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase text-[11px] tracking-widest hover:bg-indigo-700 transition-all'
//               >
//                 {examEditingId ? 'Save Changes' : 'Confirm & Publish'}
//               </button>
//               <button
//                 onClick={() => setShowConfirmModal(false)}
//                 className='w-full py-4 bg-slate-100 text-slate-400 rounded-2xl font-black uppercase text-[11px] tracking-widest hover:bg-slate-200 transition-all'
//               >
//                 Cancel
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   )
// }

'use client'

import React, { useState, useMemo, useEffect } from 'react'
import {
  Settings,
  CheckCircle2,
  Info,
  LayoutList,
  Save,
  ArrowLeft,
  Loader2,
} from 'lucide-react'
import { SetupStep } from './SetupStep'
import { QuestionEditor } from './QuestionEditor'
import { QuestionPool } from './QuestionPool'
import { LogisticsStep } from './LogisticsStep'
import { useExamBuilder } from '../../hooks/useExamBuilder' 

const JAMB_SUBJECTS = [
  'Mathematics',
  'English Language',
  'Physics',
  'Chemistry',
  'Biology',
  'Literature in English',
  'Government',
  'Economics',
  'Commerce',
  'CRK',
  'IRK',
  'Geography',
  'History',
  'Agricultural Science',
  'Accounting',
]

export default function ExamBuilder({ onBack }: { onBack: () => void }) {
  const {
    step,
    setStep,
    questions,
    setQuestions,
    config,
    setConfig,
    isDeploying,
    importFromExcel,
    deployToBackend,
    downloadTemplate,
  } = useExamBuilder()

  const [editingId, setEditingId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [globalMark, setGlobalMark] = useState(1)
  const [showConfirmModal, setShowConfirmModal] = useState(false)

  const [alertConfig, setAlertConfig] = useState<{
    show: boolean
    type: 'success' | 'warning' | 'error'
    title: string
    message: string
    action?: () => void
  }>({ show: false, type: 'success', title: '', message: '' })

  const [form, setForm] = useState({
    id: '',
    subject: JAMB_SUBJECTS[0],
    topic: '',
    body: '',
    options: { A: '', B: '', C: '', D: '', E: '' },
    correctOption: 'A',
    explanation: '',
    image: null as string | null,
    mark: 1,
  })

  const progress = useMemo(() => {
    if (step === 1) return 20
    if (step === 2) return 20 + Math.min((questions.length / 10) * 60, 60)
    return 100
  }, [step, questions.length])

  const showAlert = (
    title: string,
    message: string,
    type: 'success' | 'warning' | 'error' = 'warning',
    action?: () => void,
  ) => {
    setAlertConfig({ show: true, title, message, type, action })
  }

  const handleSaveQuestion = () => {
    if (!form.body.trim()) {
      return showAlert(
        'Missing Content',
        'Question body cannot be empty.',
        'error',
      )
    }

    if (editingId) {
      setQuestions(questions.map((q) => (q.id === editingId ? { ...form } : q)))
      setEditingId(null)
    } else {
      const newQuestion = {
        ...form,
        id:
          typeof crypto !== 'undefined'
            ? crypto.randomUUID()
            : Date.now().toString(),
      }
      setQuestions([...questions, newQuestion])
    }

    setForm({
      ...form,
      id: '',
      body: '',
      options: { A: '', B: '', C: '', D: '', E: '' },
      correctOption: 'A',
      explanation: '',
      image: null,
    })
  }

  const handleEdit = (q: any) => {
    setEditingId(q.id)
    setForm({ ...q })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const applyGlobalMark = () => {
    setQuestions(questions.map((q) => ({ ...q, mark: globalMark })))
    showAlert(
      'Success',
      `All questions updated to ${globalMark} marks.`,
      'success',
    )
  }

  const handleFinalDeploy = async () => {
    try {
      await deployToBackend()
      setShowConfirmModal(false)
      // The hook handles the toast/alerts, but we use the onBack callback here
      onBack()
    } catch (err) {
      setShowConfirmModal(false)
    }
  }

  return (
    <div className='min-h-screen bg-[#F8FAFC] pb-20'>
      <nav className='sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200'>
        <div className='h-1 bg-slate-100 w-full overflow-hidden'>
          <div
            className='h-full bg-indigo-600 transition-all duration-700 ease-out'
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className='max-w-7xl mx-auto flex justify-between items-center p-4 px-8'>
          <div className='flex items-center gap-6'>
            <button
              onClick={onBack}
              className='p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500'
            >
              <ArrowLeft size={20} />
            </button>
            <div className='flex gap-8'>
              {[1, 2, 3].map((s) => (
                <div
                  key={s}
                  className={`flex items-center gap-2 transition-all ${step >= s ? 'opacity-100' : 'opacity-30'}`}
                >
                  <span
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black ${step >= s ? 'bg-indigo-600 text-white' : 'bg-slate-200'}`}
                  >
                    {s}
                  </span>
                  <span className='text-[10px] font-black uppercase tracking-widest hidden md:block'>
                    {s === 1 ? 'Setup' : s === 2 ? 'Questions' : 'Logistics'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={downloadTemplate}
            className='text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:underline'
          >
            Download Template
          </button>
        </div>
      </nav>

      <main className='max-w-7xl mx-auto px-6 pt-8'>
        {step === 1 && (
          <SetupStep
            config={config}
            setConfig={setConfig}
            onNext={() => setStep(2)}
          />
        )}
        {step === 2 && (
          <div className='grid grid-cols-1 lg:grid-cols-12 gap-8'>
            <div className='lg:col-span-5'>
              <QuestionEditor
                form={form}
                setForm={setForm}
                onSave={handleSaveQuestion}
                editingId={editingId}
                setEditingId={setEditingId}
                JAMB_SUBJECTS={JAMB_SUBJECTS}
                // Integrated Excel Import from hook
                onBulkUpload={importFromExcel}
              />
            </div>
            <div className='lg:col-span-7'>
              <div className='mb-4 flex items-center justify-between px-2'>
                <div className='flex items-center gap-2'>
                  <LayoutList size={16} className='text-slate-400' />
                  <span className='text-[10px] font-black uppercase text-slate-500 tracking-widest'>
                    Total Questions: {questions.length}
                  </span>
                </div>
              </div>
              <QuestionPool
                questions={questions}
                setQuestions={setQuestions}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                globalMark={globalMark}
                setGlobalMark={setGlobalMark}
                applyGlobalMark={applyGlobalMark}
                onEdit={handleEdit}
              />
              {questions.length > 0 && !editingId && (
                <button
                  onClick={() => setStep(3)}
                  className='w-full mt-6 py-5 bg-slate-900 text-white rounded-[32px] text-[12px] font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-indigo-600 transition-all shadow-xl'
                >
                  Configure Logistics <Settings size={18} />
                </button>
              )}
            </div>
          </div>
        )}
        {step === 3 && (
          <LogisticsStep
            config={config}
            setConfig={setConfig}
            onBack={() => setStep(2)}
            onDeploy={() => setShowConfirmModal(true)}
            questions={questions}
          />
        )}
      </main>

      {/* Alert Modal */}
      {alertConfig.show && (
        <div className='fixed inset-0 z-[110] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md'>
          <div className='bg-white rounded-[40px] max-w-sm w-full p-10 shadow-2xl text-center border border-slate-200'>
            <div
              className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${alertConfig.type === 'success' ? 'bg-emerald-50 text-emerald-500' : 'bg-amber-50 text-amber-500'}`}
            >
              {alertConfig.type === 'success' ? (
                <CheckCircle2 size={40} />
              ) : (
                <Info size={40} />
              )}
            </div>
            <h3 className='text-xl font-black text-slate-800 mb-2 uppercase tracking-tighter'>
              {alertConfig.title}
            </h3>
            <p className='text-slate-500 text-[13px] mb-8 font-medium leading-relaxed'>
              {alertConfig.message}
            </p>
            <button
              onClick={() => {
                setAlertConfig({ ...alertConfig, show: false })
                if (alertConfig.action) alertConfig.action()
              }}
              className='w-full py-4 bg-slate-900 text-white rounded-2xl font-black uppercase text-[11px] tracking-widest hover:bg-indigo-600 transition-all'
            >
              Continue
            </button>
          </div>
        </div>
      )}

      {/* Deployment Confirmation Modal */}
      {showConfirmModal && (
        <div className='fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-sm'>
          <div className='bg-white rounded-[40px] max-w-sm w-full p-10 shadow-2xl text-center border border-slate-200'>
            <div className='w-20 h-20 bg-indigo-50 text-indigo-500 rounded-full flex items-center justify-center mx-auto mb-6'>
              {isDeploying ? (
                <Loader2 size={40} className='animate-spin text-indigo-600' />
              ) : (
                <Settings size={40} className='text-indigo-400' />
              )}
            </div>
            <h3 className='text-xl font-black text-slate-800 mb-2 uppercase tracking-tighter'>
              Launch Exam?
            </h3>
            <p className='text-slate-500 text-[13px] mb-8 leading-relaxed'>
              Confirming will make{' '}
              <span className='font-bold text-indigo-600'>
                "{config.title}"
              </span>{' '}
              live on the DSA platform.
            </p>
            <div className='flex flex-col gap-3'>
              <button
                disabled={isDeploying}
                onClick={handleFinalDeploy}
                className='w-full py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase text-[11px] tracking-widest hover:bg-indigo-700 transition-all disabled:opacity-50'
              >
                {isDeploying ? 'Syncing...' : 'Confirm & Publish'}
              </button>
              <button
                disabled={isDeploying}
                onClick={() => setShowConfirmModal(false)}
                className='w-full py-4 bg-slate-100 text-slate-400 rounded-2xl font-black uppercase text-[11px] tracking-widest hover:bg-slate-200 transition-all'
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}