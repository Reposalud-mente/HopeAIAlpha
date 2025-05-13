/**
 * Demo Mode Middleware
 * 
 * This middleware checks if a user needs demo data when they access protected routes.
 * If they do, it redirects them to the dashboard with a query parameter to trigger the demo data population.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAuth0Session } from './src/lib/auth/auth0-wrapper';
import { prisma } from './src/lib/prisma';

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
        createdById: userId,
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
  const session = await getAuth0Session(request);

  // If no session, let the auth middleware handle it
  if (!session?.user) {
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
    const userId = session.user.sub;

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
