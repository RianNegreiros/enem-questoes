import { withAuth } from '@kinde-oss/kinde-auth-nextjs/middleware'
import { NextRequest, NextResponse } from 'next/server'

export default function middleware(req: NextRequest) {
  // Only apply authentication to /history route
  if (req.nextUrl.pathname === '/history') {
    return withAuth(req)
  }

  // All other routes pass through without authentication
  return NextResponse.next()
}

export const config = {
  // Only apply middleware to routes we want to handle
  matcher: ['/history'],
}
