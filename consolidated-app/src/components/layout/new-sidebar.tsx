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
  Menu,
  PanelLeft
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
  const { toggleExpanded } = useNavbar();

  return (
    <>
      <SidebarHeader className="px-4 py-4 border-b border-sidebar-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={cn(
              "w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center text-white text-lg font-bold shadow-sm transition-all duration-200",
              !isExpanded && "mx-auto"
            )}>
              HA
            </div>
            {isExpanded && <h1 className="text-xl font-semibold tracking-tight animate-fadeIn">HopeAI</h1>}
          </div>
          <button
            type="button"
            onClick={toggleExpanded}
            className="hover:bg-sidebar-accent rounded-md transition-colors duration-200 p-1.5"
            aria-label={isExpanded ? "Collapse sidebar" : "Expand sidebar"}
          >
            <PanelLeft className={cn(
              "h-5 w-5 transition-transform duration-300",
              !isExpanded && "rotate-180"
            )} />
          </button>
        </div>
      </SidebarHeader>

      <SidebarContent className="py-4">
        <SidebarMenu className="space-y-1.5 px-3">
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
                    <a className={cn(
                      "flex items-center gap-3 py-2.5 px-3 rounded-md transition-all duration-200",
                      isActive
                        ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium shadow-sm"
                        : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground",
                      !isExpanded && "justify-center px-2"
                    )}>
                      <item.icon className={cn(
                        "h-5 w-5 transition-all duration-200",
                        isActive ? "text-blue-600" : "text-gray-500",
                        !isExpanded && "h-5.5 w-5.5"
                      )} />
                      {isExpanded && <span className="animate-fadeIn">{item.name}</span>}
                    </a>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter className="px-4 py-4 mt-auto border-t border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className={cn(
            "h-9 w-9 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-sm transition-all duration-200",
            !isExpanded && "mx-auto"
          )}>
            {user?.name?.substring(0, 2) || 'DR'}
          </div>
          {isExpanded && (
            <div className="min-w-0 animate-fadeIn">
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
    <div className={cn(
      "h-full transition-all duration-300 z-30",
      isExpanded ? "w-64" : "w-12"
    )}>
      <div className="h-full bg-sidebar shadow-lg border-r border-sidebar-border flex flex-col">
        <SidebarProvider defaultOpen={isExpanded} open={open} onOpenChange={onOpenChange}>
          <Sidebar>
            <SidebarNavigation />
          </Sidebar>
        </SidebarProvider>
      </div>
    </div>
  );
};

export default NewSidebar;
