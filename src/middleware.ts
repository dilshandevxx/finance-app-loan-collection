import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const session = request.cookies.get('agent_session')?.value
  const isLoginPage = request.nextUrl.pathname === '/login'

  // If the user is not authenticated and is not already on the login page, redirect to login
  if (!session && !isLoginPage) {
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
