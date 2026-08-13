// import { NextResponse } from 'next/server'
// import type { NextRequest } from 'next/server'

// export function middleware(request: NextRequest) {
//   const isAdminLoggedIn = request.cookies.get('admin_token')

//   // 1. Check if the user is trying to access an admin route
//   if (request.nextUrl.pathname.startsWith('/admin')) {
//     // 2. If they aren't logged in, redirect them
//     if (!isAdminLoggedIn) {
//       return NextResponse.redirect(new URL('/adminLogin', request.url))
//     }
//   }

//   // 3. CRITICAL: Allow all other requests to proceed
//   return NextResponse.next()
// }

// // 4. OPTIONAL BUT RECOMMENDED: Use a matcher to improve performance
// export const config = {
//   matcher: '/admin/:path*',
// }

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Roles permitted to view admin screens
const ALLOWED_ADMIN_ROLES = ['admin', 'super_admin', 'tutor', 'staff']

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Check if pathname starts with /admin (excluding login pages)
  const isAdminRoute =
    pathname.startsWith('/admin') &&
    !pathname.startsWith('/adminLogin') &&
    !pathname.startsWith('/adminForgetPassword')

  if (isAdminRoute) {
    const adminToken = request.cookies.get('admin_token')?.value
    const rawRole = request.cookies.get('admin_role')?.value

    // 1. If not logged in, redirect to login page
    if (!adminToken) {
      const loginUrl = new URL('/adminLogin', request.url)
      loginUrl.searchParams.set('from', pathname)
      return NextResponse.redirect(loginUrl)
    }

    // Sanitize role: strip quotes, trim whitespace, and lowercase
    const adminRole = rawRole
      ? rawRole.replace(/['"]/g, '').trim().toLowerCase()
      : null

    // Debug log for development (Check your server terminal)
    if (process.env.NODE_ENV === 'development') {
      console.log(
        `[Middleware] Path: ${pathname} | Token present: ${!!adminToken} | Role: "${adminRole}"`,
      )
    }

    // 2. If cookie contains a role and it's invalid, redirect to unauthorized
    if (adminRole && !ALLOWED_ADMIN_ROLES.includes(adminRole)) {
      console.warn(
        `[Middleware] Access denied for role: "${adminRole}" on ${pathname}`,
      )
      return NextResponse.redirect(new URL('/unauthorized', request.url))
    }
  }

  return NextResponse.next()
}

// Captures /admin AND /admin/* sub-routes
export const config = {
  matcher: ['/admin', '/admin/:path*'],
}