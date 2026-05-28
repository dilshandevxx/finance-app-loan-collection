import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const session = request.cookies.get('agent_session')?.value
  const pathname = request.nextUrl.pathname
  const isLoginPage = pathname === '/login'

  // Exclude PWA and service worker files from authentication redirects
  const isPwaFile = 
    pathname === '/manifest.webmanifest' || 
    pathname === '/sw.js' || 
    pathname.startsWith('/workbox-') || 
    pathname.startsWith('/swe-worker-')

  // If the user is not authenticated and is not already on the login page/PWA files, redirect to login
  if (!session && !isLoginPage && !isPwaFile) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // If the user is authenticated and tries to access the login page, redirect to home
  if (session && isLoginPage) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return NextResponse.next()
}

export const config = {
  // Only run middleware on app routes, exclude static files, images, icons, and api routes
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|api|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}

