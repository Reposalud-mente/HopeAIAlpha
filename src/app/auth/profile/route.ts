/**
 * Auth Profile Route
 * 
 * This route handler redirects to the API auth profile endpoint
 */
import { NextRequest } from 'next/server';

export async function GET(req: NextRequest) {
  // Redirect to the API auth profile endpoint
  return Response.redirect(new URL('/api/auth/profile', req.url));
}

export async function POST(req: NextRequest) {
  // Redirect to the API auth profile endpoint
  return Response.redirect(new URL('/api/auth/profile', req.url));
}
