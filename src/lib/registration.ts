// Data + helpers for the multi-step student registration.
//
// The programme taxonomy the academy uses:
//   Summer Lesson  → SS1, SS2
//   O'level        → WAEC, JAMB, Post-UTME
//   Undergraduate  → 100 Level, 200 Level

export const GENDERS = ['Male', 'Female'] as const

export const CLASS_LEVELS = [
  'SS1',
  'SS2',
  'SS3',
  '100 Level',
  '200 Level',
] as const

export const LEARNING_MODES = ['Online', 'Physical'] as const

// Step 3 — programmes a student can enrol in (multi-select).
export const PROGRAMMES = [
  'After-School Classes',
  'WAEC Tutorials',
  'JAMB Tutorials',
  'Post-UTME Tutorials',
  'A(100) Level Tutorials',
  'Preclinical Tutorials',
] as const

export const NIGERIAN_STATES = [
  'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa', 'Benue',
  'Borno', 'Cross River', 'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu',
  'FCT - Abuja', 'Gombe', 'Imo', 'Jigawa', 'Kaduna', 'Kano', 'Katsina',
  'Kebbi', 'Kogi', 'Kwara', 'Lagos', 'Nasarawa', 'Niger', 'Ogun', 'Ondo',
  'Osun', 'Oyo', 'Plateau', 'Rivers', 'Sokoto', 'Taraba', 'Yobe', 'Zamfara',
] as const

/** The portal-access fee charged once at registration (Naira). */
export const PORTAL_ACCESS_FEE = 2000

/**
 * Map the chosen programmes onto the exam track the dashboard understands
 * (jamb | waec | postutme). Post-UTME is checked first so a student who picked
 * both JAMB and Post-UTME tutorials lands on Post-UTME. Best-effort by priority.
 */
export function deriveTrackFromProgrammes(programmes: string[]): string {
  const has = (s: string) => programmes.some((p) => p.toLowerCase().includes(s))
  if (has('post-utme') || has('post utme')) return 'postutme'
  if (has('waec')) return 'waec'
  if (has('jamb')) return 'jamb'
  return 'jamb'
}

/** Build a backend username from an email when the form doesn't ask for one. */
export function usernameFromEmail(email: string): string {
  const base = (email.split('@')[0] || 'student')
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, '')
  return base.length >= 3 ? base : `student_${base}`
}
