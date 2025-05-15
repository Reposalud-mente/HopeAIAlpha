'use client';

import { signOut } from '@/app/auth/actions';
import { useTransition } from 'react';

interface LogoutButtonProps {
  className?: string;
}

/**
 * Logout Button Component
 *
 * This component provides a button that triggers the signOut server action
 * to log the user out of their session.
 *
 * @param className Optional CSS class name for styling
 */
export default function LogoutButton({ className = '' }: LogoutButtonProps) {
  const [isPending, startTransition] = useTransition();

  const handleSignOut = async () => {
    startTransition(async () => {
      await signOut();
      // Redirect is handled by the server action
    });
  };

  return (
    <form action={handleSignOut}>
      <button
        type="submit"
        disabled={isPending}
        className={`rounded px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:bg-red-300 ${className}`}
      >
        {isPending ? 'Cerrando Sesión...' : 'Cerrar Sesión'}
      </button>
    </form>
  );
}
