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
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
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

  // 1. Not logged into Supabase -> Must go to Auth Login
  if (!user && pathname !== '/login/auth') {
    const url = request.nextUrl.clone()
    url.pathname = '/login/auth'
    return NextResponse.redirect(url)
  }

  // 2. Logged into Supabase, but no PIN session -> Must go to PIN Login
  if (user && !agentSession && pathname !== '/login/pin') {
    const url = request.nextUrl.clone()
    url.pathname = '/login/pin'
    return NextResponse.redirect(url)
  }

  // 3. Fully logged in (Auth + PIN) -> Redirect away from login pages to home
  if (user && agentSession && pathname.startsWith('/login')) {
    const url = request.nextUrl.clone()
    url.pathname = '/'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}
