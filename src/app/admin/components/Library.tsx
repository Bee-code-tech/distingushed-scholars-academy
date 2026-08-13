// 'use client'

// import React, { useState, useEffect, useMemo, useRef } from 'react'
// import { motion, AnimatePresence } from 'framer-motion'
// import {
//   FileText,
//   Search,
//   Trash2,
//   Download,
//   Plus,
//   FolderOpen,
//   HardDrive,
//   CheckCircle2,
//   ShieldCheck,
//   Square,
//   Activity,
//   UploadCloud,
//   Loader2,
//   ExternalLink,
//   AlertCircle,
//   Inbox,
// } from 'lucide-react'
// import { Button } from '@/components/ui/button'
// import { Input } from '@/components/ui/input'
// import { Badge } from '@/components/ui/badge'

// // Integrated API Service Methods
// import {
//   fetchLibraryMaterials,
//   deleteLibraryMaterial,
//   signUploadUrl,
//   createLibraryMaterial,
// } from '@/lib/admin-api'

// export interface Material {
//   id: string
//   title: string
//   category: string
//   size: string | number
//   uploadDate?: string
//   createdAt?: string
//   type?: string
//   fileUrl?: string
//   key?: string
// }

// const CATEGORIES = [
//   'Textbook',
//   'Handout',
//   'Syllabus',
//   'Reference',
//   'Exam Paper',
// ]

// /**
//  * Helper to safely extract payload whether the API returns raw item or { success: true, data: item }
//  */
// function unwrapApiResponse<T>(res: any): T {
//   if (res && typeof res === 'object' && 'data' in res) {
//     return res.data as T
//   }
//   return res as T
// }

// export default function Library() {
//   const [materials, setMaterials] = useState<Material[]>([])
//   const [isLoading, setIsLoading] = useState(true)
//   const [fetchError, setFetchError] = useState<string | null>(null)

//   const [searchTerm, setSearchTerm] = useState('')
//   const [selectedCategory, setSelectedCategory] = useState('All')

//   // Upload modal & signing states
//   const [isUploading, setIsUploading] = useState(false)
//   const [isSigning, setIsSigning] = useState(false)
//   const [errorMsg, setErrorMsg] = useState<string | null>(null)
//   const [pendingFile, setPendingFile] = useState<File | null>(null)
//   const [ingestCategory, setIngestCategory] = useState(CATEGORIES[0])

//   const fileInputRef = useRef<HTMLInputElement>(null)

//   // ---------------------------------------------------------------------------
//   // 1. Initial Load: Fetch Live Materials from API
//   // ---------------------------------------------------------------------------
//   const loadMaterials = async () => {
//     setIsLoading(true)
//     setFetchError(null)
//     try {
//       const data = await fetchLibraryMaterials()
//       const items = unwrapApiResponse<Material[]>(data)
//       setMaterials(Array.isArray(items) ? items : [])
//     } catch (err: any) {
//       console.error('Failed to load library materials:', err)
//       setFetchError(err?.message || 'Failed to fetch library resources.')
//     } finally {
//       setIsLoading(false)
//     }
//   }

//   useEffect(() => {
//     loadMaterials()
//   }, [])

//   // ---------------------------------------------------------------------------
//   // 2. File Selection Handler
//   // ---------------------------------------------------------------------------
//   const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     if (e.target.files?.[0]) {
//       setPendingFile(e.target.files[0])
//       setErrorMsg(null)
//       setIsUploading(true)
//     }
//   }

//   // ---------------------------------------------------------------------------
//   // 3. Finalize Ingest: Sign URL -> Upload Raw Bytes -> Create DB Entry
//   // ---------------------------------------------------------------------------
//   const finalizeIngest = async () => {
//     if (!pendingFile) return

//     setIsSigning(true)
//     setErrorMsg(null)

//     try {
//       // Step A: Get Signed Target from backend API
//       const signResult = await signUploadUrl({
//         filename: pendingFile.name,
//         contentType: pendingFile.type || 'application/pdf',
//         folder: 'materials',
//       })

//       // Safely unwrap data from response
//       const signData = unwrapApiResponse<{
//         uploadUrl: string | null
//         fileUrl: string
//         key: string
//         message?: string
//       }>(signResult)

//       const { uploadUrl, fileUrl, key } = signData

//       // Step B: Transfer raw file bytes if active presigned uploadUrl exists
//       if (uploadUrl) {
//         const uploadRes = await fetch(uploadUrl, {
//           method: 'PUT',
//           headers: {
//             'Content-Type': pendingFile.type || 'application/pdf',
//           },
//           body: pendingFile,
//         })

//         if (!uploadRes.ok) {
//           throw new Error('Failed to push binary data to storage destination.')
//         }
//       }

//       // Step C: Persist node metadata via admin-api using returned fileUrl
//       const sizeFormatted = `${(pendingFile.size / (1024 * 1024)).toFixed(1)} MB`
//       const payload = {
//         title: pendingFile.name.replace(/\.[^/.]+$/, ''),
//         category: ingestCategory,
//         size: sizeFormatted,
//         type: pendingFile.name.split('.').pop()?.toUpperCase() || 'PDF',
//         fileUrl: fileUrl,
//         key: key,
//       }

//       const createdNodeResponse = await createLibraryMaterial(payload)
//       const freshMaterial = unwrapApiResponse<Material>(createdNodeResponse)

//       // Prepend newly created real node to UI list
//       setMaterials((prev) => [freshMaterial || (payload as Material), ...prev])
//       setIsUploading(false)
//       setPendingFile(null)
//       if (fileInputRef.current) fileInputRef.current.value = ''
//     } catch (err: any) {
//       console.error('Ingest API Error:', err)
//       setErrorMsg(err?.message || 'Failed to complete resource ingestion.')
//     } finally {
//       setIsSigning(false)
//     }
//   }

//   // ---------------------------------------------------------------------------
//   // 4. Delete Material Endpoint
//   // ---------------------------------------------------------------------------
//   const handleDelete = async (id: string) => {
//     try {
//       await deleteLibraryMaterial(id)
//       setMaterials((prev) => prev.filter((m) => m.id !== id))
//     } catch (err: any) {
//       console.error('Failed to delete item:', err)
//       alert(err?.message || 'Could not delete resource from library.')
//     }
//   }

//   // ---------------------------------------------------------------------------
//   // Metrics & Filtering Computations
//   // ---------------------------------------------------------------------------
//   const stats = useMemo(() => {
//     const totalMB = materials.reduce((acc, curr) => {
//       const parsedSize =
//         typeof curr.size === 'number' ? curr.size : parseFloat(curr.size || '0')
//       return acc + (isNaN(parsedSize) ? 0 : parsedSize)
//     }, 0)

//     const limitGB = 2
//     const currentGB = totalMB / 1024
//     return {
//       size:
//         totalMB >= 1000
//           ? `${currentGB.toFixed(2)} GB`
//           : `${totalMB.toFixed(2)} MB`,
//       count: materials.length,
//       percent: Math.min((currentGB / limitGB) * 100, 100).toFixed(1),
//     }
//   }, [materials])

//   const filteredMaterials = useMemo(() => {
//     return materials.filter((file) => {
//       const title = file.title || ''
//       const id = file.id || ''
//       const matchesSearch =
//         title.toLowerCase().includes(searchTerm.toLowerCase()) ||
//         id.toLowerCase().includes(searchTerm.toLowerCase())
//       const matchesCategory =
//         selectedCategory === 'All' || file.category === selectedCategory
//       return matchesSearch && matchesCategory
//     })
//   }, [searchTerm, selectedCategory, materials])

//   return (
//     <div className='flex h-screen w-full overflow-hidden bg-[#F8FAFC] font-sans text-slate-900 antialiased selection:bg-[#FCB900]/30'>
//       {/* SIDEBAR */}
//       <aside className='w-[230px] bg-white border-r border-slate-200 flex flex-col shrink-0'>
//         <div className='p-4'>
//           <div className='flex items-center gap-2 mb-4'>
//             <div className='w-5 h-5 bg-[#002EFF] rounded flex items-center justify-center text-white font-bold text-[10px] shadow-sm'>
//               L
//             </div>
//             <h1 className='text-sm font-black tracking-tight uppercase'>
//               Library<span className='text-[#002EFF]'>Pro</span>
//             </h1>
//           </div>

//           {/* VAULT CAPACITY */}
//           <div className='bg-slate-950 rounded-xl p-3 text-white relative overflow-hidden border border-white/5 shadow-xl mb-6'>
//             <div className='relative z-10'>
//               <div className='flex items-center justify-between mb-2'>
//                 <div className='flex items-center gap-1.5'>
//                   <HardDrive size={10} className='text-[#FCB900]' />
//                   <span className='text-[7px] font-black uppercase tracking-[0.1em] text-slate-400'>
//                     Vault Capacity
//                   </span>
//                 </div>
//                 <div className='w-1 h-1 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]' />
//               </div>

//               <div className='flex justify-between items-baseline mb-1'>
//                 <span className='text-[11px] font-black tracking-tighter italic'>
//                   {stats.size}
//                 </span>
//                 <span className='text-[8px] text-[#FCB900] font-black'>
//                   {stats.percent}%
//                 </span>
//               </div>

//               <div className='h-1 w-full bg-white/10 rounded-full overflow-hidden'>
//                 <motion.div
//                   initial={{ width: 0 }}
//                   animate={{ width: `${stats.percent}%` }}
//                   className='h-full bg-gradient-to-r from-[#002EFF] to-[#FCB900]'
//                 />
//               </div>
//             </div>
//           </div>

//           <nav className='space-y-0.5'>
//             <p className='px-2 py-2 text-[8px] font-black text-slate-400 uppercase tracking-[0.2em]'>
//               Data Segments
//             </p>
//             {['All', ...CATEGORIES].map((cat) => (
//               <button
//                 key={cat}
//                 onClick={() => setSelectedCategory(cat)}
//                 className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all group ${
//                   selectedCategory === cat
//                     ? 'bg-slate-900 text-white shadow-lg shadow-slate-200'
//                     : 'text-slate-500 hover:bg-slate-50'
//                 }`}
//               >
//                 <div className='flex items-center gap-2'>
//                   <FolderOpen
//                     size={12}
//                     className={
//                       selectedCategory === cat
//                         ? 'text-[#FCB900]'
//                         : 'text-slate-300 group-hover:text-slate-500'
//                     }
//                   />
//                   {cat}
//                 </div>
//               </button>
//             ))}
//           </nav>
//         </div>
//       </aside>

//       {/* MAIN VIEWPORT */}
//       <main className='flex-1 flex flex-col min-w-0'>
//         <header className='h-12 bg-white border-b border-slate-200 px-6 flex items-center justify-between shrink-0'>
//           <div className='relative w-full max-w-xs'>
//             <Search
//               className='absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-300'
//               size={12}
//             />
//             <Input
//               value={searchTerm}
//               onChange={(e) => setSearchTerm(e.target.value)}
//               placeholder='Filter master manifest...'
//               className='pl-8 bg-slate-50 border-none rounded-md h-7 text-[10px] focus-visible:ring-1 focus-visible:ring-[#002EFF]/20'
//             />
//           </div>

//           <div className='flex items-center gap-2'>
//             <Button
//               variant='ghost'
//               onClick={loadMaterials}
//               className='h-7 rounded-md text-slate-400 text-[9px] font-black px-2 hover:bg-slate-100 uppercase'
//             >
//               <Download size={12} className='mr-1.5' /> Sync
//             </Button>
//             <Button
//               onClick={() => fileInputRef.current?.click()}
//               className='h-7 rounded-md bg-[#002EFF] hover:bg-blue-700 text-white text-[9px] font-black px-3 shadow-md uppercase tracking-wider'
//             >
//               <Plus size={12} className='mr-1' /> Ingest PDF
//             </Button>
//           </div>
//         </header>

//         <div className='flex-1 overflow-y-auto p-6 bg-[#F8FAFC]'>
//           <div className='max-w-4xl mx-auto space-y-4'>
//             <div className='grid grid-cols-3 gap-3'>
//               <CompactStat
//                 label='Index Count'
//                 value={stats.count}
//                 icon={ShieldCheck}
//               />
//               <CompactStat label='Latency' value='2ms' icon={Activity} />
//               <CompactStat
//                 label='Integrity'
//                 value='Verified'
//                 icon={CheckCircle2}
//                 color='text-emerald-600'
//               />
//             </div>

//             <div className='bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden'>
//               <div className='px-4 py-2 bg-slate-50/50 border-b border-slate-100 flex items-center justify-between'>
//                 <span className='text-[8px] font-black text-slate-400 uppercase tracking-widest'>
//                   Master Manifest
//                 </span>
//                 <Badge className='bg-[#FCB900] text-black text-[8px] hover:bg-[#FCB900] border-none font-black'>
//                   {filteredMaterials.length} NODES
//                 </Badge>
//               </div>

//               {/* LOADING STATE */}
//               {isLoading ? (
//                 <div className='p-12 flex flex-col items-center justify-center text-slate-400 gap-2'>
//                   <Loader2 size={24} className='animate-spin text-[#002EFF]' />
//                   <span className='text-[10px] font-bold tracking-wider uppercase'>
//                     Fetching live index from server...
//                   </span>
//                 </div>
//               ) : fetchError ? (
//                 /* ERROR STATE */
//                 <div className='p-8 text-center space-y-3'>
//                   <p className='text-xs font-bold text-rose-500'>
//                     {fetchError}
//                   </p>
//                   <Button
//                     onClick={loadMaterials}
//                     className='h-7 bg-slate-900 text-white text-[9px] font-bold uppercase'
//                   >
//                     Retry Connection
//                   </Button>
//                 </div>
//               ) : filteredMaterials.length === 0 ? (
//                 /* EMPTY STATE */
//                 <div className='p-12 flex flex-col items-center justify-center text-slate-300 gap-2'>
//                   <Inbox size={32} strokeWidth={1.5} />
//                   <p className='text-[10px] font-bold uppercase tracking-wider text-slate-400'>
//                     No material assets found
//                   </p>
//                 </div>
//               ) : (
//                 /* DATA TABLE */
//                 <div className='overflow-x-auto'>
//                   <table className='w-full text-left border-collapse'>
//                     <thead>
//                       <tr className='bg-white border-b border-slate-50'>
//                         <th className='p-3 w-10'>
//                           <button className='flex justify-center w-full'>
//                             <Square size={13} className='text-slate-200' />
//                           </button>
//                         </th>
//                         <th className='text-[8px] font-black text-slate-400 uppercase tracking-widest p-3'>
//                           Resource Asset
//                         </th>
//                         <th className='text-[8px] font-black text-slate-400 uppercase tracking-widest p-3'>
//                           Classification
//                         </th>
//                         <th className='text-[8px] font-black text-slate-400 uppercase tracking-widest p-3'>
//                           Size
//                         </th>
//                         <th className='text-[8px] font-black text-slate-400 uppercase tracking-widest p-3 text-right pr-6'>
//                           Ops
//                         </th>
//                       </tr>
//                     </thead>
//                     <tbody className='divide-y divide-slate-50'>
//                       <AnimatePresence initial={false}>
//                         {filteredMaterials.map((file) => (
//                           <motion.tr
//                             key={file.id}
//                             initial={{ opacity: 0, x: -10 }}
//                             animate={{ opacity: 1, x: 0 }}
//                             exit={{ opacity: 0, x: 10 }}
//                             className='group hover:bg-slate-50/50 transition-colors'
//                           >
//                             <td className='p-3 text-center'>
//                               <Square
//                                 size={13}
//                                 className='text-slate-100 group-hover:text-slate-200 mx-auto'
//                               />
//                             </td>
//                             <td className='p-3'>
//                               <div className='flex items-center gap-2.5'>
//                                 <div className='w-6 h-6 bg-slate-50 rounded flex items-center justify-center text-slate-400 group-hover:text-[#002EFF] border border-slate-100'>
//                                   <FileText size={11} />
//                                 </div>
//                                 <div>
//                                   <p className='text-[10px] font-bold text-slate-800 leading-tight'>
//                                     {file.title}
//                                   </p>
//                                   <p className='text-[7px] font-black text-slate-300 uppercase'>
//                                     UID: {file.id}
//                                   </p>
//                                 </div>
//                               </div>
//                             </td>
//                             <td className='p-3'>
//                               <span className='text-[8px] font-black text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded-sm uppercase'>
//                                 {file.category}
//                               </span>
//                             </td>
//                             <td className='p-3 font-mono text-[9px] font-bold text-slate-400'>
//                               {file.size}
//                             </td>
//                             <td className='p-3 text-right pr-6'>
//                               <div className='flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity'>
//                                 {file.fileUrl && (
//                                   <a
//                                     href={file.fileUrl}
//                                     target='_blank'
//                                     rel='noreferrer'
//                                     className='p-1 text-slate-300 hover:text-blue-600 rounded'
//                                   >
//                                     <ExternalLink size={11} />
//                                   </a>
//                                 )}
//                                 <Button
//                                   variant='ghost'
//                                   size='icon'
//                                   onClick={() => handleDelete(file.id)}
//                                   className='h-6 w-6 text-slate-300 hover:text-rose-500'
//                                 >
//                                   <Trash2 size={11} />
//                                 </Button>
//                               </div>
//                             </td>
//                           </motion.tr>
//                         ))}
//                       </AnimatePresence>
//                     </tbody>
//                   </table>
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>
//       </main>

//       {/* INGESTION / SIGNING MODAL */}
//       <AnimatePresence>
//         {isUploading && (
//           <div className='fixed inset-0 bg-slate-900/40 backdrop-blur-[2px] z-50 flex items-center justify-center p-4'>
//             <motion.div
//               initial={{ scale: 0.95, opacity: 0 }}
//               animate={{ scale: 1, opacity: 1 }}
//               exit={{ scale: 0.95, opacity: 0 }}
//               className='bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden border border-slate-200'
//             >
//               <div className='p-1 bg-[#FCB900]' />
//               <div className='p-6'>
//                 <div className='flex items-center gap-3 mb-4'>
//                   <div className='w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-[#002EFF]'>
//                     <UploadCloud size={20} />
//                   </div>
//                   <div>
//                     <h3 className='text-sm font-black uppercase tracking-tight'>
//                       Classify & Sign Asset
//                     </h3>
//                     <p className='text-[10px] text-slate-400 font-bold truncate max-w-[200px]'>
//                       {pendingFile?.name}
//                     </p>
//                   </div>
//                 </div>

//                 {errorMsg && (
//                   <div className='mb-4 p-2.5 bg-rose-50 border border-rose-100 rounded-lg flex items-center gap-2 text-rose-600 text-[10px] font-bold'>
//                     <AlertCircle size={14} className='shrink-0' />
//                     <span>{errorMsg}</span>
//                   </div>
//                 )}

//                 <div className='space-y-4'>
//                   <div className='space-y-1.5'>
//                     <label className='text-[8px] font-black text-slate-400 uppercase tracking-widest'>
//                       Select Category
//                     </label>
//                     <div className='grid grid-cols-2 gap-2'>
//                       {CATEGORIES.map((cat) => (
//                         <button
//                           key={cat}
//                           disabled={isSigning}
//                           onClick={() => setIngestCategory(cat)}
//                           className={`px-3 py-2 rounded-lg text-[9px] font-black text-left transition-all border ${
//                             ingestCategory === cat
//                               ? 'bg-slate-900 text-white border-slate-900 shadow-md'
//                               : 'bg-slate-50 text-slate-500 border-slate-100 hover:border-slate-300'
//                           }`}
//                         >
//                           {cat}
//                         </button>
//                       ))}
//                     </div>
//                   </div>

//                   <div className='flex gap-2 pt-2'>
//                     <Button
//                       variant='ghost'
//                       disabled={isSigning}
//                       onClick={() => {
//                         setIsUploading(false)
//                         setErrorMsg(null)
//                       }}
//                       className='flex-1 h-9 text-[10px] font-black uppercase tracking-widest'
//                     >
//                       Abort
//                     </Button>
//                     <Button
//                       onClick={finalizeIngest}
//                       disabled={isSigning}
//                       className='flex-1 h-9 bg-[#002EFF] hover:bg-blue-700 text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-100 flex items-center justify-center gap-1.5'
//                     >
//                       {isSigning ? (
//                         <>
//                           <Loader2 size={12} className='animate-spin' />
//                           Signing...
//                         </>
//                       ) : (
//                         'Confirm Ingest'
//                       )}
//                     </Button>
//                   </div>
//                 </div>
//               </div>
//             </motion.div>
//           </div>
//         )}
//       </AnimatePresence>

//       <input
//         type='file'
//         ref={fileInputRef}
//         onChange={handleFileChange}
//         accept='.pdf'
//         className='hidden'
//       />
//     </div>
//   )
// }

// function CompactStat({
//   label,
//   value,
//   icon: Icon,
//   color = 'text-slate-900',
// }: {
//   label: string
//   value: string | number
//   icon: React.ElementType
//   color?: string
// }) {
//   return (
//     <div className='bg-white p-3 rounded-xl border border-slate-200 flex items-center gap-3 shadow-sm'>
//       <div className='w-7 h-7 bg-slate-50 rounded-lg flex items-center justify-center text-[#002EFF]'>
//         <Icon size={14} />
//       </div>
//       <div>
//         <p className='text-[7px] font-black text-slate-400 uppercase tracking-widest mb-0.5'>
//           {label}
//         </p>
//         <p
//           className={`text-xs font-black ${color} tracking-tight leading-none`}
//         >
//           {value}
//         </p>
//       </div>
//     </div>
//   )
// }

'use client'

import React, { useState, useEffect, useMemo, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FileText,
  Search,
  Trash2,
  Download,
  Plus,
  FolderOpen,
  HardDrive,
  CheckCircle2,
  ShieldCheck,
  Square,
  Activity,
  UploadCloud,
  Loader2,
  ExternalLink,
  AlertCircle,
  Inbox,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'

// Integrated API Service Methods
import {
  fetchLibraryMaterials,
  deleteLibraryMaterial,
  signUploadUrl,
  createLibraryMaterial,
} from '@/lib/admin-api'

export interface Material {
  id: string
  title: string
  category: string
  size: string | number
  uploadDate?: string
  createdAt?: string
  type?: string
  fileUrl?: string
  key?: string
}

const CATEGORIES = [
  'Textbook',
  'Handout',
  'Syllabus',
  'Reference',
  'Exam Paper',
]

/**
 * Helper to safely extract payload whether the API returns raw item or { success: true, data: item }
 */
function unwrapApiResponse<T>(res: any): T {
  if (res && typeof res === 'object') {
    if ('data' in res) return res.data as T
    if ('materials' in res) return res.materials as T
  }
  return res as T
}

export default function Library() {
  const [materials, setMaterials] = useState<Material[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [fetchError, setFetchError] = useState<string | null>(null)

  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')

  // Upload modal & signing states
  const [isUploading, setIsUploading] = useState(false)
  const [isSigning, setIsSigning] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [pendingFile, setPendingFile] = useState<File | null>(null)
  const [ingestCategory, setIngestCategory] = useState(CATEGORIES[0])

  const fileInputRef = useRef<HTMLInputElement>(null)

  // ---------------------------------------------------------------------------
  // 1. Initial Load: Fetch Live Materials from API safely
  // ---------------------------------------------------------------------------
  const loadMaterials = async () => {
    setIsLoading(true)
    setFetchError(null)
    try {
      const response = await fetchLibraryMaterials()
      const items = unwrapApiResponse<Material[]>(response)

      if (Array.isArray(items)) {
        setMaterials(items)
      } else {
        setMaterials([])
        console.warn('API returned non-array payload:', response)
      }
    } catch (err: any) {
      console.error('Failed to load library materials:', err)
      const message =
        err?.response?.data?.message ||
        err?.message ||
        'Failed to connect to library backend services.'
      setFetchError(message)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadMaterials()
  }, [])

  // ---------------------------------------------------------------------------
  // 2. File Selection Handler
  // ---------------------------------------------------------------------------
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setPendingFile(e.target.files[0])
      setErrorMsg(null)
      setIsUploading(true)
    }
  }

  // ---------------------------------------------------------------------------
  // 3. Finalize Ingest: Sign URL -> Upload Raw Bytes -> Create DB Entry
  // ---------------------------------------------------------------------------
  const finalizeIngest = async () => {
    if (!pendingFile) return

    setIsSigning(true)
    setErrorMsg(null)

    try {
      // Step A: Get Signed Target from backend API
      const signResult = await signUploadUrl({
        filename: pendingFile.name,
        contentType: pendingFile.type || 'application/pdf',
        folder: 'materials',
      })

      // Safely unwrap data from response
      const signData = unwrapApiResponse<{
        uploadUrl: string | null
        fileUrl: string
        key: string
        message?: string
      }>(signResult)

      const { uploadUrl, fileUrl, key } = signData || {}

      if (!fileUrl) {
        throw new Error('Presigned upload URL generation failed.')
      }

      // Step B: Transfer raw file bytes if active presigned uploadUrl exists
      if (uploadUrl) {
        const uploadRes = await fetch(uploadUrl, {
          method: 'PUT',
          headers: {
            'Content-Type': pendingFile.type || 'application/pdf',
          },
          body: pendingFile,
        })

        if (!uploadRes.ok) {
          throw new Error(
            'Failed to push binary data to cloud storage destination.',
          )
        }
      }

      // Step C: Persist node metadata via admin-api using returned fileUrl
      const sizeFormatted = `${(pendingFile.size / (1024 * 1024)).toFixed(1)} MB`
      const payload = {
        title: pendingFile.name.replace(/\.[^/.]+$/, ''),
        category: ingestCategory,
        size: sizeFormatted,
        type: pendingFile.name.split('.').pop()?.toUpperCase() || 'PDF',
        fileUrl: fileUrl,
        key: key,
      }

      const createdNodeResponse = await createLibraryMaterial(payload)
      const freshMaterial = unwrapApiResponse<Material>(createdNodeResponse)

      // Prepend newly created real node to UI list
      setMaterials((prev) => [freshMaterial || (payload as Material), ...prev])
      setIsUploading(false)
      setPendingFile(null)
      if (fileInputRef.current) fileInputRef.current.value = ''
    } catch (err: any) {
      console.error('Ingest API Error:', err)
      setErrorMsg(err?.message || 'Failed to complete resource ingestion.')
    } finally {
      setIsSigning(false)
    }
  }

  // ---------------------------------------------------------------------------
  // 4. Delete Material Endpoint
  // ---------------------------------------------------------------------------
  const handleDelete = async (id: string) => {
    try {
      await deleteLibraryMaterial(id)
      setMaterials((prev) => prev.filter((m) => m.id !== id))
    } catch (err: any) {
      console.error('Failed to delete item:', err)
      alert(err?.message || 'Could not delete resource from library.')
    }
  }

  // ---------------------------------------------------------------------------
  // Metrics & Filtering Computations
  // ---------------------------------------------------------------------------
  const stats = useMemo(() => {
    const totalMB = materials.reduce((acc, curr) => {
      const parsedSize =
        typeof curr.size === 'number' ? curr.size : parseFloat(curr.size || '0')
      return acc + (isNaN(parsedSize) ? 0 : parsedSize)
    }, 0)

    const limitGB = 2
    const currentGB = totalMB / 1024
    return {
      size:
        totalMB >= 1000
          ? `${currentGB.toFixed(2)} GB`
          : `${totalMB.toFixed(2)} MB`,
      count: materials.length,
      percent: Math.min((currentGB / limitGB) * 100, 100).toFixed(1),
    }
  }, [materials])

  const filteredMaterials = useMemo(() => {
    return materials.filter((file) => {
      const title = file.title || ''
      const id = file.id || ''
      const matchesSearch =
        title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        id.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesCategory =
        selectedCategory === 'All' || file.category === selectedCategory
      return matchesSearch && matchesCategory
    })
  }, [searchTerm, selectedCategory, materials])

  return (
    <div className='flex h-screen w-full overflow-hidden bg-[#F8FAFC] font-sans text-slate-900 antialiased selection:bg-[#FCB900]/30'>
      {/* SIDEBAR */}
      <aside className='w-[230px] bg-white border-r border-slate-200 flex flex-col shrink-0'>
        <div className='p-4'>
          <div className='flex items-center gap-2 mb-4'>
            <div className='w-5 h-5 bg-[#002EFF] rounded flex items-center justify-center text-white font-bold text-[10px] shadow-sm'>
              L
            </div>
            <h1 className='text-sm font-black tracking-tight uppercase'>
              Library<span className='text-[#002EFF]'>Pro</span>
            </h1>
          </div>

          {/* VAULT CAPACITY */}
          <div className='bg-slate-950 rounded-xl p-3 text-white relative overflow-hidden border border-white/5 shadow-xl mb-6'>
            <div className='relative z-10'>
              <div className='flex items-center justify-between mb-2'>
                <div className='flex items-center gap-1.5'>
                  <HardDrive size={10} className='text-[#FCB900]' />
                  <span className='text-[7px] font-black uppercase tracking-[0.1em] text-slate-400'>
                    Vault Capacity
                  </span>
                </div>
                <div className='w-1 h-1 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]' />
              </div>

              <div className='flex justify-between items-baseline mb-1'>
                <span className='text-[11px] font-black tracking-tighter italic'>
                  {stats.size}
                </span>
                <span className='text-[8px] text-[#FCB900] font-black'>
                  {stats.percent}%
                </span>
              </div>

              <div className='h-1 w-full bg-white/10 rounded-full overflow-hidden'>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${stats.percent}%` }}
                  className='h-full bg-gradient-to-r from-[#002EFF] to-[#FCB900]'
                />
              </div>
            </div>
          </div>

          <nav className='space-y-0.5'>
            <p className='px-2 py-2 text-[8px] font-black text-slate-400 uppercase tracking-[0.2em]'>
              Data Segments
            </p>
            {['All', ...CATEGORIES].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all group ${
                  selectedCategory === cat
                    ? 'bg-slate-900 text-white shadow-lg shadow-slate-200'
                    : 'text-slate-500 hover:bg-slate-50'
                }`}
              >
                <div className='flex items-center gap-2'>
                  <FolderOpen
                    size={12}
                    className={
                      selectedCategory === cat
                        ? 'text-[#FCB900]'
                        : 'text-slate-300 group-hover:text-slate-500'
                    }
                  />
                  {cat}
                </div>
              </button>
            ))}
          </nav>
        </div>
      </aside>

      {/* MAIN VIEWPORT */}
      <main className='flex-1 flex flex-col min-w-0'>
        <header className='h-12 bg-white border-b border-slate-200 px-6 flex items-center justify-between shrink-0'>
          <div className='relative w-full max-w-xs'>
            <Search
              className='absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-300'
              size={12}
            />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder='Filter master manifest...'
              className='pl-8 bg-slate-50 border-none rounded-md h-7 text-[10px] focus-visible:ring-1 focus-visible:ring-[#002EFF]/20'
            />
          </div>

          <div className='flex items-center gap-2'>
            <Button
              variant='ghost'
              onClick={loadMaterials}
              className='h-7 rounded-md text-slate-400 text-[9px] font-black px-2 hover:bg-slate-100 uppercase'
            >
              <Download size={12} className='mr-1.5' /> Sync
            </Button>
            <Button
              onClick={() => fileInputRef.current?.click()}
              className='h-7 rounded-md bg-[#002EFF] hover:bg-blue-700 text-white text-[9px] font-black px-3 shadow-md uppercase tracking-wider'
            >
              <Plus size={12} className='mr-1' /> Ingest PDF
            </Button>
          </div>
        </header>

        <div className='flex-1 overflow-y-auto p-6 bg-[#F8FAFC]'>
          <div className='max-w-4xl mx-auto space-y-4'>
            <div className='grid grid-cols-3 gap-3'>
              <CompactStat
                label='Index Count'
                value={stats.count}
                icon={ShieldCheck}
              />
              <CompactStat label='Latency' value='2ms' icon={Activity} />
              <CompactStat
                label='Integrity'
                value='Verified'
                icon={CheckCircle2}
                color='text-emerald-600'
              />
            </div>

            <div className='bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden'>
              <div className='px-4 py-2 bg-slate-50/50 border-b border-slate-100 flex items-center justify-between'>
                <span className='text-[8px] font-black text-slate-400 uppercase tracking-widest'>
                  Master Manifest
                </span>
                <Badge className='bg-[#FCB900] text-black text-[8px] hover:bg-[#FCB900] border-none font-black'>
                  {filteredMaterials.length} NODES
                </Badge>
              </div>

              {/* LOADING STATE */}
              {isLoading ? (
                <div className='p-12 flex flex-col items-center justify-center text-slate-400 gap-2'>
                  <Loader2 size={24} className='animate-spin text-[#002EFF]' />
                  <span className='text-[10px] font-bold tracking-wider uppercase'>
                    Fetching live index from server...
                  </span>
                </div>
              ) : fetchError ? (
                /* ERROR STATE */
                <div className='p-8 text-center space-y-3'>
                  <p className='text-xs font-bold text-rose-500'>
                    {fetchError}
                  </p>
                  <Button
                    onClick={loadMaterials}
                    className='h-7 bg-slate-900 text-white text-[9px] font-bold uppercase'
                  >
                    Retry Connection
                  </Button>
                </div>
              ) : filteredMaterials.length === 0 ? (
                /* EMPTY STATE */
                <div className='p-12 flex flex-col items-center justify-center text-slate-300 gap-2'>
                  <Inbox size={32} strokeWidth={1.5} />
                  <p className='text-[10px] font-bold uppercase tracking-wider text-slate-400'>
                    No material assets found
                  </p>
                </div>
              ) : (
                /* DATA TABLE */
                <div className='overflow-x-auto'>
                  <table className='w-full text-left border-collapse'>
                    <thead>
                      <tr className='bg-white border-b border-slate-50'>
                        <th className='p-3 w-10'>
                          <button className='flex justify-center w-full'>
                            <Square size={13} className='text-slate-200' />
                          </button>
                        </th>
                        <th className='text-[8px] font-black text-slate-400 uppercase tracking-widest p-3'>
                          Resource Asset
                        </th>
                        <th className='text-[8px] font-black text-slate-400 uppercase tracking-widest p-3'>
                          Classification
                        </th>
                        <th className='text-[8px] font-black text-slate-400 uppercase tracking-widest p-3'>
                          Size
                        </th>
                        <th className='text-[8px] font-black text-slate-400 uppercase tracking-widest p-3 text-right pr-6'>
                          Ops
                        </th>
                      </tr>
                    </thead>
                    <tbody className='divide-y divide-slate-50'>
                      <AnimatePresence initial={false}>
                        {filteredMaterials.map((file) => (
                          <motion.tr
                            key={file.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 10 }}
                            className='group hover:bg-slate-50/50 transition-colors'
                          >
                            <td className='p-3 text-center'>
                              <Square
                                size={13}
                                className='text-slate-100 group-hover:text-slate-200 mx-auto'
                              />
                            </td>
                            <td className='p-3'>
                              <div className='flex items-center gap-2.5'>
                                <div className='w-6 h-6 bg-slate-50 rounded flex items-center justify-center text-slate-400 group-hover:text-[#002EFF] border border-slate-100'>
                                  <FileText size={11} />
                                </div>
                                <div>
                                  <p className='text-[10px] font-bold text-slate-800 leading-tight'>
                                    {file.title}
                                  </p>
                                  <p className='text-[7px] font-black text-slate-300 uppercase'>
                                    UID: {file.id}
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className='p-3'>
                              <span className='text-[8px] font-black text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded-sm uppercase'>
                                {file.category}
                              </span>
                            </td>
                            <td className='p-3 font-mono text-[9px] font-bold text-slate-400'>
                              {file.size}
                            </td>
                            <td className='p-3 text-right pr-6'>
                              <div className='flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity'>
                                {file.fileUrl && (
                                  <a
                                    href={file.fileUrl}
                                    target='_blank'
                                    rel='noreferrer'
                                    className='p-1 text-slate-300 hover:text-blue-600 rounded'
                                  >
                                    <ExternalLink size={11} />
                                  </a>
                                )}
                                <Button
                                  variant='ghost'
                                  size='icon'
                                  onClick={() => handleDelete(file.id)}
                                  className='h-6 w-6 text-slate-300 hover:text-rose-500'
                                >
                                  <Trash2 size={11} />
                                </Button>
                              </div>
                            </td>
                          </motion.tr>
                        ))}
                      </AnimatePresence>
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* INGESTION / SIGNING MODAL */}
      <AnimatePresence>
        {isUploading && (
          <div className='fixed inset-0 bg-slate-900/40 backdrop-blur-[2px] z-50 flex items-center justify-center p-4'>
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className='bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden border border-slate-200'
            >
              <div className='p-1 bg-[#FCB900]' />
              <div className='p-6'>
                <div className='flex items-center gap-3 mb-4'>
                  <div className='w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-[#002EFF]'>
                    <UploadCloud size={20} />
                  </div>
                  <div>
                    <h3 className='text-sm font-black uppercase tracking-tight'>
                      Classify & Sign Asset
                    </h3>
                    <p className='text-[10px] text-slate-400 font-bold truncate max-w-[200px]'>
                      {pendingFile?.name}
                    </p>
                  </div>
                </div>

                {errorMsg && (
                  <div className='mb-4 p-2.5 bg-rose-50 border border-rose-100 rounded-lg flex items-center gap-2 text-rose-600 text-[10px] font-bold'>
                    <AlertCircle size={14} className='shrink-0' />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <div className='space-y-4'>
                  <div className='space-y-1.5'>
                    <label className='text-[8px] font-black text-slate-400 uppercase tracking-widest'>
                      Select Category
                    </label>
                    <div className='grid grid-cols-2 gap-2'>
                      {CATEGORIES.map((cat) => (
                        <button
                          key={cat}
                          disabled={isSigning}
                          onClick={() => setIngestCategory(cat)}
                          className={`px-3 py-2 rounded-lg text-[9px] font-black text-left transition-all border ${
                            ingestCategory === cat
                              ? 'bg-slate-900 text-white border-slate-900 shadow-md'
                              : 'bg-slate-50 text-slate-500 border-slate-100 hover:border-slate-300'
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className='flex gap-2 pt-2'>
                    <Button
                      variant='ghost'
                      disabled={isSigning}
                      onClick={() => {
                        setIsUploading(false)
                        setErrorMsg(null)
                      }}
                      className='flex-1 h-9 text-[10px] font-black uppercase tracking-widest'
                    >
                      Abort
                    </Button>
                    <Button
                      onClick={finalizeIngest}
                      disabled={isSigning}
                      className='flex-1 h-9 bg-[#002EFF] hover:bg-blue-700 text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-100 flex items-center justify-center gap-1.5'
                    >
                      {isSigning ? (
                        <>
                          <Loader2 size={12} className='animate-spin' />
                          Signing...
                        </>
                      ) : (
                        'Confirm Ingest'
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <input
        type='file'
        ref={fileInputRef}
        onChange={handleFileChange}
        accept='.pdf'
        className='hidden'
      />
    </div>
  )
}

function CompactStat({
  label,
  value,
  icon: Icon,
  color = 'text-slate-900',
}: {
  label: string
  value: string | number
  icon: React.ElementType
  color?: string
}) {
  return (
    <div className='bg-white p-3 rounded-xl border border-slate-200 flex items-center gap-3 shadow-sm'>
      <div className='w-7 h-7 bg-slate-50 rounded-lg flex items-center justify-center text-[#002EFF]'>
        <Icon size={14} />
      </div>
      <div>
        <p className='text-[7px] font-black text-slate-400 uppercase tracking-widest mb-0.5'>
          {label}
        </p>
        <p
          className={`text-xs font-black ${color} tracking-tight leading-none`}
        >
          {value}
        </p>
      </div>
    </div>
  )
}