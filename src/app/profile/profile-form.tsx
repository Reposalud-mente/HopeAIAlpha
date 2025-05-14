/**
 * Profile Form Component
 * 
 * This component provides a form for users to update their profile information.
 * It includes fields for name, email, license number, and specialty.
 */

'use client';

import { useState } from 'react';
import { User } from '@prisma/client';

interface ProfileFormProps {
  user: User;
}

/**
 * Profile form component
 * @param props The component props
 * @returns The profile form
 */
export default function ProfileForm({ user }: ProfileFormProps) {
  const [formData, setFormData] = useState({
    firstName: user.firstName,
    lastName: user.lastName,
    licenseNumber: user.licenseNumber || '',
    specialty: user.specialty || '',
  });
  
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  /**
   * Handle form input changes
   * @param e The input event
   */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  
  /**
   * Handle form submission
   * @param e The form event
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    
    try {
      // Submit profile update to API
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Profile update failed');
      }
      
      // Show success message
      setSuccessMessage('Profile updated successfully');
      
      // Clear success message after a delay
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    } catch (error) {
      console.error('Profile update error:', error);
      setError(error instanceof Error ? error.message : 'An error occurred during profile update');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="px-4 py-5 sm:p-6">
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
        <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
          <div>
            <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
              First name
            </label>
            <div className="mt-1">
              <input
                id="firstName"
                name="firstName"
                type="text"
                autoComplete="given-name"
                required
                value={formData.firstName}
                onChange={handleChange}
                className="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
              />
            </div>
          </div>
          
          <div>
            <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
              Last name
            </label>
            <div className="mt-1">
              <input
                id="lastName"
                name="lastName"
                type="text"
                autoComplete="family-name"
                required
                value={formData.lastName}
                onChange={handleChange}
                className="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
              />
            </div>
          </div>
        </div>
        
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
              disabled
              value={user.email}
              className="block w-full appearance-none rounded-md border border-gray-300 bg-gray-100 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
            />
          </div>
          <p className="mt-1 text-xs text-gray-500">
            Email cannot be changed. Contact support if you need to update your email.
          </p>
        </div>
        
        <div>
          <label htmlFor="licenseNumber" className="block text-sm font-medium text-gray-700">
            License number
          </label>
          <div className="mt-1">
            <input
              id="licenseNumber"
              name="licenseNumber"
              type="text"
              value={formData.licenseNumber}
              onChange={handleChange}
              className="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
            />
          </div>
        </div>
        
        <div>
          <label htmlFor="specialty" className="block text-sm font-medium text-gray-700">
            Specialty
          </label>
          <div className="mt-1">
            <input
              id="specialty"
              name="specialty"
              type="text"
              value={formData.specialty}
              onChange={handleChange}
              className="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
            />
          </div>
        </div>
        
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isLoading}
            className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {isLoading ? 'Saving...' : 'Save changes'}
          </button>
        </div>
      </form>
    </div>
  );
}
