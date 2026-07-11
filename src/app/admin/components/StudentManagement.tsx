'use client'

import React, { useState, useMemo } from 'react'
import {
  Search,
  Filter,
  MoreVertical,
  ShieldAlert,
  Key,
  Zap,
  Mail,
  ArrowUpDown,
  Download,
  UserPlus,
  ExternalLink,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

// --- Types & Mock Data ---
interface Student {
  id: string
  name: string
  email: string
  status: 'Active' | 'Suspended' | 'Pending'
  plan: 'Premium' | 'Free'
  score: number
  joined: string
}

const INITIAL_STUDENTS: Student[] = [
  {
    id: '1',
    name: 'Chidi Okechukwu',
    email: 'chidi.o@gmail.com',
    status: 'Active',
    plan: 'Premium',
    score: 294,
    joined: 'Jan 12, 2026',
  },
  {
    id: '2',
    name: 'Amina Bello',
    email: 'amina.b@yahoo.com',
    status: 'Active',
    plan: 'Free',
    score: 210,
    joined: 'Jan 15, 2026',
  },
  {
    id: '3',
    name: 'Tunde Afolayan',
    email: 't.afolayan@edu.ng',
    status: 'Suspended',
    plan: 'Premium',
    score: 312,
    joined: 'Dec 05, 2025',
  },
  {
    id: '4',
    name: 'Blessing Udoh',
    email: 'bless.u@outlook.com',
    status: 'Active',
    plan: 'Free',
    score: 185,
    joined: 'Feb 01, 2026',
  },
  {
    id: '5',
    name: 'Oluwatosin Adeyemi',
    email: 'tosin.dev@gmail.com',
    status: 'Active',
    plan: 'Premium',
    score: 345,
    joined: 'Jan 20, 2026',
  },
  {
    id: '6',
    name: 'Fatima Abubakar',
    email: 'f.abubakar@study.ng',
    status: 'Pending',
    plan: 'Free',
    score: 0,
    joined: 'Feb 03, 2026',
  },
  {
    id: '7',
    name: 'Emeka Nwosu',
    email: 'emmy.nwosu@icloud.com',
    status: 'Active',
    plan: 'Premium',
    score: 278,
    joined: 'Nov 18, 2025',
  },
  {
    id: '8',
    name: 'Zainab Idris',
    email: 'z.idris@gmail.com',
    status: 'Active',
    plan: 'Free',
    score: 192,
    joined: 'Jan 29, 2026',
  },
  {
    id: '9',
    name: 'Kofoworola Bankole',
    email: 'kofo.banky@yahoo.com',
    status: 'Active',
    plan: 'Premium',
    score: 318,
    joined: 'Jan 05, 2026',
  },
  {
    id: '10',
    name: 'Ikechukwu Okafor',
    email: 'ike.ok@outlook.com',
    status: 'Suspended',
    plan: 'Free',
    score: 145,
    joined: 'Oct 12, 2025',
  },
]
export default function StudentManagement() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedPlan, setSelectedPlan] = useState<'All' | 'Premium' | 'Free'>(
    'All',
  )

  // Optimized Filtering Logic
  const filteredStudents = useMemo(() => {
    return INITIAL_STUDENTS.filter((s) => {
      const matchesSearch =
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.email.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesPlan = selectedPlan === 'All' || s.plan === selectedPlan
      return matchesSearch && matchesPlan
    })
  }, [searchTerm, selectedPlan])

  return (
    <div className='max-w-6xl mx-auto space-y-6 animate-in fade-in duration-700 pb-10 px-4'>
      {/* Header Area */}
      <header className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 py-4'>
        <div>
          <h1 className='text-2xl font-black text-slate-900 tracking-tight'>
            Student Directory
          </h1>
          <p className='text-xs text-slate-500 font-bold uppercase tracking-tighter mt-1 flex items-center gap-2'>
            <span className='w-2 h-2 rounded-full bg-emerald-500 animate-pulse' />
            System Live: {filteredStudents.length} results shown
          </p>
        </div>
        <div className='flex items-center gap-2'>
          <button className='p-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition-all'>
            <Download size={18} />
          </button>
          <button className='flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-black uppercase shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all'>
            <UserPlus size={16} /> New Student
          </button>
        </div>
      </header>

      {/* Glassmorphic Control Bar */}
      <div className='grid grid-cols-1 lg:grid-cols-12 gap-3 bg-white p-3 rounded-2xl border border-slate-200 shadow-sm'>
        <div className='lg:col-span-7 relative'>
          <Search
            className='absolute left-4 top-1/2 -translate-y-1/2 text-slate-400'
            size={16}
          />
          <input
            type='text'
            placeholder='Quick search students...'
            className='w-full pl-11 pr-4 py-2.5 bg-slate-50 border-none rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500/20 outline-none transition-all'
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className='lg:col-span-3 flex bg-slate-50 p-1 rounded-xl'>
          {(['All', 'Premium', 'Free'] as const).map((p) => (
            <button
              key={p}
              onClick={() => setSelectedPlan(p)}
              className={`flex-1 py-1.5 text-[10px] font-black uppercase rounded-lg transition-all ${
                selectedPlan === p
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
        <div className='lg:col-span-2 flex gap-2'>
          <button className='flex-1 flex items-center justify-center gap-2 py-2.5 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase'>
            <ArrowUpDown size={12} /> Sort
          </button>
        </div>
      </div>

      {/* Modern Table Layout */}
      <div className='bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden'>
        <div className='overflow-x-auto'>
          <table className='w-full text-left'>
            <thead>
              <tr className='bg-slate-50/50 border-b border-slate-100'>
                <th className='px-6 py-4 text-[10px] font-black uppercase text-slate-400'>
                  Identity
                </th>
                <th className='px-6 py-4 text-[10px] font-black uppercase text-slate-400'>
                  Tier
                </th>
                <th className='px-6 py-4 text-[10px] font-black uppercase text-slate-400 text-center'>
                  Avg Score
                </th>
                <th className='px-6 py-4 text-[10px] font-black uppercase text-slate-400'>
                  Access Status
                </th>
                <th className='px-6 py-4 text-[10px] font-black uppercase text-slate-400 text-right'>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className='divide-y divide-slate-50'>
              <AnimatePresence mode='popLayout'>
                {filteredStudents.map((student) => (
                  <motion.tr
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    key={student.id}
                    className='group hover:bg-blue-50/30 transition-colors'
                  >
                    <td className='px-6 py-4'>
                      <div className='flex items-center gap-3'>
                        <div className='w-9 h-9 rounded-lg bg-blue-700 text-white flex items-center justify-center text-[10px] font-black'>
                          {student.name
                            .split(' ')
                            .map((n) => n[0])
                            .join('')}
                        </div>
                        <div>
                          <p className='font-black text-blue-700 text-sm tracking-tight'>
                            {student.name}
                          </p>
                          <p className='text-[10px] text-slate-500 font-bold uppercase'>
                            {student.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className='px-6 py-4'>
                      <div
                        className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-black uppercase ${
                          student.plan === 'Premium'
                            ? 'bg-amber-50 text-[#FCB900] border border-amber-100'
                            : 'bg-slate-50 text-slate-400'
                        }`}
                      >
                        {student.plan === 'Premium' && (
                          <Zap size={10} fill='currentColor' />
                        )}
                        {student.plan}
                      </div>
                    </td>
                    <td className='px-6 py-4 text-center'>
                      <span className='text-sm font-black text-slate-700'>
                        {student.score}
                      </span>
                    </td>
                    <td className='px-6 py-4'>
                      <div className='flex items-center gap-2'>
                        <div
                          className={`w-1.5 h-1.5 rounded-full ${student.status === 'Active' ? 'bg-emerald-500' : 'bg-rose-500'}`}
                        />
                        <span className='text-xs font-bold text-slate-600'>
                          {student.status}
                        </span>
                      </div>
                    </td>
                    <td className='px-6 py-4 text-right'>
                      <div className='flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity'>
                        <ActionButton
                          icon={Key}
                          color='text-slate-400 hover:text-blue-600'
                        />
                        <ActionButton
                          icon={Mail}
                          color='text-slate-400 hover:text-blue-600'
                        />
                        <ActionButton
                          icon={ShieldAlert}
                          color='text-slate-400 hover:text-rose-600'
                        />
                        <button className='p-2 text-slate-400 hover:text-slate-900 transition-colors ml-2'>
                          <MoreVertical size={16} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
          {filteredStudents.length === 0 && (
            <div className='p-20 text-center'>
              <div className='inline-flex p-4 rounded-full bg-slate-50 text-slate-300 mb-4'>
                <Search size={32} />
              </div>
              <p className='text-sm font-black text-slate-900'>
                No students found
              </p>
              <p className='text-xs text-slate-400 font-bold uppercase'>
                Try adjusting your search or filters
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function ActionButton({ icon: Icon, color }: { icon: any; color: string }) {
  return (
    <button
      className={`p-2 rounded-lg transition-all hover:bg-white hover:shadow-sm ${color}`}
    >
      <Icon size={14} />
    </button>
  )
}
