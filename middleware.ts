import { withAuth } from '@kinde-oss/kinde-auth-nextjs/middleware'
import { NextRequest, NextResponse } from 'next/server'

export default function middleware(req: NextRequest) {
  const publicPaths = ['/', '/api/(.*)']
  const isPublicPath = publicPaths.some(path => {
    if (path === '/') return req.nextUrl.pathname === '/'
    return new RegExp(`^${path}$`).test(req.nextUrl.pathname)
  })

  if (isPublicPath) {
    return NextResponse.next()
  }

  return withAuth(req)
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public directory
     */
    '/((?!api/auth|_next/static|_next/image|favicon.ico|public).*)',
  ],
}
