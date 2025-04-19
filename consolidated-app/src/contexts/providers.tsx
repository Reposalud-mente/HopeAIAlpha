'use client';

import { ReactNode, useEffect } from 'react';
import { NavbarProvider } from '@/contexts/NavbarContext';
import { PatientProvider } from '@/contexts/PatientContext';
import { SessionProvider } from "next-auth/react"
import { AuthProvider } from "@/contexts/auth-context"
import { FeatureFlagProvider } from '@/contexts/FeatureFlagContext';
import { initMonitoring } from '@/lib/monitoring';
import { DrawerProvider } from '@/contexts/DrawerContext';

export function Providers({ children }: { children: ReactNode }) {
  // Initialize monitoring on client-side
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Initialize monitoring with user info when available
      initMonitoring({
        environment: process.env.NEXT_PUBLIC_APP_ENV || 'development',
        enabled: process.env.NEXT_PUBLIC_ENABLE_MONITORING === 'true',
      });
    }
  }, []);

  return (
    <SessionProvider>
      <AuthProvider>
        <FeatureFlagProvider>
          <NavbarProvider>
            <PatientProvider>
              <DrawerProvider>
                {children}
              </DrawerProvider>
            </PatientProvider>
          </NavbarProvider>
        </FeatureFlagProvider>
      </AuthProvider>
    </SessionProvider>
  );
}