'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { usePathname } from 'next/navigation'
import { FloatingAIAssistantWithProvider } from './ai-assistance-card'

/**
 * Conditional AI Assistant that only renders when a user is authenticated
 * This component prevents the AI assistant from appearing on the login page
 * and other unauthenticated routes.
 */
export function ConditionalAIAssistant() {
  const { data: session, status } = useSession()
  const [mounted, setMounted] = useState(false)
  const pathname = usePathname()

  // Only render on client-side to avoid hydration issues
  useEffect(() => {
    setMounted(true)
  }, [])

  // Check if the current path is a public route (login, register, landing page)
  const isPublicRoute = ['/', '/login', '/register'].includes(pathname)

  // Determine if we should show the assistant
  const showAssistant = mounted &&
                        status === 'authenticated' &&
                        session?.user?.id &&
                        !isPublicRoute

  // Don't render anything during initial loading, if not authenticated,
  // or if we're on a public route
  if (!showAssistant) {
    return null
  }

  // Only render the AI assistant if the user is authenticated and on a protected route
  return <FloatingAIAssistantWithProvider />
}
