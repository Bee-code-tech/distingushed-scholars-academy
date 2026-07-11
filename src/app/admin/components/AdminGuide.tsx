'use client'

import React from 'react'
import Link from 'next/link'
import {
  Users,
  BookOpen,
  ClipboardCheck,
  TrendingUp,
  PlusCircle,
  Settings,
  Bell,
  ArrowLeft,
} from 'lucide-react'
import { motion } from 'framer-motion'

interface AdminGuideProps {
  onNavigate: (tab: any) => void
}

export default function AdminGuide({ onNavigate }: AdminGuideProps) {
  return (
    <div className='space-y-8 pb-10'>
      {/* TOP HEADER SECTION */}
      <header className='flex flex-col md:flex-row md:items-center justify-between gap-4'>
        <div className='flex flex-col md:flex-row md:items-center gap-6'>
          {/* BACK TO WEBSITE BUTTON */}
          <Link
            href='/'
            className='flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-600 hover:text-[#002EFF] hover:border-[#002EFF] transition-all shadow-sm w-fit'
          >
            <ArrowLeft size={14} />
            Main Website
          </Link>

          <div>
            <h1 className='text-3xl font-black text-slate-900 tracking-tighter uppercase italic leading-none'>
              Command <span className='text-[#002EFF]'>Center</span>
            </h1>
            <p className='text-slate-500 text-[10px] font-black uppercase tracking-[0.3em] mt-1'>
              System Overview & Operational Guidance
            </p>
          </div>
        </div>

        <div className='flex items-center gap-3'>
          <div className='flex -space-x-2'>
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className='w-8 h-8 rounded-full border-2 border-white bg-slate-200'
              />
            ))}
          </div>
          <p className='text-[10px] font-bold text-slate-400 uppercase'>
            3 Admins Online
          </p>
        </div>
      </header>

      {/* --- STATS GRID --- */}
      <section className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
        <StatCard
          icon={Users}
          label='Total Students'
          value='1,284'
          color='blue'
        />
        <StatCard
          icon={BookOpen}
          label='Active Exams'
          value='12'
          color='indigo'
        />
        <StatCard
          icon={ClipboardCheck}
          label='Submissions'
          value='856'
          color='emerald'
        />
        <StatCard
          icon={TrendingUp}
          label='Avg. Score'
          value='74%'
          color='amber'
        />
      </section>

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
        {/* --- QUICK ACTIONS --- */}
        <div className='lg:col-span-2 space-y-6'>
          <h3 className='text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1'>
            Critical Operations
          </h3>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <ActionCard
              title='Build New Exam'
              desc='Create dynamic question sets and configure exam rules.'
              icon={PlusCircle}
              onClick={() => onNavigate('exam-builder')}
              color='bg-[#002EFF]'
            />
            <ActionCard
              title='Manage Quizzes'
              desc='View live exams, track progress, or modify current tests.'
              icon={BookOpen}
              onClick={() => onNavigate('my-quizzes')}
              color='bg-[#FCB900]'
              darkIcon
            />
          </div>

          {/* RECENT ACTIVITY TABLE */}
          <div className='bg-white rounded-4xl border border-slate-200 shadow-sm p-8'>
            <div className='flex items-center justify-between mb-6'>
              <h3 className='text-sm font-black uppercase tracking-tight'>
                Recent Submissions
              </h3>
              <button
                onClick={() => onNavigate('analytics')}
                className='text-[10px] font-black text-blue-600 uppercase hover:underline'
              >
                View All
              </button>
            </div>
            <div className='overflow-x-auto'>
              <table className='w-full text-left text-sm'>
                <thead>
                  <tr className='text-slate-400 uppercase text-[9px] font-black border-b border-slate-50'>
                    <th className='pb-4'>Student Name</th>
                    <th className='pb-4'>Exam ID</th>
                    <th className='pb-4'>Score</th>
                    <th className='pb-4'>Status</th>
                  </tr>
                </thead>
                <tbody className='divide-y divide-slate-50'>
                  <ActivityRow
                    name='John Doe'
                    id='QZ-88A'
                    score='92%'
                    status='Passed'
                  />
                  <ActivityRow
                    name='Sarah Smith'
                    id='QZ-12B'
                    score='45%'
                    status='Failed'
                  />
                  <ActivityRow
                    name='Mike Johnson'
                    id='QZ-88A'
                    score='88%'
                    status='Passed'
                  />
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* --- RIGHT PANEL: STATUS --- */}
        <div className='space-y-6'>
          <h3 className='text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1'>
            Infrastructure
          </h3>
          <div className='bg-white rounded-4xl border border-slate-200 p-6 shadow-sm'>
            <div className='space-y-6'>
              <StatusItem label='Database Cluster' status='Stable' active />
              <StatusItem label='API Gateway' status='Active' active />
              <StatusItem label='Storage' status='82% Capacity' warning />
            </div>
          </div>

          <div className='bg-linear-to-br from-[#002EFF] to-blue-800 rounded-4xl p-8 text-white shadow-xl shadow-blue-600/20 relative overflow-hidden'>
            <div className='absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16' />
            <h4 className='font-black text-lg mb-2 italic'>Support Protocol</h4>
            <p className='text-blue-100 text-[11px] leading-relaxed mb-6 font-medium'>
              Access technical documentation or trigger a system-wide support
              ticket.
            </p>
            <button className='w-full py-4 bg-[#FCB900] text-[#002EFF] rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all hover:scale-[1.02] shadow-lg shadow-black/10'>
              Open Support Ticket
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

/* --- SUB-COMPONENTS --- */

function StatCard({ icon: Icon, label, value, color }: any) {
  const colors: any = {
    blue: 'text-blue-600 bg-blue-50',
    indigo: 'text-indigo-600 bg-indigo-50',
    emerald: 'text-emerald-600 bg-emerald-50',
    amber: 'text-[#FCB900] bg-yellow-50',
  }
  return (
    <div className='bg-white p-5 rounded-4xl border border-slate-100 shadow-sm flex items-center gap-4 hover:border-blue-200 transition-colors'>
      <div className={`p-3 rounded-2xl ${colors[color]}`}>
        <Icon size={20} />
      </div>
      <div>
        <p className='text-[9px] font-black text-slate-400 uppercase tracking-widest'>
          {label}
        </p>
        <p className='text-lg font-black text-slate-900'>{value}</p>
      </div>
    </div>
  )
}

function ActionCard({
  title,
  desc,
  icon: Icon,
  onClick,
  color,
  darkIcon,
}: any) {
  return (
    <button onClick={onClick} className='text-left w-full group cursor-pointer'>
      <div className='bg-white p-6 rounded-[2.5rem] border border-slate-200 group-hover:border-[#002EFF] group-hover:shadow-xl transition-all h-full'>
        <div
          className={`w-12 h-12 ${color} rounded-2xl flex items-center justify-center ${darkIcon ? 'text-[#002EFF]' : 'text-white'} mb-4 shadow-lg group-hover:scale-110 transition-transform`}
        >
          <Icon size={20} />
        </div>
        <h4 className='font-black text-slate-900 mb-1 uppercase text-xs tracking-tight'>
          {title}
        </h4>
        <p className='text-[10px] text-slate-500 leading-relaxed font-bold uppercase tracking-tighter opacity-70'>
          {desc}
        </p>
      </div>
    </button>
  )
}

function ActivityRow({ name, id, score, status }: any) {
  return (
    <tr className='group hover:bg-slate-50 transition-colors'>
      <td className='py-4 font-bold text-slate-700 text-xs'>{name}</td>
      <td className='py-4 font-mono text-[10px] text-slate-400'>{id}</td>
      <td className='py-4 font-black text-slate-900 text-xs'>{score}</td>
      <td className='py-4'>
        <span
          className={`px-2 py-1 rounded-lg text-[8px] font-black uppercase ${status === 'Passed' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}
        >
          {status}
        </span>
      </td>
    </tr>
  )
}

function StatusItem({ label, status, active = false, warning = false }: any) {
  return (
    <div className='flex justify-between items-center'>
      <span className='text-[10px] font-black text-slate-400 uppercase tracking-tight'>
        {label}
      </span>
      <div className='flex items-center gap-2'>
        <span className='text-[10px] font-black uppercase text-slate-900'>
          {status}
        </span>
        <div
          className={`w-2 h-2 rounded-full ${active ? 'bg-emerald-500' : warning ? 'bg-amber-500' : 'bg-slate-300'} animate-pulse`}
        />
      </div>
    </div>
  )
}
