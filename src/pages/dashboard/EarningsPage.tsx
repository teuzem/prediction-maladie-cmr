import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { DollarSign, TrendingUp, Calendar } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import toast from 'react-hot-toast'

interface Earning {
  id: string
  appointment_date: string
  consultation_fee: number
  child_name: string
  parent_name: string
}

export function EarningsPage() {
  const [earnings, setEarnings] = useState<Earning[]>([])
  const [totalRevenue, setTotalRevenue] = useState(0)
  const [monthlyTrend, setMonthlyTrend] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    if (user) {
      loadEarnings()
    }
  }, [user])

  const loadEarnings = async () => {
    try {
      const { data, error } = await supabase
        .from('appointments')
        .select('id, appointment_date, consultation_fee, child:children(name), parent:user_profiles!appointments_parent_id_fkey(full_name)')
        .eq('doctor_id', user?.id)
        .eq('status', 'completed')
        .order('appointment_date', { ascending: false })

      if (error) throw error

      const formattedEarnings = data.map(d => ({
        id: d.id,
        appointment_date: d.appointment_date,
        consultation_fee: d.consultation_fee,
        child_name: d.child?.name || 'N/A',
        parent_name: d.parent?.full_name || 'N/A',
      }))
      setEarnings(formattedEarnings)

      const total = formattedEarnings.reduce((sum, item) => sum + item.consultation_fee, 0)
      setTotalRevenue(total)

      // Process monthly trend data
      const trendData: { [key: string]: number } = {}
      formattedEarnings.forEach(e => {
        const month = new Date(e.appointment_date).toLocaleString('fr-FR', { month: 'short', year: '2-digit' })
        if (!trendData[month]) trendData[month] = 0
        trendData[month] += e.consultation_fee
      })
      const trendArray = Object.keys(trendData).map(month => ({ month, revenue: trendData[month] })).reverse()
      setMonthlyTrend(trendArray)

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
          <h1 className="text-3xl font-heading font-bold text-secondary-900 mb-2">Mes Revenus</h1>
          <p className="text-secondary-600">Suivez vos gains et la performance de vos consultations.</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white p-6 rounded-xl shadow-lg">
            <h2 className="text-xl font-semibold text-secondary-900 mb-4 flex items-center"><DollarSign className="w-5 h-5 mr-2 text-primary-600"/>Revenu Total</h2>
            <p className="text-4xl font-bold text-primary-600">{totalRevenue.toLocaleString()} FCFA</p>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white p-6 rounded-xl shadow-lg">
            <h2 className="text-xl font-semibold text-secondary-900 mb-4 flex items-center"><TrendingUp className="w-5 h-5 mr-2 text-primary-600"/>Tendance Mensuelle</h2>
            <ResponsiveContainer width="100%" height={100}>
              <LineChart data={monthlyTrend}>
                <Tooltip formatter={(value) => [`${value.toLocaleString()} FCFA`, 'Revenus']} />
                <Line type="monotone" dataKey="revenue" stroke="#16a34a" strokeWidth={3} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-white rounded-xl shadow-lg overflow-hidden">
          <h2 className="text-xl font-semibold text-secondary-900 p-6">Historique des transactions</h2>
          <table className="min-w-full divide-y divide-secondary-200">
            <thead className="bg-secondary-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase">Patient</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-secondary-500 uppercase">Montant (FCFA)</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-secondary-200">
              {earnings.map((earning, index) => (
                <motion.tr key={earning.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: index * 0.05 }}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-500">{new Date(earning.appointment_date).toLocaleString('fr-FR')}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-secondary-900">{earning.child_name} (Parent: {earning.parent_name})</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-green-600">+{earning.consultation_fee.toLocaleString()}</td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </motion.div>
      </div>
    </div>
  )
}
