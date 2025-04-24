'use client';

import React from 'react';
import { useDrawer } from '@/contexts/DrawerContext';
import { useNavbar } from '@/contexts/NavbarContext';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import SimplifiedSidebar from './simplified-sidebar';

const MobileSidebar = () => {
  const { isDrawerOpen, closeDrawer } = useDrawer();
  const { isExpanded, setExpanded } = useNavbar();

  // Forzar modo expandido en la vista móvil
  const forceExpanded = () => {
    if (!isExpanded) {
      setExpanded(true);
    }
  };

  // Asegurar que el sidebar esté expandido en móvil
  React.useEffect(() => {
    if (isDrawerOpen) {
      forceExpanded();
    }
  }, [isDrawerOpen, isExpanded, setExpanded]);

  return (
    <Sheet open={isDrawerOpen} onOpenChange={(open) => !open && closeDrawer()}>
      <SheetContent side="left" className="p-0 w-[280px] sm:w-[320px] border-r border-[#e6e6e3] shadow-lg bg-white">
        <div className="h-full flex flex-col pt-4">
          <SimplifiedSidebar />
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default MobileSidebar;
