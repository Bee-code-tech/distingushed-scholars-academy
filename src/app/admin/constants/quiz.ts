export const JAMB_SUBJECTS = [
  'Use of English',
  'Mathematics',
  'Physics',
  'Chemistry',
  'Biology',
  'Economics',
  'Agricultural Science',
  'Government',
  'History',
  'Geography',
  'Literature in English',
  'Religious Studies (CRK/IRK)',
  'Commerce',
  'Principles of Accounts',
  'Home Economics',
  'Arabic',
  'French',
  'Yoruba',
  'Igbo',
  'Hausa',
  'Music',
  'Art',
] as const

export type Question = {
  id: string
  subject: (typeof JAMB_SUBJECTS)[number] | string // Allows for custom subjects if needed
  topic: string
  body: string
  options: {
    A: string
    B: string
    C: string
    D: string
    E: string
    [key: string]: string // Fallback for flexibility
  }
  correctOption: 'A' | 'B' | 'C' | 'D' | 'E' | string
  explanation: string
  image: string | null // Base64 or URL string
  mark: number
}

export type QuizConfig = {
  title: string
  description: string
  timeLimit: number // In minutes
  shuffleQuestions: boolean
  showLeaderboard: boolean
  accessCode: string
  category: string
}
