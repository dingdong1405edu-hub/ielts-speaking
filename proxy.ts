import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/**
 * Route prefixes that require an authenticated session.
 * Any request whose pathname starts with one of these values will be
 * redirected to /login if the user is not signed in.
 */
const PROTECTED_PREFIXES = [
  '/dashboard',
  '/practice',
  '/vocabulary',
  '/full-test',
  '/beginner',
] as const

/**
 * Returns true when the request pathname matches one of the protected route
 * prefixes.  The check is case-insensitive to be robust against browser
 * normalisation.
 */
function isProtectedRoute(pathname: string): boolean {
  const lower = pathname.toLowerCase()
  return PROTECTED_PREFIXES.some((prefix) => lower.startsWith(prefix))
}

/**
 * Next.js middleware — runs on every matching request before the page renders.
 *
 * Strategy:
 *  1. Use NextAuth v5's `auth()` helper to read the session from the JWT
 *     stored in the request cookies (zero database round-trips).
 *  2. If the route is protected AND there is no valid session, redirect to
 *     /login with the original URL as a `callbackUrl` query parameter so
 *     the user lands on the intended page after signing in.
 *  3. If the user is already authenticated and tries to visit /login or
 *     /register, redirect them to /dashboard.
 */
export default auth(function middleware(req: NextRequest & { auth: unknown }) {
  const { nextUrl } = req
  const session = (req as unknown as { auth: { user?: unknown } | null }).auth
  const isAuthenticated = !!session?.user

  // --- Guard: protect authenticated-only routes ---
  if (isProtectedRoute(nextUrl.pathname) && !isAuthenticated) {
    const loginUrl = new URL('/login', nextUrl.origin)
    loginUrl.searchParams.set('callbackUrl', nextUrl.pathname + nextUrl.search)
    return NextResponse.redirect(loginUrl)
  }

  // --- Convenience: redirect signed-in users away from auth pages ---
  if (
    isAuthenticated &&
    (nextUrl.pathname === '/login' || nextUrl.pathname === '/register')
  ) {
    return NextResponse.redirect(new URL('/dashboard', nextUrl.origin))
  }

  return NextResponse.next()
})

/**
 * Matcher configuration.
 *
 * Excludes:
 *  - Next.js internal routes (_next/*)
 *  - Static file extensions (images, fonts, icons, etc.)
 *  - Public API routes (/api/auth/* handled by NextAuth itself)
 *
 * Runs on:
 *  - All page routes including protected sections and auth pages
 */
export const config = {
  matcher: [
    /*
     * Match all request paths EXCEPT for:
     *  - _next/static  (static files)
     *  - _next/image   (image optimisation)
     *  - favicon.ico   (browser favicon)
     *  - Files with an extension (e.g. .png, .svg, .js, .css)
     */
    '/((?!_next/static|_next/image|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff2?|ttf|otf|eot|css|js|map)$).*)',
  ],
}
