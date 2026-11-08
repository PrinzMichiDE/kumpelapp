import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const ADMIN_ROUTES = ['/admin', '/api/v1/admin']
const PROTECTED_ROUTES = ['/profil', '/kumpels', '/tippspiel', '/wallet']

function hasSessionCookie(req: NextRequest): boolean {
  const all = req.cookies.getAll()
  return all.some(({ name }) => {
    const n = name.startsWith('__Secure-') ? name.slice('__Secure-'.length) : name
    return n === 'better-auth.session_token' || n === 'better-auth-session_token'
  })
}

export function middleware(req: NextRequest) {
  const { nextUrl } = req
  const isAdminRoute = ADMIN_ROUTES.some((route) => nextUrl.pathname.startsWith(route))
  const isProtectedRoute = PROTECTED_ROUTES.some((route) => nextUrl.pathname.startsWith(route))

  if (isAdminRoute || isProtectedRoute) {
    const isLoggedIn = hasSessionCookie(req)

    if (!isLoggedIn) {
      const loginUrl = new URL('/login', nextUrl)
      loginUrl.searchParams.set('callbackUrl', nextUrl.pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  const response = NextResponse.next()

  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|robots.txt|manifest.json|brand|.*\\.png$).*)',
  ],
}
