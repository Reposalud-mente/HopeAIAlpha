'use client';

import React from 'react';
import { useDrawer } from '@/contexts/DrawerContext';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { SidebarNavigation } from './new-sidebar';
import { Sidebar, SidebarProvider } from '@/components/ui/sidebar';

const MobileSidebar = () => {
  const { isDrawerOpen, closeDrawer } = useDrawer();

  return (
    <Sheet open={isDrawerOpen} onOpenChange={(open) => !open && closeDrawer()}>
      <SheetContent side="left" className="p-0 w-[280px] sm:w-[320px] border-r border-sidebar-border shadow-lg">
        <div className="h-full flex flex-col bg-sidebar text-sidebar-foreground">
          <SidebarProvider defaultOpen={true}>
            <Sidebar>
              <SidebarNavigation />
            </Sidebar>
          </SidebarProvider>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default MobileSidebar;
