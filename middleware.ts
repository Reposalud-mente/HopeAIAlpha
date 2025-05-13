/**
 * Auth0 Middleware
 *
 * This middleware handles authentication for the application.
 * It uses the Auth0 client to protect routes and manage sessions.
 */
import { NextRequest, NextResponse } from 'next/server';
import { getAuth0Session } from './src/lib/auth/auth0-wrapper';

/**
 * Middleware function to handle authentication
 *
 * @param request The incoming request
 * @returns The response or undefined to continue
 */
export async function middleware(request: NextRequest) {
  // Skip middleware for auth routes to prevent infinite loops
  if (
    request.nextUrl.pathname.startsWith('/api/auth') ||
    request.nextUrl.pathname.startsWith('/auth') ||
    request.nextUrl.pathname === '/login' ||
    request.nextUrl.pathname === '/'
  ) {
    return NextResponse.next();
  }

  // For protected routes, check if the user is authenticated
  const session = await getAuth0Session(request);

  // If no session and not on a public route, redirect to login
  if (!session && request.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Continue with the request
  return NextResponse.next();
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
