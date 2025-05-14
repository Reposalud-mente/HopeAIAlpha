'use client';

/**
 * Providers Component
 *
 * This component combines all context providers into a single component
 * for easier use in the application layout.
 */

import React from 'react';
import { ThemeProvider } from './theme-context';
import { FeatureFlagProvider } from './FeatureFlagContext';
import { AIAssistantProvider } from './ai-assistant-context';
import { NavbarProvider } from './NavbarContext';
import { DrawerProvider } from './DrawerContext';

interface ProvidersProps {
  children: React.ReactNode;
}

/**
 * Providers component that wraps all context providers
 * @param props The component props
 * @returns The providers component
 */
export function Providers({ children }: ProvidersProps) {
  return (
    <ThemeProvider>
      <FeatureFlagProvider>
        <NavbarProvider>
          <DrawerProvider>
            <AIAssistantProvider>
              {children}
            </AIAssistantProvider>
          </DrawerProvider>
        </NavbarProvider>
      </FeatureFlagProvider>
    </ThemeProvider>
  );
}
