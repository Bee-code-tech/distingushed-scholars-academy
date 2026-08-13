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
// } from 'lucide-react'
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

// export default function RolesPermissions() {
//   const [mounted, setMounted] = useState(false)
//   const [roles, setRoles] = useState<StaffRole[]>([])
//   const [staff, setStaff] = useState<StaffMember[]>([])
//   const [showForm, setShowForm] = useState(false)

//   // Selected role for the permission blueprint editor.
//   const [activeRoleId, setActiveRoleId] = useState<string>('')

//   const refresh = () => {
//     const r = getRoles()
//     setRoles(r)
//     setStaff(getStaff())
//     setActiveRoleId((cur) => (r.some((x) => x.id === cur) ? cur : r[0]?.id ?? ''))
//   }

//   // localStorage read must happen after mount to avoid SSR hydration mismatch.
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
//           <h1 className='text-2xl font-black text-slate-900 tracking-tight'>
//             Access Control
//           </h1>
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
//                           onClick={() => {
//                             removeStaff(member.id)
//                             refresh()
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
//                       onClick={(e) => {
//                         e.stopPropagation()
//                         deleteRole(r.id)
//                         refresh()
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
//                 onCreate={(name) => {
//                   const created = saveRole({ name, permissions: [] })
//                   refresh()
//                   setActiveRoleId(created.id)
//                 }}
//               />
//             </div>

//             {activeRole && (
//               <PermissionToggles
//                 role={activeRole}
//                 onSave={(perms) => {
//                   saveRole({
//                     id: activeRole.id,
//                     name: activeRole.name,
//                     permissions: perms,
//                   })
//                   refresh()
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
//               timetable). The backend must re-check every action — never trust
//               the client.
//             </p>
//           </div>
//         </div>
//       </div>

//       {showForm && (
//         <CreateStaffModal
//           roles={roles}
//           onClose={() => setShowForm(false)}
//           onCreated={() => {
//             refresh()
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
// /* Inline "new role" button                                          */
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
// /* Create-staff modal                                                */
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
//     if (password.length < 6) return setError('Password must be at least 6 characters')

//     setLoading(true)
//     // Browser-local create. When the backend exists this becomes
//     // POST /api/admin/staff { name, email, password, role } (see §9).
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

  // Selected role for the permission blueprint editor.
  const [activeRoleId, setActiveRoleId] = useState<string>('')

  const refresh = async () => {
    let loadedRoles: StaffRole[] = []

    try {
      // 1. Fetch roles directly from backend GET /api/admin/roles
      // Cast `res` to bypass TS empty object type constraint
      const res = (await dsaApi.admin.getRoles()) as { data?: any[] } | any[]

      // Handle standard API wrapper { success: true, count: X, data: [...] }
      const rolesData = Array.isArray(res) ? res : res?.data

      if (Array.isArray(rolesData) && rolesData.length > 0) {
        loadedRoles = rolesData.map(
          (r: { id: string; name: string; permissions: string[] }) => ({
            id: r.id,
            name: r.name,
            permissions: r.permissions || [],
            seeded: true, // Server roles are core/seeded by default
          }),
        )
        setSource('server')
      } else {
        throw new Error('No server roles returned')
      }
    } catch {
      // 2. Local fallback if API request fails or endpoint is unavailable
      loadedRoles = getRoles()
      setSource('local')
    }

    setRoles(loadedRoles)
    setStaff(getStaff())
    setActiveRoleId((cur) =>
      loadedRoles.some((x) => x.id === cur) ? cur : (loadedRoles[0]?.id ?? ''),
    )
  }

  // localStorage / API read on mount
  useEffect(() => {
    setMounted(true)
    refresh()
  }, [])

  const activeRole = useMemo(
    () => roles.find((r) => r.id === activeRoleId),
    [roles, activeRoleId],
  )

  const roleName = (id: string) => roles.find((r) => r.id === id)?.name ?? '—'

  if (!mounted) {
    return (
      <div className='max-w-6xl mx-auto py-20 flex justify-center'>
        <Loader2 className='animate-spin text-blue-500' />
      </div>
    )
  }

  return (
    <div className='max-w-6xl mx-auto space-y-6 animate-in fade-in duration-500 pb-10 px-4'>
      {/* Header */}
      <div className='flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4'>
        <div>
          <div className='flex items-center gap-2'>
            <h1 className='text-2xl font-black text-slate-900 tracking-tight'>
              Access Control
            </h1>
            <Badge
              className={`text-[8px] font-black ${
                source === 'server'
                  ? 'bg-emerald-50 text-emerald-600'
                  : 'bg-slate-100 text-slate-500'
              }`}
            >
              {source === 'server' ? (
                <>
                  <Cloud size={9} className='mr-1' /> Live Server
                </>
              ) : (
                <>
                  <HardDrive size={9} className='mr-1' /> Local Store
                </>
              )}
            </Badge>
          </div>
          <p className='text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1 flex items-center gap-2'>
            <Fingerprint size={12} className='text-blue-500' />
            Staff Accounts &amp; Role Permissions
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className='flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all'
        >
          <UserPlus size={14} /> Provision New Access
        </button>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-12 gap-6'>
        {/* Staff Directory */}
        <div className='lg:col-span-7 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden'>
          <div className='px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/30'>
            <h3 className='font-black text-slate-900 uppercase tracking-widest text-[10px]'>
              Staff Directory
            </h3>
            <span className='text-[9px] font-black uppercase text-slate-400'>
              {staff.length} account{staff.length === 1 ? '' : 's'}
            </span>
          </div>

          {staff.length === 0 ? (
            <div className='px-6 py-14 text-center'>
              <div className='w-12 h-12 mx-auto mb-3 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-300 border border-slate-100'>
                <UserPlus size={22} />
              </div>
              <p className='text-xs font-bold text-slate-500'>
                No staff accounts yet
              </p>
              <p className='text-[10px] text-slate-400 mt-1 font-medium'>
                Use “Provision New Access” to create a secretary, auditor, or
                other role.
              </p>
            </div>
          ) : (
            <div className='overflow-x-auto'>
              <table className='w-full text-left'>
                <thead>
                  <tr className='bg-slate-50/50 border-b border-slate-100'>
                    <th className='px-6 py-3 text-[9px] font-black uppercase text-slate-400'>
                      Team Member
                    </th>
                    <th className='px-4 py-3 text-[9px] font-black uppercase text-slate-400'>
                      Role
                    </th>
                    <th className='px-4 py-3 text-[9px] font-black uppercase text-slate-400 text-right'>
                      Remove
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
                              .join('')
                              .slice(0, 2)
                              .toUpperCase()}
                          </div>
                          <div>
                            <p className='text-xs font-bold text-slate-800'>
                              {member.name}
                            </p>
                            <p className='text-[10px] text-slate-400 font-medium flex items-center gap-1'>
                              <Mail size={9} /> {member.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className='px-4 py-4'>
                        <span className='px-2 py-0.5 rounded-md text-[9px] font-black uppercase border bg-blue-50 text-blue-600 border-blue-100'>
                          {roleName(member.roleId)}
                        </span>
                      </td>
                      <td className='px-6 py-4 text-right'>
                        <button
                          onClick={async () => {
                            removeStaff(member.id)
                            await refresh()
                          }}
                          className='p-1.5 text-slate-400 hover:text-rose-600 hover:bg-white rounded-md transition-all shadow-sm border border-transparent hover:border-slate-100'
                          title='Remove staff account'
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className='px-6 py-3 border-t border-slate-100 bg-slate-50/30'>
            <p className='text-[10px] text-slate-400 font-medium flex items-center gap-1.5'>
              <Activity size={10} className='text-[#FCB900]' />
              Staff sign in on the normal login page with their email &amp;
              temporary password.
            </p>
          </div>
        </div>

        {/* Role Permission Editor */}
        <div className='lg:col-span-5 space-y-4'>
          <div className='bg-slate-900 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden'>
            <div className='absolute top-0 right-0 p-4 opacity-10'>
              <ShieldCheck size={80} />
            </div>

            <div className='flex items-center gap-2 mb-4 text-blue-400 relative z-10'>
              <Lock size={16} />
              <h3 className='font-black uppercase tracking-widest text-[10px]'>
                Role Permissions
              </h3>
            </div>

            {/* Role selector */}
            <div className='flex flex-wrap gap-1.5 mb-5 relative z-10'>
              {roles.map((r) => (
                <button
                  key={r.id}
                  onClick={() => setActiveRoleId(r.id)}
                  className={`px-2.5 py-1 rounded-md text-[9px] font-black uppercase tracking-wide border transition-all ${
                    activeRoleId === r.id
                      ? 'bg-blue-600 border-blue-500 text-white'
                      : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
                  }`}
                >
                  {r.name}
                  {!r.seeded && (
                    <span
                      role='button'
                      tabIndex={0}
                      onClick={async (e) => {
                        e.stopPropagation()
                        deleteRole(r.id)
                        await refresh()
                      }}
                      className='ml-1.5 text-slate-500 hover:text-rose-400'
                      title='Delete role'
                    >
                      ×
                    </span>
                  )}
                </button>
              ))}
              <NewRoleButton
                onCreate={async (name) => {
                  const created = saveRole({ name, permissions: [] })
                  await refresh()
                  setActiveRoleId(created.id)
                }}
              />
            </div>

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

          <div className='bg-amber-50 border border-amber-100 rounded-2xl p-5'>
            <div className='flex items-center gap-2 text-amber-700 mb-2'>
              <ShieldAlert size={16} />
              <span className='text-[10px] font-black uppercase tracking-widest'>
                Enforced Server-Side
              </span>
            </div>
            <p className='text-[11px] text-amber-800 font-bold leading-relaxed opacity-80'>
              Permissions here are the source of truth for what each role can do
              (e.g. a Secretary verifies manual payments &amp; edits the
              timetable). The backend re-checks every request — client
              validations are purely for UI state.
            </p>
          </div>
        </div>
      </div>

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
/* Permission toggles for the selected role                          */
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

  // Reset local state when the active role changes.
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
      {PERMISSION_MODULES.map((mod) => (
        <div key={mod} className='space-y-2'>
          <span className='text-[9px] font-black uppercase tracking-wider text-slate-500'>
            {mod}
          </span>
          <div className='flex flex-wrap gap-1.5'>
            {PERMISSIONS.filter((p) => p.module === mod).map((p) => {
              const on = selected.includes(p.key)
              return (
                <button
                  key={p.key}
                  onClick={() => toggle(p.key)}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[9px] font-bold border transition-all ${
                    on
                      ? 'bg-blue-600 border-blue-500 text-white'
                      : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-blue-500 hover:text-white'
                  }`}
                  title={p.key}
                >
                  {on ? <Check size={10} /> : null}
                  {p.label}
                  {p.sensitive && (
                    <Lock
                      size={9}
                      className={on ? 'text-blue-200' : 'text-rose-500'}
                    />
                  )}
                </button>
              )
            })}
          </div>
        </div>
      ))}

      <button
        onClick={() => {
          onSave(selected)
          setSaved(true)
        }}
        disabled={!dirty && !saved}
        className='w-full py-3 bg-blue-600 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-900/40 disabled:opacity-40 flex items-center justify-center gap-2'
      >
        {saved && !dirty ? (
          <>
            <CheckCircle2 size={13} /> Saved
          </>
        ) : (
          'Commit Changes'
        )}
      </button>
    </div>
  )
}

/* ---------------------------------------------------------------- */
/* Inline "new role" button                                         */
/* ---------------------------------------------------------------- */
function NewRoleButton({ onCreate }: { onCreate: (name: string) => void }) {
  const [adding, setAdding] = useState(false)
  const [name, setName] = useState('')

  if (!adding) {
    return (
      <button
        onClick={() => setAdding(true)}
        className='px-2.5 py-1 rounded-md text-[9px] font-black uppercase tracking-wide border border-dashed border-slate-600 text-slate-400 hover:text-white hover:border-blue-500 transition-all flex items-center gap-1'
      >
        <Plus size={10} /> Role
      </button>
    )
  }

  const commit = () => {
    if (name.trim().length >= 2) onCreate(name.trim())
    setName('')
    setAdding(false)
  }

  return (
    <span className='flex items-center gap-1'>
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
        className='w-24 px-2 py-1 rounded-md text-[10px] font-bold bg-slate-800 border border-blue-500 text-white outline-none placeholder:text-slate-500'
      />
      <button
        onClick={commit}
        className='p-1 rounded-md bg-blue-600 text-white hover:bg-blue-700'
      >
        <Check size={11} />
      </button>
    </span>
  )
}

/* ---------------------------------------------------------------- */
/* Create-staff modal                                               */
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
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (name.trim().length < 2) return setError('Enter the staff member’s name')
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email))
      return setError('Enter a valid email address')
    if (!roleId) return setError('Pick a role')
    if (password.length < 6)
      return setError('Password must be at least 6 characters')

    setLoading(true)
    const created = addStaff({ name, email, roleId, password, now: Date.now() })
    setLoading(false)
    if (!created) {
      setError('A staff account with that email already exists.')
      return
    }
    onCreated()
  }

  const selectedRole = roles.find((r) => r.id === roleId)

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm'>
      <div className='w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden'>
        <div className='flex items-center justify-between px-6 py-4 border-b border-slate-100'>
          <div className='flex items-center gap-3'>
            <div className='h-9 w-9 rounded-xl bg-[#002EFF] text-white flex items-center justify-center'>
              <UserPlus size={16} />
            </div>
            <div>
              <h3 className='text-sm font-black text-slate-900 uppercase tracking-tight'>
                Create Staff Account
              </h3>
              <p className='text-[10px] font-bold text-slate-400'>
                Secretary, auditor, or any custom role
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className='p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-50'
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={submit} className='p-6 space-y-4'>
          {error && (
            <div className='flex items-center gap-2 p-3 rounded-xl bg-rose-50 text-rose-600 text-[11px] font-bold'>
              <AlertCircle size={15} className='shrink-0' /> {error}
            </div>
          )}

          <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
            <label className='space-y-1.5 block'>
              <span className='text-[10px] font-black uppercase tracking-widest text-slate-400'>
                Full Name
              </span>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder='e.g. Grace Okon'
                className='w-full h-11 px-3 rounded-lg bg-slate-50 border border-transparent focus:border-[#002EFF]/30 focus:bg-white outline-none text-sm font-medium transition-all'
              />
            </label>
            <label className='space-y-1.5 block'>
              <span className='text-[10px] font-black uppercase tracking-widest text-slate-400'>
                Email
              </span>
              <input
                type='email'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder='staff@example.com'
                className='w-full h-11 px-3 rounded-lg bg-slate-50 border border-transparent focus:border-[#002EFF]/30 focus:bg-white outline-none text-sm font-medium transition-all'
              />
            </label>
          </div>

          <label className='space-y-1.5 block'>
            <span className='text-[10px] font-black uppercase tracking-widest text-slate-400'>
              Role
            </span>
            <select
              value={roleId}
              onChange={(e) => setRoleId(e.target.value)}
              className='w-full h-11 px-3 rounded-lg bg-slate-50 border border-transparent focus:border-[#002EFF]/30 focus:bg-white outline-none text-sm font-bold transition-all'
            >
              {roles.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
          </label>

          {selectedRole && (
            <div className='rounded-xl bg-slate-50 border border-slate-100 p-3'>
              <p className='text-[9px] font-black uppercase tracking-widest text-slate-400 mb-2'>
                {selectedRole.name} can
              </p>
              {selectedRole.permissions.length === 0 ? (
                <p className='text-[11px] text-slate-400 font-medium'>
                  No permissions yet — set them in “Role Permissions”.
                </p>
              ) : (
                <div className='flex flex-wrap gap-1.5'>
                  {selectedRole.permissions.map((k) => (
                    <span
                      key={k}
                      className='px-2 py-0.5 rounded-md bg-white border border-slate-200 text-[9px] font-bold text-slate-600'
                    >
                      {permissionLabel(k)}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

          <label className='space-y-1.5 block'>
            <span className='text-[10px] font-black uppercase tracking-widest text-slate-400'>
              Temporary Password
            </span>
            <div className='flex gap-2'>
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className='flex-1 h-11 px-3 rounded-lg bg-slate-50 border border-transparent focus:border-[#002EFF]/30 focus:bg-white outline-none text-sm font-medium transition-all'
              />
              <button
                type='button'
                onClick={() => setPassword(suggestPassword())}
                className='px-3 h-11 rounded-lg bg-slate-100 text-[10px] font-black uppercase text-slate-600 hover:bg-slate-200 transition-all'
              >
                New
              </button>
            </div>
          </label>

          <div className='flex items-center justify-between gap-3 pt-2 border-t border-slate-50'>
            <p className='text-[10px] font-bold text-slate-400'>
              Share the email &amp; password with the staff member.
            </p>
            <button
              type='submit'
              disabled={loading}
              className='shrink-0 flex items-center gap-2 px-6 h-11 bg-[#002EFF] text-white rounded-xl font-black text-[11px] uppercase tracking-wide shadow-lg shadow-blue-200 hover:bg-blue-700 active:scale-95 transition-all disabled:opacity-60'
            >
              {loading ? (
                <Loader2 size={16} className='animate-spin' />
              ) : (
                <>
                  <UserPlus size={15} /> Create
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}