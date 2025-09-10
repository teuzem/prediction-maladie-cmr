import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { Layout } from './components/layout/Layout'
import { HomePage } from './pages/HomePage'
import { PredictionPage } from './pages/PredictionPage'
import { DashboardPage } from './pages/dashboard/DashboardPage'
import { DoctorDashboardPage } from './pages/dashboard/DoctorDashboardPage'
import { ChildrenPage } from './pages/ChildrenPage'
import { AppointmentsPage } from './pages/AppointmentsPage'
import { MessagesPage } from './pages/MessagesPage'
import { DoctorsPage } from './pages/DoctorsPage'
import { AboutPage } from './pages/AboutPage'
import { ContactPage } from './pages/ContactPage'
import { ProtectedRoute } from './components/auth/ProtectedRoute'
import { PaymentPage } from './pages/PaymentPage'
import { VideoCallPage } from './pages/VideoCallPage'
import { BookAppointmentPage } from './pages/BookAppointmentPage'
import { ProfilePage } from './pages/ProfilePage'
import { PredictionHistoryPage } from './pages/dashboard/PredictionHistoryPage'
import { PatientListPage } from './pages/dashboard/PatientListPage'
import { EarningsPage } from './pages/dashboard/EarningsPage'

// Auth Pages
import { LoginPage } from './pages/auth/LoginPage'
import { RegisterPage } from './pages/auth/RegisterPage'
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage'
import { UpdatePasswordPage } from './pages/auth/UpdatePasswordPage'
import { VerifyEmailPage } from './pages/auth/VerifyEmailPage'
import { Setup2FAPage } from './pages/auth/Setup2FAPage'
import { Verify2FAPage } from './pages/auth/Verify2FAPage'

function AppRoutes() {
  const { user } = useAuth();
  
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Layout><HomePage /></Layout>} />
      <Route path="/about" element={<Layout><AboutPage /></Layout>} />
      <Route path="/contact" element={<Layout><ContactPage /></Layout>} />
      <Route path="/doctors" element={<Layout><DoctorsPage /></Layout>} />
      
      {/* Redirect authenticated users from auth pages */}
      <Route path="/auth/login" element={user ? <Navigate to="/dashboard" /> : <LoginPage />} />
      <Route path="/auth/register" element={user ? <Navigate to="/dashboard" /> : <RegisterPage />} />
      <Route path="/auth/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/auth/update-password" element={<UpdatePasswordPage />} />
      <Route path="/auth/verify-email" element={<VerifyEmailPage />} />
      
      {/* Protected Routes */}
      <Route path="/prediction" element={<ProtectedRoute><Layout><PredictionPage /></Layout></ProtectedRoute>} />
      <Route path="/dashboard" element={<ProtectedRoute requiredRole="parent"><Layout><DashboardPage /></Layout></ProtectedRoute>} />
      <Route path="/children" element={<ProtectedRoute requiredRole="parent"><Layout><ChildrenPage /></Layout></ProtectedRoute>} />
      <Route path="/history/predictions" element={<ProtectedRoute requiredRole="parent"><Layout><PredictionHistoryPage /></Layout></ProtectedRoute>} />
      
      <Route path="/doctor/dashboard" element={<ProtectedRoute requiredRole="doctor"><Layout><DoctorDashboardPage /></Layout></ProtectedRoute>} />
      <Route path="/doctor/patients" element={<ProtectedRoute requiredRole="doctor"><Layout><PatientListPage /></Layout></ProtectedRoute>} />
      <Route path="/doctor/earnings" element={<ProtectedRoute requiredRole="doctor"><Layout><EarningsPage /></Layout></ProtectedRoute>} />

      <Route path="/profile" element={<ProtectedRoute><Layout><ProfilePage /></Layout></ProtectedRoute>} />
      <Route path="/appointments" element={<ProtectedRoute><Layout><AppointmentsPage /></Layout></ProtectedRoute>} />
      <Route path="/messages" element={<ProtectedRoute><Layout showMobileNav={false} showFooter={false}><MessagesPage /></Layout></ProtectedRoute>} />
      <Route path="/payment" element={<ProtectedRoute><Layout showMobileNav={false}><PaymentPage /></Layout></ProtectedRoute>} />
      <Route path="/book-appointment/:doctorId" element={<ProtectedRoute requiredRole="parent"><Layout><BookAppointmentPage /></Layout></ProtectedRoute>} />
      <Route path="/call/:appointmentId" element={<ProtectedRoute><VideoCallPage /></ProtectedRoute>} />

      {/* 2FA Routes */}
      <Route path="/auth/setup-2fa" element={<ProtectedRoute requiredRole="doctor"><Setup2FAPage /></ProtectedRoute>} />
      <Route path="/auth/verify-2fa" element={<ProtectedRoute><Verify2FAPage /></ProtectedRoute>} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-secondary-50">
          <AppRoutes />
          <Toaster 
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: { background: '#fff', color: '#374151', borderRadius: '8px', border: '1px solid #d1d5db' },
              success: { iconTheme: { primary: '#22c55e', secondary: '#fff' } },
              error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
            }}
          />
        </div>
      </Router>
    </AuthProvider>
  )
}

export default App
