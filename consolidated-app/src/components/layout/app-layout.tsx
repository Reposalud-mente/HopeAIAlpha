'use client';

import React, { ReactNode } from 'react';
import TopBar from '@/components/layout/topbar';
// Importamos el nuevo sidebar simplificado
import SimplifiedSidebar from '@/components/layout/simplified-sidebar';
import MobileSidebar from '@/components/layout/mobile-sidebar';
import { useNavbar } from '@/contexts/NavbarContext';
import { useDrawer } from '@/contexts/DrawerContext';
import { cn } from '@/lib/utils';

interface AppLayoutProps {
  children: ReactNode;
  hideNavbar?: boolean; // Optional prop to hide navbar in specific cases (e.g., login page)
}

const AppLayout = ({ children, hideNavbar = false }: AppLayoutProps) => {
  const { isExpanded } = useNavbar();
  const { isDrawerOpen } = useDrawer();

  // Prevent body scroll when drawer is open on mobile
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      if (isDrawerOpen) {
        document.body.classList.add('overflow-hidden');
      } else {
        document.body.classList.remove('overflow-hidden');
      }
    }
    // Clean up on unmount
    return () => {
      if (typeof window !== 'undefined') {
        document.body.classList.remove('overflow-hidden');
      }
    };
  }, [isDrawerOpen]);

  return (
    <div className={cn("h-screen flex flex-col bg-gray-50", isDrawerOpen ? "overflow-hidden" : "")}>
      {/* TopBar - horizontal navigation */}
      {!hideNavbar && <TopBar />}

      {/* Mobile Sidebar */}
      {!hideNavbar && <div className="md:hidden"><MobileSidebar /></div>}

      <div className="flex flex-1 overflow-hidden pt-[57px]">
        {/* Desktop Sidebar - Fixed position */}
        {!hideNavbar && (
          <div className="fixed left-0 top-[57px] h-[calc(100vh-57px)] z-30 hidden md:block border-t-0">
            <SimplifiedSidebar />
          </div>
        )}

        {/* Main content area with appropriate margin based on sidebar width */}
        <main
          className={cn(
            "flex-1 overflow-auto transition-all duration-300 ease-in-out",
            !hideNavbar && (isExpanded ? "ml-[240px]" : "ml-[56px]") // Dimensiones consistentes con SimplifiedSidebar
          )}
        >
          {children}
        </main>
      </div>
    </div>
  );
};

export default AppLayout;