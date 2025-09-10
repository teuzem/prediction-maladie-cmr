import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Home, Brain, Calendar, MessageCircle, User } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'

export function MobileNavigation() {
  const location = useLocation()
  const { user, profile } = useAuth()

  if (!user) return null

  const isActive = (path: string) => location.pathname === path

  const navigation = profile?.role === 'doctor' 
    ? [
        { name: 'Accueil', href: '/doctor/dashboard', icon: Home },
        { name: 'Patients', href: '/doctor/patients', icon: User },
        { name: 'Rendez-vous', href: '/doctor/appointments', icon: Calendar },
        { name: 'Messages', href: '/doctor/messages', icon: MessageCircle },
        { name: 'Profil', href: '/doctor/profile', icon: User },
      ]
    : [
        { name: 'Accueil', href: '/dashboard', icon: Home },
        { name: 'Prédiction', href: '/prediction', icon: Brain },
        { name: 'Rendez-vous', href: '/appointments', icon: Calendar },
        { name: 'Messages', href: '/messages', icon: MessageCircle },
        { name: 'Profil', href: '/profile', icon: User },
      ]

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-secondary-200 z-50 md:hidden">
      <div className="grid grid-cols-5 py-2">
        {navigation.map((item) => {
          const Icon = item.icon
          return (
            <Link
              key={item.name}
              to={item.href}
              className={`flex flex-col items-center py-2 px-3 text-xs transition-colors ${
                isActive(item.href)
                  ? 'text-primary-600'
                  : 'text-secondary-500 hover:text-primary-600'
              }`}
            >
              <Icon className={`w-5 h-5 mb-1 ${isActive(item.href) ? 'text-primary-600' : 'text-secondary-500'}`} />
              <span className={isActive(item.href) ? 'text-primary-600 font-medium' : 'text-secondary-500'}>
                {item.name}
              </span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
