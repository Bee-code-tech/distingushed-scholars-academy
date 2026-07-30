'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'

/**
 * Fills its parent container and cross-fades through `images`. Used for each of
 * the three hero photo slots so they keep their own size/position/rotation but
 * cycle images. Parent must be `position: relative` with `overflow-hidden`.
 *
 * `idx` starts at 0 on both server and client (no Date.now/random), so there's
 * no hydration mismatch; cycling begins only after mount.
 */
export default function HeroSlideshow({
  images,
  sizes,
  interval = 4000,
  startDelay = 0,
  priority = false,
  alt = 'Distinguished Scholars Academy student',
}: {
  images: string[]
  sizes: string
  interval?: number
  startDelay?: number
  priority?: boolean
  alt?: string
}) {
  const [idx, setIdx] = useState(0)

  useEffect(() => {
    if (images.length <= 1) return
    let intervalId: ReturnType<typeof setInterval> | undefined
    const startId = setTimeout(() => {
      intervalId = setInterval(
        () => setIdx((i) => (i + 1) % images.length),
        interval,
      )
    }, startDelay)
    return () => {
      clearTimeout(startId)
      if (intervalId) clearInterval(intervalId)
    }
  }, [images.length, interval, startDelay])

  // Keep the previous image fully opaque underneath while the new one fades in
  // on top — otherwise both are semi-transparent mid-fade and the yellow card
  // behind shows through. Cycling is sequential, so prev is always idx-1.
  const prev = (idx - 1 + images.length) % images.length

  return (
    <>
      {images.map((src, i) => {
        const layer =
          i === idx
            ? 'opacity-100 z-20'
            : i === prev
              ? 'opacity-100 z-10'
              : 'opacity-0 z-0'
        return (
          <Image
            key={src}
            src={src}
            alt={alt}
            fill
            sizes={sizes}
            priority={priority && i === 0}
            className={`object-cover transition-opacity duration-1000 ease-in-out ${layer}`}
          />
        )
      })}
    </>
  )
}
