'use client';

import { createContext, useContext, useState, useRef, ReactNode } from 'react';

interface AIPanelInputContextType {
  setInputText: (text: string) => void;
  sendMessage: (text: string) => Promise<void>;
}

const AIPanelInputContext = createContext<AIPanelInputContextType | undefined>(undefined);

export function AIPanelInputProvider({ 
  children,
  setInputValue,
  handleSendMessage
}: { 
  children: ReactNode;
  setInputValue: (text: string) => void;
  handleSendMessage: (text: string) => Promise<void>;
}) {
  const setInputText = (text: string) => {
    setInputValue(text);
  };

  const sendMessage = async (text: string) => {
    await handleSendMessage(text);
  };

  return (
    <AIPanelInputContext.Provider value={{
      setInputText,
      sendMessage
    }}>
      {children}
    </AIPanelInputContext.Provider>
  );
}

export function useAIPanelInput() {
  const context = useContext(AIPanelInputContext);
  if (context === undefined) {
    throw new Error('useAIPanelInput must be used within an AIPanelInputProvider');
  }
  return context;
}
