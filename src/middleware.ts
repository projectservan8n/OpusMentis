import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/api/webhooks(.*)',
])

export default clerkMiddleware({
  // PRODUCTION SECURITY: Prevent CSRF and subdomain cookie attacks
  // Update this to your production domain when deploying
  authorizedParties: process.env.NODE_ENV === 'production'
    ? ['https://opusmentis.app']
    : undefined
}, (auth, req) => {
  if (!isPublicRoute(req)) {
    auth().protect()
  }

  // Redirect authenticated users away from auth pages
  if (auth().userId && (req.nextUrl.pathname === '/sign-in' || req.nextUrl.pathname === '/sign-up')) {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }
})

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}