// Tailwind v4 writes CSS for browsers from 2023 on: every utility sits inside
// `@layer`, colours are oklch(), spacing uses logical properties. A browser
// that does not know `@layer` (Chrome before 99) throws the whole block away —
// the page arrives as bare black-on-white text. A good share of DSA students
// are on phones whose Chrome is that old, so the second plugin rewrites the
// output into CSS those browsers understand. The targets are the
// `browserslist` in package.json. The small plugin between them covers two
// gaps the preset cannot (see postcss/legacy-tailwind.cjs).
const config = {
  plugins: {
    '@tailwindcss/postcss': {},
    './postcss/legacy-tailwind.cjs': {},
    'postcss-preset-env': {
      stage: 2,
      features: {
        'cascade-layers': true,
        'oklab-function': { preserve: true },
        'color-mix': { preserve: true },
        'logical-properties-and-values': true,
        'is-pseudo-class': false,
      },
    },
  },
}

export default config
