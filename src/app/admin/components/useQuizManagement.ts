// import { useState, useEffect, useCallback, useMemo } from 'react'
// import { QuizItem, QuizFormState } from './types'
// import { adminApi } from '../../../lib/admin-api'

// const INITIAL_FORM_STATE: QuizFormState = {
//   title: '',
//   description: '',
//   type: 'singular',
//   isPaid: false,
//   amount: 0,
//   accessCode: '',
//   subjects: [],
//   questions: [],
// }

// // Helper to safely extract the quiz record if wrapped in an API response envelope
// // e.g., { success: true, data: { ... } } or { quiz: { ... } }
// const unwrapQuiz = (response: any): QuizItem => {
//   if (response && typeof response === 'object') {
//     if (
//       response.data &&
//       typeof response.data === 'object' &&
//       !Array.isArray(response.data)
//     ) {
//       return response.data
//     }
//     if (response.quiz && typeof response.quiz === 'object') {
//       return response.quiz
//     }
//   }
//   return response
// }

// export function useQuizManagement(courseId?: string) {
//   const [quizzes, setQuizzes] = useState<QuizItem[]>([])
//   const [loading, setLoading] = useState<boolean>(false)
//   const [saving, setSaving] = useState<boolean>(false)
//   const [error, setError] = useState<string | null>(null)

//   const [searchQuery, setSearchQuery] = useState('')
//   const [typeFilter, setTypeFilter] = useState<'all' | 'singular' | 'general'>(
//     'all',
//   )

//   // Builder Modal State
//   const [isModalOpen, setIsModalOpen] = useState(false)
//   const [activeTab, setActiveTab] = useState<'details' | 'questions'>('details')
//   const [selectedQuizId, setSelectedQuizId] = useState<string | null>(null)

//   const [formData, setFormData] = useState<QuizFormState>(INITIAL_FORM_STATE)

//   // 1. Fetch Quizzes from API
//   const fetchQuizzes = useCallback(async () => {
//     setLoading(true)
//     setError(null)
//     try {
//       const response = await adminApi.getAllQuizzes<any>(courseId)

//       // Handle array or nested array responses safely
//       let quizList: QuizItem[] = []
//       if (Array.isArray(response)) {
//         quizList = response
//       } else if (response && Array.isArray(response.data)) {
//         quizList = response.data
//       } else if (response && Array.isArray(response.quizzes)) {
//         quizList = response.quizzes
//       }

//       setQuizzes(quizList)
//     } catch (err: unknown) {
//       const message =
//         err instanceof Error ? err.message : 'Failed to fetch quizzes'
//       setError(message)
//     } finally {
//       setLoading(false)
//     }
//   }, [courseId])

//   useEffect(() => {
//     fetchQuizzes()
//   }, [fetchQuizzes])

//   // 2. Filter Quizzes (Defensive against undefined titles or bad data structures)
//   const filteredQuizzes = useMemo(() => {
//     return quizzes.filter((quiz) => {
//       if (!quiz) return false
//       const title = quiz.title || ''
//       const matchesSearch = title
//         .toLowerCase()
//         .includes(searchQuery.toLowerCase())
//       const matchesType = typeFilter === 'all' || quiz.type === typeFilter
//       return matchesSearch && matchesType
//     })
//   }, [quizzes, searchQuery, typeFilter])

//   // 3. Open Modal for Creation
//   const openCreateModal = () => {
//     setSelectedQuizId(null)
//     setFormData(INITIAL_FORM_STATE)
//     setActiveTab('details')
//     setIsModalOpen(true)
//   }

//   // 4. Open Modal for Editing existing Quiz & Questions
//   const openEditModal = async (
//     quiz: QuizItem,
//     tab: 'details' | 'questions' = 'details',
//   ) => {
//     const quizId = quiz._id || quiz.id || ''
//     setSelectedQuizId(quizId)
//     setActiveTab(tab)
//     setIsModalOpen(true)

//     // Pre-fill local state immediately from list item
//     setFormData({
//       title: quiz.title || '',
//       description: quiz.description || '',
//       type: quiz.type || 'singular',
//       isPaid: !!quiz.isPaid,
//       amount: quiz.amount || 0,
//       accessCode: quiz.accessCode || '',
//       subjects: quiz.subjects || [],
//       questions: quiz.questions || [],
//     })

//     // Fetch complete record by ID to guarantee full question details
//     if (quizId) {
//       try {
//         const response = await adminApi.getQuizById<any>(quizId)
//         const freshQuiz = unwrapQuiz(response)

//         if (freshQuiz && (freshQuiz._id || freshQuiz.id)) {
//           setFormData({
//             title: freshQuiz.title || '',
//             description: freshQuiz.description || '',
//             type: freshQuiz.type || 'singular',
//             isPaid: !!freshQuiz.isPaid,
//             amount: freshQuiz.amount || 0,
//             accessCode: freshQuiz.accessCode || '',
//             subjects: freshQuiz.subjects || [],
//             questions: freshQuiz.questions || [],
//           })
//         }
//       } catch (err) {
//         console.error('Error fetching quiz details:', err)
//       }
//     }
//   }

//   const closeModal = () => {
//     setIsModalOpen(false)
//     setSelectedQuizId(null)
//   }

//   // 5. Save Quiz (Handles Initial Creation & Updates safely)
//   const saveQuiz = async (shouldClose = false) => {
//     setSaving(true)
//     setError(null)
//     try {
//       if (selectedQuizId) {
//         // PUT /api/quizzes/:quizId
//         const res = await adminApi.updateQuiz<any>(selectedQuizId, formData)
//         const updated = unwrapQuiz(res)

//         setQuizzes((prev) =>
//           prev.map((q) => {
//             const currentId = q._id || q.id
//             return currentId === selectedQuizId ? { ...q, ...updated } : q
//           }),
//         )
//       } else {
//         // POST /api/quizzes
//         const res = await adminApi.createQuiz<any>(formData)
//         const created = unwrapQuiz(res)
//         const createdId = created?._id || created?.id

//         if (createdId) {
//           setSelectedQuizId(createdId)
//           setQuizzes((prev) => [created, ...prev])
//           setActiveTab('questions')
//         } else {
//           // Fallback re-fetch if server returns an unparseable structure
//           await fetchQuizzes()
//         }
//       }

//       if (shouldClose) {
//         closeModal()
//       }
//     } catch (err: unknown) {
//       const message = err instanceof Error ? err.message : 'Failed to save quiz'
//       setError(message)
//     } finally {
//       setSaving(false)
//     }
//   }

//   // 6. Delete Quiz
//   const deleteQuiz = async (quizId: string) => {
//     if (!window.confirm('Are you sure you want to delete this quiz?')) return
//     try {
//       await adminApi.deleteQuiz(quizId)
//       setQuizzes((prev) => prev.filter((q) => (q._id || q.id) !== quizId))
//     } catch (err: unknown) {
//       const message =
//         err instanceof Error ? err.message : 'Failed to delete quiz'
//       alert(message)
//     }
//   }

//   // 7. Toggle Quiz Active Status
//   const toggleStatus = async (quizId: string, currentStatus: boolean) => {
//     try {
//       await adminApi.toggleQuizStatus(quizId, { isActive: !currentStatus })
//       setQuizzes((prev) =>
//         prev.map((q) => {
//           const id = q._id || q.id
//           return id === quizId ? { ...q, isActive: !currentStatus } : q
//         }),
//       )
//     } catch (err: unknown) {
//       const message =
//         err instanceof Error ? err.message : 'Failed to update status'
//       alert(message)
//     }
//   }

//   return {
//     quizzes: filteredQuizzes,
//     loading,
//     saving,
//     error,
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
//     openCreateModal,
//     openEditModal,
//     closeModal,
//     saveQuiz,
//     deleteQuiz,
//     toggleStatus,
//     refreshQuizzes: fetchQuizzes,
//   }
// }

import { useState, useEffect, useCallback, useMemo } from 'react'
import { QuizItem, QuizFormState, QuestionItem } from './types'
import { adminApi } from '../../../lib/admin-api'

const INITIAL_FORM_STATE: QuizFormState = {
  title: '',
  description: '',
  type: 'singular',
  isPaid: false,
  amount: 0,
  accessCode: '',
  subjects: [],
  questions: [],
}

const unwrapQuiz = (response: any): QuizItem => {
  if (response && typeof response === 'object') {
    if (
      response.data &&
      typeof response.data === 'object' &&
      !Array.isArray(response.data)
    ) {
      return response.data
    }
    if (response.quiz && typeof response.quiz === 'object') {
      return response.quiz
    }
  }
  return response
}

export function useQuizManagement(courseId?: string) {
  const [quizzes, setQuizzes] = useState<QuizItem[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [saving, setSaving] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  const [searchQuery, setSearchQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState<'all' | 'singular' | 'general'>(
    'all',
  )

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<'details' | 'questions'>('details')
  const [selectedQuizId, setSelectedQuizId] = useState<string | null>(null)

  const [formData, setFormData] = useState<QuizFormState>(INITIAL_FORM_STATE)

  // 1. Fetch Quizzes
  const fetchQuizzes = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await adminApi.getAllQuizzes<any>(courseId)
      let quizList: QuizItem[] = []
      if (Array.isArray(response)) {
        quizList = response
      } else if (response && Array.isArray(response.data)) {
        quizList = response.data
      } else if (response && Array.isArray(response.quizzes)) {
        quizList = response.quizzes
      }
      setQuizzes(quizList)
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to fetch quizzes'
      setError(message)
    } finally {
      setLoading(false)
    }
  }, [courseId])

  useEffect(() => {
    fetchQuizzes()
  }, [fetchQuizzes])

  // 2. Filter Quizzes safely
  const filteredQuizzes = useMemo(() => {
    return quizzes.filter((quiz) => {
      if (!quiz) return false
      const title = quiz.title || ''
      const matchesSearch = title
        .toLowerCase()
        .includes(searchQuery.toLowerCase())
      const matchesType = typeFilter === 'all' || quiz.type === typeFilter
      return matchesSearch && matchesType
    })
  }, [quizzes, searchQuery, typeFilter])

  // 3. Open Modal for Creation
  const openCreateModal = () => {
    setSelectedQuizId(null)
    setFormData(INITIAL_FORM_STATE)
    setActiveTab('details')
    setIsModalOpen(true)
  }

  // 4. Open Modal for Editing (Fetches complete details including questions via GET /api/quizzes/{id})
  const openEditModal = async (
    quiz: QuizItem,
    tab: 'details' | 'questions' = 'details',
  ) => {
    const quizId = quiz._id || quiz.id || ''
    setSelectedQuizId(quizId)
    setActiveTab(tab)
    setIsModalOpen(true)

    setFormData({
      title: quiz.title || '',
      description: quiz.description || '',
      type: quiz.type || 'singular',
      isPaid: !!quiz.isPaid,
      amount: quiz.amount || 0,
      accessCode: quiz.accessCode || '',
      subjects: quiz.subjects || [],
      questions: quiz.questions || [],
    })

    if (quizId) {
      try {
        const response = await adminApi.getQuizById<any>(quizId)
        const freshQuiz = unwrapQuiz(response)

        if (freshQuiz && (freshQuiz._id || freshQuiz.id)) {
          setFormData({
            title: freshQuiz.title || '',
            description: freshQuiz.description || '',
            type: freshQuiz.type || 'singular',
            isPaid: !!freshQuiz.isPaid,
            amount: freshQuiz.amount || 0,
            accessCode: freshQuiz.accessCode || '',
            subjects: freshQuiz.subjects || [],
            questions: freshQuiz.questions || [],
          })
        }
      } catch (err) {
        console.error('Error fetching quiz details:', err)
      }
    }
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setSelectedQuizId(null)
  }

  // 5. Save Quiz (Format questions payload cleanly)
  const saveQuiz = async (shouldClose = false) => {
    setSaving(true)
    setError(null)

    // Format questions array to comply with API documentation
    const formattedQuestions = (formData.questions || []).map((q) => {
      const payload: QuestionItem = {
        questionText: q.questionText,
        options: q.options,
        correctAnswerIndex: q.correctAnswerIndex,
        explanation: q.explanation || '',
      }
      if (q._id) payload._id = q._id
      return payload
    })

    const payload = {
      ...formData,
      questions: formattedQuestions,
    }

    try {
      if (selectedQuizId) {
        // PUT /api/quizzes/{id}
        const res = await adminApi.updateQuiz<any>(selectedQuizId, payload)
        const updated = unwrapQuiz(res)

        const finalQuestions = updated.questions || payload.questions

        setQuizzes((prev) =>
          prev.map((q) => {
            const currentId = q._id || q.id
            if (currentId === selectedQuizId) {
              return {
                ...q,
                ...updated,
                questions: finalQuestions,
                questionCount: finalQuestions.length,
              }
            }
            return q
          }),
        )
      } else {
        // POST /api/quizzes
        const res = await adminApi.createQuiz<any>(payload)
        const created = unwrapQuiz(res)
        const createdId = created?._id || created?.id

        if (createdId) {
          setSelectedQuizId(createdId)
          const finalQuestions = created.questions || payload.questions
          const newQuiz = {
            ...created,
            questions: finalQuestions,
            questionCount: finalQuestions.length,
          }
          setQuizzes((prev) => [newQuiz, ...prev])
          setActiveTab('questions')
        } else {
          await fetchQuizzes()
        }
      }

      if (shouldClose) {
        closeModal()
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to save quiz'
      setError(message)
    } finally {
      setSaving(false)
    }
  }

  // 6. Delete Quiz
  const deleteQuiz = async (quizId: string) => {
    if (!window.confirm('Are you sure you want to delete this quiz?')) return
    try {
      await adminApi.deleteQuiz(quizId)
      setQuizzes((prev) => prev.filter((q) => (q._id || q.id) !== quizId))
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to delete quiz'
      alert(message)
    }
  }

  // 7. Toggle Quiz Active Status
  const toggleStatus = async (quizId: string, currentStatus: boolean) => {
    try {
      await adminApi.toggleQuizStatus(quizId, { isActive: !currentStatus })
      setQuizzes((prev) =>
        prev.map((q) => {
          const id = q._id || q.id
          return id === quizId ? { ...q, isActive: !currentStatus } : q
        }),
      )
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to update status'
      alert(message)
    }
  }

  return {
    quizzes: filteredQuizzes,
    loading,
    saving,
    error,
    searchQuery,
    setSearchQuery,
    typeFilter,
    setTypeFilter,
    isModalOpen,
    activeTab,
    setActiveTab,
    selectedQuizId,
    formData,
    setFormData,
    openCreateModal,
    openEditModal,
    closeModal,
    saveQuiz,
    deleteQuiz,
    toggleStatus,
    refreshQuizzes: fetchQuizzes,
  }
}