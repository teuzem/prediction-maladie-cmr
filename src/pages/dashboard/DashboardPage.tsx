import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Baby, Stethoscope, Calendar, Brain, TrendingUp } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import toast from 'react-hot-toast'

interface ParentDashboardStats {
  total_children: number
  total_predictions: number
  total_appointments: number
  pending_appointments: number
  recent_predictions: any[]
  upcoming_appointments: any[]
  health_trends: any[]
}

export function DashboardPage() {
  const [stats, setStats] = useState<ParentDashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    if (user) {
      loadDashboardData()
    }
  }, [user])

  const loadDashboardData = async () => {
    if (!user) return
    try {
      const { data, error } = await supabase.rpc('get_parent_dashboard_stats', {
        p_parent_id: user.id
      })

      if (error) throw error
      
      setStats(data)

    } catch (error: any) {
      console.error('Error loading dashboard data:', error)
      toast.error(error.message || "Erreur lors du chargement du tableau de bord.")
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-secondary-600">Chargement de votre tableau de bord...</p>
        </div>
      </div>
    )
  }

  const statCards = [
    { title: 'Enfants enregistrés', value: stats?.total_children || 0, icon: Baby, color: 'text-blue-600', bgColor: 'bg-blue-50', borderColor: 'border-blue-200' },
    { title: 'Prédictions IA', value: stats?.total_predictions || 0, icon: Brain, color: 'text-purple-600', bgColor: 'bg-purple-50', borderColor: 'border-purple-200' },
    { title: 'Consultations', value: stats?.total_appointments || 0, icon: Stethoscope, color: 'text-green-600', bgColor: 'bg-green-50', borderColor: 'border-green-200' },
    { title: 'RDV en attente', value: stats?.pending_appointments || 0, icon: Calendar, color: 'text-orange-600', bgColor: 'bg-orange-50', borderColor: 'border-orange-200' }
  ]

  return (
    <div className="min-h-screen bg-secondary-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-3xl font-heading font-bold text-secondary-900 mb-2">Tableau de bord</h1>
          <p className="text-secondary-600">Suivez la santé de vos enfants et gérez vos consultations médicales</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((card, index) => {
            const Icon = card.icon
            return (
              <motion.div key={card.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }} className={`${card.bgColor} ${card.borderColor} border rounded-xl p-6`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-secondary-600 mb-1">{card.title}</p>
                    <p className={`text-2xl font-bold ${card.color}`}>{card.value}</p>
                  </div>
                  <div className={`w-12 h-12 ${card.bgColor} rounded-lg flex items-center justify-center`}><Icon className={`w-6 h-6 ${card.color}`} /></div>
                </div>
              </motion.div>
            )
          })}
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-secondary-900 mb-6 flex items-center"><TrendingUp className="w-5 h-5 mr-2 text-primary-600" />Tendances de santé (6 derniers mois)</h2>
            <ResponsiveContainer width="100%" height={300}><LineChart data={stats?.health_trends}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="month" /><YAxis /><Tooltip /><Line type="monotone" dataKey="predictions" stroke="#8B5CF6" strokeWidth={2} name="Prédictions" /><Line type="monotone" dataKey="appointments" stroke="#10B981" strokeWidth={2} name="Consultations" /></LineChart></ResponsiveContainer>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-secondary-900 mb-6 flex items-center"><Brain className="w-5 h-5 mr-2 text-primary-600" />Prédictions récentes</h2>
            <div className="space-y-4">
              {stats?.recent_predictions && stats.recent_predictions.length > 0 ? (stats.recent_predictions.map((prediction) => (<div key={prediction.id} className="flex items-center justify-between p-4 bg-secondary-50 rounded-lg"><div className="flex items-center space-x-3"><div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center"><Brain className="w-5 h-5 text-primary-600" /></div><div><p className="font-medium text-secondary-900">{prediction.child_name || 'Enfant'}</p><p className="text-sm text-secondary-600">{prediction.disease_name || 'Maladie prédite'}</p></div></div><div className="text-right"><div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${prediction.severity_level === 'critical' ? 'bg-red-100 text-red-800' : prediction.severity_level === 'severe' ? 'bg-orange-100 text-orange-800' : prediction.severity_level === 'moderate' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>{prediction.severity_level || 'mild'}</div><p className="text-xs text-secondary-500 mt-1">{new Date(prediction.created_at).toLocaleDateString('fr-FR')}</p></div></div>))) : (<div className="text-center py-8"><Brain className="w-12 h-12 text-secondary-300 mx-auto mb-3" /><p className="text-secondary-500">Aucune prédiction récente</p></div>)}
            </div>
          </motion.div>
        </div>
        
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-secondary-900 mb-6 flex items-center"><Calendar className="w-5 h-5 mr-2 text-primary-600" />Prochains rendez-vous</h2>
          <div className="space-y-4">
            {stats?.upcoming_appointments && stats.upcoming_appointments.length > 0 ? (stats.upcoming_appointments.map((appointment) => (<div key={appointment.id} className="flex items-center justify-between p-4 border border-secondary-200 rounded-lg hover:bg-secondary-50 transition-colors"><div className="flex items-center space-x-4"><div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center"><Stethoscope className="w-6 h-6 text-green-600" /></div><div><p className="font-medium text-secondary-900">Dr. {appointment.doctor_name || 'Médecin'}</p><p className="text-sm text-secondary-600">{appointment.child_name || 'Enfant'} • {appointment.doctor_specialization?.[0] || 'Pédiatre'}</p><p className="text-sm text-secondary-500">{new Date(appointment.appointment_date).toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} à {new Date(appointment.appointment_date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</p></div></div><div className="text-right"><p className="text-lg font-semibold text-primary-600">{appointment.consultation_fee} FCFA</p><span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">Programmé</span></div></div>))) : (<div className="text-center py-8"><Calendar className="w-12 h-12 text-secondary-300 mx-auto mb-3" /><p className="text-secondary-500">Aucun rendez-vous programmé</p><Link to="/doctors" className="mt-4 inline-block px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">Prendre un rendez-vous</Link></div>)}
          </div>
        </motion.div>
        
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link to="/prediction" className="block bg-gradient-to-r from-primary-500 to-primary-600 text-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"><Brain className="w-8 h-8 mb-3" /><h3 className="text-lg font-semibold mb-1">Nouveau diagnostic</h3><p className="text-primary-100 text-sm">Utiliser l'IA pour analyser les symptômes</p></Link>
          <Link to="/children" className="block bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"><Baby className="w-8 h-8 mb-3" /><h3 className="text-lg font-semibold mb-1">Gérer mes enfants</h3><p className="text-blue-100 text-sm">Ajouter ou modifier un profil</p></Link>
          <Link to="/doctors" className="block bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"><Calendar className="w-8 h-8 mb-3" /><h3 className="text-lg font-semibold mb-1">Prendre RDV</h3><p className="text-green-100 text-sm">Consulter un médecin spécialiste</p></Link>
        </motion.div>
      </div>
    </div>
  )
}
