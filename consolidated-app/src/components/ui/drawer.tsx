import React, { ReactNode, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import styles from './drawer.module.css';

interface DrawerProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
}

const Drawer = ({ open, onClose, children }: DrawerProps) => {
  const drawerRef = useRef<HTMLDivElement>(null);

  // Focus trap and Esc to close
  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
      if (e.key === 'Tab') {
        // Focus trap
        const focusableEls = drawerRef.current?.querySelectorAll<HTMLElement>(
          'a, button, textarea, input, select, [tabindex]:not([tabindex="-1"])'
        );
        if (!focusableEls || focusableEls.length === 0) return;
        const firstEl = focusableEls[0];
        const lastEl = focusableEls[focusableEls.length - 1];
        if (document.activeElement === lastEl && !e.shiftKey) {
          e.preventDefault();
          firstEl.focus();
        } else if (document.activeElement === firstEl && e.shiftKey) {
          e.preventDefault();
          lastEl.focus();
        }
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    // Focus first element
    setTimeout(() => {
      const el = drawerRef.current?.querySelector<HTMLElement>('a, button, [tabindex]:not([tabindex="-1"])');
      el?.focus();
    }, 100);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  return (
    <div>
      {/* Overlay */}
      <div
        className={cn(
          'fixed inset-0 bg-black bg-opacity-30 z-50 transition-opacity duration-300',
          open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        )}
        onClick={onClose}
        aria-hidden={open ? 'false' : 'true'}
      />
      {/* Drawer Panel */}
      <aside
        ref={drawerRef}
        className={cn(
          'fixed top-0 left-0 h-full w-64 bg-white shadow-lg z-50 transform transition-transform duration-300 focus:outline-none',
          open ? 'translate-x-0' : '-translate-x-full',
          styles.drawerPanelScrollable
        )}
        aria-modal="true"
        role="dialog"
        tabIndex={-1}
        aria-hidden={open ? 'false' : 'true'}
      >
        {children}
      </aside>
    </div>
  );
};

export default Drawer;

