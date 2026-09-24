'use client'

// Unread badge for the Community nav item.
//
// It used to fetch the last 100 messages every 15 seconds on every dashboard
// tab and count them in the browser. The channel list already carries a
// per-channel unread count (worked out server-side from read receipts), so
// one light request a minute is enough. While the Community is on screen the
// chat itself marks things read and the badge simply stays at zero.

import { useCallback, useEffect, useRef, useState } from 'react'
import { dsaApi } from '@/lib/api'

const REFRESH_MS = 60000

/**
 * @param active  true while the Community tab is the one on screen.
 * @param token   explicit bearer token (admin passes its admin token).
 */
export function useCommunityUnread(active: boolean, token?: string): number {
  const [unread, setUnread] = useState(0)
  const activeRef = useRef(active)
  useEffect(() => {
    activeRef.current = active
  }, [active])

  const refresh = useCallback(async () => {
    // On screen: the chat marks things read itself; nothing to count.
    if (activeRef.current) return
    try {
      const rows = (await dsaApi.community.channels(token)) as Record<
        string,
        unknown
      >[]
      let n = 0
      for (const r of rows) {
        const u = Number(r.unread ?? 0)
        if (Number.isFinite(u) && u > 0) n += u
      }
      setUnread(n)
    } catch {
      /* offline / not live — leave the count as-is */
    }
  }, [token])

  useEffect(() => {
    const first = setTimeout(refresh, 0)
    const id = setInterval(() => {
      if (!document.hidden) refresh()
    }, REFRESH_MS)
    const onFocus = () => refresh()
    window.addEventListener('focus', onFocus)
    return () => {
      clearTimeout(first)
      clearInterval(id)
      window.removeEventListener('focus', onFocus)
    }
  }, [refresh])

  // On the Community tab the badge is always clear.
  return active ? 0 : unread
}
