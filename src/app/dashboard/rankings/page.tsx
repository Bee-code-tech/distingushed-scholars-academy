// src/app/dashboard/rankings/page.tsx
'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import {
  Trophy,
  ArrowUp,
  ArrowDown,
  Minus,
  Search,
  Globe,
  School,
  Zap,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'

export default function GlobalRankings() {
  const [activeTab, setActiveTab] = useState('global')

  const ranks = [
    {
      name: 'Hilosthone',
      score: 350,
      school: 'UIL',
      avatar: 'H',
      me: true,
      trend: 'neutral',
      mastery: 'Math',
    },
    {
      name: 'Adebayo T.',
      score: 342,
      school: 'UNILAG',
      avatar: 'A',
      trend: 'up',
      mastery: 'Chem',
    },
    {
      name: 'Chidi E.',
      score: 338,
      school: 'UNN',
      avatar: 'C',
      trend: 'down',
      mastery: 'Physics',
    },
    {
      name: 'Sarah J.',
      score: 315,
      school: 'OAU',
      avatar: 'S',
      trend: 'up',
      mastery: 'English',
    },
    {
      name: 'Fatima B.',
      score: 301,
      school: 'ABU',
      avatar: 'F',
      trend: 'up',
      mastery: 'Gov',
    },
  ]

  return (
    <div className='max-w-4xl mx-auto space-y-4 animate-in fade-in duration-500'>
      {/* --- SLIM PRO HEADER --- */}
      <div className='grid grid-cols-1 md:grid-cols-3 gap-3'>
        <Card className='md:col-span-2 bg-[#002EFF] p-4 rounded-3xl border-none shadow-lg shadow-blue-100 relative overflow-hidden flex items-center justify-between'>
          <div className='relative z-10'>
            <div className='flex items-center gap-2 mb-1'>
              <Zap size={12} className='text-[#FCB900] fill-[#FCB900]' />
              <span className='text-[10px] font-black text-blue-100 uppercase tracking-widest'>
                Active Session: Elite
              </span>
            </div>
            <h2 className='text-2xl font-black text-white italic uppercase leading-none'>
              Rank #12
            </h2>
          </div>
          <div className='flex gap-2 relative z-10'>
            <div className='bg-white/10 backdrop-blur-md px-3 py-2 rounded-2xl border border-white/10 text-center'>
              <p className='text-[7px] font-bold text-blue-200 uppercase'>
                Percentile
              </p>
              <p className='text-sm font-black text-white italic'>99.2%</p>
            </div>
            <div className='bg-white/10 backdrop-blur-md px-3 py-2 rounded-2xl border border-white/10 text-center'>
              <p className='text-[7px] font-bold text-blue-200 uppercase'>
                Global
              </p>
              <p className='text-sm font-black text-white italic'>Top 50</p>
            </div>
          </div>
          <Trophy
            className='absolute -right-4 -bottom-4 text-white/5 rotate-12'
            size={100}
          />
        </Card>

        <Card className='bg-white p-4 rounded-3xl border-zinc-100 flex flex-col justify-center'>
          <p className='text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-2 flex items-center gap-2'>
            <Globe size={10} /> Search Network
          </p>
          <div className='relative'>
            <Search
              className='absolute left-3 top-1/2 -translate-y-1/2 text-zinc-300'
              size={12}
            />
            <input
              className='w-full bg-zinc-50 border-none rounded-xl py-2 pl-9 text-[11px] font-bold focus:ring-1 focus:ring-blue-100 outline-none'
              placeholder='Search IDs...'
            />
          </div>
        </Card>
      </div>

      {/* --- MINI TAB FILTER --- */}
      <div className='flex justify-start gap-1 p-1 bg-zinc-100/50 w-fit rounded-xl border border-zinc-100'>
        {['global', 'school'].map((t) => (
          <button
            key={t}
            onClick={() => setActiveTab(t)}
            className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase transition-all ${activeTab === t ? 'bg-white text-[#002EFF] shadow-sm' : 'text-zinc-400 hover:text-zinc-600'}`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* --- COMPACT TABLE --- */}
      <Card className='rounded-3xl border-none shadow-sm bg-white overflow-hidden'>
        <table className='w-full text-left'>
          <thead>
            <tr className='bg-zinc-50/50 border-b border-zinc-100'>
              <th className='px-5 py-3 text-[8px] font-black uppercase text-zinc-400'>
                Pos
              </th>
              <th className='px-5 py-3 text-[8px] font-black uppercase text-zinc-400'>
                Candidate
              </th>
              <th className='px-5 py-3 text-[8px] font-black uppercase text-zinc-400 text-center'>
                Mastery
              </th>
              <th className='px-5 py-3 text-[8px] font-black uppercase text-zinc-400 text-right'>
                Score
              </th>
            </tr>
          </thead>
          <tbody className='divide-y divide-zinc-50'>
            {ranks.map((r, i) => (
              <tr
                key={i}
                className={`group hover:bg-blue-50/30 transition-colors ${r.me ? 'bg-blue-50/50' : ''}`}
              >
                <td className='px-5 py-3'>
                  <div className='flex items-center gap-2'>
                    <span
                      className={`text-[10px] font-black ${i < 3 ? 'text-[#002EFF]' : 'text-zinc-400'}`}
                    >
                      #{i + 1}
                    </span>
                    {r.trend === 'up' && (
                      <ArrowUp size={10} className='text-emerald-500' />
                    )}
                    {r.trend === 'down' && (
                      <ArrowDown size={10} className='text-red-500' />
                    )}
                  </div>
                </td>
                <td className='px-5 py-3'>
                  <div className='flex items-center gap-3'>
                    <Avatar className='h-7 w-7 border-2 border-white shadow-sm'>
                      <AvatarImage
                        src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${r.avatar}`}
                      />
                      <AvatarFallback className='text-[8px] font-black'>
                        {r.avatar}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className='text-[11px] font-black text-zinc-800 uppercase leading-none mb-0.5'>
                        {r.name}
                      </p>
                      <p className='text-[8px] font-bold text-zinc-400 uppercase tracking-tighter'>
                        {r.school}
                      </p>
                    </div>
                  </div>
                </td>
                <td className='px-5 py-3 text-center'>
                  <Badge
                    variant='outline'
                    className='text-[7px] font-black border-zinc-200 uppercase text-zinc-400 px-1.5 h-4'
                  >
                    {r.mastery}
                  </Badge>
                </td>
                <td className='px-5 py-3 text-right'>
                  <span
                    className={`text-[13px] font-black italic ${i < 3 ? 'text-[#002EFF]' : 'text-zinc-600'}`}
                  >
                    {r.score}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className='bg-zinc-50 p-2 text-center'>
          <button className='text-[9px] font-black text-zinc-300 hover:text-[#002EFF] uppercase transition-all'>
            Load More Registry Data
          </button>
        </div>
      </Card>
    </div>
  )
}