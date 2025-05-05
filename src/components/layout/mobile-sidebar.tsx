'use client';

import React from 'react';
import { useDrawer } from '@/contexts/DrawerContext';
import { useNavbar } from '@/contexts/NavbarContext';
import { Sheet, SheetContent, SheetClose } from '@/components/ui/sheet';
import { X } from 'lucide-react';
import SimplifiedSidebar from './simplified-sidebar';

const MobileSidebar = () => {
  const { isDrawerOpen, closeDrawer } = useDrawer();
  const { isExpanded, setExpanded } = useNavbar();

  // Force expanded mode on mobile view
  const forceExpanded = () => {
    if (!isExpanded) {
      setExpanded(true); // This will also reset isHoverExpanded to false in the context
    }
  };

  // Ensure sidebar is expanded on mobile
  React.useEffect(() => {
    if (isDrawerOpen) {
      forceExpanded();
    }
  }, [isDrawerOpen, isExpanded, setExpanded]);

  return (
    <Sheet open={isDrawerOpen} onOpenChange={(open) => !open && closeDrawer()}>
      <SheetContent
        side="left"
        className="p-0 w-full max-w-[85vw] sm:max-w-[320px] border-r border-[#e6e6e3] shadow-lg bg-white"
      >
        {/* Custom close button with better positioning for mobile */}
        <SheetClose className="absolute right-4 top-4 z-50 rounded-full p-2 bg-gray-100 text-gray-600 hover:bg-gray-200">
          <X className="h-5 w-5" />
          <span className="sr-only">Close</span>
        </SheetClose>

        <div className="h-full flex flex-col pt-4 overflow-y-auto">
          {/* Pass isMobile prop to SimplifiedSidebar */}
          <SimplifiedSidebar isMobile={true} />
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default MobileSidebar;
