'use client';

import React, { ReactNode } from 'react';
import Navbar from '@/components/layout/navbar';
import TopBar from '@/components/layout/topbar';
import { useNavbar } from '@/contexts/NavbarContext';
import { cn } from '@/lib/utils';

interface AppLayoutProps {
  children: ReactNode;
  hideNavbar?: boolean; // Optional prop to hide navbar in specific cases (e.g., login page)
}

const AppLayout = ({ children, hideNavbar = false }: AppLayoutProps) => {
  const { isExpanded } = useNavbar();

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* TopBar - horizontal navigation */}
      {!hideNavbar && <TopBar />}
      
      <div className="flex flex-1 overflow-hidden pt-[57px]">
        {/* Fixed position sidebar - vertical navbar */}
        {!hideNavbar && (
          <div className="fixed left-0 top-[57px] h-[calc(100vh-57px)] z-30">
            <Navbar />
          </div>
        )}

        {/* Main content area with appropriate margin based on sidebar width */}
        <main
          className={cn(
            "flex-1 overflow-auto transition-all duration-300",
            !hideNavbar && (isExpanded ? "ml-64" : "ml-20")
          )}
        >
          {children}
        </main>
      </div>
    </div>
  );
};

export default AppLayout; 