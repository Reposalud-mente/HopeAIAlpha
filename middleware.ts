/**
 * Authentication Middleware
 *
 * This middleware handles authentication for the application using Supabase.
 * It refreshes the session and protects routes.
 */
import { NextRequest, NextResponse } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { trackEvent, EventType } from './src/lib/monitoring';

// Helper function to check if a route should skip middleware
function skipMiddlewareForRoutes(pathname: string): boolean {
  return (
    pathname.startsWith('/api/') && pathname !== '/api/auth/callback' ||
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/static/') ||
    pathname === '/' ||
    pathname.includes('favicon.ico') ||
    pathname.includes('sitemap.xml') ||
    pathname.includes('robots.txt') ||
    /\.(.*?)$/.test(pathname) // Match files with extensions
  );
}

// Helper function to check if a route is public
function isPublicRoute(pathname: string): boolean {
  const publicRoutes = [
    '/about',
    '/contact',
    '/privacy',
    '/terms',
    '/unauthorized',
    '/error',
    '/auth/login',
    '/auth/signup',
    '/auth/confirm',
    '/auth/callback',
    '/auth/error',
  ];

  return publicRoutes.some(route => pathname === route || pathname.startsWith(`${route}/`));
}

// Helper function to check if a route is protected
function isProtectedRoute(pathname: string): boolean {
  const protectedPrefixes = [
    '/dashboard',
    '/patients',
    '/reports',
    '/settings',
    '/admin',
    '/profile',
  ];

  return protectedPrefixes.some(prefix => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

/**
 * Middleware function to handle authentication
 * @param request The incoming request
 * @returns The response or undefined to continue
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for certain routes
  if (skipMiddlewareForRoutes(pathname)) {
    return NextResponse.next();
  }

  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  // Create Supabase client for middleware
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          // If the cookie is set in the server client, update it in the request for the current lifecycle
          // and in the response to send it back to the browser.
          request.cookies.set({ name, value, ...options });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          // If the cookie is removed in the server client, update it in the request and response.
          request.cookies.set({ name, value: '', ...options });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.delete({ name, ...options });
        },
      },
    }
  );

  // If it's a public route, skip authentication check but still refresh session
  if (isPublicRoute(pathname)) {
    await supabase.auth.getUser();
    return response;
  }

  try {
    // Check if the request path starts with any of the protected routes
    if (isProtectedRoute(pathname)) {
      // Get the user from the session
      const { data: { user } } = await supabase.auth.getUser();

      // If user is not authenticated, redirect to login
      if (!user) {
        // Track the authentication redirect
        trackEvent({
          type: EventType.USER_ACTION,
          name: 'auth_redirect',
          data: {
            path: pathname,
            redirectTo: '/auth/login'
          }
        });

        // Store the original URL to redirect back after login
        const returnTo = encodeURIComponent(request.nextUrl.pathname);
        return NextResponse.redirect(new URL(`/auth/login?returnTo=${returnTo}`, request.url));
      }

      // User is authenticated, continue
      return response;
    }

    // Refresh session for all other routes
    await supabase.auth.getUser();
    return response;
  } catch (error) {
    console.error('Middleware error:', error);
    return response;
  }
}

/**
 * Configuration for the middleware
 * This defines which routes the middleware should run on
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     */
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};
