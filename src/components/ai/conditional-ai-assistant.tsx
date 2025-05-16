'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { usePathname } from 'next/navigation'
import { PersistentAIPanelWithProvider } from './PersistentAIPanel'

/**
 * Conditional AI Assistant that only renders when a user is authenticated
 * This component prevents the AI assistant from appearing on the login page
 * and other unauthenticated routes.
 *
 * Now uses the persistent vertical panel implementation instead of the floating assistant.
 */
export function ConditionalAIAssistant() {
  const { user, loading } = useAuth()
  const [mounted, setMounted] = useState(false)
  const pathname = usePathname()

  // Only render on client-side to avoid hydration issues
  useEffect(() => {
    setMounted(true)
  }, [])

  // Check if the current path is a public route (login, register, landing page)
  const isPublicRoute = ['/', '/login', '/register', '/auth/login', '/auth/signup'].includes(pathname)

  // Determine if we should show the assistant
  const showAssistant = mounted &&
                        !loading &&
                        user?.id &&
                        !isPublicRoute

  // Don't render anything during initial loading, if not authenticated,
  // or if we're on a public route
  if (!showAssistant) {
    return null
  }

  // Only render the AI assistant if the user is authenticated and on a protected route
  return <PersistentAIPanelWithProvider />
}
