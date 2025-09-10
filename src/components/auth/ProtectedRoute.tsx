import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRole?: 'parent' | 'doctor' | 'admin'
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { user, profile, loading, authState } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />
  }

  if (authState === 'AWAITING_2FA') {
    // Allow access only to the 2FA verification page
    if (location.pathname !== '/auth/verify-2fa') {
      return <Navigate to="/auth/verify-2fa" replace />
    }
  } else if (authState === 'LOGGED_IN') {
    // If user is logged in but tries to access 2FA page, redirect them
    if (location.pathname === '/auth/verify-2fa') {
      return <Navigate to={profile?.role === 'doctor' ? '/doctor/dashboard' : '/dashboard'} replace />
    }
    // Check role requirements
    if (requiredRole && profile?.role !== requiredRole) {
      return <Navigate to="/dashboard" replace /> // Or a dedicated "unauthorized" page
    }
  }

  return <>{children}</>
}
