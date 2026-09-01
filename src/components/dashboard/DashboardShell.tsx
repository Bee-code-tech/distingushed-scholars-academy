'use client'

import { useState, type ReactNode, type ComponentType } from 'react'
import { GraduationCap, LogOut, Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from '@/components/ui/sheet'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import NotificationBell from '@/components/dashboard/NotificationBell'

export interface NavItem {
  key: string
  label: string
  icon: ComponentType<{ size?: number; className?: string }>
  /** Optional unread count shown as a badge on the item. */
  badge?: number
}

/** A titled section of nav items, e.g. "People" / "Engagement". */
export interface NavGroup {
  group: string
  items: NavItem[]
}

function isGrouped(nav: NavItem[] | NavGroup[]): nav is NavGroup[] {
  return nav.length > 0 && 'items' in nav[0]
}

interface DashboardShellProps {
  /** Small badge under the DSA.Portal wordmark, e.g. "Tutor" or "Guardian". */
  roleLabel: string
  userName: string
  userAvatar?: string
  /** A flat list of items, or titled groups (rendered with section headers). */
  nav: NavItem[] | NavGroup[]
  activeKey: string
  onNavigate: (key: string) => void
  onLogout: () => void
  children: ReactNode
}

/**
 * The blue-sidebar + header chrome shared by the tutor and guardian portals.
 * Mirrors the student dashboard's look so all three feel like one product,
 * without each page re-implementing the layout.
 */
export default function DashboardShell({
  roleLabel,
  userName,
  userAvatar,
  nav,
  activeKey,
  onNavigate,
  onLogout,
  children,
}: DashboardShellProps) {
  const [sheetOpen, setSheetOpen] = useState(false)

  const groups: NavGroup[] = isGrouped(nav)
    ? nav
    : [{ group: '', items: nav }]

  const NavButton = ({ item }: { item: NavItem }) => {
    const Icon = item.icon
    const active = item.key === activeKey
    return (
      <button
        onClick={() => {
          onNavigate(item.key)
          setSheetOpen(false)
        }}
        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
          active
            ? 'bg-[#FCB900] text-[#002EFF] font-black shadow-lg shadow-[#FCB900]/20'
            : 'text-white/60 hover:bg-white/10 hover:text-white'
        }`}
      >
        <Icon
          size={18}
          className={active ? '' : 'group-hover:scale-110 transition-transform'}
        />
        <span className='text-[11px] uppercase tracking-wider font-bold'>
          {item.label}
        </span>
        {item.badge ? (
          <span className='ml-auto min-w-5 h-5 px-1.5 rounded-full bg-rose-500 text-white text-[10px] font-black flex items-center justify-center'>
            {item.badge > 99 ? '99+' : item.badge}
          </span>
        ) : null}
      </button>
    )
  }

  const Sidebar = () => (
    <div className='flex flex-col h-full py-6 px-4'>
      <div className='flex items-center gap-3 mb-10 px-2'>
        <div className='bg-[#FCB900] p-1.5 rounded-lg'>
          <GraduationCap className='text-[#002EFF]' size={20} />
        </div>
        <div className='flex flex-col'>
          <span className='text-white font-black text-sm tracking-tighter uppercase leading-none'>
            DSA.Portal
          </span>
          <Badge className='bg-yellow-400 text-[#002EFF] text-[8px] py-0 h-4 w-fit mt-1 font-black'>
            {roleLabel}
          </Badge>
        </div>
      </div>

      <nav className='flex-1 space-y-6 overflow-y-auto pr-2'>
        {groups.map((group, idx) => (
          <div key={group.group || idx} className='space-y-1.5'>
            {group.group && (
              <h3 className='px-4 text-[9px] font-black uppercase tracking-[0.2em] text-blue-200/40'>
                {group.group}
              </h3>
            )}
            {group.items.map((item) => (
              <NavButton key={item.key} item={item} />
            ))}
          </div>
        ))}
      </nav>

      <div className='mt-auto pt-6 border-t border-white/10'>
        <button
          onClick={onLogout}
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

  return (
    <div className='flex h-screen bg-[#F8FAFF] overflow-hidden font-sans selection:bg-blue-100'>
      <aside className='hidden lg:flex w-64 bg-[#002EFF] m-4 rounded-[2.5rem] flex-col shadow-2xl border border-blue-400/20'>
        <Sidebar />
      </aside>

      <main className='flex-1 flex flex-col min-w-0 overflow-hidden lg:py-4 lg:pr-4'>
        <header className='flex items-center justify-between px-6 py-4'>
          <div className='lg:hidden'>
            <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
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
                <Sidebar />
              </SheetContent>
            </Sheet>
          </div>

          <div className='flex items-center gap-3 ml-auto'>
            <NotificationBell />
            <div className='text-right hidden sm:block'>
              <p className='text-[10px] font-black text-zinc-900 leading-none'>
                {userName}
              </p>
              <p className='text-[9px] text-zinc-400 font-bold uppercase'>
                {roleLabel}
              </p>
            </div>
            <Avatar className='h-9 w-9 border-2 border-white shadow-md'>
              <AvatarImage src={userAvatar} />
              <AvatarFallback>{userName.charAt(0)}</AvatarFallback>
            </Avatar>
          </div>
        </header>

        <div className='flex-1 overflow-y-auto px-6 pb-6'>
          <div className='max-w-6xl mx-auto'>{children}</div>
        </div>
      </main>
    </div>
  )
}
