import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Users, Search, Phone, Mail } from 'lucide-react'
import { supabase, UserProfile } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import toast from 'react-hot-toast'

export function PatientListPage() {
  const [patients, setPatients] = useState<UserProfile[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    if (user) {
      loadPatients()
    }
  }, [user])

  const loadPatients = async () => {
    try {
      // Get all appointments for the current doctor
      const { data: appointments, error: appointmentsError } = await supabase
        .from('appointments')
        .select('parent_id')
        .eq('doctor_id', user?.id)
      
      if (appointmentsError) throw appointmentsError

      const patientIds = Array.from(new Set(appointments.map(a => a.parent_id)))

      if (patientIds.length === 0) {
        setPatients([])
        return
      }

      // Fetch profiles for these unique patient IDs
      const { data: patientProfiles, error: profilesError } = await supabase
        .from('user_profiles')
        .select('*')
        .in('id', patientIds)
      
      if (profilesError) throw profilesError
      setPatients(patientProfiles || [])

    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600"></div></div>
  }

  return (
    <div className="min-h-screen bg-secondary-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-3xl font-heading font-bold text-secondary-900 mb-2">Mes Patients</h1>
          <p className="text-secondary-600">Gérez la liste de tous les parents qui ont consulté avec vous.</p>
        </motion.div>

        {patients.length > 0 ? (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <table className="min-w-full divide-y divide-secondary-200">
              <thead className="bg-secondary-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">Patient</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">Contact</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">Localisation</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-secondary-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-secondary-200">
                {patients.map((patient, index) => (
                  <motion.tr key={patient.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: index * 0.05 }}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center font-bold text-primary-600">{patient.full_name.charAt(0)}</div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-secondary-900">{patient.full_name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-secondary-900 flex items-center"><Mail className="w-4 h-4 mr-2 text-secondary-400"/>{patient.email}</div>
                      <div className="text-sm text-secondary-500 flex items-center"><Phone className="w-4 h-4 mr-2 text-secondary-400"/>{patient.phone || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-500">{patient.location || 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button className="text-primary-600 hover:text-primary-900">Voir l'historique</button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center py-16">
            <div className="w-24 h-24 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6"><Users className="w-12 h-12 text-primary-600" /></div>
            <h3 className="text-xl font-semibold text-secondary-900 mb-2">Aucun patient trouvé</h3>
            <p className="text-secondary-600">Vos patients apparaîtront ici après votre première consultation.</p>
          </motion.div>
        )}
      </div>
    </div>
  )
}
