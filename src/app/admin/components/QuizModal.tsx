

import React from 'react'
import { QuizFormState, QuestionItem } from './types'

interface QuizModalProps {
  isOpen: boolean
  onClose: () => void
  activeTab: 'details' | 'questions'
  setActiveTab: (tab: 'details' | 'questions') => void
  formData: QuizFormState
  setFormData: React.Dispatch<React.SetStateAction<QuizFormState>>
  onSave: (shouldClose?: boolean) => void
  saving: boolean
  isEditing: boolean
}

export function QuizModal({
  isOpen,
  onClose,
  activeTab,
  setActiveTab,
  formData,
  setFormData,
  onSave,
  saving,
  isEditing,
}: QuizModalProps) {
  if (!isOpen) return null

  // Question manipulation handlers
  const addQuestion = () => {
    const newQuestion: QuestionItem = {
      id: Date.now().toString(),
      questionText: '',
      options: ['', '', '', ''],
      correctAnswerIndex: 0,
      explanation: '',
    }
    setFormData((prev) => ({
      ...prev,
      questions: [...(prev.questions || []), newQuestion],
    }))
  }

  const updateQuestion = (
    index: number,
    field: keyof QuestionItem,
    value: any,
  ) => {
    setFormData((prev) => {
      const updated = [...(prev.questions || [])]
      updated[index] = { ...updated[index], [field]: value }
      return { ...prev, questions: updated }
    })
  }

  const updateOption = (qIndex: number, oIndex: number, value: string) => {
    setFormData((prev) => {
      const updatedQuestions = [...(prev.questions || [])]
      const updatedOptions = [...updatedQuestions[qIndex].options]
      updatedOptions[oIndex] = value
      updatedQuestions[qIndex] = {
        ...updatedQuestions[qIndex],
        options: updatedOptions,
      }
      return { ...prev, questions: updatedQuestions }
    })
  }

  const removeQuestion = (qIndex: number) => {
    setFormData((prev) => ({
      ...prev,
      questions: prev.questions?.filter((_, idx) => idx !== qIndex),
    }))
  }

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto'>
      <div className='bg-white rounded-3xl max-w-3xl w-full p-6 shadow-2xl border border-slate-100 max-h-[90vh] flex flex-col'>
        {/* Modal Header & Navigation Tabs */}
        <div className='flex items-center justify-between pb-4 border-b border-slate-100'>
          <div>
            <h2 className='text-xl font-black text-slate-900'>
              {isEditing ? 'Edit Quiz' : 'Create New Quiz'}
            </h2>
            <p className='text-xs text-slate-500 font-semibold'>
              Configure quiz setup, parameters, and question bank.
            </p>
          </div>
          <button
            onClick={onClose}
            className='h-8 w-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 font-bold text-sm'
          >
            ✕
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className='flex gap-2 my-4 bg-slate-100 p-1 rounded-xl'>
          <button
            onClick={() => setActiveTab('details')}
            className={`flex-1 py-2 text-xs font-black uppercase rounded-lg transition-colors ${
              activeTab === 'details'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            1. Quiz Details
          </button>
          <button
            onClick={() => setActiveTab('questions')}
            className={`flex-1 py-2 text-xs font-black uppercase rounded-lg transition-colors ${
              activeTab === 'questions'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            2. Questions ({formData.questions?.length || 0})
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className='flex-1 overflow-y-auto pr-2 space-y-4'>
          {activeTab === 'details' ? (
            <div className='space-y-4'>
              <div>
                <label className='text-xs font-bold text-slate-700 block mb-1'>
                  Title
                </label>
                <input
                  type='text'
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  placeholder='e.g. Mid-Term Mathematics Evaluation'
                  className='w-full h-10 px-3 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 outline-none focus:border-[#002EFF]'
                />
              </div>

              <div>
                <label className='text-xs font-bold text-slate-700 block mb-1'>
                  Description
                </label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder='Brief summary or instructions...'
                  className='w-full p-3 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 outline-none focus:border-[#002EFF]'
                />
              </div>

              <div className='grid grid-cols-2 gap-3'>
                <div>
                  <label className='text-xs font-bold text-slate-700 block mb-1'>
                    Type
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        type: e.target.value as 'singular' | 'general',
                      })
                    }
                    className='w-full h-10 px-3 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 outline-none focus:border-[#002EFF]'
                  >
                    <option value='singular'>Singular</option>
                    <option value='general'>General</option>
                  </select>
                </div>

                <div>
                  <label className='text-xs font-bold text-slate-700 block mb-1'>
                    Access Code
                  </label>
                  <input
                    type='text'
                    value={formData.accessCode}
                    onChange={(e) =>
                      setFormData({ ...formData, accessCode: e.target.value })
                    }
                    placeholder='e.g. MTH2026'
                    className='w-full h-10 px-3 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 outline-none focus:border-[#002EFF]'
                  />
                </div>
              </div>

              <div className='flex items-center gap-4 pt-2'>
                <label className='flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700'>
                  <input
                    type='checkbox'
                    checked={formData.isPaid}
                    onChange={(e) =>
                      setFormData({ ...formData, isPaid: e.target.checked })
                    }
                    className='h-4 w-4 rounded accent-[#002EFF]'
                  />
                  Paid Quiz
                </label>

                {formData.isPaid && (
                  <div className='flex items-center gap-2'>
                    <span className='text-xs font-bold text-slate-500'>
                      Amount (₦):
                    </span>
                    <input
                      type='number'
                      value={formData.amount}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          amount: Number(e.target.value),
                        })
                      }
                      className='w-28 h-9 px-3 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 outline-none focus:border-[#002EFF]'
                    />
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className='space-y-6'>
              {formData.questions?.length === 0 ? (
                <div className='p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200'>
                  <p className='text-xs font-bold text-slate-500 mb-3'>
                    No questions added yet.
                  </p>
                  <button
                    onClick={addQuestion}
                    className='h-9 px-4 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800'
                  >
                    + Add First Question
                  </button>
                </div>
              ) : (
                formData.questions?.map((q, qIndex) => (
                  <div
                    key={q.id || qIndex}
                    className='p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-3 relative'
                  >
                    <div className='flex items-center justify-between'>
                      <span className='text-xs font-black uppercase tracking-wider text-slate-400'>
                        Question #{qIndex + 1}
                      </span>
                      <button
                        onClick={() => removeQuestion(qIndex)}
                        className='text-rose-600 text-xs font-bold hover:underline'
                      >
                        Delete
                      </button>
                    </div>

                    {/* Question Prompt */}
                    <input
                      type='text'
                      value={q.questionText}
                      onChange={(e) =>
                        updateQuestion(qIndex, 'questionText', e.target.value)
                      }
                      placeholder='Enter question text...'
                      className='w-full h-10 px-3 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-900 outline-none focus:border-[#002EFF]'
                    />

                    {/* Options Grid */}
                    <div className='grid grid-cols-1 sm:grid-cols-2 gap-2'>
                      {q.options.map((opt, oIndex) => (
                        <div
                          key={oIndex}
                          className='flex items-center gap-2 bg-white p-2 rounded-xl border border-slate-200'
                        >
                          <input
                            type='radio'
                            name={`correct-${qIndex}`}
                            checked={q.correctAnswerIndex === oIndex}
                            onChange={() =>
                              updateQuestion(
                                qIndex,
                                'correctAnswerIndex',
                                oIndex,
                              )
                            }
                            className='accent-emerald-600 cursor-pointer'
                          />
                          <input
                            type='text'
                            value={opt}
                            onChange={(e) =>
                              updateOption(qIndex, oIndex, e.target.value)
                            }
                            placeholder={`Option ${oIndex + 1}`}
                            className='flex-1 text-xs font-semibold text-slate-800 outline-none'
                          />
                        </div>
                      ))}
                    </div>

                    {/* Solution Explanation */}
                    <div>
                      <label className='text-[10px] font-bold uppercase text-slate-400 block mb-1'>
                        Explanation / Solution
                      </label>
                      <textarea
                        rows={2}
                        value={q.explanation || ''}
                        onChange={(e) =>
                          updateQuestion(qIndex, 'explanation', e.target.value)
                        }
                        placeholder='Explain why this option is correct...'
                        className='w-full p-2.5 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-800 outline-none focus:border-[#002EFF]'
                      />
                    </div>
                  </div>
                ))
              )}

              {formData.questions && formData.questions.length > 0 && (
                <button
                  onClick={addQuestion}
                  className='w-full h-10 rounded-xl border-2 border-dashed border-slate-300 hover:border-slate-400 text-slate-600 font-bold text-xs'
                >
                  + Add Question
                </button>
              )}
            </div>
          )}
        </div>

        {/* Action Controls Footer */}
        <div className='pt-4 mt-4 border-t border-slate-100 flex items-center justify-between'>
          <button
            onClick={onClose}
            className='h-10 px-4 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50'
          >
            Cancel
          </button>

          <div className='flex items-center gap-2'>
            <button
              onClick={() => onSave(false)}
              disabled={saving}
              className='h-10 px-4 rounded-xl border border-[#002EFF] text-[#002EFF] text-xs font-bold hover:bg-blue-50 disabled:opacity-50'
            >
              {saving ? 'Saving...' : 'Save & Continue'}
            </button>
            <button
              onClick={() => onSave(true)}
              disabled={saving}
              className='h-10 px-5 rounded-xl bg-[#002EFF] hover:bg-[#0028e0] text-white text-xs font-black uppercase tracking-wider disabled:opacity-50'
            >
              {saving ? 'Saving...' : 'Save & Finish'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}