/**
 * Error Page
 * 
 * This page is displayed when an error occurs during authentication or other processes.
 * It provides a link to go back to the dashboard or login page.
 */

import { Metadata } from 'next';
import Link from 'next/link';

// Define metadata for the page
export const metadata: Metadata = {
  title: 'Error | HopeAI Clinical Platform',
  description: 'An error occurred',
};

/**
 * Error page component
 * @returns The error page
 */
export default function ErrorPage({
  searchParams,
}: {
  searchParams: { message?: string };
}) {
  const message = searchParams.message || 'An error occurred';
  
  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 text-center">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-gray-900">
            Error
          </h1>
          <p className="mt-2 text-lg text-gray-600">
            {decodeURIComponent(message)}
          </p>
        </div>
        
        <div className="mt-6 space-x-4">
          <Link
            href="/dashboard"
            className="inline-flex items-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Go to Dashboard
          </Link>
          
          <Link
            href="/login"
            className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Go to Login
          </Link>
        </div>
      </div>
    </div>
  );
}
