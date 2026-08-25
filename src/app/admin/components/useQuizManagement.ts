// // useQuizManagement.ts
// 'use client'

// import { useState, useCallback } from 'react'
// import { QuizItem, QuizFormState, QuizSubject, QuestionItem } from './types'

// const initialFormState: QuizFormState = {
//   title: '',
//   description: '',
//   type: 'general',
//   isPaid: false,
//   amount: 0,
//   fileUrl: '',
//   accessCode: '',
//   subjects: [
//     {
//       name: 'General',
//       description: 'Default Subject',
//       timeLimit: 30,
//       questions: [],
//     },
//   ],
//   questions: [],
// }

// export function useQuizManagement(courseId?: string) {
//   const [quizzes, setQuizzes] = useState<QuizItem[]>([])
//   const [loading, setLoading] = useState<boolean>(false)
//   const [saving, setSaving] = useState<boolean>(false)
//   const [uploadingFile, setUploadingFile] = useState<boolean>(false)
//   const [error, setError] = useState<string | null>(null)

//   // Filters
//   const [searchQuery, setSearchQuery] = useState<string>('')
//   const [typeFilter, setTypeFilter] = useState<'all' | 'singular' | 'general'>('all')

//   // Modal State
//   const [isModalOpen, setIsModalOpen] = useState<boolean>(false)
//   const [activeTab, setActiveTab] = useState<'details' | 'questions'>('details')
//   const [selectedQuizId, setSelectedQuizId] = useState<string | null>(null)
//   const [formData, setFormData] = useState<QuizFormState>(initialFormState)

//   // Modal actions
//   const openCreateModal = useCallback(() => {
//     setSelectedQuizId(null)
//     setFormData(initialFormState)
//     setActiveTab('details')
//     setIsModalOpen(true)
//   }, [])

//   const openEditModal = useCallback(
//     (quiz: QuizItem, initialTab: 'details' | 'questions' = 'details') => {
//       setSelectedQuizId(quiz._id)
//       const allQuestions =
//         quiz.questions || quiz.subjects.flatMap((s) => s.questions || [])

//       setFormData({
//         _id: quiz._id,
//         title: quiz.title,
//         description: quiz.description || '',
//         type: quiz.type,
//         courseId: quiz.courseId || courseId || '',
//         isPaid: quiz.isPaid,
//         amount: quiz.amount,
//         fileUrl: quiz.fileUrl || '',
//         accessCode: quiz.accessCode || '',
//         subjects: quiz.subjects.length > 0 ? quiz.subjects : initialFormState.subjects,
//         questions: allQuestions,
//       })
//       setActiveTab(initialTab)
//       setIsModalOpen(true)
//     },
//     [courseId]
//   )

//   const closeModal = useCallback(() => {
//     setIsModalOpen(false)
//     setSelectedQuizId(null)
//     setFormData(initialFormState)
//   }, [])

//   // File Upload
//   const uploadQuizFile = async (file: File) => {
//     setUploadingFile(true)
//     try {
//       // Simulate file upload API call
//       const dummyUrl = URL.createObjectURL(file)
//       setFormData((prev) => ({ ...prev, fileUrl: dummyUrl }))
//     } catch (err: any) {
//       setError(err.message || 'File upload failed')
//     } finally {
//       setUploadingFile(false)
//     }
//   }

//   // Save Quiz (Create or Update)
//   const saveQuiz = async () => {
//     setSaving(true)
//     setError(null)
//     try {
//       if (selectedQuizId) {
//         // Update
//         setQuizzes((prev) =>
//           prev.map((q) =>
//             q._id === selectedQuizId
//               ? {
//                   ...q,
//                   title: formData.title,
//                   description: formData.description,
//                   type: formData.type,
//                   isPaid: formData.isPaid,
//                   amount: formData.amount,
//                   fileUrl: formData.fileUrl,
//                   accessCode: formData.accessCode,
//                   subjects: formData.subjects,
//                   questions: formData.questions,
//                 }
//               : q
//           )
//         )
//       } else {
//         // Create
//         const newQuiz: QuizItem = {
//           _id: `quiz-${Date.now()}`,
//           title: formData.title,
//           description: formData.description,
//           type: formData.type,
//           courseId: courseId || null,
//           isPaid: formData.isPaid,
//           amount: formData.amount,
//           fileUrl: formData.fileUrl,
//           accessCode: formData.accessCode,
//           isActive: true,
//           subjects: formData.subjects,
//           questions: formData.questions || [],
//           questionCount: formData.questions?.length || 0,
//         }
//         setQuizzes((prev) => [newQuiz, ...prev])
//       }
//       closeModal()
//     } catch (err: any) {
//       setError(err.message || 'Failed to save quiz')
//     } finally {
//       setSaving(false)
//     }
//   }

//   // Delete Quiz
//   const deleteQuiz = async (id: string) => {
//     try {
//       setQuizzes((prev) => prev.filter((q) => q._id !== id))
//     } catch (err: any) {
//       setError(err.message || 'Failed to delete quiz')
//     }
//   }

//   // Toggle Quiz Status
//   const toggleStatus = async (id: string, currentStatus: boolean) => {
//     try {
//       setQuizzes((prev) =>
//         prev.map((q) => (q._id === id ? { ...q, isActive: !currentStatus } : q))
//       )
//     } catch (err: any) {
//       setError(err.message || 'Failed to toggle status')
//     }
//   }

//   // Helper state setters with implicit object return wrapping ({...})
//   const updateSubject = (index: number, updatedSubject: Partial<QuizSubject>) => {
//     setFormData((prev) => ({
//       ...prev,
//       subjects: prev.subjects.map((sub, i) =>
//         i === index ? { ...sub, ...updatedSubject } : sub
//       ),
//     }))
//   }

//   const addQuestionToSubject = (subjectIndex: number, newQuestion: QuestionItem) => {
//     setFormData((prev) => ({
//       ...prev,
//       subjects: prev.subjects.map((sub, i) => {
//         if (i !== subjectIndex) return sub
//         const currentQuestions = sub.questions || []
//         return {
//           ...sub,
//           questions: [...currentQuestions, newQuestion],
//         }
//       }),
//     }))
//   }

//   // Filtered Quiz List
//   const filteredQuizzes = quizzes.filter((q) => {
//     const matchesSearch =
//       q.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
//       (q.description && q.description.toLowerCase().includes(searchQuery.toLowerCase()))
//     const matchesType = typeFilter === 'all' || q.type === typeFilter
//     return matchesSearch && matchesType
//   })

//   return {
//     quizzes: filteredQuizzes,
//     totalQuizzesCount: quizzes.length,
//     loading,
//     saving,
//     uploadingFile,
//     error,
//     setError,
//     searchQuery,
//     setSearchQuery,
//     typeFilter,
//     setTypeFilter,
//     isModalOpen,
//     activeTab,
//     setActiveTab,
//     selectedQuizId,
//     formData,
//     setFormData,
//     uploadQuizFile,
//     openCreateModal,
//     openEditModal,
//     closeModal,
//     saveQuiz,
//     deleteQuiz,
//     toggleStatus,
//     updateSubject,
//     addQuestionToSubject,
//   }
// }

// 'use client'

// import { useState, useCallback, useEffect } from 'react'
// import { QuizItem, QuizFormState, QuizSubject, QuestionItem } from './types'

// const initialFormState: QuizFormState = {
//   title: '',
//   description: '',
//   type: 'general',
//   isPaid: false,
//   amount: 0,
//   fileUrl: '',
//   accessCode: '',
//   subjects: [
//     {
//       name: 'General',
//       description: 'Default Subject',
//       timeLimit: 30,
//       questions: [],
//     },
//   ],
//   questions: [],
// }

// export function useQuizManagement(courseId?: string) {
//   const [quizzes, setQuizzes] = useState<QuizItem[]>([])
//   const [loading, setLoading] = useState<boolean>(true)
//   const [saving, setSaving] = useState<boolean>(false)
//   const [uploadingFile, setUploadingFile] = useState<boolean>(false)
//   const [error, setError] = useState<string | null>(null)

//   // Filters
//   const [searchQuery, setSearchQuery] = useState<string>('')
//   const [typeFilter, setTypeFilter] = useState<'all' | 'singular' | 'general'>(
//     'all',
//   )

//   // Modal State
//   const [isModalOpen, setIsModalOpen] = useState<boolean>(false)
//   const [activeTab, setActiveTab] = useState<'details' | 'questions'>('details')
//   const [selectedQuizId, setSelectedQuizId] = useState<string | null>(null)
//   const [formData, setFormData] = useState<QuizFormState>(initialFormState)

//   // Auth Helper: Get JWT token from client storage or cookies
//   const getAuthHeader = () => {
//     if (typeof window === 'undefined') return {}
//     const token =
//       localStorage.getItem('token') ||
//       document.cookie
//         .split('; ')
//         .find((row) => row.startsWith('token='))
//         ?.split('=')[1]

//     return token ? { Authorization: `Bearer ${token}` } : {}
//   }

//   // 1. Fetch Quizzes from API
//   const fetchQuizzes = useCallback(async () => {
//     setLoading(true)
//     setError(null)
//     try {
//       const queryParams = new URLSearchParams()
//       if (courseId) queryParams.append('courseId', courseId)

//       const res = await fetch(`/api/quizzes?${queryParams.toString()}`, {
//         headers: {
//           'Content-Type': 'application/json',
//           ...getAuthHeader(),
//         },
//       })

//       if (!res.ok) {
//         throw new Error(`Failed to fetch quizzes (${res.status})`)
//       }

//       const result = await res.json()

//       // Handle backend envelope: { success: true, count: 4, data: [...] }
//       const quizList: QuizItem[] = Array.isArray(result.data)
//         ? result.data
//         : Array.isArray(result)
//           ? result
//           : []

//       setQuizzes(quizList)
//     } catch (err: any) {
//       setError(err.message || 'Failed to load quizzes')
//     } finally {
//       setLoading(false)
//     }
//   }, [courseId])

//   useEffect(() => {
//     fetchQuizzes()
//   }, [fetchQuizzes])

//   // Modal actions
//   const openCreateModal = useCallback(() => {
//     setSelectedQuizId(null)
//     setFormData(initialFormState)
//     setActiveTab('details')
//     setIsModalOpen(true)
//   }, [])

//   const openEditModal = useCallback(
//     (quiz: QuizItem, initialTab: 'details' | 'questions' = 'details') => {
//       setSelectedQuizId(quiz._id)
//       const allQuestions =
//         quiz.questions?.length > 0
//           ? quiz.questions
//           : quiz.subjects?.flatMap((s) => s.questions || []) || []

//       setFormData({
//         _id: quiz._id,
//         title: quiz.title,
//         description: quiz.description || '',
//         type: quiz.type,
//         courseId: quiz.courseId || courseId || '',
//         isPaid: quiz.isPaid,
//         amount: quiz.amount,
//         fileUrl: quiz.fileUrl || '',
//         accessCode: quiz.accessCode || '',
//         subjects:
//           quiz.subjects?.length > 0 ? quiz.subjects : initialFormState.subjects,
//         questions: allQuestions,
//       })
//       setActiveTab(initialTab)
//       setIsModalOpen(true)
//     },
//     [courseId],
//   )

//   const closeModal = useCallback(() => {
//     setIsModalOpen(false)
//     setSelectedQuizId(null)
//     setFormData(initialFormState)
//   }, [])

//   // 2. File Upload API
//   const uploadQuizFile = async (file: File) => {
//     setUploadingFile(true)
//     setError(null)
//     try {
//       const data = new FormData()
//       data.append('file', file)

//       const res = await fetch('/api/upload', {
//         method: 'POST',
//         headers: { ...getAuthHeader() },
//         body: data,
//       })

//       if (!res.ok) throw new Error('Upload failed')

//       const result = await res.json()
//       setFormData((prev) => ({
//         ...prev,
//         fileUrl: result.url || result.fileUrl,
//       }))
//     } catch (err: any) {
//       setError(err.message || 'File upload failed')
//     } finally {
//       setUploadingFile(false)
//     }
//   }

//   // 3. Save Quiz (POST or PUT to backend API)
//   const saveQuiz = async () => {
//     setSaving(true)
//     setError(null)
//     try {
//       const isEdit = !!selectedQuizId
//       const endpoint = isEdit
//         ? `/api/quizzes/${selectedQuizId}`
//         : '/api/quizzes'
//       const method = isEdit ? 'PUT' : 'POST'

//       const payload = {
//         ...formData,
//         courseId: formData.courseId || courseId || null,
//       }

//       const res = await fetch(endpoint, {
//         method,
//         headers: {
//           'Content-Type': 'application/json',
//           ...getAuthHeader(),
//         },
//         body: JSON.stringify(payload),
//       })

//       if (!res.ok) throw new Error('Failed to save quiz')

//       const result = await res.json()
//       const savedQuiz: QuizItem = result.data || result

//       if (isEdit) {
//         setQuizzes((prev) =>
//           prev.map((q) => (q._id === selectedQuizId ? savedQuiz : q)),
//         )
//       } else {
//         setQuizzes((prev) => [savedQuiz, ...prev])
//       }

//       closeModal()
//     } catch (err: any) {
//       setError(err.message || 'Failed to save quiz')
//     } finally {
//       setSaving(false)
//     }
//   }

//   // 4. Delete Quiz
//   const deleteQuiz = async (id: string) => {
//     setError(null)
//     try {
//       const res = await fetch(`/api/quizzes/${id}`, {
//         method: 'DELETE',
//         headers: {
//           ...getAuthHeader(),
//         },
//       })

//       if (!res.ok) throw new Error('Failed to delete quiz')

//       setQuizzes((prev) => prev.filter((q) => q._id !== id))
//     } catch (err: any) {
//       setError(err.message || 'Failed to delete quiz')
//     }
//   }

//   // 5. Toggle Quiz Status (Active/Inactive)
//   const toggleStatus = async (id: string, currentStatus: boolean) => {
//     setError(null)
//     const newStatus = !currentStatus

//     // Optimistic Update
//     setQuizzes((prev) =>
//       prev.map((q) => (q._id === id ? { ...q, isActive: newStatus } : q)),
//     )

//     try {
//       const res = await fetch(`/api/quizzes/${id}`, {
//         method: 'PATCH',
//         headers: {
//           'Content-Type': 'application/json',
//           ...getAuthHeader(),
//         },
//         body: JSON.stringify({ isActive: newStatus }),
//       })

//       if (!res.ok) throw new Error('Failed to update status on server')
//     } catch (err: any) {
//       // Revert Optimistic Update on Failure
//       setQuizzes((prev) =>
//         prev.map((q) => (q._id === id ? { ...q, isActive: currentStatus } : q)),
//       )
//       setError(err.message || 'Failed to toggle status')
//     }
//   }

//   // Form Subject Helpers
//   const updateSubject = (
//     index: number,
//     updatedSubject: Partial<QuizSubject>,
//   ) => {
//     setFormData((prev) => ({
//       ...prev,
//       subjects: prev.subjects.map((sub, i) =>
//         i === index ? { ...sub, ...updatedSubject } : sub,
//       ),
//     }))
//   }

//   const addQuestionToSubject = (
//     subjectIndex: number,
//     newQuestion: QuestionItem,
//   ) => {
//     setFormData((prev) => ({
//       ...prev,
//       subjects: prev.subjects.map((sub, i) => {
//         if (i !== subjectIndex) return sub
//         const currentQuestions = sub.questions || []
//         return {
//           ...sub,
//           questions: [...currentQuestions, newQuestion],
//         }
//       }),
//     }))
//   }

//   // Filtered Quiz List computation
//   const filteredQuizzes = quizzes.filter((q) => {
//     const matchesSearch =
//       q.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
//       (q.description &&
//         q.description.toLowerCase().includes(searchQuery.toLowerCase()))
//     const matchesType = typeFilter === 'all' || q.type === typeFilter
//     return matchesSearch && matchesType
//   })

//   return {
//     quizzes: filteredQuizzes,
//     totalQuizzesCount: quizzes.length,
//     loading,
//     saving,
//     uploadingFile,
//     error,
//     setError,
//     searchQuery,
//     setSearchQuery,
//     typeFilter,
//     setTypeFilter,
//     isModalOpen,
//     activeTab,
//     setActiveTab,
//     selectedQuizId,
//     formData,
//     setFormData,
//     uploadQuizFile,
//     openCreateModal,
//     openEditModal,
//     closeModal,
//     saveQuiz,
//     deleteQuiz,
//     toggleStatus,
//     updateSubject,
//     addQuestionToSubject,
//     refetchQuizzes: fetchQuizzes,
//   }
// }

import { useState, useCallback, useEffect } from 'react'
import { adminApi } from '@/lib/admin-api'
import { Quiz, CreateQuizPayload, UpdateQuizPayload } from './types'

export const useQuizManagement = (courseId?: string) => {
  const [quizzes, setQuizzes] = useState<Quiz[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  const fetchQuizzes = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await adminApi.getAllQuizzes<{
        success: boolean
        data: Quiz[]
      }>(courseId)
      if (res?.data) {
        setQuizzes(res.data)
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch quizzes')
    } finally {
      setLoading(false)
    }
  }, [courseId])

  const createQuiz = async (payload: CreateQuizPayload) => {
    setLoading(true)
    try {
      await adminApi.createQuiz(payload)
      await fetchQuizzes()
    } catch (err: any) {
      throw new Error(err.message || 'Failed to create quiz')
    } finally {
      setLoading(false)
    }
  }

  const updateQuiz = async (quizId: string, payload: UpdateQuizPayload) => {
    setLoading(true)
    try {
      await adminApi.updateQuiz(quizId, payload)
      await fetchQuizzes()
    } catch (err: any) {
      throw new Error(err.message || 'Failed to update quiz')
    } finally {
      setLoading(false)
    }
  }

  const deleteQuiz = async (quizId: string) => {
    setLoading(true)
    try {
      await adminApi.deleteQuiz(quizId)
      await fetchQuizzes()
    } catch (err: any) {
      throw new Error(err.message || 'Failed to delete quiz')
    } finally {
      setLoading(false)
    }
  }

  const toggleStatus = async (quizId: string, currentStatus: boolean) => {
    try {
      await adminApi.toggleQuizStatus(quizId, { isActive: !currentStatus })
      await fetchQuizzes()
    } catch (err: any) {
      setError(err.message || 'Failed to update status')
    }
  }

  useEffect(() => {
    fetchQuizzes()
  }, [fetchQuizzes])

  return {
    quizzes,
    loading,
    error,
    fetchQuizzes,
    createQuiz,
    updateQuiz,
    deleteQuiz,
    toggleStatus,
  }
}