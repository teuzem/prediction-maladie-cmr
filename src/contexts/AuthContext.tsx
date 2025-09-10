import React, { createContext, useContext, useEffect, useState } from 'react'
import { authService, AuthState } from '../lib/auth'
import { UserProfile } from '../lib/supabase'

interface AuthContextType extends AuthState {
  signUp: (email: string, password: string, userData: { full_name: string; role?: string; phone?: string }) => Promise<any>
  signIn: (email: string, password: string) => Promise<{ error: any; needs2FA: boolean }>
  signOut: () => Promise<any>
  sendPasswordResetEmail: (email: string) => Promise<any>
  updateUserPassword: (password: string) => Promise<any>
  enroll2FA: () => Promise<any>
  verify2FA: (token: string) => Promise<any>
  updateProfile: (updates: Partial<UserProfile>) => Promise<any>
  setProfile: React.Dispatch<React.SetStateAction<UserProfile | null>>
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [authState, setAuthState] = useState<AuthState['authState']>('LOGGED_OUT')

  useEffect(() => {
    const { data: { subscription } } = authService.onAuthStateChange((state) => {
      setUser(state.user)
      setProfile(state.profile)
      setAuthState(state.authState)
      setLoading(state.loading)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signUp = async (email: string, password: string, userData: { full_name: string; role?: string; phone?: string }) => {
    return authService.signUp(email, password, userData)
  }

  const signIn = async (email: string, password: string) => {
    const result = await authService.signIn(email, password)
    if (result.needs2FA) {
      setAuthState('AWAITING_2FA')
    }
    return result
  }

  const signOut = async () => {
    await authService.signOut()
    setUser(null)
    setProfile(null)
    setAuthState('LOGGED_OUT')
  }

  const sendPasswordResetEmail = async (email: string) => {
    return authService.sendPasswordResetEmail(email)
  }

  const updateUserPassword = async (password: string) => {
    return authService.updateUserPassword(password)
  }

  const enroll2FA = async () => {
    return authService.enroll2FA()
  }

  const verify2FA = async (token: string) => {
    const result = await authService.verify2FA(token)
    if (!result.error) {
      setAuthState('LOGGED_IN')
    }
    return result
  }

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) return { error: 'No user logged in' }
    
    const result = await authService.updateProfile(user.id, updates)
    if (result.data) {
      setProfile(result.data)
    }
    return result
  }

  const value: AuthContextType = {
    user,
    profile,
    loading,
    authState,
    signUp,
    signIn,
    signOut,
    sendPasswordResetEmail,
    updateUserPassword,
    enroll2FA,
    verify2FA,
    updateProfile,
    setProfile
  }

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
