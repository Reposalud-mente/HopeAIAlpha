'use client'

import { createContext, useContext, ReactNode } from 'react'
import { useSession, signIn, signOut } from 'next-auth/react'

type AuthContextType = {
  isAuthenticated: boolean
  isLoading: boolean
  user: any
  signIn: (email: string, password: string) => Promise<boolean>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession()
  
  const handleSignIn = async (email: string, password: string) => {
    const result = await signIn('credentials', {
      email,
      password,
      redirect: false
    })
    
    return result?.ok || false
  }
  
  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/login' })
  }
  
  return (
    <AuthContext.Provider value={{
      isAuthenticated: !!session,
      isLoading: status === 'loading',
      user: session?.user,
      signIn: handleSignIn,
      signOut: handleSignOut
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