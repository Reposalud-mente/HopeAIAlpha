/**
 * Password Reset Page
 * 
 * This page provides a form for users to reset their password.
 * It sends a password reset email to the user.
 */

import { Metadata } from 'next';
import Link from 'next/link';
import ResetPasswordForm from './reset-password-form';

// Define metadata for the page
export const metadata: Metadata = {
  title: 'Reset Password | HopeAI Clinical Platform',
  description: 'Reset your password for the HopeAI Clinical Platform',
};

/**
 * Password reset page component
 * @returns The password reset page
 */
export default function ResetPasswordPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Reset your password
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Enter your email address and we'll send you a link to reset your password
          </p>
        </div>
        
        <ResetPasswordForm />
        
        <div className="mt-6 text-center text-sm">
          <p className="text-gray-600">
            Remember your password?{' '}
            <Link href="/login" className="font-medium text-blue-600 hover:text-blue-500">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
