/**
 * Password Reset Form Component
 * 
 * This component provides a form for users to reset their password.
 * It sends a password reset email to the user.
 */

'use client';

import { useState } from 'react';

/**
 * Password reset form component
 * @returns The password reset form
 */
export default function ResetPasswordForm() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  /**
   * Handle form submission
   * @param e The form event
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    
    try {
      // Submit password reset request to API
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Password reset failed');
      }
      
      // Show success message
      setSuccessMessage('Password reset email sent. Please check your inbox.');
      setEmail('');
    } catch (error) {
      console.error('Password reset error:', error);
      setError(error instanceof Error ? error.message : 'An error occurred during password reset');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
      <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
        {error && (
          <div className="mb-4 rounded-md bg-red-50 p-4">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{error}</p>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {successMessage && (
          <div className="mb-4 rounded-md bg-green-50 p-4">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-green-800">Success</h3>
                <div className="mt-2 text-sm text-green-700">
                  <p>{successMessage}</p>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email address
            </label>
            <div className="mt-1">
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
              />
            </div>
          </div>
          
          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="flex w-full justify-center rounded-md border border-transparent bg-blue-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
            >
              {isLoading ? 'Sending...' : 'Send reset link'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
