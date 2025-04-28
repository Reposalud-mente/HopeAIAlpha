'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface NavbarContextType {
  isExpanded: boolean;
  isHoverExpanded: boolean;
  toggleExpanded: () => void;
  setExpanded: (value: boolean) => void; // Added direct setter for more control
  handleMouseEnter: () => void;
  handleMouseLeave: () => void;
}

const NAVBAR_STATE_KEY = 'navbar_expanded_state';
const NavbarContext = createContext<NavbarContextType | undefined>(undefined);

// Helper to get initial state from localStorage if available
const getInitialState = (): boolean => {
  if (typeof window !== 'undefined') {
    const savedState = localStorage.getItem(NAVBAR_STATE_KEY);
    if (savedState !== null) {
      return savedState === 'true';
    }
  }
  return true; // Default to expanded
};

export function NavbarProvider({ children }: { children: ReactNode }) {
  const [isExpanded, setIsExpanded] = useState(getInitialState);
  const [isHoverExpanded, setIsHoverExpanded] = useState(false);
  const [hoverTimer, setHoverTimer] = useState<NodeJS.Timeout | null>(null);

  // Save state to localStorage when it changes
  // Only save permanent state changes (not hover-based ones)
  useEffect(() => {
    if (typeof window !== 'undefined' && !isHoverExpanded) {
      localStorage.setItem(NAVBAR_STATE_KEY, String(isExpanded));
    }
  }, [isExpanded, isHoverExpanded]);

  const toggleExpanded = () => {
    // Clear any hover timers when manually toggling
    if (hoverTimer) {
      clearTimeout(hoverTimer);
      setHoverTimer(null);
    }
    setIsHoverExpanded(false); // Reset hover state
    setIsExpanded(prev => !prev);
  };

  const setExpanded = (value: boolean) => {
    setIsHoverExpanded(false); // Reset hover state
    setIsExpanded(value);
  };

  const handleMouseEnter = () => {
    // Only trigger expansion on hover if sidebar is currently collapsed
    if (!isExpanded) {
      // Add a small delay to prevent accidental triggers
      const timer = setTimeout(() => {
        setIsHoverExpanded(true);
        setIsExpanded(true);
      }, 300); // 300ms delay before expanding
      setHoverTimer(timer);
    }
  };

  const handleMouseLeave = () => {
    // Clear any pending hover timers
    if (hoverTimer) {
      clearTimeout(hoverTimer);
      setHoverTimer(null);
    }

    // If the expansion was triggered by hover, collapse it after a delay
    if (isHoverExpanded) {
      const timer = setTimeout(() => {
        setIsHoverExpanded(false);
        setIsExpanded(false);
      }, 500); // 500ms delay before collapsing
      setHoverTimer(timer);
    }
  };

  return (
    <NavbarContext.Provider value={{
      isExpanded,
      isHoverExpanded,
      toggleExpanded,
      setExpanded,
      handleMouseEnter,
      handleMouseLeave
    }}>
      {children}
    </NavbarContext.Provider>
  );
}

export function useNavbar() {
  const context = useContext(NavbarContext);
  if (context === undefined) {
    throw new Error('useNavbar must be used within a NavbarProvider');
  }
  return context;
}