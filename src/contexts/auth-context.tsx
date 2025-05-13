'use client'

import { createContext, useContext, ReactNode, useCallback, useState, useEffect } from 'react'
import { resetAllTypewriterAnimations } from '@/utils/typewriter-utils'
import { DEFAULT_ROLE } from '@/lib/auth/auth0-config'

// Define the user role type
export type UserRole = 'PSYCHOLOGIST' | 'SUPERVISOR' | 'ADMIN'

// Define the user type
export type AuthUser = {
  id: string
  email: string
  name: string
  firstName?: string
  lastName?: string
  role: UserRole
  picture?: string
  [key: string]: any
}

type AuthContextType = {
  isAuthenticated: boolean
  isLoading: boolean
  user: AuthUser | null
  error: Error | undefined
  loginWithAuth0: (returnTo?: string) => void
  logoutWithAuth0: (returnTo?: string) => void
  hasRole: (roles: UserRole | UserRole[]) => boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<any>(null)
  const [error, setError] = useState<Error | undefined>(undefined)
  const [isLoading, setIsLoading] = useState<boolean>(true)

  // Fetch user profile from Auth0
  useEffect(() => {
    async function fetchUserProfile() {
      try {
        setIsLoading(true)
        const response = await fetch('/api/auth/profile')
        if (response.ok) {
          const userData = await response.json()
          setUser(userData)
        } else {
          setUser(null)
        }
      } catch (err) {
        setError(err as Error)
        console.error('Error fetching user profile:', err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchUserProfile()
  }, [])

  // Format the Auth0 user to match our application's user structure
  const formattedUser: AuthUser | null = user ? {
    id: user.sub || '',
    email: user.email || '',
    name: user.name || '',
    firstName: user.given_name || user.name?.split(' ')[0] || '',
    lastName: user.family_name || user.name?.split(' ').slice(1).join(' ') || '',
    role: (user.role || DEFAULT_ROLE) as UserRole,
    picture: user.picture,
    ...user
  } : null

  // Login with Auth0
  const loginWithAuth0 = useCallback((returnTo?: string) => {
    const url = returnTo
      ? `/api/auth/login?returnTo=${encodeURIComponent(returnTo)}`
      : '/api/auth/login'
    window.location.href = url
  }, [])

  // Logout with Auth0
  const logoutWithAuth0 = useCallback((returnTo?: string) => {
    // Reset any typewriter animations when logging out
    resetAllTypewriterAnimations()

    // Redirect to Auth0 logout
    const url = returnTo
      ? `/api/auth/logout?returnTo=${encodeURIComponent(returnTo)}`
      : '/api/auth/logout'
    window.location.href = url
  }, [])

  // Check if user has required role(s)
  const hasRole = useCallback((roles: UserRole | UserRole[]): boolean => {
    if (!formattedUser) return false

    const userRole = formattedUser.role
    const allowedRoles = Array.isArray(roles) ? roles : [roles]

    return allowedRoles.includes(userRole)
  }, [formattedUser])

  return (
    <AuthContext.Provider value={{
      isAuthenticated: !!user,
      isLoading,
      user: formattedUser,
      error,
      loginWithAuth0,
      logoutWithAuth0,
      hasRole
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}