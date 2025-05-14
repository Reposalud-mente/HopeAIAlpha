'use client';

import { createClient } from '@/utils/supabase/client';
import { useEffect, useState, ReactNode } from 'react';
import { User } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';

interface ProtectedClientWrapperProps {
  children: ReactNode;
  loadingFallback?: ReactNode;
  unauthenticatedFallback?: ReactNode;
}

/**
 * Client-side wrapper component that protects routes by checking authentication status
 * 
 * This component is useful for protecting client-rendered portions of a page or entire
 * client-rendered routes. It complements server-side protection by providing a more
 * immediate UX response.
 * 
 * @param children The content to render when authenticated
 * @param loadingFallback Optional fallback UI for loading state
 * @param unauthenticatedFallback Optional fallback UI if unauthenticated (before redirect)
 */
export default function ProtectedClientWrapper({
  children,
  loadingFallback = <p>Loading user session...</p>,
  unauthenticatedFallback = <p>Access denied. Redirecting to login...</p>
}: ProtectedClientWrapperProps) {
  const supabase = createClient();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function checkUserSession() {
      const { data: { session } } = await supabase.auth.getSession();
      if (isMounted) {
        setUser(session?.user ?? null);
        setIsLoading(false);
        if (!session?.user) {
          router.push('/auth/login?message=Please sign in to access this page');
        }
      }
    }

    checkUserSession();

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (isMounted) {
        setUser(session?.user ?? null);
        setIsLoading(false); // Update loading state on any auth change
        if (event === 'SIGNED_OUT' || (!session?.user && event !== 'INITIAL_SESSION')) {
          router.push('/auth/login?message=You have been signed out');
        }
      }
    });

    return () => {
      isMounted = false;
      authListener?.subscription?.unsubscribe();
    };
  }, [supabase, router]);

  if (isLoading) {
    return loadingFallback;
  }

  if (!user) {
    // This state should ideally be brief as the redirect is triggered
    return unauthenticatedFallback;
  }

  // User is authenticated client-side, render children
  return <>{children}</>;
}
