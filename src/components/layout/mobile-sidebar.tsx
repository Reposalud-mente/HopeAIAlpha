'use client';

import React from 'react';
import { useDrawer } from '@/contexts/DrawerContext';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { SidebarNavigation } from './new-sidebar';
import { SidebarProvider } from '@/components/ui/sidebar';

const MobileSidebar = () => {
  const { isDrawerOpen, closeDrawer } = useDrawer();

  return (
    <Sheet open={isDrawerOpen} onOpenChange={(open) => !open && closeDrawer()}>
      <SheetContent side="left" className="p-0 w-[280px] sm:w-[320px]">
        <SidebarProvider defaultOpen={true}>
          <div className="h-full flex flex-col bg-sidebar text-sidebar-foreground">
            <SidebarNavigation />
          </div>
        </SidebarProvider>
      </SheetContent>
    </Sheet>
  );
};

export default MobileSidebar;
