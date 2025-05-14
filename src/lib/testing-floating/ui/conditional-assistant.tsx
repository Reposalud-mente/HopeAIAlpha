'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { usePathname } from 'next/navigation'
import { AssistantProvider } from '../state/assistant-context'
import { FloatingAssistant } from './floating-assistant'

interface ConditionalEnhancedAssistantProps {
  patientName?: string;
  initialQuestion?: string;
}

/**
 * Conditional Enhanced AI Assistant that only renders when a user is authenticated
 * This component prevents the AI assistant from appearing on the login page
 * and other unauthenticated routes.
 */
export function ConditionalEnhancedAssistant({
  patientName,
  initialQuestion
}: ConditionalEnhancedAssistantProps) {
  const { user, loading } = useAuth()
  const [mounted, setMounted] = useState(false)
  const pathname = usePathname()

  // Only render on client-side to avoid hydration issues
  useEffect(() => {
    setMounted(true)

    // Log authentication status for debugging
    console.log('Authentication status:', {
      authenticated: !!user,
      userId: user?.id,
      pathname
    });

    // Check if API key is available
    if (typeof window !== 'undefined') {
      const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || localStorage.getItem('GEMINI_API_KEY');
      console.log('API key available:', !!apiKey);

      if (!apiKey && process.env.NODE_ENV === 'development') {
        console.warn('No API key found. The AI assistant will not function properly.');
        console.warn('Please set the NEXT_PUBLIC_GEMINI_API_KEY environment variable or use the API Key button.');
      }
    }
  }, [user, pathname])

  // Extract current section and page from pathname
  const pathParts = pathname.split('/').filter(Boolean)
  const currentSection = pathParts[0] || ''
  const currentPage = pathParts[1] || ''

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
  return (
    <AssistantProvider>
      <FloatingAssistant
        patientName={patientName}
        initialQuestion={initialQuestion}
        currentSection={currentSection}
        currentPage={currentPage}
      />
    </AssistantProvider>
  )
}
