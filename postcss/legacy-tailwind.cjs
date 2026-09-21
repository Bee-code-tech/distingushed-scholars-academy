/**
 * Two things Tailwind v4 assumes that phones with an old Chrome do not have.
 * Runs after Tailwind and before postcss-preset-env (see postcss.config.mjs).
 *
 * 1. Defaults for the `--tw-*` variables.
 *    Tailwind registers them with `@property` and, for browsers without it,
 *    ships a fallback that sets them on `*`. But the fallback is wrapped in an
 *    `@supports` test that only old Safari and old Firefox pass — old Chrome
 *    (before 85) gets neither, so `border-style: var(--tw-border-style)` is
 *    invalid and every border, shadow and ring disappears. Unwrapping the block
 *    gives the defaults to everyone; where `@property` works they are the same
 *    values it would have supplied.
 *
 * 2. `translate`, `scale` and `rotate` as properties of their own.
 *    Chrome learned these in 104. Before that, `left-1/2 -translate-x-1/2`
 *    centres nothing and dialogs sit half off the screen. For every rule that
 *    uses them, a `transform` equivalent is added inside
 *    `@supports not (translate: 0)`, so browsers that understand the real
 *    properties never see it and nothing is applied twice.
 */
const INDIVIDUAL = new Set(['translate', 'scale', 'rotate'])

/** Split "a b c" on top-level spaces, leaving var(…, …) and calc(…) whole. */
const parts = (value) => {
  const out = []
  let depth = 0
  let cur = ''
  for (const ch of value.trim()) {
    if (ch === '(') depth += 1
    if (ch === ')') depth -= 1
    if (ch === ' ' && depth === 0) {
      if (cur) out.push(cur)
      cur = ''
    } else cur += ch
  }
  if (cur) out.push(cur)
  return out
}

const COMPOSITE =
  'translate(var(--tw-translate-x,0),var(--tw-translate-y,0)) ' +
  'scale(var(--tw-scale-x,1),var(--tw-scale-y,1))'

const literal = (prop, value) => {
  const p = parts(value)
  if (!p.length || p[0] === 'none') return ''
  if (prop === 'rotate') return p.length === 1 ? `rotate(${p[0]})` : ''
  if (prop === 'translate') return `translate(${p[0]},${p[1] || '0'})`
  return `scale(${p[0]}${p[1] ? `,${p[1]}` : ''})`
}

module.exports = () => ({
  postcssPlugin: 'dsa-legacy-tailwind',
  OnceExit(root, { AtRule, Rule, Declaration }) {
    // 1 — give the --tw-* defaults to every browser
    root.walkAtRules('supports', (at) => {
      if (at.params.includes('-webkit-hyphens') && at.params.includes('margin-trim')) {
        at.replaceWith(at.nodes)
      }
    })

    // 2 — transform fallbacks
    root.walkRules((rule) => {
      let inside = rule.parent
      while (inside) {
        if (inside.type === 'atrule' && /keyframes$/.test(inside.name)) return
        if (inside.type === 'atrule' && inside.name === 'supports' && inside.params.includes('translate')) return
        inside = inside.parent
      }

      const found = []
      rule.each((node) => {
        if (node.type === 'decl' && INDIVIDUAL.has(node.prop)) found.push(node)
      })
      if (!found.length) return

      const usesVars = found.some((d) => d.value.includes('--tw-'))
      const extras = found
        .filter((d) => !d.value.includes('--tw-'))
        .map((d) => literal(d.prop, d.value))
        .filter(Boolean)
      const value = [usesVars ? COMPOSITE : '', ...extras].filter(Boolean).join(' ')
      if (!value) return

      const fallback = new Rule({ selector: rule.selector })
      fallback.append(new Declaration({ prop: 'transform', value, important: found.some((d) => d.important) }))
      const gate = new AtRule({ name: 'supports', params: 'not (translate:0)' })
      gate.append(fallback)
      rule.after(gate)
    })
  },
})
module.exports.postcss = true
