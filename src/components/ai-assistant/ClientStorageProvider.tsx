'use client';

/**
 * Client Storage Provider
 * 
 * This component provides a client-side wrapper for components that need
 * access to browser storage APIs like localStorage. It ensures that these
 * APIs are only accessed in a client-side context.
 */

import React, { ReactNode, useEffect, useState } from 'react';
import { getConversationSessionManager } from '@/lib/ai-assistant/conversation-session-manager';

interface ClientStorageProviderProps {
  userId?: string;
  children: ReactNode;
}

export function ClientStorageProvider({ userId, children }: ClientStorageProviderProps) {
  const [isLoaded, setIsLoaded] = useState(false);

  // Initialize the conversation session manager on the client side
  useEffect(() => {
    try {
      // Initialize the session manager with the user ID
      getConversationSessionManager(userId);
      
      // Mark as loaded
      setIsLoaded(true);
    } catch (error) {
      console.error('Error initializing client storage:', error);
      // Mark as loaded even on error to prevent blocking the UI
      setIsLoaded(true);
    }
  }, [userId]);

  // Show a loading state until the client storage is initialized
  if (!isLoaded) {
    return <div>Loading...</div>;
  }

  // Render the children once the client storage is initialized
  return <>{children}</>;
}
