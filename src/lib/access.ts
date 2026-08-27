// Access / entitlements — the 3-level model (see docs/payment-plan.md).
//
//   free     — account created, no payment
//   portal   — paid the ₦2,000 portal-access fee
//   tutorial — active tutorial student (paid tutorial fee, until expiry)
//
// BETA: `PAYWALL_ENABLED` is OFF, so every gate below returns "allowed" and the
// whole portal stays open while people test. Flip it on at launch to enforce.

import type { User } from './types'

export type AccessLevel = 'free' | 'portal' | 'tutorial'
export type GatedFeature =
  | 'community'
  | 'assignments'
  | 'liveClasses'
  | 'tests'
  | 'materials'

/**
 * Master paywall switch. OFF during beta so nothing is blocked. Turn on with
 * NEXT_PUBLIC_PAYWALL_ENABLED=true at launch.
 */
export const PAYWALL_ENABLED =
  process.env.NEXT_PUBLIC_PAYWALL_ENABLED === 'true'

/** Admin-editable caps for how much L1/L2 can access (L3 is unlimited). */
export interface AccessCaps {
  freeTests: number
  freeMaterials: number
  freeLiveClasses: number
  portalTests: number
  portalMaterials: number
  portalLiveClasses: number
}

export const DEFAULT_CAPS: AccessCaps = {
  freeTests: 3,
  freeMaterials: 5,
  freeLiveClasses: 5,
  portalTests: 10,
  portalMaterials: 20,
  portalLiveClasses: 10,
}

/** Resolve the effective level, honouring tutorial expiry (revert to Free). */
export function accessLevel(user?: Partial<User> | null): AccessLevel {
  if (!user) return 'free'
  if (user.accessEnabled === false) return 'free' // admin disabled → treat as free
  const lvl = user.accessLevel
  if (lvl === 'tutorial') {
    if (user.tutorialExpiry && new Date(user.tutorialExpiry).getTime() < Date.now())
      return 'free' // expired → revert to Free (L1)
    return 'tutorial'
  }
  if (lvl === 'portal') return 'portal'
  return 'free'
}

const LEVEL_RANK: Record<AccessLevel, number> = {
  free: 0,
  portal: 1,
  tutorial: 2,
}

/**
 * Whether a feature is available. Community needs L2+, Assignments need L3.
 * Count-limited features (tests/materials/live classes) are "available" here —
 * their per-level caps are checked with `capFor`. Always true while the paywall
 * is off.
 */
export function canAccess(
  feature: GatedFeature,
  user?: Partial<User> | null,
): boolean {
  if (!PAYWALL_ENABLED) return true
  const rank = LEVEL_RANK[accessLevel(user)]
  switch (feature) {
    case 'community':
      return rank >= LEVEL_RANK.portal
    case 'assignments':
      return rank >= LEVEL_RANK.tutorial
    default:
      return true // count-limited via capFor
  }
}

/** The cap for a count-limited feature at the user's level (Infinity = unlimited). */
export function capFor(
  feature: 'tests' | 'materials' | 'liveClasses',
  user?: Partial<User> | null,
  caps: AccessCaps = DEFAULT_CAPS,
): number {
  if (!PAYWALL_ENABLED) return Infinity
  const lvl = accessLevel(user)
  if (lvl === 'tutorial') return Infinity
  if (lvl === 'portal')
    return feature === 'tests'
      ? caps.portalTests
      : feature === 'materials'
        ? caps.portalMaterials
        : caps.portalLiveClasses
  return feature === 'tests'
    ? caps.freeTests
    : feature === 'materials'
      ? caps.freeMaterials
      : caps.freeLiveClasses
}

export const LEVEL_LABEL: Record<AccessLevel, string> = {
  free: 'Free',
  portal: 'Portal Access',
  tutorial: 'Tutorial Student',
}
