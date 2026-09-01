// //src/app/admin/components/RolesPermissions.tsx
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

//   // Selected role for the permission blueprint editor.
//   const [activeRoleId, setActiveRoleId] = useState<string>('')

//   const refresh = async () => {
//     let loadedRoles: StaffRole[] = []

//     try {
//       // 1. Fetch roles directly from backend GET /api/admin/roles
//       // Cast `res` to bypass TS empty object type constraint
//       const res = (await dsaApi.admin.getRoles()) as { data?: any[] } | any[]

//       // Handle standard API wrapper { success: true, count: X, data: [...] }
//       const rolesData = Array.isArray(res) ? res : res?.data

//       if (Array.isArray(rolesData) && rolesData.length > 0) {
//         loadedRoles = rolesData.map(
//           (r: { id: string; name: string; permissions: string[] }) => ({
//             id: r.id,
//             name: r.name,
//             permissions: r.permissions || [],
//             seeded: true, // Server roles are core/seeded by default
//           }),
//         )
//         setSource('server')
//       } else {
//         throw new Error('No server roles returned')
//       }
//     } catch {
//       // 2. Local fallback if API request fails or endpoint is unavailable
//       loadedRoles = getRoles()
//       setSource('local')
//     }

//     setRoles(loadedRoles)
//     setStaff(getStaff())
//     setActiveRoleId((cur) =>
//       loadedRoles.some((x) => x.id === cur) ? cur : (loadedRoles[0]?.id ?? ''),
//     )
//   }

//   // localStorage / API read on mount
//   useEffect(() => {
//     setMounted(true)
//     refresh()
//   }, [])

//   const activeRole = useMemo(
//     () => roles.find((r) => r.id === activeRoleId),
//     [roles, activeRoleId],
//   )

//   const roleName = (id: string) => roles.find((r) => r.id === id)?.name ?? '—'

//   if (!mounted) {
//     return (
//       <div className='max-w-6xl mx-auto py-20 flex justify-center'>
//         <Loader2 className='animate-spin text-blue-500' />
//       </div>
//     )
//   }

//   return (
//     <div className='max-w-6xl mx-auto space-y-6 animate-in fade-in duration-500 pb-10 px-4'>
//       {/* Header */}
//       <div className='flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4'>
//         <div>
//           <div className='flex items-center gap-2'>
//             <h1 className='text-2xl font-black text-slate-900 tracking-tight'>
//               Access Control
//             </h1>
//             <Badge
//               className={`text-[8px] font-black ${
//                 source === 'server'
//                   ? 'bg-emerald-50 text-emerald-600'
//                   : 'bg-slate-100 text-slate-500'
//               }`}
//             >
//               {source === 'server' ? (
//                 <>
//                   <Cloud size={9} className='mr-1' /> Live Server
//                 </>
//               ) : (
//                 <>
//                   <HardDrive size={9} className='mr-1' /> Local Store
//                 </>
//               )}
//             </Badge>
//           </div>
//           <p className='text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1 flex items-center gap-2'>
//             <Fingerprint size={12} className='text-blue-500' />
//             Staff Accounts &amp; Role Permissions
//           </p>
//         </div>
//         <button
//           onClick={() => setShowForm(true)}
//           className='flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all'
//         >
//           <UserPlus size={14} /> Provision New Access
//         </button>
//       </div>

//       <div className='grid grid-cols-1 lg:grid-cols-12 gap-6'>
//         {/* Staff Directory */}
//         <div className='lg:col-span-7 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden'>
//           <div className='px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/30'>
//             <h3 className='font-black text-slate-900 uppercase tracking-widest text-[10px]'>
//               Staff Directory
//             </h3>
//             <span className='text-[9px] font-black uppercase text-slate-400'>
//               {staff.length} account{staff.length === 1 ? '' : 's'}
//             </span>
//           </div>

//           {staff.length === 0 ? (
//             <div className='px-6 py-14 text-center'>
//               <div className='w-12 h-12 mx-auto mb-3 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-300 border border-slate-100'>
//                 <UserPlus size={22} />
//               </div>
//               <p className='text-xs font-bold text-slate-500'>
//                 No staff accounts yet
//               </p>
//               <p className='text-[10px] text-slate-400 mt-1 font-medium'>
//                 Use “Provision New Access” to create a secretary, auditor, or
//                 other role.
//               </p>
//             </div>
//           ) : (
//             <div className='overflow-x-auto'>
//               <table className='w-full text-left'>
//                 <thead>
//                   <tr className='bg-slate-50/50 border-b border-slate-100'>
//                     <th className='px-6 py-3 text-[9px] font-black uppercase text-slate-400'>
//                       Team Member
//                     </th>
//                     <th className='px-4 py-3 text-[9px] font-black uppercase text-slate-400'>
//                       Role
//                     </th>
//                     <th className='px-4 py-3 text-[9px] font-black uppercase text-slate-400 text-right'>
//                       Remove
//                     </th>
//                   </tr>
//                 </thead>
//                 <tbody className='divide-y divide-slate-50'>
//                   {staff.map((member) => (
//                     <tr
//                       key={member.id}
//                       className='group hover:bg-blue-50/20 transition-colors'
//                     >
//                       <td className='px-6 py-4'>
//                         <div className='flex items-center gap-3'>
//                           <div className='w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600 font-black text-[10px] border border-slate-200'>
//                             {member.name
//                               .split(' ')
//                               .map((n) => n[0])
//                               .join('')
//                               .slice(0, 2)
//                               .toUpperCase()}
//                           </div>
//                           <div>
//                             <p className='text-xs font-bold text-slate-800'>
//                               {member.name}
//                             </p>
//                             <p className='text-[10px] text-slate-400 font-medium flex items-center gap-1'>
//                               <Mail size={9} /> {member.email}
//                             </p>
//                           </div>
//                         </div>
//                       </td>
//                       <td className='px-4 py-4'>
//                         <span className='px-2 py-0.5 rounded-md text-[9px] font-black uppercase border bg-blue-50 text-blue-600 border-blue-100'>
//                           {roleName(member.roleId)}
//                         </span>
//                       </td>
//                       <td className='px-6 py-4 text-right'>
//                         <button
//                           onClick={async () => {
//                             removeStaff(member.id)
//                             await refresh()
//                           }}
//                           className='p-1.5 text-slate-400 hover:text-rose-600 hover:bg-white rounded-md transition-all shadow-sm border border-transparent hover:border-slate-100'
//                           title='Remove staff account'
//                         >
//                           <Trash2 size={14} />
//                         </button>
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//           )}

//           <div className='px-6 py-3 border-t border-slate-100 bg-slate-50/30'>
//             <p className='text-[10px] text-slate-400 font-medium flex items-center gap-1.5'>
//               <Activity size={10} className='text-[#FCB900]' />
//               Staff sign in on the normal login page with their email &amp;
//               temporary password.
//             </p>
//           </div>
//         </div>

//         {/* Role Permission Editor */}
//         <div className='lg:col-span-5 space-y-4'>
//           <div className='bg-slate-900 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden'>
//             <div className='absolute top-0 right-0 p-4 opacity-10'>
//               <ShieldCheck size={80} />
//             </div>

//             <div className='flex items-center gap-2 mb-4 text-blue-400 relative z-10'>
//               <Lock size={16} />
//               <h3 className='font-black uppercase tracking-widest text-[10px]'>
//                 Role Permissions
//               </h3>
//             </div>

//             {/* Role selector */}
//             <div className='flex flex-wrap gap-1.5 mb-5 relative z-10'>
//               {roles.map((r) => (
//                 <button
//                   key={r.id}
//                   onClick={() => setActiveRoleId(r.id)}
//                   className={`px-2.5 py-1 rounded-md text-[9px] font-black uppercase tracking-wide border transition-all ${
//                     activeRoleId === r.id
//                       ? 'bg-blue-600 border-blue-500 text-white'
//                       : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
//                   }`}
//                 >
//                   {r.name}
//                   {!r.seeded && (
//                     <span
//                       role='button'
//                       tabIndex={0}
//                       onClick={async (e) => {
//                         e.stopPropagation()
//                         deleteRole(r.id)
//                         await refresh()
//                       }}
//                       className='ml-1.5 text-slate-500 hover:text-rose-400'
//                       title='Delete role'
//                     >
//                       ×
//                     </span>
//                   )}
//                 </button>
//               ))}
//               <NewRoleButton
//                 onCreate={async (name) => {
//                   const created = saveRole({ name, permissions: [] })
//                   await refresh()
//                   setActiveRoleId(created.id)
//                 }}
//               />
//             </div>

//             {activeRole && (
//               <PermissionToggles
//                 role={activeRole}
//                 onSave={async (perms) => {
//                   saveRole({
//                     id: activeRole.id,
//                     name: activeRole.name,
//                     permissions: perms,
//                   })
//                   await refresh()
//                 }}
//               />
//             )}
//           </div>

//           <div className='bg-amber-50 border border-amber-100 rounded-2xl p-5'>
//             <div className='flex items-center gap-2 text-amber-700 mb-2'>
//               <ShieldAlert size={16} />
//               <span className='text-[10px] font-black uppercase tracking-widest'>
//                 Enforced Server-Side
//               </span>
//             </div>
//             <p className='text-[11px] text-amber-800 font-bold leading-relaxed opacity-80'>
//               Permissions here are the source of truth for what each role can do
//               (e.g. a Secretary verifies manual payments &amp; edits the
//               timetable). The backend re-checks every request — client
//               validations are purely for UI state.
//             </p>
//           </div>
//         </div>
//       </div>

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
// /* Permission toggles for the selected role                          */
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

//   // Reset local state when the active role changes.
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
//       {PERMISSION_MODULES.map((mod) => (
//         <div key={mod} className='space-y-2'>
//           <span className='text-[9px] font-black uppercase tracking-wider text-slate-500'>
//             {mod}
//           </span>
//           <div className='flex flex-wrap gap-1.5'>
//             {PERMISSIONS.filter((p) => p.module === mod).map((p) => {
//               const on = selected.includes(p.key)
//               return (
//                 <button
//                   key={p.key}
//                   onClick={() => toggle(p.key)}
//                   className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[9px] font-bold border transition-all ${
//                     on
//                       ? 'bg-blue-600 border-blue-500 text-white'
//                       : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-blue-500 hover:text-white'
//                   }`}
//                   title={p.key}
//                 >
//                   {on ? <Check size={10} /> : null}
//                   {p.label}
//                   {p.sensitive && (
//                     <Lock
//                       size={9}
//                       className={on ? 'text-blue-200' : 'text-rose-500'}
//                     />
//                   )}
//                 </button>
//               )
//             })}
//           </div>
//         </div>
//       ))}

//       <button
//         onClick={() => {
//           onSave(selected)
//           setSaved(true)
//         }}
//         disabled={!dirty && !saved}
//         className='w-full py-3 bg-blue-600 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-900/40 disabled:opacity-40 flex items-center justify-center gap-2'
//       >
//         {saved && !dirty ? (
//           <>
//             <CheckCircle2 size={13} /> Saved
//           </>
//         ) : (
//           'Commit Changes'
//         )}
//       </button>
//     </div>
//   )
// }

// /* ---------------------------------------------------------------- */
// /* Inline "new role" button                                         */
// /* ---------------------------------------------------------------- */
// function NewRoleButton({ onCreate }: { onCreate: (name: string) => void }) {
//   const [adding, setAdding] = useState(false)
//   const [name, setName] = useState('')

//   if (!adding) {
//     return (
//       <button
//         onClick={() => setAdding(true)}
//         className='px-2.5 py-1 rounded-md text-[9px] font-black uppercase tracking-wide border border-dashed border-slate-600 text-slate-400 hover:text-white hover:border-blue-500 transition-all flex items-center gap-1'
//       >
//         <Plus size={10} /> Role
//       </button>
//     )
//   }

//   const commit = () => {
//     if (name.trim().length >= 2) onCreate(name.trim())
//     setName('')
//     setAdding(false)
//   }

//   return (
//     <span className='flex items-center gap-1'>
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
//         className='w-24 px-2 py-1 rounded-md text-[10px] font-bold bg-slate-800 border border-blue-500 text-white outline-none placeholder:text-slate-500'
//       />
//       <button
//         onClick={commit}
//         className='p-1 rounded-md bg-blue-600 text-white hover:bg-blue-700'
//       >
//         <Check size={11} />
//       </button>
//     </span>
//   )
// }

// /* ---------------------------------------------------------------- */
// /* Create-staff modal                                               */
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
//   const [error, setError] = useState('')
//   const [loading, setLoading] = useState(false)

//   const submit = (e: React.FormEvent) => {
//     e.preventDefault()
//     setError('')
//     if (name.trim().length < 2) return setError('Enter the staff member’s name')
//     if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email))
//       return setError('Enter a valid email address')
//     if (!roleId) return setError('Pick a role')
//     if (password.length < 6)
//       return setError('Password must be at least 6 characters')

//     setLoading(true)
//     const created = addStaff({ name, email, roleId, password, now: Date.now() })
//     setLoading(false)
//     if (!created) {
//       setError('A staff account with that email already exists.')
//       return
//     }
//     onCreated()
//   }

//   const selectedRole = roles.find((r) => r.id === roleId)

//   return (
//     <div className='fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm'>
//       <div className='w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden'>
//         <div className='flex items-center justify-between px-6 py-4 border-b border-slate-100'>
//           <div className='flex items-center gap-3'>
//             <div className='h-9 w-9 rounded-xl bg-[#002EFF] text-white flex items-center justify-center'>
//               <UserPlus size={16} />
//             </div>
//             <div>
//               <h3 className='text-sm font-black text-slate-900 uppercase tracking-tight'>
//                 Create Staff Account
//               </h3>
//               <p className='text-[10px] font-bold text-slate-400'>
//                 Secretary, auditor, or any custom role
//               </p>
//             </div>
//           </div>
//           <button
//             onClick={onClose}
//             className='p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-50'
//           >
//             <X size={18} />
//           </button>
//         </div>

//         <form onSubmit={submit} className='p-6 space-y-4'>
//           {error && (
//             <div className='flex items-center gap-2 p-3 rounded-xl bg-rose-50 text-rose-600 text-[11px] font-bold'>
//               <AlertCircle size={15} className='shrink-0' /> {error}
//             </div>
//           )}

//           <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
//             <label className='space-y-1.5 block'>
//               <span className='text-[10px] font-black uppercase tracking-widest text-slate-400'>
//                 Full Name
//               </span>
//               <input
//                 value={name}
//                 onChange={(e) => setName(e.target.value)}
//                 placeholder='e.g. Grace Okon'
//                 className='w-full h-11 px-3 rounded-lg bg-slate-50 border border-transparent focus:border-[#002EFF]/30 focus:bg-white outline-none text-sm font-medium transition-all'
//               />
//             </label>
//             <label className='space-y-1.5 block'>
//               <span className='text-[10px] font-black uppercase tracking-widest text-slate-400'>
//                 Email
//               </span>
//               <input
//                 type='email'
//                 value={email}
//                 onChange={(e) => setEmail(e.target.value)}
//                 placeholder='staff@example.com'
//                 className='w-full h-11 px-3 rounded-lg bg-slate-50 border border-transparent focus:border-[#002EFF]/30 focus:bg-white outline-none text-sm font-medium transition-all'
//               />
//             </label>
//           </div>

//           <label className='space-y-1.5 block'>
//             <span className='text-[10px] font-black uppercase tracking-widest text-slate-400'>
//               Role
//             </span>
//             <select
//               value={roleId}
//               onChange={(e) => setRoleId(e.target.value)}
//               className='w-full h-11 px-3 rounded-lg bg-slate-50 border border-transparent focus:border-[#002EFF]/30 focus:bg-white outline-none text-sm font-bold transition-all'
//             >
//               {roles.map((r) => (
//                 <option key={r.id} value={r.id}>
//                   {r.name}
//                 </option>
//               ))}
//             </select>
//           </label>

//           {selectedRole && (
//             <div className='rounded-xl bg-slate-50 border border-slate-100 p-3'>
//               <p className='text-[9px] font-black uppercase tracking-widest text-slate-400 mb-2'>
//                 {selectedRole.name} can
//               </p>
//               {selectedRole.permissions.length === 0 ? (
//                 <p className='text-[11px] text-slate-400 font-medium'>
//                   No permissions yet — set them in “Role Permissions”.
//                 </p>
//               ) : (
//                 <div className='flex flex-wrap gap-1.5'>
//                   {selectedRole.permissions.map((k) => (
//                     <span
//                       key={k}
//                       className='px-2 py-0.5 rounded-md bg-white border border-slate-200 text-[9px] font-bold text-slate-600'
//                     >
//                       {permissionLabel(k)}
//                     </span>
//                   ))}
//                 </div>
//               )}
//             </div>
//           )}

//           <label className='space-y-1.5 block'>
//             <span className='text-[10px] font-black uppercase tracking-widest text-slate-400'>
//               Temporary Password
//             </span>
//             <div className='flex gap-2'>
//               <input
//                 value={password}
//                 onChange={(e) => setPassword(e.target.value)}
//                 className='flex-1 h-11 px-3 rounded-lg bg-slate-50 border border-transparent focus:border-[#002EFF]/30 focus:bg-white outline-none text-sm font-medium transition-all'
//               />
//               <button
//                 type='button'
//                 onClick={() => setPassword(suggestPassword())}
//                 className='px-3 h-11 rounded-lg bg-slate-100 text-[10px] font-black uppercase text-slate-600 hover:bg-slate-200 transition-all'
//               >
//                 New
//               </button>
//             </div>
//           </label>

//           <div className='flex items-center justify-between gap-3 pt-2 border-t border-slate-50'>
//             <p className='text-[10px] font-bold text-slate-400'>
//               Share the email &amp; password with the staff member.
//             </p>
//             <button
//               type='submit'
//               disabled={loading}
//               className='shrink-0 flex items-center gap-2 px-6 h-11 bg-[#002EFF] text-white rounded-xl font-black text-[11px] uppercase tracking-wide shadow-lg shadow-blue-200 hover:bg-blue-700 active:scale-95 transition-all disabled:opacity-60'
//             >
//               {loading ? (
//                 <Loader2 size={16} className='animate-spin' />
//               ) : (
//                 <>
//                   <UserPlus size={15} /> Create
//                 </>
//               )}
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   )
// }


// src/app/admin/components/RolesPermissions.tsx
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
  ChevronRight,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import {
  PERMISSIONS,
  PERMISSION_MODULES,
  getRoles,
  getStaff,
  addStaff,
  removeStaff,
  saveRole,
  deleteRole,
  permissionLabel,
  type StaffRole,
  type StaffMember,
} from '@/lib/staffStore'
import { dsaApi } from '@/lib/admin-api'

export default function RolesPermissions() {
  const [mounted, setMounted] = useState(false)
  const [roles, setRoles] = useState<StaffRole[]>([])
  const [staff, setStaff] = useState<StaffMember[]>([])
  const [showForm, setShowForm] = useState(false)
  const [source, setSource] = useState<'server' | 'local'>('local')

  // Search & Filter state for Staff Directory
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<string>('all')

  // Selected role for the permission blueprint editor
  const [activeRoleId, setActiveRoleId] = useState<string>('')

  const refresh = async () => {
    let loadedRoles: StaffRole[] = []

    try {
      // Fetch roles directly from backend GET /api/admin/roles
      const res = (await dsaApi.admin.getRoles()) as { data?: any[] } | any[]
      const rolesData = Array.isArray(res) ? res : res?.data

      if (Array.isArray(rolesData) && rolesData.length > 0) {
        loadedRoles = rolesData.map(
          (r: { id: string; name: string; permissions: string[] }) => ({
            id: r.id,
            name: r.name,
            permissions: r.permissions || [],
            seeded: true,
          }),
        )
        setSource('server')
      } else {
        throw new Error('No server roles returned')
      }
    } catch {
      // Local fallback if API request fails or endpoint is unavailable
      loadedRoles = getRoles()
      setSource('local')
    }

    setRoles(loadedRoles)
    setStaff(getStaff())
    setActiveRoleId((cur) =>
      loadedRoles.some((x) => x.id === cur) ? cur : (loadedRoles[0]?.id ?? ''),
    )
  }

  useEffect(() => {
    setMounted(true)
    refresh()
  }, [])

  const activeRole = useMemo(
    () => roles.find((r) => r.id === activeRoleId),
    [roles, activeRoleId],
  )

  const roleName = (id: string) => roles.find((r) => r.id === id)?.name ?? '—'

  // Filter staff by search text and role dropdown selection
  const filteredStaff = useMemo(() => {
    return staff.filter((member) => {
      const matchesSearch =
        member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.email.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesRole =
        selectedRoleFilter === 'all' || member.roleId === selectedRoleFilter

      return matchesSearch && matchesRole
    })
  }, [staff, searchQuery, selectedRoleFilter])

  if (!mounted) {
    return (
      <div className='max-w-7xl mx-auto min-h-[60vh] flex flex-col items-center justify-center gap-3'>
        <Loader2 className='w-8 h-8 animate-spin text-blue-600' />
        <p className='text-xs font-bold text-slate-400 uppercase tracking-wider'>
          Loading Access Control Framework...
        </p>
      </div>
    )
  }

  return (
    <div className='max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-3 duration-500 pb-16 px-4 sm:px-6'>
      {/* Top Header Banner */}
      <div className='flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm relative overflow-hidden'>
        <div className='absolute -right-10 -bottom-10 opacity-5 pointer-events-none'>
          <ShieldCheck size={220} className='text-blue-600' />
        </div>

        <div className='space-y-1 relative z-10'>
          <div className='flex items-center gap-3 flex-wrap'>
            <h1 className='text-2xl sm:text-3xl font-black text-slate-900 tracking-tight'>
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
                  <span className='w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse' />
                  <Cloud size={11} /> Live Server Synchronized
                </>
              ) : (
                <>
                  <HardDrive size={11} /> Local Storage Mode
                </>
              )}
            </Badge>
          </div>
          <p className='text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2 pt-0.5'>
            <Fingerprint size={14} className='text-blue-600' />
            Manage team accounts, assign responsibilities, and adjust module access blueprints.
          </p>
        </div>

        <div className='flex items-center gap-3 relative z-10'>
          <button
            onClick={() => setShowForm(true)}
            className='w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-2xl text-xs font-black uppercase tracking-wider shadow-lg shadow-blue-500/20 hover:bg-blue-700 hover:shadow-blue-500/30 active:scale-95 transition-all duration-200'
          >
            <UserPlus size={16} /> Provision New Access
          </button>
        </div>
      </div>

      {/* Main Grid: Staff Directory + Role Blueprint Editor */}
      <div className='grid grid-cols-1 lg:grid-cols-12 gap-8 items-start'>
        {/* Left Section: Staff Directory (7 Cols) */}
        <div className='lg:col-span-7 space-y-4'>
          <div className='bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden transition-all'>
            {/* Header & Controls */}
            <div className='p-6 border-b border-slate-100 bg-slate-50/40 space-y-4'>
              <div className='flex items-center justify-between'>
                <div className='flex items-center gap-2.5'>
                  <div className='p-2 rounded-xl bg-blue-50 text-blue-600'>
                    <Users size={18} />
                  </div>
                  <div>
                    <h2 className='font-black text-slate-900 uppercase tracking-wider text-xs'>
                      Staff Directory
                    </h2>
                    <p className='text-[11px] text-slate-400 font-medium'>
                      Active team accounts and assigned administrative roles
                    </p>
                  </div>
                </div>
                <Badge className='bg-slate-100 text-slate-700 hover:bg-slate-100 text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg border border-slate-200/60'>
                  {staff.length} Account{staff.length === 1 ? '' : 's'}
                </Badge>
              </div>

              {/* Search & Filter Bar */}
              <div className='flex flex-col sm:flex-row gap-3 pt-1'>
                <div className='relative flex-1'>
                  <Search
                    size={14}
                    className='absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400'
                  />
                  <input
                    type='text'
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder='Search staff by name or email...'
                    className='w-full h-10 pl-9 pr-4 rounded-xl bg-white border border-slate-200 text-xs font-medium placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all'
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className='absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600'
                    >
                      <X size={12} />
                    </button>
                  )}
                </div>

                <select
                  value={selectedRoleFilter}
                  onChange={(e) => setSelectedRoleFilter(e.target.value)}
                  className='h-10 px-3 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 focus:outline-none focus:border-blue-500 transition-all cursor-pointer'
                >
                  <option value='all'>All Roles ({roles.length})</option>
                  {roles.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Directory List */}
            {filteredStaff.length === 0 ? (
              <div className='px-6 py-16 text-center space-y-3'>
                <div className='w-14 h-14 mx-auto rounded-2xl bg-slate-50 flex items-center justify-center text-slate-300 border border-slate-100 shadow-inner'>
                  <UserPlus size={26} />
                </div>
                <div className='max-w-xs mx-auto space-y-1'>
                  <p className='text-xs font-bold text-slate-700'>
                    {staff.length === 0
                      ? 'No staff accounts provisioned yet'
                      : 'No staff match your filters'}
                  </p>
                  <p className='text-[11px] text-slate-400 font-medium leading-relaxed'>
                    {staff.length === 0
                      ? 'Click “Provision New Access” above to create accounts for secretaries, bursars, or system auditors.'
                      : 'Try resetting your search input or role selection filter.'}
                  </p>
                </div>
                {staff.length > 0 && (
                  <button
                    onClick={() => {
                      setSearchQuery('')
                      setSelectedRoleFilter('all')
                    }}
                    className='mt-2 px-4 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all'
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            ) : (
              <div className='overflow-x-auto'>
                <table className='w-full text-left border-collapse'>
                  <thead>
                    <tr className='bg-slate-50/70 border-b border-slate-100'>
                      <th className='px-6 py-3.5 text-[9px] font-black uppercase tracking-wider text-slate-400'>
                        Team Member
                      </th>
                      <th className='px-4 py-3.5 text-[9px] font-black uppercase tracking-wider text-slate-400'>
                        Role Assignment
                      </th>
                      <th className='px-6 py-3.5 text-[9px] font-black uppercase tracking-wider text-slate-400 text-right'>
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className='divide-y divide-slate-100'>
                    {filteredStaff.map((member) => (
                      <tr
                        key={member.id}
                        className='group hover:bg-blue-50/30 transition-colors duration-150'
                      >
                        <td className='px-6 py-4'>
                          <div className='flex items-center gap-3.5'>
                            <div className='w-10 h-10 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-slate-700 font-black text-xs border border-slate-200/80 shadow-sm shrink-0 group-hover:scale-105 transition-transform'>
                              {member.name
                                .split(' ')
                                .map((n) => n[0])
                                .join('')
                                .slice(0, 2)
                                .toUpperCase()}
                            </div>
                            <div className='min-w-0'>
                              <p className='text-xs font-bold text-slate-800 truncate group-hover:text-blue-600 transition-colors'>
                                {member.name}
                              </p>
                              <p className='text-[11px] text-slate-400 font-medium flex items-center gap-1.5 truncate mt-0.5'>
                                <Mail size={11} className='text-slate-400 shrink-0' />
                                <span className='truncate'>{member.email}</span>
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className='px-4 py-4'>
                          <span className='inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider border bg-blue-50 text-blue-700 border-blue-200/60 shadow-sm'>
                            <ShieldCheck size={12} className='text-blue-500' />
                            {roleName(member.roleId)}
                          </span>
                        </td>
                        <td className='px-6 py-4 text-right'>
                          <button
                            onClick={async () => {
                              if (
                                confirm(
                                  `Are you sure you want to revoke access for ${member.name}?`,
                                )
                              ) {
                                removeStaff(member.id)
                                await refresh()
                              }
                            }}
                            className='p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all border border-transparent hover:border-rose-100'
                            title='Revoke Staff Account'
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

            {/* Footer Notice */}
            <div className='px-6 py-3.5 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between gap-2 flex-wrap'>
              <p className='text-[10px] text-slate-500 font-bold flex items-center gap-1.5'>
                <Activity size={12} className='text-amber-500 shrink-0' />
                Staff authenticate via the standard portal using their email address.
              </p>
              <span className='text-[10px] font-black uppercase text-slate-400'>
                {filteredStaff.length} Shown
              </span>
            </div>
          </div>
        </div>

        {/* Right Section: Role Blueprint & Permissions Editor (5 Cols) */}
        <div className='lg:col-span-5 space-y-4'>
          <div className='bg-slate-900 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden border border-slate-800'>
            <div className='absolute top-0 right-0 p-6 opacity-5 pointer-events-none'>
              <Lock size={140} />
            </div>

            {/* Blueprint Header */}
            <div className='flex items-center justify-between mb-5 relative z-10'>
              <div className='flex items-center gap-2.5 text-blue-400'>
                <div className='p-2 rounded-xl bg-blue-500/10 border border-blue-500/20'>
                  <Lock size={16} />
                </div>
                <div>
                  <h3 className='font-black uppercase tracking-wider text-xs text-white'>
                    Role Permission Blueprint
                  </h3>
                  <p className='text-[10px] text-slate-400 font-medium'>
                    Configure action grants per system role
                  </p>
                </div>
              </div>
            </div>

            {/* Role Pills & Selector */}
            <div className='flex flex-wrap gap-2 mb-6 relative z-10 bg-slate-950/50 p-2.5 rounded-2xl border border-slate-800/80'>
              {roles.map((r) => (
                <div key={r.id} className='inline-flex items-center'>
                  <button
                    onClick={() => setActiveRoleId(r.id)}
                    className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider border transition-all duration-200 flex items-center gap-1.5 ${
                      activeRoleId === r.id
                        ? 'bg-blue-600 border-blue-500 text-white shadow-md shadow-blue-600/30'
                        : 'bg-slate-800/80 border-slate-700/70 text-slate-400 hover:text-white hover:border-slate-600'
                    }`}
                  >
                    {r.name}
                    {!r.seeded && (
                      <span
                        onClick={async (e) => {
                          e.stopPropagation()
                          if (
                            confirm(
                              `Delete the custom role "${r.name}"? Staff assigned to this role will lose permissions.`,
                            )
                          ) {
                            deleteRole(r.id)
                            await refresh()
                          }
                        }}
                        className='ml-1 text-slate-400 hover:text-rose-400 p-0.5 rounded hover:bg-slate-700/50'
                        title='Delete Role'
                      >
                        <X size={10} />
                      </span>
                    )}
                  </button>
                </div>
              ))}
              <NewRoleButton
                onCreate={async (name) => {
                  const created = saveRole({ name, permissions: [] })
                  await refresh()
                  setActiveRoleId(created.id)
                }}
              />
            </div>

            {/* Permission Toggles */}
            {activeRole && (
              <PermissionToggles
                role={activeRole}
                onSave={async (perms) => {
                  saveRole({
                    id: activeRole.id,
                    name: activeRole.name,
                    permissions: perms,
                  })
                  await refresh()
                }}
              />
            )}
          </div>

          {/* System Enforcement Notice Card */}
          <div className='bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/20 rounded-3xl p-5 backdrop-blur-sm'>
            <div className='flex items-center gap-2.5 text-amber-700 mb-2'>
              <ShieldAlert size={18} className='text-amber-600 shrink-0' />
              <span className='text-xs font-black uppercase tracking-wider'>
                Backend Security Guarantee
              </span>
            </div>
            <p className='text-[11px] text-amber-900/80 font-semibold leading-relaxed'>
              Permissions defined here act as server-enforced security policies. Even if front-end controls are bypassed, API endpoints validate every incoming authorization header against these active role blueprints.
            </p>
          </div>
        </div>
      </div>

      {/* Provision Staff Modal */}
      {showForm && (
        <CreateStaffModal
          roles={roles}
          onClose={() => setShowForm(false)}
          onCreated={async () => {
            await refresh()
            setShowForm(false)
          }}
        />
      )}
    </div>
  )
}

/* ---------------------------------------------------------------- */
/* Permission toggles module grid for the active role               */
/* ---------------------------------------------------------------- */
function PermissionToggles({
  role,
  onSave,
}: {
  role: StaffRole
  onSave: (perms: string[]) => void
}) {
  const [selected, setSelected] = useState<string[]>(role.permissions)
  const [saved, setSaved] = useState(false)

  // Sync state when selection changes
  useEffect(() => {
    setSelected(role.permissions)
    setSaved(false)
  }, [role.id, role.permissions])

  const toggle = (key: string) => {
    setSaved(false)
    setSelected((cur) =>
      cur.includes(key) ? cur.filter((k) => k !== key) : [...cur, key],
    )
  }

  const dirty =
    selected.length !== role.permissions.length ||
    selected.some((k) => !role.permissions.includes(k))

  return (
    <div className='space-y-5 relative z-10'>
      <div className='max-h-[380px] overflow-y-auto pr-1 space-y-4 custom-scrollbar'>
        {PERMISSION_MODULES.map((mod) => (
          <div
            key={mod}
            className='bg-slate-950/40 rounded-2xl p-3 border border-slate-800/60 space-y-2'
          >
            <span className='text-[9px] font-black uppercase tracking-widest text-blue-400/90 block px-1'>
              {mod} Module
            </span>
            <div className='flex flex-wrap gap-1.5'>
              {PERMISSIONS.filter((p) => p.module === mod).map((p) => {
                const on = selected.includes(p.key)
                return (
                  <button
                    key={p.key}
                    type='button'
                    onClick={() => toggle(p.key)}
                    className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-[10px] font-bold border transition-all duration-150 ${
                      on
                        ? 'bg-blue-600/90 border-blue-500 text-white shadow-sm'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                    }`}
                    title={p.key}
                  >
                    <div
                      className={`w-3.5 h-3.5 rounded-md flex items-center justify-center text-[9px] transition-colors ${
                        on ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-500'
                      }`}
                    >
                      {on ? <Check size={10} /> : null}
                    </div>
                    {p.label}
                    {p.sensitive && (
                      <Lock
                        size={10}
                        className={on ? 'text-blue-200' : 'text-amber-400'}
                      />
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Save Trigger Button */}
      <button
        type='button'
        onClick={() => {
          onSave(selected)
          setSaved(true)
        }}
        disabled={!dirty && !saved}
        className='w-full py-3.5 bg-blue-600 rounded-2xl font-black text-xs uppercase tracking-wider hover:bg-blue-500 active:scale-[0.99] transition-all shadow-lg shadow-blue-900/40 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2'
      >
        {saved && !dirty ? (
          <>
            <CheckCircle2 size={16} className='text-emerald-300' /> Blueprint Saved
          </>
        ) : (
          <>
            <Sparkles size={15} /> Commit Permission Changes
          </>
        )}
      </button>
    </div>
  )
}

/* ---------------------------------------------------------------- */
/* New Role creation button inline input                            */
/* ---------------------------------------------------------------- */
function NewRoleButton({ onCreate }: { onCreate: (name: string) => void }) {
  const [adding, setAdding] = useState(false)
  const [name, setName] = useState('')

  if (!adding) {
    return (
      <button
        type='button'
        onClick={() => setAdding(true)}
        className='px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider border border-dashed border-slate-700 text-slate-400 hover:text-white hover:border-blue-500 hover:bg-slate-800/50 transition-all flex items-center gap-1'
      >
        <Plus size={11} /> Custom Role
      </button>
    )
  }

  const commit = () => {
    if (name.trim().length >= 2) onCreate(name.trim())
    setName('')
    setAdding(false)
  }

  return (
    <div className='inline-flex items-center gap-1.5 bg-slate-900 p-1 rounded-xl border border-blue-500/80'>
      <input
        autoFocus
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') commit()
          if (e.key === 'Escape') {
            setName('')
            setAdding(false)
          }
        }}
        placeholder='e.g. Bursar'
        className='w-24 px-2 py-0.5 text-xs font-bold bg-transparent text-white outline-none placeholder:text-slate-500'
      />
      <button
        type='button'
        onClick={commit}
        className='p-1 rounded-lg bg-blue-600 text-white hover:bg-blue-500 transition-colors'
      >
        <Check size={12} />
      </button>
      <button
        type='button'
        onClick={() => setAdding(false)}
        className='p-1 rounded-lg text-slate-400 hover:text-white'
      >
        <X size={12} />
      </button>
    </div>
  )
}

/* ---------------------------------------------------------------- */
/* Create Staff Account Modal Component                             */
/* ---------------------------------------------------------------- */
function suggestPassword() {
  return 'DSAstaff' + Math.floor(1000 + ((Date.now() / 1000) % 9000))
}

function CreateStaffModal({
  roles,
  onClose,
  onCreated,
}: {
  roles: StaffRole[]
  onClose: () => void
  onCreated: () => void
}) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [roleId, setRoleId] = useState(roles[0]?.id ?? '')
  const [password, setPassword] = useState(suggestPassword())
  const [showPass, setShowPass] = useState(false)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (name.trim().length < 2) return setError('Enter the staff member’s full name')
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email))
      return setError('Enter a valid email address')
    if (!roleId) return setError('Pick a role assignment')
    if (password.length < 6)
      return setError('Password must be at least 6 characters long')

    setLoading(true)
    const created = addStaff({ name, email, roleId, password, now: Date.now() })
    setLoading(false)

    if (!created) {
      setError('A staff account with that email address already exists.')
      return
    }

    onCreated()
  }

  const copyCredentials = () => {
    navigator.clipboard.writeText(`Email: ${email}\nPassword: ${password}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const selectedRole = roles.find((r) => r.id === roleId)

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md animate-in fade-in duration-200'>
      <div className='w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-200'>
        {/* Header */}
        <div className='flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50'>
          <div className='flex items-center gap-3'>
            <div className='h-10 w-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20'>
              <UserPlus size={18} />
            </div>
            <div>
              <h3 className='text-sm font-black text-slate-900 uppercase tracking-tight'>
                Provision Staff Account
              </h3>
              <p className='text-[11px] font-medium text-slate-400'>
                Assign system responsibilities and access credentials
              </p>
            </div>
          </div>
          <button
            type='button'
            onClick={onClose}
            className='p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition-colors'
          >
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={submit} className='p-6 space-y-4'>
          {error && (
            <div className='flex items-center gap-2 p-3.5 rounded-2xl bg-rose-50 border border-rose-100 text-rose-600 text-xs font-bold animate-in fade-in'>
              <AlertCircle size={16} className='shrink-0' /> {error}
            </div>
          )}

          <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
            <label className='space-y-1.5 block'>
              <span className='text-[10px] font-black uppercase tracking-wider text-slate-400'>
                Full Name
              </span>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder='e.g. Grace Okon'
                className='w-full h-11 px-3.5 rounded-xl bg-slate-50 border border-slate-200/80 focus:border-blue-500 focus:bg-white outline-none text-xs font-bold transition-all'
              />
            </label>
            <label className='space-y-1.5 block'>
              <span className='text-[10px] font-black uppercase tracking-wider text-slate-400'>
                Email Address
              </span>
              <input
                type='email'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder='staff@domain.com'
                className='w-full h-11 px-3.5 rounded-xl bg-slate-50 border border-slate-200/80 focus:border-blue-500 focus:bg-white outline-none text-xs font-bold transition-all'
              />
            </label>
          </div>

          <label className='space-y-1.5 block'>
            <span className='text-[10px] font-black uppercase tracking-wider text-slate-400'>
              Assigned Role
            </span>
            <select
              value={roleId}
              onChange={(e) => setRoleId(e.target.value)}
              className='w-full h-11 px-3.5 rounded-xl bg-slate-50 border border-slate-200/80 focus:border-blue-500 focus:bg-white outline-none text-xs font-bold transition-all cursor-pointer'
            >
              {roles.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
          </label>

          {/* Role Preview Card */}
          {selectedRole && (
            <div className='rounded-2xl bg-slate-50 border border-slate-200/60 p-3.5 space-y-2'>
              <div className='flex items-center justify-between'>
                <span className='text-[10px] font-black uppercase tracking-wider text-slate-500'>
                  {selectedRole.name} Role Grants ({selectedRole.permissions.length})
                </span>
              </div>
              {selectedRole.permissions.length === 0 ? (
                <p className='text-[11px] text-slate-400 font-medium'>
                  No module grants configured yet for this role.
                </p>
              ) : (
                <div className='flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1 custom-scrollbar'>
                  {selectedRole.permissions.map((k) => (
                    <span
                      key={k}
                      className='px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-[9px] font-bold text-slate-700 shadow-2xs'
                    >
                      {permissionLabel(k)}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Password Input & Generator */}
          <label className='space-y-1.5 block'>
            <span className='text-[10px] font-black uppercase tracking-wider text-slate-400'>
              Temporary Password
            </span>
            <div className='flex gap-2'>
              <div className='relative flex-1'>
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className='w-full h-11 pl-3.5 pr-10 rounded-xl bg-slate-50 border border-slate-200/80 focus:border-blue-500 focus:bg-white outline-none text-xs font-mono font-bold transition-all'
                />
                <button
                  type='button'
                  onClick={() => setShowPass(!showPass)}
                  className='absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600'
                >
                  {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>

              <button
                type='button'
                onClick={() => setPassword(suggestPassword())}
                className='px-3.5 h-11 rounded-xl bg-slate-100 hover:bg-slate-200 text-[10px] font-black uppercase tracking-wider text-slate-700 transition-colors'
              >
                Regenerate
              </button>
              <button
                type='button'
                onClick={copyCredentials}
                className='px-3 h-11 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors'
                title='Copy Credentials'
              >
                {copied ? <Check size={14} className='text-emerald-600' /> : <Copy size={14} />}
              </button>
            </div>
          </label>

          {/* Action Footer */}
          <div className='flex items-center justify-between gap-3 pt-3 border-t border-slate-100'>
            <p className='text-[10px] font-medium text-slate-400'>
              The staff member can change their password upon initial login.
            </p>
            <button
              type='submit'
              disabled={loading}
              className='shrink-0 flex items-center gap-2 px-6 h-11 bg-blue-600 text-white rounded-xl font-black text-xs uppercase tracking-wider shadow-lg shadow-blue-500/20 hover:bg-blue-700 active:scale-95 transition-all disabled:opacity-60'
            >
              {loading ? (
                <Loader2 size={16} className='animate-spin' />
              ) : (
                <>
                  <UserPlus size={15} /> Provision Account
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}