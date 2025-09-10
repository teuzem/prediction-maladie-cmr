import React from 'react'
import { useAuth } from '../contexts/AuthContext'
import { ParentProfile } from '../components/dashboard/ParentProfile'
import { DoctorProfile } from '../components/dashboard/DoctorProfile'

export function ProfilePage() {
  const { profile, loading } = useAuth()

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600"></div></div>
  }

  return (
    <div className="min-h-screen bg-secondary-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {profile?.role === 'doctor' ? <DoctorProfile /> : <ParentProfile />}
      </div>
    </div>
  )
}
