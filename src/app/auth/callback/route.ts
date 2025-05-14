import { createClient } from '@/utils/supabase/server';
import { NextResponse, type NextRequest } from 'next/server';
import { type EmailOtpType } from '@supabase/supabase-js';

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code'); // For OAuth flow
  const token_hash = searchParams.get('token_hash'); // For email OTP flow
  const type = searchParams.get('type') as EmailOtpType | null; // For email OTP flow
  const next = searchParams.get('next') ?? '/dashboard'; // Default redirect path

  const supabase = await createClient();

  if (code) { // Handling OAuth callback
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      // Session is set by server client, redirect to the desired page
      return NextResponse.redirect(`${origin}${next}`);
    }
    console.error('OAuth Code Exchange Error:', error.message);
    // Redirect to an error page or show an error message
    return NextResponse.redirect(`${origin}/auth/error?message=OAuth_failed`);
  } else if (token_hash && type) { // Handling Email OTP callback
    const { error } = await supabase.auth.verifyOtp({ type, token_hash });
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
    console.error('Email OTP Verification Error:', error.message);
    return NextResponse.redirect(`${origin}/auth/error?message=Email_OTP_verification_failed`);
  }

  // If neither 'code' nor 'token_hash' is present, or if 'type' is missing for OTP
  console.warn('Callback received without code or valid OTP parameters.');
  return NextResponse.redirect(`${origin}/auth/error?message=Invalid_callback_parameters`);
}
