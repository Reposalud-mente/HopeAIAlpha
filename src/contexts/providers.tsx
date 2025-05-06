'use client';

import { ReactNode, useEffect } from 'react';
import { NavbarProvider } from '@/contexts/NavbarContext';
import { PatientProvider } from '@/contexts/PatientContext';
import { SessionProvider } from "next-auth/react"
import { AuthProvider } from "@/contexts/auth-context"
import { FeatureFlagProvider } from '@/contexts/FeatureFlagContext';
import { initMonitoring } from '@/lib/monitoring';
import { DrawerProvider } from '@/contexts/DrawerContext';
import { WebRTCProvider } from '@/contexts/webrtc-context';

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

  // Define ICE servers for WebRTC
  const iceServers = [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    // In a production environment, you would add TURN servers here
  ];

  return (
    <SessionProvider>
      <AuthProvider>
        <FeatureFlagProvider>
          <NavbarProvider>
            <PatientProvider>
              <DrawerProvider>
                {/* 
                  Note: We're not including WebRTCProvider at the global level
                  because it's only needed for video call pages and would
                  unnecessarily initialize WebRTC for all pages.
                  
                  Instead, we include it directly in the video call page component.
                */}
                {children}
              </DrawerProvider>
            </PatientProvider>
          </NavbarProvider>
        </FeatureFlagProvider>
      </AuthProvider>
    </SessionProvider>
  );
}