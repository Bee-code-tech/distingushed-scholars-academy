'use client'

import { useCallback, useEffect, useState } from 'react'

/**
 * Persist the active dashboard tab in the URL (`?tab=`) so a browser reload
 * restores the same screen instead of resetting to the first tab.
 *
 * Every dashboard (student, tutor, guardian, staff, admin) uses this so the
 * behaviour is identical across the app: click a tab → the URL updates without
 * a navigation; reload → the same tab is active again.
 *
 * @param initial the tab to show when the URL has no `?tab=` yet.
 */
export function useTabState<T extends string>(
  initial: T,
): [T, (key: T) => void] {
  const [tab, setTab] = useState<T>(initial)

  // Restore from the URL on first mount (after hydration, so SSR and the first
  // client render agree and there is no hydration mismatch).
  useEffect(() => {
    const fromUrl = new URLSearchParams(window.location.search).get('tab')
    if (fromUrl) setTab(fromUrl as T)
  }, [])

  const set = useCallback((key: T) => {
    setTab(key)
    const url = new URL(window.location.href)
    url.searchParams.set('tab', key)
    // replaceState (not push) so the browser Back button isn't cluttered with
    // one entry per tab click.
    window.history.replaceState(null, '', url.toString())
  }, [])

  return [tab, set]
}
