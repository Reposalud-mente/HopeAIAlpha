'use client';

import React from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface AuthPageLayoutProps {
  children: React.ReactNode;
  showLogo?: boolean;
  className?: string;
}

/**
 * Consistent layout for authentication pages
 * 
 * @param children - The content to display
 * @param showLogo - Whether to show the app logo (default: true)
 * @param className - Additional CSS classes for the container
 */
export default function AuthPageLayout({ 
  children, 
  showLogo = true,
  className
}: AuthPageLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-2 bg-gray-50">
      {showLogo && (
        <div className="mb-8">
          {/* App logo can be added here */}
          <div className="text-center mb-4">
            <h1 className="text-3xl font-bold text-primary">HopeAI</h1>
            <p className="text-sm text-gray-600">Plataforma de Psicología Clínica</p>
          </div>
        </div>
      )}
      <div className={cn(
        "w-full max-w-md space-y-8 rounded-lg border bg-white p-6 shadow-md",
        className
      )}>
        {children}
      </div>
    </div>
  );
}
