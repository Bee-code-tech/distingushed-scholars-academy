
// // src/app/admin/components/RolesPermissions.tsx
// 'use client'

// import React, { useEffect, useMemo, useState } from 'react'
// import {
//   ShieldCheck,
//   Lock,
//   UserPlus,
//   Trash2,
//   Mail,
//   Fingerprint,
//   ShieldAlert,
//   Activity,
//   Loader2,
//   CheckCircle2,
//   AlertCircle,
//   X,
//   Check,
//   Plus,
//   Cloud,
//   HardDrive,
//   Search,
//   Users,
//   Eye,
//   EyeOff,
//   Copy,
//   Sparkles,
//   ChevronRight,
// } from 'lucide-react'
// import { Badge } from '@/components/ui/badge'
// import {
//   PERMISSIONS,
//   PERMISSION_MODULES,
//   getRoles,
//   getStaff,
//   addStaff,
//   removeStaff,
//   saveRole,
//   deleteRole,
//   permissionLabel,
//   type StaffRole,
//   type StaffMember,
// } from '@/lib/staffStore'
// import { dsaApi } from '@/lib/admin-api'

// export default function RolesPermissions() {
//   const [mounted, setMounted] = useState(false)
//   const [roles, setRoles] = useState<StaffRole[]>([])
//   const [staff, setStaff] = useState<StaffMember[]>([])
//   const [showForm, setShowForm] = useState(false)
//   const [source, setSource] = useState<'server' | 'local'>('local')

//   // Search & Filter state for Staff Directory
//   const [searchQuery, setSearchQuery] = useState('')
//   const [selectedRoleFilter, setSelectedRoleFilter] = useState<string>('all')

//   // Selected role for the permission blueprint editor
//   const [activeRoleId, setActiveRoleId] = useState<string>('')

//   const refresh = async () => {
//     let loadedRoles: StaffRole[] = []

//     try {
//       // Fetch roles directly from backend GET /api/admin/roles
//       const res = (await dsaApi.admin.getRoles()) as { data?: any[] } | any[]
//       const rolesData = Array.isArray(res) ? res : res?.data

//       if (Array.isArray(rolesData) && rolesData.length > 0) {
//         loadedRoles = rolesData.map(
//           (r: { id: string; name: string; permissions: string[] }) => ({
//             id: r.id,
//             name: r.name,
//             permissions: r.permissions || [],
//             seeded: true,
//           }),
//         )
//         setSource('server')
//       } else {
//         throw new Error('No server roles returned')
//       }
//     } catch {
//       // Local fallback if API request fails or endpoint is unavailable
//       loadedRoles = getRoles()
//       setSource('local')
//     }

//     setRoles(loadedRoles)
//     setStaff(getStaff())
//     setActiveRoleId((cur) =>
//       loadedRoles.some((x) => x.id === cur) ? cur : (loadedRoles[0]?.id ?? ''),
//     )
//   }

//   useEffect(() => {
//     setMounted(true)
//     refresh()
//   }, [])

//   const activeRole = useMemo(
//     () => roles.find((r) => r.id === activeRoleId),
//     [roles, activeRoleId],
//   )

//   const roleName = (id: string) => roles.find((r) => r.id === id)?.name ?? '—'

//   // Filter staff by search text and role dropdown selection
//   const filteredStaff = useMemo(() => {
//     return staff.filter((member) => {
//       const matchesSearch =
//         member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
//         member.email.toLowerCase().includes(searchQuery.toLowerCase())
//       const matchesRole =
//         selectedRoleFilter === 'all' || member.roleId === selectedRoleFilter

//       return matchesSearch && matchesRole
//     })
//   }, [staff, searchQuery, selectedRoleFilter])

//   if (!mounted) {
//     return (
//       <div className='max-w-7xl mx-auto min-h-[60vh] flex flex-col items-center justify-center gap-3'>
//         <Loader2 className='w-8 h-8 animate-spin text-blue-600' />
//         <p className='text-xs font-bold text-slate-400 uppercase tracking-wider'>
//           Loading Access Control Framework...
//         </p>
//       </div>
//     )
//   }

//   return (
//     <div className='max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-3 duration-500 pb-16 px-4 sm:px-6'>
//       {/* Top Header Banner */}
//       <div className='flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm relative overflow-hidden'>
//         <div className='absolute -right-10 -bottom-10 opacity-5 pointer-events-none'>
//           <ShieldCheck size={220} className='text-blue-600' />
//         </div>

//         <div className='space-y-1 relative z-10'>
//           <div className='flex items-center gap-3 flex-wrap'>
//             <h1 className='text-2xl sm:text-3xl font-black text-slate-900 tracking-tight'>
//               Access Control &amp; Staff Security
//             </h1>
//             <Badge
//               className={`text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full flex items-center gap-1.5 ${
//                 source === 'server'
//                   ? 'bg-emerald-50 text-emerald-600 border border-emerald-200/60'
//                   : 'bg-amber-50 text-amber-700 border border-amber-200/60'
//               }`}
//             >
//               {source === 'server' ? (
//                 <>
//                   <span className='w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse' />
//                   <Cloud size={11} /> Live Server Synchronized
//                 </>
//               ) : (
//                 <>
//                   <HardDrive size={11} /> Local Storage Mode
//                 </>
//               )}
//             </Badge>
//           </div>
//           <p className='text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2 pt-0.5'>
//             <Fingerprint size={14} className='text-blue-600' />
//             Manage team accounts, assign responsibilities, and adjust module access blueprints.
//           </p>
//         </div>

//         <div className='flex items-center gap-3 relative z-10'>
//           <button
//             onClick={() => setShowForm(true)}
//             className='w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-2xl text-xs font-black uppercase tracking-wider shadow-lg shadow-blue-500/20 hover:bg-blue-700 hover:shadow-blue-500/30 active:scale-95 transition-all duration-200'
//           >
//             <UserPlus size={16} /> Provision New Access
//           </button>
//         </div>
//       </div>

//       {/* Main Grid: Staff Directory + Role Blueprint Editor */}
//       <div className='grid grid-cols-1 lg:grid-cols-12 gap-8 items-start'>
//         {/* Left Section: Staff Directory (7 Cols) */}
//         <div className='lg:col-span-7 space-y-4'>
//           <div className='bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden transition-all'>
//             {/* Header & Controls */}
//             <div className='p-6 border-b border-slate-100 bg-slate-50/40 space-y-4'>
//               <div className='flex items-center justify-between'>
//                 <div className='flex items-center gap-2.5'>
//                   <div className='p-2 rounded-xl bg-blue-50 text-blue-600'>
//                     <Users size={18} />
//                   </div>
//                   <div>
//                     <h2 className='font-black text-slate-900 uppercase tracking-wider text-xs'>
//                       Staff Directory
//                     </h2>
//                     <p className='text-[11px] text-slate-400 font-medium'>
//                       Active team accounts and assigned administrative roles
//                     </p>
//                   </div>
//                 </div>
//                 <Badge className='bg-slate-100 text-slate-700 hover:bg-slate-100 text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg border border-slate-200/60'>
//                   {staff.length} Account{staff.length === 1 ? '' : 's'}
//                 </Badge>
//               </div>

//               {/* Search & Filter Bar */}
//               <div className='flex flex-col sm:flex-row gap-3 pt-1'>
//                 <div className='relative flex-1'>
//                   <Search
//                     size={14}
//                     className='absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400'
//                   />
//                   <input
//                     type='text'
//                     value={searchQuery}
//                     onChange={(e) => setSearchQuery(e.target.value)}
//                     placeholder='Search staff by name or email...'
//                     className='w-full h-10 pl-9 pr-4 rounded-xl bg-white border border-slate-200 text-xs font-medium placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all'
//                   />
//                   {searchQuery && (
//                     <button
//                       onClick={() => setSearchQuery('')}
//                       className='absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600'
//                     >
//                       <X size={12} />
//                     </button>
//                   )}
//                 </div>

//                 <select
//                   value={selectedRoleFilter}
//                   onChange={(e) => setSelectedRoleFilter(e.target.value)}
//                   className='h-10 px-3 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 focus:outline-none focus:border-blue-500 transition-all cursor-pointer'
//                 >
//                   <option value='all'>All Roles ({roles.length})</option>
//                   {roles.map((r) => (
//                     <option key={r.id} value={r.id}>
//                       {r.name}
//                     </option>
//                   ))}
//                 </select>
//               </div>
//             </div>

//             {/* Directory List */}
//             {filteredStaff.length === 0 ? (
//               <div className='px-6 py-16 text-center space-y-3'>
//                 <div className='w-14 h-14 mx-auto rounded-2xl bg-slate-50 flex items-center justify-center text-slate-300 border border-slate-100 shadow-inner'>
//                   <UserPlus size={26} />
//                 </div>
//                 <div className='max-w-xs mx-auto space-y-1'>
//                   <p className='text-xs font-bold text-slate-700'>
//                     {staff.length === 0
//                       ? 'No staff accounts provisioned yet'
//                       : 'No staff match your filters'}
//                   </p>
//                   <p className='text-[11px] text-slate-400 font-medium leading-relaxed'>
//                     {staff.length === 0
//                       ? 'Click “Provision New Access” above to create accounts for secretaries, bursars, or system auditors.'
//                       : 'Try resetting your search input or role selection filter.'}
//                   </p>
//                 </div>
//                 {staff.length > 0 && (
//                   <button
//                     onClick={() => {
//                       setSearchQuery('')
//                       setSelectedRoleFilter('all')
//                     }}
//                     className='mt-2 px-4 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all'
//                   >
//                     Clear Filters
//                   </button>
//                 )}
//               </div>
//             ) : (
//               <div className='overflow-x-auto'>
//                 <table className='w-full text-left border-collapse'>
//                   <thead>
//                     <tr className='bg-slate-50/70 border-b border-slate-100'>
//                       <th className='px-6 py-3.5 text-[9px] font-black uppercase tracking-wider text-slate-400'>
//                         Team Member
//                       </th>
//                       <th className='px-4 py-3.5 text-[9px] font-black uppercase tracking-wider text-slate-400'>
//                         Role Assignment
//                       </th>
//                       <th className='px-6 py-3.5 text-[9px] font-black uppercase tracking-wider text-slate-400 text-right'>
//                         Action
//                       </th>
//                     </tr>
//                   </thead>
//                   <tbody className='divide-y divide-slate-100'>
//                     {filteredStaff.map((member) => (
//                       <tr
//                         key={member.id}
//                         className='group hover:bg-blue-50/30 transition-colors duration-150'
//                       >
//                         <td className='px-6 py-4'>
//                           <div className='flex items-center gap-3.5'>
//                             <div className='w-10 h-10 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-slate-700 font-black text-xs border border-slate-200/80 shadow-sm shrink-0 group-hover:scale-105 transition-transform'>
//                               {member.name
//                                 .split(' ')
//                                 .map((n) => n[0])
//                                 .join('')
//                                 .slice(0, 2)
//                                 .toUpperCase()}
//                             </div>
//                             <div className='min-w-0'>
//                               <p className='text-xs font-bold text-slate-800 truncate group-hover:text-blue-600 transition-colors'>
//                                 {member.name}
//                               </p>
//                               <p className='text-[11px] text-slate-400 font-medium flex items-center gap-1.5 truncate mt-0.5'>
//                                 <Mail size={11} className='text-slate-400 shrink-0' />
//                                 <span className='truncate'>{member.email}</span>
//                               </p>
//                             </div>
//                           </div>
//                         </td>
//                         <td className='px-4 py-4'>
//                           <span className='inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider border bg-blue-50 text-blue-700 border-blue-200/60 shadow-sm'>
//                             <ShieldCheck size={12} className='text-blue-500' />
//                             {roleName(member.roleId)}
//                           </span>
//                         </td>
//                         <td className='px-6 py-4 text-right'>
//                           <button
//                             onClick={async () => {
//                               if (
//                                 confirm(
//                                   `Are you sure you want to revoke access for ${member.name}?`,
//                                 )
//                               ) {
//                                 removeStaff(member.id)
//                                 await refresh()
//                               }
//                             }}
//                             className='p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all border border-transparent hover:border-rose-100'
//                             title='Revoke Staff Account'
//                           >
//                             <Trash2 size={15} />
//                           </button>
//                         </td>
//                       </tr>
//                     ))}
//                   </tbody>
//                 </table>
//               </div>
//             )}

//             {/* Footer Notice */}
//             <div className='px-6 py-3.5 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between gap-2 flex-wrap'>
//               <p className='text-[10px] text-slate-500 font-bold flex items-center gap-1.5'>
//                 <Activity size={12} className='text-amber-500 shrink-0' />
//                 Staff authenticate via the standard portal using their email address.
//               </p>
//               <span className='text-[10px] font-black uppercase text-slate-400'>
//                 {filteredStaff.length} Shown
//               </span>
//             </div>
//           </div>
//         </div>

//         {/* Right Section: Role Blueprint & Permissions Editor (5 Cols) */}
//         <div className='lg:col-span-5 space-y-4'>
//           <div className='bg-slate-900 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden border border-slate-800'>
//             <div className='absolute top-0 right-0 p-6 opacity-5 pointer-events-none'>
//               <Lock size={140} />
//             </div>

//             {/* Blueprint Header */}
//             <div className='flex items-center justify-between mb-5 relative z-10'>
//               <div className='flex items-center gap-2.5 text-blue-400'>
//                 <div className='p-2 rounded-xl bg-blue-500/10 border border-blue-500/20'>
//                   <Lock size={16} />
//                 </div>
//                 <div>
//                   <h3 className='font-black uppercase tracking-wider text-xs text-white'>
//                     Role Permission Blueprint
//                   </h3>
//                   <p className='text-[10px] text-slate-400 font-medium'>
//                     Configure action grants per system role
//                   </p>
//                 </div>
//               </div>
//             </div>

//             {/* Role Pills & Selector */}
//             <div className='flex flex-wrap gap-2 mb-6 relative z-10 bg-slate-950/50 p-2.5 rounded-2xl border border-slate-800/80'>
//               {roles.map((r) => (
//                 <div key={r.id} className='inline-flex items-center'>
//                   <button
//                     onClick={() => setActiveRoleId(r.id)}
//                     className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider border transition-all duration-200 flex items-center gap-1.5 ${
//                       activeRoleId === r.id
//                         ? 'bg-blue-600 border-blue-500 text-white shadow-md shadow-blue-600/30'
//                         : 'bg-slate-800/80 border-slate-700/70 text-slate-400 hover:text-white hover:border-slate-600'
//                     }`}
//                   >
//                     {r.name}
//                     {!r.seeded && (
//                       <span
//                         onClick={async (e) => {
//                           e.stopPropagation()
//                           if (
//                             confirm(
//                               `Delete the custom role "${r.name}"? Staff assigned to this role will lose permissions.`,
//                             )
//                           ) {
//                             try {
//                               await dsaApi.admin.deleteRole(r.id)
//                             } catch {
//                               deleteRole(r.id) // offline fallback
//                             }
//                             await refresh()
//                           }
//                         }}
//                         className='ml-1 text-slate-400 hover:text-rose-400 p-0.5 rounded hover:bg-slate-700/50'
//                         title='Delete Role'
//                       >
//                         <X size={10} />
//                       </span>
//                     )}
//                   </button>
//                 </div>
//               ))}
//               <NewRoleButton
//                 onCreate={async (name) => {
//                   try {
//                     const res = (await dsaApi.admin.upsertRole({
//                       name,
//                       permissions: [],
//                     })) as { data?: { id?: string; _id?: string } }
//                     await refresh()
//                     const newId = res?.data?.id ?? res?.data?._id
//                     if (newId) setActiveRoleId(String(newId))
//                   } catch {
//                     // offline fallback — keep the local store working
//                     const created = saveRole({ name, permissions: [] })
//                     await refresh()
//                     setActiveRoleId(created.id)
//                   }
//                 }}
//               />
//             </div>

//             {/* Permission Toggles */}
//             {activeRole && (
//               <PermissionToggles
//                 role={activeRole}
//                 onSave={async (perms) => {
//                   try {
//                     await dsaApi.admin.upsertRole({
//                       id: activeRole.id,
//                       name: activeRole.name,
//                       permissions: perms,
//                     })
//                   } catch {
//                     saveRole({
//                       id: activeRole.id,
//                       name: activeRole.name,
//                       permissions: perms,
//                     })
//                   }
//                   await refresh()
//                 }}
//               />
//             )}
//           </div>

//           {/* System Enforcement Notice Card */}
//           <div className='bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/20 rounded-3xl p-5 backdrop-blur-sm'>
//             <div className='flex items-center gap-2.5 text-amber-700 mb-2'>
//               <ShieldAlert size={18} className='text-amber-600 shrink-0' />
//               <span className='text-xs font-black uppercase tracking-wider'>
//                 Backend Security Guarantee
//               </span>
//             </div>
//             <p className='text-[11px] text-amber-900/80 font-semibold leading-relaxed'>
//               Permissions defined here act as server-enforced security policies. Even if front-end controls are bypassed, API endpoints validate every incoming authorization header against these active role blueprints.
//             </p>
//           </div>
//         </div>
//       </div>

//       {/* Provision Staff Modal */}
//       {showForm && (
//         <CreateStaffModal
//           roles={roles}
//           onClose={() => setShowForm(false)}
//           onCreated={async () => {
//             await refresh()
//             setShowForm(false)
//           }}
//         />
//       )}
//     </div>
//   )
// }

// /* ---------------------------------------------------------------- */
// /* Permission toggles module grid for the active role               */
// /* ---------------------------------------------------------------- */
// function PermissionToggles({
//   role,
//   onSave,
// }: {
//   role: StaffRole
//   onSave: (perms: string[]) => void
// }) {
//   const [selected, setSelected] = useState<string[]>(role.permissions)
//   const [saved, setSaved] = useState(false)

//   // Sync state when selection changes
//   useEffect(() => {
//     setSelected(role.permissions)
//     setSaved(false)
//   }, [role.id, role.permissions])

//   const toggle = (key: string) => {
//     setSaved(false)
//     setSelected((cur) =>
//       cur.includes(key) ? cur.filter((k) => k !== key) : [...cur, key],
//     )
//   }

//   const dirty =
//     selected.length !== role.permissions.length ||
//     selected.some((k) => !role.permissions.includes(k))

//   return (
//     <div className='space-y-5 relative z-10'>
//       <div className='max-h-[380px] overflow-y-auto pr-1 space-y-4 custom-scrollbar'>
//         {PERMISSION_MODULES.map((mod) => (
//           <div
//             key={mod}
//             className='bg-slate-950/40 rounded-2xl p-3 border border-slate-800/60 space-y-2'
//           >
//             <span className='text-[9px] font-black uppercase tracking-widest text-blue-400/90 block px-1'>
//               {mod} Module
//             </span>
//             <div className='flex flex-wrap gap-1.5'>
//               {PERMISSIONS.filter((p) => p.module === mod).map((p) => {
//                 const on = selected.includes(p.key)
//                 return (
//                   <button
//                     key={p.key}
//                     type='button'
//                     onClick={() => toggle(p.key)}
//                     className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-[10px] font-bold border transition-all duration-150 ${
//                       on
//                         ? 'bg-blue-600/90 border-blue-500 text-white shadow-sm'
//                         : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
//                     }`}
//                     title={p.key}
//                   >
//                     <div
//                       className={`w-3.5 h-3.5 rounded-md flex items-center justify-center text-[9px] transition-colors ${
//                         on ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-500'
//                       }`}
//                     >
//                       {on ? <Check size={10} /> : null}
//                     </div>
//                     {p.label}
//                     {p.sensitive && (
//                       <Lock
//                         size={10}
//                         className={on ? 'text-blue-200' : 'text-amber-400'}
//                       />
//                     )}
//                   </button>
//                 )
//               })}
//             </div>
//           </div>
//         ))}
//       </div>

//       {/* Save Trigger Button */}
//       <button
//         type='button'
//         onClick={() => {
//           onSave(selected)
//           setSaved(true)
//         }}
//         disabled={!dirty && !saved}
//         className='w-full py-3.5 bg-blue-600 rounded-2xl font-black text-xs uppercase tracking-wider hover:bg-blue-500 active:scale-[0.99] transition-all shadow-lg shadow-blue-900/40 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2'
//       >
//         {saved && !dirty ? (
//           <>
//             <CheckCircle2 size={16} className='text-emerald-300' /> Blueprint Saved
//           </>
//         ) : (
//           <>
//             <Sparkles size={15} /> Commit Permission Changes
//           </>
//         )}
//       </button>
//     </div>
//   )
// }

// /* ---------------------------------------------------------------- */
// /* New Role creation button inline input                            */
// /* ---------------------------------------------------------------- */
// function NewRoleButton({ onCreate }: { onCreate: (name: string) => void }) {
//   const [adding, setAdding] = useState(false)
//   const [name, setName] = useState('')

//   if (!adding) {
//     return (
//       <button
//         type='button'
//         onClick={() => setAdding(true)}
//         className='px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider border border-dashed border-slate-700 text-slate-400 hover:text-white hover:border-blue-500 hover:bg-slate-800/50 transition-all flex items-center gap-1'
//       >
//         <Plus size={11} /> Custom Role
//       </button>
//     )
//   }

//   const commit = () => {
//     if (name.trim().length >= 2) onCreate(name.trim())
//     setName('')
//     setAdding(false)
//   }

//   return (
//     <div className='inline-flex items-center gap-1.5 bg-slate-900 p-1 rounded-xl border border-blue-500/80'>
//       <input
//         autoFocus
//         value={name}
//         onChange={(e) => setName(e.target.value)}
//         onKeyDown={(e) => {
//           if (e.key === 'Enter') commit()
//           if (e.key === 'Escape') {
//             setName('')
//             setAdding(false)
//           }
//         }}
//         placeholder='e.g. Bursar'
//         className='w-24 px-2 py-0.5 text-xs font-bold bg-transparent text-white outline-none placeholder:text-slate-500'
//       />
//       <button
//         type='button'
//         onClick={commit}
//         className='p-1 rounded-lg bg-blue-600 text-white hover:bg-blue-500 transition-colors'
//       >
//         <Check size={12} />
//       </button>
//       <button
//         type='button'
//         onClick={() => setAdding(false)}
//         className='p-1 rounded-lg text-slate-400 hover:text-white'
//       >
//         <X size={12} />
//       </button>
//     </div>
//   )
// }

// /* ---------------------------------------------------------------- */
// /* Create Staff Account Modal Component                             */
// /* ---------------------------------------------------------------- */
// function suggestPassword() {
//   return 'DSAstaff' + Math.floor(1000 + ((Date.now() / 1000) % 9000))
// }

// function CreateStaffModal({
//   roles,
//   onClose,
//   onCreated,
// }: {
//   roles: StaffRole[]
//   onClose: () => void
//   onCreated: () => void
// }) {
//   const [name, setName] = useState('')
//   const [email, setEmail] = useState('')
//   const [roleId, setRoleId] = useState(roles[0]?.id ?? '')
//   const [password, setPassword] = useState(suggestPassword())
//   const [showPass, setShowPass] = useState(false)
//   const [copied, setCopied] = useState(false)
//   const [error, setError] = useState('')
//   const [loading, setLoading] = useState(false)

//   const submit = async (e: React.FormEvent) => {
//     e.preventDefault()
//     setError('')

//     if (name.trim().length < 2) return setError('Enter the staff member’s full name')
//     if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email))
//       return setError('Enter a valid email address')
//     if (!roleId) return setError('Pick a role assignment')
//     if (password.length < 6)
//       return setError('Password must be at least 6 characters long')

//     setLoading(true)
//     try {
//       // Create the real, loginable account on the backend (POST /api/admin/staff).
//       // The account is active + verified, so the staff member can sign in live.
//       await dsaApi.admin.createStaff({
//         fullname: name.trim(),
//         name: name.trim(),
//         email: email.trim().toLowerCase(),
//         password,
//         role: 'staff',
//         staffRoleId: roleId,
//       })
//       // Mirror into the local roster so it also shows on this browser immediately.
//       addStaff({ name, email, roleId, password, now: Date.now() })
//       onCreated()
//     } catch (err) {
//       setError(
//         err instanceof Error
//           ? err.message
//           : 'Could not create the staff account. Please try again.',
//       )
//     } finally {
//       setLoading(false)
//     }
//   }

//   const copyCredentials = () => {
//     navigator.clipboard.writeText(`Email: ${email}\nPassword: ${password}`)
//     setCopied(true)
//     setTimeout(() => setCopied(false), 2000)
//   }

//   const selectedRole = roles.find((r) => r.id === roleId)

//   return (
//     <div className='fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md animate-in fade-in duration-200'>
//       <div className='w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-200'>
//         {/* Header */}
//         <div className='flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50'>
//           <div className='flex items-center gap-3'>
//             <div className='h-10 w-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20'>
//               <UserPlus size={18} />
//             </div>
//             <div>
//               <h3 className='text-sm font-black text-slate-900 uppercase tracking-tight'>
//                 Provision Staff Account
//               </h3>
//               <p className='text-[11px] font-medium text-slate-400'>
//                 Assign system responsibilities and access credentials
//               </p>
//             </div>
//           </div>
//           <button
//             type='button'
//             onClick={onClose}
//             className='p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition-colors'
//           >
//             <X size={18} />
//           </button>
//         </div>

//         {/* Form */}
//         <form onSubmit={submit} className='p-6 space-y-4'>
//           {error && (
//             <div className='flex items-center gap-2 p-3.5 rounded-2xl bg-rose-50 border border-rose-100 text-rose-600 text-xs font-bold animate-in fade-in'>
//               <AlertCircle size={16} className='shrink-0' /> {error}
//             </div>
//           )}

//           <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
//             <label className='space-y-1.5 block'>
//               <span className='text-[10px] font-black uppercase tracking-wider text-slate-400'>
//                 Full Name
//               </span>
//               <input
//                 value={name}
//                 onChange={(e) => setName(e.target.value)}
//                 placeholder='e.g. Grace Okon'
//                 className='w-full h-11 px-3.5 rounded-xl bg-slate-50 border border-slate-200/80 focus:border-blue-500 focus:bg-white outline-none text-xs font-bold transition-all'
//               />
//             </label>
//             <label className='space-y-1.5 block'>
//               <span className='text-[10px] font-black uppercase tracking-wider text-slate-400'>
//                 Email Address
//               </span>
//               <input
//                 type='email'
//                 value={email}
//                 onChange={(e) => setEmail(e.target.value)}
//                 placeholder='staff@domain.com'
//                 className='w-full h-11 px-3.5 rounded-xl bg-slate-50 border border-slate-200/80 focus:border-blue-500 focus:bg-white outline-none text-xs font-bold transition-all'
//               />
//             </label>
//           </div>

//           <label className='space-y-1.5 block'>
//             <span className='text-[10px] font-black uppercase tracking-wider text-slate-400'>
//               Assigned Role
//             </span>
//             <select
//               value={roleId}
//               onChange={(e) => setRoleId(e.target.value)}
//               className='w-full h-11 px-3.5 rounded-xl bg-slate-50 border border-slate-200/80 focus:border-blue-500 focus:bg-white outline-none text-xs font-bold transition-all cursor-pointer'
//             >
//               {roles.map((r) => (
//                 <option key={r.id} value={r.id}>
//                   {r.name}
//                 </option>
//               ))}
//             </select>
//           </label>

//           {/* Role Preview Card */}
//           {selectedRole && (
//             <div className='rounded-2xl bg-slate-50 border border-slate-200/60 p-3.5 space-y-2'>
//               <div className='flex items-center justify-between'>
//                 <span className='text-[10px] font-black uppercase tracking-wider text-slate-500'>
//                   {selectedRole.name} Role Grants ({selectedRole.permissions.length})
//                 </span>
//               </div>
//               {selectedRole.permissions.length === 0 ? (
//                 <p className='text-[11px] text-slate-400 font-medium'>
//                   No module grants configured yet for this role.
//                 </p>
//               ) : (
//                 <div className='flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1 custom-scrollbar'>
//                   {selectedRole.permissions.map((k) => (
//                     <span
//                       key={k}
//                       className='px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-[9px] font-bold text-slate-700 shadow-2xs'
//                     >
//                       {permissionLabel(k)}
//                     </span>
//                   ))}
//                 </div>
//               )}
//             </div>
//           )}

//           {/* Password Input & Generator */}
//           <label className='space-y-1.5 block'>
//             <span className='text-[10px] font-black uppercase tracking-wider text-slate-400'>
//               Temporary Password
//             </span>
//             <div className='flex gap-2'>
//               <div className='relative flex-1'>
//                 <input
//                   type={showPass ? 'text' : 'password'}
//                   value={password}
//                   onChange={(e) => setPassword(e.target.value)}
//                   className='w-full h-11 pl-3.5 pr-10 rounded-xl bg-slate-50 border border-slate-200/80 focus:border-blue-500 focus:bg-white outline-none text-xs font-mono font-bold transition-all'
//                 />
//                 <button
//                   type='button'
//                   onClick={() => setShowPass(!showPass)}
//                   className='absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600'
//                 >
//                   {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
//                 </button>
//               </div>

//               <button
//                 type='button'
//                 onClick={() => setPassword(suggestPassword())}
//                 className='px-3.5 h-11 rounded-xl bg-slate-100 hover:bg-slate-200 text-[10px] font-black uppercase tracking-wider text-slate-700 transition-colors'
//               >
//                 Regenerate
//               </button>
//               <button
//                 type='button'
//                 onClick={copyCredentials}
//                 className='px-3 h-11 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors'
//                 title='Copy Credentials'
//               >
//                 {copied ? <Check size={14} className='text-emerald-600' /> : <Copy size={14} />}
//               </button>
//             </div>
//           </label>

//           {/* Action Footer */}
//           <div className='flex items-center justify-between gap-3 pt-3 border-t border-slate-100'>
//             <p className='text-[10px] font-medium text-slate-400'>
//               The staff member can change their password upon initial login.
//             </p>
//             <button
//               type='submit'
//               disabled={loading}
//               className='shrink-0 flex items-center gap-2 px-6 h-11 bg-blue-600 text-white rounded-xl font-black text-xs uppercase tracking-wider shadow-lg shadow-blue-500/20 hover:bg-blue-700 active:scale-95 transition-all disabled:opacity-60'
//             >
//               {loading ? (
//                 <Loader2 size={16} className='animate-spin' />
//               ) : (
//                 <>
//                   <UserPlus size={15} /> Provision Account
//                 </>
//               )}
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   )
// }



'use client'

import React, { useEffect, useMemo, useState } from 'react'
import {
  ShieldCheck,
  Lock,
  UserPlus,
  Trash2,
  Mail,
  Fingerprint,
  ShieldAlert,
  Activity,
  Loader2,
  CheckCircle2,
  AlertCircle,
  X,
  Check,
  Plus,
  Cloud,
  HardDrive,
  Search,
  Users,
  Eye,
  EyeOff,
  Copy,
  Sparkles,
} from 'lucide-react'

import { Badge } from '@/components/ui/badge'

import {
  PERMISSIONS,
  PERMISSION_MODULES,
  getRoles,
  getStaff,
  removeStaff,
  saveRole,
  deleteRole,
  permissionLabel,
  type StaffRole,
  type StaffMember,
} from '@/lib/staffStore'

import { dsaApi } from '@/lib/admin-api'

/**
 * RolesPermissions
 *
 * Main Access Control page for:
 * - Viewing staff accounts
 * - Searching/filtering staff
 * - Assigning staff roles
 * - Managing role permissions
 * - Creating staff accounts
 * - Revoking staff access
 *
 * IMPORTANT:
 * The backend is the source of truth when the API is available.
 *
 * Staff are loaded through the existing endpoint:
 *
 *   GET /api/admin/users?role=staff
 *
 * We intentionally do NOT use dsaApi.admin.getStaff()
 * because that method does not exist in your admin-api.ts.
 */
export default function RolesPermissions() {
  const [mounted, setMounted] = useState(false)

  const [roles, setRoles] = useState<StaffRole[]>([])
  const [staff, setStaff] = useState<StaffMember[]>([])

  const [showForm, setShowForm] = useState(false)

  /**
   * Indicates whether the current data came from the backend
   * or the local fallback store.
   */
  const [source, setSource] = useState<'server' | 'local'>('local')

  /**
   * Prevents multiple refresh requests from being fired at once.
   */
  const [refreshing, setRefreshing] = useState(false)

  /**
   * Staff Directory search/filter state.
   */
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<string>('all')

  /**
   * Currently selected role in the permission blueprint editor.
   */
  const [activeRoleId, setActiveRoleId] = useState<string>('')

  /**
   * Convert a backend staff user into the StaffMember shape
   * expected by the existing local UI/store.
   *
   * Your backend AdminUserListItem contains:
   *
   *   id
   *   fullname
   *   email
   *   role
   *   staffRole
   *   permissions
   *
   * The UI expects:
   *
   *   id
   *   name
   *   email
   *   roleId
   */
  const mapServerStaff = (
    user: {
      id: string
      fullname: string
      email: string
      role?: string
      staffRole?: string
      permissions?: string[]
      [key: string]: any
    },
  ): StaffMember => {
    /**
     * staffRole should normally contain the role ID.
     *
     * If the backend returns a role name instead, we resolve
     * that name against the loaded roles below.
     */
    const rawRole = String(user.staffRole ?? '').trim()

    const matchingRole = roles.find(
      (role) =>
        role.id === rawRole ||
        role.name.toLowerCase() === rawRole.toLowerCase(),
    )

    return {
      id: String(user.id),
      name: user.fullname || 'Unnamed Staff',
      email: user.email || '',
      roleId: matchingRole?.id ?? rawRole,
    }
  }

  /**
   * Load roles and staff from the backend.
   *
   * Backend endpoints:
   *
   * GET /api/admin/roles
   * GET /api/admin/users?role=staff
   *
   * If either request fails, we fall back to the local store.
   */
  const refresh = async () => {
    if (refreshing) return

    setRefreshing(true)

    try {
      /**
       * Fetch both resources from the backend.
       *
       * getUsers({ role: 'staff' }) is already implemented
       * in your admin-api.ts, so there is no need for a
       * separate getStaff() method.
       */
      const [rolesResponse, staffResponse] = await Promise.all([
        dsaApi.admin.getRoles(),
        dsaApi.admin.getUsers({
          role: 'staff',
          status: 'all',
        }),
      ])

      const rolesData = Array.isArray(rolesResponse)
        ? rolesResponse
        : rolesResponse?.data

      const staffData = Array.isArray(staffResponse)
        ? staffResponse
        : staffResponse?.data

      if (!Array.isArray(rolesData)) {
        throw new Error('Invalid roles response from server')
      }

      if (!Array.isArray(staffData)) {
        throw new Error('Invalid staff response from server')
      }

      /**
       * Map backend roles into the UI's StaffRole type.
       */
      const loadedRoles: StaffRole[] = rolesData.map(
        (role: {
          id: string
          name: string
          permissions?: string[]
          seeded?: boolean
        }) => ({
          id: String(role.id),
          name: role.name,
          permissions: Array.isArray(role.permissions)
            ? role.permissions
            : [],
          seeded: role.seeded ?? true,
        }),
      )

      /**
       * We need the roles available before resolving staffRole
       * values into role IDs.
       */
      setRoles(loadedRoles)

      /**
       * Resolve each backend staff account.
       *
       * We cannot directly use mapServerStaff here because
       * that helper reads the current React state, and setRoles()
       * is asynchronous. Therefore we resolve against loadedRoles.
       */
      const loadedStaff: StaffMember[] = staffData.map(
        (user: {
          id: string
          fullname: string
          email: string
          role?: string
          staffRole?: string
          permissions?: string[]
          [key: string]: any
        }) => {
          const rawRole = String(user.staffRole ?? '').trim()

          const matchingRole = loadedRoles.find(
            (role) =>
              role.id === rawRole ||
              role.name.toLowerCase() === rawRole.toLowerCase(),
          )

          return {
            id: String(user.id),
            name: user.fullname || 'Unnamed Staff',
            email: user.email || '',
            roleId: matchingRole?.id ?? rawRole,
          }
        },
      )

      setStaff(loadedStaff)
      setSource('server')

      /**
       * Keep the currently selected role if it still exists.
       * Otherwise select the first available role.
       */
      setActiveRoleId((current) =>
        loadedRoles.some((role) => role.id === current)
          ? current
          : loadedRoles[0]?.id ?? '',
      )
    } catch (error) {
      console.error('Failed to load access-control data:', error)

      /**
       * Local fallback.
       *
       * This allows the UI to remain usable if the API is
       * temporarily unavailable.
       */
      const localRoles = getRoles()
      const localStaff = getStaff()

      setRoles(localRoles)
      setStaff(localStaff)
      setSource('local')

      setActiveRoleId((current) =>
        localRoles.some((role) => role.id === current)
          ? current
          : localRoles[0]?.id ?? '',
      )
    } finally {
      setRefreshing(false)
    }
  }

  useEffect(() => {
    setMounted(true)
    refresh()

    // We intentionally run this only once when the component mounts.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  /**
   * Find the currently selected role.
   */
  const activeRole = useMemo(
    () => roles.find((role) => role.id === activeRoleId),
    [roles, activeRoleId],
  )

  /**
   * Resolve a role ID to its display name.
   */
  const roleName = (id: string) => {
    if (!id) return 'Unassigned'

    return (
      roles.find((role) => role.id === id)?.name ??
      'Unassigned'
    )
  }

  /**
   * Filter staff by:
   * - Name
   * - Email
   * - Selected role
   */
  const filteredStaff = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()

    return staff.filter((member) => {
      const matchesSearch =
        !query ||
        member.name.toLowerCase().includes(query) ||
        member.email.toLowerCase().includes(query)

      const matchesRole =
        selectedRoleFilter === 'all' ||
        member.roleId === selectedRoleFilter

      return matchesSearch && matchesRole
    })
  }, [staff, searchQuery, selectedRoleFilter])

  /**
   * Wait until the client has mounted before reading browser/local
   * storage-dependent state.
   */
  if (!mounted) {
    return (
      <div className="max-w-7xl mx-auto min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />

        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
          Loading Access Control Framework...
        </p>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-3 duration-500 pb-16 px-4 sm:px-6">
      {/* =========================================================
          TOP HEADER
         ========================================================= */}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 opacity-5 pointer-events-none">
          <ShieldCheck size={220} className="text-blue-600" />
        </div>

        <div className="space-y-1 relative z-10">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Access Control &amp; Staff Security
            </h1>

            <Badge
              className={`text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full flex items-center gap-1.5 ${
                source === 'server'
                  ? 'bg-emerald-50 text-emerald-600 border border-emerald-200/60'
                  : 'bg-amber-50 text-amber-700 border border-amber-200/60'
              }`}
            >
              {source === 'server' ? (
                <>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <Cloud size={11} />
                  Live Server Synchronized
                </>
              ) : (
                <>
                  <HardDrive size={11} />
                  Local Storage Mode
                </>
              )}
            </Badge>

            {refreshing && (
              <Loader2
                size={13}
                className="animate-spin text-blue-600"
              />
            )}
          </div>

          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2 pt-0.5">
            <Fingerprint size={14} className="text-blue-600" />

            Manage team accounts, assign responsibilities, and adjust
            module access blueprints.
          </p>
        </div>

        <div className="flex items-center gap-3 relative z-10">
          <button
            type="button"
            onClick={() => setShowForm(true)}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-2xl text-xs font-black uppercase tracking-wider shadow-lg shadow-blue-500/20 hover:bg-blue-700 hover:shadow-blue-500/30 active:scale-95 transition-all duration-200"
          >
            <UserPlus size={16} />
            Provision New Access
          </button>
        </div>
      </div>

      {/* =========================================================
          MAIN GRID
         ========================================================= */}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* =======================================================
            LEFT: STAFF DIRECTORY
           ======================================================= */}

        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden transition-all">
            {/* Header & Controls */}

            <div className="p-6 border-b border-slate-100 bg-slate-50/40 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
                    <Users size={18} />
                  </div>

                  <div>
                    <h2 className="font-black text-slate-900 uppercase tracking-wider text-xs">
                      Staff Directory
                    </h2>

                    <p className="text-[11px] text-slate-400 font-medium">
                      Active team accounts and assigned administrative roles
                    </p>
                  </div>
                </div>

                <Badge className="bg-slate-100 text-slate-700 hover:bg-slate-100 text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg border border-slate-200/60">
                  {staff.length} Account{staff.length === 1 ? '' : 's'}
                </Badge>
              </div>

              {/* Search & Filter */}

              <div className="flex flex-col sm:flex-row gap-3 pt-1">
                <div className="relative flex-1">
                  <Search
                    size={14}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(event) =>
                      setSearchQuery(event.target.value)
                    }
                    placeholder="Search staff by name or email..."
                    className="w-full h-10 pl-9 pr-4 rounded-xl bg-white border border-slate-200 text-xs font-medium placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all"
                  />

                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      <X size={12} />
                    </button>
                  )}
                </div>

                <select
                  value={selectedRoleFilter}
                  onChange={(event) =>
                    setSelectedRoleFilter(event.target.value)
                  }
                  className="h-10 px-3 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 focus:outline-none focus:border-blue-500 transition-all cursor-pointer"
                >
                  <option value="all">
                    All Roles ({roles.length})
                  </option>

                  {roles.map((role) => (
                    <option key={role.id} value={role.id}>
                      {role.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Directory List */}

            {filteredStaff.length === 0 ? (
              <div className="px-6 py-16 text-center space-y-3">
                <div className="w-14 h-14 mx-auto rounded-2xl bg-slate-50 flex items-center justify-center text-slate-300 border border-slate-100 shadow-inner">
                  <UserPlus size={26} />
                </div>

                <div className="max-w-xs mx-auto space-y-1">
                  <p className="text-xs font-bold text-slate-700">
                    {staff.length === 0
                      ? 'No staff accounts provisioned yet'
                      : 'No staff match your filters'}
                  </p>

                  <p className="text-[11px] text-slate-400 font-medium leading-relaxed">
                    {staff.length === 0
                      ? 'Click “Provision New Access” above to create accounts for secretaries, bursars, or system auditors.'
                      : 'Try resetting your search input or role selection filter.'}
                  </p>
                </div>

                {staff.length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery('')
                      setSelectedRoleFilter('all')
                    }}
                    className="mt-2 px-4 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all"
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/70 border-b border-slate-100">
                      <th className="px-6 py-3.5 text-[9px] font-black uppercase tracking-wider text-slate-400">
                        Team Member
                      </th>

                      <th className="px-4 py-3.5 text-[9px] font-black uppercase tracking-wider text-slate-400">
                        Role Assignment
                      </th>

                      <th className="px-6 py-3.5 text-[9px] font-black uppercase tracking-wider text-slate-400 text-right">
                        Action
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {filteredStaff.map((member) => (
                      <tr
                        key={member.id}
                        className="group hover:bg-blue-50/30 transition-colors duration-150"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3.5">
                            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-slate-700 font-black text-xs border border-slate-200/80 shadow-sm shrink-0 group-hover:scale-105 transition-transform">
                              {member.name
                                .split(' ')
                                .filter(Boolean)
                                .map((name) => name[0])
                                .join('')
                                .slice(0, 2)
                                .toUpperCase()}
                            </div>

                            <div className="min-w-0">
                              <p className="text-xs font-bold text-slate-800 truncate group-hover:text-blue-600 transition-colors">
                                {member.name}
                              </p>

                              <p className="text-[11px] text-slate-400 font-medium flex items-center gap-1.5 truncate mt-0.5">
                                <Mail
                                  size={11}
                                  className="text-slate-400 shrink-0"
                                />

                                <span className="truncate">
                                  {member.email}
                                </span>
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-4 py-4">
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider border bg-blue-50 text-blue-700 border-blue-200/60 shadow-sm">
                            <ShieldCheck
                              size={12}
                              className="text-blue-500"
                            />

                            {roleName(member.roleId)}
                          </span>
                        </td>

                        <td className="px-6 py-4 text-right">
                          <button
                            type="button"
                            onClick={async () => {
                              const confirmed = window.confirm(
                                `Are you sure you want to revoke access for ${member.name}?`,
                              )

                              if (!confirmed) return

                              try {
                                /**
                                 * Use the real backend endpoint.
                                 *
                                 * PATCH /api/admin/users/:id/status
                                 *
                                 * This is preferable to removeStaff()
                                 * because the staff account exists in the
                                 * backend database.
                                 */
                                await dsaApi.admin.updateUserStatus(
                                  member.id,
                                  {
                                    status: 'suspended',
                                  },
                                )

                                /**
                                 * Refresh from the backend so the
                                 * directory reflects the real DB state.
                                 */
                                await refresh()
                              } catch (error) {
                                console.error(
                                  'Failed to revoke staff access:',
                                  error,
                                )

                                /**
                                 * Local fallback only when the server
                                 * operation fails.
                                 */
                                removeStaff(member.id)
                                await refresh()

                                window.alert(
                                  error instanceof Error
                                    ? error.message
                                    : 'Could not revoke staff access.',
                                )
                              }
                            }}
                            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all border border-transparent hover:border-rose-100"
                            title="Revoke Staff Account"
                          >
                            <Trash2 size={15} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Footer */}

            <div className="px-6 py-3.5 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between gap-2 flex-wrap">
              <p className="text-[10px] text-slate-500 font-bold flex items-center gap-1.5">
                <Activity
                  size={12}
                  className="text-amber-500 shrink-0"
                />

                Staff authenticate via the standard portal using their
                email address.
              </p>

              <span className="text-[10px] font-black uppercase text-slate-400">
                {filteredStaff.length} Shown
              </span>
            </div>
          </div>
        </div>

        {/* =======================================================
            RIGHT: ROLE PERMISSION BLUEPRINT
           ======================================================= */}

        <div className="lg:col-span-5 space-y-4">
          <div className="bg-slate-900 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden border border-slate-800">
            <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none">
              <Lock size={140} />
            </div>

            {/* Blueprint Header */}

            <div className="flex items-center justify-between mb-5 relative z-10">
              <div className="flex items-center gap-2.5 text-blue-400">
                <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/20">
                  <Lock size={16} />
                </div>

                <div>
                  <h3 className="font-black uppercase tracking-wider text-xs text-white">
                    Role Permission Blueprint
                  </h3>

                  <p className="text-[10px] text-slate-400 font-medium">
                    Configure action grants per system role
                  </p>
                </div>
              </div>
            </div>

            {/* Role Pills */}

            <div className="flex flex-wrap gap-2 mb-6 relative z-10 bg-slate-950/50 p-2.5 rounded-2xl border border-slate-800/80">
              {roles.map((role) => (
                <div
                  key={role.id}
                  className="inline-flex items-center"
                >
                  <button
                    type="button"
                    onClick={() => setActiveRoleId(role.id)}
                    className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider border transition-all duration-200 flex items-center gap-1.5 ${
                      activeRoleId === role.id
                        ? 'bg-blue-600 border-blue-500 text-white shadow-md shadow-blue-600/30'
                        : 'bg-slate-800/80 border-slate-700/70 text-slate-400 hover:text-white hover:border-slate-600'
                    }`}
                  >
                    {role.name}

                    {!role.seeded && (
                      <span
                        role="button"
                        tabIndex={0}
                        onClick={async (event) => {
                          event.stopPropagation()

                          const confirmed = window.confirm(
                            `Delete the custom role "${role.name}"? Staff assigned to this role may lose permissions.`,
                          )

                          if (!confirmed) return

                          try {
                            await dsaApi.admin.deleteRole(role.id)
                          } catch {
                            /**
                             * Local fallback if the backend request fails.
                             */
                            deleteRole(role.id)
                          }

                          await refresh()
                        }}
                        onKeyDown={(event) => {
                          if (
                            event.key === 'Enter' ||
                            event.key === ' '
                          ) {
                            event.preventDefault()
                            event.stopPropagation()
                          }
                        }}
                        className="ml-1 text-slate-400 hover:text-rose-400 p-0.5 rounded hover:bg-slate-700/50"
                        title="Delete Role"
                      >
                        <X size={10} />
                      </span>
                    )}
                  </button>
                </div>
              ))}

              <NewRoleButton
                onCreate={async (name) => {
                  try {
                    const response =
                      await dsaApi.admin.upsertRole({
                        name,
                        permissions: [],
                      })

                    await refresh()

                    /**
                     * The backend commonly returns:
                     *
                     * {
                     *   success: true,
                     *   data: { id: '...' }
                     * }
                     *
                     * Try both id and _id for compatibility.
                     */
                    const data = (
                      response as {
                        data?: {
                          id?: string
                          _id?: string
                        }
                      }
                    )?.data

                    const newId =
                      data?.id ?? data?._id

                    if (newId) {
                      setActiveRoleId(String(newId))
                    }
                  } catch {
                    /**
                     * Local fallback.
                     */
                    const created = saveRole({
                      name,
                      permissions: [],
                    })

                    await refresh()
                    setActiveRoleId(created.id)
                  }
                }}
              />
            </div>

            {/* Permission Toggles */}

            {activeRole ? (
              <PermissionToggles
                role={activeRole}
                onSave={async (permissions) => {
                  try {
                    await dsaApi.admin.upsertRole({
                      id: activeRole.id,
                      name: activeRole.name,
                      permissions,
                    })
                  } catch {
                    /**
                     * Local fallback if the server is unavailable.
                     */
                    saveRole({
                      id: activeRole.id,
                      name: activeRole.name,
                      permissions,
                    })
                  }

                  await refresh()
                }}
              />
            ) : (
              <div className="py-10 text-center text-slate-500 text-xs font-bold">
                No role selected.
              </div>
            )}
          </div>

          {/* Security Notice */}

          <div className="bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/20 rounded-3xl p-5 backdrop-blur-sm">
            <div className="flex items-center gap-2.5 text-amber-700 mb-2">
              <ShieldAlert
                size={18}
                className="text-amber-600 shrink-0"
              />

              <span className="text-xs font-black uppercase tracking-wider">
                Backend Security Guarantee
              </span>
            </div>

            <p className="text-[11px] text-amber-900/80 font-semibold leading-relaxed">
              Permissions defined here act as server-enforced security
              policies. Even if front-end controls are bypassed, API
              endpoints validate every incoming authorization header
              against these active role blueprints.
            </p>
          </div>
        </div>
      </div>

      {/* =========================================================
          CREATE STAFF MODAL
         ========================================================= */}

      {showForm && (
        <CreateStaffModal
          roles={roles}
          onClose={() => setShowForm(false)}
          onCreated={async () => {
            /**
             * Re-fetch the staff directory from the backend.
             *
             * We do NOT call addStaff() here because the backend
             * is now the source of truth.
             */
            await refresh()
            setShowForm(false)
          }}
        />
      )}
    </div>
  )
}

/* =================================================================
   PERMISSION TOGGLES
   ================================================================= */

function PermissionToggles({
  role,
  onSave,
}: {
  role: StaffRole
  onSave: (permissions: string[]) => Promise<void>
}) {
  const [selected, setSelected] = useState<string[]>(
    role.permissions,
  )

  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)

  /**
   * Keep the local toggle state synchronized with the selected
   * role whenever the parent loads a different role or refreshes.
   */
  useEffect(() => {
    setSelected(role.permissions)
    setSaved(false)
  }, [role.id, role.permissions])

  const toggle = (key: string) => {
    setSaved(false)

    setSelected((current) =>
      current.includes(key)
        ? current.filter((permission) => permission !== key)
        : [...current, key],
    )
  }

  /**
   * Determine whether the current permission selection differs
   * from what the backend currently has.
   */
  const dirty =
    selected.length !== role.permissions.length ||
    selected.some(
      (permission) => !role.permissions.includes(permission),
    )

  const handleSave = async () => {
    if (!dirty || saving) return

    setSaving(true)
    setSaved(false)

    try {
      await onSave(selected)
      setSaved(true)
    } catch {
      setSaved(false)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-5 relative z-10">
      <div className="max-h-[380px] overflow-y-auto pr-1 space-y-4 custom-scrollbar">
        {PERMISSION_MODULES.map((module) => (
          <div
            key={module}
            className="bg-slate-950/40 rounded-2xl p-3 border border-slate-800/60 space-y-2"
          >
            <span className="text-[9px] font-black uppercase tracking-widest text-blue-400/90 block px-1">
              {module} Module
            </span>

            <div className="flex flex-wrap gap-1.5">
              {PERMISSIONS.filter(
                (permission) => permission.module === module,
              ).map((permission) => {
                const enabled = selected.includes(permission.key)

                return (
                  <button
                    key={permission.key}
                    type="button"
                    onClick={() => toggle(permission.key)}
                    className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-[10px] font-bold border transition-all duration-150 ${
                      enabled
                        ? 'bg-blue-600/90 border-blue-500 text-white shadow-sm'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                    }`}
                    title={permission.key}
                  >
                    <div
                      className={`w-3.5 h-3.5 rounded-md flex items-center justify-center text-[9px] transition-colors ${
                        enabled
                          ? 'bg-white/20 text-white'
                          : 'bg-slate-800 text-slate-500'
                      }`}
                    >
                      {enabled ? <Check size={10} /> : null}
                    </div>

                    {permission.label}

                    {permission.sensitive && (
                      <Lock
                        size={10}
                        className={
                          enabled
                            ? 'text-blue-200'
                            : 'text-amber-400'
                        }
                      />
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Save */}

      <button
        type="button"
        onClick={handleSave}
        disabled={!dirty || saving}
        className="w-full py-3.5 bg-blue-600 rounded-2xl font-black text-xs uppercase tracking-wider hover:bg-blue-500 active:scale-[0.99] transition-all shadow-lg shadow-blue-900/40 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {saving ? (
          <>
            <Loader2
              size={16}
              className="animate-spin"
            />
            Saving Blueprint...
          </>
        ) : saved && !dirty ? (
          <>
            <CheckCircle2
              size={16}
              className="text-emerald-300"
            />
            Blueprint Saved
          </>
        ) : (
          <>
            <Sparkles size={15} />
            Commit Permission Changes
          </>
        )}
      </button>
    </div>
  )
}

/* =================================================================
   NEW ROLE BUTTON
   ================================================================= */

function NewRoleButton({
  onCreate,
}: {
  onCreate: (name: string) => Promise<void>
}) {
  const [adding, setAdding] = useState(false)
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)

  if (!adding) {
    return (
      <button
        type="button"
        onClick={() => setAdding(true)}
        className="px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider border border-dashed border-slate-700 text-slate-400 hover:text-white hover:border-blue-500 hover:bg-slate-800/50 transition-all flex items-center gap-1"
      >
        <Plus size={11} />
        Custom Role
      </button>
    )
  }

  const commit = async () => {
    const cleanName = name.trim()

    if (cleanName.length < 2 || loading) return

    setLoading(true)

    try {
      await onCreate(cleanName)

      setName('')
      setAdding(false)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="inline-flex items-center gap-1.5 bg-slate-900 p-1 rounded-xl border border-blue-500/80">
      <input
        autoFocus
        value={name}
        disabled={loading}
        onChange={(event) => setName(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === 'Enter') {
            void commit()
          }

          if (event.key === 'Escape') {
            setName('')
            setAdding(false)
          }
        }}
        placeholder="e.g. Bursar"
        className="w-24 px-2 py-0.5 text-xs font-bold bg-transparent text-white outline-none placeholder:text-slate-500 disabled:opacity-50"
      />

      <button
        type="button"
        onClick={() => void commit()}
        disabled={loading}
        className="p-1 rounded-lg bg-blue-600 text-white hover:bg-blue-500 transition-colors disabled:opacity-50"
      >
        {loading ? (
          <Loader2 size={12} className="animate-spin" />
        ) : (
          <Check size={12} />
        )}
      </button>

      <button
        type="button"
        disabled={loading}
        onClick={() => {
          setName('')
          setAdding(false)
        }}
        className="p-1 rounded-lg text-slate-400 hover:text-white disabled:opacity-50"
      >
        <X size={12} />
      </button>
    </div>
  )
}

/* =================================================================
   CREATE STAFF ACCOUNT MODAL
   ================================================================= */

/**
 * Generates a temporary password.
 *
 * The password is only held in component state.
 * It is NOT saved into staffStore/localStorage.
 */
function suggestPassword() {
  return (
    'DSAstaff' +
    Math.floor(1000 + ((Date.now() / 1000) % 9000))
  )
}

function CreateStaffModal({
  roles,
  onClose,
  onCreated,
}: {
  roles: StaffRole[]
  onClose: () => void
  onCreated: () => Promise<void>
}) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')

  const [roleId, setRoleId] = useState(
    roles[0]?.id ?? '',
  )

  const [password, setPassword] = useState(
    suggestPassword(),
  )

  const [showPass, setShowPass] = useState(false)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  /**
   * Submit staff creation request to the backend.
   */
  const submit = async (event: React.FormEvent) => {
    event.preventDefault()

    setError('')

    const cleanName = name.trim()
    const cleanEmail = email.trim().toLowerCase()

    if (cleanName.length < 2) {
      setError(
        'Enter the staff member’s full name',
      )
      return
    }

    if (
      !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(
        cleanEmail,
      )
    ) {
      setError('Enter a valid email address')
      return
    }

    if (!roleId) {
      setError('Pick a role assignment')
      return
    }

    if (password.length < 6) {
      setError(
        'Password must be at least 6 characters long',
      )
      return
    }

    setLoading(true)

    try {
      /**
       * Create the real account in the backend.
       *
       * POST /api/admin/staff
       *
       * The backend should hash the password before
       * storing the account.
       */
      await dsaApi.admin.createStaff({
        fullname: cleanName,
        name: cleanName,
        email: cleanEmail,
        password,
        role: 'staff',
        staffRoleId: roleId,
      })

      /**
       * IMPORTANT:
       *
       * Do not call addStaff() here.
       *
       * The backend/database is the source of truth.
       * onCreated() will call refresh(), which executes:
       *
       * GET /api/admin/users?role=staff
       *
       * and retrieves the newly created account.
       */
      await onCreated()
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Could not create the staff account. Please try again.',
      )
    } finally {
      setLoading(false)
    }
  }

  /**
   * Copy temporary credentials.
   *
   * The password exists only in this component state.
   */
  const copyCredentials = async () => {
    try {
      await navigator.clipboard.writeText(
        `Email: ${email}\nPassword: ${password}`,
      )

      setCopied(true)

      window.setTimeout(() => {
        setCopied(false)
      }, 2000)
    } catch {
      setError(
        'Could not copy credentials. Please copy them manually.',
      )
    }
  }

  const selectedRole = roles.find(
    (role) => role.id === roleId,
  )

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}

        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
              <UserPlus size={18} />
            </div>

            <div>
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">
                Provision Staff Account
              </h3>

              <p className="text-[11px] font-medium text-slate-400">
                Assign system responsibilities and access credentials
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition-colors disabled:opacity-50"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form */}

        <form
          onSubmit={submit}
          className="p-6 space-y-4"
        >
          {error && (
            <div className="flex items-center gap-2 p-3.5 rounded-2xl bg-rose-50 border border-rose-100 text-rose-600 text-xs font-bold animate-in fade-in">
              <AlertCircle
                size={16}
                className="shrink-0"
              />

              {error}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Full Name */}

            <label className="space-y-1.5 block">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                Full Name
              </span>

              <input
                value={name}
                disabled={loading}
                onChange={(event) =>
                  setName(event.target.value)
                }
                placeholder="e.g. Grace Okon"
                className="w-full h-11 px-3.5 rounded-xl bg-slate-50 border border-slate-200/80 focus:border-blue-500 focus:bg-white outline-none text-xs font-bold transition-all disabled:opacity-60"
              />
            </label>

            {/* Email */}

            <label className="space-y-1.5 block">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                Email Address
              </span>

              <input
                type="email"
                value={email}
                disabled={loading}
                onChange={(event) =>
                  setEmail(event.target.value)
                }
                placeholder="staff@domain.com"
                className="w-full h-11 px-3.5 rounded-xl bg-slate-50 border border-slate-200/80 focus:border-blue-500 focus:bg-white outline-none text-xs font-bold transition-all disabled:opacity-60"
              />
            </label>
          </div>

          {/* Assigned Role */}

          <label className="space-y-1.5 block">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
              Assigned Role
            </span>

            <select
              value={roleId}
              disabled={loading || roles.length === 0}
              onChange={(event) =>
                setRoleId(event.target.value)
              }
              className="w-full h-11 px-3.5 rounded-xl bg-slate-50 border border-slate-200/80 focus:border-blue-500 focus:bg-white outline-none text-xs font-bold transition-all cursor-pointer disabled:opacity-60"
            >
              {roles.length === 0 ? (
                <option value="">
                  No roles available
                </option>
              ) : (
                roles.map((role) => (
                  <option
                    key={role.id}
                    value={role.id}
                  >
                    {role.name}
                  </option>
                ))
              )}
            </select>
          </label>

          {/* Role Preview */}

          {selectedRole && (
            <div className="rounded-2xl bg-slate-50 border border-slate-200/60 p-3.5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                  {selectedRole.name} Role Grants (
                  {selectedRole.permissions.length})
                </span>
              </div>

              {selectedRole.permissions.length === 0 ? (
                <p className="text-[11px] text-slate-400 font-medium">
                  No module grants configured yet for this
                  role.
                </p>
              ) : (
                <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1 custom-scrollbar">
                  {selectedRole.permissions.map(
                    (permission) => (
                      <span
                        key={permission}
                        className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-[9px] font-bold text-slate-700 shadow-2xs"
                      >
                        {permissionLabel(permission)}
                      </span>
                    ),
                  )}
                </div>
              )}
            </div>
          )}

          {/* Password */}

          <label className="space-y-1.5 block">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
              Temporary Password
            </span>

            <div className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type={
                    showPass
                      ? 'text'
                      : 'password'
                  }
                  value={password}
                  disabled={loading}
                  onChange={(event) =>
                    setPassword(event.target.value)
                  }
                  className="w-full h-11 pl-3.5 pr-10 rounded-xl bg-slate-50 border border-slate-200/80 focus:border-blue-500 focus:bg-white outline-none text-xs font-mono font-bold transition-all disabled:opacity-60"
                />

                <button
                  type="button"
                  disabled={loading}
                  onClick={() =>
                    setShowPass((current) => !current)
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 disabled:opacity-50"
                >
                  {showPass ? (
                    <EyeOff size={14} />
                  ) : (
                    <Eye size={14} />
                  )}
                </button>
              </div>

              {/* Regenerate */}

              <button
                type="button"
                disabled={loading}
                onClick={() =>
                  setPassword(suggestPassword())
                }
                className="px-3.5 h-11 rounded-xl bg-slate-100 hover:bg-slate-200 text-[10px] font-black uppercase tracking-wider text-slate-700 transition-colors disabled:opacity-50"
              >
                Regenerate
              </button>

              {/* Copy */}

              <button
                type="button"
                disabled={loading}
                onClick={() => void copyCredentials()}
                className="px-3 h-11 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors disabled:opacity-50"
                title="Copy Credentials"
              >
                {copied ? (
                  <Check
                    size={14}
                    className="text-emerald-600"
                  />
                ) : (
                  <Copy size={14} />
                )}
              </button>
            </div>
          </label>

          {/* Footer */}

          <div className="flex items-center justify-between gap-3 pt-3 border-t border-slate-100">
            <p className="text-[10px] font-medium text-slate-400">
              The staff member can change their password
              upon initial login.
            </p>

            <button
              type="submit"
              disabled={loading || roles.length === 0}
              className="shrink-0 flex items-center gap-2 px-6 h-11 bg-blue-600 text-white rounded-xl font-black text-xs uppercase tracking-wider shadow-lg shadow-blue-500/20 hover:bg-blue-700 active:scale-95 transition-all disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2
                    size={16}
                    className="animate-spin"
                  />
                  Provisioning...
                </>
              ) : (
                <>
                  <UserPlus size={15} />
                  Provision Account
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}