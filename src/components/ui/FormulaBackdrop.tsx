'use client'

/**
 * Floating academic formulas used as section wallpaper.
 *
 * Purely decorative, so the whole layer is aria-hidden — screen readers would
 * otherwise read "E = mc² a² + b² = c²…" between a section heading and its
 * content. Hidden below md: on phones the formulas crowd the real content.
 *
 * Motion lives in globals.css (.dsa-formula) so it can be switched off in one
 * place for prefers-reduced-motion.
 */

export type Formula = {
  text: string
  top: string
  left?: string
  right?: string
  rotate: number
  /** 'blue' | 'gold' — gold reads as the accent, use it sparingly */
  tone?: 'blue' | 'gold'
}

const TONES = {
  blue: { color: '#002EFF', glow: 'rgba(0,46,255,0.35)' },
  gold: { color: '#FCB900', glow: 'rgba(252,185,0,0.35)' },
}

export default function FormulaBackdrop({
  formulas,
  /** base opacity — raise on plain white sections, lower over imagery */
  opacity = 0.12,
}: {
  formulas: Formula[]
  opacity?: number
}) {
  return (
    <div
      aria-hidden='true'
      className='absolute inset-0 pointer-events-none select-none overflow-hidden hidden md:block'
    >
      {formulas.map((f, i) => {
        const tone = TONES[f.tone ?? 'blue']
        return (
          <div
            key={`${f.text}-${i}`}
            className='dsa-formula absolute font-serif italic font-black text-2xl lg:text-4xl whitespace-nowrap'
            style={
              {
                top: f.top,
                left: f.left,
                right: f.right,
                color: tone.color,
                opacity,
                '--rot': `${f.rotate}deg`,
                '--glow': tone.glow,
                animationDelay: `${(i % 6) * 0.9}s`,
                animationDuration: `${7 + (i % 4)}s`,
              } as React.CSSProperties
            }
          >
            {f.text}
          </div>
        )
      })}
    </div>
  )
}
