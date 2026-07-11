'use client'

import { useState } from 'react'
import {
  LayoutDashboard,
  BookOpen,
  Trophy,
  User,
  Settings,
  LogOut,
  Bell,
  Menu,
  X,
} from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

const navItems = [
  { icon: LayoutDashboard, label: 'Overview', href: '/dashboard' },
  { icon: BookOpen, label: 'Quizzes', href: '/quizzes' },
  { icon: Trophy, label: 'Leaderboard', href: '/leaderboard' },
  { icon: User, label: 'Profile', href: '/profile' },
  { icon: Settings, label: 'Settings', href: '/settings' },
]

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pathname = usePathname()

  return (
    <div className='min-h-screen bg-[#F0F4FF] flex'>
      {/* Sidebar for Desktop */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-blue-50 transform transition-transform duration-300 ease-in-out md:translate-x-0 md:static md:inset-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className='h-full flex flex-col p-6'>
          <div className='flex items-center gap-3 mb-10 px-2'>
            <div className='bg-[#002EFF] p-2 rounded-xl text-white'>
              <BookOpen size={24} />
            </div>
            <span className='font-black text-xl tracking-tighter uppercase'>
              DSA Academy
            </span>
          </div>

          <nav className='flex-1 space-y-2'>
            {navItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 rounded-2xl font-bold text-sm transition-all',
                  pathname === item.href
                    ? 'bg-[#002EFF] text-white shadow-lg shadow-blue-100'
                    : 'text-gray-400 hover:bg-gray-50 hover:text-[#002EFF]',
                )}
              >
                <item.icon size={20} />
                {item.label}
              </Link>
            ))}
          </nav>

          <button className='flex items-center gap-3 px-4 py-3 rounded-2xl font-bold text-sm text-red-400 hover:bg-red-50 transition-all mt-auto'>
            <LogOut size={20} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className='flex-1 flex flex-col min-w-0 overflow-hidden'>
        {/* Top Navbar */}
        <header className='h-20 bg-white/80 backdrop-blur-md border-b border-blue-50 flex items-center justify-between px-6 md:px-10 sticky top-0 z-40'>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className='md:hidden p-2'
          >
            {sidebarOpen ? <X /> : <Menu />}
          </button>

          <div className='hidden md:block'>
            <h2 className='font-black text-gray-900 uppercase text-xs tracking-widest'>
              Dashboard Overview
            </h2>
          </div>

          <div className='flex items-center gap-4'>
            <button className='p-2 bg-gray-50 rounded-xl text-gray-400 hover:text-[#002EFF] relative'>
              <Bell size={20} />
              <span className='absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white' />
            </button>
            <div className='flex items-center gap-3 pl-4 border-l border-gray-100'>
              <div className='text-right hidden sm:block'>
                <p className='text-xs font-black uppercase text-gray-900 leading-none'>
                  Omoniyi J.
                </p>
                <p className='text-[10px] font-bold text-[#002EFF] uppercase'>
                  JAMB Candidate
                </p>
              </div>
              <div className='w-10 h-10 rounded-xl bg-blue-100 border-2 border-white shadow-sm' />
            </div>
          </div>
        </header>

        {/* Dynamic Content */}
        <div className='p-6 md:p-10 overflow-y-auto'>{children}</div>
      </main>
    </div>
  )
}
