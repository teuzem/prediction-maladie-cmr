import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Calendar, Clock, Video, DollarSign, CheckCircle, XCircle, AlertCircle, User, Stethoscope, FileText } from 'lucide-react'
import { supabase, Appointment } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import toast from 'react-hot-toast'

export function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'scheduled' | 'completed' | 'cancelled'>('all')
  const { user, profile } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (user) {
      loadAppointments()
    }
  }, [user, filter])

  const loadAppointments = async () => {
    try {
      const isDoctor = profile?.role === 'doctor'
      let query = supabase
        .from('appointments')
        .select(`
          *,
          child:children(name, date_of_birth),
          doctor:doctors(
            id,
            specialization,
            profile:user_profiles(full_name, phone)
          ),
          parent:user_profiles!appointments_parent_id_fkey(full_name, phone),
          payment:payments(payment_status, amount)
        `)

      if (isDoctor) {
        query = query.eq('doctor_id', user?.id)
      } else {
        query = query.eq('parent_id', user?.id)
      }

      if (filter !== 'all') {
        query = query.eq('status', filter)
      }

      const { data, error } = await query.order('appointment_date', { ascending: false })

      if (error) throw error
      setAppointments(data || [])
    } catch (error) {
      console.error('Error loading appointments:', error)
      toast.error('Erreur lors du chargement des rendez-vous')
    } finally {
      setLoading(false)
    }
  }

  const updateAppointmentStatus = async (appointmentId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('appointments')
        .update({ status })
        .eq('id', appointmentId)

      if (error) throw error
      toast.success('Statut mis à jour avec succès')
      loadAppointments()
    } catch (error) {
      console.error('Error updating appointment:', error)
      toast.error('Erreur lors de la mise à jour')
    }
  }

  const goToPayment = (appointment: Appointment) => {
    navigate('/payment', { state: { appointment } })
  }

  const startVideoCall = (appointment: Appointment) => {
    toast.success('Lancement de la consultation vidéo...')
    updateAppointmentStatus(appointment.id, 'ongoing')
    navigate(`/call/${appointment.id}`, { state: { appointment } })
  }

  const writeReport = (appointmentId: string) => {
    const report = prompt("Veuillez rédiger le rapport de consultation :");
    if (report) {
      // In a real app, this would open a dedicated report editor
      // and save the report to the database.
      toast.success("Rapport enregistré (simulation).");
      updateAppointmentStatus(appointmentId, 'completed');
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800'
      case 'ongoing':
        return 'bg-green-100 text-green-800'
      case 'completed':
        return 'bg-gray-100 text-gray-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      case 'no_show':
        return 'bg-orange-100 text-orange-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'Programmé'
      case 'ongoing':
        return 'En cours'
      case 'completed':
        return 'Terminé'
      case 'cancelled':
        return 'Annulé'
      case 'no_show':
        return 'Absent'
      default:
        return status
    }
  }

  const isDoctor = profile?.role === 'doctor'

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-secondary-600">Chargement des rendez-vous...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-secondary-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-heading font-bold text-secondary-900 mb-2">
            {isDoctor ? 'Mes consultations' : 'Mes rendez-vous'}
          </h1>
          <p className="text-secondary-600">
            {isDoctor ? 'Gérez vos consultations avec vos patients' : 'Suivez vos consultations médicales'}
          </p>
        </motion.div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-8">
          {[
            { key: 'all', label: 'Tous' },
            { key: 'scheduled', label: 'Programmés' },
            { key: 'completed', label: 'Terminés' },
            { key: 'cancelled', label: 'Annulés' }
          ].map((filterOption) => (
            <button
              key={filterOption.key}
              onClick={() => setFilter(filterOption.key as any)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === filterOption.key
                  ? 'bg-primary-600 text-white'
                  : 'bg-white text-secondary-700 hover:bg-primary-50'
              }`}
            >
              {filterOption.label}
            </button>
          ))}
        </div>

        {/* Appointments List */}
        {appointments.length > 0 ? (
          <div className="space-y-6">
            {appointments.map((appointment, index) => {
              const isPaid = appointment.payment?.[0]?.payment_status === 'completed'
              return (
                <motion.div
                  key={appointment.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                    <div className="flex items-start space-x-4">
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                        isDoctor ? 'bg-blue-100' : 'bg-green-100'
                      }`}>
                        {isDoctor ? (
                          <User className={`w-6 h-6 ${isDoctor ? 'text-blue-600' : 'text-green-600'}`} />
                        ) : (
                          <Stethoscope className="w-6 h-6 text-green-600" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-semibold text-secondary-900">
                            {isDoctor 
                              ? `${appointment.child?.name || 'Patient'} (avec ${appointment.parent?.full_name || 'Parent'})`
                              : `Dr. ${appointment.doctor?.profile?.full_name || 'Médecin'}`
                            }
                          </h3>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                            {getStatusText(appointment.status)}
                          </span>
                        </div>
                        
                        <div className="flex flex-wrap gap-4 text-sm text-secondary-600">
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-1" />
                            {new Date(appointment.appointment_date).toLocaleDateString('fr-FR', {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </div>
                          <div className="flex items-center">
                            <Clock className="w-4 h-4 mr-1" />
                            {new Date(appointment.appointment_date).toLocaleTimeString('fr-FR', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })} ({appointment.duration_minutes} min)
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col lg:items-end space-y-4">
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <p className="text-lg font-semibold text-primary-600">
                            {appointment.consultation_fee} FCFA
                          </p>
                          <p className={`text-xs ${isPaid ? 'text-green-600' : 'text-orange-600'}`}>
                            {isPaid ? 'Payé' : 'Paiement requis'}
                          </p>
                        </div>
                      </div>

                      <div className="flex space-x-3">
                        {!isPaid && !isDoctor && appointment.status === 'scheduled' && (
                          <button
                            onClick={() => goToPayment(appointment)}
                            className="flex items-center px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                          >
                            <DollarSign className="w-4 h-4 mr-2" />
                            Payer maintenant
                          </button>
                        )}
                        {appointment.status === 'scheduled' && isPaid && (
                          <button
                            onClick={() => startVideoCall(appointment)}
                            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                          >
                            <Video className="w-4 h-4 mr-2" />
                            {isDoctor ? 'Démarrer' : 'Rejoindre'}
                          </button>
                        )}
                        {isDoctor && appointment.status === 'ongoing' && (
                          <button
                            onClick={() => writeReport(appointment.id)}
                            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                          >
                            <FileText className="w-4 h-4 mr-2" />
                            Rédiger Rapport
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <div className="w-24 h-24 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Calendar className="w-12 h-12 text-primary-600" />
            </div>
            <h3 className="text-xl font-semibold text-secondary-900 mb-2">
              Aucun rendez-vous trouvé
            </h3>
            <p className="text-secondary-600 mb-6">
              {filter === 'all' 
                ? 'Vous n\'avez pas encore de rendez-vous programmés'
                : `Aucun rendez-vous ${getStatusText(filter).toLowerCase()} trouvé`
              }
            </p>
            {!isDoctor && (
              <button onClick={() => navigate('/doctors')} className="px-6 py-3 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors">
                Prendre un rendez-vous
              </button>
            )}
          </motion.div>
        )}
      </div>
    </div>
  )
}
