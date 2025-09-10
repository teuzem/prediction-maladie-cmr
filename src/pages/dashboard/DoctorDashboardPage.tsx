import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid } from 'recharts'
import { Stethoscope, Users, Calendar, DollarSign, TrendingUp, Clock, Star, Activity } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import toast from 'react-hot-toast'

interface DoctorDashboardStats {
  total_patients: number
  total_appointments: number
  total_revenue: number
  average_rating: number
  today_appointments: any[]
  recent_consultations: any[]
  revenue_trends: any[]
  appointment_stats: any[]
}

export function DoctorDashboardPage() {
  const [stats, setStats] = useState<DoctorDashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    if (user) {
      loadDoctorDashboard()
    }
  }, [user])

  const loadDoctorDashboard = async () => {
    if (!user) return
    try {
      const { data, error } = await supabase.rpc('get_doctor_dashboard_stats', {
        p_doctor_id: user.id
      })

      if (error) throw error

      setStats(data)
    } catch (error: any) {
      console.error('Error loading doctor dashboard:', error)
      toast.error(error.message || "Erreur lors du chargement du tableau de bord.")
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><div className="text-center"><div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600 mx-auto mb-4"></div><p className="text-secondary-600">Chargement de votre tableau de bord...</p></div></div>
  }

  const statCards = [
    { title: 'Patients total', value: stats?.total_patients || 0, icon: Users, color: 'text-blue-600', bgColor: 'bg-blue-50', borderColor: 'border-blue-200' },
    { title: 'Consultations', value: stats?.total_appointments || 0, icon: Stethoscope, color: 'text-green-600', bgColor: 'bg-green-50', borderColor: 'border-green-200' },
    { title: 'Revenus totaux', value: `${(stats?.total_revenue || 0).toLocaleString()} FCFA`, icon: DollarSign, color: 'text-purple-600', bgColor: 'bg-purple-50', borderColor: 'border-purple-200' },
    { title: 'Note moyenne', value: `${stats?.average_rating?.toFixed(1) || 'N/A'}/5`, icon: Star, color: 'text-yellow-600', bgColor: 'bg-yellow-50', borderColor: 'border-yellow-200' }
  ]

  const appointmentStats = [
    { status: 'Complétées', count: stats?.appointment_stats.find(s => s.status === 'completed')?.count || 0, color: '#10B981' },
    { status: 'Programmées', count: stats?.appointment_stats.find(s => s.status === 'scheduled')?.count || 0, color: '#3B82F6' },
    { status: 'Annulées', count: stats?.appointment_stats.find(s => s.status === 'cancelled')?.count || 0, color: '#EF4444' }
  ];

  return (
    <div className="min-h-screen bg-secondary-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8"><h1 className="text-3xl font-heading font-bold text-secondary-900 mb-2">Tableau de bord médecin</h1><p className="text-secondary-600">Gérez vos consultations et suivez vos performances</p></motion.div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((card, index) => {
            const Icon = card.icon
            return (<motion.div key={card.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }} className={`${card.bgColor} ${card.borderColor} border rounded-xl p-6`}><div className="flex items-center justify-between"><div><p className="text-sm font-medium text-secondary-600 mb-1">{card.title}</p><p className={`text-2xl font-bold ${card.color}`}>{card.value}</p></div><div className={`w-12 h-12 ${card.bgColor} rounded-lg flex items-center justify-center`}><Icon className={`w-6 h-6 ${card.color}`} /></div></div></motion.div>)
          })}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-white rounded-xl shadow-lg p-6"><h2 className="text-xl font-semibold text-secondary-900 mb-6 flex items-center"><TrendingUp className="w-5 h-5 mr-2 text-primary-600" />Évolution des revenus (6 derniers mois)</h2><ResponsiveContainer width="100%" height={300}><LineChart data={stats?.revenue_trends}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="month" /><YAxis /><Tooltip formatter={(value) => [`${value.toLocaleString()} FCFA`, 'Revenus']} /><Line type="monotone" dataKey="revenue" stroke="#8B5CF6" strokeWidth={3} dot={{ fill: '#8B5CF6', strokeWidth: 2, r: 6 }} /></LineChart></ResponsiveContainer></motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="bg-white rounded-xl shadow-lg p-6"><h2 className="text-xl font-semibold text-secondary-900 mb-6 flex items-center"><Activity className="w-5 h-5 mr-2 text-primary-600" />Statistiques des consultations</h2><ResponsiveContainer width="100%" height={300}><PieChart><Pie data={appointmentStats} cx="50%" cy="50%" outerRadius={100} dataKey="count" label={({ status, count }) => `${status}: ${count}`}>{appointmentStats.map((entry, index) => (<Cell key={`cell-${index}`} fill={entry.color} />))}</Pie><Tooltip /></PieChart></ResponsiveContainer></motion.div>
        </div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-secondary-900 mb-6 flex items-center"><Clock className="w-5 h-5 mr-2 text-primary-600" />Rendez-vous d'aujourd'hui</h2>
          <div className="space-y-4">
            {stats?.today_appointments && stats.today_appointments.length > 0 ? (stats.today_appointments.map((appointment) => (<div key={appointment.id} className="flex items-center justify-between p-4 border border-secondary-200 rounded-lg hover:bg-secondary-50 transition-colors"><div className="flex items-center space-x-4"><div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center"><Users className="w-6 h-6 text-primary-600" /></div><div><p className="font-medium text-secondary-900">{appointment.child_name || 'Patient'}</p><p className="text-sm text-secondary-600">Parent: {appointment.parent_name || 'Parent'}</p><p className="text-sm text-secondary-500">{new Date(appointment.appointment_date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })} • {appointment.duration_minutes} min</p></div></div><div className="text-right"><p className="text-lg font-semibold text-primary-600">{appointment.consultation_fee} FCFA</p><span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${appointment.status === 'scheduled' ? 'bg-blue-100 text-blue-800' : appointment.status === 'ongoing' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>{appointment.status === 'scheduled' ? 'Programmé' : appointment.status === 'ongoing' ? 'En cours' : 'Terminé'}</span></div></div>))) : (<div className="text-center py-8"><Clock className="w-12 h-12 text-secondary-300 mx-auto mb-3" /><p className="text-secondary-500">Aucun rendez-vous aujourd'hui</p></div>)}
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link to="/appointments" className="block bg-gradient-to-r from-primary-500 to-primary-600 text-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"><Calendar className="w-8 h-8 mb-3" /><h3 className="text-lg font-semibold mb-1">Gérer les RDV</h3><p className="text-primary-100 text-sm">Voir tous les rendez-vous</p></Link>
          <Link to="/doctor/patients" className="block bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"><Users className="w-8 h-8 mb-3" /><h3 className="text-lg font-semibold mb-1">Voir mes patients</h3><p className="text-blue-100 text-sm">Accéder à la liste des patients</p></Link>
          <Link to="/doctor/earnings" className="block bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"><DollarSign className="w-8 h-8 mb-3" /><h3 className="text-lg font-semibold mb-1">Suivi des revenus</h3><p className="text-green-100 text-sm">Consulter l'historique des gains</p></Link>
        </motion.div>
      </div>
    </div>
  )
}
