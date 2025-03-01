'use client';

import { ReactNode } from 'react';
import { NavbarProvider } from '@/contexts/NavbarContext';
import { PatientProvider } from '@/contexts/PatientContext';
import { SessionProvider } from "next-auth/react"
import { AuthProvider } from "@/contexts/auth-context"

export function Providers({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <AuthProvider>
        <NavbarProvider>
          <PatientProvider>
            {children}
          </PatientProvider>
        </NavbarProvider>
      </AuthProvider>
    </SessionProvider>
  );
} 