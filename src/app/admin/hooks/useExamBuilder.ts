// 'use client'

// import { useState, useEffect } from 'react'
// import * as XLSX from 'xlsx'
// import { Question, QuizConfig } from '../constants/quiz'

// export const useExamBuilder = () => {
//   const [step, setStep] = useState<1 | 2 | 3>(1)
//   const [questions, setQuestions] = useState<Question[]>([])
//   const [isDeploying, setIsDeploying] = useState(false)
//   const [config, setConfig] = useState<QuizConfig>({
//     title: '',
//     description: '',
//     timeLimit: 30,
//     shuffleQuestions: false,
//     showLeaderboard: true,
//     accessCode: '',
//     category: 'General',
//   })

//   // --- IMAGE PROCESSING ---
//   const handleImageUpload = (file: File): Promise<string> => {
//     return new Promise((resolve, reject) => {
//       const reader = new FileReader()
//       reader.onload = () => resolve(reader.result as string)
//       reader.onerror = reject
//       reader.readAsDataURL(file)
//     })
//   }

//   // --- BULK EXCEL IMPORT ---
//   const importFromExcel = (file: File) => {
//     const reader = new FileReader()
//     reader.onload = (e) => {
//       const data = new Uint8Array(e.target?.result as ArrayBuffer)
//       const workbook = XLSX.read(data, { type: 'array' })
//       const sheet = workbook.Sheets[workbook.SheetNames[0]]
//       const rows = XLSX.utils.sheet_to_json(sheet) as any[]

//       const parsedQuestions: Question[] = rows.map((row, i) => ({
//         id: crypto.randomUUID(),
//         subject: row.Subject || 'General',
//         topic: row.Topic || '',
//         body: row.Question || row.Body || '',
//         options: {
//           A: String(row.A || ''),
//           B: String(row.B || ''),
//           C: String(row.C || ''),
//           D: String(row.D || ''),
//           E: String(row.E || ''),
//         },
//         correctOption: String(row.Answer || 'A').toUpperCase(),
//         explanation: row.Explanation || '',
//         image: null,
//         mark: Number(row.Mark) || 1,
//       }))

//       setQuestions((prev) => [...prev, ...parsedQuestions])
//     }
//     reader.readAsArrayBuffer(file)
//   }

//   // --- API DEPLOYMENT LOGIC ---
//   const deployToBackend = async () => {
//     setIsDeploying(true)

//     // Transform flat questions into the "Nested Subjects" format
//     const subjectsMap = questions.reduce(
//       (acc, q) => {
//         if (!acc[q.subject]) {
//           acc[q.subject] = { name: q.subject, questions: [] }
//         }

//         acc[q.subject].questions.push({
//           text: q.body,
//           options: [
//             q.options.A,
//             q.options.B,
//             q.options.C,
//             q.options.D,
//             q.options.E,
//           ].filter((opt) => opt !== undefined && opt !== ''),
//           correctAnswer: q.options[q.correctOption as keyof typeof q.options],
//           explanation: q.explanation,
//           image: q.image, // Base64 string
//           points: q.mark,
//         })
//         return acc
//       },
//       {} as Record<string, any>,
//     )

//     const payload = {
//       title: config.title,
//       description: config.description,
//       timeLimit: config.timeLimit,
//       accessCode: config.accessCode,
//       subjects: Object.values(subjectsMap),
//       // Adding metadata for your specific dashboard
//       metadata: {
//         totalQuestions: questions.length,
//         shuffle: config.shuffleQuestions,
//         hasLeaderboard: config.showLeaderboard,
//       },
//     }

//     try {
//       const res = await fetch(
//         'https://api.distinguishedscholarsacademy.com/api/quizzes',
//         {
//           method: 'POST',
//           headers: {
//             'Content-Type': 'application/json',
//             Authorization: `Bearer ${localStorage.getItem('dsa_token')}`,
//           },
//           body: JSON.stringify(payload),
//         },
//       )

//       if (!res.ok) throw new Error('Deployment failed')
//       return await res.json()
//     } catch (err) {
//       console.error('Deploy Error:', err)
//       throw err
//     } finally {
//       setIsDeploying(false)
//     }
//   }

//   return {
//     step,
//     setStep,
//     questions,
//     setQuestions,
//     config,
//     setConfig,
//     isDeploying,
//     importFromExcel,
//     handleImageUpload,
//     deployToBackend,
//   }
// }

'use client'

import { useState, useEffect, useCallback } from 'react'
import * as XLSX from 'xlsx'
import { Question, QuizConfig } from '../constants/quiz'
import { toast } from 'react-hot-toast'

const API_BASE_URL = 'https://api.distinguishedscholarsacademy.com/api'

// Helper to ensure TypeScript understands the options keys
type OptionKey = 'A' | 'B' | 'C' | 'D' | 'E'

export const useExamBuilder = () => {
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [questions, setQuestions] = useState<Question[]>([])
  const [isDeploying, setIsDeploying] = useState(false)
  const [config, setConfig] = useState<QuizConfig>({
    title: '',
    description: '',
    timeLimit: 30,
    shuffleQuestions: false,
    showLeaderboard: true,
    accessCode: '',
    category: 'General',
  })

  // --- PERSISTENCE (Auto-save Draft) ---
  useEffect(() => {
    const savedDraft = localStorage.getItem('dsa_quiz_draft')
    if (savedDraft) {
      try {
        const { questions: savedQ, config: savedC } = JSON.parse(savedDraft)
        setQuestions(savedQ)
        setConfig(savedC)
      } catch (e) {
        console.error('Failed to load draft', e)
      }
    }
  }, [])

  useEffect(() => {
    try {
      localStorage.setItem(
        'dsa_quiz_draft',
        JSON.stringify({ questions, config }),
      )
    } catch (e) {
      console.warn('Storage quota exceeded or disabled')
    }
  }, [questions, config])

  // --- IMAGE PROCESSING ---
  const handleImageUpload = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      if (file.size > 2 * 1024 * 1024) {
        toast.error('Image too large (Max 2MB).')
        return reject('File too large')
      }
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }

  // --- BULK EXCEL IMPORT ---
  const importFromExcel = (file: File) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer)
        const workbook = XLSX.read(data, { type: 'array' })
        const sheet = workbook.Sheets[workbook.SheetNames[0]]
        const rows = XLSX.utils.sheet_to_json(sheet) as any[]

        const parsedQuestions: Question[] = rows.map((row) => ({
          id:
            typeof crypto !== 'undefined'
              ? crypto.randomUUID()
              : Math.random().toString(36),
          subject: row.Subject || 'General',
          topic: row.Topic || '',
          body: row.Question || row.Body || '',
          options: {
            A: String(row.A || ''),
            B: String(row.B || ''),
            C: String(row.C || ''),
            D: String(row.D || ''),
            E: String(row.E || ''),
          },
          correctOption: String(row.Answer || 'A')
            .toUpperCase()
            .trim(),
          explanation: row.Explanation || '',
          image: null,
          mark: Number(row.Mark) || 1,
        }))

        setQuestions((prev) => [...prev, ...parsedQuestions])
        toast.success(`Imported ${parsedQuestions.length} questions`)
      } catch (err) {
        toast.error('Format error: Check your Excel columns.')
      }
    }
    reader.readAsArrayBuffer(file)
  }

  // --- TEMPLATE GENERATOR ---
  const downloadTemplate = () => {
    const template = [
      {
        Subject: 'Mathematics',
        Topic: 'Algebra',
        Question: 'Solve for x: 2x = 10',
        A: '2',
        B: '5',
        C: '10',
        D: '20',
        E: '',
        Answer: 'B',
        Explanation: 'Divide by 2.',
        Mark: 1,
      },
    ]
    const ws = XLSX.utils.json_to_sheet(template)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Quiz Template')
    XLSX.writeFile(wb, 'DSA_Template.xlsx')
  }

  // --- VALIDATION ---
  const validateForm = useCallback(() => {
    if (!config.title.trim()) return 'Quiz title is required'
    if (questions.length === 0) return 'Add at least one question'

    for (let i = 0; i < questions.length; i++) {
      if (!questions[i].body.trim()) return `Question ${i + 1} has no text`
      const char = questions[i].correctOption as OptionKey
      if (!questions[i].options[char])
        return `Question ${i + 1} answer key "${char}" is empty`
    }
    return null
  }, [config, questions])

  // --- API DEPLOYMENT ---
  const deployToBackend = async () => {
    const error = validateForm()
    if (error) {
      toast.error(error)
      return
    }

    setIsDeploying(true)
    const loadingToast = toast.loading('Syncing with DSA Vault...')

    try {
      const subjectsMap = questions.reduce(
        (acc, q) => {
          if (!acc[q.subject]) {
            acc[q.subject] = { name: q.subject, questions: [] }
          }

          const opts = q.options as Record<string, string>
          const correctChar = q.correctOption.toUpperCase()

          acc[q.subject].questions.push({
            text: q.body,
            options: [opts.A, opts.B, opts.C, opts.D, opts.E].filter(
              (o) => o && o.trim() !== '',
            ),
            correctAnswer: opts[correctChar] || opts.A,
            explanation: q.explanation,
            image: q.image,
            points: q.mark,
          })
          return acc
        },
        {} as Record<string, any>,
      )

      const payload = {
        title: config.title,
        description: config.description,
        timeLimit: config.timeLimit,
        accessCode: config.accessCode,
        subjects: Object.values(subjectsMap),
        status: 'active',
        metadata: {
          totalQuestions: questions.length,
          shuffle: config.shuffleQuestions,
          hasLeaderboard: config.showLeaderboard,
          category: config.category,
        },
      }

      const res = await fetch(`${API_BASE_URL}/quizzes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('admin_token')}`,
        },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const errData = await res.json()
        throw new Error(errData.message || 'Server rejected deployment')
      }

      toast.success('Quiz deployed successfully!', { id: loadingToast })
      localStorage.removeItem('dsa_quiz_draft')
      setQuestions([])
      setStep(1)

      return await res.json()
    } catch (err: any) {
      toast.error(err.message || 'Deployment failed', { id: loadingToast })
      throw err
    } finally {
      setIsDeploying(false)
    }
  }

  return {
    step,
    setStep,
    questions,
    setQuestions,
    config,
    setConfig,
    isDeploying,
    importFromExcel,
    handleImageUpload,
    deployToBackend,
    downloadTemplate,
  }
}