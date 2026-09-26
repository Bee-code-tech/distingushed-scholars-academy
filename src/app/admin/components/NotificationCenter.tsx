
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