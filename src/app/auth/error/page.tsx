'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function AuthErrorPage() {
  const searchParams = useSearchParams();
  const message = searchParams.get('message') || 'An authentication error occurred';

  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-2">
      <div className="w-full max-w-md space-y-8 rounded-lg border p-6 shadow-md">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Authentication Error</h1>
          <div className="mt-4 rounded-md bg-red-50 p-4 text-sm text-red-700">
            {message}
          </div>
          <div className="mt-6">
            <Link
              href="/auth/login"
              className="inline-block rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Return to Login
            </Link>
          </div>
          <p className="mt-4 text-sm text-gray-600">
            If you continue to experience issues, please contact support.
          </p>
        </div>
      </div>
    </div>
  );
}
