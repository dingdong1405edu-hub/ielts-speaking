import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'

export default auth((req) => {
  const { nextUrl } = req
  const isLoggedIn = !!req.auth

  const isAuthRoute =
    nextUrl.pathname === '/login' || nextUrl.pathname === '/register'
  const isApiRoute = nextUrl.pathname.startsWith('/api/')
  const isPublicRoute = nextUrl.pathname === '/'

  if (isApiRoute) return NextResponse.next()

  if (isAuthRoute) {
    if (isLoggedIn)
      return NextResponse.redirect(new URL('/dashboard', nextUrl))
    return NextResponse.next()
  }

  if (isPublicRoute) return NextResponse.next()

  if (!isLoggedIn) {
    const callbackUrl = encodeURIComponent(nextUrl.pathname)
    return NextResponse.redirect(
      new URL(`/login?callbackUrl=${callbackUrl}`, nextUrl)
    )
  }

  return NextResponse.next()
})

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|fonts|images|.*\\.png$).*)'],
}
