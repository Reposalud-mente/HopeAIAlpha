'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import AuthMessage from './AuthMessage';

interface AuthFormProps {
  children: React.ReactNode;
  title: string;
  description?: string;
  onSubmitAction: (formData: FormData) => Promise<any>;
  submitButtonText: string;
  errorMessage?: string;
  successMessage?: string;
  isPending: boolean;
  footer?: React.ReactNode;
}

/**
 * Consistent form wrapper for authentication forms
 * 
 * @param children - Form fields to display
 * @param title - Form title
 * @param description - Optional form description
 * @param onSubmitAction - Server action to call on form submission
 * @param submitButtonText - Text to display on the submit button
 * @param errorMessage - Optional error message to display
 * @param successMessage - Optional success message to display
 * @param isPending - Whether the form is currently submitting
 * @param footer - Optional footer content (e.g., links to other auth pages)
 */
export default function AuthForm({
  children,
  title,
  description,
  onSubmitAction,
  submitButtonText,
  errorMessage,
  successMessage,
  isPending,
  footer,
}: AuthFormProps) {
  return (
    <>
      <div className="text-center">
        <h1 className="text-2xl font-bold">{title}</h1>
        {description && (
          <p className="mt-2 text-sm text-gray-600">
            {description}
          </p>
        )}
      </div>

      {successMessage && (
        <AuthMessage type="success" message={successMessage} />
      )}

      {errorMessage && (
        <AuthMessage type="error" message={errorMessage} />
      )}

      <form action={onSubmitAction} className="mt-8 space-y-6">
        <div className="space-y-4">
          {children}
        </div>

        <div>
          <Button
            type="submit"
            disabled={isPending}
            className="w-full"
          >
            {isPending ? 'Procesando...' : submitButtonText}
          </Button>
        </div>

        {footer && (
          <div className="text-center text-sm">
            {footer}
          </div>
        )}
      </form>
    </>
  );
}
