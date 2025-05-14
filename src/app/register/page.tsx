/**
 * Registration Page Redirect
 *
 * This page redirects users from the old registration route to the new Supabase auth route.
 * It's a temporary solution to handle any bookmarked URLs or old links.
 */

import { redirect } from 'next/navigation';

/**
 * Registration page redirect component
 * @returns Redirects to the new signup page
 */
export default function RegisterRedirect() {
  redirect('/auth/signup');
}
