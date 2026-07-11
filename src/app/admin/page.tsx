// 'use client'

// import React, { useState, useEffect } from 'react'
// import { motion, AnimatePresence } from 'framer-motion'
// import {
//   LayoutDashboard,
//   Users,
//   Database,
//   BookOpen,
//   BookOpenCheck,
//   BarChart3,
//   ShieldCheck,
//   Activity,
//   Megaphone,
//   Trophy,
//   CreditCard,
//   Settings as SettingsIcon,
//   LogOut,
//   Menu,
//   Bell,
//   GraduationCap,
//   AlertTriangle,
//   Search,
//   X,
// } from 'lucide-react'

// // UI Components
// import { Button } from '@/components/ui/button'
// import { Input } from '@/components/ui/input'
// import { Badge } from '@/components/ui/badge'

// // --- FEATURE IMPORTS ---
// import SuperDashboard from './components/SuperDashboard'
// import ExamBuilder from './components/ExamBuilder' // Formerly QuestionBank
// import MyQuizzes from './components/myQuizzes' // Formerly ExamBuilder
// import Library from './components/Library'
// import Analytics from './components/Analytics'
// import StudentManagement from './components/StudentManagement'
// import LiveMonitoring from './components/LiveMonitoring'
// import Announcements from './components/Announcements'
// import Leaderboard from './components/Leaderboard'
// import RevenueControls from './components/RevenueControls'
// import RolesPermissions from './components/RolesPermissions'
// import Settings from './components/Settings'

// type AdminTab =
//   | 'dashboard'
//   | 'exam-builder'
//   | 'library'
//   | 'my-quizzes'
//   | 'analytics'
//   | 'students'
//   | 'monitoring'
//   | 'broadcast'
//   | 'leaderboard'
//   | 'revenue'
//   | 'roles'
//   | 'settings'

// export default function AdminAdmin() {
//   const [mounted, setMounted] = useState(false)
//   const [isSidebarOpen, setIsSidebarOpen] = useState(false)
//   const [activeTab, setActiveTab] = useState<AdminTab>('dashboard')

//   useEffect(() => {
//     setMounted(true)
//   }, [])

//   const sidebarGroups = [
//     {
//       group: 'Management',
//       items: [
//         {
//           id: 'dashboard' as AdminTab,
//           label: 'Dashboard',
//           icon: LayoutDashboard,
//         },
//         {
//           id: 'exam-builder' as AdminTab,
//           label: 'Exam Builder',
//           icon: Database,
//         },
//         { id: 'my-quizzes' as AdminTab, label: 'My Quizzes', icon: BookOpen },
//         { id: 'library' as AdminTab, label: 'Library', icon: BookOpenCheck },
//       ],
//     },
//     {
//       group: 'Operations',
//       items: [
//         { id: 'analytics' as AdminTab, label: 'Analytics', icon: BarChart3 },
//         { id: 'students' as AdminTab, label: 'Students', icon: Users },
//         {
//           id: 'monitoring' as AdminTab,
//           label: 'Live Monitoring',
//           icon: Activity,
//         },
//       ],
//     },
//     {
//       group: 'Finance & Engagement',
//       items: [
//         {
//           id: 'broadcast' as AdminTab,
//           label: 'Announcements',
//           icon: Megaphone,
//         },
//         { id: 'leaderboard' as AdminTab, label: 'Leaderboard', icon: Trophy },
//         { id: 'revenue' as AdminTab, label: 'Revenue', icon: CreditCard },
//       ],
//     },
//     {
//       group: 'System',
//       items: [
//         { id: 'roles' as AdminTab, label: 'Permissions', icon: ShieldCheck },
//         { id: 'settings' as AdminTab, label: 'Settings', icon: SettingsIcon },
//       ],
//     },
//   ]

//   const renderContent = () => {
//     switch (activeTab) {
//       case 'dashboard':
//         return <SuperDashboard />
//       case 'exam-builder':
//         return <ExamBuilder />
//       case 'my-quizzes':
//         return <MyQuizzes />
//       case 'library':
//         return <Library />
//       case 'analytics':
//         return <Analytics />
//       case 'students':
//         return <StudentManagement />
//       case 'monitoring':
//         return <LiveMonitoring />
//       case 'broadcast':
//         return <Announcements />
//       case 'leaderboard':
//         return <Leaderboard />
//       case 'revenue':
//         return <RevenueControls />
//       case 'roles':
//         return <RolesPermissions />
//       case 'settings':
//         return <Settings />
//       default:
//         return <Error404 tabId={activeTab} />
//     }
//   }

//   const SidebarContent = () => (
//     <div className='flex flex-col h-full py-8 px-4'>
//       <div className='flex items-center justify-between mb-10 px-2'>
//         <div className='flex items-center gap-3'>
//           <div className='bg-[#FCB900] p-1.5 rounded-lg shadow-lg shadow-[#FCB900]/20'>
//             <GraduationCap className='text-[#002EFF]' size={20} />
//           </div>
//           <div className='flex flex-col'>
//             <span className='text-white font-black text-sm tracking-tighter uppercase leading-none'>
//               DSA.<span className='text-yellow-400'>Admin</span>
//             </span>
//             <Badge className='bg-blue-500/30 text-blue-100 text-[8px] py-0 h-4 w-fit mt-1 border-none font-bold'>
//               SUPER ADMIN
//             </Badge>
//           </div>
//         </div>
//         <button
//           onClick={() => setIsSidebarOpen(false)}
//           className='lg:hidden p-2 text-white/50 hover:text-white'
//         >
//           <X size={20} />
//         </button>
//       </div>

//       <nav className='flex-1 space-y-6 overflow-y-auto pr-2 nav-custom-scrollbar'>
//         {sidebarGroups.map((group, idx) => (
//           <div key={idx} className='space-y-1.5'>
//             <h3 className='px-4 text-[9px] font-black uppercase tracking-[0.2em] text-blue-200/40'>
//               {group.group}
//             </h3>
//             {group.items.map((item) => (
//               <button
//                 key={item.id}
//                 onClick={() => {
//                   setActiveTab(item.id)
//                   setIsSidebarOpen(false)
//                 }}
//                 className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
//                   activeTab === item.id
//                     ? 'bg-[#FCB900] text-[#002EFF] font-black shadow-xl shadow-[#FCB900]/20 scale-[1.02]'
//                     : 'text-white/60 hover:bg-white/10 hover:text-white'
//                 }`}
//               >
//                 <item.icon
//                   size={16}
//                   className={
//                     activeTab === item.id
//                       ? 'animate-pulse'
//                       : 'opacity-70 group-hover:scale-110 transition-transform'
//                   }
//                 />
//                 <span className='text-[11px] uppercase tracking-wider font-bold'>
//                   {item.label}
//                 </span>
//               </button>
//             ))}
//           </div>
//         ))}
//       </nav>

//       <div className='mt-auto pt-6 border-t border-white/10'>
//         <button className='w-full flex items-center gap-3 px-4 py-3 rounded-xl text-rose-200/50 hover:bg-rose-500 hover:text-white transition-all group font-bold text-[11px] uppercase tracking-widest'>
//           <LogOut
//             size={16}
//             className='group-hover:-translate-x-1 transition-transform'
//           />
//           Sign Out
//         </button>
//       </div>
//     </div>
//   )

//   return (
//     <div className='flex h-screen bg-[#F8FAFF] overflow-hidden font-sans selection:bg-blue-100'>
//       {mounted && (
//         <style
//           dangerouslySetInnerHTML={{
//             __html: `
//             .nav-custom-scrollbar::-webkit-scrollbar { width: 4px; }
//             .nav-custom-scrollbar::-webkit-scrollbar-thumb { background: #fcb900; border-radius: 10px; }
//             .main-scrollbar::-webkit-scrollbar { width: 6px; }
//             .main-scrollbar::-webkit-scrollbar-thumb { background: #002EFF; border-radius: 10px; }
//           `,
//           }}
//         />
//       )}

//       <AnimatePresence>
//         {isSidebarOpen && (
//           <>
//             <motion.div
//               initial={{ opacity: 0 }}
//               animate={{ opacity: 1 }}
//               exit={{ opacity: 0 }}
//               onClick={() => setIsSidebarOpen(false)}
//               className='fixed inset-0 bg-[#002EFF]/20 backdrop-blur-sm z-60 lg:hidden'
//             />
//             <motion.aside
//               initial={{ x: '-100%' }}
//               animate={{ x: 0 }}
//               exit={{ x: '-100%' }}
//               transition={{ type: 'spring', damping: 25, stiffness: 200 }}
//               className='fixed inset-y-0 left-0 w-72 bg-[#002EFF] z-70 lg:hidden shadow-2xl'
//             >
//               <SidebarContent />
//             </motion.aside>
//           </>
//         )}
//       </AnimatePresence>

//       <aside className='hidden lg:flex w-64 bg-[#002EFF] m-4 rounded-[2.5rem] flex-col shadow-2xl border border-blue-400/20 shrink-0'>
//         <SidebarContent />
//       </aside>

//       <main className='flex-1 flex flex-col min-w-0 overflow-hidden lg:py-4 lg:pr-4'>
//         <header className='flex items-center justify-between px-6 py-4'>
//           <div className='flex items-center gap-4'>
//             <button
//               onClick={() => setIsSidebarOpen(true)}
//               className='lg:hidden p-2 text-[#002EFF] bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors'
//             >
//               <Menu size={20} />
//             </button>
//             <div className='relative hidden md:block w-64 xl:w-80 group'>
//               <Search
//                 className='absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-[#002EFF]'
//                 size={14}
//               />
//               <Input
//                 className='pl-9 bg-white border-zinc-100 rounded-xl focus-visible:ring-[#002EFF]/20 shadow-sm text-xs'
//                 placeholder='Search administration...'
//               />
//             </div>
//           </div>

//           <div className='flex items-center gap-4'>
//             <div className='hidden sm:flex items-center gap-2 px-3 py-1.5 bg-white rounded-xl border border-zinc-100 shadow-sm'>
//               <div className='w-2 h-2 bg-emerald-500 rounded-full animate-pulse' />
//               <span className='text-[9px] font-black uppercase text-zinc-500'>
//                 System Live
//               </span>
//             </div>
//             <Button
//               variant='ghost'
//               size='icon'
//               className='relative text-zinc-400 hover:text-blue-600 bg-white rounded-xl shadow-sm border border-zinc-100'
//             >
//               <Bell size={18} />
//               <span className='absolute top-2.5 right-2.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white' />
//             </Button>
//             <div className='flex items-center gap-3 pl-3 border-l border-zinc-200'>
//               <div className='text-right hidden xs:block'>
//                 <p className='text-[10px] font-black text-zinc-900 leading-none uppercase tracking-tighter'>
//                   Hilosthone S.
//                 </p>
//                 <p className='text-[9px] text-blue-600 font-bold uppercase mt-1'>
//                   Admin Authority
//                 </p>
//               </div>
//               <div className='w-10 h-10 rounded-2xl bg-[#002EFF] text-[#FCB900] flex items-center justify-center font-black shadow-lg shadow-blue-600/20 border-2 border-white cursor-pointer hover:scale-105 transition-transform'>
//                 AD
//               </div>
//             </div>
//           </div>
//         </header>

//         <div className='flex-1 overflow-y-auto px-4 md:px-6 pb-6 main-scrollbar'>
//           <div className='max-w-[1600px] mx-auto'>
//             <AnimatePresence mode='wait'>
//               <motion.div
//                 key={activeTab}
//                 initial={{ opacity: 0, y: 10 }}
//                 animate={{ opacity: 1, y: 0 }}
//                 exit={{ opacity: 0, y: -10 }}
//                 transition={{ duration: 0.2 }}
//               >
//                 {renderContent()}
//               </motion.div>
//             </AnimatePresence>
//           </div>
//         </div>
//       </main>
//     </div>
//   )
// }

// function Error404({ tabId }: { tabId: string }) {
//   return (
//     <div className='flex flex-col items-center justify-center min-h-[50vh] text-center bg-white rounded-[2.5rem] border border-dashed border-zinc-200 p-8'>
//       <div className='w-16 h-16 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center mb-4 border border-rose-100 shadow-inner'>
//         <AlertTriangle size={32} />
//       </div>
//       <h2 className='text-sm font-black text-slate-900 uppercase tracking-widest'>
//         Admin Endpoint Missing
//       </h2>
//       <p className='text-[10px] text-slate-500 mt-2 max-w-[200px] font-bold'>
//         The module <span className='text-blue-600'>"{tabId}"</span> has not been
//         initialized in the Admin core.
//       </p>
//     </div>
//   )
// }

'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation' 
import {
  LayoutDashboard,
  Users,
  Database,
  BookOpen,
  BookOpenCheck,
  BarChart3,
  ShieldCheck,
  Activity,
  Megaphone,
  Trophy,
  CreditCard,
  Settings as SettingsIcon,
  LogOut,
  Menu,
  Bell,
  GraduationCap,
  AlertTriangle,
  Search,
  X,
} from 'lucide-react'

// UI Components
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'

// --- FEATURE IMPORTS ---
import AdminGuide from './components/AdminGuide'
import ExamBuilder from './components/examBuilder/index'
import MyQuizzes from '../admin/components/myQuizzes/page'
import Library from './components/Library'
import Analytics from './components/Analytics'
import StudentManagement from './components/StudentManagement'
import LiveMonitoring from './components/LiveMonitoring'
import Announcements from './components/Announcements'
import Leaderboard from './components/Leaderboard'
import RevenueControls from './components/RevenueControls'
import RolesPermissions from './components/RolesPermissions'
import Settings from './components/Settings'
import { AnimatePresence, motion } from 'framer-motion'

type AdminTab =
  | 'dashboard'
  | 'exam-builder'
  | 'library'
  | 'my-quizzes'
  | 'analytics'
  | 'students'
  | 'monitoring'
  | 'broadcast'
  | 'leaderboard'
  | 'revenue'
  | 'roles'
  | 'settings'

export default function AdminAdmin() {
  const [mounted, setMounted] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard')
  const router = useRouter()

  useEffect(() => {
    // 1. Check for Auth
    const userRole = localStorage.getItem('user_role')

    if (userRole !== 'super_admin') {
      // If not admin, kick them out
      router.push('/unauthorized')
    } else {
      // 2. Only mount if they ARE admin
      setMounted(true)
    }
  }, [router])

  // Guard against unauthorized access and SSR hydration mismatch
  if (!mounted) {
    return (
      <div className='h-screen w-full bg-[#002EFF] flex items-center justify-center'>
        <div className='flex flex-col items-center gap-4'>
          <GraduationCap className='text-[#FCB900] animate-bounce' size={48} />
          <p className='text-white font-black text-xs tracking-widest uppercase italic'>
            Verifying Authority...
          </p>
        </div>
      </div>
    )
  }

  const sidebarGroups = [
    {
      group: 'Management',
      items: [
        {
          id: 'dashboard' as AdminTab,
          label: 'Dashboard',
          icon: LayoutDashboard,
        },
        {
          id: 'exam-builder' as AdminTab,
          label: 'Exam Builder',
          icon: Database,
        },
        { id: 'my-quizzes' as AdminTab, label: 'My Quizzes', icon: BookOpen },
        { id: 'library' as AdminTab, label: 'Library', icon: BookOpenCheck },
      ],
    },
    {
      group: 'Operations',
      items: [
        { id: 'analytics' as AdminTab, label: 'Analytics', icon: BarChart3 },
        { id: 'students' as AdminTab, label: 'Students', icon: Users },
        {
          id: 'monitoring' as AdminTab,
          label: 'Live Monitoring',
          icon: Activity,
        },
      ],
    },
    {
      group: 'Finance & Engagement',
      items: [
        {
          id: 'broadcast' as AdminTab,
          label: 'Announcements',
          icon: Megaphone,
        },
        { id: 'leaderboard' as AdminTab, label: 'Leaderboard', icon: Trophy },
        { id: 'revenue' as AdminTab, label: 'Revenue', icon: CreditCard },
      ],
    },
    {
      group: 'System',
      items: [
        { id: 'roles' as AdminTab, label: 'Permissions', icon: ShieldCheck },
        { id: 'settings' as AdminTab, label: 'Settings', icon: SettingsIcon },
      ],
    },
  ]

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <AdminGuide onNavigate={(tab: AdminTab) => setActiveTab(tab)} />
      case 'exam-builder':
        return <ExamBuilder onBack={() => setActiveTab('my-quizzes')} />
      case 'my-quizzes':
        return <MyQuizzes />
      case 'library':
        return <Library />
      case 'analytics':
        return <Analytics />
      case 'students':
        return <StudentManagement />
      case 'monitoring':
        return <LiveMonitoring />
      case 'broadcast':
        return <Announcements />
      case 'leaderboard':
        return <Leaderboard />
      case 'revenue':
        return <RevenueControls />
      case 'roles':
        return <RolesPermissions />
      case 'settings':
        return <Settings />
      default:
        return <Error404 tabId={activeTab} />
    }
  }

  const SidebarContent = () => (
    <div className='flex flex-col h-full py-8 px-4'>
      <div className='flex items-center justify-between mb-10 px-2'>
        <div className='flex items-center gap-3'>
          <div className='bg-[#FCB900] p-1.5 rounded-lg shadow-lg shadow-[#FCB900]/20'>
            <GraduationCap className='text-[#002EFF]' size={20} />
          </div>
          <div className='flex flex-col'>
            <span className='text-white font-black text-sm tracking-tighter uppercase leading-none'>
              DSA.<span className='text-yellow-400'>Admin</span>
            </span>
            <Badge className='bg-blue-500/30 text-blue-100 text-[8px] py-0 h-4 w-fit mt-1 border-none font-bold'>
              SUPER ADMIN
            </Badge>
          </div>
        </div>
        <button
          onClick={() => setIsSidebarOpen(false)}
          className='lg:hidden p-2 text-white/50 hover:text-white'
        >
          <X size={20} />
        </button>
      </div>

      <nav className='flex-1 space-y-6 overflow-y-auto pr-2 nav-custom-scrollbar'>
        {sidebarGroups.map((group, idx) => (
          <div key={idx} className='space-y-1.5'>
            <h3 className='px-4 text-[9px] font-black uppercase tracking-[0.2em] text-blue-200/40'>
              {group.group}
            </h3>
            {group.items.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id)
                  setIsSidebarOpen(false)
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                  activeTab === item.id
                    ? 'bg-[#FCB900] text-[#002EFF] font-black shadow-xl shadow-[#FCB900]/20 scale-[1.02]'
                    : 'text-white/60 hover:bg-white/10 hover:text-white'
                }`}
              >
                <item.icon
                  size={16}
                  className={
                    activeTab === item.id
                      ? 'animate-pulse'
                      : 'opacity-70 group-hover:scale-110 transition-transform'
                  }
                />
                <span className='text-[11px] uppercase tracking-wider font-bold'>
                  {item.label}
                </span>
              </button>
            ))}
          </div>
        ))}
      </nav>

      <div className='mt-auto pt-6 border-t border-white/10'>
        <button
          onClick={() => {
            localStorage.removeItem('user_role')
            router.push('/login')
          }}
          className='w-full flex items-center gap-3 px-4 py-3 rounded-xl text-rose-200/50 hover:bg-rose-500 hover:text-white transition-all group font-bold text-[11px] uppercase tracking-widest'
        >
          <LogOut
            size={16}
            className='group-hover:-translate-x-1 transition-transform'
          />
          Sign Out
        </button>
      </div>
    </div>
  )

  return (
    <div className='flex h-screen bg-[#F8FAFF] overflow-hidden font-sans selection:bg-blue-100'>
      <style
        dangerouslySetInnerHTML={{
          __html: `
          .nav-custom-scrollbar::-webkit-scrollbar { width: 4px; }
          .nav-custom-scrollbar::-webkit-scrollbar-thumb { background: #fcb900; border-radius: 10px; }
          .main-scrollbar::-webkit-scrollbar { width: 6px; }
          .main-scrollbar::-webkit-scrollbar-thumb { background: #002EFF; border-radius: 10px; }
        `,
        }}
      />

      <AnimatePresence>
        {isSidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSidebarOpen(false)}
              className='fixed inset-0 bg-[#002EFF]/20 backdrop-blur-sm z-60 lg:hidden'
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className='fixed inset-y-0 left-0 w-72 bg-[#002EFF] z-70 lg:hidden shadow-2xl'
            >
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <aside className='hidden lg:flex w-64 bg-[#002EFF] m-4 rounded-[2.5rem] flex-col shadow-2xl border border-blue-400/20 shrink-0'>
        <SidebarContent />
      </aside>

      <main className='flex-1 flex flex-col min-w-0 overflow-hidden lg:py-4 lg:pr-4'>
        <header className='flex items-center justify-between px-6 py-4'>
          <div className='flex items-center gap-4'>
            <button
              onClick={() => setIsSidebarOpen(true)}
              className='lg:hidden p-2 text-[#002EFF] bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors'
            >
              <Menu size={20} />
            </button>
            <div className='relative hidden md:block w-64 xl:w-80 group'>
              <Search
                className='absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-[#002EFF]'
                size={14}
              />
              <Input
                className='pl-9 bg-white border-zinc-100 rounded-xl focus-visible:ring-[#002EFF]/20 shadow-sm text-xs'
                placeholder='Search administration...'
              />
            </div>
          </div>

          <div className='flex items-center gap-4'>
            <div className='hidden sm:flex items-center gap-2 px-3 py-1.5 bg-white rounded-xl border border-zinc-100 shadow-sm'>
              <div className='w-2 h-2 bg-emerald-500 rounded-full animate-pulse' />
              <span className='text-[9px] font-black uppercase text-zinc-500'>
                System Live
              </span>
            </div>
            <Button
              variant='ghost'
              size='icon'
              className='relative text-zinc-400 hover:text-blue-600 bg-white rounded-xl shadow-sm border border-zinc-100'
            >
              <Bell size={18} />
              <span className='absolute top-2.5 right-2.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white' />
            </Button>
            <div className='flex items-center gap-3 pl-3 border-l border-zinc-200'>
              <div className='text-right hidden xs:block'>
                <p className='text-[10px] font-black text-zinc-900 leading-none uppercase tracking-tighter'>
                  Hilosthone S.
                </p>
                <p className='text-[9px] text-blue-600 font-bold uppercase mt-1'>
                  Admin Authority
                </p>
              </div>
              <div className='w-10 h-10 rounded-2xl bg-[#002EFF] text-[#FCB900] flex items-center justify-center font-black shadow-lg shadow-blue-600/20 border-2 border-white cursor-pointer hover:scale-105 transition-transform'>
                AD
              </div>
            </div>
          </div>
        </header>

        <div className='flex-1 overflow-y-auto px-4 md:px-6 pb-6 main-scrollbar'>
          <div className='max-w-400 mx-auto'>
            <AnimatePresence mode='wait'>
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                {renderContent()}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </main>
    </div>
  )
}

function Error404({ tabId }: { tabId: string }) {
  return (
    <div className='flex flex-col items-center justify-center min-h-[50vh] text-center bg-white rounded-[2.5rem] border border-dashed border-zinc-200 p-8'>
      <div className='w-16 h-16 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center mb-4 border border-rose-100 shadow-inner'>
        <AlertTriangle size={32} />
      </div>
      <h2 className='text-sm font-black text-slate-900 uppercase tracking-widest'>
        Admin Endpoint Missing
      </h2>
      <p className='text-[10px] text-slate-500 mt-2 max-w-64 font-bold'>
        The module <span className='text-blue-600'>"{tabId}"</span> has not been
        initialized in the Admin core.
      </p>
    </div>
  )
}