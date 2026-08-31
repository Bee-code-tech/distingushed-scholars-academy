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
  'Jambite/Aspirant',
  '100 Level',
  '200 Level',
] as const

export const LEARNING_MODES = ['Online', 'Physical'] as const

// Step 3 — programmes a student can enrol in (multi-select).
export const PROGRAMMES = [
  'Summer Classes',
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
 * Map the chosen programmes onto the dashboard track. Every programme maps to a
 * track now — exam tracks (jamb | waec | postutme) and programme tracks
 * (undergrad | preclinical | afterschool). A student can multi-select, so this
 * resolves by priority: the exam programmes (which have hard deadlines) win over
 * the general programmes.
 *
 *   Post-UTME Tutorials      → postutme
 *   JAMB Tutorials           → jamb
 *   WAEC Tutorials           → waec
 *   Preclinical Tutorials    → preclinical
 *   A(100) Level Tutorials   → undergrad
 *   After-School / Summer    → afterschool
 */
export function deriveTrackFromProgrammes(programmes: string[]): string {
  const has = (s: string) => programmes.some((p) => p.toLowerCase().includes(s))
  // JAMB is checked BEFORE Post-UTME: a JAMB candidate commonly enrols for both
  // (JAMB now, Post-UTME after results), and JAMB is their current focus. A
  // Post-UTME-only student (already sat JAMB) selects just Post-UTME.
  if (has('jamb')) return 'jamb'
  if (has('post-utme') || has('post utme')) return 'postutme'
  if (has('waec')) return 'waec'
  if (has('preclinic')) return 'preclinical'
  if (has('100') || has('200') || has('level tutorial') || has('undergrad'))
    return 'undergrad'
  if (has('after') || has('summer')) return 'afterschool'
  return 'jamb'
}

/** Build a backend username from an email when the form doesn't ask for one. */
export function usernameFromEmail(email: string): string {
  const base = (email.split('@')[0] || 'student')
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, '')
  return base.length >= 3 ? base : `student_${base}`
}
