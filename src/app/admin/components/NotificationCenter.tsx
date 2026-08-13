// 'use client'

// import React, { useState, useEffect, useCallback } from 'react'
// import { motion, AnimatePresence } from 'framer-motion'
// import {
//   Bell,
//   CheckCheck,
//   Loader2,
//   ExternalLink,
//   Inbox,
//   AlertCircle,
//   Megaphone,
//   Calendar,
//   GraduationCap,
// } from 'lucide-react'
// import { Button } from '@/components/ui/button'
// import { Badge } from '@/components/ui/badge'
// import {
//   Popover,
//   PopoverContent,
//   PopoverTrigger,
// } from '@/components/ui/popover'
// import {
//   fetchNotifications,
//   markAllNotificationsRead,
//   markNotificationRead,
//   NotificationItem,
// } from '@/lib/admin-api'

// // Helper to render type icons
// function getNotificationIcon(type: string) {
//   switch (type) {
//     case 'class_reminder':
//       return <Calendar className='w-3.5 h-3.5 text-blue-500' />
//     case 'announcement':
//       return <Megaphone className='w-3.5 h-3.5 text-amber-500' />
//     case 'grade':
//       return <GraduationCap className='w-3.5 h-3.5 text-emerald-500' />
//     default:
//       return <AlertCircle className='w-3.5 h-3.5 text-slate-400' />
//   }
// }

// export default function NotificationCenter() {
//   const [notifications, setNotifications] = useState<NotificationItem[]>([])
//   const [loading, setLoading] = useState(false)
//   const [unreadOnly, setUnreadOnly] = useState(false)
//   const [isOpen, setIsOpen] = useState(false)

//   // Fetch list from API
//   const loadNotifications = useCallback(async () => {
//     setLoading(true)
//     try {
//       const res = await fetchNotifications(unreadOnly)
//       if (res && res.success) {
//         setNotifications(res.data || [])
//       }
//     } catch (err) {
//       console.error('Failed to load notifications:', err)
//     } finally {
//       setLoading(false)
//     }
//   }, [unreadOnly])

//   useEffect(() => {
//     loadNotifications()
//   }, [loadNotifications])

//   // Unread badge count
//   const unreadCount = notifications.filter((n) => !n.isRead).length

//   // Handlers
//   const handleMarkOneRead = async (id: string, isRead: boolean) => {
//     if (isRead) return
//     try {
//       await markNotificationRead(id)
//       setNotifications((prev) =>
//         prev.map((item) => (item.id === id ? { ...item, isRead: true } : item)),
//       )
//     } catch (err) {
//       console.error('Failed to mark notification as read:', err)
//     }
//   }

//   const handleMarkAllRead = async () => {
//     try {
//       await markAllNotificationsRead()
//       setNotifications((prev) =>
//         prev.map((item) => ({ ...item, isRead: true })),
//       )
//     } catch (err) {
//       console.error('Failed to mark all as read:', err)
//     }
//   }

//   return (
//     <Popover open={isOpen} onOpenChange={setIsOpen}>
//       <PopoverTrigger asChild>
//         <Button
//           variant='ghost'
//           size='icon'
//           className='relative h-8 w-8 rounded-lg hover:bg-slate-100 transition-colors'
//         >
//           <Bell size={16} className='text-slate-600' />
//           {unreadCount > 0 && (
//             <span className='absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#002EFF] text-[9px] font-black text-white shadow-sm'>
//               {unreadCount > 9 ? '9+' : unreadCount}
//             </span>
//           )}
//         </Button>
//       </PopoverTrigger>

//       <PopoverContent
//         align='end'
//         className='w-[360px] p-0 rounded-2xl shadow-2xl border border-slate-200 overflow-hidden bg-white'
//       >
//         {/* Header */}
//         <div className='p-3.5 bg-slate-900 text-white flex items-center justify-between'>
//           <div className='flex items-center gap-2'>
//             <h4 className='text-xs font-black uppercase tracking-wider'>
//               Notifications
//             </h4>
//             {unreadCount > 0 && (
//               <Badge className='bg-[#FCB900] text-black text-[9px] font-black px-1.5 py-0 border-none'>
//                 {unreadCount} NEW
//               </Badge>
//             )}
//           </div>

//           {unreadCount > 0 && (
//             <button
//               onClick={handleMarkAllRead}
//               className='text-[9px] font-bold text-slate-300 hover:text-white flex items-center gap-1 transition-colors uppercase tracking-wider'
//             >
//               <CheckCheck size={12} /> Mark all read
//             </button>
//           )}
//         </div>

//         {/* Filter Tabs */}
//         <div className='flex border-b border-slate-100 bg-slate-50/50 p-1 gap-1'>
//           <button
//             onClick={() => setUnreadOnly(false)}
//             className={`flex-1 py-1 text-[9px] font-black rounded-md uppercase transition-all ${
//               !unreadOnly
//                 ? 'bg-white text-slate-900 shadow-sm'
//                 : 'text-slate-400 hover:text-slate-600'
//             }`}
//           >
//             All
//           </button>
//           <button
//             onClick={() => setUnreadOnly(true)}
//             className={`flex-1 py-1 text-[9px] font-black rounded-md uppercase transition-all ${
//               unreadOnly
//                 ? 'bg-white text-slate-900 shadow-sm'
//                 : 'text-slate-400 hover:text-slate-600'
//             }`}
//           >
//             Unread
//           </button>
//         </div>

//         {/* Notification Feed */}
//         <div className='max-h-[340px] overflow-y-auto divide-y divide-slate-100'>
//           {loading ? (
//             <div className='p-8 flex items-center justify-center text-slate-400 gap-2'>
//               <Loader2 size={16} className='animate-spin text-[#002EFF]' />
//               <span className='text-[10px] font-bold uppercase'>
//                 Loading feed...
//               </span>
//             </div>
//           ) : notifications.length === 0 ? (
//             <div className='p-10 text-center text-slate-300 space-y-2'>
//               <Inbox size={28} className='mx-auto text-slate-200' />
//               <p className='text-[10px] font-bold uppercase tracking-wider text-slate-400'>
//                 No notifications found
//               </p>
//             </div>
//           ) : (
//             <AnimatePresence initial={false}>
//               {notifications.map((item) => (
//                 <motion.div
//                   key={item.id}
//                   initial={{ opacity: 0 }}
//                   animate={{ opacity: 1 }}
//                   exit={{ opacity: 0 }}
//                   onClick={() => handleMarkOneRead(item.id, item.isRead)}
//                   className={`p-3 transition-colors cursor-pointer flex gap-3 relative ${
//                     !item.isRead ? 'bg-blue-50/30' : 'hover:bg-slate-50'
//                   }`}
//                 >
//                   {/* Read Status Dot */}
//                   {!item.isRead && (
//                     <span className='absolute left-1.5 top-4 w-1.5 h-1.5 rounded-full bg-[#002EFF]' />
//                   )}

//                   <div className='w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center shrink-0 mt-0.5'>
//                     {getNotificationIcon(item.type)}
//                   </div>

//                   <div className='flex-1 min-w-0'>
//                     <div className='flex items-center justify-between gap-1 mb-0.5'>
//                       <p className='text-[10px] font-bold text-slate-800 truncate'>
//                         {item.title}
//                       </p>
//                       <span className='text-[8px] font-semibold text-slate-400 shrink-0'>
//                         {new Date(item.createdAt).toLocaleDateString(
//                           undefined,
//                           {
//                             month: 'short',
//                             day: 'numeric',
//                           },
//                         )}
//                       </span>
//                     </div>

//                     <p className='text-[9.5px] text-slate-500 leading-snug line-clamp-2'>
//                       {item.body}
//                     </p>

//                     {item.link && (
//                       <a
//                         href={item.link}
//                         target='_blank'
//                         rel='noreferrer'
//                         className='inline-flex items-center gap-1 text-[8.5px] font-bold text-[#002EFF] hover:underline mt-1'
//                         onClick={(e) => e.stopPropagation()}
//                       >
//                         View Link <ExternalLink size={9} />
//                       </a>
//                     )}
//                   </div>
//                 </motion.div>
//               ))}
//             </AnimatePresence>
//           )}
//         </div>
//       </PopoverContent>
//     </Popover>
//   )
// }

'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Bell,
  CheckCheck,
  Loader2,
  ExternalLink,
  Inbox,
  Filter,
  RefreshCw,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  fetchNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  NotificationItem,
} from '@/lib/admin-api'

export default function NotificationsView() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const [loading, setLoading] = useState(true)
  const [unreadOnly, setUnreadOnly] = useState(false)

  const loadData = async () => {
    setLoading(true)
    try {
      const res = await fetchNotifications(unreadOnly)
      if (res && res.success) {
        setNotifications(res.data || [])
      }
    } catch (err) {
      console.error('Failed to load notifications:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [unreadOnly])

  const handleMarkRead = async (id: string) => {
    try {
      await markNotificationRead(id)
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
      )
    } catch (err) {
      console.error('Error marking read:', err)
    }
  }

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsRead()
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))
    } catch (err) {
      console.error('Error marking all read:', err)
    }
  }

  const unreadCount = notifications.filter((n) => !n.isRead).length

  return (
    <div className='p-6 max-w-4xl mx-auto space-y-4'>
      {/* HEADER BAR */}
      <div className='flex items-center justify-between bg-white p-4 rounded-xl border border-slate-200 shadow-sm'>
        <div className='flex items-center gap-3'>
          <div className='w-9 h-9 bg-slate-900 rounded-lg flex items-center justify-center text-white'>
            <Bell size={18} />
          </div>
          <div>
            <h2 className='text-sm font-black uppercase tracking-tight'>
              System Alerts & Notifications
            </h2>
            <p className='text-[10px] text-slate-400 font-bold'>
              {unreadCount} unread message{unreadCount === 1 ? '' : 's'}
            </p>
          </div>
        </div>

        <div className='flex items-center gap-2'>
          <Button
            variant='outline'
            onClick={loadData}
            className='h-8 text-[9px] font-black uppercase gap-1'
          >
            <RefreshCw size={12} /> Sync
          </Button>

          {unreadCount > 0 && (
            <Button
              onClick={handleMarkAllRead}
              className='h-8 bg-[#002EFF] hover:bg-blue-700 text-white text-[9px] font-black uppercase gap-1'
            >
              <CheckCheck size={12} /> Mark All Read
            </Button>
          )}
        </div>
      </div>

      {/* FILTER BAR */}
      <div className='flex items-center justify-between bg-slate-100/60 p-1.5 rounded-lg'>
        <div className='flex gap-1'>
          <Button
            variant={!unreadOnly ? 'default' : 'ghost'}
            onClick={() => setUnreadOnly(false)}
            className={`h-7 text-[9px] font-black uppercase ${
              !unreadOnly ? 'bg-slate-900 text-white' : 'text-slate-500'
            }`}
          >
            All Notifications
          </Button>
          <Button
            variant={unreadOnly ? 'default' : 'ghost'}
            onClick={() => setUnreadOnly(true)}
            className={`h-7 text-[9px] font-black uppercase ${
              unreadOnly ? 'bg-slate-900 text-white' : 'text-slate-500'
            }`}
          >
            Unread Only
          </Button>
        </div>

        <Badge className='bg-slate-200 text-slate-700 text-[8px] font-black border-none'>
          <Filter size={9} className='mr-1' /> {notifications.length} Total
        </Badge>
      </div>

      {/* NOTIFICATIONS LIST */}
      <div className='bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden divide-y divide-slate-100'>
        {loading ? (
          <div className='p-12 flex flex-col items-center justify-center text-slate-400 gap-2'>
            <Loader2 size={24} className='animate-spin text-[#002EFF]' />
            <span className='text-[10px] font-bold uppercase'>
              Fetching notification log...
            </span>
          </div>
        ) : notifications.length === 0 ? (
          <div className='p-12 text-center text-slate-300 space-y-2'>
            <Inbox size={32} className='mx-auto text-slate-200' />
            <p className='text-[10px] font-bold uppercase tracking-wider text-slate-400'>
              No notifications to display
            </p>
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {notifications.map((item) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => handleMarkRead(item.id)}
                className={`p-4 flex items-start justify-between gap-4 transition-colors cursor-pointer ${
                  !item.isRead ? 'bg-blue-50/20' : 'hover:bg-slate-50/80'
                }`}
              >
                <div className='flex gap-3 min-w-0'>
                  {!item.isRead && (
                    <span className='w-2 h-2 rounded-full bg-[#002EFF] shrink-0 mt-1.5' />
                  )}
                  <div>
                    <div className='flex items-center gap-2 mb-1'>
                      <span className='text-[8px] font-black uppercase px-2 py-0.5 bg-slate-100 text-slate-600 rounded'>
                        {item.type}
                      </span>
                      <h4 className='text-xs font-bold text-slate-900'>
                        {item.title}
                      </h4>
                    </div>
                    <p className='text-xs text-slate-600 leading-relaxed mb-2'>
                      {item.body}
                    </p>

                    {item.link && (
                      <a
                        href={item.link}
                        target='_blank'
                        rel='noreferrer'
                        className='inline-flex items-center gap-1 text-[10px] font-bold text-[#002EFF] hover:underline'
                        onClick={(e) => e.stopPropagation()}
                      >
                        View Attachment/Link <ExternalLink size={10} />
                      </a>
                    )}
                  </div>
                </div>

                <span className='text-[9px] font-semibold text-slate-400 shrink-0'>
                  {new Date(item.createdAt).toLocaleString()}
                </span>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  )
}