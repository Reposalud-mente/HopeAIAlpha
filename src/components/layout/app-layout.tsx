'use client';

import React, { ReactNode } from 'react';
import TopBar from '@/components/layout/topbar';
import SimplifiedSidebar from '@/components/layout/simplified-sidebar';
import MobileSidebar from '@/components/layout/mobile-sidebar';
import { useNavbar } from '@/contexts/NavbarContext';
import { useDrawer } from '@/contexts/DrawerContext';
import { useAIPanel } from '@/contexts/ai-panel-context';
import { cn } from '@/lib/utils';

interface AppLayoutProps {
  children: ReactNode;
  hideNavbar?: boolean; // Optional prop to hide navbar in specific cases (e.g., login page)
}

const AppLayout = ({ children, hideNavbar = false }: AppLayoutProps) => {
  const { isExpanded } = useNavbar();
  const { isDrawerOpen } = useDrawer();
  const { isCollapsed: isAIPanelCollapsed } = useAIPanel();

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
    <div className={cn(
      "h-screen grid grid-rows-[var(--topbar-height)_1fr] bg-gray-50",
      isDrawerOpen ? "overflow-hidden" : ""
    )}>
      {/* TopBar - horizontal navigation */}
      {!hideNavbar && <TopBar />}

      {/* Mobile Sidebar */}
      {!hideNavbar && <div className="md:hidden"><MobileSidebar /></div>}

      {/* Main content area with sidebar */}
      <div className="grid grid-cols-1 md:grid-cols-[auto_1fr] overflow-hidden">
        {/* Desktop Sidebar */}
        {!hideNavbar && (
          <div className="hidden md:block sticky top-[var(--topbar-height)] h-[calc(100vh-var(--topbar-height))] z-30 border-t-0">
            <SimplifiedSidebar />
          </div>
        )}

        {/* Main content area */}
        <main
          className={cn(
            "overflow-auto transition-all duration-300 ease-in-out",
            // Only apply right padding when AI panel is expanded
            !isAIPanelCollapsed ? "lg:pr-[var(--ai-panel-width)]" : ""
          )}
        >
          {children}
        </main>
      </div>
    </div>
  );
};

export default AppLayout;