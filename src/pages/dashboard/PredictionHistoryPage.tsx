import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Brain, Calendar, Baby, Activity, AlertCircle } from 'lucide-react'
import { supabase, Prediction } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import toast from 'react-hot-toast'

export function PredictionHistoryPage() {
  const [predictions, setPredictions] = useState<Prediction[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    if (user) {
      loadPredictions()
    }
  }, [user])

  const loadPredictions = async () => {
    try {
      const { data, error } = await supabase
        .from('predictions')
        .select('*, child:children(name), disease:diseases(name, severity_level)')
        .eq('parent_id', user?.id)
        .order('created_at', { ascending: false })
      
      if (error) throw error
      setPredictions(data || [])
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  const getSeverityColor = (level: string) => {
    switch (level) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'severe': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'moderate': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-green-100 text-green-800 border-green-200';
    }
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600"></div></div>
  }

  return (
    <div className="min-h-screen bg-secondary-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-3xl font-heading font-bold text-secondary-900 mb-2">Historique des prédictions</h1>
          <p className="text-secondary-600">Retrouvez toutes les analyses IA effectuées pour vos enfants.</p>
        </motion.div>

        {predictions.length > 0 ? (
          <div className="space-y-6">
            {predictions.map((p, index) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-xl shadow-lg p-6"
              >
                <div className="flex flex-col md:flex-row justify-between md:items-center">
                  <div className="flex items-center space-x-4 mb-4 md:mb-0">
                    <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center"><Brain className="w-6 h-6 text-primary-600" /></div>
                    <div>
                      <h2 className="text-lg font-semibold text-secondary-900">{p.disease?.name || 'Analyse en attente'}</h2>
                      <p className="text-sm text-secondary-600">Pour <span className="font-medium">{p.child?.name || 'enfant'}</span></p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-6 text-sm">
                    <div className="flex items-center"><Calendar className="w-4 h-4 mr-1 text-secondary-500" /><span>{new Date(p.created_at).toLocaleDateString('fr-FR')}</span></div>
                    <div className={`px-3 py-1 rounded-full text-xs font-medium ${getSeverityColor(p.disease?.severity_level || 'mild')}`}>
                      Gravité: {p.disease?.severity_level || 'N/A'}
                    </div>
                    <div className="font-bold text-primary-600">{p.confidence_score}%</div>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t">
                  <h3 className="text-sm font-semibold mb-2">Symptômes rapportés:</h3>
                  <div className="flex flex-wrap gap-2">
                    {p.symptoms_reported?.selected_symptoms?.map((sId: string) => (
                      <span key={sId} className="px-2 py-1 bg-secondary-100 text-secondary-700 text-xs rounded-full">{sId}</span>
                    )) || <p className="text-xs text-secondary-500">Aucun symptôme spécifique rapporté.</p>}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center py-16">
            <div className="w-24 h-24 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6"><Brain className="w-12 h-12 text-primary-600" /></div>
            <h3 className="text-xl font-semibold text-secondary-900 mb-2">Aucune prédiction trouvée</h3>
            <p className="text-secondary-600">Commencez par un diagnostic IA pour voir l'historique ici.</p>
          </motion.div>
        )}
      </div>
    </div>
  )
}
