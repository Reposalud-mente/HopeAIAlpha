import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { trackEvent, EventType } from '@/lib/monitoring'

// Skip middleware for these routes
const skipMiddlewareForRoutes = (pathname: string) => {
  return (
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    pathname.includes('/auth/') ||
    pathname.includes('favicon.ico') ||
    pathname.includes('.svg') ||
    pathname.includes('.png') ||
    pathname.includes('.jpg') ||
    pathname.includes('.jpeg')
  );
};

// Public routes that don't require authentication
const publicRoutes = [
  '/',
  '/login',
  '/register',
  '/about',
  '/contact',
  '/privacy',
  '/terms'
];

// Protected routes that require authentication
const protectedRoutes = [
  '/patients',
  '/dashboard',
  '/reports',
  '/informes',
  '/profile',
  '/settings',
  '/calendar'
];

// Check if a route is public
const isPublicRoute = (pathname: string) => {
  return publicRoutes.some(route =>
    pathname === route ||
    (route !== '/' && pathname.startsWith(route))
  );
};

// Check if a route is protected
const isProtectedRoute = (pathname: string) => {
  return protectedRoutes.some(route =>
    pathname.startsWith(route)
  );
};

// Export the middleware function
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Skip middleware for certain routes
  if (skipMiddlewareForRoutes(pathname)) {
    return NextResponse.next();
  }
  
  // If it's a public route, skip authentication check
  if (isPublicRoute(pathname)) {
    return NextResponse.next();
  }
  
  // Check if the request path starts with any of the protected routes
  if (isProtectedRoute(pathname)) {
    // Check for auth cookie
    const authCookie = request.cookies.get('auth0.is.authenticated');
    
    // If user is not authenticated, redirect to login
    if (!authCookie || authCookie.value !== 'true') {
      // Track the authentication redirect
      trackEvent({
        type: EventType.USER_ACTION,
        name: 'auth_redirect',
        data: {
          path: pathname,
          redirectTo: '/api/auth/login'
        }
      });

      // Store the original URL to redirect back after login
      const returnTo = encodeURIComponent(pathname);
      return NextResponse.redirect(new URL(`/api/auth/login?returnTo=${returnTo}`, request.url));
    }
  }
  
  // Otherwise, proceed normally
  return NextResponse.next();
}

// Configure which paths should be processed by this middleware
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (Auth0 routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     */
    "/((?!api/auth|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
}