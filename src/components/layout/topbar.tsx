'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Search,
  FileText,
  Video,
  Menu,
  Calendar
} from 'lucide-react';

import { useDrawer } from '@/contexts/DrawerContext';
import { NotificationCenter } from '@/components/calendar/NotificationCenter';

const TopBar = () => {
  // We're not using user or signOut in this component currently
  const { openDrawer } = useDrawer();

  return (
    <header
      className="bg-white shadow-sm py-[0.6vw] border-b z-40 h-[var(--topbar-height)] min-h-[48px]"
      role="banner"
      aria-label="Top navigation bar"
    >
      <div className="container mx-auto px-2 flex items-center justify-between h-full flex-wrap gap-y-2 md:px-4">
        {/* Hamburger menu for mobile - improved touch target */}
        <button
          type="button"
          className="md:hidden mr-2 p-2 rounded-md hover:bg-gray-100 text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label="Abrir menú"
          tabIndex={0}
          onClick={openDrawer}
        >
          <Menu size={24} />
        </button>
        <div className="flex items-center space-x-4 ml-12 md:ml-16">
          <div className="w-[2.7vw] h-[2.7vw] min-w-[36px] min-h-[36px] bg-blue-600 rounded-xl flex items-center justify-center text-white text-[1.3vw] font-montserrat-bold">
            HA
          </div>
          <h1 className="text-[1.1vw] font-montserrat-semibold">HopeAI</h1>
        </div>

        {/* Search Bar (hidden on mobile) */}
        <div className="hidden md:block flex-1 max-w-xl mx-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar pacientes, notas o informes..."
              className="w-full pl-[2.5vw] pr-[1vw] py-[0.7vw] border rounded-lg bg-gray-50 text-[1vw]"
            />
          </div>
        </div>

        {/* Quick Action Buttons and Notifications (hidden on mobile) */}
        <div className="hidden md:flex items-center space-x-[1vw] mr-[1vw]">
          {/* Calendar Button */}
          <Link href="/calendar">
            <Button variant="outline" size="sm" className="flex items-center text-[1vw] px-[1vw] py-[0.5vw]">
              <Calendar className="h-[1vw] w-[1vw] min-h-[16px] min-w-[16px] mr-[0.5vw]" />
              <span>Calendario</span>
            </Button>
          </Link>

          {/* Generate Report Button */}
          <Link href="/reports/new">
            <Button variant="outline" size="sm" className="flex items-center text-[1vw] px-[1vw] py-[0.5vw]">
              <FileText className="h-[1vw] w-[1vw] min-h-[16px] min-w-[16px] mr-[0.5vw]" />
              <span>Generar Informe</span>
            </Button>
          </Link>

          {/* Create Meeting Button */}
          <Link href="/dashboard">
            <Button variant="default" size="sm" className="flex items-center bg-blue-600 text-white hover:bg-blue-700 text-[1vw] px-[1vw] py-[0.5vw]">
              <Video className="h-[1vw] w-[1vw] min-h-[16px] min-w-[16px] mr-[0.5vw]" />
              <span>Nueva Consulta</span>
            </Button>
          </Link>

          {/* Notification Center */}
          <NotificationCenter />
        </div>
      </div>
    </header>
  );
};

export default TopBar;