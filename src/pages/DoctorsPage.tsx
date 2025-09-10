import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Search, Star, MapPin, Calendar, Clock, DollarSign, Award, Filter } from 'lucide-react'
import { supabase, Doctor } from '../lib/supabase'
import toast from 'react-hot-toast'

export function DoctorsPage() {
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [filteredDoctors, setFilteredDoctors] = useState<Doctor[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedSpecialization, setSelectedSpecialization] = useState('')

  useEffect(() => {
    loadDoctors()
  }, [])

  useEffect(() => {
    filterDoctors()
  }, [doctors, searchTerm, selectedSpecialization])

  const loadDoctors = async () => {
    try {
      const { data, error } = await supabase
        .from('doctors')
        .select(`
          *,
          profile:user_profiles(
            full_name,
            email,
            phone,
            avatar_url,
            location
          )
        `)
        .eq('verified', true)
        .order('rating', { ascending: false })

      if (error) throw error
      setDoctors(data || [])
    } catch (error) {
      console.error('Error loading doctors:', error)
      toast.error('Erreur lors du chargement des médecins')
    } finally {
      setLoading(false)
    }
  }

  const filterDoctors = () => {
    let filtered = doctors

    if (searchTerm) {
      filtered = filtered.filter(doctor =>
        doctor.profile?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doctor.specialization.some(spec => 
          spec.toLowerCase().includes(searchTerm.toLowerCase())
        )
      )
    }

    if (selectedSpecialization) {
      filtered = filtered.filter(doctor =>
        doctor.specialization.includes(selectedSpecialization)
      )
    }

    setFilteredDoctors(filtered)
  }

  const specializations = Array.from(
    new Set(doctors.flatMap(doctor => doctor.specialization))
  )

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-secondary-600">Chargement des médecins...</p>
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
          className="text-center mb-12"
        >
          <h1 className="text-3xl lg:text-4xl font-heading font-bold text-secondary-900 mb-4">
            Nos médecins spécialistes
          </h1>
          <p className="text-xl text-secondary-600 max-w-3xl mx-auto">
            Consultez des médecins vérifiés et spécialisés dans la pédiatrie 
            et les maladies tropicales au Cameroun
          </p>
        </motion.div>

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl shadow-lg p-6 mb-8"
        >
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 w-5 h-5 text-secondary-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Rechercher un médecin ou une spécialité..."
                className="w-full pl-10 pr-4 py-3 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-3 w-5 h-5 text-secondary-400" />
              <select
                value={selectedSpecialization}
                onChange={(e) => setSelectedSpecialization(e.target.value)}
                className="pl-10 pr-8 py-3 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent appearance-none bg-white"
              >
                <option value="">Toutes les spécialités</option>
                {specializations.map(spec => (
                  <option key={spec} value={spec}>{spec}</option>
                ))}
              </select>
            </div>
          </div>
        </motion.div>

        {/* Results Summary */}
        <div className="mb-6">
          <p className="text-secondary-600">
            {filteredDoctors.length} médecin{filteredDoctors.length > 1 ? 's' : ''} trouvé{filteredDoctors.length > 1 ? 's' : ''}
          </p>
        </div>

        {/* Doctors Grid */}
        {filteredDoctors.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDoctors.map((doctor, index) => (
              <motion.div
                key={doctor.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
              >
                <div className="relative h-48 bg-gradient-to-br from-primary-100 to-primary-200">
                  <div className="absolute inset-0 flex items-center justify-center">
                    {doctor.profile?.avatar_url ? (
                      <img
                        src={doctor.profile.avatar_url}
                        alt={doctor.profile.full_name}
                        className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
                      />
                    ) : (
                      <div className="w-24 h-24 rounded-full bg-primary-500 flex items-center justify-center border-4 border-white shadow-lg">
                        <span className="text-white text-2xl font-bold">
                          {doctor.profile?.full_name?.split(' ').map(n => n[0]).join('') || 'Dr'}
                        </span>
                      </div>
                    )}
                  </div>
                  {doctor.verified && (
                    <div className="absolute top-4 right-4">
                      <div className="bg-green-500 rounded-full p-2">
                        <Award className="w-4 h-4 text-white" />
                      </div>
                    </div>
                  )}
                </div>

                <div className="p-6">
                  <div className="text-center mb-4">
                    <h3 className="text-xl font-semibold text-secondary-900 mb-1">
                      Dr. {doctor.profile?.full_name || 'Médecin'}
                    </h3>
                    <div className="flex items-center justify-center space-x-1 mb-2">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < Math.floor(doctor.rating || 0)
                              ? 'text-yellow-400 fill-current'
                              : 'text-secondary-300'
                          }`}
                        />
                      ))}
                      <span className="text-sm text-secondary-600 ml-2">
                        {doctor.rating?.toFixed(1) || '0.0'} ({doctor.total_consultations} consultations)
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3 mb-6">
                    <div>
                      <h4 className="text-sm font-medium text-secondary-700 mb-1">Spécialités</h4>
                      <div className="flex flex-wrap gap-1">
                        {doctor.specialization.map((spec, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-1 bg-primary-100 text-primary-800 text-xs rounded-full"
                          >
                            {spec}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center text-sm text-secondary-600">
                      <Clock className="w-4 h-4 mr-2" />
                      {doctor.experience_years || 0} ans d'expérience
                    </div>

                    {doctor.profile?.location && (
                      <div className="flex items-center text-sm text-secondary-600">
                        <MapPin className="w-4 h-4 mr-2" />
                        {doctor.profile.location}
                      </div>
                    )}

                    <div className="flex items-center text-lg font-semibold text-primary-600">
                      <DollarSign className="w-5 h-5 mr-1" />
                      {doctor.consultation_fee} FCFA
                    </div>
                  </div>

                  {doctor.bio && (
                    <p className="text-sm text-secondary-600 mb-4 line-clamp-3">
                      {doctor.bio}
                    </p>
                  )}

                  <div className="flex space-x-3">
                    <Link
                      to={`/book-appointment/${doctor.id}`}
                      className="flex-1 text-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
                    >
                      <Calendar className="w-4 h-4 mr-2 inline" />
                      Prendre RDV
                    </Link>
                    <button className="px-4 py-2 border border-primary-600 text-primary-600 rounded-lg hover:bg-primary-50 transition-colors">
                      Profil
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
              <Search className="w-12 h-12 text-primary-600" />
            </div>
            <h3 className="text-xl font-semibold text-secondary-900 mb-2">
              Aucun médecin trouvé
            </h3>
            <p className="text-secondary-600">
              Essayez de modifier vos critères de recherche ou de supprimer les filtres
            </p>
          </motion.div>
        )}
      </div>
    </div>
  )
}
