'use client'

import React, { useState } from 'react'
import {
  ShieldCheck,
  Lock,
  UserPlus,
  Trash2,
  Settings,
  Eye,
  Edit3,
  Database,
  CreditCard,
  Search,
  ShieldAlert,
  Fingerprint,
  ChevronRight,
  Activity,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export default function RolesPermissions() {
  const staff = [
    {
      id: 'S1',
      name: 'Dr. Philip',
      role: 'Super Admin',
      access: 'System Wide',
      lastSeen: '2m ago',
    },
    {
      id: 'S2',
      name: 'Dhoctor Jay Emmanuel',
      role: 'Editor',
      access: 'Question Bank',
      lastSeen: '1h ago',
    },
    {
      id: 'S3',
      name: 'Kato A',
      role: 'Moderator',
      access: 'Proctoring',
      lastSeen: 'Yesterday',
    },
  ]

  const permissionsList = [
    {
      module: 'Question Bank',
      icon: Database,
      scopes: ['Read', 'Write', 'Delete'],
    },
    {
      module: 'Revenue & Sales',
      icon: CreditCard,
      scopes: ['Read', 'Refunds'],
      restricted: true,
    },
    { module: 'Live Proctoring', icon: Eye, scopes: ['View', 'Terminate'] },
    {
      module: 'User Management',
      icon: Settings,
      scopes: ['Read', 'Suspend', 'Reset'],
    },
  ]

  return (
    <div className='max-w-6xl mx-auto space-y-6 animate-in fade-in duration-500 pb-10 px-4'>
      {/* Admin Header */}
      <div className='flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4'>
        <div>
          <h1 className='text-2xl font-black text-slate-900 tracking-tight'>
            Access Control
          </h1>
          <p className='text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1 flex items-center gap-2'>
            <Fingerprint size={12} className='text-blue-500' />
            Staff Authorization & Security Scopes
          </p>
        </div>
        <button className='flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all'>
          <UserPlus size={14} /> Provision New Access
        </button>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-12 gap-6'>
        {/* Staff Directory */}
        <div className='lg:col-span-8 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden'>
          <div className='px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/30'>
            <h3 className='font-black text-slate-900 uppercase tracking-widest text-[10px]'>
              Active Staff Directory
            </h3>
            <div className='relative'>
              <Search
                className='absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400'
                size={12}
              />
              <input
                type='text'
                placeholder='Search by name/role...'
                className='pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-[10px] font-bold outline-none focus:ring-2 focus:ring-blue-500/10 w-44'
              />
            </div>
          </div>
          <div className='overflow-x-auto'>
            <table className='w-full text-left'>
              <thead>
                <tr className='bg-slate-50/50 border-b border-slate-100'>
                  <th className='px-6 py-3 text-[9px] font-black uppercase text-slate-400'>
                    Team Member
                  </th>
                  <th className='px-6 py-3 text-[9px] font-black uppercase text-slate-400'>
                    Authorization
                  </th>
                  <th className='px-6 py-3 text-[9px] font-black uppercase text-slate-400'>
                    Primary Scope
                  </th>
                  <th className='px-6 py-3 text-[9px] font-black uppercase text-slate-400 text-right'>
                    Settings
                  </th>
                </tr>
              </thead>
              <tbody className='divide-y divide-slate-50'>
                {staff.map((member) => (
                  <tr
                    key={member.id}
                    className='group hover:bg-blue-50/20 transition-colors'
                  >
                    <td className='px-6 py-4'>
                      <div className='flex items-center gap-3'>
                        <div className='w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600 font-black text-[10px] border border-slate-200'>
                          {member.name
                            .split(' ')
                            .map((n) => n[0])
                            .join('')}
                        </div>
                        <div>
                          <p className='text-xs font-bold text-slate-800'>
                            {member.name}
                          </p>
                          <p className='text-[9px] text-[#FCB900] font-medium flex items-center gap-1'>
                            <Activity size={8} /> Seen {member.lastSeen}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className='px-4 py-2'>
                      <span
                        className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase border ${
                          member.role === 'Super Admin'
                            ? 'bg-slate-900 text-white border-slate-800'
                            : 'bg-blue-50 text-blue-600 border-blue-100'
                        }`}
                      >
                        {member.role}
                      </span>
                    </td>
                    <td className='px-4 py-4 text-[10px] text-slate-500 font-bold uppercase tracking-tight'>
                      {member.access}
                    </td>
                    <td className='px-6 py-4 text-right'>
                      <div className='flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity'>
                        <button className='p-1.5 text-slate-400 hover:text-blue-600 hover:bg-white rounded-md transition-all shadow-sm border border-transparent hover:border-slate-100'>
                          <Edit3 size={14} />
                        </button>
                        <button className='p-1.5 text-slate-400 hover:text-rose-600 hover:bg-white rounded-md transition-all shadow-sm border border-transparent hover:border-slate-100'>
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Permissions Blueprint Sidebar */}
        <div className='lg:col-span-4 space-y-4'>
          <div className='bg-slate-900 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden'>
            <div className='absolute top-0 right-0 p-4 opacity-10'>
              <ShieldCheck size={80} />
            </div>

            <div className='flex items-center gap-2 mb-6 text-blue-400 relative z-10'>
              <Lock size={16} />
              <h3 className='font-black uppercase tracking-widest text-[10px]'>
                Security Blueprint
              </h3>
            </div>

            <div className='space-y-6 relative z-10'>
              {permissionsList.map((perm) => (
                <div key={perm.module} className='space-y-2.5'>
                  <div className='flex items-center justify-between'>
                    <div className='flex items-center gap-2'>
                      <perm.icon size={12} className='text-slate-500' />
                      <span className='text-[10px] font-black uppercase tracking-wider text-slate-300'>
                        {perm.module}
                      </span>
                    </div>
                    {perm.restricted && (
                      <Lock size={10} className='text-rose-500' />
                    )}
                  </div>
                  <div className='flex flex-wrap gap-1.5'>
                    {perm.scopes.map((scope) => (
                      <button
                        key={scope}
                        className='px-2.5 py-1 bg-slate-800 border border-slate-700 rounded-md text-[9px] font-bold text-slate-400 hover:border-blue-500 hover:text-white transition-all'
                      >
                        {scope}
                      </button>
                    ))}
                  </div>
                </div>
              ))}

              <button className='w-full py-3 bg-blue-600 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-900/40 mt-2'>
                Commit Changes
              </button>
            </div>
          </div>

          <div className='bg-amber-50 border border-amber-100 rounded-2xl p-5'>
            <div className='flex items-center gap-2 text-amber-700 mb-2'>
              <ShieldAlert size={16} />
              <span className='text-[10px] font-black uppercase tracking-widest'>
                Audited Environment
              </span>
            </div>
            <p className='text-[11px] text-amber-800 font-bold leading-relaxed opacity-80'>
              Administrative changes are recorded to the immutable audit log.
              Unauthorized attempts trigger a lockout.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
