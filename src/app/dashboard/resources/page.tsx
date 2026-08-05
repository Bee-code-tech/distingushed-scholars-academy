'use client'

import CourseMaterials from '@/components/dashboard/CourseMaterials'

// Student "Resources" view — now backed by the real course-materials store
// (tutor uploads show up here). Runs browser-local until the backend ships
// /courses + /materials (see docs/DSA-LMS-Backend-Spec.md §5). The `isDSAite`
// prop is kept for the caller's existing contract.
export default function ResourcesView(_props: { isDSAite?: boolean }) {
  return <CourseMaterials mode='student' />
}
