import * as XLSX from 'xlsx'
import { Question } from '../constants/quiz'

export const parseExcelQuestions = (
  data: ArrayBuffer,
  currentCount: number,
): Question[] => {
  const workbook = XLSX.read(data, { type: 'array' })
  const sheet = workbook.Sheets[workbook.SheetNames[0]]
  const rows = XLSX.utils.sheet_to_json(sheet) as any[]

  return rows.map((row, i) => ({
    id: `bulk-${Date.now()}-${i}`,
    qNumber: currentCount + i + 1,
    subject: row.Subject || row.subject || 'General',
    topic: row.Topic || row.topic || 'General',
    body: row.Question || row.Body || row.body || '',
    options: {
      A: String(row.A || ''),
      B: String(row.B || ''),
      C: String(row.C || ''),
      D: String(row.D || ''),
      E: String(row.E || ''),
    },
    correctOption: String(row.Answer || 'A').toUpperCase(),
    explanation: row.Explanation || '',
    image: null,
    imageUrl: null,
    mark: Number(row.Mark) || 1,
  }))
}
