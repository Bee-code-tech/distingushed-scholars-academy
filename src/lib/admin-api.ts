// // src/lib/admin-api.ts
// import { AdminUser, getAdminSession } from './admin-auth'

// const BASE_URL =
//   process.env.NEXT_PUBLIC_API_URL ||
//   'https://api.distinguishedscholarsacademy.com'

// // ==========================================
// // TYPE DEFINITIONS
// // ==========================================

// export interface LoginCredentials {
//   email: string
//   password: string
// }

// export interface LoginResponse {
//   success: boolean
//   token: string
//   user: AdminUser
// }

// export type AcademicTrack = 'jamb' | 'waec' | 'postutme'

// export interface StaffRoleItem {
//   id: string
//   name: string
//   permissions: string[]
// }

// export interface RolesApiResponse {
//   success: boolean
//   count: number
//   data: StaffRoleItem[]
// }

// export interface TimetableResponse {
//   success: boolean
//   data: {
//     id: string
//     track: string
//     grid: string[][]
//     updatedAt: string
//   }
// }

// export interface AttendanceSessionData {
//   active: boolean
//   date: string
//   activatedAt: string
//   id?: string
// }

// export interface AttendanceCheckInRecord {
//   studentId: string
//   fullname: string
//   email: string
//   studentCode: string
//   status: string
//   at: string
// }

// export interface AttendanceCheckInsResponse {
//   success: boolean
//   count: number
//   data: AttendanceCheckInRecord[]
// }

// export interface MyAttendanceResponse {
//   success: boolean
//   data: {
//     present: number
//     total: number
//     rate: number
//     records: Array<{
//       date?: string
//       status?: string
//       at?: string
//       [key: string]: any
//     }>
//   }
// }

// // ==========================================
// // LIBRARY & MATERIAL TYPES
// // ==========================================

// export interface LibraryMaterial {
//   id: string
//   title: string
//   category: string
//   size: string | number
//   uploadDate?: string
//   createdAt?: string
//   type?: string
//   fileUrl?: string
//   key?: string
// }

// export interface LibraryMaterialsResponse {
//   success?: boolean
//   count?: number
//   data: LibraryMaterial[]
// }

// export interface SignUploadUrlParams {
//   filename: string
//   contentType: string
//   folder?: string
// }

// export interface SignUploadUrlResponse {
//   success?: boolean
//   data?: {
//     uploadUrl: string
//     fileUrl: string
//     key: string
//   }
//   uploadUrl?: string
//   fileUrl?: string
//   key?: string
// }

// export interface CreateMaterialPayload {
//   title: string
//   category: string
//   size: string
//   type?: string
//   fileUrl?: string
//   key?: string
// }

// // ==========================================
// // NOTIFICATION TYPES
// // ==========================================

// export interface NotificationItem {
//   id: string
//   type: 'class_reminder' | 'announcement' | 'grade' | string
//   title: string
//   body: string
//   link?: string
//   isRead: boolean
//   createdAt: string
// }

// export interface NotificationsResponse {
//   success: boolean
//   count: number
//   data: NotificationItem[]
// }

// export interface MarkReadResponse {
//   success: boolean
//   message: string
// }

// /**
//  * Generic API client wrapper handling Authorization headers
//  */
// async function adminFetch<T>(
//   endpoint: string,
//   options: RequestInit = {},
// ): Promise<T> {
//   const session = getAdminSession()
//   const token =
//     session?.token ||
//     (typeof window !== 'undefined' ? localStorage.getItem('token') : null)

//   const headers: HeadersInit = {
//     'Content-Type': 'application/json',
//     ...(token ? { Authorization: `Bearer ${token}` } : {}),
//     ...options.headers,
//   }

//   const response = await fetch(`${BASE_URL}${endpoint}`, {
//     ...options,
//     headers,
//   })

//   if (!response.ok) {
//     const errorData = await response
//       .json()
//       .catch(() => ({ message: 'An unexpected error occurred.' }))
//     throw new Error(
//       errorData.message || `HTTP error! Status: ${response.status}`,
//     )
//   }

//   // Return text for CSV downloads or raw data
//   if (response.headers.get('content-type')?.includes('text/csv')) {
//     return (await response.text()) as unknown as T
//   }

//   return response.json()
// }

// export const adminApi = {
//   // ==========================================
//   // AUTHENTICATION
//   // ==========================================

//   /**
//    * Log in an existing user (Admin, Staff, Tutor, etc.)
//    * Endpoint: POST /api/auth/login
//    */
//   login: (credentials: LoginCredentials) =>
//     adminFetch<LoginResponse>('/api/auth/login', {
//       method: 'POST',
//       body: JSON.stringify(credentials),
//     }),

//   // ==========================================
//   // CORE ADMIN & USER MANAGEMENT
//   // ==========================================

//   /** List users by role */
//   getUsers: <T = any>(role?: string) =>
//     adminFetch<T>(
//       `/api/admin/users${role ? `?role=${encodeURIComponent(role)}` : ''}`,
//     ),

//   /** Create tutor, parent, staff, or admin */
//   createStaff: <T = any>(data: Record<string, any>) =>
//     adminFetch<T>('/api/admin/staff', {
//       method: 'POST',
//       body: JSON.stringify(data),
//     }),

//   /** List staff roles & permissions */
//   getRoles: () => adminFetch<RolesApiResponse>('/api/admin/roles'),

//   /** Create or update a staff role */
//   upsertRole: <T = any>(roleData: Record<string, any>) =>
//     adminFetch<T>('/api/admin/roles', {
//       method: 'POST',
//       body: JSON.stringify(roleData),
//     }),

//   /** Mark student paid (offline / cash / bank transfer) */
//   markManualPayment: <T = any>(paymentData: {
//     studentId: string
//     amount: number
//     reference?: string
//   }) =>
//     adminFetch<T>('/api/admin/payments/manual', {
//       method: 'POST',
//       body: JSON.stringify(paymentData),
//     }),

//   // ==========================================
//   // ANNOUNCEMENTS MANAGEMENT
//   // ==========================================

//   /** List announcements with optional scope/track filters */
//   getAnnouncements: <T = any>(params?: { scope?: string; track?: string }) => {
//     const queryParams = new URLSearchParams()
//     if (params?.scope) queryParams.append('scope', params.scope)
//     if (params?.track) queryParams.append('track', params.track)

//     const queryString = queryParams.toString()
//     return adminFetch<T>(
//       `/api/announcements${queryString ? `?${queryString}` : ''}`,
//     )
//   },

//   /** Create and broadcast announcement to matching students */
//   createAnnouncement: <T = any>(announcementData: {
//     scope: 'global' | 'track' | 'course' | string
//     title: string
//     body: string
//     examTrack?: AcademicTrack | string
//     [key: string]: any
//   }) =>
//     adminFetch<T>('/api/announcements', {
//       method: 'POST',
//       body: JSON.stringify(announcementData),
//     }),

//   // ==========================================
//   // COURSE MANAGEMENT
//   // ==========================================

//   /** Create a course */
//   createCourse: <T = any>(courseData: Record<string, any>) =>
//     adminFetch<T>('/api/courses', {
//       method: 'POST',
//       body: JSON.stringify(courseData),
//     }),

//   /** Update course / assign tutor */
//   updateCourse: <T = any>(
//     courseId: string,
//     courseData: Record<string, any>,
//   ) =>
//     adminFetch<T>(`/api/courses/${encodeURIComponent(courseId)}`, {
//       method: 'PUT',
//       body: JSON.stringify(courseData),
//     }),

//   /** Delete course */
//   deleteCourse: <T = any>(courseId: string) =>
//     adminFetch<T>(`/api/courses/${encodeURIComponent(courseId)}`, {
//       method: 'DELETE',
//     }),

//   // ==========================================
//   // QUIZ MANAGEMENT
//   // ==========================================

//   /** Get all quizzes */
//   getAllQuizzes: <T = any>() => adminFetch<T>('/api/quizzes'),

//   /** Create a new quiz */
//   createQuiz: <T = any>(quizData: Record<string, any>) =>
//     adminFetch<T>('/api/quizzes', {
//       method: 'POST',
//       body: JSON.stringify(quizData),
//     }),

//   /** Update a quiz */
//   updateQuiz: <T = any>(quizId: string, quizData: Record<string, any>) =>
//     adminFetch<T>(`/api/quizzes/${encodeURIComponent(quizId)}`, {
//       method: 'PUT',
//       body: JSON.stringify(quizData),
//     }),

//   /** Delete a quiz */
//   deleteQuiz: <T = any>(quizId: string) =>
//     adminFetch<T>(`/api/quizzes/${encodeURIComponent(quizId)}`, {
//       method: 'DELETE',
//     }),

//   /** Toggle quiz status (active/inactive) */
//   toggleQuizStatus: <T = any>(
//     quizId: string,
//     status: { isActive: boolean },
//   ) =>
//     adminFetch<T>(`/api/quizzes/${encodeURIComponent(quizId)}/status`, {
//       method: 'PATCH',
//       body: JSON.stringify(status),
//     }),

//   // ==========================================
//   // PROGRAM MANAGEMENT
//   // ==========================================

//   /** Upsert program countdown */
//   upsertProgram: <T = any>(programData: Record<string, any>) =>
//     adminFetch<T>('/api/programs', {
//       method: 'POST',
//       body: JSON.stringify(programData),
//     }),

//   // ==========================================
//   // TIMETABLE MANAGEMENT
//   // ==========================================

//   /**
//    * Fetch the 6-day x 4-period timetable grid for a specific academic track.
//    * Tracks supported: 'jamb' | 'waec' | 'postutme'
//    */
//   getTimetable: (track: AcademicTrack) =>
//     adminFetch<TimetableResponse>(
//       `/api/timetable/${encodeURIComponent(track)}`,
//     ),

//   /**
//    * Update/Schedule the 6-day x 4-period timetable grid for a specific track (Admin/Staff only).
//    */
//   updateTimetable: (track: AcademicTrack, grid: string[][]) =>
//     adminFetch<TimetableResponse>(
//       `/api/timetable/${encodeURIComponent(track)}`,
//       {
//         method: 'PUT',
//         body: JSON.stringify({ grid }),
//       },
//     ),

//   // ==========================================
//   // ATTENDANCE MANAGEMENT
//   // ==========================================

//   /** Activate attendance session for a day (defaults to today YYYY-MM-DD) */
//   activateAttendanceSession: (sessionData?: {
//     date?: string
//     courseId?: string
//   }) =>
//     adminFetch<{
//       success: boolean
//       data?: AttendanceSessionData
//     }>('/api/attendance/sessions', {
//       method: 'POST',
//       body: JSON.stringify(sessionData || {}),
//     }),

//   /** Close attendance session for a specific date (e.g. '2026-08-11') */
//   closeAttendanceSession: (date: string) =>
//     adminFetch<{ success: boolean; message?: string }>(
//       `/api/attendance/sessions/${encodeURIComponent(date)}`,
//       {
//         method: 'DELETE',
//       },
//     ),

//   /** Check if an attendance session is currently active */
//   getCurrentAttendanceSession: () =>
//     adminFetch<{
//       success: boolean
//       data: AttendanceSessionData
//     }>('/api/attendance/sessions/current'),

//   /** Student self check-in */
//   studentCheckIn: () =>
//     adminFetch<{
//       success: boolean
//       data: {
//         status: string
//         at: string
//         date: string
//       }
//     }>('/api/attendance/check-in', {
//       method: 'POST',
//       body: JSON.stringify({}),
//     }),

//   /** Monitor live student check-ins for a given date (defaults to today) */
//   getAttendanceCheckIns: (date?: string) =>
//     adminFetch<AttendanceCheckInsResponse>(
//       `/api/attendance/check-ins${date ? `?date=${encodeURIComponent(date)}` : ''}`,
//     ),

//   /** Get current student's own attendance record summary & history */
//   getMyAttendance: () =>
//     adminFetch<MyAttendanceResponse>('/api/attendance/me'),

//   /** Download attendance CSV report with optional date range and course filters */
//   getAttendanceReport: (params?: {
//     from?: string
//     to?: string
//     courseId?: string
//   }) => {
//     const queryParams = new URLSearchParams()
//     if (params?.from) queryParams.append('from', params.from)
//     if (params?.to) queryParams.append('to', params.to)
//     if (params?.courseId) queryParams.append('courseId', params.courseId)

//     const queryString = queryParams.toString()
//     return adminFetch<string>(
//       `/api/attendance/report${queryString ? `?${queryString}` : ''}`,
//     )
//   },

//   // ==========================================
//   // LIBRARY & MATERIAL MANAGEMENT
//   // ==========================================

//   /** Get all library materials */
//   getLibraryMaterials: () =>
//     adminFetch<LibraryMaterialsResponse | LibraryMaterial[]>('/api/library'),

//   /** Request a presigned URL for direct cloud upload */
//   signUploadUrl: (params: SignUploadUrlParams) =>
//     adminFetch<SignUploadUrlResponse>('/api/library/sign-url', {
//       method: 'POST',
//       body: JSON.stringify(params),
//     }),

//   /** Create a new library material metadata record */
//   createLibraryMaterial: (payload: CreateMaterialPayload) =>
//     adminFetch<{ success: boolean; data: LibraryMaterial } | LibraryMaterial>(
//       '/api/library',
//       {
//         method: 'POST',
//         body: JSON.stringify(payload),
//       },
//     ),

//   /** Delete a library material by ID */
//   deleteLibraryMaterial: (id: string) =>
//     adminFetch<{ success: boolean; message?: string }>(
//       `/api/library/${encodeURIComponent(id)}`,
//       {
//         method: 'DELETE',
//       },
//     ),

//   // ==========================================
//   // NOTIFICATIONS MANAGEMENT
//   // ==========================================

//   /**
//    * Fetch in-app notifications for the logged-in user
//    * Endpoint: GET /api/notifications
//    */
//   getNotifications: (unreadOnly = false) =>
//     adminFetch<NotificationsResponse>(
//       `/api/notifications${unreadOnly ? '?unread=true' : ''}`,
//     ),

//   /**
//    * Mark all notifications as read for the logged-in user
//    * Endpoint: PATCH /api/notifications/read-all
//    */
//   markAllNotificationsRead: () =>
//     adminFetch<MarkReadResponse>('/api/notifications/read-all', {
//       method: 'PATCH',
//     }),

//   /**
//    * Mark a single notification as read by ID
//    * Endpoint: PATCH /api/notifications/{id}/read
//    */
//   markNotificationRead: (id: string) =>
//     adminFetch<MarkReadResponse>(
//       `/api/notifications/${encodeURIComponent(id)}/read`,
//       {
//         method: 'PATCH',
//       },
//     ),
// }

// // Named exports for Attendance Module
// export const attendanceApi = {
//   activateAttendanceSession: adminApi.activateAttendanceSession,
//   closeAttendanceSession: adminApi.closeAttendanceSession,
//   getCurrentAttendanceSession: adminApi.getCurrentAttendanceSession,
//   studentCheckIn: adminApi.studentCheckIn,
//   getAttendanceCheckIns: adminApi.getAttendanceCheckIns,
//   getMyAttendance: adminApi.getMyAttendance,
//   getAttendanceReport: adminApi.getAttendanceReport,
// }

// // Direct Named Exports for Library Module
// export const fetchLibraryMaterials = adminApi.getLibraryMaterials
// export const signUploadUrl = adminApi.signUploadUrl
// export const createLibraryMaterial = adminApi.createLibraryMaterial
// export const deleteLibraryMaterial = adminApi.deleteLibraryMaterial

// export const libraryApi = {
//   getMaterials: adminApi.getLibraryMaterials,
//   fetchLibraryMaterials: adminApi.getLibraryMaterials,
//   signUploadUrl: adminApi.signUploadUrl,
//   createMaterial: adminApi.createLibraryMaterial,
//   createLibraryMaterial: adminApi.createLibraryMaterial,
//   deleteMaterial: adminApi.deleteLibraryMaterial,
//   deleteLibraryMaterial: adminApi.deleteLibraryMaterial,
// }

// // Direct Named Exports for Notifications Module
// export const fetchNotifications = adminApi.getNotifications
// export const markAllNotificationsRead = adminApi.markAllNotificationsRead
// export const markNotificationRead = adminApi.markNotificationRead

// export const notificationsApi = {
//   getNotifications: adminApi.getNotifications,
//   fetchNotifications: adminApi.getNotifications,
//   markAllNotificationsRead: adminApi.markAllNotificationsRead,
//   markNotificationRead: adminApi.markNotificationRead,
// }

// // Master API aggregation (spread first to avoid overwriting warning)
// export const dsaApi = {
//   ...adminApi,
//   admin: adminApi,
//   attendance: attendanceApi,
//   library: libraryApi,
//   notifications: notificationsApi,
//   fetchLibraryMaterials: adminApi.getLibraryMaterials,
//   fetchNotifications: adminApi.getNotifications,
// }


// src/lib/admin-api.ts
import { AdminUser, getAdminSession } from './admin-auth'

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  'https://api.distinguishedscholarsacademy.com'

// ==========================================
// TYPE DEFINITIONS
// ==========================================

export interface LoginCredentials {
  email: string
  password: string
}

export interface LoginResponse {
  success: boolean
  token: string
  user: AdminUser
}

export type AcademicTrack = 'jamb' | 'waec' | 'postutme'

export interface StaffRoleItem {
  id: string
  name: string
  permissions: string[]
}

export interface RolesApiResponse {
  success: boolean
  count: number
  data: StaffRoleItem[]
}

export interface TimetableResponse {
  success: boolean
  data: {
    id: string
    track: string
    grid: string[][]
    updatedAt: string
  }
}

export interface AttendanceSessionData {
  active: boolean
  date: string
  activatedAt: string
  id?: string
}

export interface AttendanceCheckInRecord {
  studentId: string
  fullname: string
  email: string
  studentCode: string
  status: string
  at: string
}

export interface AttendanceCheckInsResponse {
  success: boolean
  count: number
  data: AttendanceCheckInRecord[]
}

export interface MyAttendanceResponse {
  success: boolean
  data: {
    present: number
    total: number
    rate: number
    records: Array<{
      date?: string
      status?: string
      at?: string
      [key: string]: any
    }>
  }
}

// ==========================================
// USER MANAGEMENT TYPES
// ==========================================

export interface GetUsersParams {
  role: 'student' | 'tutor' | 'parent' | 'staff' | 'admin' | string
  search?: string
  page?: number
  limit?: number
  status?:
    | 'active'
    | 'suspended'
    | 'pending_payment'
    | 'pending_otp'
    | 'payment_failed'
    | 'deleted'
    | 'all'
    | string
}

export interface AdminUserListItem {
  id: string
  fullname: string
  email: string
  role: string
  examTrack?: string
  learningMode?: string
  subjects?: string[]
  wardName?: string
  staffRole?: string
  permissions?: string[]
}

export interface GetUsersResponse {
  success: boolean
  count: number
  page: number
  limit: number
  data: AdminUserListItem[]
}

export interface UpdateUserStatusPayload {
  status: 'suspended' | 'active' | string
}

export interface ActionSuccessResponse {
  success: boolean
  message: string
  data?: any
}

// ==========================================
// LIBRARY & MATERIAL TYPES
// ==========================================

export interface LibraryMaterial {
  id: string
  title: string
  category: string
  size: string | number
  uploadDate?: string
  createdAt?: string
  type?: string
  fileUrl?: string
  key?: string
}

export interface LibraryMaterialsResponse {
  success?: boolean
  count?: number
  data: LibraryMaterial[]
}

export interface SignUploadUrlParams {
  filename: string
  contentType: string
  folder?: string
}

export interface SignUploadUrlResponse {
  success?: boolean
  data?: {
    uploadUrl: string
    fileUrl: string
    key: string
  }
  uploadUrl?: string
  fileUrl?: string
  key?: string
}

export interface CreateMaterialPayload {
  title: string
  category: string
  size: string
  type?: string
  fileUrl?: string
  key?: string
}

// ==========================================
// NOTIFICATION TYPES
// ==========================================

export interface NotificationItem {
  id: string
  type: 'class_reminder' | 'announcement' | 'grade' | string
  title: string
  body: string
  link?: string
  isRead: boolean
  createdAt: string
}

export interface NotificationsResponse {
  success: boolean
  count: number
  data: NotificationItem[]
}

export interface MarkReadResponse {
  success: boolean
  message: string
}

/**
 * Generic API client wrapper handling Authorization headers
 */
async function adminFetch<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const session = getAdminSession()
  const token =
    session?.token ||
    (typeof window !== 'undefined' ? localStorage.getItem('token') : null)

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  })

  if (!response.ok) {
    const errorData = await response
      .json()
      .catch(() => ({ message: 'An unexpected error occurred.' }))
    throw new Error(
      errorData.message || `HTTP error! Status: ${response.status}`,
    )
  }

  // Return text for CSV downloads or raw data
  if (response.headers.get('content-type')?.includes('text/csv')) {
    return (await response.text()) as unknown as T
  }

  return response.json()
}

export const adminApi = {
  // ==========================================
  // AUTHENTICATION
  // ==========================================

  /**
   * Log in an existing user (Admin, Staff, Tutor, etc.)
   * Endpoint: POST /api/auth/login
   */
  login: (credentials: LoginCredentials) =>
    adminFetch<LoginResponse>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }),

  // ==========================================
  // CORE ADMIN & USER MANAGEMENT
  // ==========================================

  /**
   * List users by role with support for query parameters (search, page, limit, status)
   * Endpoint: GET /api/admin/users
   */
  getUsers: (params: GetUsersParams | string) => {
    if (typeof params === 'string') {
      return adminFetch<GetUsersResponse>(
        `/api/admin/users?role=${encodeURIComponent(params)}`,
      )
    }

    const queryParams = new URLSearchParams()
    if (params.role) queryParams.append('role', params.role)
    if (params.search) queryParams.append('search', params.search)
    if (params.page !== undefined)
      queryParams.append('page', params.page.toString())
    if (params.limit !== undefined)
      queryParams.append('limit', params.limit.toString())
    if (params.status) queryParams.append('status', params.status)

    const queryString = queryParams.toString()
    return adminFetch<GetUsersResponse>(
      `/api/admin/users${queryString ? `?${queryString}` : ''}`,
    )
  },

  /**
   * Suspend or reactivate a user account
   * Endpoint: PATCH /api/admin/users/{id}/status
   */
  updateUserStatus: (id: string, payload: UpdateUserStatusPayload) =>
    adminFetch<ActionSuccessResponse>(
      `/api/admin/users/${encodeURIComponent(id)}/status`,
      {
        method: 'PATCH',
        body: JSON.stringify(payload),
      },
    ),

  /**
   * Soft-delete a user
   * Endpoint: DELETE /api/admin/users/{id}
   */
  deleteUser: (id: string) =>
    adminFetch<ActionSuccessResponse>(
      `/api/admin/users/${encodeURIComponent(id)}`,
      {
        method: 'DELETE',
      },
    ),

  /**
   * Create tutor, parent, staff, or admin account directly
   * Endpoint: POST /api/admin/staff
   */
  createStaff: <T = ActionSuccessResponse>(data: Record<string, any>) =>
    adminFetch<T>('/api/admin/staff', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  /**
   * List staff roles & permissions
   * Endpoint: GET /api/admin/roles
   */
  getRoles: () => adminFetch<RolesApiResponse>('/api/admin/roles'),

  /**
   * Create or update a staff role (Upsert)
   * Endpoint: POST /api/admin/roles
   */
  upsertRole: <T = ActionSuccessResponse>(roleData: {
    id?: string
    name: string
    permissions: string[]
    [key: string]: any
  }) =>
    adminFetch<T>('/api/admin/roles', {
      method: 'POST',
      body: JSON.stringify(roleData),
    }),

  /** Mark student paid (offline / cash / bank transfer) */
  markManualPayment: <T = any>(paymentData: {
    studentId: string
    amount: number
    reference?: string
  }) =>
    adminFetch<T>('/api/admin/payments/manual', {
      method: 'POST',
      body: JSON.stringify(paymentData),
    }),

  // ==========================================
  // ANNOUNCEMENTS MANAGEMENT
  // ==========================================

  /** List announcements with optional scope/track filters */
  getAnnouncements: <T = any>(params?: { scope?: string; track?: string }) => {
    const queryParams = new URLSearchParams()
    if (params?.scope) queryParams.append('scope', params.scope)
    if (params?.track) queryParams.append('track', params.track)

    const queryString = queryParams.toString()
    return adminFetch<T>(
      `/api/announcements${queryString ? `?${queryString}` : ''}`,
    )
  },

  /** Create and broadcast announcement to matching students */
  createAnnouncement: <T = any>(announcementData: {
    scope: 'global' | 'track' | 'course' | string
    title: string
    body: string
    examTrack?: AcademicTrack | string
    [key: string]: any
  }) =>
    adminFetch<T>('/api/announcements', {
      method: 'POST',
      body: JSON.stringify(announcementData),
    }),

  // ==========================================
  // COURSE MANAGEMENT
  // ==========================================

  /** Create a course */
  createCourse: <T = any>(courseData: Record<string, any>) =>
    adminFetch<T>('/api/courses', {
      method: 'POST',
      body: JSON.stringify(courseData),
    }),

  /** Update course / assign tutor */
  updateCourse: <T = any>(
    courseId: string,
    courseData: Record<string, any>,
  ) =>
    adminFetch<T>(`/api/courses/${encodeURIComponent(courseId)}`, {
      method: 'PUT',
      body: JSON.stringify(courseData),
    }),

  /** Delete course */
  deleteCourse: <T = any>(courseId: string) =>
    adminFetch<T>(`/api/courses/${encodeURIComponent(courseId)}`, {
      method: 'DELETE',
    }),

  // ==========================================
  // QUIZ MANAGEMENT
  // ==========================================

  /** Get all quizzes */
  getAllQuizzes: <T = any>() => adminFetch<T>('/api/quizzes'),

  /** Create a new quiz */
  createQuiz: <T = any>(quizData: Record<string, any>) =>
    adminFetch<T>('/api/quizzes', {
      method: 'POST',
      body: JSON.stringify(quizData),
    }),

  /** Update a quiz */
  updateQuiz: <T = any>(quizId: string, quizData: Record<string, any>) =>
    adminFetch<T>(`/api/quizzes/${encodeURIComponent(quizId)}`, {
      method: 'PUT',
      body: JSON.stringify(quizData),
    }),

  /** Delete a quiz */
  deleteQuiz: <T = any>(quizId: string) =>
    adminFetch<T>(`/api/quizzes/${encodeURIComponent(quizId)}`, {
      method: 'DELETE',
    }),

  /** Toggle quiz status (active/inactive) */
  toggleQuizStatus: <T = any>(
    quizId: string,
    status: { isActive: boolean },
  ) =>
    adminFetch<T>(`/api/quizzes/${encodeURIComponent(quizId)}/status`, {
      method: 'PATCH',
      body: JSON.stringify(status),
    }),

  // ==========================================
  // PROGRAM MANAGEMENT
  // ==========================================

  /** Upsert program countdown */
  upsertProgram: <T = any>(programData: Record<string, any>) =>
    adminFetch<T>('/api/programs', {
      method: 'POST',
      body: JSON.stringify(programData),
    }),

  // ==========================================
  // TIMETABLE MANAGEMENT
  // ==========================================

  /**
   * Fetch the 6-day x 4-period timetable grid for a specific academic track.
   * Tracks supported: 'jamb' | 'waec' | 'postutme'
   */
  getTimetable: (track: AcademicTrack) =>
    adminFetch<TimetableResponse>(
      `/api/timetable/${encodeURIComponent(track)}`,
    ),

  /**
   * Update/Schedule the 6-day x 4-period timetable grid for a specific track (Admin/Staff only).
   */
  updateTimetable: (track: AcademicTrack, grid: string[][]) =>
    adminFetch<TimetableResponse>(
      `/api/timetable/${encodeURIComponent(track)}`,
      {
        method: 'PUT',
        body: JSON.stringify({ grid }),
      },
    ),

  // ==========================================
  // ATTENDANCE MANAGEMENT
  // ==========================================

  /** Activate attendance session for a day (defaults to today YYYY-MM-DD) */
  activateAttendanceSession: (sessionData?: {
    date?: string
    courseId?: string
  }) =>
    adminFetch<{
      success: boolean
      data?: AttendanceSessionData
    }>('/api/attendance/sessions', {
      method: 'POST',
      body: JSON.stringify(sessionData || {}),
    }),

  /** Close attendance session for a specific date (e.g. '2026-08-11') */
  closeAttendanceSession: (date: string) =>
    adminFetch<{ success: boolean; message?: string }>(
      `/api/attendance/sessions/${encodeURIComponent(date)}`,
      {
        method: 'DELETE',
      },
    ),

  /** Check if an attendance session is currently active */
  getCurrentAttendanceSession: () =>
    adminFetch<{
      success: boolean
      data: AttendanceSessionData
    }>('/api/attendance/sessions/current'),

  /** Student self check-in */
  studentCheckIn: () =>
    adminFetch<{
      success: boolean
      data: {
        status: string
        at: string
        date: string
      }
    }>('/api/attendance/check-in', {
      method: 'POST',
      body: JSON.stringify({}),
    }),

  /** Monitor live student check-ins for a given date (defaults to today) */
  getAttendanceCheckIns: (date?: string) =>
    adminFetch<AttendanceCheckInsResponse>(
      `/api/attendance/check-ins${date ? `?date=${encodeURIComponent(date)}` : ''}`,
    ),

  /** Get current student's own attendance record summary & history */
  getMyAttendance: () =>
    adminFetch<MyAttendanceResponse>('/api/attendance/me'),

  /** Download attendance CSV report with optional date range and course filters */
  getAttendanceReport: (params?: {
    from?: string
    to?: string
    courseId?: string
  }) => {
    const queryParams = new URLSearchParams()
    if (params?.from) queryParams.append('from', params.from)
    if (params?.to) queryParams.append('to', params.to)
    if (params?.courseId) queryParams.append('courseId', params.courseId)

    const queryString = queryParams.toString()
    return adminFetch<string>(
      `/api/attendance/report${queryString ? `?${queryString}` : ''}`,
    )
  },

  // ==========================================
  // LIBRARY & MATERIAL MANAGEMENT
  // ==========================================

  /** Get all library materials */
  getLibraryMaterials: () =>
    adminFetch<LibraryMaterialsResponse | LibraryMaterial[]>('/api/library'),

  /** Request a presigned URL for direct cloud upload */
  signUploadUrl: (params: SignUploadUrlParams) =>
    adminFetch<SignUploadUrlResponse>('/api/library/sign-url', {
      method: 'POST',
      body: JSON.stringify(params),
    }),

  /** Create a new library material metadata record */
  createLibraryMaterial: (payload: CreateMaterialPayload) =>
    adminFetch<{ success: boolean; data: LibraryMaterial } | LibraryMaterial>(
      '/api/library',
      {
        method: 'POST',
        body: JSON.stringify(payload),
      },
    ),

  /** Delete a library material by ID */
  deleteLibraryMaterial: (id: string) =>
    adminFetch<{ success: boolean; message?: string }>(
      `/api/library/${encodeURIComponent(id)}`,
      {
        method: 'DELETE',
      },
    ),

  // ==========================================
  // NOTIFICATIONS MANAGEMENT
  // ==========================================

  /**
   * Fetch in-app notifications for the logged-in user
   * Endpoint: GET /api/notifications
   */
  getNotifications: (unreadOnly = false) =>
    adminFetch<NotificationsResponse>(
      `/api/notifications${unreadOnly ? '?unread=true' : ''}`,
    ),

  /**
   * Mark all notifications as read for the logged-in user
   * Endpoint: PATCH /api/notifications/read-all
   */
  markAllNotificationsRead: () =>
    adminFetch<MarkReadResponse>('/api/notifications/read-all', {
      method: 'PATCH',
    }),

  /**
   * Mark a single notification as read by ID
   * Endpoint: PATCH /api/notifications/{id}/read
   */
  markNotificationRead: (id: string) =>
    adminFetch<MarkReadResponse>(
      `/api/notifications/${encodeURIComponent(id)}/read`,
      {
        method: 'PATCH',
      },
    ),
}

// Named exports for User Management
export const fetchAdminUsers = adminApi.getUsers
export const updateUserStatus = adminApi.updateUserStatus
export const deleteAdminUser = adminApi.deleteUser
export const createStaffAccount = adminApi.createStaff
export const fetchAdminRoles = adminApi.getRoles
export const upsertAdminRole = adminApi.upsertRole

export const userManagementApi = {
  getUsers: adminApi.getUsers,
  updateUserStatus: adminApi.updateUserStatus,
  deleteUser: adminApi.deleteUser,
  createStaff: adminApi.createStaff,
  getRoles: adminApi.getRoles,
  upsertRole: adminApi.upsertRole,
}

// Named exports for Attendance Module
export const attendanceApi = {
  activateAttendanceSession: adminApi.activateAttendanceSession,
  closeAttendanceSession: adminApi.closeAttendanceSession,
  getCurrentAttendanceSession: adminApi.getCurrentAttendanceSession,
  studentCheckIn: adminApi.studentCheckIn,
  getAttendanceCheckIns: adminApi.getAttendanceCheckIns,
  getMyAttendance: adminApi.getMyAttendance,
  getAttendanceReport: adminApi.getAttendanceReport,
}

// Direct Named Exports for Library Module
export const fetchLibraryMaterials = adminApi.getLibraryMaterials
export const signUploadUrl = adminApi.signUploadUrl
export const createLibraryMaterial = adminApi.createLibraryMaterial
export const deleteLibraryMaterial = adminApi.deleteLibraryMaterial

export const libraryApi = {
  getMaterials: adminApi.getLibraryMaterials,
  fetchLibraryMaterials: adminApi.getLibraryMaterials,
  signUploadUrl: adminApi.signUploadUrl,
  createMaterial: adminApi.createLibraryMaterial,
  createLibraryMaterial: adminApi.createLibraryMaterial,
  deleteMaterial: adminApi.deleteLibraryMaterial,
  deleteLibraryMaterial: adminApi.deleteLibraryMaterial,
}

// Direct Named Exports for Notifications Module
export const fetchNotifications = adminApi.getNotifications
export const markAllNotificationsRead = adminApi.markAllNotificationsRead
export const markNotificationRead = adminApi.markNotificationRead

export const notificationsApi = {
  getNotifications: adminApi.getNotifications,
  fetchNotifications: adminApi.getNotifications,
  markAllNotificationsRead: adminApi.markAllNotificationsRead,
  markNotificationRead: adminApi.markNotificationRead,
}

// Master API aggregation (spread first to avoid overwriting warning)
export const dsaApi = {
  ...adminApi,
  admin: adminApi,
  users: userManagementApi,
  attendance: attendanceApi,
  library: libraryApi,
  notifications: notificationsApi,
  fetchLibraryMaterials: adminApi.getLibraryMaterials,
  fetchNotifications: adminApi.getNotifications,
}