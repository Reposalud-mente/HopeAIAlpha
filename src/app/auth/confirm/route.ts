/**
 * Email Confirmation Route Handler
 *
 * This file handles email confirmation for new users.
 * It verifies the email confirmation token and redirects the user.
 */

import { type EmailOtpType } from '@supabase/supabase-js';
import { type NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { logAuditEvent } from '@/lib/audit-log';

/**
 * Handle GET requests for email confirmation
 * @param request The incoming request
 * @returns The response
 */
export async function GET(request: NextRequest) {
  try {
    // Get the token and confirmation type from the URL
    const { searchParams } = new URL(request.url);
    const token_hash = searchParams.get('token_hash');
    const type = searchParams.get('type') as EmailOtpType | null;
    // 'next' can be used to redirect to a specific page after confirmation
    const next = searchParams.get('next') ?? '/dashboard';

    // Ensure the 'next' path is relative and safe
    const redirectTo = new URL(next.startsWith('/') ? next : `/${next}`, request.url);

    if (token_hash && type) {
      const supabase = await createClient();
      const { error, data } = await supabase.auth.verifyOtp({
        type,
        token_hash,
      });

      if (!error) {
        // OTP verified successfully. The user is now authenticated, and the session is set in cookies
        // by the server client.

        // Log the successful email confirmation
        try {
          const { data: { user } } = await supabase.auth.getUser();
          await logAuditEvent({
            userId: user?.id || 'anonymous',
            action: 'EMAIL_CONFIRMED',
            entityType: 'User',
            entityId: user?.id || 'anonymous',
            details: { type },
          });
        } catch (logError) {
          console.error('Error logging email confirmation:', logError);
        }

        return NextResponse.redirect(redirectTo);
      }

      console.error('Error verifying OTP:', error.message);
      // It's good practice to inform the user about the error
      const errorPageUrl = new URL('/auth/error', request.url);
      errorPageUrl.searchParams.set('message', 'Link expired or invalid. Please try again.');
      return NextResponse.redirect(errorPageUrl);
    }

    // If token_hash or type is missing, redirect to an error page
    const errorPageUrl = new URL('/auth/error', request.url);
    errorPageUrl.searchParams.set('message', 'Invalid confirmation link.');
    return NextResponse.redirect(errorPageUrl);
  } catch (error) {
    console.error('Email confirmation error:', error);
    const errorPageUrl = new URL('/auth/error', request.url);
    errorPageUrl.searchParams.set('message', 'Error processing confirmation.');
    return NextResponse.redirect(errorPageUrl);
  }
}
