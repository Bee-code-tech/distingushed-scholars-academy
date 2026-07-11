// 'use client'
// import React, { useRef } from 'react'
// import {
//   Plus,
//   ImageIcon,
//   Zap,
//   X,
//   FileSpreadsheet,
//   Lightbulb,
// } from 'lucide-react'
// import { ImagePreview } from './Shared/ImagePreview'
// import { NumberInput } from './Shared/NumberInput'

// export const QuestionEditor = ({
//   form,
//   setForm,
//   onSave,
//   editingId,
//   setEditingId,
//   JAMB_SUBJECTS,
//   onBulkUpload,
// }: any) => {
//   const fileRef = useRef<HTMLInputElement>(null)
//   const bulkRef = useRef<HTMLInputElement>(null)

//   const addOption = () => {
//     const keys = Object.keys(form.options).sort()
//     const nextKey = String.fromCharCode(65 + keys.length)
//     if (keys.length < 6) {
//       setForm({ ...form, options: { ...form.options, [nextKey]: '' } })
//     }
//   }

//   const removeOption = (key: string) => {
//     const newOptions = { ...form.options }
//     delete newOptions[key]
//     setForm({ ...form, options: newOptions })
//   }

//   return (
//     <div className='bg-white p-6 rounded-3xl shadow-sm border border-slate-200 sticky top-24'>
//       <div className='flex justify-between items-center mb-6'>
//         <h3 className='font-black text-slate-800 text-[11px] flex items-center gap-2 uppercase tracking-widest'>
//           {editingId ? (
//             <Zap size={16} className='text-amber-500' />
//           ) : (
//             <Plus size={16} className='text-indigo-600' />
//           )}
//           {editingId ? 'Modify Question' : 'New Question'}
//         </h3>
//         <button
//           onClick={() => bulkRef.current?.click()}
//           className='text-[10px] font-black uppercase text-emerald-600 bg-emerald-50 px-4 py-2 rounded-xl flex items-center gap-2'
//         >
//           <FileSpreadsheet size={14} /> Import
//         </button>
//         <input
//           type='file'
//           ref={bulkRef}
//           hidden
//           onChange={onBulkUpload}
//           accept='.xlsx, .xls'
//         />
//       </div>

//       <div className='space-y-4'>
//         <div className='grid grid-cols-2 gap-3'>
//           <select
//             value={form.subject}
//             onChange={(e) => setForm({ ...form, subject: e.target.value })}
//             className='p-3 bg-slate-50 border border-slate-200 rounded-xl text-[12px] font-bold outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all'
//           >
//             {JAMB_SUBJECTS.map((s: string) => (
//               <option key={s} value={s}>
//                 {s}
//               </option>
//             ))}
//           </select>
//           <input
//             placeholder='Topic (Optional)'
//             value={form.topic}
//             onChange={(e) => setForm({ ...form, topic: e.target.value })}
//             className='p-3 bg-slate-50 border border-slate-200 rounded-xl text-[12px] font-bold outline-none'
//           />
//         </div>

//         <div className='grid grid-cols-2 gap-3'>
//           <NumberInput
//             label='Marks'
//             value={form.mark}
//             onChange={(e) => setForm({ ...form, mark: Number(e.target.value) })}
//           />
//           <div className='flex items-end'>
//             <button
//               onClick={() => fileRef.current?.click()}
//               className={`w-full py-3 border-2 border-dashed rounded-xl text-[10px] font-black uppercase transition-all flex items-center justify-center gap-2 ${form.image ? 'border-indigo-500 text-indigo-600 bg-indigo-50' : 'border-slate-200 text-slate-400'}`}
//             >
//               <ImageIcon size={14} />{' '}
//               {form.image ? 'Change Image' : 'Add Image'}
//             </button>
//             <input
//               type='file'
//               ref={fileRef}
//               hidden
//               onChange={(e) => {
//                 const file = e.target.files?.[0]
//                 if (file) {
//                   const reader = new FileReader()
//                   reader.onloadend = () =>
//                     setForm({ ...form, image: reader.result as string })
//                   reader.readAsDataURL(file)
//                 }
//               }}
//               accept='image/*'
//             />
//           </div>
//         </div>

//         <ImagePreview
//           src={form.image}
//           onClear={() => setForm({ ...form, image: null })}
//         />

//         <textarea
//           placeholder='Write the question body here...'
//           value={form.body}
//           onChange={(e) => setForm({ ...form, body: e.target.value })}
//           className='w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-[13px] font-medium min-h-[100px] outline-none focus:border-indigo-500 transition-colors'
//         />

//         <div className='space-y-2'>
//           {Object.keys(form.options)
//             .sort()
//             .map((key) => (
//               <div
//                 key={key}
//                 className={`flex items-center gap-3 p-2 rounded-xl border-2 transition-all ${form.correctOption === key ? 'border-emerald-500 bg-emerald-50' : 'border-slate-50 bg-white'}`}
//               >
//                 <button
//                   onClick={() => setForm({ ...form, correctOption: key })}
//                   className={`w-8 h-8 rounded-lg flex items-center justify-center text-[11px] font-black shadow-sm ${form.correctOption === key ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-400'}`}
//                 >
//                   {key}
//                 </button>
//                 <input
//                   value={form.options[key]}
//                   onChange={(e) =>
//                     setForm({
//                       ...form,
//                       options: { ...form.options, [key]: e.target.value },
//                     })
//                   }
//                   placeholder={`Option ${key}`}
//                   className='flex-1 bg-transparent text-[12px] font-bold outline-none'
//                 />
//                 {Object.keys(form.options).length > 2 && (
//                   <button
//                     onClick={() => removeOption(key)}
//                     className='p-1 text-slate-300 hover:text-red-500 transition-colors'
//                   >
//                     <X size={14} />
//                   </button>
//                 )}
//               </div>
//             ))}
//           <button
//             onClick={addOption}
//             className='w-full py-2 border-2 border-dashed border-slate-100 rounded-xl text-slate-400 text-[10px] font-black uppercase hover:bg-slate-50 transition-colors'
//           >
//             + Add Consecutive Option
//           </button>
//         </div>

//         {/* --- EXPLANATION SECTION --- */}
//         <div className='space-y-2 pt-2'>
//           <div className='flex items-center gap-2 px-1'>
//             <Lightbulb size={14} className='text-amber-500' />
//             <span className='text-[10px] font-black text-slate-400 uppercase tracking-widest'>
//               Explanation (Optional)
//             </span>
//           </div>
//           <textarea
//             placeholder='Explain why the answer is correct...'
//             value={form.explanation}
//             onChange={(e) => setForm({ ...form, explanation: e.target.value })}
//             className='w-full p-4 bg-amber-50/50 border border-amber-100 rounded-2xl text-[12px] font-medium min-h-[80px] outline-none focus:border-amber-300 focus:bg-amber-50 transition-all placeholder:text-amber-300/60'
//           />
//         </div>

//         <div className='flex gap-2 pt-2'>
//           <button
//             onClick={onSave}
//             className='flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase text-[11px] tracking-widest shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all'
//           >
//             {editingId ? 'Save Changes' : 'Add to Pool'}
//           </button>
//           {editingId && (
//             <button
//               onClick={() => setEditingId(null)}
//               className='p-4 bg-slate-100 text-slate-500 rounded-2xl hover:bg-slate-200 transition-all'
//             >
//               <X size={20} />
//             </button>
//           )}
//         </div>
//       </div>
//     </div>
//   )
// }

'use client'
import React, { useRef } from 'react'
import {
  Plus,
  ImageIcon,
  Zap,
  X,
  FileSpreadsheet,
  Lightbulb,
  CheckCircle2,
} from 'lucide-react'
import { ImagePreview } from './Shared/ImagePreview'
import { NumberInput } from './Shared/NumberInput'

/**
 * NOTE: Ensure 'xlsx' is installed: npm install xlsx
 * If handleBulkUpload is defined inside this file, it needs access to 'setQuestions'.
 * Below, I have focused on the QuestionEditor component as requested.
 */

export const QuestionEditor = ({
  form,
  setForm,
  onSave,
  editingId,
  setEditingId,
  JAMB_SUBJECTS,
  onBulkUpload,
}: any) => {
  const fileRef = useRef<HTMLInputElement>(null)
  const bulkRef = useRef<HTMLInputElement>(null)

  const addOption = () => {
    const keys = Object.keys(form.options).sort()
    const nextKey = String.fromCharCode(65 + keys.length)
    if (keys.length < 6) {
      setForm({
        ...form,
        options: { ...form.options, [nextKey]: '' },
      })
    }
  }

  const removeOption = (key: string) => {
    // Professional Standard: Maintain at least A and B
    if (Object.keys(form.options).length <= 2) return

    const newOptions = { ...form.options }
    delete newOptions[key]

    // Fallback if the deleted option was the correct one
    const newCorrect = form.correctOption === key ? 'A' : form.correctOption

    setForm({
      ...form,
      options: newOptions,
      correctOption: newCorrect,
    })
  }

  return (
    <div className='lg:col-span-5 min-w-0'>
      <div className='bg-white p-6 rounded-[32px] shadow-sm border border-slate-200 sticky top-24 max-h-[calc(100vh-120px)] overflow-y-auto scrollbar-hide flex flex-col'>
        {/* HEADER */}
        <div className='flex justify-between items-center mb-6 shrink-0'>
          <div className='flex items-center gap-3'>
            <div
              className={`p-2.5 rounded-2xl ${
                editingId
                  ? 'bg-amber-100 text-amber-600'
                  : 'bg-indigo-600 text-white'
              }`}
            >
              {editingId ? (
                <Zap size={18} fill='currentColor' />
              ) : (
                <Plus size={18} strokeWidth={3} />
              )}
            </div>
            <div>
              <h3 className='font-black text-slate-800 text-[13px] uppercase tracking-tight leading-none'>
                {editingId ? 'Modify Question' : 'New Question'}
              </h3>
              <p className='text-[9px] font-bold text-slate-400 uppercase mt-1 tracking-widest'>
                Management Portal
              </p>
            </div>
          </div>

          <button
            onClick={() => bulkRef.current?.click()}
            className='text-[9px] font-black uppercase text-emerald-700 bg-emerald-50 border border-emerald-200/50 px-4 py-2.5 rounded-xl flex items-center gap-2 hover:bg-emerald-600 hover:text-white transition-all active:scale-95'
          >
            <FileSpreadsheet size={14} /> Import
          </button>
          <input
            type='file'
            ref={bulkRef}
            hidden
            onChange={onBulkUpload}
            accept='.xlsx, .xls'
          />
        </div>

        <div className='space-y-5 flex-1'>
          {/* META INFO GRID */}
          <div className='grid grid-cols-2 gap-4'>
            <div className='space-y-1.5'>
              <label className='text-[10px] font-black text-slate-500 uppercase ml-1'>
                Subject Category
              </label>
              <select
                value={form.subject}
                onChange={(e) => setForm({ ...form, subject: e.target.value })}
                className='w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-[12px] font-bold outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-400 transition-all cursor-pointer appearance-none'
              >
                {JAMB_SUBJECTS.map((s: string) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <div className='space-y-1.5'>
              <label className='text-[10px] font-black text-slate-500 uppercase ml-1'>
                Topic Area
              </label>
              <input
                placeholder='e.g. Thermodynamics'
                value={form.topic}
                onChange={(e) => setForm({ ...form, topic: e.target.value })}
                className='w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-[12px] font-bold outline-none focus:border-indigo-400 transition-all'
              />
            </div>
          </div>

          {/* MARKS & IMAGE GRID */}
          <div className='grid grid-cols-2 gap-4'>
            <NumberInput
              label='Points Assigned'
              value={form.mark}
              onChange={(e: any) =>
                setForm({ ...form, mark: Number(e.target.value) })
              }
            />
            <div className='flex flex-col justify-end'>
              <label className='text-[10px] font-black text-slate-500 uppercase ml-1 mb-1.5'>
                Reference Media
              </label>
              <button
                onClick={() => fileRef.current?.click()}
                className={`w-full py-3 border-2 border-dashed rounded-2xl text-[10px] font-black uppercase transition-all flex items-center justify-center gap-2 ${
                  form.image
                    ? 'border-indigo-500 text-indigo-600 bg-indigo-50'
                    : 'border-slate-200 text-slate-400 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <ImageIcon size={14} />{' '}
                {form.image ? 'Replace Image' : 'Attach Image'}
              </button>
              <input
                type='file'
                ref={fileRef}
                hidden
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) {
                    const reader = new FileReader()
                    reader.onloadend = () =>
                      setForm({ ...form, image: reader.result as string })
                    reader.readAsDataURL(file)
                  }
                }}
                accept='image/*'
              />
            </div>
          </div>

          <ImagePreview
            src={form.image}
            onClear={() => setForm({ ...form, image: null })}
          />

          {/* QUESTION BODY */}
          <div className='space-y-1.5'>
            <label className='text-[10px] font-black text-slate-500 uppercase ml-1'>
              Question Content
            </label>
            <textarea
              placeholder='Enter the full question text here...'
              value={form.body}
              onChange={(e) => setForm({ ...form, body: e.target.value })}
              className='w-full p-4 bg-slate-50 border border-slate-200 rounded-3xl text-[13px] font-medium min-h-[120px] outline-none focus:border-indigo-400 transition-all resize-none leading-relaxed'
            />
          </div>

          {/* OPTIONS SECTION */}
          <div className='space-y-3'>
            <label className='text-[10px] font-black text-slate-500 uppercase ml-1 flex justify-between'>
              Answer Choices <span>(Min. 2)</span>
            </label>
            <div className='space-y-2.5'>
              {Object.keys(form.options)
                .sort()
                .map((key) => (
                  <div
                    key={key}
                    className={`group flex items-center gap-3 p-2 rounded-2xl border-2 transition-all duration-300 ${
                      form.correctOption === key
                        ? 'border-emerald-500 bg-emerald-50/40'
                        : 'border-slate-100 bg-white hover:border-slate-200'
                    }`}
                  >
                    <button
                      type='button'
                      onClick={() => setForm({ ...form, correctOption: key })}
                      className={`w-10 h-10 rounded-xl flex items-center justify-center text-[12px] font-black transition-all shrink-0 ${
                        form.correctOption === key
                          ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-200'
                          : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                      }`}
                    >
                      {form.correctOption === key ? (
                        <CheckCircle2 size={18} strokeWidth={3} />
                      ) : (
                        key
                      )}
                    </button>

                    <input
                      value={form.options[key]}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          options: { ...form.options, [key]: e.target.value },
                        })
                      }
                      placeholder={`Enter Option ${key}...`}
                      className='flex-1 bg-transparent text-[12px] font-bold outline-none placeholder:text-slate-300 min-w-0'
                    />

                    {Object.keys(form.options).length > 2 && (
                      <button
                        type='button'
                        onClick={() => removeOption(key)}
                        className='p-2 text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100'
                      >
                        <X size={16} />
                      </button>
                    )}
                  </div>
                ))}
            </div>

            <button
              type='button'
              onClick={addOption}
              disabled={Object.keys(form.options).length >= 6}
              className='w-full py-3.5 border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 text-[10px] font-black uppercase hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-300 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed'
            >
              <Plus size={14} strokeWidth={3} /> Add Choice{' '}
              {String.fromCharCode(65 + Object.keys(form.options).length)}
            </button>
          </div>

          {/* EXPLANATION */}
          <div className='space-y-2 pt-2'>
            <div className='flex items-center gap-2 px-1'>
              <Lightbulb size={14} className='text-amber-500' />
              <span className='text-[10px] font-black text-slate-500 uppercase tracking-widest'>
                Detailed Solution
              </span>
            </div>
            <textarea
              placeholder='Explain why the correct answer is valid...'
              value={form.explanation}
              onChange={(e) =>
                setForm({ ...form, explanation: e.target.value })
              }
              className='w-full p-4 bg-amber-50/20 border border-amber-100 rounded-3xl text-[12px] font-medium min-h-[90px] outline-none focus:border-amber-300 focus:bg-amber-50/40 transition-all resize-none'
            />
          </div>
        </div>

        {/* STICKY ACTIONS */}
        <div className='flex gap-3 pt-6 mt-4 border-t border-slate-100 shrink-0'>
          <button
            onClick={onSave}
            className='flex-1 py-4 bg-slate-900 text-white rounded-2xl font-black uppercase text-[11px] tracking-widest hover:bg-indigo-600 transition-all active:scale-[0.98] shadow-xl shadow-slate-200'
          >
            {editingId ? 'Save Changes' : 'Publish to Pool'}
          </button>
          {editingId && (
            <button
              onClick={() => setEditingId(null)}
              className='px-5 bg-slate-100 text-slate-500 rounded-2xl hover:bg-red-50 hover:text-red-500 transition-all'
            >
              <X size={20} />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}