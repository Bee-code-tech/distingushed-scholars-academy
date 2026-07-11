'use client'

import React, { useState } from 'react'
import {
  Settings as SettingsIcon,
  Power,
  Database,
  Globe,
  Bell,
  ShieldCheck,
  Smartphone,
  Cpu,
  Save,
  Clock,
  Lock,
  Eye,
  EyeOff,
  Zap,
  Server,
  RefreshCw,
} from 'lucide-react'
import { motion } from 'framer-motion'

export default function Settings() {
  const [maintenance, setMaintenance] = useState(false)
  const [examMode, setExamMode] = useState(true)
  const [showKeys, setShowKeys] = useState(false)

  return (
    <div className='max-w-6xl mx-auto space-y-6 animate-in fade-in duration-500 pb-10 px-4'>
      {/* Precision Header */}
      <div className='flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4'>
        <div>
          <h1 className='text-2xl font-black text-slate-900 tracking-tight'>
            Platform Configuration
          </h1>
          <p className='text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1 flex items-center gap-2'>
            <Server size={12} className='text-blue-500' />
            Core Engine & Global State Management
          </p>
        </div>
        <button className='flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-all'>
          <Save size={14} /> Deploy Global State
        </button>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-12 gap-6'>
        {/* Main Controls */}
        <div className='lg:col-span-8 space-y-6'>
          {/* Health & Visibility */}
          <div className='bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden'>
            <div className='px-6 py-4 border-b border-slate-100 bg-slate-50/30 flex justify-between items-center'>
              <h3 className='font-black text-slate-900 uppercase tracking-widest text-[10px]'>
                System Health & Visibility
              </h3>
              <div className='flex items-center gap-1.5 px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded-md border border-emerald-100'>
                <div className='w-1 h-1 rounded-full bg-emerald-500 animate-pulse' />
                <span className='text-[8px] font-black uppercase'>Live</span>
              </div>
            </div>

            <div className='p-6 space-y-3'>
              <ToggleControl
                icon={Power}
                label='Maintenance Mode'
                desc="Suspend student access. Redirect to 'System Update' splash."
                active={maintenance}
                onToggle={() => setMaintenance(!maintenance)}
                danger
              />
              <ToggleControl
                icon={ShieldCheck}
                label='Strict Exam Protocol'
                desc='Disable external inputs, multi-tab detection, and session sharing.'
                active={examMode}
                onToggle={() => setExamMode(!examMode)}
              />
              <ToggleControl
                icon={Bell}
                label='Broadcast Notifications'
                desc='Enable Firebase push for result releases and mock reminders.'
                active={true}
              />
            </div>
          </div>

          {/* Infrastructure & Credentials */}
          <div className='bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden'>
            <div className='px-6 py-4 border-b border-slate-100 bg-slate-50/30 flex justify-between items-center'>
              <h3 className='font-black text-slate-900 uppercase tracking-widest text-[10px]'>
                Infrastructure & Gateways
              </h3>
              <button
                onClick={() => setShowKeys(!showKeys)}
                className='text-blue-600 text-[10px] font-black uppercase flex items-center gap-1.5 hover:text-blue-700'
              >
                {showKeys ? <EyeOff size={12} /> : <Eye size={12} />}
                {showKeys ? 'Obscure' : 'Reveal'} Keys
              </button>
            </div>

            <div className='p-6 space-y-6'>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div className='space-y-1.5'>
                  <label className='text-[9px] font-black uppercase text-slate-400 ml-1'>
                    Paystack Production Key
                  </label>
                  <div className='relative group'>
                    <input
                      type={showKeys ? 'text' : 'password'}
                      value='pk_live_xxxxxxxxxxxx7741'
                      className='w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl font-mono text-[11px] text-slate-600 outline-none focus:ring-1 focus:ring-blue-500/20'
                      readOnly
                    />
                    <Lock
                      size={12}
                      className='absolute right-4 top-1/2 -translate-y-1/2 text-slate-300'
                    />
                  </div>
                </div>
                <div className='space-y-1.5'>
                  <label className='text-[9px] font-black uppercase text-slate-400 ml-1'>
                    AI Analysis Engine
                  </label>
                  <input
                    type='text'
                    value='gpt-4o-2024-enterprise'
                    className='w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl font-mono text-[11px] text-slate-600 outline-none'
                    readOnly
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Info Sidebar */}
        <div className='lg:col-span-4 space-y-4'>
          <div className='bg-slate-900 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden'>
            <div className='absolute top-0 right-0 p-4 opacity-5'>
              <Zap size={60} />
            </div>

            <h3 className='font-black uppercase tracking-widest text-[10px] text-blue-400 mb-5 flex items-center gap-2'>
              <ActivityIcon size={12} /> Instance Metrics
            </h3>

            <div className='space-y-3.5 relative z-10'>
              <MetricRow
                icon={Database}
                label='DB Integrity'
                value='Synchronized'
                color='text-emerald-400'
              />
              <MetricRow
                icon={Cpu}
                label='Edge Latency'
                value='18ms'
                color='text-blue-400'
              />
              <MetricRow
                icon={Globe}
                label='Region'
                value='NG-LAG-01'
                color='text-slate-500'
              />
              <MetricRow
                icon={RefreshCw}
                label='Build'
                value='v2.8.5-STABLE'
                color='text-slate-500'
              />
            </div>

            <div className='mt-8 p-4 bg-white/5 border border-white/10 rounded-xl'>
              <div className='flex items-center gap-2 text-blue-400 mb-1'>
                <Clock size={12} />
                <span className='text-[9px] font-black uppercase'>
                  Snapshot Schedule
                </span>
              </div>
              <p className='text-[10px] text-slate-400 leading-tight'>
                Daily backup executed at <br />
                <span className='font-black text-white'>
                  04:00 AM WAT • Status: Verified
                </span>
              </p>
            </div>
          </div>

          <div className='bg-amber-50 border border-amber-100 rounded-2xl p-5'>
            <div className='flex items-center gap-2 text-amber-700 mb-2'>
              <Smartphone size={14} />
              <span className='text-[10px] font-black uppercase tracking-widest'>
                Mobile Distribution
              </span>
            </div>
            <p className='text-[11px] text-amber-800 font-bold leading-relaxed mb-4'>
              Remote config detected 4 pending updates for the Android binary.
            </p>
            <button className='w-full py-2 bg-amber-600 text-white rounded-lg text-[9px] font-black uppercase hover:bg-amber-700 transition-colors shadow-md shadow-amber-900/10'>
              Invalidate Cache & Push
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function MetricRow({ icon: Icon, label, value, color }: any) {
  return (
    <div className='flex justify-between items-center border-b border-slate-800/50 pb-2.5'>
      <div className='flex items-center gap-2 text-slate-400'>
        <Icon size={12} />
        <span className='text-[10px] font-bold'>{label}</span>
      </div>
      <span className={`text-[9px] font-black uppercase ${color}`}>
        {value}
      </span>
    </div>
  )
}

function ToggleControl({
  icon: Icon,
  label,
  desc,
  active,
  onToggle,
  danger,
}: any) {
  return (
    <div
      className={`flex items-center justify-between p-4 rounded-xl border transition-all ${active && danger ? 'bg-rose-50 border-rose-100' : 'bg-slate-50/50 border-slate-100'}`}
    >
      <div className='flex gap-3 items-center'>
        <div
          className={`p-2.5 rounded-lg ${active ? (danger ? 'bg-rose-500 text-white' : 'bg-blue-600 text-white') : 'bg-white text-slate-400 shadow-sm border border-slate-100'}`}
        >
          <Icon size={16} />
        </div>
        <div>
          <p className='text-xs font-black text-slate-900 leading-none'>
            {label}
          </p>
          <p className='text-[9px] text-slate-500 font-bold mt-1 uppercase leading-tight max-w-[180px]'>
            {desc}
          </p>
        </div>
      </div>
      <button
        onClick={onToggle}
        className={`w-10 h-5.5 rounded-full p-1 transition-colors relative ${active ? (danger ? 'bg-rose-500' : 'bg-blue-600') : 'bg-slate-200'}`}
      >
        <div
          className={`w-3.5 h-3.5 bg-white rounded-full transition-transform ${active ? 'translate-x-4.5' : 'translate-x-0'} shadow-sm`}
        />
      </button>
    </div>
  )
}

function ActivityIcon({ size }: { size: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth='3'
      strokeLinecap='round'
      strokeLinejoin='round'
    >
      <path d='M22 12h-4l-3 9L9 3l-3 9H2' />
    </svg>
  )
}
