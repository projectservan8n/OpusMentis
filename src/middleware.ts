import { authMiddleware } from '@clerk/nextjs'
import type { NextRequest } from 'next/server'

export default authMiddleware({
  publicRoutes: [
    '/',
    '/api/webhooks(.*)',
    '/sign-in(.*)',
    '/sign-up(.*)',
  ],

  ignoredRoutes: [
    '/api/webhooks/clerk',
    '/api/webhooks/stripe',
  ],

  afterAuth(auth: any, req: NextRequest, evt: any) {
    // Redirect unauthenticated users to sign-in
    if (!auth.userId && !auth.isPublicRoute) {
      const signInUrl = new URL('/sign-in', req.url)
      signInUrl.searchParams.set('redirect_url', req.url)
      return Response.redirect(signInUrl)
    }

    // Redirect authenticated users away from auth pages
    if (auth.userId && (req.nextUrl.pathname === '/sign-in' || req.nextUrl.pathname === '/sign-up')) {
      return Response.redirect(new URL('/dashboard', req.url))
    }
  },
})

export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
}