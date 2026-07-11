// 'use client'
// import React, { useState } from 'react'
// import {
//   Search,
//   Zap,
//   UploadCloud,
//   Edit3,
//   Trash2,
//   CheckCircle2,
//   ListOrdered,
//   Lightbulb,
//   ChevronDown,
//   ChevronUp,
//   Eye,
//   EyeOff,
// } from 'lucide-react'

// export const QuestionPool = ({
//   questions,
//   setQuestions,
//   searchQuery,
//   setSearchQuery,
//   globalMark,
//   setGlobalMark,
//   applyGlobalMark,
//   onEdit,
// }: any) => {
//   // Track which individual explanations are expanded
//   const [expandedExplanations, setExpandedExplanations] = useState<
//     Record<string, boolean>
//   >({})
//   const [showAllExplanations, setShowAllExplanations] = useState(false)

//   const toggleExplanation = (id: string) => {
//     setExpandedExplanations((prev) => ({
//       ...prev,
//       [id]: !prev[id],
//     }))
//   }

//   const toggleAllExplanations = () => {
//     const newState = !showAllExplanations
//     setShowAllExplanations(newState)
//     const allIds: Record<string, boolean> = {}
//     if (newState) {
//       questions.forEach((q: any) => {
//         if (q.explanation) allIds[q.id] = true
//       })
//     }
//     setExpandedExplanations(allIds)
//   }

//   const filteredQuestions = questions.filter(
//     (q: any) =>
//       q.body.toLowerCase().includes(searchQuery.toLowerCase()) ||
//       q.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
//       (q.explanation &&
//         q.explanation.toLowerCase().includes(searchQuery.toLowerCase())),
//   )

//   return (
//     <div className='lg:col-span-7 space-y-5 animate-in fade-in slide-in-from-right-4 duration-500'>
//       {/* TOOLBAR */}
//       <div className='bg-white p-5 rounded-3xl border border-slate-200 shadow-sm'>
//         <div className='flex flex-col md:flex-row justify-between items-center gap-4'>
//           <div className='flex items-center gap-3 w-full md:w-auto'>
//             <div className='relative flex-1 md:w-64'>
//               <Search
//                 className='absolute left-3 top-1/2 -translate-y-1/2 text-slate-400'
//                 size={14}
//               />
//               <input
//                 placeholder='Search pool...'
//                 value={searchQuery}
//                 onChange={(e) => setSearchQuery(e.target.value)}
//                 className='w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[11px] font-bold outline-none focus:border-indigo-300 transition-all'
//               />
//             </div>

//             <button
//               onClick={toggleAllExplanations}
//               className={`p-2.5 rounded-xl border transition-all flex items-center gap-2 ${showAllExplanations ? 'bg-amber-50 border-amber-200 text-amber-600' : 'bg-slate-50 border-slate-200 text-slate-400'}`}
//               title='Toggle all explanations'
//             >
//               {showAllExplanations ? <EyeOff size={16} /> : <Eye size={16} />}
//               <span className='text-[10px] font-black uppercase hidden sm:inline'>
//                 Explanations
//               </span>
//             </button>
//           </div>

//           <div className='flex items-center gap-2 bg-indigo-50/50 p-1.5 rounded-2xl border border-indigo-100 w-full md:w-auto'>
//             <div className='flex items-center gap-2 px-3 border-r border-indigo-100'>
//               <Zap size={14} className='text-amber-500' />
//               <span className='text-[10px] font-black text-indigo-900 uppercase'>
//                 Apply Marks:
//               </span>
//               <input
//                 type='number'
//                 value={globalMark}
//                 onChange={(e) => setGlobalMark(Number(e.target.value))}
//                 className='w-8 bg-transparent text-[11px] font-black text-center outline-none [appearance:textfield]'
//               />
//             </div>
//             <button
//               onClick={applyGlobalMark}
//               className='px-4 py-2 bg-indigo-600 text-white rounded-xl text-[9px] font-black uppercase hover:bg-indigo-700 transition-all active:scale-95'
//             >
//               Update All
//             </button>
//           </div>
//         </div>
//       </div>

//       {/* QUESTION LIST */}
//       <div className='space-y-4'>
//         {filteredQuestions.length === 0 ? (
//           <div className='bg-white border-2 border-dashed border-slate-200 rounded-[40px] p-20 flex flex-col items-center text-slate-400'>
//             <div className='bg-slate-50 p-6 rounded-full mb-4'>
//               <UploadCloud size={48} className='opacity-20' />
//             </div>
//             <p className='text-[12px] font-black uppercase tracking-widest text-slate-500'>
//               No Questions Found
//             </p>
//           </div>
//         ) : (
//           filteredQuestions.map((q: any, idx: number) => (
//             <div
//               key={q.id}
//               className='bg-white p-6 rounded-[32px] border border-slate-200 hover:border-indigo-400 transition-all group relative shadow-sm hover:shadow-xl hover:shadow-indigo-50/50'
//             >
//               <div className='flex justify-between items-start mb-4'>
//                 <div className='flex flex-wrap gap-2'>
//                   <span className='bg-slate-900 text-white px-2.5 py-1 rounded-lg text-[10px] font-black flex items-center gap-1'>
//                     <ListOrdered size={10} /> {idx + 1}
//                   </span>
//                   <span className='px-3 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-[10px] font-black uppercase tracking-tight'>
//                     {q.subject}
//                   </span>
//                   <span className='px-3 py-1 bg-amber-50 text-amber-600 rounded-lg text-[10px] font-black uppercase tracking-tight'>
//                     {q.mark} pts
//                   </span>

//                   {q.explanation && (
//                     <button
//                       onClick={() => toggleExplanation(q.id)}
//                       className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase flex items-center gap-1.5 transition-all ${expandedExplanations[q.id] ? 'bg-amber-500 text-white' : 'bg-slate-100 text-slate-500 hover:bg-amber-100'}`}
//                     >
//                       <Lightbulb size={10} />
//                       Explanation
//                       {expandedExplanations[q.id] ? (
//                         <ChevronUp size={10} />
//                       ) : (
//                         <ChevronDown size={10} />
//                       )}
//                     </button>
//                   )}
//                 </div>

//                 <div className='flex gap-1 md:opacity-0 group-hover:opacity-100 transition-all'>
//                   <button
//                     onClick={() => onEdit(q)}
//                     className='p-2 text-indigo-600 bg-indigo-50 rounded-xl hover:bg-indigo-600 hover:text-white transition-all'
//                   >
//                     <Edit3 size={15} />
//                   </button>
//                   <button
//                     onClick={() =>
//                       setQuestions(questions.filter((i: any) => i.id !== q.id))
//                     }
//                     className='p-2 text-red-600 bg-red-50 rounded-xl hover:bg-red-600 hover:text-white transition-all'
//                   >
//                     <Trash2 size={15} />
//                   </button>
//                 </div>
//               </div>

//               <div className='flex flex-col md:flex-row gap-4'>
//                 {q.image && (
//                   <div className='w-24 h-24 rounded-2xl overflow-hidden border border-slate-100 flex-shrink-0 bg-slate-50 self-start'>
//                     <img
//                       src={q.image}
//                       alt='Question'
//                       className='w-full h-full object-cover'
//                     />
//                   </div>
//                 )}
//                 <div className='flex-1'>
//                   <p className='text-[14px] font-bold text-slate-800 leading-snug mb-4'>
//                     {q.body}
//                   </p>
//                   <div className='grid grid-cols-1 md:grid-cols-2 gap-2'>
//                     {Object.entries(q.options).map(
//                       ([k, v]: any) =>
//                         v && (
//                           <div
//                             key={k}
//                             className={`text-[11px] p-3 rounded-2xl border-2 flex items-center gap-2 transition-colors ${q.correctOption === k ? 'border-emerald-200 bg-emerald-50 text-emerald-700 font-bold' : 'border-slate-50 bg-slate-50/50 text-slate-500'}`}
//                           >
//                             <span
//                               className={`w-5 h-5 rounded flex items-center justify-center text-[9px] ${q.correctOption === k ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-400'}`}
//                             >
//                               {k}
//                             </span>
//                             <span className='truncate'>{v}</span>
//                             {q.correctOption === k && (
//                               <CheckCircle2
//                                 size={12}
//                                 className='ml-auto text-emerald-500'
//                               />
//                             )}
//                           </div>
//                         ),
//                     )}
//                   </div>
//                 </div>
//               </div>

//               {/* --- COLLAPSIBLE EXPLANATION --- */}
//               {q.explanation && expandedExplanations[q.id] && (
//                 <div className='mt-5 pt-4 border-t border-slate-100 animate-in slide-in-from-top-2 duration-300'>
//                   <div className='flex gap-3 bg-amber-50/50 p-4 rounded-2xl border border-amber-100/50 shadow-inner'>
//                     <div className='mt-0.5'>
//                       <Lightbulb size={14} className='text-amber-500' />
//                     </div>
//                     <div className='space-y-1'>
//                       <p className='text-[9px] font-black uppercase tracking-widest text-amber-600/80'>
//                         Key Explanation
//                       </p>
//                       <p className='text-[11px] text-slate-600 font-medium leading-relaxed'>
//                         {q.explanation}
//                       </p>
//                     </div>
//                   </div>
//                 </div>
//               )}
//             </div>
//           ))
//         )}
//       </div>
//     </div>
//   )
// }

// 'use client'
// import React, { useState } from 'react'
// import {
//   Search,
//   Zap,
//   UploadCloud,
//   Edit3,
//   Trash2,
//   CheckCircle2,
//   ListOrdered,
//   Lightbulb,
//   ChevronDown,
//   ChevronUp,
//   Eye,
//   EyeOff,
// } from 'lucide-react'

// export const QuestionPool = ({
//   questions,
//   setQuestions,
//   searchQuery,
//   setSearchQuery,
//   globalMark,
//   setGlobalMark,
//   applyGlobalMark,
//   onEdit,
// }: any) => {
//   const [expandedExplanations, setExpandedExplanations] = useState<
//     Record<string, boolean>
//   >({})
//   const [showAllExplanations, setShowAllExplanations] = useState(false)

//   const toggleExplanation = (id: string) => {
//     setExpandedExplanations((prev) => ({
//       ...prev,
//       [id]: !prev[id],
//     }))
//   }

//   const toggleAllExplanations = () => {
//     const newState = !showAllExplanations
//     setShowAllExplanations(newState)
//     const allIds: Record<string, boolean> = {}
//     if (newState) {
//       questions.forEach((q: any) => {
//         if (q.explanation) allIds[q.id] = true
//       })
//     }
//     setExpandedExplanations(allIds)
//   }

//   const filteredQuestions = questions.filter(
//     (q: any) =>
//       q.body.toLowerCase().includes(searchQuery.toLowerCase()) ||
//       q.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
//       (q.explanation &&
//         q.explanation.toLowerCase().includes(searchQuery.toLowerCase())),
//   )

//   return (
//     <div className='lg:col-span-7 flex flex-col min-w-0 animate-in fade-in slide-in-from-right-4 duration-500'>
//       {/* STICKY TOOLBAR */}
//       <div className='sticky top-0 z-20 bg-slate-50/80 backdrop-blur-md pb-4'>
//         <div className='bg-white p-4 rounded-3xl border border-slate-200 shadow-sm'>
//           <div className='flex flex-col xl:flex-row justify-between items-center gap-4'>
//             {/* Search & Toggle Group */}
//             <div className='flex items-center gap-2 w-full xl:w-auto min-w-0'>
//               <div className='relative flex-1 xl:w-64 min-w-0'>
//                 <Search
//                   className='absolute left-3 top-1/2 -translate-y-1/2 text-slate-400'
//                   size={14}
//                 />
//                 <input
//                   placeholder='Search questions...'
//                   value={searchQuery}
//                   onChange={(e) => setSearchQuery(e.target.value)}
//                   className='w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[11px] font-bold outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-400 transition-all'
//                 />
//               </div>

//               <button
//                 onClick={toggleAllExplanations}
//                 className={`p-2.5 rounded-xl border transition-all flex items-center gap-2 shrink-0 ${
//                   showAllExplanations
//                     ? 'bg-amber-50 border-amber-200 text-amber-600'
//                     : 'bg-white border-slate-200 text-slate-400 hover:bg-slate-50'
//                 }`}
//               >
//                 {showAllExplanations ? <EyeOff size={16} /> : <Eye size={16} />}
//                 <span className='text-[10px] font-black uppercase hidden sm:inline'>
//                   Explanations
//                 </span>
//               </button>
//             </div>

//             {/* Global Marks Action */}
//             <div className='flex items-center gap-2 bg-indigo-50/50 p-1.5 rounded-2xl border border-indigo-100 w-full xl:w-auto justify-between'>
//               <div className='flex items-center gap-2 px-3 border-r border-indigo-100'>
//                 <Zap size={14} className='text-amber-500' />
//                 <span className='text-[10px] font-black text-indigo-900 uppercase whitespace-nowrap'>
//                   Marks:
//                 </span>
//                 <input
//                   type='number'
//                   value={globalMark}
//                   onChange={(e) => setGlobalMark(Number(e.target.value))}
//                   className='w-8 bg-transparent text-[11px] font-black text-center outline-none'
//                 />
//               </div>
//               <button
//                 onClick={applyGlobalMark}
//                 className='px-4 py-2 bg-indigo-600 text-white rounded-xl text-[9px] font-black uppercase hover:bg-indigo-700 transition-all active:scale-95 whitespace-nowrap'
//               >
//                 Update All
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* SCROLLABLE LIST AREA */}
//       <div className='space-y-4 pb-10'>
//         {filteredQuestions.length === 0 ? (
//           <div className='bg-white border-2 border-dashed border-slate-200 rounded-[40px] py-20 flex flex-col items-center text-slate-400'>
//             <UploadCloud size={40} className='opacity-20 mb-4' />
//             <p className='text-[10px] font-black uppercase tracking-widest'>
//               No Results Found
//             </p>
//           </div>
//         ) : (
//           filteredQuestions.map((q: any, idx: number) => (
//             <div
//               key={q.id}
//               className='bg-white p-5 md:p-6 rounded-[32px] border border-slate-200 hover:border-indigo-300 transition-all group relative shadow-sm overflow-hidden'
//             >
//               <div className='flex justify-between items-start mb-4 gap-4'>
//                 <div className='flex flex-wrap gap-2 min-w-0'>
//                   <span className='bg-slate-900 text-white px-2.5 py-1 rounded-lg text-[10px] font-black flex items-center gap-1 shrink-0'>
//                     <ListOrdered size={10} /> {idx + 1}
//                   </span>
//                   <span className='px-3 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-[10px] font-black uppercase truncate max-w-[120px]'>
//                     {q.subject}
//                   </span>
//                   <span className='px-3 py-1 bg-amber-50 text-amber-600 rounded-lg text-[10px] font-black uppercase shrink-0'>
//                     {q.mark} pts
//                   </span>

//                   {q.explanation && (
//                     <button
//                       onClick={() => toggleExplanation(q.id)}
//                       className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase flex items-center gap-1.5 transition-all shrink-0 ${
//                         expandedExplanations[q.id]
//                           ? 'bg-amber-500 text-white'
//                           : 'bg-slate-100 text-slate-500 hover:bg-amber-100'
//                       }`}
//                     >
//                       <Lightbulb size={10} />
//                       {expandedExplanations[q.id] ? (
//                         <ChevronUp size={10} />
//                       ) : (
//                         <ChevronDown size={10} />
//                       )}
//                     </button>
//                   )}
//                 </div>

//                 <div className='flex gap-1 shrink-0 md:opacity-0 group-hover:opacity-100 transition-opacity'>
//                   <button
//                     onClick={() => onEdit(q)}
//                     className='p-2 text-indigo-600 bg-indigo-50 rounded-xl hover:bg-indigo-600 hover:text-white transition-all'
//                   >
//                     <Edit3 size={15} />
//                   </button>
//                   <button
//                     onClick={() =>
//                       setQuestions(questions.filter((i: any) => i.id !== q.id))
//                     }
//                     className='p-2 text-red-600 bg-red-50 rounded-xl hover:bg-red-600 hover:text-white transition-all'
//                   >
//                     <Trash2 size={15} />
//                   </button>
//                 </div>
//               </div>

//               <div className='flex flex-col md:flex-row gap-5'>
//                 {q.image && (
//                   <div className='w-full md:w-32 h-32 rounded-2xl overflow-hidden border border-slate-100 shrink-0 bg-slate-50'>
//                     <img
//                       src={q.image}
//                       alt='Question'
//                       className='w-full h-full object-cover'
//                     />
//                   </div>
//                 )}

//                 <div className='flex-1 min-w-0'>
//                   <p className='text-[14px] font-bold text-slate-800 leading-relaxed mb-4 break-words'>
//                     {q.body}
//                   </p>

//                   <div className='grid grid-cols-1 sm:grid-cols-2 gap-2'>
//                     {Object.entries(q.options).map(
//                       ([k, v]: any) =>
//                         v && (
//                           <div
//                             key={k}
//                             className={`text-[11px] p-3 rounded-2xl border-2 flex items-center gap-3 transition-colors min-w-0 ${
//                               q.correctOption === k
//                                 ? 'border-emerald-200 bg-emerald-50 text-emerald-700 font-bold'
//                                 : 'border-slate-50 bg-slate-50/50 text-slate-500'
//                             }`}
//                           >
//                             <span
//                               className={`w-5 h-5 rounded flex items-center justify-center text-[9px] shrink-0 ${
//                                 q.correctOption === k
//                                   ? 'bg-emerald-500 text-white'
//                                   : 'bg-slate-200 text-slate-400'
//                               }`}
//                             >
//                               {k}
//                             </span>
//                             <span className='truncate min-w-0 flex-1'>{v}</span>
//                             {q.correctOption === k && (
//                               <CheckCircle2
//                                 size={12}
//                                 className='text-emerald-500 shrink-0'
//                               />
//                             )}
//                           </div>
//                         ),
//                     )}
//                   </div>
//                 </div>
//               </div>

//               {q.explanation && expandedExplanations[q.id] && (
//                 <div className='mt-5 pt-4 border-t border-slate-100 animate-in slide-in-from-top-2 duration-300'>
//                   <div className='flex gap-3 bg-amber-50/50 p-4 rounded-2xl border border-amber-100/50'>
//                     <Lightbulb
//                       size={14}
//                       className='text-amber-500 shrink-0 mt-0.5'
//                     />
//                     <div className='min-w-0'>
//                       <p className='text-[9px] font-black uppercase tracking-widest text-amber-600/80'>
//                         Key Explanation
//                       </p>
//                       <p className='text-[11px] text-slate-600 font-medium leading-relaxed break-words'>
//                         {q.explanation}
//                       </p>
//                     </div>
//                   </div>
//                 </div>
//               )}
//             </div>
//           ))
//         )}
//       </div>
//     </div>
//   )
// }

'use client'

import React, { useState, useMemo } from 'react'
import {
  Search,
  Zap,
  UploadCloud,
  Edit3,
  Trash2,
  CheckCircle2,
  ListOrdered,
  Lightbulb,
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff,
  X,
} from 'lucide-react'

interface QuestionPoolProps {
  questions: any[]
  setQuestions: (qs: any[]) => void
  searchQuery: string
  setSearchQuery: (query: string) => void
  globalMark: number
  setGlobalMark: (mark: number) => void
  applyGlobalMark: () => void
  onEdit: (q: any) => void
}

export const QuestionPool = ({
  questions,
  setQuestions,
  searchQuery,
  setSearchQuery,
  globalMark,
  setGlobalMark,
  applyGlobalMark,
  onEdit,
}: QuestionPoolProps) => {
  const [expandedExplanations, setExpandedExplanations] = useState<
    Record<string, boolean>
  >({})
  const [showAllExplanations, setShowAllExplanations] = useState(false)

  const toggleExplanation = (id: string) => {
    setExpandedExplanations((prev) => ({
      ...prev,
      [id]: !prev[id],
    }))
  }

  const toggleAllExplanations = () => {
    const newState = !showAllExplanations
    setShowAllExplanations(newState)
    const allIds: Record<string, boolean> = {}
    if (newState) {
      questions.forEach((q) => {
        if (q.explanation) allIds[q.id] = true
      })
    }
    setExpandedExplanations(allIds)
  }

  const filteredQuestions = useMemo(() => {
    const query = searchQuery.toLowerCase()
    return questions.filter(
      (q) =>
        q.body.toLowerCase().includes(query) ||
        q.subject.toLowerCase().includes(query) ||
        (q.explanation && q.explanation.toLowerCase().includes(query)),
    )
  }, [questions, searchQuery])

  return (
    <div className='lg:col-span-7 flex flex-col min-w-0 animate-in fade-in slide-in-from-right-4 duration-500'>
      {/* STICKY TOOLBAR */}
      <div className='sticky top-0 z-20 bg-[#F8FAFC]/80 backdrop-blur-md pb-4'>
        <div className='bg-white p-4 rounded-3xl border border-slate-200 shadow-sm'>
          <div className='flex flex-col xl:flex-row justify-between items-center gap-4'>
            {/* Search & Toggle Group */}
            <div className='flex items-center gap-2 w-full xl:w-auto min-w-0'>
              <div className='relative flex-1 xl:w-64 min-w-0'>
                <Search
                  className='absolute left-3 top-1/2 -translate-y-1/2 text-slate-400'
                  size={14}
                />
                <input
                  placeholder='Search questions...'
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className='w-full pl-9 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[11px] font-bold outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-400 transition-all'
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className='absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600'
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              <button
                onClick={toggleAllExplanations}
                className={`p-2.5 rounded-xl border transition-all flex items-center gap-2 shrink-0 ${
                  showAllExplanations
                    ? 'bg-amber-50 border-amber-200 text-amber-600'
                    : 'bg-white border-slate-200 text-slate-400 hover:bg-slate-50'
                }`}
              >
                {showAllExplanations ? <EyeOff size={16} /> : <Eye size={16} />}
                <span className='text-[10px] font-black uppercase hidden sm:inline'>
                  Explanations
                </span>
              </button>
            </div>

            {/* Global Marks Action */}
            <div className='flex items-center gap-2 bg-indigo-50/50 p-1.5 rounded-2xl border border-indigo-100 w-full xl:w-auto justify-between'>
              <div className='flex items-center gap-2 px-3 border-r border-indigo-100'>
                <Zap size={14} className='text-amber-500' />
                <span className='text-[10px] font-black text-indigo-900 uppercase whitespace-nowrap'>
                  Marks:
                </span>
                <input
                  type='number'
                  min='0'
                  value={globalMark}
                  onChange={(e) => setGlobalMark(Number(e.target.value))}
                  className='w-10 bg-transparent text-[11px] font-black text-center outline-none'
                />
              </div>
              <button
                onClick={applyGlobalMark}
                className='px-4 py-2 bg-indigo-600 text-white rounded-xl text-[9px] font-black uppercase hover:bg-indigo-700 transition-all active:scale-95 whitespace-nowrap'
              >
                Update All
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* SCROLLABLE LIST AREA */}
      <div className='space-y-4 pb-10'>
        {filteredQuestions.length === 0 ? (
          <div className='bg-white border-2 border-dashed border-slate-200 rounded-[40px] py-20 flex flex-col items-center text-slate-400'>
            <UploadCloud size={40} className='opacity-20 mb-4' />
            <p className='text-[10px] font-black uppercase tracking-widest'>
              {questions.length === 0
                ? 'No questions added yet'
                : 'No search results'}
            </p>
          </div>
        ) : (
          filteredQuestions.map((q, idx) => (
            <div
              key={q.id}
              className='bg-white p-5 md:p-6 rounded-[32px] border border-slate-200 hover:border-indigo-300 transition-all group relative shadow-sm overflow-hidden'
            >
              <div className='flex justify-between items-start mb-4 gap-4'>
                <div className='flex flex-wrap gap-2 min-w-0'>
                  <span className='bg-slate-900 text-white px-2.5 py-1 rounded-lg text-[10px] font-black flex items-center gap-1 shrink-0'>
                    <ListOrdered size={10} /> {idx + 1}
                  </span>
                  <span className='px-3 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-[10px] font-black uppercase truncate max-w-[120px]'>
                    {q.subject}
                  </span>
                  <span className='px-3 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-[10px] font-black uppercase shrink-0'>
                    {q.mark} pts
                  </span>

                  {q.explanation && (
                    <button
                      onClick={() => toggleExplanation(q.id)}
                      className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase flex items-center gap-1.5 transition-all shrink-0 ${
                        expandedExplanations[q.id]
                          ? 'bg-amber-500 text-white'
                          : 'bg-slate-100 text-slate-500 hover:bg-amber-100'
                      }`}
                    >
                      <Lightbulb size={10} />
                      {expandedExplanations[q.id] ? (
                        <ChevronUp size={10} />
                      ) : (
                        <ChevronDown size={10} />
                      )}
                    </button>
                  )}
                </div>

                <div className='flex gap-1 shrink-0 md:opacity-0 group-hover:opacity-100 transition-opacity'>
                  <button
                    onClick={() => onEdit(q)}
                    className='p-2 text-indigo-600 bg-indigo-50 rounded-xl hover:bg-indigo-600 hover:text-white transition-all'
                  >
                    <Edit3 size={15} />
                  </button>
                  <button
                    onClick={() =>
                      setQuestions(questions.filter((i) => i.id !== q.id))
                    }
                    className='p-2 text-red-600 bg-red-50 rounded-xl hover:bg-red-600 hover:text-white transition-all'
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>

              <div className='flex flex-col md:flex-row gap-5'>
                {q.image && (
                  <div className='w-full md:w-32 h-32 rounded-2xl overflow-hidden border border-slate-100 shrink-0 bg-slate-50'>
                    <img
                      src={q.image}
                      alt='Question'
                      className='w-full h-full object-cover'
                    />
                  </div>
                )}

                <div className='flex-1 min-w-0'>
                  <p className='text-[14px] font-bold text-slate-800 leading-relaxed mb-4 break-words'>
                    {q.body}
                  </p>

                  <div className='grid grid-cols-1 sm:grid-cols-2 gap-2'>
                    {Object.entries(q.options).map(
                      ([k, v]: any) =>
                        v &&
                        v.trim() !== '' && (
                          <div
                            key={k}
                            className={`text-[11px] p-3 rounded-2xl border-2 flex items-center gap-3 transition-colors min-w-0 ${
                              q.correctOption === k
                                ? 'border-emerald-200 bg-emerald-50 text-emerald-700 font-bold'
                                : 'border-slate-50 bg-slate-50/50 text-slate-500'
                            }`}
                          >
                            <span
                              className={`w-5 h-5 rounded flex items-center justify-center text-[9px] shrink-0 ${
                                q.correctOption === k
                                  ? 'bg-emerald-500 text-white'
                                  : 'bg-slate-200 text-slate-400'
                              }`}
                            >
                              {k}
                            </span>
                            <span className='truncate min-w-0 flex-1'>{v}</span>
                            {q.correctOption === k && (
                              <CheckCircle2
                                size={12}
                                className='text-emerald-500 shrink-0'
                              />
                            )}
                          </div>
                        ),
                    )}
                  </div>
                </div>
              </div>

              {q.explanation && expandedExplanations[q.id] && (
                <div className='mt-5 pt-4 border-t border-slate-100 animate-in slide-in-from-top-2 duration-300'>
                  <div className='flex gap-3 bg-amber-50/50 p-4 rounded-2xl border border-amber-100/50'>
                    <Lightbulb
                      size={14}
                      className='text-amber-500 shrink-0 mt-0.5'
                    />
                    <div className='min-w-0'>
                      <p className='text-[9px] font-black uppercase tracking-widest text-amber-600/80'>
                        Key Explanation
                      </p>
                      <p className='text-[11px] text-slate-600 font-medium leading-relaxed break-words'>
                        {q.explanation}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}