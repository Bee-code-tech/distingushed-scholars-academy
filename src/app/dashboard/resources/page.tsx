'use client'

import { useState } from 'react'
import {
  Download,
  Lock,
  FileType,
  Search,
  Eye,
  Sparkles,
  CheckCircle,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'

export default function ResourcesView({ isDSAite }: { isDSAite: boolean }) {
  const [search, setSearch] = useState('')

  const resources = [
    {
      id: 1,
      title: 'Introduction to DSA',
      type: 'PDF',
      isPremium: false,
      size: '1.2MB',
      subject: 'General',
      downloaded: true,
    },
    {
      id: 2,
      title: 'Advanced Calculus II',
      type: 'PDF',
      isPremium: true,
      size: '4.5MB',
      subject: 'Maths',
      downloaded: false,
    },
    {
      id: 3,
      title: 'Quantum Physics Notes',
      type: 'PDF',
      isPremium: true,
      size: '3.1MB',
      subject: 'Physics',
      downloaded: false,
    },
    {
      id: 4,
      title: 'Exam Past Questions 2025',
      type: 'PDF',
      isPremium: false,
      size: '2.8MB',
      subject: 'Revision',
      downloaded: true,
    },
    {
      id: 5,
      title: 'Organic Chemistry Masterclass',
      type: 'PDF',
      isPremium: true,
      size: '5.2MB',
      subject: 'Chemistry',
      downloaded: false,
    },
  ]

  return (
    <div className='max-w-5xl mx-auto space-y-4 animate-in fade-in duration-500'>
      {/* --- COMPACT HEADER --- */}
      <div className='flex items-center justify-between gap-4 bg-white p-4 rounded-3xl shadow-sm border border-zinc-100'>
        <div className='flex items-center gap-3'>
          <div className='h-10 w-10 rounded-2xl bg-blue-50 flex items-center justify-center'>
            <ShieldCheck className='text-[#002EFF]' size={20} />
          </div>
          <div>
            <h2 className='text-lg font-black text-[#002EFF] uppercase tracking-tighter leading-none'>
              Vault v3.2
            </h2>
            <p className='text-[8px] font-bold text-zinc-400 uppercase tracking-widest'>
              Secure Asset Protocol
            </p>
          </div>
        </div>

        <div className='relative flex-1 max-w-xs'>
          <Search
            className='absolute left-3 top-1/2 -translate-y-1/2 text-zinc-300'
            size={12}
          />
          <Input
            placeholder='Find resource...'
            className='pl-9 rounded-xl border-zinc-100 bg-zinc-50/50 h-9 text-[11px] font-bold'
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* --- MODERATE UPSELL (Slimmed Down) --- */}
      {!isDSAite && (
        <div className='bg-linear-to-r from-[#002EFF] to-blue-700 p-3 px-6 rounded-2xl text-white flex justify-between items-center shadow-md overflow-hidden relative'>
          <div className='flex items-center gap-3 z-10'>
            <Sparkles size={14} className='text-[#FCB900] animate-pulse' />
            <p className='text-[10px] font-black uppercase tracking-tight'>
              Unlock 450+ Premium Assets with DSAite Pro
            </p>
          </div>
          <Button
            size='sm'
            className='h-7 bg-[#FCB900] text-[#002EFF] hover:bg-white font-black rounded-lg text-[9px] px-4 uppercase z-10'
          >
            Upgrade
          </Button>
          <div className='absolute right-0 top-0 w-32 h-full bg-white/5 skew-x-[-20deg] translate-x-10' />
        </div>
      )}

      {/* --- LIST VIEW (Pro Density) --- */}
      <Card className='rounded-3xl border-none shadow-sm bg-white overflow-hidden'>
        <div className='overflow-x-auto'>
          <table className='w-full text-left'>
            <thead>
              <tr className='bg-zinc-50/50 border-b border-zinc-100'>
                <th className='px-6 py-3 text-[9px] font-black uppercase text-zinc-400'>
                  Resource
                </th>
                <th className='px-6 py-3 text-[9px] font-black uppercase text-zinc-400'>
                  Subject
                </th>
                <th className='px-6 py-3 text-[9px] font-black uppercase text-zinc-400'>
                  Access
                </th>
                <th className='px-6 py-3 text-right'></th>
              </tr>
            </thead>
            <tbody className='divide-y divide-zinc-50'>
              {resources.map((file) => {
                const locked = file.isPremium && !isDSAite
                return (
                  <tr
                    key={file.id}
                    className='group hover:bg-blue-50/30 transition-colors'
                  >
                    <td className='px-6 py-3'>
                      <div className='flex items-center gap-3'>
                        <div
                          className={`h-8 w-8 rounded-lg flex items-center justify-center transition-colors ${locked ? 'bg-zinc-100 text-zinc-400' : 'bg-blue-50 text-[#002EFF] group-hover:bg-[#002EFF] group-hover:text-white'}`}
                        >
                          <FileType size={16} strokeWidth={3} />
                        </div>
                        <div>
                          <p
                            className={`text-[11px] font-black leading-none mb-1 ${locked ? 'text-zinc-400' : 'text-zinc-800'}`}
                          >
                            {file.title}
                          </p>
                          <p className='text-[9px] font-bold text-zinc-400 uppercase'>
                            {file.size} • {file.type}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className='px-6 py-3'>
                      <Badge
                        variant='outline'
                        className='rounded-md border-zinc-100 text-zinc-400 text-[8px] font-black uppercase px-1.5 py-0'
                      >
                        {file.subject}
                      </Badge>
                    </td>
                    <td className='px-6 py-3'>
                      {locked ? (
                        <div className='flex items-center gap-1.5 text-amber-500 font-black text-[9px] uppercase'>
                          <Lock size={10} /> Locked
                        </div>
                      ) : (
                        <div className='flex items-center gap-1.5 text-emerald-500 font-black text-[9px] uppercase'>
                          <CheckCircle size={10} /> Available
                        </div>
                      )}
                    </td>
                    <td className='px-6 py-3 text-right'>
                      <div className='flex justify-end gap-2'>
                        {!locked && (
                          <Button
                            variant='ghost'
                            size='icon'
                            className='h-7 w-7 text-zinc-400 hover:text-[#002EFF]'
                          >
                            <Eye size={14} />
                          </Button>
                        )}
                        <Button
                          disabled={locked}
                          className={`h-7 px-3 rounded-lg font-black uppercase text-[9px] tracking-tighter ${
                            locked
                              ? 'bg-zinc-100 text-zinc-400'
                              : 'bg-[#002EFF] text-white'
                          }`}
                        >
                          {locked ? (
                            'Upgrade'
                          ) : (
                            <>
                              <Download size={12} className='mr-1' /> Get
                            </>
                          )}
                        </Button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Card>

      <p className='text-center text-[9px] font-black text-zinc-300 uppercase tracking-widest pt-2'>
        End of Encrypted Directory
      </p>
    </div>
  )
}
