import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { auth } from '@kumpelapp/auth'

const ADMIN_ROUTES = ['/admin', '/api/v1/admin']
const PROTECTED_ROUTES = ['/profil', '/kumpels', '/tippspiel', '/wallet']

function isAdminRole(role: unknown): boolean {
  return role === 'EDITOR' || role === 'ADMIN'
}

export async function proxy(req: NextRequest) {
  const { nextUrl } = req
  const isAdminRoute = ADMIN_ROUTES.some((route) => nextUrl.pathname.startsWith(route))
  const isProtectedRoute = PROTECTED_ROUTES.some((route) => nextUrl.pathname.startsWith(route))

  if (isAdminRoute || isProtectedRoute) {
    const session = await auth.api.getSession({ headers: req.headers })
    const isLoggedIn = !!session

    if (isAdminRoute) {
      if (!isLoggedIn) {
        const loginUrl = new URL('/login', nextUrl)
        loginUrl.searchParams.set('callbackUrl', nextUrl.pathname)
        return NextResponse.redirect(loginUrl)
      }

      if (!isAdminRole(session?.user?.role)) {
        return NextResponse.redirect(new URL('/403', nextUrl))
      }
    }

    if (isProtectedRoute && !isLoggedIn) {
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