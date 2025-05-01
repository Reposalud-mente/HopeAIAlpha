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
  { name: 'Consultas AI', href: '/consultas-ai', icon: MessageSquare },
  { name: 'Calendario', href: '/calendar', icon: Calendar },
  { name: 'Configuración', href: '/settings', icon: Settings },
];

// Toggle button component for the sidebar
const SidebarToggle = ({ isExpanded, toggleExpanded, isHoverExpanded }: {
  isExpanded: boolean,
  toggleExpanded: () => void,
  isHoverExpanded?: boolean
}) => {
  return (
    <button
      type="button"
      onClick={toggleExpanded}
      className={cn(
        "absolute transition-all duration-300 bg-white border rounded-full p-1.5",
        "shadow-sm hover:shadow-md",
        "focus:outline-0 focus:ring-0 focus:shadow-sm",
        "active:outline-0 active:ring-0 active:shadow-sm",
        "right-[-10px] top-[16px] z-10",
        isHoverExpanded
          ? "border-blue-200 bg-blue-50 hover:bg-blue-100 hover:border-blue-300"
          : "border-[#e6e6e3] hover:bg-gray-50 hover:border-gray-300", // Enhanced hover effects
        "no-tap-highlight" // Clase personalizada para eliminar el efecto de tap
      )}
      aria-label={isExpanded ? "Collapse sidebar" : "Expand sidebar"}
      title={isExpanded ? "Colapsar menú" : "Expandir menú"}
    >
      {isExpanded ? (
        <ChevronLeft className={cn("h-4 w-4 transition-all duration-200", isHoverExpanded ? "text-blue-500" : "text-gray-700")} />
      ) : (
        <ChevronLeft className="h-4 w-4 rotate-180 text-gray-700 transition-all duration-200" />
      )}
    </button>
  );
};

// Navigation item component
const NavItem = ({ item, isActive, isExpanded, isHoverExpanded }: {
  item: { name: string; href: string; icon: React.ElementType },
  isActive: boolean,
  isExpanded: boolean,
  isHoverExpanded?: boolean
}) => {
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      className={cn(
        "transition-all duration-200 rounded-md my-1 border border-transparent", // Added transparent border for hover effect
        isActive
          ? "text-blue-600 bg-blue-50"
          : isExpanded
            ? "text-gray-500 hover:bg-gray-50 hover:border-gray-200" // Grey text when expanded with subtle border on hover
            : "text-gray-500 hover:border-gray-300", // Grey text when collapsed with hover border
        isExpanded ? "h-10 px-3 flex items-center" : "h-10 grid place-items-center",
        isHoverExpanded && !isActive && "hover:bg-gray-50 hover:border-gray-200" // Subtle hover effect with grey color when in hover mode
      )}
      title={!isExpanded ? item.name : undefined}
    >
      <Icon className={cn(
        "transition-all duration-200 h-[1.3vw] w-[1.3vw]",
        isActive
          ? "text-blue-600"
          : isExpanded
            ? "text-gray-500" // Always grey icons when expanded
            : "text-gray-500" // Always grey icons when collapsed
      )} />

      {isExpanded && (
        <span className={cn(
          "ml-[0.8vw] text-[1vw] font-medium",
          isActive ? "text-blue-600" : "text-gray-500" // Always grey text for non-active items
        )}>{item.name}</span>
      )}
    </Link>
  );
};

// User profile component
const UserProfile = ({ user, isExpanded, isHoverExpanded }: {
  user: any,
  isExpanded: boolean,
  isHoverExpanded?: boolean
}) => {
  return (
    <div className={cn(
      "mt-auto border-t transition-all duration-300 sticky bottom-0 bg-white",
      isExpanded ? "p-[1.3vw]" : "py-[1.3vw]",
      isHoverExpanded ? "border-blue-100" : "border-[#e6e6e3]" // Subtle border color in hover mode
    )}>
      {!isExpanded ? (
        <div className="grid place-items-center">
          <div className={cn(
            "h-8 w-8 rounded-full bg-[#f8f8f8] flex items-center justify-center border shadow-sm transition-all duration-200",
            isHoverExpanded ? "border-gray-200 text-gray-500" : "border-[#e6e6e3] text-gray-500", // Grey text when collapsed
            "hover:border-gray-300" // Hover effect for border
          )}>
            <span className="font-medium text-[0.8vw]">
              {user?.name?.substring(0, 2) || 'DR'}
            </span>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-3">
          <div className={cn(
            "h-8 w-8 rounded-full bg-[#f8f8f8] flex items-center justify-center border shadow-sm transition-all duration-200",
            isHoverExpanded ? "border-gray-200 text-gray-500" : "border-[#e6e6e3] text-gray-500",
            "hover:border-gray-300" // Hover effect for border
          )}>
            <span className="font-medium text-[0.8vw]">
              {user?.name?.substring(0, 2) || 'DR'}
            </span>
          </div>
          <div className="min-w-0 animate-fadeIn overflow-hidden">
            <p className={cn(
              "text-[1vw] font-medium truncate max-w-[11vw]",
              "text-gray-500" // Always grey text for user name
            )}>{user?.name || 'Dr. Rivera'}</p>
            <p className="text-[0.8vw] text-gray-500 truncate max-w-[11vw]">{user?.role || 'Psicólogo'}</p>
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
  const { isExpanded, isHoverExpanded, toggleExpanded, handleMouseEnter, handleMouseLeave } = useNavbar();

  // Crear clases dinámicas para el ancho
  const sidebarWidthClass = isExpanded ? 'w-[15vw] min-w-[180px] max-w-[260px]' : 'w-[3.5vw] min-w-[44px] max-w-[70px]';

  return (
    <div
      className={cn(
        "h-full transition-all duration-300 z-30 relative",
        sidebarWidthClass
      )}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className={cn(
        "h-full bg-white border-r flex flex-col overflow-hidden border-t-0 shadow-sm relative transition-all duration-300",
        isHoverExpanded ? "border-blue-200 ring-1 ring-blue-100" : "border-[#e6e6e3] hover:border-gray-300", // Subtle visual indicator for hover mode and border hover effect
        !isExpanded && "hover:shadow-md" // Add shadow on hover when collapsed
      )}>
        <div className="h-full flex flex-col relative">
          {/* Toggle button */}
          <SidebarToggle isExpanded={isExpanded} toggleExpanded={toggleExpanded} isHoverExpanded={isHoverExpanded} />

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
                  isHoverExpanded={isHoverExpanded}
                />
              );
            })}
          </div>

          {/* User profile */}
          <UserProfile user={user} isExpanded={isExpanded} isHoverExpanded={isHoverExpanded} />
        </div>
      </div>
    </div>
  );
};

export default SimplifiedSidebar;
