'use client';

import { signUp } from '../actions';
import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function SignUpPage() {
  const router = useRouter();
  const [message, setMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isPending, startTransition] = useTransition();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    
    startTransition(async () => {
      const result = await signUp(formData);
      if (result?.error) {
        setErrorMessage(result.error);
        setMessage('');
      } else if (result?.message) {
        setMessage(result.message);
        setErrorMessage('');
        // Clear form on success
        event.currentTarget.reset();
      }
    });
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-2">
      <div className="w-full max-w-md space-y-8 rounded-lg border p-6 shadow-md">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Sign Up</h1>
          <p className="mt-2 text-sm text-gray-600">
            Create your account to get started
          </p>
        </div>

        {message && (
          <div className="rounded-md bg-green-50 p-4 text-sm text-green-700">
            {message}
          </div>
        )}

        {errorMessage && (
          <div className="rounded-md bg-red-50 p-4 text-sm text-red-700">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                disabled={isPending}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                disabled={isPending}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
              />
            </div>
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
                Full Name
              </label>
              <input
                id="fullName"
                name="fullName"
                type="text"
                disabled={isPending}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isPending}
              className="w-full rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-blue-300"
            >
              {isPending ? 'Signing Up...' : 'Sign Up'}
            </button>
          </div>

          <div className="text-center text-sm">
            <p>
              Already have an account?{' '}
              <Link href="/auth/login" className="text-blue-600 hover:text-blue-800">
                Log In
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
