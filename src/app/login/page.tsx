/**
 * Login Page Redirect
 * 
 * This page redirects users from the old login route to the new Supabase auth route.
 * It's a temporary solution to handle any bookmarked URLs or old links.
 */

import { redirect } from 'next/navigation';

/**
 * Login page redirect component
 * @returns Redirects to the new login page
 */
export default function LoginRedirect() {
  redirect('/auth/login');
}
