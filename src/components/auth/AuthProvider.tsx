'use client';

import { ReactNode } from 'react';

interface AuthProviderProps {
  children: ReactNode;
}

/**
 * Auth0 Provider Component
 * 
 * This component wraps the application with the Auth0 UserProvider
 * to provide authentication context to all components.
 */
export function AuthProvider({ children }: AuthProviderProps) {
  // In version 4.5.1, we don't need to wrap with UserProvider
  // The Auth0 session is handled by the API routes
  return <>{children}</>;
}