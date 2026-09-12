import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const PUBLIC_PREFIXES = [
  '/auth',
  '/v/',
  '/api/v1/verify',
  '/api/v1/demo',
  '/site.webmanifest',
  '/favicon',
  '/apple-touch-icon',
  '/android-chrome',
]

function isPublicRoute(pathname: string) {
  if (pathname === '/site.webmanifest' || pathname === '/favicon.ico') return true
  return PUBLIC_PREFIXES.some((p) => pathname.startsWith(p))
}

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request })

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    // If Supabase is not configured yet, allow pass-through
    return response
  }

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
        response = NextResponse.next({ request })
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        )
      },
    },
  })

  const {
    data: { user },
  } = await supabase.auth.getUser()

  /* Redirect unauthenticated users away from protected routes */
  if (!user && !isPublicRoute(request.nextUrl.pathname)) {
    const loginUrl = new URL('/auth/login', request.url)
    loginUrl.searchParams.set('next', request.nextUrl.pathname)
    return NextResponse.redirect(loginUrl)
  }

  /* Redirect authenticated users away from auth pages */
  if (user && (request.nextUrl.pathname.startsWith('/auth/login') || request.nextUrl.pathname.startsWith('/auth/sign-up'))) {
    const nextParam = request.nextUrl.searchParams.get('next')
    const redirectUrl = nextParam && nextParam.startsWith('/') ? nextParam : '/'
    return NextResponse.redirect(new URL(redirectUrl, request.url))
  }

  return response
}
