"use client"

import React, { createContext, useContext, useEffect, useState } from 'react'
import { 
  FeatureFlag, 
  isFeatureEnabled, 
  enableFeature, 
  disableFeature, 
  loadFeatureFlags 
} from '@/lib/feature-flags'

interface FeatureFlagContextType {
  isEnabled: (flag: FeatureFlag) => boolean
  enableFeature: (flag: FeatureFlag) => void
  disableFeature: (flag: FeatureFlag) => void
  refreshFlags: () => void
}

const FeatureFlagContext = createContext<FeatureFlagContextType>({
  isEnabled: () => false,
  enableFeature: () => {},
  disableFeature: () => {},
  refreshFlags: () => {},
})

export const useFeatureFlags = () => useContext(FeatureFlagContext)

interface FeatureFlagProviderProps {
  children: React.ReactNode
}

export function FeatureFlagProvider({ children }: FeatureFlagProviderProps) {
  const [flags, setFlags] = useState<Record<FeatureFlag, boolean>>({} as Record<FeatureFlag, boolean>)
  
  // Initialize flags
  useEffect(() => {
    loadFeatureFlags()
    refreshFlags()
    
    // Listen for changes in localStorage (for cross-tab synchronization)
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'featureFlags') {
        refreshFlags()
      }
    }
    
    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])
  
  // Refresh all flags
  const refreshFlags = () => {
    const newFlags = {} as Record<FeatureFlag, boolean>
    
    // Check each flag
    Object.values(FeatureFlag).forEach(flag => {
      newFlags[flag as FeatureFlag] = isFeatureEnabled(flag as FeatureFlag)
    })
    
    setFlags(newFlags)
  }
  
  // Check if a feature is enabled
  const checkFeature = (flag: FeatureFlag): boolean => {
    return flags[flag] ?? isFeatureEnabled(flag)
  }
  
  // Enable a feature
  const enable = (flag: FeatureFlag) => {
    enableFeature(flag)
    setFlags(prev => ({ ...prev, [flag]: true }))
  }
  
  // Disable a feature
  const disable = (flag: FeatureFlag) => {
    disableFeature(flag)
    setFlags(prev => ({ ...prev, [flag]: false }))
  }
  
  return (
    <FeatureFlagContext.Provider
      value={{
        isEnabled: checkFeature,
        enableFeature: enable,
        disableFeature: disable,
        refreshFlags,
      }}
    >
      {children}
    </FeatureFlagContext.Provider>
  )
}

/**
 * Component that conditionally renders content based on a feature flag
 */
interface FeatureFlaggedProps {
  flag: FeatureFlag
  children: React.ReactNode
  fallback?: React.ReactNode
}

export function FeatureFlagged({ flag, children, fallback = null }: FeatureFlaggedProps) {
  const { isEnabled } = useFeatureFlags()
  
  if (isEnabled(flag)) {
    return <>{children}</>
  }
  
  return <>{fallback}</>
}
