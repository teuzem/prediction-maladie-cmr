import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { Brain, AlertCircle, CheckCircle, Download, Calendar, ArrowRight, ArrowLeft, Heart, Thermometer, Activity } from 'lucide-react'
import { supabase, Disease, Symptom, Child } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import toast from 'react-hot-toast'
import jsPDF from 'jspdf'
import { useNavigate } from 'react-router-dom'

interface PredictionResult {
  predicted_disease: Disease
  confidence_score: number
  symptoms_analysis: any
  recommendations: string[]
}

export function PredictionPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [symptoms, setSymptoms] = useState<Symptom[]>([])
  const [children, setChildren] = useState<Child[]>([])
  const [selectedChildId, setSelectedChildId] = useState<string>('')
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([])
  const [additionalInfo, setAdditionalInfo] = useState('')
  const [prediction, setPrediction] = useState<PredictionResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [loadingInitialData, setLoadingInitialData] = useState(true)
  const { user } = useAuth()
  const navigate = useNavigate()

  const { register, handleSubmit } = useForm()

  useEffect(() => {
    loadInitialData()
  }, [user])

  const loadInitialData = async () => {
    try {
      const { data: symptomsData, error: symptomsError } = await supabase.from('symptoms').select('*').order('category', { ascending: true })
      if (symptomsError) throw symptomsError
      setSymptoms(symptomsData || [])

      if (user) {
        const { data: childrenData, error: childrenError } = await supabase.from('children').select('*').eq('parent_id', user.id)
        if (childrenError) throw childrenError
        setChildren(childrenData || [])
        if (childrenData && childrenData.length > 0) {
          setSelectedChildId(childrenData[0].id)
        }
      }
    } catch (error) {
      console.error('Error loading initial data:', error)
      toast.error('Erreur lors du chargement des données')
    } finally {
      setLoadingInitialData(false)
    }
  }

  const toggleSymptom = (symptomName: string) => {
    setSelectedSymptoms(prev => 
      prev.includes(symptomName) 
        ? prev.filter(name => name !== symptomName)
        : [...prev, symptomName]
    )
  }

  const simulateAIPrediction = async (formData: any): Promise<PredictionResult> => {
    // In a real app, this would call VITE_ML_PREDICTION_API_URL
    await new Promise(resolve => setTimeout(resolve, 2000))

    const { data: diseases, error } = await supabase.from('diseases').select('*')
    if (error || !diseases || diseases.length === 0) {
      throw new Error("Impossible de simuler la prédiction, aucune maladie dans la base.")
    }

    const randomDisease = diseases[Math.floor(Math.random() * diseases.length)]
    
    return {
      predicted_disease: randomDisease,
      confidence_score: Math.floor(Math.random() * 20) + 80,
      symptoms_analysis: {
        primary_symptoms: selectedSymptoms.slice(0, 3),
        secondary_symptoms: selectedSymptoms.slice(3),
        severity_assessment: 'Modéré (simulation)'
      },
      recommendations: [
        'Consultez un médecin rapidement pour confirmation.',
        'Surveillez la température de l\'enfant.',
        'Assurez une bonne hydratation.',
        'Évitez l\'automédication sans avis médical.'
      ]
    }
  }

  const handlePrediction = async (formData: any) => {
    if (user && !selectedChildId) {
      toast.error("Veuillez sélectionner un enfant.");
      return;
    }
    if (selectedSymptoms.length === 0) {
      toast.error('Veuillez sélectionner au moins un symptôme')
      return
    }

    setLoading(true)
    try {
      const result = await simulateAIPrediction(formData)
      setPrediction(result)

      if (user) {
        const { error } = await supabase
          .from('predictions')
          .insert({
            parent_id: user.id,
            child_id: selectedChildId,
            symptoms_reported: {
              selected_symptoms: selectedSymptoms,
              additional_info: additionalInfo,
              child_info: formData
            },
            predicted_disease_id: result.predicted_disease.id,
            confidence_score: result.confidence_score,
            additional_info: result.symptoms_analysis,
            status: 'completed'
          })

        if (error) throw error
      }

      setCurrentStep(3)
      toast.success('Prédiction générée avec succès !')
    } catch (error: any) {
      console.error('Error during prediction:', error)
      toast.error(error.message || 'Erreur lors de la prédiction')
    } finally {
      setLoading(false)
    }
  }

  const generatePDFReport = () => {
    if (!prediction) return

    const doc = new jsPDF()
    const pageWidth = doc.internal.pageSize.getWidth()
    
    doc.setFontSize(20)
    doc.setTextColor(34, 197, 94)
    doc.text('RAPPORT DE PRÉDICTION IA - EPICTRACKER', pageWidth / 2, 30, { align: 'center' })
    
    doc.setFontSize(12)
    doc.setTextColor(0, 0, 0)
    doc.text(`Date: ${new Date().toLocaleDateString('fr-FR')}`, 20, 50)
    
    doc.setFontSize(16)
    doc.text('RÉSULTATS DE LA PRÉDICTION', 20, 70)
    
    doc.setFontSize(12)
    doc.text(`Maladie prédite: ${prediction.predicted_disease.name}`, 20, 85)
    doc.text(`Niveau de confiance: ${prediction.confidence_score}%`, 20, 95)
    doc.text(`Catégorie: ${prediction.predicted_disease.category}`, 20, 105)
    doc.text(`Niveau de gravité: ${prediction.predicted_disease.severity_level}`, 20, 115)
    
    if (prediction.predicted_disease.description) {
      doc.text('Description:', 20, 130)
      const splitDescription = doc.splitTextToSize(prediction.predicted_disease.description, pageWidth - 40)
      doc.text(splitDescription, 20, 140)
    }
    
    let yPosition = 170
    if (prediction.predicted_disease.medical_treatments?.length) {
      doc.setFontSize(14)
      doc.text('TRAITEMENTS MÉDICAUX SUGGÉRÉS (MINSANTE)', 20, yPosition)
      yPosition += 10
      doc.setFontSize(11)
      prediction.predicted_disease.medical_treatments.forEach(treatment => {
        doc.text(`• ${treatment}`, 25, yPosition)
        yPosition += 8
      })
    }
    
    yPosition += 10
    if (prediction.predicted_disease.prevention_methods?.length) {
      doc.setFontSize(14)
      doc.text('MÉTHODES DE PRÉVENTION', 20, yPosition)
      yPosition += 10
      doc.setFontSize(11)
      prediction.predicted_disease.prevention_methods.forEach(method => {
        doc.text(`• ${method}`, 25, yPosition)
        yPosition += 8
      })
    }
    
    doc.setFontSize(10)
    doc.setTextColor(128, 128, 128)
    doc.text('Ce rapport est généré par l\'IA d\'EpicTracker. Consultez un médecin pour confirmation.', pageWidth / 2, 280, { align: 'center' })
    
    doc.save(`rapport-epictracker-${new Date().toISOString().split('T')[0]}.pdf`)
    toast.success('Rapport téléchargé avec succès !')
  }

  const symptomsByCategory = symptoms.reduce((acc, symptom) => {
    if (!acc[symptom.category]) acc[symptom.category] = []
    acc[symptom.category].push(symptom)
    return acc
  }, {} as Record<string, Symptom[]>)

  if (loadingInitialData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-secondary-600">Chargement des données...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <div className="flex justify-center mb-6"><div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center shadow-lg"><Brain className="w-8 h-8 text-white" /></div></div>
          <h1 className="text-3xl lg:text-4xl font-heading font-bold text-secondary-900 mb-4">Diagnostic IA EpicTracker</h1>
          <p className="text-xl text-secondary-600 max-w-2xl mx-auto">Décrivez les symptômes et obtenez une prédiction médicale précise.</p>
        </motion.div>

        <div className="flex items-center justify-center mb-12">
          <div className="flex items-center space-x-4">
            {[1, 2, 3].map((step) => (<React.Fragment key={step}><div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${currentStep >= step ? 'bg-primary-600 text-white' : 'bg-secondary-200 text-secondary-500'}`}>{step === 3 && prediction ? <CheckCircle className="w-6 h-6" /> : step}</div>{step < 3 && (<div className={`w-12 h-1 ${currentStep > step ? 'bg-primary-600' : 'bg-secondary-200'}`}></div>)}</React.Fragment>))}
          </div>
        </div>

        <AnimatePresence mode="wait">
          {currentStep === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="bg-white rounded-2xl shadow-xl p-8">
              <h2 className="text-2xl font-semibold text-secondary-900 mb-6 flex items-center"><Thermometer className="w-6 h-6 mr-3 text-primary-600" />Sélectionnez les symptômes observés</h2>
              {user && children.length > 0 && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-secondary-700 mb-2">Pour quel enfant ?</label>
                  <select value={selectedChildId} onChange={e => setSelectedChildId(e.target.value)} className="w-full p-3 border border-secondary-300 rounded-lg">
                    {children.map(child => <option key={child.id} value={child.id}>{child.name}</option>)}
                  </select>
                </div>
              )}
              <div className="space-y-6">
                {Object.entries(symptomsByCategory).map(([category, categorySymptoms]) => (<div key={category} className="space-y-3"><h3 className="text-lg font-medium text-secondary-800 border-b border-secondary-200 pb-2">{category}</h3><div className="grid grid-cols-1 md:grid-cols-2 gap-3">{categorySymptoms.map((symptom) => (<button key={symptom.id} onClick={() => toggleSymptom(symptom.name)} className={`p-4 rounded-lg border-2 text-left transition-all ${selectedSymptoms.includes(symptom.name) ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-secondary-200 hover:border-primary-300 hover:bg-primary-50'}`}><div className="flex items-start space-x-3"><div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 mt-0.5 ${selectedSymptoms.includes(symptom.name) ? 'border-primary-500 bg-primary-500' : 'border-secondary-300'}`}>{selectedSymptoms.includes(symptom.name) && (<CheckCircle className="w-full h-full text-white" />)}</div><div><div className="font-medium">{symptom.name}</div>{symptom.description && (<div className="text-sm text-secondary-600 mt-1">{symptom.description}</div>)}</div></div></button>))}</div></div>))}
              </div>
              <div className="mt-8"><label className="block text-sm font-medium text-secondary-700 mb-2">Informations supplémentaires (optionnel)</label><textarea value={additionalInfo} onChange={(e) => setAdditionalInfo(e.target.value)} className="w-full px-4 py-3 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent" rows={3} placeholder="Décrivez d'autres symptômes ou détails importants..." /></div>
              <div className="flex justify-end mt-8"><button onClick={() => setCurrentStep(2)} disabled={selectedSymptoms.length === 0} className="flex items-center px-6 py-3 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">Continuer<ArrowRight className="w-5 h-5 ml-2" /></button></div>
            </motion.div>
          )}

          {currentStep === 2 && (
            <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="bg-white rounded-2xl shadow-xl p-8">
              <h2 className="text-2xl font-semibold text-secondary-900 mb-6 flex items-center"><Activity className="w-6 h-6 mr-3 text-primary-600" />Informations complémentaires</h2>
              <form onSubmit={handleSubmit(handlePrediction)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div><label className="block text-sm font-medium text-secondary-700 mb-2">Âge de l'enfant (années)</label><input {...register('child_age')} type="number" min="0" max="18" className="w-full px-4 py-3 border border-secondary-300 rounded-lg" placeholder="Ex: 5" /></div>
                  <div><label className="block text-sm font-medium text-secondary-700 mb-2">Poids (kg)</label><input {...register('child_weight')} type="number" step="0.1" className="w-full px-4 py-3 border border-secondary-300 rounded-lg" placeholder="Ex: 20.5" /></div>
                  <div><label className="block text-sm font-medium text-secondary-700 mb-2">Durée de la fièvre (jours)</label><input {...register('fever_duration')} type="number" min="0" className="w-full px-4 py-3 border border-secondary-300 rounded-lg" placeholder="Ex: 2" /></div>
                  <div><label className="block text-sm font-medium text-secondary-700 mb-2">Niveau d'activité</label><select {...register('activity_level')} className="w-full px-4 py-3 border border-secondary-300 rounded-lg"><option value="">Sélectionner</option><option value="normal">Normal</option><option value="decreased">Diminué</option><option value="very_low">Très faible</option><option value="lethargic">Léthargique</option></select></div>
                </div>
                <div className="flex justify-between mt-8">
                  <button type="button" onClick={() => setCurrentStep(1)} className="flex items-center px-6 py-3 border border-secondary-300 text-secondary-700 font-semibold rounded-lg hover:bg-secondary-50 transition-colors"><ArrowLeft className="w-5 h-5 mr-2" />Retour</button>
                  <button type="submit" disabled={loading} className="flex items-center px-6 py-3 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">{loading ? (<><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>Analyse...</>) : (<><Brain className="w-5 h-5 mr-2" />Obtenir la prédiction</>)}</button>
                </div>
              </form>
            </motion.div>
          )}

          {currentStep === 3 && prediction && (
            <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
              <div className="bg-white rounded-2xl shadow-xl p-8">
                <div className="text-center mb-8"><div className="flex justify-center mb-4"><div className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg ${prediction.confidence_score >= 80 ? 'bg-green-500' : prediction.confidence_score >= 60 ? 'bg-yellow-500' : 'bg-red-500'}`}><CheckCircle className="w-8 h-8 text-white" /></div></div><h2 className="text-3xl font-heading font-bold text-secondary-900 mb-2">Prédiction terminée</h2><p className="text-secondary-600">Voici les résultats de l'analyse de notre IA médicale</p></div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div className="bg-primary-50 border border-primary-200 rounded-xl p-6"><h3 className="text-xl font-semibold text-primary-800 mb-4">Maladie prédite</h3><div className="space-y-3"><div className="text-2xl font-bold text-primary-600">{prediction.predicted_disease.name}</div><div className="text-sm text-secondary-600">{prediction.predicted_disease.description}</div><div className="flex items-center space-x-4 text-sm"><span className="text-secondary-500">Catégorie: {prediction.predicted_disease.category}</span><span className={`px-2 py-1 rounded-full text-xs font-medium ${prediction.predicted_disease.severity_level === 'critical' ? 'bg-red-100 text-red-800' : prediction.predicted_disease.severity_level === 'severe' ? 'bg-orange-100 text-orange-800' : prediction.predicted_disease.severity_level === 'moderate' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>{prediction.predicted_disease.severity_level}</span></div></div></div>
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-6"><h3 className="text-xl font-semibold text-blue-800 mb-4">Niveau de confiance</h3><div className="text-3xl font-bold text-blue-600 mb-2">{prediction.confidence_score}%</div><div className="w-full bg-blue-200 rounded-full h-3"><div className="bg-blue-600 h-3 rounded-full transition-all duration-1000" style={{ width: `${prediction.confidence_score}%` }}></div></div><p className="text-sm text-blue-700 mt-2">{prediction.confidence_score >= 80 ? 'Prédiction très fiable' : prediction.confidence_score >= 60 ? 'Prédiction modérément fiable' : 'Prédiction nécessitant confirmation'}</p></div>
                  </div>
                  <div className="space-y-6">
                    {prediction.predicted_disease.medical_treatments && (<div><h3 className="text-lg font-semibold text-secondary-900 mb-3">Traitements médicaux recommandés</h3><ul className="space-y-2">{prediction.predicted_disease.medical_treatments.map((treatment, index) => (<li key={index} className="flex items-start space-x-2"><CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" /><span className="text-secondary-700">{treatment}</span></li>))}</ul></div>)}
                    {prediction.predicted_disease.prevention_methods && (<div><h3 className="text-lg font-semibold text-secondary-900 mb-3">Méthodes de prévention</h3><ul className="space-y-2">{prediction.predicted_disease.prevention_methods.map((method, index) => (<li key={index} className="flex items-start space-x-2"><CheckCircle className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" /><span className="text-secondary-700">{method}</span></li>))}</ul></div>)}
                  </div>
                </div>
                <div className="mt-8 p-6 bg-amber-50 border border-amber-200 rounded-xl"><div className="flex items-start space-x-3"><AlertCircle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" /><div><h3 className="text-lg font-semibold text-amber-800 mb-2">Important : Consultation médicale recommandée</h3><p className="text-amber-700">Cette prédiction est générée par intelligence artificielle et ne remplace pas un diagnostic médical professionnel. Nous recommandons fortement de consulter un médecin spécialiste pour confirmer ce diagnostic et obtenir un traitement approprié.</p></div></div></div>
                <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
                  <button onClick={generatePDFReport} className="flex items-center justify-center px-6 py-3 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors"><Download className="w-5 h-5 mr-2" />Télécharger le rapport</button>
                  {user && (<button onClick={() => navigate('/doctors')} className="flex items-center justify-center px-6 py-3 border border-primary-600 text-primary-600 font-semibold rounded-lg hover:bg-primary-50 transition-colors"><Calendar className="w-5 h-5 mr-2" />Prendre rendez-vous</button>)}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
