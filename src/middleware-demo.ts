/**
 * Demo Mode Middleware
 *
 * This middleware checks if a user needs demo data when they access protected routes.
 * If they do, it redirects them to the dashboard with a query parameter to trigger the demo data population.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { prisma } from '@/lib/prisma';

/**
 * Check if a user needs demo data
 *
 * @param userId The ID of the user to check
 * @returns True if the user needs demo data, false otherwise
 */
async function userNeedsDemoData(userId: string): Promise<boolean> {
  try {
    // Check if the user has any patients
    const patientCount = await prisma.patient.count({
      where: {
        primaryProviderId: userId,
      },
    });

    return patientCount === 0;
  } catch (error) {
    console.error('Error checking if user needs demo data in middleware:', error);
    return false;
  }
}

/**
 * Middleware function to handle demo data population
 *
 * @param request The incoming request
 * @returns The response or undefined to continue
 */
export async function middleware(request: NextRequest) {
  // Skip middleware for auth routes, API routes, and public routes
  if (
    request.nextUrl.pathname.startsWith('/api') ||
    request.nextUrl.pathname.startsWith('/auth') ||
    request.nextUrl.pathname === '/login' ||
    request.nextUrl.pathname === '/' ||
    request.nextUrl.pathname.includes('_next') ||
    request.nextUrl.pathname.includes('favicon.ico')
  ) {
    return NextResponse.next();
  }

  // For protected routes, check if the user is authenticated
  // Create a Supabase client using the request cookies
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set() {}, // No-op for read-only operations
        remove() {}, // No-op for read-only operations
      },
    }
  );

  // Get the user from the session
  const { data: { user }, error } = await supabase.auth.getUser();

  // If no user, let the auth middleware handle it
  if (error || !user) {
    return NextResponse.next();
  }

  // If the user is authenticated and accessing the dashboard, check if they need demo data
  if (request.nextUrl.pathname === '/dashboard') {
    // Check if the request already has the needsDemoData parameter
    const searchParams = new URL(request.url).searchParams;
    if (searchParams.has('needsDemoData')) {
      return NextResponse.next();
    }

    // Get the user ID from the session
    const userId = user.id;

    // Check if the user needs demo data
    const needsDemoData = await userNeedsDemoData(userId);

    // If the user needs demo data, redirect to the dashboard with a query parameter
    if (needsDemoData) {
      const url = new URL(request.url);
      url.searchParams.set('needsDemoData', 'true');
      return NextResponse.redirect(url);
    }
  }

  // Continue with the request
  return NextResponse.next();
}

// Configure the middleware to run on specific routes
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     */
    '/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
  ],
};
