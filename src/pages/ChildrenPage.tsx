import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { Baby, Plus, Edit, Trash2, Calendar, Weight, Ruler, Heart, Syringe, AlertCircle } from 'lucide-react'
import { supabase, Child } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import toast from 'react-hot-toast'

export function ChildrenPage() {
  const [children, setChildren] = useState<Child[]>([])
  const [selectedChild, setSelectedChild] = useState<Child | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<Partial<Child>>()

  useEffect(() => {
    if (user) {
      loadChildren()
    }
  }, [user])

  const loadChildren = async () => {
    try {
      const { data, error } = await supabase
        .from('children')
        .select('*')
        .eq('parent_id', user?.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setChildren(data || [])
    } catch (error) {
      console.error('Error loading children:', error)
      toast.error('Erreur lors du chargement des enfants')
    } finally {
      setLoading(false)
    }
  }

  const onSubmit = async (data: Partial<Child>) => {
    try {
      if (selectedChild) {
        // Update existing child
        const { error } = await supabase
          .from('children')
          .update({
            ...data,
            allergies: data.allergies ? data.allergies.toString().split(',').map(a => a.trim()) : [],
            updated_at: new Date().toISOString()
          })
          .eq('id', selectedChild.id)

        if (error) throw error
        toast.success('Enfant mis à jour avec succès')
      } else {
        // Create new child
        const { error } = await supabase
          .from('children')
          .insert({
            ...data,
            parent_id: user?.id,
            allergies: data.allergies ? data.allergies.toString().split(',').map(a => a.trim()) : [],
            vaccination_status: {}
          })

        if (error) throw error
        toast.success('Enfant ajouté avec succès')
      }

      loadChildren()
      closeModal()
    } catch (error: any) {
      console.error('Error saving child:', error)
      toast.error(error.message || 'Erreur lors de la sauvegarde')
    }
  }

  const deleteChild = async (childId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet enfant ?')) return

    try {
      const { error } = await supabase
        .from('children')
        .delete()
        .eq('id', childId)

      if (error) throw error
      toast.success('Enfant supprimé avec succès')
      loadChildren()
    } catch (error: any) {
      console.error('Error deleting child:', error)
      toast.error(error.message || 'Erreur lors de la suppression')
    }
  }

  const openModal = (child?: Child) => {
    setSelectedChild(child || null)
    if (child) {
      // Populate form with child data
      Object.keys(child).forEach(key => {
        const value = child[key as keyof Child]
        if (key === 'allergies' && Array.isArray(value)) {
          setValue(key as any, value.join(', '))
        } else if (value !== null && value !== undefined) {
          setValue(key as any, value)
        }
      })
    } else {
      reset()
    }
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setSelectedChild(null)
    reset()
  }

  const calculateAge = (dateOfBirth: string) => {
    const birth = new Date(dateOfBirth)
    const today = new Date()
    const years = today.getFullYear() - birth.getFullYear()
    const months = today.getMonth() - birth.getMonth()
    
    if (months < 0 || (months === 0 && today.getDate() < birth.getDate())) {
      return years - 1
    }
    return years
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-secondary-600">Chargement des enfants...</p>
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
          className="flex justify-between items-center mb-8"
        >
          <div>
            <h1 className="text-3xl font-heading font-bold text-secondary-900 mb-2">
              Mes enfants
            </h1>
            <p className="text-secondary-600">
              Gérez les profils de santé de vos enfants
            </p>
          </div>
          <button
            onClick={() => openModal()}
            className="flex items-center px-6 py-3 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors shadow-lg"
          >
            <Plus className="w-5 h-5 mr-2" />
            Ajouter un enfant
          </button>
        </motion.div>

        {/* Children Grid */}
        {children.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {children.map((child, index) => (
              <motion.div
                key={child.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
              >
                <div className="relative h-48 bg-gradient-to-br from-primary-100 to-primary-200">
                  <div className="absolute inset-0 flex items-center justify-center">
                    {child.avatar_url ? (
                      <img
                        src={child.avatar_url}
                        alt={child.name}
                        className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
                      />
                    ) : (
                      <div className="w-24 h-24 rounded-full bg-primary-500 flex items-center justify-center border-4 border-white shadow-lg">
                        <Baby className="w-12 h-12 text-white" />
                      </div>
                    )}
                  </div>
                  <div className="absolute top-4 right-4 flex space-x-2">
                    <button
                      onClick={() => openModal(child)}
                      className="p-2 bg-white rounded-full shadow-md hover:bg-secondary-50 transition-colors"
                    >
                      <Edit className="w-4 h-4 text-secondary-600" />
                    </button>
                    <button
                      onClick={() => deleteChild(child.id)}
                      className="p-2 bg-white rounded-full shadow-md hover:bg-red-50 transition-colors"
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </button>
                  </div>
                </div>

                <div className="p-6">
                  <div className="text-center mb-4">
                    <h3 className="text-xl font-semibold text-secondary-900 mb-1">
                      {child.name}
                    </h3>
                    <p className="text-secondary-600">
                      {calculateAge(child.date_of_birth)} ans • {child.gender === 'male' ? 'Garçon' : 'Fille'}
                    </p>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center text-secondary-600">
                        <Calendar className="w-4 h-4 mr-2" />
                        Naissance
                      </div>
                      <span className="font-medium text-secondary-900">
                        {new Date(child.date_of_birth).toLocaleDateString('fr-FR')}
                      </span>
                    </div>

                    {child.weight && (
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center text-secondary-600">
                          <Weight className="w-4 h-4 mr-2" />
                          Poids
                        </div>
                        <span className="font-medium text-secondary-900">
                          {child.weight} kg
                        </span>
                      </div>
                    )}

                    {child.height && (
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center text-secondary-600">
                          <Ruler className="w-4 h-4 mr-2" />
                          Taille
                        </div>
                        <span className="font-medium text-secondary-900">
                          {child.height} cm
                        </span>
                      </div>
                    )}

                    {child.blood_type && (
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center text-secondary-600">
                          <Heart className="w-4 h-4 mr-2" />
                          Groupe sanguin
                        </div>
                        <span className="font-medium text-secondary-900">
                          {child.blood_type}
                        </span>
                      </div>
                    )}

                    {child.allergies && child.allergies.length > 0 && (
                      <div className="mt-4">
                        <div className="flex items-center text-sm text-red-600 mb-2">
                          <AlertCircle className="w-4 h-4 mr-2" />
                          Allergies
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {child.allergies.map((allergy, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full"
                            >
                              {allergy}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="mt-6 flex space-x-3">
                    <button className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium">
                      Diagnostic IA
                    </button>
                    <button className="flex-1 px-4 py-2 border border-primary-600 text-primary-600 rounded-lg hover:bg-primary-50 transition-colors text-sm font-medium">
                      Historique
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <div className="w-24 h-24 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Baby className="w-12 h-12 text-primary-600" />
            </div>
            <h3 className="text-xl font-semibold text-secondary-900 mb-2">
              Aucun enfant enregistré
            </h3>
            <p className="text-secondary-600 mb-6">
              Commencez par ajouter le profil d'un enfant pour utiliser EpicTracker
            </p>
            <button
              onClick={() => openModal()}
              className="px-6 py-3 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors"
            >
              Ajouter mon premier enfant
            </button>
          </motion.div>
        )}

        {/* Modal */}
        <AnimatePresence>
          {isModalOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
              onClick={closeModal}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                onClick={e => e.stopPropagation()}
              >
                <div className="p-6">
                  <h2 className="text-2xl font-semibold text-secondary-900 mb-6">
                    {selectedChild ? 'Modifier l\'enfant' : 'Ajouter un enfant'}
                  </h2>

                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-secondary-700 mb-2">
                          Nom complet *
                        </label>
                        <input
                          {...register('name', { required: 'Le nom est requis' })}
                          type="text"
                          className="w-full px-4 py-3 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          placeholder="Ex: Jean Dupont"
                        />
                        {errors.name && (
                          <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-secondary-700 mb-2">
                          Date de naissance *
                        </label>
                        <input
                          {...register('date_of_birth', { required: 'La date de naissance est requise' })}
                          type="date"
                          className="w-full px-4 py-3 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                        {errors.date_of_birth && (
                          <p className="mt-1 text-sm text-red-600">{errors.date_of_birth.message}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-secondary-700 mb-2">
                          Sexe *
                        </label>
                        <select
                          {...register('gender', { required: 'Le sexe est requis' })}
                          className="w-full px-4 py-3 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        >
                          <option value="">Sélectionner</option>
                          <option value="male">Garçon</option>
                          <option value="female">Fille</option>
                        </select>
                        {errors.gender && (
                          <p className="mt-1 text-sm text-red-600">{errors.gender.message}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-secondary-700 mb-2">
                          Groupe sanguin
                        </label>
                        <select
                          {...register('blood_type')}
                          className="w-full px-4 py-3 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        >
                          <option value="">Sélectionner</option>
                          <option value="A+">A+</option>
                          <option value="A-">A-</option>
                          <option value="B+">B+</option>
                          <option value="B-">B-</option>
                          <option value="AB+">AB+</option>
                          <option value="AB-">AB-</option>
                          <option value="O+">O+</option>
                          <option value="O-">O-</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-secondary-700 mb-2">
                          Poids (kg)
                        </label>
                        <input
                          {...register('weight')}
                          type="number"
                          step="0.1"
                          className="w-full px-4 py-3 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          placeholder="Ex: 15.5"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-secondary-700 mb-2">
                          Taille (cm)
                        </label>
                        <input
                          {...register('height')}
                          type="number"
                          className="w-full px-4 py-3 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          placeholder="Ex: 105"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-secondary-700 mb-2">
                        Allergies (séparées par des virgules)
                      </label>
                      <input
                        {...register('allergies')}
                        type="text"
                        className="w-full px-4 py-3 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="Ex: Arachides, Lait, Œufs"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-secondary-700 mb-2">
                        Antécédents médicaux
                      </label>
                      <textarea
                        {...register('medical_history')}
                        rows={3}
                        className="w-full px-4 py-3 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="Décrivez les antécédents médicaux importants..."
                      />
                    </div>

                    <div className="flex justify-end space-x-4 pt-6 border-t border-secondary-200">
                      <button
                        type="button"
                        onClick={closeModal}
                        className="px-6 py-3 border border-secondary-300 text-secondary-700 font-semibold rounded-lg hover:bg-secondary-50 transition-colors"
                      >
                        Annuler
                      </button>
                      <button
                        type="submit"
                        className="px-6 py-3 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors"
                      >
                        {selectedChild ? 'Mettre à jour' : 'Ajouter'}
                      </button>
                    </div>
                  </form>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
