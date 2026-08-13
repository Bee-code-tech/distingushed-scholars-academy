// 'use client'

// import React, { useState } from 'react'
// import {
//   Megaphone,
//   Send,
//   Trash2,
//   Globe,
//   Users,
//   Eye,
//   Calendar,
//   Layout,
//   Info,
//   CheckCircle2,
//   Sparkles,
//   History,
// } from 'lucide-react'
// import { motion, AnimatePresence } from 'framer-motion'

// export default function Announcements() {
//   const [target, setTarget] = useState('all')
//   const [priority, setPriority] = useState('low')
//   const [headline, setHeadline] = useState('')

//   const history = [
//     {
//       id: 1,
//       title: 'JAMB Mock #4 Registration Open',
//       target: 'Everyone',
//       date: 'Feb 1',
//       views: '8.4k',
//       status: 'Active',
//     },
//     {
//       id: 2,
//       title: 'System Maintenance - Midnight',
//       target: 'Everyone',
//       date: 'Jan 28',
//       views: '12k',
//       status: 'Expired',
//     },
//     {
//       id: 3,
//       title: 'Chemistry Scholarship Results',
//       target: 'Premium',
//       date: 'Jan 25',
//       views: '2.1k',
//       status: 'Expired',
//     },
//   ]

//   return (
//     <div className='max-w-6xl mx-auto space-y-6 animate-in fade-in duration-500 pb-10 px-4'>
//       {/* Pro Header */}
//       <div className='flex justify-between items-end'>
//         <div>
//           <h1 className='text-2xl font-black text-slate-900 tracking-tight'>
//             Broadcast Center
//           </h1>
//           <p className='text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1 flex items-center gap-2'>
//             <span className='w-1.5 h-1.5 rounded-full bg-blue-500' />
//             Direct Student Communication Portal
//           </p>
//         </div>
//         <div className='hidden sm:flex items-center gap-2 bg-slate-50 p-1 rounded-lg border border-slate-100'>
//           <div className='px-3 py-1 text-[10px] font-black text-slate-400 uppercase'>
//             Status: Ready
//           </div>
//         </div>
//       </div>

//       <div className='grid grid-cols-1 lg:grid-cols-12 gap-6'>
//         {/* Main Composer */}
//         <div className='lg:col-span-8 space-y-4'>
//           <div className='bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden'>
//             <div className='p-5 border-b border-slate-100 bg-slate-50/30 flex justify-between items-center'>
//               <h3 className='font-black text-slate-900 uppercase tracking-widest text-[10px] flex items-center gap-2'>
//                 <Megaphone size={14} className='text-blue-600' /> Composer
//               </h3>
//               <div className='flex gap-1'>
//                 <div className='w-2 h-2 rounded-full bg-slate-200' />
//                 <div className='w-2 h-2 rounded-full bg-slate-200' />
//               </div>
//             </div>

//             <div className='p-6 space-y-5'>
//               <div className='grid grid-cols-1 md:grid-cols-2 gap-5'>
//                 <div className='space-y-1.5'>
//                   <label className='text-[10px] font-black uppercase text-slate-400 ml-1'>
//                     Headline
//                   </label>
//                   <input
//                     type='text'
//                     value={headline}
//                     onChange={(e) => setHeadline(e.target.value)}
//                     placeholder='Brief, impactful title...'
//                     className='w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-blue-500/10 focus:bg-white transition-all font-bold text-sm'
//                   />
//                 </div>
//                 <div className='space-y-1.5'>
//                   <label className='text-[10px] font-black uppercase text-slate-400 ml-1'>
//                     Call to Action
//                   </label>
//                   <input
//                     type='text'
//                     placeholder='Button Label (e.g. Apply Now)'
//                     className='w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl font-bold text-sm focus:bg-white'
//                   />
//                 </div>
//               </div>

//               <div className='space-y-1.5'>
//                 <label className='text-[10px] font-black uppercase text-slate-400 ml-1'>
//                   Announcement Body
//                 </label>
//                 <textarea
//                   rows={4}
//                   className='w-full p-4 bg-slate-50 border border-slate-100 rounded-xl focus:bg-white transition-all font-medium text-sm leading-relaxed'
//                   placeholder='Draft your message here...'
//                 />
//               </div>

//               <div className='flex flex-wrap items-center justify-between gap-4 pt-2'>
//                 <div className='flex items-center gap-3'>
//                   <div className='flex bg-slate-100 p-1 rounded-lg'>
//                     {['low', 'high'].map((p) => (
//                       <button
//                         key={p}
//                         onClick={() => setPriority(p)}
//                         className={`px-4 py-1.5 rounded-md text-[9px] font-black uppercase transition-all ${priority === p ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400'}`}
//                       >
//                         {p} Priority
//                       </button>
//                     ))}
//                   </div>
//                   <div className='h-4 w-1px bg-slate-200 hidden sm:block' />
//                   <p className='text-[10px] font-bold text-slate-400 italic'>
//                     Auto-saves to drafts
//                   </p>
//                 </div>

//                 <button className='px-8 py-3 bg-blue-600 text-white rounded-xl font-black text-[11px] uppercase tracking-widest shadow-lg shadow-blue-200 hover:bg-blue-700 hover:-translate-y-0.5 transition-all flex items-center gap-2'>
//                   <Send size={14} /> Send Broadcast
//                 </button>
//               </div>
//             </div>
//           </div>

//           {/* Context Alert */}
//           <div className='bg-blue-50/50 border border-blue-100 rounded-xl p-4 flex items-start gap-3'>
//             <Info size={16} className='text-blue-500 mt-0.5' />
//             <p className='text-[11px] text-blue-700 font-medium leading-normal'>
//               <span className='font-bold'>Pro Tip:</span> High priority
//               announcements trigger push notifications and stay pinned to the
//               top of the student dashboard for 48 hours.
//             </p>
//           </div>
//         </div>

//         {/* Audience & Side panels */}
//         <div className='lg:col-span-4 space-y-4'>
//           <div className='bg-slate-900 rounded-2xl p-6 text-white shadow-xl'>
//             <h3 className='font-black uppercase tracking-widest text-[9px] text-blue-400 mb-4 flex items-center gap-2'>
//               <Users size={12} /> Targeting Logic
//             </h3>
//             <div className='space-y-2'>
//               <TargetItem
//                 active={target === 'all'}
//                 onClick={() => setTarget('all')}
//                 icon={Globe}
//                 label='Everyone'
//                 sub='12.4k Students'
//               />
//               <TargetItem
//                 active={target === 'premium'}
//                 onClick={() => setTarget('premium')}
//                 icon={Sparkles}
//                 label='Premium Only'
//                 sub='3.2k Students'
//               />
//               <TargetItem
//                 active={target === 'scholarship'}
//                 onClick={() => setTarget('scholarship')}
//                 icon={Layout}
//                 label='Scholarship Cohorts'
//                 sub='840 Students'
//               />
//             </div>
//           </div>

//           <div className='bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm'>
//             <div className='p-4 bg-slate-50/50 border-b border-slate-100'>
//               <h3 className='font-black uppercase tracking-widest text-[9px] text-slate-400 flex items-center gap-2'>
//                 <History size={12} /> Log History
//               </h3>
//             </div>
//             <div className='divide-y divide-slate-50'>
//               {history.map((item) => (
//                 <div
//                   key={item.id}
//                   className='p-4 hover:bg-slate-50 transition-colors group relative'
//                 >
//                   <div className='flex justify-between items-center mb-1.5'>
//                     <span
//                       className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded ${item.status === 'Active' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}
//                     >
//                       {item.status}
//                     </span>
//                     <div className='flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity'>
//                       <button className='text-slate-400 hover:text-blue-600'>
//                         <Eye size={12} />
//                       </button>
//                       <button className='text-slate-400 hover:text-rose-500'>
//                         <Trash2 size={12} />
//                       </button>
//                     </div>
//                   </div>
//                   <p className='text-[11px] font-bold text-slate-800 leading-tight mb-2'>
//                     {item.title}
//                   </p>
//                   <div className='flex items-center justify-between text-[9px] font-bold text-slate-400 uppercase tracking-tighter'>
//                     <span className='flex items-center gap-1'>
//                       <Eye size={10} /> {item.views}
//                     </span>
//                     <span className='flex items-center gap-1'>
//                       <Calendar size={10} /> {item.date}
//                     </span>
//                   </div>
//                 </div>
//               ))}
//             </div>
//             <button className='w-full py-3 bg-slate-50 text-[9px] font-black uppercase text-slate-400 hover:text-slate-600 transition-colors'>
//               View All Archives
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   )
// }

// function TargetItem({ active, icon: Icon, label, sub, onClick }: any) {
//   return (
//     <button
//       onClick={onClick}
//       className={`w-full flex items-center justify-between p-3.5 rounded-xl transition-all border ${
//         active
//           ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-900/40 translate-x-1'
//           : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700 hover:border-slate-600'
//       }`}
//     >
//       <div className='flex items-center gap-3'>
//         <Icon
//           size={16}
//           className={active ? 'text-blue-200' : 'text-slate-500'}
//         />
//         <div className='text-left'>
//           <p className='text-[10px] font-black uppercase tracking-wider'>
//             {label}
//           </p>
//           <p
//             className={`text-[8px] font-bold uppercase ${active ? 'text-blue-200' : 'text-slate-500'}`}
//           >
//             {sub}
//           </p>
//         </div>
//       </div>
//       {active && <CheckCircle2 size={14} className='text-blue-200' />}
//     </button>
//   )
// }

'use client'

import React, { useState, useEffect, useCallback } from 'react'
import {
  Megaphone,
  Send,
  Trash2,
  Globe,
  Users,
  Eye,
  Calendar,
  Layout,
  Info,
  CheckCircle2,
  Sparkles,
  History,
  Loader2,
  AlertCircle,
  BookOpen,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { adminApi } from '@/lib/admin-api' 

interface AnnouncementItem {
  id?: string
  _id?: string
  title: string
  body: string
  scope: string
  examTrack?: string
  priority?: string
  cta?: string
  views?: number | string
  createdAt?: string
  status?: string
}

export default function Announcements() {
  // Form State
  const [headline, setHeadline] = useState('')
  const [cta, setCta] = useState('')
  const [body, setBody] = useState('')
  const [priority, setPriority] = useState<'low' | 'high'>('low')
  const [target, setTarget] = useState<'all' | 'jamb' | 'waec' | 'postutme'>(
    'all',
  )

  // API & Component States
  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // Fetch Announcements
  const fetchAnnouncements = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const res: any = await adminApi.getAnnouncements()
      // Handle array response or nested data array
      const list = Array.isArray(res) ? res : res?.data || []
      setAnnouncements(list)
    } catch (err: any) {
      console.error('Failed to fetch announcements:', err)
      setError(err.message || 'Failed to load announcements.')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchAnnouncements()
  }, [fetchAnnouncements])

  // Submit Broadcast
  const handleSendBroadcast = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!headline.trim() || !body.trim()) {
      setError(
        'Please provide both a headline and a body for the announcement.',
      )
      return
    }

    setIsSubmitting(true)
    setError(null)
    setSuccess(null)

    // Map UI target to API scope and track
    const scope = target === 'all' ? 'global' : 'track'
    const examTrack = target !== 'all' ? target : undefined

    try {
      await adminApi.createAnnouncement({
        scope,
        title: headline,
        body,
        priority,
        cta: cta.trim() ? cta : undefined,
        ...(examTrack ? { examTrack } : {}),
      })

      setSuccess('Announcement broadcasted successfully!')

      // Clear Form
      setHeadline('')
      setCta('')
      setBody('')
      setPriority('low')

      // Refresh list
      fetchAnnouncements()
    } catch (err: any) {
      console.error('Failed to create announcement:', err)
      setError(err.message || 'Failed to send broadcast.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className='max-w-6xl mx-auto space-y-6 animate-in fade-in duration-500 pb-10 px-4'>
      {/* Pro Header */}
      <div className='flex justify-between items-end'>
        <div>
          <h1 className='text-2xl font-black text-slate-900 tracking-tight'>
            Broadcast Center
          </h1>
          <p className='text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1 flex items-center gap-2'>
            <span className='w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse' />
            Direct Student Communication Portal
          </p>
        </div>
        <div className='hidden sm:flex items-center gap-2 bg-slate-50 p-1 rounded-lg border border-slate-100'>
          <div className='px-3 py-1 text-[10px] font-black text-slate-400 uppercase flex items-center gap-1.5'>
            <span className='w-2 h-2 rounded-full bg-emerald-500' />
            Status: Active
          </div>
        </div>
      </div>

      {/* Alert Notifications */}
      {error && (
        <div className='bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-xl flex items-center justify-between text-xs font-semibold'>
          <div className='flex items-center gap-2'>
            <AlertCircle size={16} className='text-rose-500' />
            <span>{error}</span>
          </div>
          <button
            onClick={() => setError(null)}
            className='text-rose-400 hover:text-rose-600'
          >
            ✕
          </button>
        </div>
      )}

      {success && (
        <div className='bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-xl flex items-center justify-between text-xs font-semibold'>
          <div className='flex items-center gap-2'>
            <CheckCircle2 size={16} className='text-emerald-500' />
            <span>{success}</span>
          </div>
          <button
            onClick={() => setSuccess(null)}
            className='text-emerald-400 hover:text-emerald-600'
          >
            ✕
          </button>
        </div>
      )}

      <div className='grid grid-cols-1 lg:grid-cols-12 gap-6'>
        {/* Main Composer */}
        <div className='lg:col-span-8 space-y-4'>
          <form
            onSubmit={handleSendBroadcast}
            className='bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden'
          >
            <div className='p-5 border-b border-slate-100 bg-slate-50/30 flex justify-between items-center'>
              <h3 className='font-black text-slate-900 uppercase tracking-widest text-[10px] flex items-center gap-2'>
                <Megaphone size={14} className='text-blue-600' /> Composer
              </h3>
              <div className='flex gap-1'>
                <div className='w-2 h-2 rounded-full bg-slate-200' />
                <div className='w-2 h-2 rounded-full bg-slate-200' />
              </div>
            </div>

            <div className='p-6 space-y-5'>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-5'>
                <div className='space-y-1.5'>
                  <label className='text-[10px] font-black uppercase text-slate-400 ml-1'>
                    Headline <span className='text-rose-500'>*</span>
                  </label>
                  <input
                    type='text'
                    required
                    value={headline}
                    onChange={(e) => setHeadline(e.target.value)}
                    placeholder='Brief, impactful title...'
                    className='w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-blue-500/10 focus:bg-white transition-all font-bold text-sm'
                  />
                </div>
                <div className='space-y-1.5'>
                  <label className='text-[10px] font-black uppercase text-slate-400 ml-1'>
                    Call to Action (Optional)
                  </label>
                  <input
                    type='text'
                    value={cta}
                    onChange={(e) => setCta(e.target.value)}
                    placeholder='Button Label (e.g. Apply Now)'
                    className='w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl font-bold text-sm focus:bg-white transition-all'
                  />
                </div>
              </div>

              <div className='space-y-1.5'>
                <label className='text-[10px] font-black uppercase text-slate-400 ml-1'>
                  Announcement Body <span className='text-rose-500'>*</span>
                </label>
                <textarea
                  rows={4}
                  required
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  className='w-full p-4 bg-slate-50 border border-slate-100 rounded-xl focus:bg-white transition-all font-medium text-sm leading-relaxed'
                  placeholder='Draft your message here...'
                />
              </div>

              <div className='flex flex-wrap items-center justify-between gap-4 pt-2'>
                <div className='flex items-center gap-3'>
                  <div className='flex bg-slate-100 p-1 rounded-lg'>
                    {(['low', 'high'] as const).map((p) => (
                      <button
                        type='button'
                        key={p}
                        onClick={() => setPriority(p)}
                        className={`px-4 py-1.5 rounded-md text-[9px] font-black uppercase transition-all ${
                          priority === p
                            ? 'bg-white text-slate-900 shadow-sm'
                            : 'text-slate-400'
                        }`}
                      >
                        {p} Priority
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  type='submit'
                  disabled={isSubmitting}
                  className='px-8 py-3 bg-blue-600 text-white rounded-xl font-black text-[11px] uppercase tracking-widest shadow-lg shadow-blue-200 hover:bg-blue-700 hover:-translate-y-0.5 transition-all flex items-center gap-2 disabled:opacity-50 disabled:hover:translate-y-0'
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={14} className='animate-spin' /> Sending...
                    </>
                  ) : (
                    <>
                      <Send size={14} /> Send Broadcast
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>

          {/* Context Alert */}
          <div className='bg-blue-50/50 border border-blue-100 rounded-xl p-4 flex items-start gap-3'>
            <Info size={16} className='text-blue-500 mt-0.5 flex-shrink-0' />
            <p className='text-[11px] text-blue-700 font-medium leading-normal'>
              <span className='font-bold'>Pro Tip:</span> High priority
              announcements trigger urgent highlights and stay pinned to the top
              of matching student dashboards.
            </p>
          </div>
        </div>

        {/* Audience & History Side panels */}
        <div className='lg:col-span-4 space-y-4'>
          {/* Target Selection */}
          <div className='bg-slate-900 rounded-2xl p-6 text-white shadow-xl'>
            <h3 className='font-black uppercase tracking-widest text-[9px] text-blue-400 mb-4 flex items-center gap-2'>
              <Users size={12} /> Target Audience
            </h3>
            <div className='space-y-2'>
              <TargetItem
                active={target === 'all'}
                onClick={() => setTarget('all')}
                icon={Globe}
                label='Everyone (Global)'
                sub='All registered platform students'
              />
              <TargetItem
                active={target === 'jamb'}
                onClick={() => setTarget('jamb')}
                icon={BookOpen}
                label='JAMB Candidates'
                sub='Enrolled in JAMB Track'
              />
              <TargetItem
                active={target === 'waec'}
                onClick={() => setTarget('waec')}
                icon={Sparkles}
                label='WAEC Candidates'
                sub='Enrolled in WAEC Track'
              />
              <TargetItem
                active={target === 'postutme'}
                onClick={() => setTarget('postutme')}
                icon={Layout}
                label='Post-UTME Candidates'
                sub='Enrolled in Post-UTME Track'
              />
            </div>
          </div>

          {/* Broadcast History Panel */}
          <div className='bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm'>
            <div className='p-4 bg-slate-50/50 border-b border-slate-100 flex items-center justify-between'>
              <h3 className='font-black uppercase tracking-widest text-[9px] text-slate-400 flex items-center gap-2'>
                <History size={12} /> Log History
              </h3>
              <button
                onClick={fetchAnnouncements}
                className='text-[9px] font-bold text-blue-600 hover:underline uppercase'
              >
                Refresh
              </button>
            </div>

            <div className='divide-y divide-slate-50 max-h-[380px] overflow-y-auto'>
              {isLoading ? (
                <div className='p-8 text-center text-slate-400 flex flex-col items-center gap-2'>
                  <Loader2 size={18} className='animate-spin text-blue-500' />
                  <span className='text-[10px] font-bold uppercase'>
                    Loading Broadcasts...
                  </span>
                </div>
              ) : announcements.length === 0 ? (
                <div className='p-8 text-center text-slate-400 text-xs font-medium'>
                  No announcements broadcasted yet.
                </div>
              ) : (
                announcements.map((item) => {
                  const itemKey = item.id || item._id || item.title
                  const formattedDate = item.createdAt
                    ? new Date(item.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })
                    : 'Recent'

                  return (
                    <div
                      key={itemKey}
                      className='p-4 hover:bg-slate-50 transition-colors group relative'
                    >
                      <div className='flex justify-between items-center mb-1.5'>
                        <span className='text-[8px] font-black uppercase px-1.5 py-0.5 rounded bg-blue-50 text-blue-600'>
                          {item.scope === 'global'
                            ? 'Global'
                            : item.examTrack
                              ? `${item.examTrack} Track`
                              : item.scope}
                        </span>
                        {item.priority === 'high' && (
                          <span className='text-[8px] font-black uppercase px-1.5 py-0.5 rounded bg-rose-50 text-rose-600'>
                            High Priority
                          </span>
                        )}
                      </div>
                      <p className='text-[11px] font-bold text-slate-800 leading-tight mb-1'>
                        {item.title}
                      </p>
                      <p className='text-[10px] text-slate-500 line-clamp-2 mb-2 font-medium'>
                        {item.body}
                      </p>
                      <div className='flex items-center justify-between text-[9px] font-bold text-slate-400 uppercase tracking-tighter'>
                        <span className='flex items-center gap-1'>
                          <Eye size={10} /> {item.views ?? 'Broadcasted'}
                        </span>
                        <span className='flex items-center gap-1'>
                          <Calendar size={10} /> {formattedDate}
                        </span>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function TargetItem({
  active,
  icon: Icon,
  label,
  sub,
  onClick,
}: {
  active: boolean
  icon: any
  label: string
  sub: string
  onClick: () => void
}) {
  return (
    <button
      type='button'
      onClick={onClick}
      className={`w-full flex items-center justify-between p-3.5 rounded-xl transition-all border ${
        active
          ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-900/40 translate-x-1'
          : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700 hover:border-slate-600'
      }`}
    >
      <div className='flex items-center gap-3 text-left'>
        <Icon
          size={16}
          className={active ? 'text-blue-200' : 'text-slate-500'}
        />
        <div>
          <p className='text-[10px] font-black uppercase tracking-wider'>
            {label}
          </p>
          <p
            className={`text-[8px] font-bold uppercase ${
              active ? 'text-blue-200' : 'text-slate-500'
            }`}
          >
            {sub}
          </p>
        </div>
      </div>
      {active && (
        <CheckCircle2 size={14} className='text-blue-200 flex-shrink-0' />
      )}
    </button>
  )
}