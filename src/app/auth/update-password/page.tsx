'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';

export default function UpdatePasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isPending, startTransition] = useTransition();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Reset messages
    setMessage('');
    setError('');
    
    // Validate passwords
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    startTransition(async () => {
      try {
        const supabase = createClient();
        
        const { error } = await supabase.auth.updateUser({
          password,
        });
        
        if (error) {
          setError(error.message);
          return;
        }
        
        setMessage('Password updated successfully');
        
        // Redirect to login after a short delay
        setTimeout(() => {
          router.push('/auth/login?message=Your password has been updated. Please log in with your new password.');
        }, 2000);
      } catch (err) {
        console.error('Error updating password:', err);
        setError('An unexpected error occurred');
      }
    });
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-2">
      <div className="w-full max-w-md space-y-8 rounded-lg border p-6 shadow-md">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Update Password</h1>
          <p className="mt-2 text-sm text-gray-600">
            Enter your new password below
          </p>
        </div>

        {message && (
          <div className="rounded-md bg-green-50 p-4 text-sm text-green-700">
            {message}
          </div>
        )}

        {error && (
          <div className="rounded-md bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              New Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
              disabled={isPending}
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
              Confirm New Password
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
              disabled={isPending}
            />
          </div>

          <div>
            <button
              type="submit"
              disabled={isPending}
              className="w-full rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-blue-300"
            >
              {isPending ? 'Updating...' : 'Update Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
