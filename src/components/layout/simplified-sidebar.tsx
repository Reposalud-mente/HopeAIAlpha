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
import { useAuth } from '@/hooks/useAuth';
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
const NavItem = ({ item, isActive, isExpanded, isHoverExpanded, isMobile = false }: {
  item: { name: string; href: string; icon: React.ElementType },
  isActive: boolean,
  isExpanded: boolean,
  isHoverExpanded?: boolean,
  isMobile?: boolean
}) => {
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      className={cn(
        "transition-all duration-200 rounded-md my-1 border border-transparent",
        // Active state styling
        isActive
          ? "text-blue-600 bg-blue-50"
          : isExpanded
            ? "text-gray-500 hover:bg-gray-50 hover:border-gray-200"
            : "text-gray-500 hover:border-gray-300",
        // Layout based on expanded state
        isExpanded ? "h-10 px-3 flex items-center" : "h-10 grid place-items-center",
        // Hover effects
        isHoverExpanded && !isActive && "hover:bg-gray-50 hover:border-gray-200",
        // Mobile specific styles
        isMobile && "h-12 px-4" // Larger touch target on mobile
      )}
      title={!isExpanded ? item.name : undefined}
    >
      <Icon className={cn(
        "transition-all duration-200",
        // Use fixed sizes on mobile, viewport units on desktop
        isMobile
          ? "h-5 w-5"
          : "h-[1.3vw] w-[1.3vw] min-h-[18px] min-w-[18px]",
        isActive
          ? "text-blue-600"
          : "text-gray-500" // Always grey icons when not active
      )} />

      {isExpanded && (
        <span className={cn(
          // Use fixed sizes on mobile, viewport units on desktop
          isMobile
            ? "ml-3 text-base font-medium"
            : "ml-[0.8vw] text-[1vw] font-medium",
          isActive ? "text-blue-600" : "text-gray-500"
        )}>
          {item.name}
        </span>
      )}
    </Link>
  );
};

// User profile component
const UserProfile = ({ user, isExpanded, isHoverExpanded, isMobile = false }: {
  user: any,
  isExpanded: boolean,
  isHoverExpanded?: boolean,
  isMobile?: boolean
}) => {
  return (
    <div className={cn(
      "mt-auto border-t transition-all duration-300 sticky bottom-0 bg-white",
      // Use fixed padding on mobile, viewport units on desktop
      isMobile
        ? isExpanded ? "p-4" : "py-4"
        : isExpanded ? "p-[1.3vw]" : "py-[1.3vw]",
      isHoverExpanded ? "border-blue-100" : "border-[#e6e6e3]"
    )}>
      {!isExpanded ? (
        <div className="grid place-items-center">
          <div className={cn(
            "rounded-full bg-[#f8f8f8] flex items-center justify-center border shadow-sm transition-all duration-200",
            // Use fixed sizes on mobile
            isMobile ? "h-9 w-9" : "h-8 w-8",
            isHoverExpanded ? "border-gray-200 text-gray-500" : "border-[#e6e6e3] text-gray-500",
            "hover:border-gray-300"
          )}>
            <span className={cn(
              "font-medium",
              // Use fixed font size on mobile
              isMobile ? "text-xs" : "text-[0.8vw] min-text-[10px]"
            )}>
              {user?.name?.substring(0, 2) || 'DR'}
            </span>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-3">
          <div className={cn(
            "rounded-full bg-[#f8f8f8] flex items-center justify-center border shadow-sm transition-all duration-200",
            // Use fixed sizes on mobile
            isMobile ? "h-9 w-9" : "h-8 w-8",
            isHoverExpanded ? "border-gray-200 text-gray-500" : "border-[#e6e6e3] text-gray-500",
            "hover:border-gray-300"
          )}>
            <span className={cn(
              "font-medium",
              // Use fixed font size on mobile
              isMobile ? "text-xs" : "text-[0.8vw] min-text-[10px]"
            )}>
              {user?.name?.substring(0, 2) || 'DR'}
            </span>
          </div>
          <div className="min-w-0 animate-fadeIn overflow-hidden">
            <p className={cn(
              "font-medium truncate",
              // Use fixed sizes and max-width on mobile
              isMobile
                ? "text-sm max-w-[180px]"
                : "text-[1vw] max-w-[11vw]",
              "text-gray-500"
            )}>
              {user?.name || 'Dr. Rivera'}
            </p>
            <p className={cn(
              "text-gray-500 truncate",
              // Use fixed sizes and max-width on mobile
              isMobile
                ? "text-xs max-w-[180px]"
                : "text-[0.8vw] max-w-[11vw]"
            )}>
              {user?.role || 'Psicólogo'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

// Main sidebar component
const SimplifiedSidebar = ({ isMobile = false }: { isMobile?: boolean }) => {
  const pathname = usePathname();
  const { user } = useAuth();
  const { isExpanded, isHoverExpanded, toggleExpanded, handleMouseEnter, handleMouseLeave } = useNavbar();

  // Always use expanded mode for mobile
  const effectiveIsExpanded = isMobile ? true : isExpanded;

  // Create dynamic width classes - different for mobile vs desktop
  const sidebarWidthClass = isMobile
    ? 'w-full' // Full width for mobile drawer
    : effectiveIsExpanded
      ? 'w-[15vw] min-w-[180px] max-w-[260px]'
      : 'w-[3.5vw] min-w-[44px] max-w-[70px]';

  return (
    <div
      className={cn(
        "h-full transition-all duration-300 z-30 relative",
        sidebarWidthClass
      )}
      // Only apply mouse events on desktop
      onMouseEnter={!isMobile ? handleMouseEnter : undefined}
      onMouseLeave={!isMobile ? handleMouseLeave : undefined}
    >
      <div className={cn(
        "h-full bg-white flex flex-col overflow-hidden border-t-0 shadow-sm relative transition-all duration-300",
        // Only apply border-r on desktop
        !isMobile && "border-r",
        isHoverExpanded ? "border-blue-200 ring-1 ring-blue-100" : "border-[#e6e6e3] hover:border-gray-300",
        !effectiveIsExpanded && "hover:shadow-md"
      )}>
        <div className="h-full flex flex-col relative">
          {/* Toggle button - only show on desktop */}
          {!isMobile && (
            <SidebarToggle
              isExpanded={effectiveIsExpanded}
              toggleExpanded={toggleExpanded}
              isHoverExpanded={isHoverExpanded}
            />
          )}

          {/* Spacer to replace logo section - smaller on mobile */}
          <div className={isMobile ? "py-3" : "py-6"}></div>

          {/* Main navigation */}
          <div className={cn(
            "flex flex-col transition-all duration-300 flex-1 overflow-y-auto",
            isMobile ? "mt-2 px-2" : "mt-4"
          )}>
            {navigationItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <NavItem
                  key={item.name}
                  item={item}
                  isActive={isActive}
                  isExpanded={effectiveIsExpanded}
                  isHoverExpanded={isHoverExpanded}
                  isMobile={isMobile}
                />
              );
            })}
          </div>

          {/* User profile */}
          <UserProfile
            user={user}
            isExpanded={effectiveIsExpanded}
            isHoverExpanded={isHoverExpanded}
            isMobile={isMobile}
          />
        </div>
      </div>
    </div>
  );
};

export default SimplifiedSidebar;
