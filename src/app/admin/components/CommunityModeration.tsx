'use client'

import { useEffect, useState } from 'react'
import Community from '@/components/dashboard/Community'

// Admin moderation of the shared community channel. The community API reads the
// caller from the JWT; the admin panel authenticates with the admin token
// (stored under `admin_token`, mirrored to `token`), so pass it explicitly.
function adminToken(): string | undefined {
  if (typeof window === 'undefined') return undefined
  return (
    localStorage.getItem('admin_token') ||
    localStorage.getItem('token') ||
    undefined
  )
}

export default function CommunityModeration() {
  // Read the token on the client only (avoids SSR/localStorage mismatch).
  const [token, setToken] = useState<string | undefined>(undefined)
  useEffect(() => setToken(adminToken()), [])

  return <Community mode='admin' token={token} />
}
