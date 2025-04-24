'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface NavbarContextType {
  isExpanded: boolean;
  toggleExpanded: () => void;
  setExpanded: (value: boolean) => void; // Added direct setter for more control
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

  // Save state to localStorage when it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(NAVBAR_STATE_KEY, String(isExpanded));
    }
  }, [isExpanded]);

  const toggleExpanded = () => {
    setIsExpanded(prev => !prev);
  };

  const setExpanded = (value: boolean) => {
    setIsExpanded(value);
  };

  return (
    <NavbarContext.Provider value={{ isExpanded, toggleExpanded, setExpanded }}>
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