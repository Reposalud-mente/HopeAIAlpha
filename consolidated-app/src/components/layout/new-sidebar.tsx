'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Video,
  Users,
  FileText,
  MessageSquare,
  Calendar,
  Settings,
  ChevronLeft,
  Menu
} from 'lucide-react';
import { useNavbar } from '@/contexts/NavbarContext';
import { useAuth } from '@/contexts/auth-context';
import { cn } from '@/lib/utils';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider,
  SidebarTrigger,
  useSidebar
} from '@/components/ui/sidebar';

// Navigation items used in both desktop and mobile views
const navigationItems = [
  { name: 'Telemedicina', href: '/dashboard', icon: Video },
  { name: 'Pacientes', href: '/patients', icon: Users },
  { name: 'Informes', href: '/reports', icon: FileText },
  { name: 'Consultas AI', href: '/ai-consult', icon: MessageSquare },
  { name: 'Calendario', href: '/calendar', icon: Calendar },
  { name: 'Configuración', href: '/settings', icon: Settings },
];

// This component is used inside the Sidebar
export const SidebarNavigation = () => {
  const pathname = usePathname();
  const { user } = useAuth();
  const { state: sidebarState } = useSidebar();
  const isExpanded = sidebarState === 'expanded';

  return (
    <>
      <SidebarHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            {isExpanded && (
              <div className="w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center text-white text-lg font-bold mr-2">
                HA
              </div>
            )}
            {isExpanded && <h1 className="text-lg font-semibold">HopeAI</h1>}
          </div>
          <SidebarTrigger />
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarMenu>
          {navigationItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <SidebarMenuItem key={item.name}>
                <Link href={item.href} passHref legacyBehavior>
                  <SidebarMenuButton 
                    asChild 
                    isActive={isActive}
                    tooltip={item.name}
                  >
                    <a className="flex items-center gap-2">
                      <item.icon className="h-5 w-5" />
                      <span>{item.name}</span>
                    </a>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarContent>
      
      <SidebarFooter>
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-blue-500 text-white flex items-center justify-center shrink-0">
            {user?.name?.substring(0, 2) || 'DR'}
          </div>
          {isExpanded && (
            <div className="min-w-0">
              <p className="text-sm font-medium truncate">{user?.name || 'Dr. Rivera'}</p>
              <p className="text-xs text-gray-500 truncate">{user?.role || 'Médico'}</p>
            </div>
          )}
        </div>
      </SidebarFooter>
    </>
  );
};

// Main sidebar component that will be used in the app layout
const NewSidebar = () => {
  const { isExpanded, toggleExpanded } = useNavbar();
  
  // Convert NavbarContext state to SidebarProvider state
  const open = isExpanded;
  const onOpenChange = (newOpen: boolean) => {
    if (newOpen !== isExpanded) {
      toggleExpanded();
    }
  };

  return (
    <SidebarProvider defaultOpen={isExpanded} open={open} onOpenChange={onOpenChange}>
      <Sidebar>
        <SidebarNavigation />
      </Sidebar>
    </SidebarProvider>
  );
};

export default NewSidebar;
