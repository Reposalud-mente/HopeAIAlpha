/**
 * Hook for managing demo mode
 * 
 * This hook provides functions to check if a user needs demo data and to populate demo data.
 */

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { trackEvent, EventType } from '@/lib/monitoring';

interface UseDemoModeReturn {
  isLoading: boolean;
  needsDemoData: boolean;
  populateDemoData: () => Promise<void>;
  error: string | null;
}

export function useDemoMode(): UseDemoModeReturn {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [needsDemoData, setNeedsDemoData] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Check if the user needs demo data
  const checkNeedsDemoData = useCallback(async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/demo/populate');
      
      if (!response.ok) {
        throw new Error('Failed to check if user needs demo data');
      }

      const data = await response.json();
      setNeedsDemoData(data.needsDemoData);
    } catch (err) {
      console.error('Error checking if user needs demo data:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      
      trackEvent({
        type: EventType.ERROR,
        name: 'demo_check_error_client',
        data: {
          error: err instanceof Error ? err.message : 'Unknown error',
        },
      });
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Populate demo data
  const populateDemoData = useCallback(async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/demo/populate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to populate demo data');
      }

      // After populating demo data, the user no longer needs it
      setNeedsDemoData(false);

      trackEvent({
        type: EventType.USER_ACTION,
        name: 'demo_data_populated_client',
        data: {
          userId: user.id,
        },
      });
    } catch (err) {
      console.error('Error populating demo data:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      
      trackEvent({
        type: EventType.ERROR,
        name: 'demo_populate_error_client',
        data: {
          error: err instanceof Error ? err.message : 'Unknown error',
        },
      });
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Check if the user needs demo data when the user changes
  useEffect(() => {
    if (user) {
      checkNeedsDemoData();
    }
  }, [user, checkNeedsDemoData]);

  return {
    isLoading,
    needsDemoData,
    populateDemoData,
    error,
  };
}
