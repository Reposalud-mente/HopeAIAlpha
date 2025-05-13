'use client';

import { ReactNode } from 'react';
import { useAuth, UserRole } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

type RoleGuardProps = {
  children: ReactNode;
  allowedRoles: UserRole[];
  fallback?: ReactNode;
};

/**
 * Role-based access control guard component
 * Only renders children if the current user has one of the allowed roles
 *
 * @param children - The content to render if the user has permission
 * @param allowedRoles - Array of roles that are allowed to access the content
 * @param fallback - Optional content to render if the user doesn't have permission
 */
export function RoleGuard({ children, allowedRoles, fallback }: RoleGuardProps) {
  const { user, isLoading, hasRole } = useAuth();
  const router = useRouter();

  // If still loading, show loading indicator
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // If not authenticated, redirect to login with return URL
  if (!user) {
    const returnTo = encodeURIComponent(window.location.pathname);
    router.push(`/api/auth/login?returnTo=${returnTo}`);
    return null;
  }

  // Check if user has any of the allowed roles
  if (!hasRole(allowedRoles)) {
    if (fallback) {
      return <>{fallback}</>;
    }

    // Redirect to dashboard with unauthorized message
    router.push('/dashboard?unauthorized=true');
    return null;
  }

  // User has required role, show children
  return <>{children}</>;
}

/**
 * Admin Guard - Only allows ADMIN users
 */
export function AdminGuard({ children, fallback }: Omit<RoleGuardProps, 'allowedRoles'>) {
  return (
    <RoleGuard allowedRoles={['ADMIN']} fallback={fallback}>
      {children}
    </RoleGuard>
  );
}

/**
 * Supervisor Guard - Allows SUPERVISOR and ADMIN users
 */
export function SupervisorGuard({ children, fallback }: Omit<RoleGuardProps, 'allowedRoles'>) {
  return (
    <RoleGuard allowedRoles={['SUPERVISOR', 'ADMIN']} fallback={fallback}>
      {children}
    </RoleGuard>
  );
}

/**
 * Psychologist Guard - Allows all authenticated users (PSYCHOLOGIST, SUPERVISOR, ADMIN)
 */
export function PsychologistGuard({ children, fallback }: Omit<RoleGuardProps, 'allowedRoles'>) {
  return (
    <RoleGuard allowedRoles={['PSYCHOLOGIST', 'SUPERVISOR', 'ADMIN']} fallback={fallback}>
      {children}
    </RoleGuard>
  );
}

/**
 * Authentication Guard - Allows any authenticated user regardless of role
 */
export function AuthGuard({ children, fallback }: Omit<RoleGuardProps, 'allowedRoles'>) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  // If still loading, show loading indicator
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // If not authenticated, redirect to login with return URL
  if (!user) {
    const returnTo = encodeURIComponent(window.location.pathname);
    router.push(`/api/auth/login?returnTo=${returnTo}`);
    return null;
  }

  // User is authenticated, show children
  return <>{children}</>;
}
