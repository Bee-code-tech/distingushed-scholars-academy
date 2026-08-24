'use client'

import Community from '@/components/dashboard/Community'

// The student-facing community. Uses the shared channel component in student
// mode (text, photo, video and document — no voice notes). Rendered both as the
// /dashboard/community route and inside the dashboard's Community tab.
export default function CommunityView() {
  return <Community mode='student' />
}
