'use client'

// Unread badge for the Community nav item. Counts messages posted by other
// people since the viewer last opened the community (tracked in localStorage).
// Frontend-only: it polls the existing GET /community/messages.

import { useCallback, useEffect, useRef, useState } from 'react'
import { dsaApi } from '@/lib/api'
import { getUser } from '@/lib/auth'

const KEY = 'dsa_community_last_seen'

function lastSeen(): number {
  if (typeof window === 'undefined') return 0
  const v = Number(localStorage.getItem(KEY) || 0)
  return Number.isFinite(v) ? v : 0
}

function markSeenNow(): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(KEY, String(Date.now()))
  } catch {
    /* storage unavailable */
  }
}

/**
 * @param active  true while the Community tab is the one on screen — keeps the
 *                badge at zero and advances "last seen".
 * @param token   explicit bearer token (admin passes its admin token).
 */
export function useCommunityUnread(active: boolean, token?: string): number {
  const [unread, setUnread] = useState(0)
  const activeRef = useRef(active)
  activeRef.current = active

  const me = getUser() as
    | (ReturnType<typeof getUser> & { id?: string; _id?: string })
    | null
  const myId = String(me?.id || me?._id || '')

  const refresh = useCallback(async () => {
    try {
      const rows = (await dsaApi.community.list(
        { limit: 100 },
        token,
      )) as Record<string, unknown>[]
      // While viewing, everything counts as seen.
      if (activeRef.current) {
        markSeenNow()
        setUnread(0)
        return
      }
      const seen = lastSeen()
      let n = 0
      for (const r of rows) {
        const sender = (r.sender ?? r.user ?? {}) as Record<string, unknown>
        const sid = String(sender.id ?? sender._id ?? r.senderId ?? '')
        const t = Date.parse(String(r.createdAt ?? r.timestamp ?? '')) || 0
        if (t > seen && (!myId || sid !== myId)) n++
      }
      setUnread(n)
    } catch {
      /* offline / not live — leave the count as-is */
    }
  }, [token, myId])

  useEffect(() => {
    refresh()
    const id = setInterval(refresh, 15000)
    const onFocus = () => refresh()
    window.addEventListener('focus', onFocus)
    return () => {
      clearInterval(id)
      window.removeEventListener('focus', onFocus)
    }
  }, [refresh])

  // Clear immediately when the community tab becomes active.
  useEffect(() => {
    if (active) {
      markSeenNow()
      setUnread(0)
    }
  }, [active])

  return unread
}
