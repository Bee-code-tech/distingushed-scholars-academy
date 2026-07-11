import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const isAdminLoggedIn = request.cookies.get('admin_token')

  // 1. Check if the user is trying to access an admin route
  if (request.nextUrl.pathname.startsWith('/admin')) {
    // 2. If they aren't logged in, redirect them
    if (!isAdminLoggedIn) {
      return NextResponse.redirect(new URL('/adminLogin', request.url))
    }
  }

  // 3. CRITICAL: Allow all other requests to proceed
  return NextResponse.next()
}

// 4. OPTIONAL BUT RECOMMENDED: Use a matcher to improve performance
export const config = {
  matcher: '/admin/:path*',
}
