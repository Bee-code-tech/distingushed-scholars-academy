'use client'

import { useEffect } from 'react'
import AOS from 'aos'
import 'aos/dist/aos.css'

export default function AOSProvider({
  children,
}: {
  children: React.ReactNode
}) {
  useEffect(() => {
    AOS.init({
      duration: 500,
      once: true, // animate a card only the first time — no re-firing on every scroll
      mirror: false,
      offset: 40,
      easing: 'ease-out-cubic',
      // Respect users who prefer reduced motion
      disable: () =>
        typeof window !== 'undefined' &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    })
  }, [])

  return <>{children}</>
}
