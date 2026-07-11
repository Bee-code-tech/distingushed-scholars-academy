'use client'

import { Flame, Trophy, Target, Zap } from 'lucide-react'
import { Card } from '@/components/ui/card'

// 1. Defined the interface to fix the TypeScript error
interface StatsGridProps {
  compact?: boolean
}

const stats = [
  {
    label: 'Current Streak',
    value: '12 Days',
    icon: Flame,
    color: 'text-orange-500',
    bg: 'bg-orange-50',
  },
  {
    label: 'Total Points',
    value: '14,250',
    icon: Zap,
    color: 'text-yellow-500',
    bg: 'bg-yellow-50',
  },
  {
    label: 'Mastery Level',
    value: 'Senior 3',
    icon: Target,
    color: 'text-blue-500',
    bg: 'bg-blue-50',
  },
  {
    label: 'Global Rank',
    value: '#42',
    icon: Trophy,
    color: 'text-purple-500',
    bg: 'bg-purple-50',
  },
]

export function StatsGrid({ compact }: StatsGridProps) {
  return (
    // Reduced gap to 3 (12px) for a tighter look
    <div className='grid grid-cols-2 md:grid-cols-4 gap-3'>
      {stats.map((stat) => (
        <Card
          key={stat.label}
          // Conditional padding and rounding for a "pro" feel
          className={`p-3.5 md:p-4 rounded-2xl border-none shadow-[0_2px_10px_-3px_rgba(0,0,0,0.04)] hover:shadow-lg transition-all bg-white group cursor-default`}
        >
          <div className='flex items-start justify-between md:flex-col md:items-start'>
            <div
              className={`${stat.bg} w-8 h-8 rounded-lg flex items-center justify-center mb-0 md:mb-2.5 transition-transform group-hover:scale-110`}
            >
              {/* Scaled icon down for ultra-density */}
              <stat.icon className={stat.color} size={14} strokeWidth={2.5} />
            </div>

            {/* Mobile-only layout shift: on small screens, labels can sit next to icons */}
            <div className='text-right md:text-left'>
              <p className='text-[8px] md:text-[9px] font-black uppercase text-gray-400 tracking-[0.15em] mb-0.5'>
                {stat.label}
              </p>
              <h3 className='text-sm md:text-base font-black text-gray-900 tracking-tight'>
                {stat.value}
              </h3>
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}
