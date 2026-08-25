// // types.ts

// export interface QuestionItem {
//   _id?: string
//   id?: string
//   questionText: string
//   options: string[]
//   correctAnswer: number // Zero-based index (0, 1, 2, ...)
//   correctAnswerIndex?: number // Alias for compatibility with components using correctAnswerIndex
//   explanation?: string
//   marks?: number
// }

// export interface QuizSubject {
//   _id?: string
//   name: string
//   description?: string
//   timeLimit: number // In minutes
//   questions?: QuestionItem[]
// }

// export interface QuizItem {
//   _id: string
//   id?: string
//   title: string
//   description?: string
//   type: 'singular' | 'general'
//   courseId?: string | null
//   isPaid: boolean
//   amount: number
//   fileUrl?: string | null
//   accessCode?: string
//   accessLink?: string
//   isActive?: boolean
//   subjects: QuizSubject[]
//   questions?: QuestionItem[] // Root questions list or flattened helper
//   questionCount?: number // Aggregate count across subjects
//   totalMarks?: number
//   createdBy?: string
//   admin?: string
//   createdAt?: string
//   updatedAt?: string
// }

// export interface QuizFormState {
//   _id?: string
//   title: string
//   description: string
//   type: 'singular' | 'general'
//   courseId?: string
//   isPaid: boolean
//   amount: number
//   fileUrl: string
//   accessCode?: string
//   subjects: QuizSubject[]
//   questions?: QuestionItem[] // Optional form state questions helper
// }

export interface QuestionOption {
  _id?: string
  id?: string
  questionText: string
  options: string[]
  correctAnswer: number
  explanation?: string
  marks?: number
}

export interface QuizSubject {
  _id?: string
  name: string
  description?: string
  timeLimit: number
  questions?: any[]
}

export interface Quiz {
  _id: string
  id: string
  title: string
  description: string
  type: 'general' | 'singular'
  courseId: string | null
  fileUrl: string | null
  isPaid: boolean
  amount: number
  isActive: boolean
  subjects: QuizSubject[]
  totalMarks: number
  admin: string
  createdBy: string
  accessLink: string
  accessCode: string
  createdAt: string
  updatedAt: string
}

export type CreateQuizPayload = Omit<
  Quiz,
  | '_id'
  | 'id'
  | 'totalMarks'
  | 'admin'
  | 'createdBy'
  | 'accessLink'
  | 'accessCode'
  | 'createdAt'
  | 'updatedAt'
  | 'isActive'
>

export type UpdateQuizPayload = Partial<CreateQuizPayload>