"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  Users,
  Video,
  FileText,
  MessageSquare,
  Calendar,
  Settings,
  Activity,
  ChevronLeft,
  Menu
} from 'lucide-react';
import { useNavbar } from '@/contexts/NavbarContext';
import { cn } from '@/lib/utils';

export const SidebarContent = ({ isExpanded, toggleExpanded, pathname }: { isExpanded: boolean; toggleExpanded: () => void; pathname: string }) => {
  const navigationItems = [
    { name: 'Telemedicina', href: '/dashboard', icon: Video },
    { name: 'Pacientes', href: '/patients', icon: Users },
    { name: 'Informes', href: '/reports', icon: FileText },
    { name: 'Consultas AI', href: '/ai-consult', icon: MessageSquare },
    { name: 'Calendario', href: '/calendar', icon: Calendar },
    { name: 'Configuración', href: '/settings', icon: Settings },
  ];

  return (
    <nav
      className={cn(
        "h-full bg-white border-r transition-all duration-300 flex flex-col",
        isExpanded ? "w-64" : "w-20"
      )}
      aria-label="Sidebar navigation"
      role="navigation"
    >
      <div className="p-4 flex justify-center items-center border-b">
        <button
          type="button"
          onClick={toggleExpanded}
          className="p-1.5 rounded-md hover:bg-gray-100 text-gray-600"
          aria-label={isExpanded ? "Collapse sidebar" : "Expand sidebar"}
        >
          {isExpanded ? <ChevronLeft size={18} /> : <Menu size={18} />}
        </button>
      </div>

      <div className="flex-1 py-3 overflow-y-auto">
        <ul className="space-y-1 px-2">
          {navigationItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center py-3 px-4 rounded-md transition-colors text-base md:py-2.5 md:px-3 md:text-sm",
                    isActive
                      ? "bg-blue-50 text-blue-600"
                      : "text-gray-700 hover:bg-gray-100",
                    !isExpanded && "justify-center"
                  )}
                  tabIndex={0}
                  aria-current={isActive ? "page" : undefined}
                >
                  <item.icon size={22} className={isExpanded ? "mr-3" : ""} />
                  {isExpanded && <span>{item.name}</span>}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="p-3 border-t">
        <div className={cn(
          "flex items-center",
          !isExpanded && "justify-center"
        )}>
          <div className="h-8 w-8 rounded-full bg-blue-500 text-white flex items-center justify-center mr-2">
            DR
          </div>
          {isExpanded && (
            <div>
              <p className="text-sm font-medium">Dr. Rivera</p>
              <p className="text-xs text-gray-500">Médico</p>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

const Navbar = () => {
  const { isExpanded, toggleExpanded } = useNavbar();
  const pathname = usePathname();

  // Only show sidebar on md+ screens
  return (
    <div className="hidden md:block h-full">
      <SidebarContent isExpanded={isExpanded} toggleExpanded={toggleExpanded} pathname={pathname} />
    </div>
  );
};

export default Navbar;