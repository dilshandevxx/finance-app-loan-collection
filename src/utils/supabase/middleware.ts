import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const agentSession = request.cookies.get('agent_session')?.value
  const pathname = request.nextUrl.pathname

  const isPwaFile =
    pathname === '/manifest.webmanifest' ||
    pathname === '/sw.js' ||
    pathname.startsWith('/workbox-') ||
    pathname.startsWith('/swe-worker-')

  if (isPwaFile) return supabaseResponse;

  const isPublicRoute = 
    pathname === '/welcome' || 
    pathname === '/login/auth' || 
    pathname === '/login/forgot-password' || 
    pathname === '/login/reset-password'

  // 1. Not logged into Supabase -> Redirect to /welcome if not on a public route
  if (!user && !isPublicRoute) {
    const url = request.nextUrl.clone()
    url.pathname = '/welcome'
    return NextResponse.redirect(url)
  }

  // 2. Logged into Supabase, but no PIN session -> Must go to PIN Login
  if (user && !agentSession && pathname !== '/login/pin') {
    const url = request.nextUrl.clone()
    url.pathname = '/login/pin'
    return NextResponse.redirect(url)
  }

  // 3. Fully logged in (Auth + PIN) -> Redirect away from login pages and welcome to home
  if (user && agentSession && (pathname.startsWith('/login') || pathname === '/welcome')) {
    const url = request.nextUrl.clone()
    url.pathname = '/'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}
