'use client'

// Question bank — tutors add questions (bulk via an Excel sheet, or one by one
// with an optional image). Admins pull these into quizzes. See docs/quiz-feature.md.

import { useCallback, useEffect, useRef, useState } from 'react'
import {
  Plus,
  Trash2,
  Loader2,
  Image as ImageIcon,
  FileSpreadsheet,
  Download,
  Check,
  X,
  Pencil,
} from 'lucide-react'
import * as XLSX from 'xlsx'
import { Card } from '@/components/ui/card'
import { dsaApi } from '@/lib/api'
import { getToken } from '@/lib/auth'
import { uploadToCloudinary } from '@/lib/cloudinary'
import { JAMB_SUBJECTS } from '@/app/admin/constants/quiz'
import RichText from '@/components/ui/RichText'
import RichTextField from '@/components/ui/RichTextField'

// A ready-to-fill Excel template so tutors get the columns right.
function downloadTemplate() {
  const header = [
    'Subject',
    'Topic',
    'Passage',
    'Question',
    'A',
    'B',
    'C',
    'D',
    'E',
    'Answer',
    'Explanation',
    'Mark',
  ]
  const examples = [
    [
      'Physics',
      'Motion',
      '',
      'What is the SI unit of force?',
      'Newton',
      'Joule',
      'Watt',
      'Pascal',
      '',
      'A',
      'Force = mass × acceleration.',
      1,
    ],
    [
      'Use of English',
      'Comprehension',
      'The sun rose over the hills as the farmers set out for the fields at dawn.',
      'When did the farmers set out?',
      'Dawn',
      'Noon',
      'Dusk',
      'Midnight',
      '',
      'A',
      'The passage says "at dawn".',
      1,
    ],
  ]
  const ws = XLSX.utils.aoa_to_sheet([header, ...examples])
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Questions')
  XLSX.writeFile(wb, 'DSA-Question-Bank-Template.xlsx')
}

const LETTERS = ['A', 'B', 'C', 'D', 'E'] as const
type Letter = (typeof LETTERS)[number]

interface BankQuestion {
  id: string
  subject: string
  topic?: string
  body: string
  options: string[]
  correctOption: string
  imageUrl?: string
  mark: number
}

const str = (v: unknown) => (v == null ? '' : String(v))

function normalize(raw: Record<string, unknown>): BankQuestion {
  const labeled = (raw.optionsLabeled ?? {}) as Record<string, string>
  const options = Array.isArray(raw.options)
    ? (raw.options as string[])
    : LETTERS.map((l) => labeled[l]).filter(Boolean)
  return {
    id: str(raw.id ?? raw._id),
    subject: str(raw.subject),
    topic: raw.topic ? str(raw.topic) : undefined,
    body: str(raw.body ?? raw.questionText),
    options,
    correctOption: str(raw.correctOption || LETTERS[Number(raw.correctAnswer) || 0]),
    imageUrl: raw.imageUrl ? str(raw.imageUrl) : undefined,
    mark: typeof raw.mark === 'number' ? raw.mark : Number(raw.marks) || 1,
  }
}

const emptyForm = {
  subject: JAMB_SUBJECTS[0] as string,
  topic: '',
  passage: '',
  body: '',
  options: { A: '', B: '', C: '', D: '', E: '' } as Record<Letter, string>,
  Answer: 'A' as Letter,
  explanation: '',
  mark: 1,
  imageUrl: '',
}

// English comprehension etc.: the backend has no separate passage field, so we
// prepend the passage to the question text (shown above the question). Repeat the
// same passage on each question that belongs to it.
function withPassage(passage: string, body: string): string {
  const p = passage.trim()
  return p ? `PASSAGE:\n${p}\n\n${body}` : body
}

export default function QuestionBank({ token }: { token?: string }) {
  const authToken = token ?? getToken() ?? undefined
  const [subject, setSubject] = useState<string>(JAMB_SUBJECTS[0])
  const [questions, setQuestions] = useState<BankQuestion[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [uploadingImg, setUploadingImg] = useState(false)
  const [form, setForm] = useState(emptyForm)
  // Editing an existing question — the backend has no update route, so on save
  // we create the edited copy and delete the original.
  const [editingId, setEditingId] = useState<string | null>(null)
  const excelInput = useRef<HTMLInputElement | null>(null)
  const imgInput = useRef<HTMLInputElement | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const rows = (await dsaApi.questions.list(
        { subject },
        authToken,
      )) as Record<string, unknown>[]
      setQuestions(rows.map(normalize))
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not load questions.')
    } finally {
      setLoading(false)
    }
  }, [subject, authToken])

  useEffect(() => {
    load()
  }, [load])

  const flash = (msg: string) => {
    setNotice(msg)
    setTimeout(() => setNotice(null), 2500)
  }

  const addOne = async () => {
    setError(null)
    if (form.body.trim().length < 3) return setError('Enter the question text.')
    if (!form.options[form.Answer]?.trim())
      return setError('The correct option is empty.')
    setBusy(true)
    const payload = {
      subject: form.subject,
      topic: form.topic || undefined,
      body: withPassage(form.passage, form.body.trim()),
      A: form.options.A,
      B: form.options.B,
      C: form.options.C,
      D: form.options.D,
      E: form.options.E || undefined,
      Answer: form.Answer,
      explanation: form.explanation || undefined,
      mark: Number(form.mark) || 1,
      imageUrl: form.imageUrl || undefined,
    }
    try {
      if (editingId) {
        // A real edit — update the question in place (PUT /questions/:id).
        await dsaApi.questions.update(editingId, payload, authToken)
        setEditingId(null)
        setForm(emptyForm)
        flash('Question updated')
      } else {
        await dsaApi.questions.create(payload, authToken)
        // Keep subject + passage so the next question in a set is quick.
        setForm({ ...emptyForm, subject: form.subject, passage: form.passage })
        flash('Question added')
      }
      if (form.subject === subject) load()
      else setSubject(form.subject)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not save the question.')
    } finally {
      setBusy(false)
    }
  }

  // Load a bank question into the form for editing (splits off any folded passage).
  const startEdit = (q: BankQuestion) => {
    const m = q.body.match(/^PASSAGE:\n([\s\S]*?)\n\n([\s\S]*)$/)
    const passage = m ? m[1] : ''
    const body = m ? m[2] : q.body
    const [A = '', B = '', C = '', D = '', E = ''] = q.options
    setForm({
      subject: q.subject || JAMB_SUBJECTS[0],
      topic: q.topic || '',
      passage,
      body,
      options: { A, B, C, D, E },
      Answer: (q.correctOption as Letter) || 'A',
      explanation: '',
      mark: q.mark || 1,
      imageUrl: q.imageUrl || '',
    })
    setEditingId(q.id)
    setError(null)
    if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const onImage = async (file: File | null) => {
    if (!file) return
    setError(null)
    setUploadingImg(true)
    try {
      const res = await uploadToCloudinary(file, 'dsa/quiz')
      setForm((f) => ({ ...f, imageUrl: res.url }))
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Image upload failed.')
    } finally {
      setUploadingImg(false)
    }
  }

  const onExcel = async (file: File | null) => {
    if (!file) return
    setError(null)
    setBusy(true)
    try {
      const buf = await file.arrayBuffer()
      const wb = XLSX.read(buf, { type: 'array' })
      const rows = XLSX.utils.sheet_to_json(
        wb.Sheets[wb.SheetNames[0]],
      ) as Record<string, unknown>[]
      const cell = (v: unknown) => (v == null ? '' : String(v))
      const payload = rows
        .filter((r) => cell(r.Question ?? r.Body ?? r.body).trim().length > 0)
        .map((r) => ({
          subject: cell(r.Subject ?? r.subject) || 'General',
          topic: cell(r.Topic ?? r.topic) || undefined,
          body: withPassage(
            cell(r.Passage ?? r.passage),
            cell(r.Question ?? r.Body ?? r.body).trim(),
          ),
          A: cell(r.A),
          B: cell(r.B),
          C: cell(r.C),
          D: cell(r.D),
          E: cell(r.E) || undefined,
          Answer: (cell(r.Answer) || 'A').toUpperCase(),
          explanation: cell(r.Explanation ?? r.explanation) || undefined,
          mark: Number(r.Mark) || 1,
        }))
      if (!payload.length) {
        setError(
          'No questions found. Use columns: Subject, Topic, Passage, Question, A, B, C, D, E, Answer, Explanation, Mark.',
        )
        return
      }
      await dsaApi.questions.createMany(payload, authToken)
      flash(`Imported ${payload.length} question${payload.length === 1 ? '' : 's'}`)
      load()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not import the sheet.')
    } finally {
      setBusy(false)
      if (excelInput.current) excelInput.current.value = ''
    }
  }

  const remove = async (id: string) => {
    const prev = questions
    setQuestions((qs) => qs.filter((q) => q.id !== id))
    try {
      await dsaApi.questions.remove(id, authToken)
    } catch (e) {
      setQuestions(prev)
      setError(e instanceof Error ? e.message : 'Could not delete.')
    }
  }

  return (
    <div className='max-w-4xl mx-auto space-y-5'>
      <div className='flex items-center justify-between flex-wrap gap-2'>
        <div>
          <h2 className='text-2xl font-black text-[#002EFF] italic uppercase'>
            Question Bank
          </h2>
          <p className='text-[10px] font-bold text-gray-400 uppercase tracking-widest'>
            Add questions for your subjects — the admin builds quizzes from these
          </p>
        </div>
        <div className='flex items-center gap-2'>
          <button
            onClick={downloadTemplate}
            className='flex items-center gap-2 h-10 px-4 rounded-xl bg-slate-50 text-slate-600 font-black text-[11px] uppercase tracking-wide hover:bg-slate-100'
          >
            <Download size={15} /> Template
          </button>
          <button
            onClick={() => excelInput.current?.click()}
            disabled={busy}
            className='flex items-center gap-2 h-10 px-4 rounded-xl bg-emerald-50 text-emerald-700 font-black text-[11px] uppercase tracking-wide hover:bg-emerald-100 disabled:opacity-50'
          >
            <FileSpreadsheet size={15} /> Import Excel
          </button>
        </div>
        <input
          ref={excelInput}
          type='file'
          accept='.xlsx,.xls,.csv'
          hidden
          onChange={(e) => onExcel(e.target.files?.[0] ?? null)}
        />
      </div>

      {notice && (
        <div className='flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-2.5'>
          <Check size={15} className='text-emerald-600' />
          <p className='text-[11px] font-bold text-emerald-700'>{notice}</p>
        </div>
      )}
      {error && (
        <p className='text-[11px] font-bold text-rose-600 px-1'>{error}</p>
      )}

      {/* Add one by one */}
      <Card className='p-5 rounded-3xl border-none shadow-sm bg-white space-y-3'>
        <p className='text-[11px] font-black uppercase text-slate-500 flex items-center gap-1.5'>
          <Plus size={14} /> Add a question
        </p>
        <div className='grid grid-cols-1 sm:grid-cols-3 gap-2'>
          <select
            value={form.subject}
            onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))}
            className='h-10 px-3 rounded-lg bg-slate-50 outline-none text-sm font-bold sm:col-span-2'
          >
            {JAMB_SUBJECTS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <input
            value={form.topic}
            onChange={(e) => setForm((f) => ({ ...f, topic: e.target.value }))}
            placeholder='Topic (optional)'
            className='h-10 px-3 rounded-lg bg-slate-50 outline-none text-sm font-medium'
          />
        </div>
        <RichTextField
          value={form.passage}
          onChange={(v) => setForm((f) => ({ ...f, passage: v }))}
          placeholder='Passage (optional) — for comprehension. It shows above the question; reuse the same passage for each question about it.'
          rows={2}
        />
        <RichTextField
          value={form.body}
          onChange={(v) => setForm((f) => ({ ...f, body: v }))}
          placeholder='Question… (format with the toolbar — bold, x², H₂O, √, symbols)'
          rows={2}
        />

        {/* Options */}
        <div className='grid grid-cols-1 sm:grid-cols-2 gap-2'>
          {LETTERS.map((l) => (
            <label
              key={l}
              className={`flex items-center gap-2 px-2 rounded-lg border ${
                form.Answer === l
                  ? 'border-emerald-300 bg-emerald-50/50'
                  : 'border-slate-100 bg-slate-50'
              }`}
            >
              <input
                type='radio'
                name='answer'
                checked={form.Answer === l}
                onChange={() => setForm((f) => ({ ...f, Answer: l }))}
                title='Mark correct'
                className='accent-emerald-600'
              />
              <span className='text-[11px] font-black text-slate-500 w-4'>{l}</span>
              <input
                value={form.options[l]}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    options: { ...f.options, [l]: e.target.value },
                  }))
                }
                placeholder={l === 'E' ? 'Option E (optional)' : `Option ${l}`}
                className='flex-1 h-9 bg-transparent outline-none text-sm'
              />
            </label>
          ))}
        </div>

        <div className='flex flex-wrap items-center gap-2'>
          <input
            value={form.explanation}
            onChange={(e) =>
              setForm((f) => ({ ...f, explanation: e.target.value }))
            }
            placeholder='Explanation (optional)'
            className='flex-1 min-w-[160px] h-10 px-3 rounded-lg bg-slate-50 outline-none text-sm'
          />
          <input
            type='number'
            min={1}
            value={form.mark}
            onChange={(e) =>
              setForm((f) => ({ ...f, mark: Number(e.target.value) }))
            }
            title='Mark'
            className='w-20 h-10 px-3 rounded-lg bg-slate-50 outline-none text-sm font-bold'
          />
          <button
            onClick={() => imgInput.current?.click()}
            disabled={uploadingImg}
            className='flex items-center gap-1.5 h-10 px-3 rounded-lg bg-slate-50 text-slate-600 text-[11px] font-bold hover:bg-slate-100 disabled:opacity-50'
          >
            {uploadingImg ? (
              <Loader2 size={14} className='animate-spin' />
            ) : (
              <ImageIcon size={14} />
            )}
            {form.imageUrl ? 'Image added' : 'Image'}
          </button>
          <input
            ref={imgInput}
            type='file'
            accept='image/*'
            hidden
            onChange={(e) => onImage(e.target.files?.[0] ?? null)}
          />
          {form.imageUrl && (
            <button
              onClick={() => setForm((f) => ({ ...f, imageUrl: '' }))}
              className='text-slate-400 hover:text-rose-500'
              title='Remove image'
            >
              <X size={14} />
            </button>
          )}
        </div>

        <div className='flex gap-2'>
          <button
            onClick={addOne}
            disabled={busy}
            className='flex-1 flex items-center justify-center gap-2 h-11 bg-[#002EFF] text-white rounded-xl font-black text-[11px] uppercase tracking-wide hover:bg-blue-700 active:scale-[0.98] transition-all disabled:opacity-50'
          >
            {busy ? (
              <Loader2 size={15} className='animate-spin' />
            ) : editingId ? (
              <Check size={15} />
            ) : (
              <Plus size={15} />
            )}
            {editingId ? 'Save changes' : 'Add to bank'}
          </button>
          {editingId && (
            <button
              onClick={() => {
                setEditingId(null)
                setForm(emptyForm)
                setError(null)
              }}
              className='h-11 px-4 rounded-xl bg-slate-100 text-slate-500 font-black text-[11px] uppercase tracking-wide hover:text-[#002EFF]'
            >
              Cancel
            </button>
          )}
        </div>
      </Card>

      {/* Existing questions */}
      <div className='space-y-2'>
        <div className='flex items-center gap-2'>
          <p className='text-[11px] font-black uppercase tracking-widest text-slate-500'>
            {subject}
          </p>
          <select
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className='h-8 px-2 rounded-lg bg-slate-50 outline-none text-[11px] font-bold'
          >
            {JAMB_SUBJECTS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <span className='ml-auto text-[10px] font-black text-slate-400'>
            {questions.length} in bank
          </span>
        </div>

        {loading ? (
          <div className='py-8 flex justify-center'>
            <Loader2 className='animate-spin text-[#002EFF]' />
          </div>
        ) : questions.length === 0 ? (
          <p className='text-[11px] font-bold text-slate-400 py-6 text-center'>
            No questions for {subject} yet. Add some above or import an Excel sheet.
          </p>
        ) : (
          questions.map((q, i) => (
            <Card
              key={q.id}
              className='p-3 rounded-2xl border-none shadow-sm bg-white flex items-start gap-3'
            >
              <span className='text-[10px] font-black text-slate-300 mt-0.5'>
                {i + 1}
              </span>
              <div className='min-w-0 flex-1'>
                <RichText className='text-[13px] font-bold text-slate-800'>
                  {q.body}
                </RichText>
                {q.imageUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={q.imageUrl}
                    alt='question'
                    className='mt-1 rounded-lg max-h-24'
                  />
                )}
                <div className='flex flex-wrap gap-1.5 mt-1.5'>
                  {q.options.map((o, oi) => (
                    <span
                      key={oi}
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        LETTERS[oi] === q.correctOption
                          ? 'bg-emerald-50 text-emerald-600'
                          : 'bg-slate-50 text-slate-500'
                      }`}
                    >
                      {LETTERS[oi]}. <RichText className='inline'>{o}</RichText>
                    </span>
                  ))}
                </div>
              </div>
              <button
                onClick={() => startEdit(q)}
                className='p-1.5 text-slate-300 hover:text-[#002EFF] shrink-0'
                title='Edit question'
              >
                <Pencil size={14} />
              </button>
              <button
                onClick={() => remove(q.id)}
                className='p-1.5 text-slate-300 hover:text-rose-500 shrink-0'
                title='Delete question'
              >
                <Trash2 size={14} />
              </button>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
