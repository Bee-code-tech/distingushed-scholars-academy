// 'use client'

// import { useState, useEffect } from 'react'
// import Link from 'next/link'
// import {
//   LayoutDashboard,
//   Zap,
//   BookOpen,
//   Trophy,
//   Calendar,
//   Settings,
//   LogOut,
//   Menu,
//   Search,
//   GraduationCap,
//   Rocket,
//   Bell,
//   Library,
//   History,
//   Users,
//   Lock,
// } from 'lucide-react'

// // UI Components
// import { Button } from '@/components/ui/button'
// import {
//   Sheet,
//   SheetContent,
//   SheetTrigger,
//   SheetTitle,
// } from '@/components/ui/sheet'
// import { Input } from '@/components/ui/input'
// import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
// import { Badge } from '@/components/ui/badge'

// // Page Components
// import SyllabusMastery from './syllabus/page'
// import ExamSimulator from './simulator/page'
// import Quiz360Portal from './quiz360/page'
// import GlobalRankings from './rankings/page'
// import ExamSchedule from './schedule/page'
// import SettingsView from './settings/page'
// import OverviewUI from './OverviewUI'
// import ResourcesView from './resources/page'
// import QuizHistoryView from './history/page'
// import CommunityView from './community/page'

// type ViewState =
//   | 'overview'
//   | 'syllabus'
//   | 'simulator'
//   | 'rankings'
//   | 'schedule'
//   | 'settings'
//   | 'quiz360'
//   | 'resources'
//   | 'history'
//   | 'community'

// export default function AcademyDashboard() {
//   const [mounted, setMounted] = useState(false)
//   const [activeView, setActiveView] = useState<ViewState>('overview')
//   const [isSheetOpen, setIsSheetOpen] = useState(false)

//   // UseEffect to handle hydration
//   useEffect(() => {
//     setMounted(true)
//   }, [])

//   const [user] = useState({
//     name: 'Hilosthone S.',
//     isDSAite: true,
//     status: 'Pro Student',
//   })

//   const navigation = [
//     { icon: LayoutDashboard, label: 'Overview', view: 'overview' as ViewState },
//     { icon: Library, label: 'E-Learning', view: 'resources' as ViewState },
//     { icon: Zap, label: 'Syllabus Mastery', view: 'syllabus' as ViewState },
//     { icon: BookOpen, label: 'Exam Simulator', view: 'simulator' as ViewState },
//     { icon: Rocket, label: 'Quiz360 Pro', view: 'quiz360' as ViewState },
//     { icon: History, label: 'Quiz History', view: 'history' as ViewState },
//     {
//       icon: Users,
//       label: 'Community',
//       view: 'community' as ViewState,
//       premium: true,
//     },
//     { icon: Trophy, label: 'Global Rankings', view: 'rankings' as ViewState },
//     { icon: Calendar, label: 'Exam Schedule', view: 'schedule' as ViewState },
//     { icon: Settings, label: 'Settings', view: 'settings' as ViewState },
//   ]

//   const NavItem = ({
//     icon: Icon,
//     label,
//     view,
//     premium,
//   }: {
//     icon: any
//     label: string
//     view: ViewState
//     premium?: boolean
//   }) => {
//     const isLocked = premium && !user.isDSAite

//     return (
//       <button
//         disabled={isLocked}
//         onClick={() => {
//           setActiveView(view)
//           setIsSheetOpen(false)
//         }}
//         className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 group ${
//           activeView === view
//             ? 'bg-[#FCB900] text-[#002EFF] font-black shadow-lg shadow-[#FCB900]/20'
//             : isLocked
//               ? 'opacity-50 cursor-not-allowed'
//               : 'text-white/60 hover:bg-white/10 hover:text-white'
//         }`}
//       >
//         <div className='flex items-center gap-3'>
//           <Icon
//             size={18}
//             className={
//               activeView === view
//                 ? 'animate-pulse'
//                 : 'group-hover:scale-110 transition-transform'
//             }
//           />
//           <span className='text-[11px] uppercase tracking-wider font-bold'>
//             {label}
//           </span>
//         </div>
//         {isLocked && <Lock size={12} className='text-white/40' />}
//       </button>
//     )
//   }

//   const SidebarContent = () => (
//     <div className='flex flex-col h-full py-6 px-4'>
//       <div className='flex items-center gap-3 mb-10 px-2'>
//         <div className='bg-[#FCB900] p-1.5 rounded-lg'>
//           <GraduationCap className='text-[#002EFF]' size={20} />
//         </div>
//         <div className='flex flex-col'>
//           <span className='text-white font-black text-sm tracking-tighter uppercase leading-none'>
//             DSA.Portal
//           </span>
//           {user.isDSAite && (
//             <Badge className='bg-yellow-400 text-[#002EFF] text-[8px] py-0 h-4 w-fit mt-1'>
//               DSAite
//             </Badge>
//           )}
//         </div>
//       </div>

//       <nav className='flex-1 space-y-1 overflow-y-auto pr-2 nav-custom-scrollbar'>
//         {navigation.map((item) => (
//           <NavItem key={item.view} {...item} />
//         ))}
//       </nav>

//       <div className='mt-auto pt-6 border-t border-white/10'>
//         <button className='w-full flex items-center gap-3 px-4 py-3 rounded-xl text-white/50 hover:bg-rose-500/10 hover:text-rose-400 transition-all group'>
//           <LogOut
//             size={18}
//             className='group-hover:-translate-x-1 transition-transform'
//           />
//           <span className='text-[11px] uppercase tracking-wider font-bold'>
//             <Link href='/signin'>Logout</Link>
//           </span>
//         </button>
//       </div>
//     </div>
//   )

//   return (
//     <div className='flex h-screen bg-[#F8FAFF] overflow-hidden font-sans selection:bg-blue-100'>
//       {/* Global Style Injection only on Client to prevent Hydration Error */}
//       {mounted && (
//         <style dangerouslySetInnerHTML={{ __html: `
//             .custom-scrollbar::-webkit-scrollbar {
//               width: 6px;
//             }
//             .custom-scrollbar::-webkit-scrollbar-track {
//               background: transparent;
//             }
//             .custom-scrollbar::-webkit-scrollbar-thumb {
//               background: #002EFF;
//               border-radius: 10px;
//             }
//             .custom-scrollbar::-webkit-scrollbar-thumb:hover {
//               background: #FCB900;
//             }

//             .nav-custom-scrollbar::-webkit-scrollbar {
//               width: 4px;
//             }
//             .nav-custom-scrollbar::-webkit-scrollbar-track {
//               background: rgba(255, 255, 255, 0.05);
//             }
//             .nav-custom-scrollbar::-webkit-scrollbar-thumb {
//               background: #fcb900;
//               border-radius: 10px;
//             }
//           `}} />
//       )}

//       <aside className='hidden lg:flex w-64 bg-[#002EFF] m-4 rounded-[2.5rem] flex-col shadow-2xl border border-blue-400/20'>
//         <SidebarContent />
//       </aside>

//       <main className='flex-1 flex flex-col min-w-0 overflow-hidden lg:py-4 lg:pr-4'>
//         <header className='flex items-center justify-between px-6 py-4'>
//           <div className='flex items-center gap-4'>
//             <div className='lg:hidden'>
//               <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
//                 <SheetTrigger asChild>
//                   <Button
//                     variant='ghost'
//                     size='icon'
//                     className='text-[#002EFF] hover:bg-blue-50'
//                   >
//                     <Menu size={24} />
//                   </Button>
//                 </SheetTrigger>
//                 <SheetContent
//                   side='left'
//                   className='bg-[#002EFF] p-0 border-none w-72'
//                 >
//                   <SheetTitle className='sr-only'>Menu Navigation</SheetTitle>
//                   <SidebarContent />
//                 </SheetContent>
//               </Sheet>
//             </div>

//             <div className='relative hidden md:block w-64 xl:w-80 group'>
//               <Search
//                 className='absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-[#002EFF] transition-colors'
//                 size={14}
//               />
//               <Input
//                 className='pl-9 bg-white border-zinc-100 rounded-xl focus-visible:ring-[#002EFF]/20 shadow-sm'
//                 placeholder='Search modules...'
//               />
//             </div>
//           </div>

//           <div className='flex items-center gap-3'>
//             <Button
//               variant='ghost'
//               size='icon'
//               className='relative text-zinc-400 hover:text-blue-600'
//             >
//               <Bell size={18} />
//               <span className='absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-white' />
//             </Button>

//             <div className='flex items-center gap-3 pl-3 border-l border-zinc-200'>
//               <div className='text-right hidden sm:block'>
//                 <p className='text-[10px] font-black text-zinc-900 leading-none'>
//                   {user.name}
//                 </p>
//                 <p className='text-[9px] text-zinc-400 font-bold uppercase'>
//                   {user.isDSAite ? 'DSAite Member' : 'Guest Student'}
//                 </p>
//               </div>
//               <Avatar className='h-9 w-9 border-2 border-white shadow-md'>
//                 <AvatarImage src='https://github.com/shadcn.png' />
//                 <AvatarFallback>HS</AvatarFallback>
//               </Avatar>
//             </div>
//           </div>
//         </header>

//         <div className='flex-1 overflow-y-auto px-6 pb-6 custom-scrollbar'>
//           <div className='max-w-[1600px] mx-auto'>
//             {activeView === 'overview' && (
//               <OverviewUI setView={setActiveView} isDSAite={user.isDSAite} />
//             )}
//             {activeView === 'resources' && (
//               <ResourcesView isDSAite={user.isDSAite} />
//             )}
//             {activeView === 'syllabus' && <SyllabusMastery />}
//             {activeView === 'simulator' && <ExamSimulator />}
//             {activeView === 'quiz360' && <Quiz360Portal />}
//             {activeView === 'history' && <QuizHistoryView />}
//             {activeView === 'community' && <CommunityView />}
//             {activeView === 'rankings' && <GlobalRankings />}
//             {activeView === 'schedule' && <ExamSchedule />}
//             {activeView === 'settings' && <SettingsView />}
//           </div>
//         </div>
//       </main>
//     </div>
//   )
// }

'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
  LayoutDashboard,
  Zap,
  BookOpen,
  Trophy,
  Calendar,
  Settings,
  LogOut,
  Menu,
  Search,
  GraduationCap,
  Rocket,
  Bell,
  Library,
  History,
  Users,
  Lock,
  Loader2,
} from 'lucide-react'

// API Utility
import { dsaApi } from '@/lib/api'

// UI Components
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from '@/components/ui/sheet'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'

// Page Components
import SyllabusMastery from './syllabus/page'
import ExamSimulator from './simulator/page'
import Quiz360Portal from './quiz360/page'
import GlobalRankings from './rankings/page'
import ExamSchedule from './schedule/page'
import SettingsView from './settings/page'
import OverviewUI from './OverviewUI'
import ResourcesView from './resources/page'
import QuizHistoryView from './history/page'
import CommunityView from './community/page'

type ViewState =
  | 'overview'
  | 'syllabus'
  | 'simulator'
  | 'rankings'
  | 'schedule'
  | 'settings'
  | 'quiz360'
  | 'resources'
  | 'history'
  | 'community'

export default function AcademyDashboard() {
  const [mounted, setMounted] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [activeView, setActiveView] = useState<ViewState>('overview')
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const router = useRouter()

  const [user, setUser] = useState({
    name: 'Student',
    isDSAite: false,
    email: '',
    avatar: '',
  })

  // Memoized logout to prevent unnecessary re-renders
  const handleLogout = useCallback(() => {
    localStorage.removeItem('dsa_token')
    router.push('/auth/signin')
  }, [router])

  useEffect(() => {
    setMounted(true)

    const initDashboard = async () => {
      const token = localStorage.getItem('dsa_token')

      if (!token) {
        router.push('/auth/signin')
        return
      }

      try {
        // FIXED: Passing token as the required argument
        const profile = await dsaApi.auth.getProfile(token)

        setUser({
          name: profile.fullName || profile.username || 'Student',
          isDSAite: profile.isDSAite || false,
          email: profile.email,
          avatar:
            profile.avatarUrl ||
            `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.username || 'default'}`,
        })
      } catch (error) {
        console.error('Session validation failed:', error)
        handleLogout()
      } finally {
        setIsLoading(false)
      }
    }

    initDashboard()
  }, [router, handleLogout])

  const navigation = [
    { icon: LayoutDashboard, label: 'Overview', view: 'overview' as ViewState },
    { icon: Library, label: 'E-Learning', view: 'resources' as ViewState },
    { icon: Zap, label: 'Syllabus Mastery', view: 'syllabus' as ViewState },
    { icon: BookOpen, label: 'Exam Simulator', view: 'simulator' as ViewState },
    { icon: Rocket, label: 'Quiz360 Pro', view: 'quiz360' as ViewState },
    { icon: History, label: 'Quiz History', view: 'history' as ViewState },
    {
      icon: Users,
      label: 'Community',
      view: 'community' as ViewState,
      premium: true,
    },
    { icon: Trophy, label: 'Global Rankings', view: 'rankings' as ViewState },
    { icon: Calendar, label: 'Exam Schedule', view: 'schedule' as ViewState },
    { icon: Settings, label: 'Settings', view: 'settings' as ViewState },
  ]

  const NavItem = ({
    icon: Icon,
    label,
    view,
    premium,
  }: {
    icon: any
    label: string
    view: ViewState
    premium?: boolean
  }) => {
    const isLocked = premium && !user.isDSAite

    return (
      <button
        disabled={isLocked}
        onClick={() => {
          setActiveView(view)
          setIsSheetOpen(false)
        }}
        className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 group ${
          activeView === view
            ? 'bg-[#FCB900] text-[#002EFF] font-black shadow-lg shadow-[#FCB900]/20'
            : isLocked
              ? 'opacity-50 cursor-not-allowed'
              : 'text-white/60 hover:bg-white/10 hover:text-white'
        }`}
      >
        <div className='flex items-center gap-3'>
          <Icon
            size={18}
            className={
              activeView === view
                ? 'animate-pulse'
                : 'group-hover:scale-110 transition-transform'
            }
          />
          <span className='text-[11px] uppercase tracking-wider font-bold'>
            {label}
          </span>
        </div>
        {isLocked && <Lock size={12} className='text-white/40' />}
      </button>
    )
  }

  const SidebarContent = () => (
    <div className='flex flex-col h-full py-6 px-4'>
      <div className='flex items-center gap-3 mb-10 px-2'>
        <div className='bg-[#FCB900] p-1.5 rounded-lg'>
          <GraduationCap className='text-[#002EFF]' size={20} />
        </div>
        <div className='flex flex-col'>
          <span className='text-white font-black text-sm tracking-tighter uppercase leading-none'>
            DSA.Portal
          </span>
          {user.isDSAite && (
            <Badge className='bg-yellow-400 text-[#002EFF] text-[8px] py-0 h-4 w-fit mt-1'>
              DSAite
            </Badge>
          )}
        </div>
      </div>

      <nav className='flex-1 space-y-1 overflow-y-auto pr-2 nav-custom-scrollbar'>
        {navigation.map((item) => (
          <NavItem key={item.view} {...item} />
        ))}
      </nav>

      <div className='mt-auto pt-6 border-t border-white/10'>
        <button
          onClick={handleLogout}
          className='w-full flex items-center gap-3 px-4 py-3 rounded-xl text-white/50 hover:bg-rose-500/10 hover:text-rose-400 transition-all group'
        >
          <LogOut
            size={18}
            className='group-hover:-translate-x-1 transition-transform'
          />
          <span className='text-[11px] uppercase tracking-wider font-bold'>
            Logout
          </span>
        </button>
      </div>
    </div>
  )

  if (isLoading && mounted) {
    return (
      <div className='h-screen w-full flex flex-col items-center justify-center bg-[#F8FAFF]'>
        <Loader2 className='text-[#002EFF] animate-spin mb-4' size={40} />
        <p className='text-[10px] font-black uppercase tracking-[0.2em] text-[#002EFF]'>
          Initializing Dashboard
        </p>
      </div>
    )
  }

  return (
    <div className='flex h-screen bg-[#F8FAFF] overflow-hidden font-sans selection:bg-blue-100'>
      {mounted && (
        <style
          dangerouslySetInnerHTML={{
            __html: `
            .custom-scrollbar::-webkit-scrollbar { width: 6px; }
            .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
            .custom-scrollbar::-webkit-scrollbar-thumb { background: #002EFF; border-radius: 10px; }
            .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #FCB900; }
            .nav-custom-scrollbar::-webkit-scrollbar { width: 4px; }
            .nav-custom-scrollbar::-webkit-scrollbar-track { background: rgba(255, 255, 255, 0.05); }
            .nav-custom-scrollbar::-webkit-scrollbar-thumb { background: #fcb900; border-radius: 10px; }
          `,
          }}
        />
      )}

      <aside className='hidden lg:flex w-64 bg-[#002EFF] m-4 rounded-[2.5rem] flex-col shadow-2xl border border-blue-400/20'>
        <SidebarContent />
      </aside>

      <main className='flex-1 flex flex-col min-w-0 overflow-hidden lg:py-4 lg:pr-4'>
        <header className='flex items-center justify-between px-6 py-4'>
          <div className='flex items-center gap-4'>
            <div className='lg:hidden'>
              <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                <SheetTrigger asChild>
                  <Button
                    variant='ghost'
                    size='icon'
                    className='text-[#002EFF] hover:bg-blue-50'
                  >
                    <Menu size={24} />
                  </Button>
                </SheetTrigger>
                <SheetContent
                  side='left'
                  className='bg-[#002EFF] p-0 border-none w-72'
                >
                  <SheetTitle className='sr-only'>Menu Navigation</SheetTitle>
                  <SidebarContent />
                </SheetContent>
              </Sheet>
            </div>

            <div className='relative hidden md:block w-64 xl:w-80 group'>
              <Search
                className='absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-[#002EFF] transition-colors'
                size={14}
              />
              <Input
                className='pl-9 bg-white border-zinc-100 rounded-xl focus-visible:ring-[#002EFF]/20 shadow-sm'
                placeholder='Search modules...'
              />
            </div>
          </div>

          <div className='flex items-center gap-3'>
            <Button
              variant='ghost'
              size='icon'
              className='relative text-zinc-400 hover:text-blue-600'
            >
              <Bell size={18} />
              <span className='absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-white' />
            </Button>

            <div className='flex items-center gap-3 pl-3 border-l border-zinc-200'>
              <div className='text-right hidden sm:block'>
                <p className='text-[10px] font-black text-zinc-900 leading-none'>
                  {user.name}
                </p>
                <p className='text-[9px] text-zinc-400 font-bold uppercase'>
                  {user.isDSAite ? 'DSAite Member' : 'Guest Student'}
                </p>
              </div>
              <Avatar className='h-9 w-9 border-2 border-white shadow-md'>
                <AvatarImage src={user.avatar} />
                <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
              </Avatar>
            </div>
          </div>
        </header>

        <div className='flex-1 overflow-y-auto px-6 pb-6 custom-scrollbar'>
          <div className='max-w-400 mx-auto'>
            {activeView === 'overview' && (
              <OverviewUI setView={setActiveView} isDSAite={user.isDSAite} />
            )}
            {activeView === 'resources' && (
              <ResourcesView isDSAite={user.isDSAite} />
            )}
            {activeView === 'syllabus' && <SyllabusMastery />}
            {activeView === 'simulator' && <ExamSimulator />}
            {activeView === 'quiz360' && <Quiz360Portal />}
            {activeView === 'history' && <QuizHistoryView />}
            {activeView === 'community' && <CommunityView />}
            {activeView === 'rankings' && <GlobalRankings />}
            {activeView === 'schedule' && <ExamSchedule />}
            {activeView === 'settings' && <SettingsView />}
          </div>
        </div>
      </main>
    </div>
  )
}