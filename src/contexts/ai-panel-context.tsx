'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface AIPanelContextType {
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
  toggleCollapsed: () => void;
}

const AIPanelContext = createContext<AIPanelContextType | undefined>(undefined);

const AI_PANEL_STATE_KEY = 'ai_panel_collapsed_state';

// Helper to get initial state from localStorage if available
const getInitialState = (): boolean => {
  if (typeof window !== 'undefined') {
    const savedState = localStorage.getItem(AI_PANEL_STATE_KEY);
    if (savedState !== null) {
      return savedState === 'true';
    }
  }
  return false; // Default to expanded
};

export function AIPanelProvider({ children }: { children: ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState(getInitialState);

  // Save state to localStorage when it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(AI_PANEL_STATE_KEY, String(isCollapsed));
    }
  }, [isCollapsed]);

  const toggleCollapsed = () => {
    setIsCollapsed(prev => !prev);
  };

  return (
    <AIPanelContext.Provider value={{
      isCollapsed,
      setIsCollapsed,
      toggleCollapsed
    }}>
      {children}
    </AIPanelContext.Provider>
  );
}

export function useAIPanel() {
  const context = useContext(AIPanelContext);
  if (context === undefined) {
    throw new Error('useAIPanel must be used within an AIPanelProvider');
  }
  return context;
}
