'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

export function DemoNav() {
  const pathname = usePathname();
  
  const navItems = [
    {
      name: 'Demo Interactiva',
      href: '/rag-report-demo',
    },
    {
      name: 'Demo de Servidor',
      href: '/rag-report-demo/server-demo',
    },
  ];
  
  return (
    <nav className="flex space-x-4 mb-8">
      {navItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            'px-3 py-2 rounded-md text-sm font-medium transition-colors',
            pathname === item.href
              ? 'bg-primary text-primary-foreground'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted'
          )}
        >
          {item.name}
        </Link>
      ))}
    </nav>
  );
}
