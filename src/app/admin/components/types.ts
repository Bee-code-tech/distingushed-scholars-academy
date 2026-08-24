// export interface QuizSubject {
//   subject: string
//   term: '1st' | '2nd' | '3rd'
//   classCategory: string
//   durationMinutes: number
// }

// export interface QuestionItem {
//   id?: string
//   _id?: string
//   questionText: string
//   options: string[]
//   correctAnswerIndex: number
//   explanation?: string
// }

// export interface QuizItem {
//   _id: string
//   title: string
//   description?: string
//   type: 'singular' | 'general'
//   isPaid: boolean
//   amount: number
//   accessCode?: string
//   isActive?: boolean
//   subjects: QuizSubject[]
//   questions?: QuestionItem[]
//   createdAt?: string
// }

// export interface QuizFormState {
//   title: string
//   description: string
//   type: 'singular' | 'general'
//   isPaid: boolean
//   amount: number
//   accessCode: string
//   subjects: QuizSubject[]
//   questions?: QuestionItem[]
// }

export interface QuizSubject {
  _id?: string
  subject: string
  term: '1st' | '2nd' | '3rd'
  classCategory: string
  durationMinutes: number
}

export interface QuestionItem {
  _id?: string
  id?: string
  questionText: string
  options: string[]
  correctAnswerIndex: number
  explanation?: string
}

export interface QuizItem {
  _id: string
  id?: string
  title: string
  description?: string
  type: 'singular' | 'general'
  isPaid: boolean
  amount: number
  accessCode?: string
  isActive?: boolean
  subjects: QuizSubject[]
  questions?: QuestionItem[]
  questionCount?: number
  totalQuestions?: number
  createdAt?: string
}

export interface QuizFormState {
  title: string
  description: string
  type: 'singular' | 'general'
  isPaid: boolean
  amount: number
  accessCode: string
  subjects: QuizSubject[]
  questions: QuestionItem[]
}