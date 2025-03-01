import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function middleware(request: NextRequest) {
  // Skip middleware for API routes, especially auth routes
  if (request.nextUrl.pathname.startsWith('/api')) {
    return NextResponse.next();
  }
  
  const token = await getToken({ req: request })
  
  // List of routes that require authentication
  const protectedRoutes = [
    '/patients',
    '/dashboard',
    '/reports',
    '/informes'
  ]
  
  // Allow the landing page, login, register, and demo pages to be accessible without login
  const publicRoutes = [
    '/',
    '/login',
    '/register',
    '/demo'
  ]
  
  // Check if the request path starts with any of the protected routes
  const isProtectedRoute = protectedRoutes.some(route => 
    request.nextUrl.pathname.startsWith(route)
  )
  
  // Check if the request path matches any of the public routes exactly or is a subpage of a public route
  const isPublicRoute = publicRoutes.some(route => 
    request.nextUrl.pathname === route || 
    (route !== '/' && request.nextUrl.pathname.startsWith(route))
  )
  
  // If it's a protected route and user is not authenticated, redirect to login
  if (isProtectedRoute && !token) {
    return NextResponse.redirect(new URL('/login', request.url))
  }
  
  // Otherwise, proceed normally
  return NextResponse.next()
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
} 