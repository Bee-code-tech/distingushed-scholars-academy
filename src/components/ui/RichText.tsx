'use client'

// Renders question/answer text that may contain light Markdown (**bold**,
// *italic*) and LaTeX math ($x^3$, $\frac{1}{2}$, $\sqrt{16}$, symbols) as
// formatted output. Used everywhere a question is shown so authoring and taking
// look identical. Content is stored as plain text — see
// docs/backend-requests-2026-09-02.md §3.

import 'katex/dist/katex.min.css'
import ReactMarkdown from 'react-markdown'
import remarkMath from 'remark-math'
import remarkBreaks from 'remark-breaks'
import rehypeKatex from 'rehype-katex'
import type { Components } from 'react-markdown'

// Keep it compact and inline-friendly: no big block margins, links safe.
const COMPONENTS: Components = {
  p: ({ children }) => <p className='m-0 whitespace-pre-wrap'>{children}</p>,
  a: ({ children, href }) => (
    <a
      href={href}
      target='_blank'
      rel='noreferrer'
      className='text-[#002EFF] underline'
    >
      {children}
    </a>
  ),
  // Strip images — questions are text/math; images use the dedicated imageUrl.
  img: () => null,
}

export default function RichText({
  children,
  className,
}: {
  children?: string | null
  className?: string
}) {
  const text = children ?? ''
  return (
    <div className={className}>
      <ReactMarkdown
        remarkPlugins={[remarkMath, remarkBreaks]}
        rehypePlugins={[[rehypeKatex, { throwOnError: false, strict: false }]]}
        components={COMPONENTS}
        // No rehype-raw: raw HTML in question text is NOT rendered (safe).
      >
        {text}
      </ReactMarkdown>
    </div>
  )
}
