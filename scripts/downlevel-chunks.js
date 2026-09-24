/* eslint-disable @typescript-eslint/no-require-imports */
// Runs after `next build`. Rewrites the browser chunks so older phones can
// parse them.
//
// WHY: Next.js compiles OUR code for the browsers in package.json's
// `browserslist`, but ships its own runtime as written for current browsers.
// That runtime uses `class { static { … } }` blocks and `??=`, which Safari
// learned in 16.4 (spring 2023) and Chrome in 94. On an iPhone that cannot go
// past iOS 16.3, or an Android phone with a never-updated Chrome, the very
// first chunk is a syntax error and nothing on the page ever runs — no forms,
// no sign-in, "Loading…" forever. DSA has students on both.
//
// Babel's preset-env turns those constructs into ES2018, which every browser
// back to iOS 12 / Chrome 64 understands. Nothing else changes: no polyfills
// (public/compat.js covers the few built-ins we use), no minification pass.
//
// Checked at the end by parsing every chunk as ES2018 — if one still fails to
// parse, the build fails, rather than shipping a page that works for us and
// not for them.
const fs = require('fs')
const path = require('path')
const babel = require('@babel/core')
const acorn = require('acorn')

const root = path.join(__dirname, '..', '.next', 'static', 'chunks')
if (!fs.existsSync(root)) {
  console.log('[downlevel] no .next/static/chunks — nothing to do')
  process.exit(0)
}

const targets = {
  ios: '12',
  safari: '12',
  chrome: '64',
  android: '64',
  samsung: '9',
  firefox: '67',
}

const files = []
;(function walk(d) {
  for (const f of fs.readdirSync(d)) {
    const p = path.join(d, f)
    if (fs.statSync(p).isDirectory()) walk(p)
    else if (f.endsWith('.js')) files.push(p)
  }
})(root)

let rewritten = 0
let bytesBefore = 0
let bytesAfter = 0
const failed = []

for (const file of files) {
  const src = fs.readFileSync(file, 'utf8')
  // Already fine? Skip the work (most chunks are).
  try {
    acorn.parse(src, { ecmaVersion: 2018, sourceType: 'script' })
    continue
  } catch {
    /* needs rewriting */
  }
  const out = babel.transformSync(src, {
    filename: file,
    babelrc: false,
    configFile: false,
    compact: true,
    comments: false,
    sourceMaps: false,
    sourceType: 'script',
    // Webpack chunks assign to `self.webpackChunk…`; leave the global alone.
    presets: [
      [
        '@babel/preset-env',
        {
          targets,
          modules: false,
          useBuiltIns: false,
          // Regex features cannot be polyfilled; the build check below catches
          // any that slip through.
          exclude: ['transform-typeof-symbol', 'transform-regenerator', 'transform-async-to-generator'],
        },
      ],
    ],
  })
  try {
    acorn.parse(out.code, { ecmaVersion: 2018, sourceType: 'script' })
  } catch (e) {
    failed.push(`${path.relative(root, file)}: ${e.message}`)
    continue
  }
  bytesBefore += src.length
  bytesAfter += out.code.length
  fs.writeFileSync(file, out.code)
  rewritten += 1
}

console.log(
  `[downlevel] ${files.length} chunks scanned, ${rewritten} rewritten to ES2018` +
    (rewritten ? ` (${(bytesBefore / 1024) | 0}KB -> ${(bytesAfter / 1024) | 0}KB)` : ''),
)
if (failed.length) {
  console.error('[downlevel] these chunks still need newer syntax:\n  ' + failed.join('\n  '))
  process.exit(1)
}
