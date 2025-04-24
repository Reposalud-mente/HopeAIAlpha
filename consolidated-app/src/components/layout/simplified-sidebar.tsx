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
} from 'lucide-react';
import { useNavbar } from '@/contexts/NavbarContext';
import { useAuth } from '@/contexts/auth-context';
import { cn } from '@/lib/utils';

// Valores de ancho definidos directamente en las clases de Tailwind
// w-[240px] para expandido y w-[56px] para colapsado

// Navigation items used in both desktop and mobile views
const navigationItems = [
  { name: 'Telemedicina', href: '/dashboard', icon: Video },
  { name: 'Pacientes', href: '/patients', icon: Users },
  { name: 'Informes', href: '/reports', icon: FileText },
  { name: 'Consultas AI', href: '/ai-consult', icon: MessageSquare },
  { name: 'Calendario', href: '/calendar', icon: Calendar },
  { name: 'Configuración', href: '/settings', icon: Settings },
];

// Toggle button component for the sidebar
const SidebarToggle = ({ isExpanded, toggleExpanded }: { isExpanded: boolean, toggleExpanded: () => void }) => {
  return (
    <button
      type="button"
      onClick={toggleExpanded}
      className={cn(
        "absolute transition-all duration-300 bg-white border border-[#e6e6e3] rounded-full p-1.5",
        "shadow-sm hover:shadow-md hover:bg-gray-50",
        "focus:outline-0 focus:ring-0 focus:shadow-sm focus:bg-white",
        "active:outline-0 active:ring-0 active:shadow-sm active:bg-white",
        "right-[-10px] top-[16px] z-10",
        "no-tap-highlight" // Clase personalizada para eliminar el efecto de tap
      )}
      aria-label={isExpanded ? "Collapse sidebar" : "Expand sidebar"}
      title={isExpanded ? "Colapsar menú" : "Expandir menú"}
    >
      {isExpanded ? (
        <ChevronLeft className="h-4 w-4 text-gray-700" />
      ) : (
        <ChevronLeft className="h-4 w-4 rotate-180 text-gray-700" />
      )}
    </button>
  );
};

// Navigation item component
const NavItem = ({ item, isActive, isExpanded }: {
  item: { name: string; href: string; icon: React.ElementType },
  isActive: boolean,
  isExpanded: boolean
}) => {
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      className={cn(
        "transition-all duration-200 rounded-md my-1",
        isActive ? "text-blue-600 bg-blue-50" : "text-gray-700 hover:bg-gray-50",
        isExpanded ? "h-10 px-3 flex items-center" : "h-10 grid place-items-center"
      )}
      title={!isExpanded ? item.name : undefined}
    >
      <Icon className={cn(
        "transition-all duration-200 h-5 w-5",
        isActive ? "text-blue-600" : "text-gray-500"
      )} />

      {isExpanded && (
        <span className="ml-3 text-sm font-medium">{item.name}</span>
      )}
    </Link>
  );
};

// User profile component
const UserProfile = ({ user, isExpanded }: { user: any, isExpanded: boolean }) => {
  return (
    <div className={cn(
      "mt-auto border-t border-[#e6e6e3] transition-all duration-300 sticky bottom-0 bg-white",
      isExpanded ? "p-4" : "py-4"
    )}>
      {!isExpanded ? (
        <div className="grid place-items-center">
          <div className="h-8 w-8 rounded-full bg-[#f8f8f8] text-gray-700 flex items-center justify-center border border-[#e6e6e3] shadow-sm">
            <span className="font-medium text-xs">
              {user?.name?.substring(0, 2) || 'DR'}
            </span>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-[#f8f8f8] text-gray-700 flex items-center justify-center border border-[#e6e6e3] shadow-sm">
            <span className="font-medium text-xs">
              {user?.name?.substring(0, 2) || 'DR'}
            </span>
          </div>
          <div className="min-w-0 animate-fadeIn overflow-hidden">
            <p className="text-sm font-medium truncate text-gray-700 max-w-[160px]">{user?.name || 'Dr. Rivera'}</p>
            <p className="text-xs text-gray-500 truncate max-w-[160px]">{user?.role || 'Psicólogo'}</p>
          </div>
        </div>
      )}
    </div>
  );
};

// Main sidebar component
const SimplifiedSidebar = () => {
  const pathname = usePathname();
  const { user } = useAuth();
  const { isExpanded, toggleExpanded } = useNavbar();

  // Crear clases dinámicas para el ancho
  const sidebarWidthClass = isExpanded ? 'w-[240px]' : 'w-[56px]';

  return (
    <div
      className={cn(
        "h-full transition-all duration-300 z-30 relative",
        sidebarWidthClass
      )}
    >
      <div className="h-full bg-white border-r border-[#e6e6e3] flex flex-col overflow-hidden border-t-0 shadow-sm relative">
        <div className="h-full flex flex-col relative">
          {/* Toggle button */}
          <SidebarToggle isExpanded={isExpanded} toggleExpanded={toggleExpanded} />

          {/* Spacer to replace logo section */}
          <div className="py-6"></div>

          {/* Main navigation */}
          <div className="flex flex-col transition-all duration-300 mt-4 flex-1 overflow-y-auto">
            {navigationItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <NavItem
                  key={item.name}
                  item={item}
                  isActive={isActive}
                  isExpanded={isExpanded}
                />
              );
            })}
          </div>

          {/* User profile */}
          <UserProfile user={user} isExpanded={isExpanded} />
        </div>
      </div>
    </div>
  );
};

export default SimplifiedSidebar;
