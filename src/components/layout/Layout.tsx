import React from 'react'
import { Header } from './Header'
import { Footer } from './Footer'
import { MobileNavigation } from './MobileNavigation'

interface LayoutProps {
  children: React.ReactNode
  showMobileNav?: boolean
  showFooter?: boolean
}

export function Layout({ children, showMobileNav = true, showFooter = true }: LayoutProps) {
  return (
    <div className="min-h-screen bg-secondary-50 flex flex-col">
      <Header />
      <main className="flex-1 w-full">
        {children}
      </main>
      {showFooter && <Footer />}
      {showMobileNav && <MobileNavigation />}
    </div>
  )
}
