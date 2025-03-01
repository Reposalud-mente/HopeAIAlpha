'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { 
  Search, 
  Bell, 
  FileText, 
  Calendar, 
  PlusCircle, 
  Video 
} from 'lucide-react';
import { cn } from '@/lib/utils';

const TopBar = () => {
  const { user, signOut } = useAuth();
  const pathname = usePathname();

  return (
    <header className="bg-white shadow-sm py-2 border-b fixed top-0 right-0 left-0 z-40 h-[57px]">
      <div className="container mx-auto px-4 flex items-center justify-between h-full">
        <div className="flex items-center space-x-4 ml-16">
          <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center text-white text-lg font-bold">
            HA
          </div>
          <h1 className="text-xl font-semibold">HopeAI</h1>
        </div>
        
        {/* Search Bar */}
        <div className="flex-1 max-w-xl mx-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar pacientes, notas o informes..."
              className="w-full pl-10 pr-4 py-2 border rounded-lg bg-gray-50 text-sm"
            />
          </div>
        </div>
        
        {/* Quick Action Buttons */}
        <div className="flex items-center space-x-3 mr-4">
          {/* Generate Report Button */}
          <Link href="/reports/new">
            <Button variant="outline" size="sm" className="flex items-center">
              <FileText className="h-4 w-4 mr-1" />
              <span>Generar Informe</span>
            </Button>
          </Link>
          
          {/* Create Meeting Button */}
          <Link href="/demo">
            <Button variant="default" size="sm" className="flex items-center bg-blue-600 text-white hover:bg-blue-700">
              <Video className="h-4 w-4 mr-1" />
              <span>Nueva Consulta</span>
            </Button>
          </Link>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <button className="p-2 hover:bg-gray-100 rounded-full relative">
            <Bell className="h-5 w-5" />
            <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full text-white text-xs flex items-center justify-center">
              2
            </span>
          </button>
          
          {/* User Profile */}
          <div className="flex items-center space-x-2">
            <div className="text-right mr-2">
              <p className="font-medium text-sm">{user?.name || 'Dr. Psicólogo'}</p>
              <p className="text-xs text-gray-500">{user?.role || 'PSYCHOLOGIST'}</p>
            </div>
            <Button variant="ghost" size="sm" onClick={() => signOut()}>
              Salir
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default TopBar; 