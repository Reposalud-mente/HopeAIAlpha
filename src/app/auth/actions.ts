'use server';

import { createClient } from '@/utils/supabase/server';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';

/**
 * Sign up a new user with email and password
 * @param formData Form data containing email, password, and optional profile information
 * @returns Result object with success message or error
 */
export async function signUp(formData: FormData) {
  const origin = headers().get('origin');
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const fullName = formData.get('fullName') as string | null;

  // Basic validation
  if (!email || !password) {
    return { error: 'Email and password are required.' };
  }
  if (password.length < 6) {
    return { error: 'Password must be at least 6 characters.' };
  }

  const supabase = await createClient();

  const { error, data } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${origin}/auth/confirm`,
      data: {
        full_name: fullName,
      }
    },
  });

  if (error) {
    console.error('Sign up error:', error.message);
    return { error: `Could not authenticate user: ${error.message}` };
  }

  // On successful sign-up with email confirmation enabled,
  // the user is created but not yet authenticated.
  // They need to click the confirmation link in their email.
  return { message: 'Check your email to complete the sign-up process.' };
}

/**
 * Log in a user with email and password
 * @param formData Form data containing email and password
 * @returns Result object with success or error
 */
export async function login(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (!email || !password) {
    return { error: 'Email and password are required.' };
  }

  const supabase = await createClient();

  const { error, data } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    console.error('Login error:', error.message);
    return { error: `Login failed: ${error.message}` };
  }

  // Revalidate paths that might show different content based on auth state
  revalidatePath('/', 'layout');
  redirect('/dashboard');
}

/**
 * Sign out the current user
 */
export async function signOut() {
  const supabase = await createClient();
  const { error } = await supabase.auth.signOut();

  if (error) {
    console.error('Error signing out:', error.message);
    return { error: `Sign out failed: ${error.message}` };
  }

  // Revalidate all paths to ensure UI reflects logged-out state
  revalidatePath('/', 'layout');
  redirect('/auth/login?message=You have been logged out.');
}
