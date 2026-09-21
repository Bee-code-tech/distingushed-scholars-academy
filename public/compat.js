/*
 * Runs before anything else, on every page. PLAIN ES5 ON PURPOSE - this file is
 * served as written, never compiled, and the browsers it exists for choke on
 * anything newer. No arrow functions, no const/let, no template strings.
 *
 * 1. Fills in small built-ins the app uses that an old Chrome lacks, so the
 *    page's own scripts do not stop at the first `.at()` or `replaceAll()`.
 * 2. If the browser is too old for even that to be enough, says so in plain
 *    words with a button to update - instead of leaving a student looking at a
 *    broken page and wondering whether the school's site is down.
 */
(function () {
  'use strict'

  function define(obj, name, fn) {
    if (obj && !obj[name]) {
      try {
        Object.defineProperty(obj, name, { value: fn, writable: true, configurable: true })
      } catch (e) {
        obj[name] = fn
      }
    }
  }

  if (typeof globalThis === 'undefined') {
    window.globalThis = window
  }

  function at(n) {
    n = Math.trunc(n) || 0
    if (n < 0) n += this.length
    return n < 0 || n >= this.length ? undefined : this[n]
  }
  define(Array.prototype, 'at', at)
  define(String.prototype, 'at', at)

  define(Object, 'hasOwn', function (o, k) {
    return Object.prototype.hasOwnProperty.call(o, k)
  })

  define(Object, 'fromEntries', function (entries) {
    var out = {}
    Array.from(entries).forEach(function (pair) {
      out[pair[0]] = pair[1]
    })
    return out
  })

  define(String.prototype, 'replaceAll', function (find, rep) {
    if (find instanceof RegExp) return this.replace(find, rep)
    return this.split(String(find)).join(typeof rep === 'function' ? rep(String(find)) : rep)
  })

  define(Array.prototype, 'flat', function (depth) {
    depth = depth === undefined ? 1 : Number(depth)
    var out = []
    ;(function walk(arr, d) {
      for (var i = 0; i < arr.length; i++) {
        if (Array.isArray(arr[i]) && d > 0) walk(arr[i], d - 1)
        else out.push(arr[i])
      }
    })(this, depth)
    return out
  })
  define(Array.prototype, 'flatMap', function (fn, self) {
    return Array.prototype.map.call(this, fn, self).flat(1)
  })

  define(Array.prototype, 'findLast', function (fn, self) {
    for (var i = this.length - 1; i >= 0; i--) if (fn.call(self, this[i], i, this)) return this[i]
    return undefined
  })
  define(Array.prototype, 'findLastIndex', function (fn, self) {
    for (var i = this.length - 1; i >= 0; i--) if (fn.call(self, this[i], i, this)) return i
    return -1
  })

  define(Array.prototype, 'toSorted', function (cmp) {
    return Array.prototype.slice.call(this).sort(cmp)
  })
  define(Array.prototype, 'toReversed', function () {
    return Array.prototype.slice.call(this).reverse()
  })

  if (typeof Promise !== 'undefined') {
    define(Promise, 'allSettled', function (list) {
      return Promise.all(
        Array.from(list).map(function (p) {
          return Promise.resolve(p).then(
            function (value) {
              return { status: 'fulfilled', value: value }
            },
            function (reason) {
              return { status: 'rejected', reason: reason }
            }
          )
        })
      )
    })
  }

  if (typeof window.queueMicrotask !== 'function') {
    window.queueMicrotask = function (fn) {
      Promise.resolve().then(fn)
    }
  }

  if (typeof window.structuredClone !== 'function') {
    window.structuredClone = function (value) {
      return value === undefined ? undefined : JSON.parse(JSON.stringify(value))
    }
  }

  if (window.Element) {
    define(Element.prototype, 'replaceChildren', function () {
      while (this.firstChild) this.removeChild(this.firstChild)
      for (var i = 0; i < arguments.length; i++) {
        var n = arguments[i]
        this.appendChild(typeof n === 'string' ? document.createTextNode(n) : n)
      }
    })
  }

  if (window.crypto && !window.crypto.randomUUID && window.crypto.getRandomValues) {
    window.crypto.randomUUID = function () {
      var b = window.crypto.getRandomValues(new Uint8Array(16))
      b[6] = (b[6] & 0x0f) | 0x40
      b[8] = (b[8] & 0x3f) | 0x80
      var h = []
      for (var i = 0; i < 16; i++) h.push((b[i] + 0x100).toString(16).slice(1))
      return (
        h.slice(0, 4).join('') + '-' + h.slice(4, 6).join('') + '-' + h.slice(6, 8).join('') +
        '-' + h.slice(8, 10).join('') + '-' + h.slice(10).join('')
      )
    }
  }

  // ---- Is this browser too old for the fixes above to be enough? -------------
  // The styling is rewritten at build time and works a long way back. The app's
  // scripts are another matter: the framework itself ships `static {}` class
  // blocks, which Chrome learned in version 94 (Sept 2021). Older than that and
  // the script is a syntax error from its first line - nothing on the page ever
  // comes alive, forms do nothing, "Loading..." never ends. That cannot be patched
  // from here, so say what is wrong and how to fix it.
  var tooOld = false
  try {
    new Function('class A { static { A.ok = 1 } }')
  } catch (e) {
    tooOld = true
  }
  if (!tooOld) return

  var m = /(?:Chrome|CriOS)\/(\d+)/.exec(navigator.userAgent)
  var version = m ? 'Chrome ' + m[1] : 'an old browser'

  try {
    if (window.sessionStorage && sessionStorage.getItem('dsa_old_browser_ok')) return
  } catch (e) {}

  function show() {
    if (!document.body || document.getElementById('dsa-old-browser')) return
    var android = /Android/i.test(navigator.userAgent)
    var bar = document.createElement('div')
    bar.id = 'dsa-old-browser'
    bar.setAttribute('role', 'alert')
    bar.style.cssText =
      'position:relative;z-index:2147483647;background:#FCB900;color:#1a1a1a;' +
      'font:600 14px/1.45 system-ui,-apple-system,Segoe UI,Roboto,sans-serif;' +
      'padding:12px 14px;text-align:left;border-bottom:2px solid #c99400'
    bar.innerHTML =
      '<div style="max-width:720px;margin:0 auto">' +
      '<strong style="display:block;font-size:15px;margin-bottom:2px">Your browser needs an update</strong>' +
      'This phone is using ' + version + ', which is too old to run this site. Pages may stay on ' +
      '&ldquo;Loading&rdquo; and buttons may do nothing. ' +
      (android
        ? 'Open <b>Play Store</b>, search for <b>Chrome</b>, and tap <b>Update</b>, then come back. ' +
          'It is free.'
        : 'Please update your browser, then come back.') +
      '<div style="margin-top:8px">' +
      (android
        ? '<a href="https://play.google.com/store/apps/details?id=com.android.chrome" ' +
          'style="display:inline-block;background:#002EFF;color:#fff;text-decoration:none;' +
          'padding:9px 14px;border-radius:8px;margin-right:8px;font-weight:700">Update Chrome</a>'
        : '') +
      '<button type="button" id="dsa-old-browser-x" style="background:transparent;border:1px solid #1a1a1a;' +
      'color:#1a1a1a;padding:8px 12px;border-radius:8px;font:inherit;font-weight:700">Continue anyway</button>' +
      '</div></div>'
    document.body.insertBefore(bar, document.body.firstChild)
    var x = document.getElementById('dsa-old-browser-x')
    if (x) {
      x.onclick = function () {
        try {
          sessionStorage.setItem('dsa_old_browser_ok', '1')
        } catch (e) {}
        if (bar.parentNode) bar.parentNode.removeChild(bar)
      }
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', show)
  else show()
  // React may replace <body>'s children while it starts up; put the notice back.
  window.addEventListener('load', function () {
    setTimeout(show, 1500)
  })
})()
