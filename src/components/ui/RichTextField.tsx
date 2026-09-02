'use client'

// A textarea with a formatting toolbar (bold, italic, superscript, subscript,
// symbols, fraction, root) that writes Markdown + LaTeX into plain text, plus a
// live preview rendered with <RichText>. Used for authoring quiz questions /
// passages. Storage stays plain text — see docs/backend-requests-2026-09-02.md §3.

import { useLayoutEffect, useRef, useState } from 'react'
import { Bold, Italic, Superscript, Subscript, Sigma } from 'lucide-react'
import RichText from './RichText'

type Edit = { value: string; selStart: number; selEnd: number }

const SYMBOLS = [
  '√', 'π', 'θ', '≤', '≥', '≠', '±', '×', '÷', '→',
  '∞', '°', 'Σ', 'Δ', '²', '³', '½', 'µ',
]

export default function RichTextField({
  value,
  onChange,
  placeholder,
  rows = 3,
  className = '',
}: {
  value: string
  onChange: (v: string) => void
  placeholder?: string
  rows?: number
  className?: string
}) {
  const ref = useRef<HTMLTextAreaElement>(null)
  const pending = useRef<{ start: number; end: number } | null>(null)
  const [symbolsOpen, setSymbolsOpen] = useState(false)

  // After a toolbar edit, restore focus + caret to where the edit left it.
  useLayoutEffect(() => {
    if (pending.current && ref.current) {
      const { start, end } = pending.current
      ref.current.focus()
      ref.current.setSelectionRange(start, end)
      pending.current = null
    }
  })

  const apply = (fn: (v: string, s: number, e: number) => Edit) => {
    const el = ref.current
    const s = el ? el.selectionStart : value.length
    const e = el ? el.selectionEnd : value.length
    const next = fn(value, s, e)
    pending.current = { start: next.selStart, end: next.selEnd }
    onChange(next.value)
  }

  const wrap = (marker: string) =>
    apply((v, s, e) => {
      const sel = v.slice(s, e) || 'text'
      const out = marker + sel + marker
      return {
        value: v.slice(0, s) + out + v.slice(e),
        selStart: s + marker.length,
        selEnd: s + marker.length + sel.length,
      }
    })

  // Superscript / subscript: attach to the word/token right before the caret so
  // "x" + selected "3" → $x^{3}$ (valid KaTeX); falls back to an `x` base.
  const script = (kind: '^' | '_') =>
    apply((v, s, e) => {
      const sel = v.slice(s, e)
      let b = s
      while (b > 0 && /[A-Za-z0-9)\]}]/.test(v[b - 1])) b--
      const base = v.slice(b, s)
      const body = sel || '2'
      if (base) {
        const out = `$${base}${kind}{${body}}$`
        return {
          value: v.slice(0, b) + out + v.slice(e),
          selStart: b + out.length,
          selEnd: b + out.length,
        }
      }
      const out = `$x${kind}{${body}}$`
      return {
        value: v.slice(0, s) + out + v.slice(e),
        selStart: s + out.length,
        selEnd: s + out.length,
      }
    })

  const insert = (text: string, caretInside?: number) =>
    apply((v, s, e) => {
      const out = text
      const caret = caretInside == null ? s + out.length : s + caretInside
      return {
        value: v.slice(0, s) + out + v.slice(e),
        selStart: caret,
        selEnd: caret,
      }
    })

  const sqrt = () =>
    apply((v, s, e) => {
      const sel = v.slice(s, e)
      const out = `$\\sqrt{${sel}}$`
      const caret = sel ? s + out.length : s + out.length - 2 // inside {}
      return { value: v.slice(0, s) + out + v.slice(e), selStart: caret, selEnd: caret }
    })

  const Btn = ({
    onClick,
    title,
    children,
  }: {
    onClick: () => void
    title: string
    children: React.ReactNode
  }) => (
    <button
      type='button'
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      title={title}
      className='h-7 min-w-7 px-1.5 rounded-md bg-white border border-slate-200 text-slate-600 text-[12px] font-black hover:border-[#002EFF]/40 hover:text-[#002EFF] flex items-center justify-center'
    >
      {children}
    </button>
  )

  return (
    <div className={className}>
      {/* Toolbar */}
      <div className='relative flex flex-wrap items-center gap-1 mb-1.5'>
        <Btn onClick={() => wrap('**')} title='Bold'>
          <Bold size={13} />
        </Btn>
        <Btn onClick={() => wrap('*')} title='Italic'>
          <Italic size={13} />
        </Btn>
        <Btn onClick={() => script('^')} title='Superscript (e.g. x³)'>
          <Superscript size={13} />
        </Btn>
        <Btn onClick={() => script('_')} title='Subscript (e.g. H₂O)'>
          <Subscript size={13} />
        </Btn>
        <Btn onClick={sqrt} title='Square root'>
          √
        </Btn>
        <Btn onClick={() => insert('$\\frac{}{}$', 7)} title='Fraction'>
          ½
        </Btn>
        <div className='relative'>
          <Btn onClick={() => setSymbolsOpen((o) => !o)} title='Symbols'>
            <Sigma size={13} />
          </Btn>
          {symbolsOpen && (
            <div className='absolute z-20 mt-1 left-0 w-44 p-1.5 rounded-xl bg-white border border-slate-200 shadow-lg grid grid-cols-6 gap-1'>
              {SYMBOLS.map((sym) => (
                <button
                  key={sym}
                  type='button'
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    insert(sym)
                    setSymbolsOpen(false)
                  }}
                  className='h-7 rounded-md hover:bg-slate-100 text-[13px] font-bold text-slate-700'
                >
                  {sym}
                </button>
              ))}
            </div>
          )}
        </div>
        <span className='text-[9px] font-bold text-slate-300 ml-1'>
          math: $x^2$, $\frac&#123;1&#125;&#123;2&#125;$
        </span>
      </div>

      <textarea
        ref={ref}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className='w-full px-3 py-2 rounded-lg bg-slate-50 border border-transparent focus:border-[#002EFF]/30 focus:bg-white outline-none text-sm font-medium resize-none'
      />

      {/* Live preview */}
      {value.trim() && (
        <div className='mt-1.5 rounded-lg bg-slate-50/70 px-3 py-2'>
          <p className='text-[8px] font-black uppercase tracking-widest text-slate-400 mb-1'>
            Preview
          </p>
          <RichText className='text-[13px] text-slate-800'>{value}</RichText>
        </div>
      )}
    </div>
  )
}
