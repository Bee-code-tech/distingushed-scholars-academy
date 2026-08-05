'use client'

import { useEffect, useRef } from 'react'

/**
 * Session-security helper for protected areas.
 *
 * - `idleMinutes`: auto-logout after this many minutes with no user activity
 *   (mouse/keyboard/scroll/touch). Fires `onIdleTimeout`.
 * - `lockArea`: trap the browser Back button so the user cannot leave the area
 *   without an explicit sign-out (forward navigations like the Sign Out button
 *   still work — only popstate/back is blocked).
 */
export function useSecureSession({
  onIdleTimeout,
  idleMinutes = 10,
  lockArea = false,
}: {
  onIdleTimeout: () => void
  idleMinutes?: number
  lockArea?: boolean
}) {
  // Keep the latest callback without re-running the effect each render.
  const cb = useRef(onIdleTimeout)
  cb.current = onIdleTimeout

  useEffect(() => {
    if (typeof window === 'undefined') return

    // ---- Idle auto-logout ----
    let timer: ReturnType<typeof setTimeout>
    const reset = () => {
      clearTimeout(timer)
      timer = setTimeout(() => cb.current(), idleMinutes * 60 * 1000)
    }
    const activity = ['mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart', 'click']
    activity.forEach((e) => window.addEventListener(e, reset, { passive: true }))
    reset()

    // ---- Back-button trap ----
    let onPop: (() => void) | undefined
    if (lockArea) {
      window.history.pushState(null, '', window.location.href)
      onPop = () => window.history.pushState(null, '', window.location.href)
      window.addEventListener('popstate', onPop)
    }

    return () => {
      clearTimeout(timer)
      activity.forEach((e) => window.removeEventListener(e, reset))
      if (onPop) window.removeEventListener('popstate', onPop)
    }
  }, [idleMinutes, lockArea])
}
