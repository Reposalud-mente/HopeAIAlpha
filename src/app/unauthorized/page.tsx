/**
 * Unauthorized Page
 * 
 * This page is displayed when a user tries to access a page they don't have permission to view.
 * It provides a link to go back to the dashboard.
 */

import { Metadata } from 'next';
import Link from 'next/link';

// Define metadata for the page
export const metadata: Metadata = {
  title: 'Unauthorized | HopeAI Clinical Platform',
  description: 'You do not have permission to access this page',
};

/**
 * Unauthorized page component
 * @returns The unauthorized page
 */
export default function UnauthorizedPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 text-center">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-gray-900">
            Unauthorized
          </h1>
          <p className="mt-2 text-lg text-gray-600">
            You do not have permission to access this page
          </p>
        </div>
        
        <div className="mt-6">
          <Link
            href="/dashboard"
            className="inline-flex items-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Go to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
