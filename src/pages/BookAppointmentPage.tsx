import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Calendar, Clock, ArrowLeft, Baby, DollarSign, CheckCircle } from 'lucide-react'
import { supabase, Doctor, Child } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import toast from 'react-hot-toast'

// Mock availability for demo
const generateTimeSlots = () => {
  const slots = []
  for (let i = 9; i < 17; i++) {
    slots.push(`${i}:00`)
    slots.push(`${i}:30`)
  }
  return slots
}

export function BookAppointmentPage() {
  const { doctorId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  
  const [doctor, setDoctor] = useState<Doctor | null>(null)
  const [children, setChildren] = useState<Child[]>([])
  const [selectedChild, setSelectedChild] = useState<string>('')
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [selectedTime, setSelectedTime] = useState('')
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const timeSlots = generateTimeSlots()

  useEffect(() => {
    if (!doctorId || !user) {
      navigate('/doctors')
      return
    }
    loadData()
  }, [doctorId, user])

  const loadData = async () => {
    try {
      // Load doctor details
      const { data: doctorData, error: doctorError } = await supabase
        .from('doctors')
        .select('*, profile:user_profiles(*)')
        .eq('id', doctorId)
        .single()
      if (doctorError) throw doctorError
      setDoctor(doctorData)

      // Load parent's children
      const { data: childrenData, error: childrenError } = await supabase
        .from('children')
        .select('*')
        .eq('parent_id', user?.id)
      if (childrenError) throw childrenError
      setChildren(childrenData)
      if (childrenData.length > 0) {
        setSelectedChild(childrenData[0].id)
      }

    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleBooking = async () => {
    if (!selectedChild || !selectedDate || !selectedTime || !doctor) {
      toast.error('Veuillez remplir tous les champs.')
      return
    }
    setIsSubmitting(true)

    const [hours, minutes] = selectedTime.split(':')
    const appointmentDate = new Date(selectedDate)
    appointmentDate.setHours(parseInt(hours), parseInt(minutes))

    try {
      const { data, error } = await supabase
        .from('appointments')
        .insert({
          parent_id: user?.id,
          doctor_id: doctor.id,
          child_id: selectedChild,
          appointment_date: appointmentDate.toISOString(),
          duration_minutes: 30, // Default duration
          consultation_fee: doctor.consultation_fee,
          status: 'scheduled',
        })
        .select('*, child:children(*), doctor:doctors(*, profile:user_profiles(*))')
        .single()

      if (error) throw error

      toast.success('Rendez-vous pris avec succès ! Procédez au paiement.')
      navigate('/payment', { state: { appointment: data } })

    } catch (error: any) {
      toast.error(`Erreur lors de la prise de rendez-vous: ${error.message}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600"></div></div>
  }

  return (
    <div className="min-h-screen bg-secondary-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <button onClick={() => navigate(-1)} className="inline-flex items-center text-secondary-600 hover:text-primary-600 mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour
          </button>
          <h1 className="text-3xl font-heading font-bold text-secondary-900">Prendre rendez-vous</h1>
          <p className="text-secondary-600 mt-2">Avec Dr. {doctor?.profile?.full_name}</p>
        </motion.div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Booking Form */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="bg-white p-8 rounded-2xl shadow-xl space-y-6">
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">Pour quel enfant ?</label>
              <select value={selectedChild} onChange={e => setSelectedChild(e.target.value)} className="w-full p-3 border border-secondary-300 rounded-lg">
                {children.map(child => <option key={child.id} value={child.id}>{child.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">Choisir une date</label>
              <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} min={new Date().toISOString().split('T')[0]} className="w-full p-3 border border-secondary-300 rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">Choisir une heure</label>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {timeSlots.map(time => (
                  <button key={time} onClick={() => setSelectedTime(time)} className={`p-2 rounded-lg border text-sm transition-colors ${selectedTime === time ? 'bg-primary-600 text-white border-primary-600' : 'border-secondary-300 hover:bg-primary-50'}`}>
                    {time}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Summary */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="bg-white p-8 rounded-2xl shadow-xl">
            <h2 className="text-xl font-semibold mb-6 border-b pb-4">Résumé du rendez-vous</h2>
            <div className="space-y-4">
              <div className="flex items-center"><Baby className="w-5 h-5 mr-3 text-primary-600" /><span>Patient: <span className="font-semibold">{children.find(c => c.id === selectedChild)?.name || '...'}</span></span></div>
              <div className="flex items-center"><Calendar className="w-5 h-5 mr-3 text-primary-600" /><span>Date: <span className="font-semibold">{selectedDate ? new Date(selectedDate).toLocaleDateString('fr-FR') : '...'}</span></span></div>
              <div className="flex items-center"><Clock className="w-5 h-5 mr-3 text-primary-600" /><span>Heure: <span className="font-semibold">{selectedTime || '...'}</span></span></div>
              <div className="flex items-center"><DollarSign className="w-5 h-5 mr-3 text-primary-600" /><span>Frais: <span className="font-semibold">{doctor?.consultation_fee.toLocaleString()} FCFA</span></span></div>
            </div>
            <button onClick={handleBooking} disabled={isSubmitting || !selectedTime} className="w-full mt-8 flex items-center justify-center p-4 bg-primary-600 text-white font-bold rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50">
              {isSubmitting ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <><CheckCircle className="w-5 h-5 mr-2" /><span>Confirmer et payer</span></>}
            </button>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
