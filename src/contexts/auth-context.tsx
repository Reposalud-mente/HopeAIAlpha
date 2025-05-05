'use client'

import { createContext, useContext, ReactNode } from 'react'
import { useSession, signIn, signOut } from 'next-auth/react'
import { resetAllTypewriterAnimations } from '@/utils/typewriter-utils'

type RegisterData = {
  email: string
  password: string
  firstName: string
  lastName: string
  licenseNumber?: string
  specialty?: string
}

type AuthContextType = {
  isAuthenticated: boolean
  isLoading: boolean
  user: any
  signIn: (email: string, password: string) => Promise<boolean>
  signOut: () => Promise<void>
  register: (data: RegisterData) => Promise<boolean>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession()

  const handleSignIn = async (email: string, password: string) => {
    const result = await signIn('credentials', {
      email,
      password,
      redirect: true,
      callbackUrl: '/dashboard'
    })

    // This will only be reached if redirect is prevented
    return result?.ok || false
  }

  const handleSignOut = async () => {
    // Reset any typewriter animations when logging out
    // This ensures animations will play again on next login
    resetAllTypewriterAnimations();

    await signOut({ callbackUrl: '/login' })
  }

  const handleRegister = async (data: RegisterData) => {
    try {
      // Register the user
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error al registrar usuario')
      }

      return true
    } catch (error) {
      console.error('Registration error:', error)
      return false
    }
  }

  return (
    <AuthContext.Provider value={{
      isAuthenticated: !!session,
      isLoading: status === 'loading',
      user: session?.user,
      signIn: handleSignIn,
      signOut: handleSignOut,
      register: handleRegister
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