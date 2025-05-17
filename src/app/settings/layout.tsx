"use client"

import { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Brain, Settings, User } from 'lucide-react';

interface SettingsLayoutProps {
  children: ReactNode;
}

export default function SettingsLayout({ children }: SettingsLayoutProps) {
  const pathname = usePathname();
  
  const navItems = [
    {
      title: 'Perfil',
      href: '/settings/profile',
      icon: User,
    },
    {
      title: 'Memoria del Asistente',
      href: '/settings/memory',
      icon: Brain,
    },
    {
      title: 'Configuración General',
      href: '/settings/general',
      icon: Settings,
    },
  ];
  
  return (
    <div className="container mx-auto py-6">
      <div className="grid grid-cols-1 md:grid-cols-[250px_1fr] gap-6">
        <aside className="md:border-r pr-6">
          <nav className="flex flex-col space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted"
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.title}
                </Link>
              );
            })}
          </nav>
        </aside>
        <main>{children}</main>
      </div>
    </div>
  );
}
