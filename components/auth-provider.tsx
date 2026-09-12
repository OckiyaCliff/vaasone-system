'use client'

import { createContext, useCallback, useContext, type ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { UserRole } from '@/lib/types'

export type AuthUser = {
  id: string
  email: string
  displayName: string
  initials: string
  organizationId: string | null
  organizationName: string | null
  role: UserRole
}

type AuthContextValue = {
  user: AuthUser
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children, user }: { children: ReactNode; user: AuthUser }) {
  const router = useRouter()

  const signOut = useCallback(async () => {
    await createClient().auth.signOut()
    router.push('/auth/login')
    router.refresh()
  }, [router])

  return (
    <AuthContext.Provider value={{ user, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
