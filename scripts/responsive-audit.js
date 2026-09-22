// Responsive audit — paste into the browser console (or a devtools snippet)
// with the viewport at 360px. Returns JSON; `clean: true` means nothing found.
//
// WHY 360: most DSA students are on Android phones, which are 360px wide. The
// common "mobile" preset is 375px (iPhone) — 15px is enough to hide a bug. The
// Quizzes header overlapped at 360 and looked fine at 375.
//
// WHY NOT `scrollWidth === innerWidth`: that only asks "does the page scroll
// sideways?". It is blind to what people actually see — a button drawn over a
// title, text cut off inside a rounded card — because those happen INSIDE a
// container (often overflow-hidden), so the page never gets wider.
//
// What this looks for, measuring real glyph boxes (via Range) rather than
// element boxes, since text that overflows its element keeps a narrow box while
// its letters run on:
//   1. pastViewport — wider than the screen
//   2. overlaps     — a control drawn over text it does not contain
//   3. clipped      — text cut by an overflow-hidden ancestor, or a placeholder
//                     too long for its field
//
// Left alone on purpose: anything inside a sideways scroller (a timetable grid
// is meant to scroll), pointer-events:none decoration (watermark icons), fixed
// and sticky chrome, absolutely-placed badges, and text that asked to be cut
// with an ellipsis or a line clamp.
//
// When auditing several tabs, CHECK THAT THE TAB ACTUALLY CHANGED (compare the
// page heading). history.pushState does not switch tabs in this app — a sweep
// done that way audits one screen many times and reports a false all-clear.
(() => {
  const vw = window.innerWidth
  const desc = (el) =>
    `${el.tagName.toLowerCase()} "${(el.innerText || el.value || el.getAttribute('aria-label') || '')
      .trim()
      .replace(/\s+/g, ' ')
      .slice(0, 30)}"`
  const chain = (el, test) => {
    for (let n = el; n && n !== document.body; n = n.parentElement) {
      if (test(getComputedStyle(n))) return true
    }
    return false
  }
  const pinned = (el) => chain(el, (cs) => cs.position === 'fixed' || cs.position === 'sticky')
  const floated = (el) => chain(el, (cs) => cs.position === 'absolute')
  const scrollsSideways = (el) =>
    chain(el.parentElement || el, (cs) => cs.overflowX === 'auto' || cs.overflowX === 'scroll')
  const decorative = (el) => chain(el, (cs) => cs.pointerEvents === 'none')
  const visible = (el) => {
    const r = el.getBoundingClientRect()
    const cs = getComputedStyle(el)
    return r.width > 0 && r.height > 0 && cs.visibility !== 'hidden' && cs.display !== 'none' && Number(cs.opacity) > 0.05
  }
  const glyphs = (el) => {
    const range = document.createRange()
    range.selectNodeContents(el)
    return range.getBoundingClientRect()
  }
  // The part of the text a person can actually see: the glyph box, cut down
  // by every ancestor that clips (a scrolling chat, a truncated title). Text
  // scrolled out of view or hidden behind an ellipsis is not "under" anything.
  const shown = (el) => {
    let r = glyphs(el)
    let box = { left: r.left, top: r.top, right: r.right, bottom: r.bottom }
    for (let n = el; n && n !== document.body; n = n.parentElement) {
      const cs = getComputedStyle(n)
      const clips = ['hidden', 'auto', 'scroll', 'clip']
      if (clips.includes(cs.overflowX) || clips.includes(cs.overflowY) || cs.textOverflow === 'ellipsis') {
        const b = n.getBoundingClientRect()
        box = {
          left: Math.max(box.left, b.left),
          top: Math.max(box.top, b.top),
          right: Math.min(box.right, b.right),
          bottom: Math.min(box.bottom, b.bottom),
        }
      }
    }
    return box
  }

  const all = [...document.querySelectorAll('body *')].filter(visible)
  const out = { pastViewport: [], overlaps: [], clipped: [] }

  // Inline text inside a truncated line keeps its full width; the ellipsis
  // hides the rest, so it is not really past the edge.
  const truncated = (el) => chain(el, (cs) => cs.textOverflow === 'ellipsis')

  for (const el of all) {
    if (pinned(el) || scrollsSideways(el) || decorative(el) || truncated(el)) continue
    const r = el.getBoundingClientRect()
    if (r.right > vw + 1 || r.left < -1) out.pastViewport.push(desc(el))
  }

  const texts = all.filter(
    (el) => el.children.length === 0 && (el.innerText || '').trim().length > 1 && !pinned(el),
  )
  const controls = all.filter(
    (el) => el.matches('button, a[href], input, select, textarea') && !pinned(el),
  )

  for (const c of controls) {
    if (floated(c)) continue
    const a = c.getBoundingClientRect()
    for (const t of texts) {
      if (c.contains(t) || t.contains(c) || floated(t)) continue
      const b = shown(t)
      if (b.right - b.left < 3 || b.bottom - b.top < 3) continue
      const ix = Math.min(a.right, b.right) - Math.max(a.left, b.left)
      const iy = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top)
      if (ix > 3 && iy > 3) out.overlaps.push(`${desc(c)} over ${desc(t)} (${Math.round(ix)}x${Math.round(iy)}px)`)
    }
  }

  for (const t of texts) {
    const cs = getComputedStyle(t)
    if (cs.textOverflow === 'ellipsis') continue
    if (cs.webkitLineClamp && cs.webkitLineClamp !== 'none') continue
    const g = glyphs(t)
    for (let n = t.parentElement; n && n !== document.body; n = n.parentElement) {
      const ncs = getComputedStyle(n)
      if (ncs.overflowX === 'auto' || ncs.overflowX === 'scroll') break
      if (ncs.overflowX === 'hidden') {
        if (ncs.textOverflow === 'ellipsis') break
        const box = n.getBoundingClientRect()
        if (g.right > box.right + 2) out.clipped.push(`${desc(t)} cut by ${n.tagName.toLowerCase()}`)
        break
      }
    }
  }

  // Placeholders are not text nodes, so measure them on a canvas.
  for (const f of all.filter((el) => el.matches('input, textarea') && el.placeholder && !el.value)) {
    const cs = getComputedStyle(f)
    const ctx = document.createElement('canvas').getContext('2d')
    ctx.font = `${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`
    const need = ctx.measureText(f.placeholder).width
    const room = f.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight)
    if (need > room + 2) {
      out.clipped.push(`placeholder "${f.placeholder.slice(0, 28)}" needs ${Math.round(need)}px, has ${Math.round(room)}px`)
    }
  }

  const uniq = (a) => [...new Set(a)].slice(0, 8)
  return JSON.stringify({
    vw,
    pastViewport: uniq(out.pastViewport),
    overlaps: uniq(out.overlaps),
    clipped: uniq(out.clipped),
    clean: !out.pastViewport.length && !out.overlaps.length && !out.clipped.length,
  })
})()
