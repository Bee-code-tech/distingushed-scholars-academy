// //src/app/admin/components/ExamBuilder.tsx
// 'use client'

// import React, { useState, useRef, ChangeEvent, useEffect, useMemo } from 'react'
// import {
//   BookOpen,
//   ArrowRight,
//   ChevronRight,
//   UploadCloud,
//   Plus,
//   Trash2,
//   Edit3,
//   Image as ImageIcon,
//   CheckCircle2,
//   Settings,
//   Clock,
//   Trophy,
//   Shuffle,
//   Save,
//   X,
//   FileSpreadsheet,
//   ArrowLeft,
//   AlertTriangle,
//   Info,
//   Zap,
//   Search,
//   Filter,
// } from 'lucide-react'
// import * as XLSX from 'xlsx'

// // --- CONSTANTS ---
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

// // --- TYPES ---
// type Question = {
//   imageUrl: string | null
//   id: string
//   qNumber: number
//   subject: string
//   topic: string
//   body: string
//   options: { [key: string]: string }
//   correctOption: string
//   explanation: string
//   image: string | null
//   mark: number
// }

// type QuizConfig = {
//   title: string
//   description: string
//   timeLimit: number
//   shuffleQuestions: boolean
//   showLeaderboard: boolean
//   accessCode: string
// }

// export default function ExamBuilder() {
//   // --- STATE ---
//   const [step, setStep] = useState<1 | 2 | 3>(1)
//   const [searchQuery, setSearchQuery] = useState('')
//   const [config, setConfig] = useState<QuizConfig>({
//     title: '',
//     description: '',
//     timeLimit: 30,
//     shuffleQuestions: false,
//     showLeaderboard: true,
//     accessCode: '',
//   })
//   const [questions, setQuestions] = useState<Question[]>([])
//   const [isBulkUploading, setIsBulkUploading] = useState(false)
//   const [editingId, setEditingId] = useState<string | null>(null)
//   const [showConfirmModal, setShowConfirmModal] = useState(false)
//   const [globalMark, setGlobalMark] = useState<number>(1)

//   const [form, setForm] = useState<Partial<Question>>({
//     subject: JAMB_SUBJECTS[0],
//     topic: '',
//     body: '',
//     options: { A: '', B: '', C: '', D: '', E: '' },
//     correctOption: 'A',
//     explanation: '',
//     mark: 1,
//     image: null,
//   })

//   const fileInputRef = useRef<HTMLInputElement>(null)
//   const bulkInputRef = useRef<HTMLInputElement>(null)

//   // --- PERSISTENCE ---
//   useEffect(() => {
//     const savedData = localStorage.getItem('draft_exam_builder')
//     if (savedData) {
//       try {
//         const {
//           config: sConf,
//           questions: sQuest,
//           step: sStep,
//         } = JSON.parse(savedData)
//         if (sConf) setConfig(sConf)
//         if (sQuest) setQuestions(sQuest)
//         if (sStep) setStep(sStep)
//       } catch (e) {
//         console.error('Failed to parse draft', e)
//       }
//     }
//   }, [])

//   useEffect(() => {
//     localStorage.setItem(
//       'draft_exam_builder',
//       JSON.stringify({ config, questions, step }),
//     )
//   }, [config, questions, step])

//   // --- DERIVED STATE ---
//   const filteredQuestions = useMemo(() => {
//     return questions.filter(
//       (q) =>
//         q.body.toLowerCase().includes(searchQuery.toLowerCase()) ||
//         q.topic.toLowerCase().includes(searchQuery.toLowerCase()),
//     )
//   }, [questions, searchQuery])

//   // --- HANDLERS ---
//   const applyGlobalMark = () => {
//     if (
//       confirm(`Set all ${questions.length} questions to ${globalMark} marks?`)
//     ) {
//       setQuestions(questions.map((q) => ({ ...q, mark: globalMark })))
//     }
//   }

//   const handleNext = () => {
//     if (step === 1 && !config.title.trim())
//       return alert('Exam Title is required.')
//     if (step === 2 && questions.length === 0)
//       return alert('Add at least one question.')
//     setStep((prev) => (prev + 1) as 1 | 2 | 3)
//     window.scrollTo(0, 0)
//   }

//   const handleBack = () => setStep((prev) => (prev - 1) as 1 | 2 | 3)

//   const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0]
//     if (file) {
//       if (file.size > 1024 * 1024)
//         return alert('Image too large (max 1MB for performance)')
//       const reader = new FileReader()
//       reader.onloadend = () =>
//         setForm({ ...form, image: reader.result as string })
//       reader.readAsDataURL(file)
//     }
//   }

//   const handleBulkUpload = (e: ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0]
//     if (!file) return

//     setIsBulkUploading(true)
//     const reader = new FileReader()
//     reader.onload = (evt) => {
//       try {
//         const data = new Uint8Array(evt.target?.result as ArrayBuffer)
//         const workbook = XLSX.read(data, { type: 'array' })
//         const sheet = workbook.Sheets[workbook.SheetNames[0]]
//         const rows = XLSX.utils.sheet_to_json(sheet) as any[]

//         const parsed: Question[] = rows.map((row, i) => ({
//           id: `bulk-${Date.now()}-${i}`,
//           qNumber: questions.length + i + 1,
//           subject: row.Subject || row.subject || config.title || 'General',
//           topic: row.Topic || row.topic || 'General',
//           body: row.Question || row.Body || row.body || '',
//           options: {
//             A: String(row.A || row.a || ''),
//             B: String(row.B || row.b || ''),
//             C: String(row.C || row.c || ''),
//             D: String(row.D || row.d || ''),
//             E: String(row.E || row.e || ''),
//           },
//           correctOption: String(
//             row.Answer || row.Correct || row.correct || 'A',
//           ).toUpperCase(),
//           explanation: row.Explanation || row.explanation || '',
//           image: null,
//           imageUrl: null,
//           mark: Number(row.Mark || row.mark) || 1,
//         }))

//         setQuestions((prev) => [...prev, ...parsed])
//       } catch (err) {
//         alert('File error. Ensure columns are: Question, A, B, C, D, Answer')
//       } finally {
//         setIsBulkUploading(false)
//         if (bulkInputRef.current) bulkInputRef.current.value = ''
//       }
//     }
//     reader.readAsArrayBuffer(file)
//   }

//   const handleSaveQuestion = () => {
//     if (!form.body?.trim() || !form.options?.A || !form.options?.B) {
//       return alert('Question body and at least options A & B are required.')
//     }

//     const newQuestion: Question = {
//       id: editingId || crypto.randomUUID(),
//       qNumber: editingId
//         ? questions.find((q) => q.id === editingId)?.qNumber || questions.length
//         : questions.length + 1,
//       subject: form.subject || JAMB_SUBJECTS[0],
//       topic: form.topic || 'General',
//       body: form.body || '',
//       options: form.options as { [key: string]: string} ,
//       correctOption: form.correctOption || 'A',
//       explanation: form.explanation || '',
//       image: form.image || null,
//       mark: form.mark || 1,
//       imageUrl: null
//     }

//     if (editingId) {
//       setQuestions(questions.map((q) => (q.id === editingId ? newQuestion : q)))
//       setEditingId(null)
//     } else {
//       setQuestions([...questions, newQuestion])
//     }

//     setForm({
//       subject: form.subject,
//       topic: '',
//       body: '',
//       options: { A: '', B: '', C: '', D: '', E: '' },
//       correctOption: 'A',
//       explanation: '',
//       image: null,
//       mark: form.mark,
//     })
//   }

//   const handleDeploy = () => {
//     // 1. Strict Validation
//     if (!config.title) return alert('Please provide an exam title in Step 1.')
//     if (questions.length === 0)
//       return alert('Please add at least one question.')

//     // 2. Advanced Mapping
//     // This ensures every field (Timer, Options, Images, Explanations) is preserved
//     const formattedQuestions = questions.map((q) => ({
//       id: q.id,
//       Question: q.body,
//       A: q.options.A || '',
//       B: q.options.B || '',
//       C: q.options.C || '',
//       D: q.options.D || '',
//       E: q.options.E || '', // Explicitly include E even if empty to maintain structure
//       Answer: q.correctOption,
//       Explanation: q.explanation || 'No explanation provided.',
//       image: q.image || q.imageUrl || null, // Capture both base64 and URLs
//       mark: q.mark || 1,
//       subject: q.subject,
//       topic: q.topic,
//     }))

//     const examId = `QZ-${Math.random().toString(36).substring(2, 6).toUpperCase()}`

//     // 3. Final Data Package
//     const finalData = {
//       id: examId,
//       title: config.title,
//       description: config.description || '',
//       totalQuestions: questions.length,
//       timeLimit: Number(config.timeLimit) || 30, // Ensures timer is a valid number
//       shuffle: config.shuffleQuestions,
//       showLeaderboard: config.showLeaderboard,
//       accessCode: config.accessCode,
//       questions: formattedQuestions,
//       url: `/take-exam/${examId}`,
//       createdAt: new Date().toISOString(),
//       attempts: [],
//     }

//     try {
//       // 4. Atomic Save
//       const existing = JSON.parse(localStorage.getItem('my_quizzes') || '[]')

//       // Check for duplicate IDs just in case
//       const updatedQuizzes = [
//         finalData,
//         ...existing.filter((q: any) => q.id !== examId),
//       ]

//       const serializedData = JSON.stringify(updatedQuizzes)

//       // Safety Check: LocalStorage is usually 5MB.
//       // Images can bloat this.
//       localStorage.setItem('my_quizzes', serializedData)

//       // 5. Cleanup and Broadcast
//       localStorage.removeItem('draft_exam_builder')
//       window.dispatchEvent(new Event('storage-update'))

//       alert(
//         '🚀 Exam Published Successfully! All data, including images and explanations, are now live.',
//       )

//       // 6. Reset State
//       setQuestions([])
//       setConfig({
//         title: '',
//         description: '',
//         timeLimit: 30,
//         shuffleQuestions: false,
//         showLeaderboard: true,
//         accessCode: '',
//       })
//       setStep(1)
//       setShowConfirmModal(false)
//     } catch (error) {
//       console.error('Deployment failed:', error)
//       alert(
//         'CRITICAL ERROR: Storage Full. You likely have too many large images. Try removing some images or reducing their size before publishing.',
//       )
//     }
//   }

//   return (
//     <div className='min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col text-[13px] font-sans selection:bg-indigo-100'>
//       {/* HEADER */}
//       <header className='bg-white/90 backdrop-blur-md border-b border-slate-200 px-6 py-3 sticky top-0 z-40'>
//         <div className='max-w-7xl mx-auto flex justify-between items-center'>
//           <div className='flex items-center gap-3'>
//             <div className='bg-indigo-600 p-2 rounded-xl text-white shadow-lg shadow-indigo-100'>
//               <BookOpen size={18} />
//             </div>
//             <div className='hidden sm:block'>
//               <h1 className='text-sm font-black text-slate-800 leading-tight tracking-tight'>
//                 ExamBuilder <span className='text-indigo-600'>Pro</span>
//               </h1>
//               <p className='text-[9px] font-bold text-slate-400 uppercase tracking-widest'>
//                 {config.title || 'Draft Assessment'}
//               </p>
//             </div>
//           </div>

//           <div className='flex items-center gap-4'>
//             <div className='flex items-center bg-slate-100 p-1 rounded-full px-2 gap-4'>
//               {[1, 2, 3].map((n) => (
//                 <div key={n} className='flex items-center gap-2'>
//                   <div
//                     className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black transition-all ${
//                       step === n
//                         ? 'bg-indigo-600 text-white shadow-md'
//                         : step > n
//                           ? 'bg-emerald-500 text-white'
//                           : 'text-slate-400'
//                     }`}
//                   >
//                     {step > n ? <CheckCircle2 size={12} /> : n}
//                   </div>
//                   {step === n && (
//                     <span className='text-[10px] font-black text-slate-700 uppercase pr-2'>
//                       {n === 1 ? 'Setup' : n === 2 ? 'Questions' : 'Finalize'}
//                     </span>
//                   )}
//                 </div>
//               ))}
//             </div>
//           </div>
//         </div>
//       </header>

//       <main className='flex-1 max-w-7xl mx-auto w-full p-6'>
//         {step === 1 && (
//           <div className='max-w-xl mx-auto mt-8 bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden'>
//             <div className='p-10'>
//               <h2 className='text-2xl font-black text-slate-800 mb-2'>
//                 Assessment Details
//               </h2>
//               <p className='text-slate-500 mb-8 font-medium'>
//                 Define the basic rules and identity of your examination.
//               </p>

//               <div className='space-y-6'>
//                 <div>
//                   <label className='block text-[10px] font-black uppercase text-slate-400 mb-2 ml-1 tracking-widest'>
//                     Exam Name
//                   </label>
//                   <input
//                     value={config.title}
//                     onChange={(e) =>
//                       setConfig({ ...config, title: e.target.value })
//                     }
//                     className='w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold focus:border-indigo-500 outline-none transition-all'
//                     placeholder='e.g. 2026 Unified Tertiary Matriculation'
//                   />
//                 </div>
//                 <div>
//                   <label className='block text-[10px] font-black uppercase text-slate-400 mb-2 ml-1 tracking-widest'>
//                     Candidate Instructions
//                   </label>
//                   <textarea
//                     value={config.description}
//                     onChange={(e) =>
//                       setConfig({ ...config, description: e.target.value })
//                     }
//                     rows={4}
//                     className='w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-indigo-500 outline-none transition-all resize-none font-medium'
//                     placeholder='Describe how students should approach this test...'
//                   />
//                 </div>
//                 <button
//                   onClick={handleNext}
//                   className='w-full py-4 bg-slate-900 text-white rounded-2xl font-black uppercase text-[12px] tracking-widest hover:bg-indigo-600 transition-all flex justify-center items-center gap-2 shadow-xl shadow-slate-200'
//                 >
//                   Start Building Questions <ArrowRight size={16} />
//                 </button>
//               </div>
//             </div>
//           </div>
//         )}

//         {step === 2 && (
//           <div className='grid grid-cols-1 lg:grid-cols-12 gap-8'>
//             {/* LEFT: Editor */}
//             <div className='lg:col-span-5'>
//               <div className='bg-white p-6 rounded-3xl shadow-sm border border-slate-200 sticky top-24'>
//                 <div className='flex justify-between items-center mb-6'>
//                   <h3 className='font-black text-slate-800 text-[12px] flex items-center gap-2 uppercase tracking-widest'>
//                     {editingId ? (
//                       <Zap size={16} className='text-amber-500' />
//                     ) : (
//                       <Plus size={16} className='text-indigo-600' />
//                     )}
//                     {editingId ? 'Modify Question' : 'New Question'}
//                   </h3>
//                   <button
//                     onClick={() => bulkInputRef.current?.click()}
//                     className='text-[10px] font-black uppercase text-emerald-600 bg-emerald-50 px-4 py-2 rounded-xl hover:bg-emerald-100 flex items-center gap-2 transition-all'
//                   >
//                     <FileSpreadsheet size={14} /> Import Excel
//                   </button>
//                   <input
//                     type='file'
//                     ref={bulkInputRef}
//                     hidden
//                     onChange={handleBulkUpload}
//                     accept='.xlsx, .xls'
//                   />
//                 </div>

//                 <div className='space-y-4'>
//                   <div className='grid grid-cols-2 gap-3'>
//                     <select
//                       value={form.subject}
//                       onChange={(e) =>
//                         setForm({ ...form, subject: e.target.value })
//                       }
//                       className='p-3 bg-slate-50 border border-slate-200 rounded-xl text-[12px] font-bold outline-none focus:ring-2 focus:ring-indigo-500/20'
//                     >
//                       {JAMB_SUBJECTS.map((s) => (
//                         <option key={s} value={s}>
//                           {s}
//                         </option>
//                       ))}
//                     </select>
//                     <input
//                       placeholder='Topic (e.g. Algebra)'
//                       value={form.topic}
//                       onChange={(e) =>
//                         setForm({ ...form, topic: e.target.value })
//                       }
//                       className='p-3 bg-slate-50 border border-slate-200 rounded-xl text-[12px] font-bold outline-none'
//                     />
//                   </div>

//                   <div className='grid grid-cols-2 gap-3'>
//                     <div className='flex flex-col gap-1'>
//                       <span className='text-[9px] font-black text-slate-400 uppercase ml-1'>
//                         Marks
//                       </span>
//                       <input
//                         type='number'
//                         value={form.mark}
//                         onChange={(e) =>
//                           setForm({ ...form, mark: Number(e.target.value) })
//                         }
//                         className='p-3 bg-slate-50 border border-slate-200 rounded-xl text-[12px] font-bold outline-none'
//                       />
//                     </div>
//                     <div className='flex items-end'>
//                       <button
//                         onClick={() => fileInputRef.current?.click()}
//                         className={`w-full py-3 border-2 border-dashed rounded-xl text-[10px] font-black uppercase transition-all flex items-center justify-center gap-2 ${form.image ? 'border-indigo-500 text-indigo-600 bg-indigo-50' : 'border-slate-200 text-slate-400 hover:border-indigo-200'}`}
//                       >
//                         <ImageIcon size={14} />{' '}
//                         {form.image ? 'Attached' : 'Add Image'}
//                       </button>
//                       <input
//                         type='file'
//                         ref={fileInputRef}
//                         hidden
//                         onChange={handleImageUpload}
//                         accept='image/*'
//                       />
//                     </div>
//                   </div>

//                   <textarea
//                     placeholder='Write the question body here...'
//                     value={form.body}
//                     onChange={(e) => setForm({ ...form, body: e.target.value })}
//                     className='w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-[13px] font-medium min-h-25 outline-none focus:border-indigo-500'
//                   />

//                   <div className='space-y-2'>
//                     {['A', 'B', 'C', 'D', 'E'].map((opt) => (
//                       <div
//                         key={opt}
//                         className={`flex items-center gap-3 p-2 rounded-xl border-2 transition-all ${form.correctOption === opt ? 'border-emerald-500 bg-emerald-50' : 'border-slate-50 bg-white'}`}
//                       >
//                         <button
//                           onClick={() =>
//                             setForm({ ...form, correctOption: opt })
//                           }
//                           className={`w-8 h-8 rounded-lg flex items-center justify-center text-[11px] font-black shadow-sm ${form.correctOption === opt ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-400'}`}
//                         >
//                           {opt}
//                         </button>
//                         <input
//                           placeholder={`Option ${opt}`}
//                           value={form.options?.[opt] || ''}
//                           onChange={(e) =>
//                             setForm({
//                               ...form,
//                               options: {
//                                 ...form.options,
//                                 [opt]: e.target.value,
//                               } as any,
//                             })
//                           }
//                           className='flex-1 bg-transparent text-[12px] font-bold outline-none'
//                         />
//                       </div>
//                     ))}
//                   </div>

//                   <textarea
//                     placeholder='Explanation (shown after the exam)...'
//                     value={form.explanation}
//                     onChange={(e) =>
//                       setForm({ ...form, explanation: e.target.value })
//                     }
//                     className='w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-[12px] italic min-h-15 outline-none'
//                   />

//                   <div className='flex gap-2 pt-2'>
//                     <button
//                       onClick={handleSaveQuestion}
//                       className='flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase text-[11px] tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100'
//                     >
//                       {editingId ? 'Save Changes' : 'Add to Pool'}
//                     </button>
//                     {editingId && (
//                       <button
//                         onClick={() => {
//                           setEditingId(null)
//                           setForm({
//                             subject: JAMB_SUBJECTS[0],
//                             topic: '',
//                             body: '',
//                             options: { A: '', B: '', C: '', D: '', E: '' },
//                             correctOption: 'A',
//                             explanation: '',
//                             image: null,
//                             mark: 1,
//                           })
//                         }}
//                         className='p-4 bg-slate-100 text-slate-500 rounded-2xl'
//                       >
//                         <X size={20} />
//                       </button>
//                     )}
//                   </div>
//                 </div>
//               </div>
//             </div>

//             {/* RIGHT: Question Pool */}
//             <div className='lg:col-span-7 space-y-5'>
//               <div className='bg-white p-5 rounded-3xl border border-slate-200'>
//                 <div className='flex flex-col md:flex-row justify-between items-center gap-4'>
//                   <div className='relative w-full md:w-64'>
//                     <Search
//                       className='absolute left-3 top-1/2 -translate-y-1/2 text-slate-400'
//                       size={14}
//                     />
//                     <input
//                       placeholder='Search questions...'
//                       value={searchQuery}
//                       onChange={(e) => setSearchQuery(e.target.value)}
//                       className='w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[11px] font-bold outline-none'
//                     />
//                   </div>

//                   <div className='flex items-center gap-2 bg-indigo-50/50 p-1.5 rounded-2xl border border-indigo-100 w-full md:w-auto'>
//                     <div className='flex items-center gap-2 px-3 border-r border-indigo-100'>
//                       <Zap size={14} className='text-amber-500' />
//                       <span className='text-[10px] font-black text-indigo-900 uppercase'>
//                         Quick Mark:
//                       </span>
//                       <input
//                         type='number'
//                         value={globalMark}
//                         onChange={(e) => setGlobalMark(Number(e.target.value))}
//                         className='w-8 bg-transparent text-[11px] font-black text-center outline-none'
//                       />
//                     </div>
//                     <button
//                       onClick={applyGlobalMark}
//                       className='px-4 py-2 bg-indigo-600 text-white rounded-xl text-[9px] font-black uppercase hover:bg-indigo-700 transition-all'
//                     >
//                       Apply All
//                     </button>
//                   </div>
//                 </div>
//               </div>

//               <div className='space-y-4'>
//                 {filteredQuestions.length === 0 ? (
//                   <div className='bg-white border-2 border-dashed border-slate-200 rounded-3xl p-20 flex flex-col items-center text-slate-400'>
//                     <div className='bg-slate-50 p-6 rounded-full mb-4'>
//                       <UploadCloud size={48} className='opacity-20' />
//                     </div>
//                     <p className='text-[12px] font-black uppercase tracking-widest'>
//                       Question Pool is Empty
//                     </p>
//                     <p className='text-[10px] font-medium mt-1'>
//                       Start adding or import from Excel
//                     </p>
//                   </div>
//                 ) : (
//                   filteredQuestions.map((q, idx) => (
//                     <div
//                       key={q.id}
//                       className='bg-white p-5 rounded-2xl border border-slate-200 hover:border-indigo-400 transition-all group relative shadow-sm'
//                     >
//                       <div className='flex justify-between items-start mb-4'>
//                         <div className='flex flex-wrap gap-2'>
//                           <span className='bg-slate-900 text-white px-2 py-1 rounded-lg text-[10px] font-black'>
//                             #{idx + 1}
//                           </span>
//                           <span className='px-3 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-[10px] font-black uppercase'>
//                             {q.subject}
//                           </span>
//                           <span className='px-3 py-1 bg-slate-100 text-slate-500 rounded-lg text-[10px] font-black uppercase'>
//                             {q.topic}
//                           </span>
//                           <span className='px-3 py-1 bg-amber-50 text-amber-600 rounded-lg text-[10px] font-black uppercase'>
//                             {q.mark} Points
//                           </span>
//                         </div>
//                         <div className='flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity'>
//                           <button
//                             onClick={() => {
//                               setEditingId(q.id)
//                               setForm(q)
//                               window.scrollTo({ top: 0, behavior: 'smooth' })
//                             }}
//                             className='p-2 text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100'
//                           >
//                             <Edit3 size={16} />
//                           </button>
//                           <button
//                             onClick={() =>
//                               setQuestions(
//                                 questions.filter((i) => i.id !== q.id),
//                               )
//                             }
//                             className='p-2 text-red-600 bg-red-50 rounded-lg hover:bg-red-100'
//                           >
//                             <Trash2 size={16} />
//                           </button>
//                         </div>
//                       </div>
//                       <p className='text-[14px] font-bold text-slate-800 leading-relaxed mb-4'>
//                         {q.body}
//                       </p>

//                       <div className='grid grid-cols-1 md:grid-cols-2 gap-2'>
//                         {Object.entries(q.options).map(
//                           ([k, v]) =>
//                             v && (
//                               <div
//                                 key={k}
//                                 className={`text-[11px] p-3 rounded-xl border-2 ${q.correctOption === k ? 'border-emerald-200 bg-emerald-50 text-emerald-700 font-bold' : 'border-slate-50 bg-slate-50/50 text-slate-500'}`}
//                               >
//                                 <span className='mr-2 opacity-60'>{k}.</span>{' '}
//                                 {v}
//                               </div>
//                             ),
//                         )}
//                       </div>
//                     </div>
//                   ))
//                 )}
//               </div>

//               {questions.length > 0 && (
//                 <button
//                   onClick={handleNext}
//                   className='w-full py-5 bg-slate-900 text-white rounded-2xl text-[12px] font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-indigo-600 transition-all shadow-xl shadow-slate-200'
//                 >
//                   Configure Exam Logistics <Settings size={18} />
//                 </button>
//               )}
//             </div>
//           </div>
//         )}

//         {step === 3 && (
//           <div className='max-w-md mx-auto mt-4'>
//             <div className='bg-white rounded-4xl shadow-2xl border border-slate-200 overflow-hidden'>
//               <div className='bg-indigo-600 p-8 text-white text-center'>
//                 <div className='w-16 h-16 bg-white/20 rounded-3xl flex items-center justify-center mx-auto mb-4 backdrop-blur-md'>
//                   <Trophy className='text-yellow-300' size={32} />
//                 </div>
//                 <h2 className='text-xl font-black uppercase tracking-tighter'>
//                   Ready for Deployment
//                 </h2>
//                 <p className='text-indigo-100 text-[10px] uppercase font-bold tracking-[0.2em] mt-1'>
//                   Review Logistics & Publish
//                 </p>
//               </div>

//               <div className='p-8 space-y-6'>
//                 <div className='flex items-center justify-between p-4 bg-slate-50 rounded-2xl border-2 border-slate-100'>
//                   <div className='flex items-center gap-4'>
//                     <div className='bg-orange-100 p-3 rounded-xl text-orange-600'>
//                       <Clock size={20} />
//                     </div>
//                     <div>
//                       <p className='font-black text-slate-800 text-[11px] uppercase'>
//                         Duration
//                       </p>
//                       <p className='text-[10px] text-slate-400 font-bold'>
//                         Total Minutes
//                       </p>
//                     </div>
//                   </div>
//                   <input
//                     type='number'
//                     value={config.timeLimit}
//                     onChange={(e) =>
//                       setConfig({
//                         ...config,
//                         timeLimit: Number(e.target.value),
//                       })
//                     }
//                     className='w-16 p-3 text-center font-black bg-white border-2 border-slate-200 rounded-xl text-sm outline-none focus:border-indigo-500'
//                   />
//                 </div>

//                 <div className='grid grid-cols-2 gap-4'>
//                   {[
//                     {
//                       label: 'Randomize Pool',
//                       icon: <Shuffle size={18} />,
//                       key: 'shuffleQuestions' as const,
//                     },
//                     {
//                       label: 'Live Leaderboard',
//                       icon: <Trophy size={18} />,
//                       key: 'showLeaderboard' as const,
//                     },
//                   ].map((item) => (
//                     <button
//                       key={item.key}
//                       onClick={() =>
//                         setConfig({ ...config, [item.key]: !config[item.key] })
//                       }
//                       className={`p-5 rounded-3xl border-2 transition-all text-left ${config[item.key] ? 'border-indigo-500 bg-indigo-50' : 'border-slate-100 bg-slate-50/50'}`}
//                     >
//                       <div
//                         className={`mb-3 ${config[item.key] ? 'text-indigo-600' : 'text-slate-400'}`}
//                       >
//                         {item.icon}
//                       </div>
//                       <p className='text-[10px] font-black uppercase text-slate-800'>
//                         {item.label}
//                       </p>
//                       <p className='text-[9px] font-bold text-slate-400 uppercase mt-1'>
//                         {config[item.key] ? 'Enabled' : 'Disabled'}
//                       </p>
//                     </button>
//                   ))}
//                 </div>

//                 <div>
//                   <label className='block text-[10px] font-black uppercase text-slate-400 mb-2 ml-1 tracking-widest'>
//                     Security Access Code
//                   </label>
//                   <input
//                     placeholder='Leave empty for public'
//                     value={config.accessCode}
//                     onChange={(e) =>
//                       setConfig({ ...config, accessCode: e.target.value })
//                     }
//                     className='w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-black text-center text-sm tracking-[0.5em] outline-none focus:border-indigo-500'
//                   />
//                 </div>

//                 <div className='pt-4 space-y-3'>
//                   <button
//                     onClick={() => setShowConfirmModal(true)}
//                     className='w-full py-4 bg-emerald-600 text-white rounded-2xl font-black uppercase text-[12px] tracking-widest hover:bg-emerald-700 shadow-xl shadow-emerald-100 transition-all flex justify-center items-center gap-3'
//                   >
//                     <Save size={18} /> Launch Examination
//                   </button>
//                   <button
//                     onClick={handleBack}
//                     className='w-full py-2 text-slate-400 font-black uppercase text-[10px] flex justify-center items-center gap-2 hover:text-slate-600'
//                   >
//                     <ArrowLeft size={14} /> Adjust Questions
//                   </button>
//                 </div>
//               </div>
//             </div>
//           </div>
//         )}
//       </main>

//       {/* CONFIRMATION MODAL */}
//       {showConfirmModal && (
//         <div className='fixed inset-0 z-100 flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-sm'>
//           <div className='bg-white rounded-3xl max-w-sm w-full p-8 shadow-2xl text-center border border-slate-200'>
//             <div className='w-20 h-20 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center mx-auto mb-6'>
//               <AlertTriangle size={40} />
//             </div>
//             <h3 className='text-xl font-black text-slate-800 mb-2'>
//               Final Confirmation
//             </h3>
//             <p className='text-slate-500 text-[13px] leading-relaxed mb-8'>
//               You are about to publish{' '}
//               <span className='font-bold text-slate-800'>"{config.title}"</span>{' '}
//               with{' '}
//               <span className='font-bold text-slate-800'>
//                 {questions.length} questions
//               </span>
//               . This will be available for candidates immediately.
//             </p>
//             <div className='flex flex-col gap-3'>
//               <button
//                 onClick={handleDeploy}
//                 className='w-full py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase text-[11px] tracking-widest hover:bg-indigo-700'
//               >
//                 Confirm & Publish
//               </button>
//               <button
//                 onClick={() => setShowConfirmModal(false)}
//                 className='w-full py-4 bg-slate-100 text-slate-500 rounded-2xl font-black uppercase text-[11px] tracking-widest'
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


//src/app/admin/components/ExamBuilder.tsx

'use client'

import { useState } from 'react'
import { useExamBuilder } from '../hooks/useExamBuilder'
import Step1Setup from './components/Step1Setup'
import Step2QuestionEditor from './components/Step2QuestionEditor'
import Step3Logistics from './components/Step3Logistics'
import HeaderSteps from './components/HeaderSteps'
import { CheckCircle2, Loader2, AlertCircle } from 'lucide-react'

export default function ExamBuilder() {
  const {
    step,
    setStep,
    config,
    setConfig,
    questions,
    setQuestions,
    isDeploying,
    deployToBackend,
  } = useExamBuilder()

  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')

  const handleFinalPublish = async () => {
    try {
      const result = await deployToBackend()
      if (result) {
        setStatus('success')
        // Optional: Redirect after 2 seconds
        // setTimeout(() => router.push('/admin/quizzes'), 2000)
      }
    } catch (err) {
      setStatus('error')
      setTimeout(() => setStatus('idle'), 4000) // Reset error after 4s
    }
  }

  return (
    <div className='min-h-screen bg-[#F8FAFC] relative'>
      <HeaderSteps currentStep={step} />

      <main className='max-w-7xl mx-auto p-6'>
        {step === 1 && (
          <Step1Setup
            config={config}
            setConfig={setConfig}
            onNext={() => setStep(2)}
          />
        )}

        {step === 2 && (
          <Step2QuestionEditor
            questions={questions}
            setQuestions={setQuestions}
            onNext={() => setStep(3)}
          />
        )}

        {step === 3 && (
          <Step3Logistics
            config={config}
            setConfig={setConfig}
            onBack={() => setStep(2)}
            onPublish={handleFinalPublish}
          />
        )}
      </main>

      {/* --- GLOBAL OVERLAYS --- */}

      {/* Loading State */}
      {isDeploying && (
        <div className='fixed inset-0 z-100 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center'>
          <div className='bg-white p-8 rounded-3xl shadow-2xl flex flex-col items-center gap-4'>
            <Loader2 className='text-indigo-600 animate-spin' size={40} />
            <p className='text-[11px] font-black uppercase tracking-widest text-slate-500'>
              Syncing with DSA Cloud...
            </p>
          </div>
        </div>
      )}

      {/* Success Notification */}
      {status === 'success' && (
        <div className='fixed top-24 right-8 z-110 animate-in slide-in-from-right-10 duration-500'>
          <div className='bg-emerald-500 text-white px-6 py-4 rounded-2xl shadow-xl flex items-center gap-4'>
            <CheckCircle2 size={24} />
            <div>
              <p className='text-[12px] font-black uppercase leading-none'>
                Deployment Live
              </p>
              <p className='text-[10px] opacity-90 font-bold'>
                The exam is now accessible to candidates.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Error Notification */} 
      {status === 'error' && (
        <div className='fixed top-24 right-8 z-110 animate-in slide-in-from-right-10 duration-300'>
          <div className='bg-rose-500 text-white px-6 py-4 rounded-2xl shadow-xl flex items-center gap-4'>
            <AlertCircle size={24} />
            <div>
              <p className='text-[12px] font-black uppercase leading-none'>
                Upload Failed
              </p>
              <p className='text-[10px] opacity-90 font-bold'>
                Please check your network and token.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}