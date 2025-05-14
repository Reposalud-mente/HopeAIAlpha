'use client';

import { Badge } from '@/components/ui/badge';

interface DemoBadgeProps {
  className?: string;
}

/**
 * Demo Badge Component
 * 
 * This component displays a badge indicating that an item is a demo item.
 * 
 * @param className Optional CSS class name for styling
 */
export function DemoBadge({ className = '' }: DemoBadgeProps) {
  return (
    <Badge 
      variant="outline" 
      className={`bg-amber-50 text-amber-700 border-amber-200 ${className}`}
    >
      Demo
    </Badge>
  );
}

/**
 * Check if a string indicates a demo item
 * 
 * @param str The string to check
 * @returns True if the string indicates a demo item
 */
export function isDemo(str?: string): boolean {
  if (!str) return false;
  
  // Check if the string contains "demo" or "test" case-insensitive
  return str.toLowerCase().includes('demo') || 
         str.toLowerCase().includes('test') ||
         str.toLowerCase().startsWith('ejemplo');
}
