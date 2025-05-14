/**
 * Password Reset Route Handler
 * 
 * This file handles password reset requests using Supabase Auth.
 * It sends a password reset email to the user.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { logAuditEvent } from '@/lib/audit-log';

/**
 * Handle POST requests for password reset
 * @param request The incoming request
 * @returns The response
 */
export async function POST(request: NextRequest) {
  try {
    // Parse the request body
    const body = await request.json();
    
    // Validate required fields
    if (!body.email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }
    
    const supabase = createClient();
    
    // Send password reset email via Supabase
    const { error } = await supabase.auth.resetPasswordForEmail(body.email, {
      redirectTo: `${new URL(request.url).origin}/auth/update-password`,
    });
    
    if (error) {
      console.error('Password reset error:', error.message);
      
      return NextResponse.json(
        { error: 'Failed to send password reset email' },
        { status: 500 }
      );
    }
    
    // Log the password reset request (without user ID for privacy)
    try {
      await logAuditEvent({
        userId: 'anonymous', // Don't store the actual user ID for privacy
        action: 'PASSWORD_RESET_REQUEST',
        entityType: 'User',
        entityId: 'anonymous',
        details: { email: body.email },
      });
    } catch (logError) {
      console.error('Error logging password reset request:', logError);
    }
    
    // Return success response
    return NextResponse.json({
      message: 'Password reset email sent successfully',
    });
  } catch (error) {
    console.error('Password reset error:', error);
    return NextResponse.json(
      { error: 'Password reset failed', details: String(error) },
      { status: 500 }
    );
  }
}
