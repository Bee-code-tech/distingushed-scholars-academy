'use client'

import React from 'react'
import {
  CreditCard,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
  Tag,
  ShieldCheck,
  Download,
  Users,
  ChevronRight,
  ExternalLink,
  Activity,
} from 'lucide-react'
import { motion } from 'framer-motion'

export default function RevenueControls() {
  const transactions = [
    {
      id: 'TX-9021',
      student: 'Amara Kanu',
      amount: '₦5,000',
      method: 'Card',
      date: 'Just now',
      status: 'Success',
    },
    {
      id: 'TX-9020',
      Ibrahim: 'Ibrahim Musa',
      amount: '₦2,500',
      method: 'Transfer',
      date: '5m ago',
      status: 'Pending',
    },
    {
      id: 'TX-9019',
      student: 'Efe Omowunmi',
      amount: '₦5,000',
      method: 'Card',
      date: '12m ago',
      status: 'Success',
    },
    {
      id: 'TX-9018',
      student: 'Tunde Bakare',
      amount: '₦5,000',
      method: 'USSD',
      date: '25m ago',
      status: 'Failed',
    },
  ]

  return (
    <div className='max-w-6xl mx-auto space-y-6 animate-in fade-in duration-500 pb-10 px-4'>
      {/* Dynamic Header */}
      <div className='flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4'>
        <div>
          <h1 className='text-2xl font-black text-slate-900 tracking-tight'>
            Revenue Controls
          </h1>
          <p className='text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1 flex items-center gap-2'>
            <Activity size={12} className='text-emerald-500' />
            Live Financial Stream • Feb 2026
          </p>
        </div>
        <button className='flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase shadow-lg shadow-slate-200 hover:bg-slate-800 transition-all'>
          <Download size={14} /> Settlement Report
        </button>
      </div>

      {/* High-Performance KPIs */}
      <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
        <FinanceCard
          title='Monthly Revenue'
          value='₦1,240,500'
          trend='+18.2%'
          icon={Wallet}
          color='text-blue-600'
          bg='bg-blue-50'
        />
        <FinanceCard
          title='Avg. Order Value'
          value='₦4,200'
          trend='+5.4%'
          icon={TrendingUp}
          color='text-emerald-600'
          bg='bg-emerald-50'
        />
        <FinanceCard
          title='Churn Rate'
          value='2.1%'
          trend='-0.8%'
          trendDownGood
          icon={Users}
          color='text-rose-600'
          bg='bg-rose-50'
        />
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-12 gap-6'>
        {/* Transaction Ledger */}
        <div className='lg:col-span-8 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden'>
          <div className='px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/30'>
            <h3 className='font-black text-slate-900 uppercase tracking-widest text-[10px]'>
              Transaction Ledger
            </h3>
            <button className='text-blue-600 text-[10px] font-black uppercase flex items-center gap-1 hover:gap-2 transition-all'>
              Full History <ChevronRight size={12} />
            </button>
          </div>
          <div className='overflow-x-auto'>
            <table className='w-full text-left'>
              <thead>
                <tr className='bg-slate-50/50 border-b border-slate-100'>
                  <th className='px-6 py-3 text-[9px] font-black uppercase text-slate-400'>
                    Reference
                  </th>
                  <th className='px-6 py-3 text-[9px] font-black uppercase text-slate-400'>
                    Student
                  </th>
                  <th className='px-6 py-3 text-[9px] font-black uppercase text-slate-400'>
                    Amount
                  </th>
                  <th className='px-6 py-3 text-[9px] font-black uppercase text-slate-400'>
                    Status
                  </th>
                  <th className='px-6 py-3 text-[9px] font-black uppercase text-slate-400 text-right'>
                    Gate
                  </th>
                </tr>
              </thead>
              <tbody className='divide-y divide-slate-50'>
                {transactions.map((tx) => (
                  <tr
                    key={tx.id}
                    className='group hover:bg-blue-50/20 transition-colors'
                  >
                    <td className='px-6 py-4 text-[10px] font-black text-slate-400 font-mono'>
                      {tx.id}
                    </td>
                    <td className='px-6 py-4'>
                      <p className='text-xs font-bold text-slate-700'>
                        {tx.student || 'Unknown'}
                      </p>
                      <p className='text-[9px] text-slate-400 font-medium'>
                        {tx.date}
                      </p>
                    </td>
                    <td className='px-6 py-4 text-xs font-black text-slate-900'>
                      {tx.amount}
                    </td>
                    <td className='px-6 py-4'>
                      <span
                        className={`px-2 py-0.5 rounded text-[9px] font-black uppercase border ${
                          tx.status === 'Success'
                            ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                            : tx.status === 'Pending'
                              ? 'bg-amber-50 text-amber-600 border-amber-100'
                              : 'bg-rose-50 text-rose-600 border-rose-100'
                        }`}
                      >
                        {tx.status}
                      </span>
                    </td>
                    <td className='px-6 py-4 text-right'>
                      <button className='p-1.5 text-slate-300 hover:text-blue-600 transition-all opacity-0 group-hover:opacity-100'>
                        <ExternalLink size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Financial Ops Sidebar */}
        <div className='lg:col-span-4 space-y-4'>
          <div className='bg-slate-900 rounded-2xl p-6 text-white shadow-xl'>
            <div className='flex items-center gap-2 mb-5'>
              <Tag size={16} className='text-blue-400' />
              <h3 className='font-black uppercase tracking-widest text-[10px]'>
                Coupon Factory
              </h3>
            </div>
            <div className='space-y-4'>
              <div className='space-y-1.5'>
                <label className='text-[9px] font-black text-slate-500 uppercase ml-1'>
                  Promotional Code
                </label>
                <input
                  type='text'
                  placeholder='JAMB2026'
                  className='w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-xs font-black text-blue-400 uppercase outline-none focus:ring-1 focus:ring-blue-500'
                />
              </div>
              <div className='grid grid-cols-2 gap-3'>
                <div className='space-y-1.5'>
                  <label className='text-[9px] font-black text-slate-500 uppercase ml-1'>
                    Discount %
                  </label>
                  <input
                    type='number'
                    placeholder='20'
                    className='w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-xs font-black outline-none'
                  />
                </div>
                <div className='space-y-1.5'>
                  <label className='text-[9px] font-black text-slate-500 uppercase ml-1'>
                    Redeem Limit
                  </label>
                  <input
                    type='number'
                    placeholder='500'
                    className='w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-xs font-black outline-none'
                  />
                </div>
              </div>
              <button className='w-full py-3 bg-blue-600 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-900/20'>
                Deploy Code
              </button>
            </div>
          </div>

          <div className='bg-white border border-slate-200 rounded-2xl p-6 shadow-sm'>
            <div className='flex items-center gap-2 mb-4 text-slate-900'>
              <ShieldCheck size={16} className='text-emerald-500' />
              <h3 className='font-black uppercase tracking-widest text-[10px]'>
                Network Health
              </h3>
            </div>
            <div className='space-y-2'>
              <HealthItem label='Payment Gateway' status='Operational' />
              <HealthItem label='Bank Settlements' status='Active' />
              <HealthItem label='Tax Compliance' status='Verified' />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function FinanceCard({
  title,
  value,
  trend,
  trendDownGood,
  icon: Icon,
  color,
  bg,
}: any) {
  const isNegative = trend.startsWith('-')
  const isGood = trendDownGood ? isNegative : !isNegative

  return (
    <div className='bg-white p-6 rounded-2xl border border-slate-200 shadow-sm'>
      <div className='flex justify-between items-start mb-4'>
        <div className={`p-3 rounded-xl ${bg} ${color}`}>
          <Icon size={18} />
        </div>
        <div
          className={`flex items-center gap-0.5 px-2 py-1 rounded-md text-[9px] font-black ${isGood ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}
        >
          {isGood ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}{' '}
          {trend}
        </div>
      </div>
      <p className='text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1.5'>
        {title}
      </p>
      <p className='text-xl font-black text-slate-900 tracking-tight'>
        {value}
      </p>
    </div>
  )
}

function HealthItem({ label, status }: { label: string; status: string }) {
  return (
    <div className='flex justify-between items-center p-2.5 bg-slate-50 rounded-lg border border-slate-100'>
      <span className='text-[10px] font-bold text-slate-600'>{label}</span>
      <span className='text-[8px] font-black text-emerald-600 uppercase flex items-center gap-1'>
        <div className='w-1 h-1 bg-emerald-500 rounded-full animate-pulse' />{' '}
        {status}
      </span>
    </div>
  )
}
