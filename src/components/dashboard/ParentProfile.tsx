import React from 'react'
import { useForm } from 'react-hook-form'
import { useAuth } from '../../contexts/AuthContext'
import { UserProfile } from '../../lib/supabase'
import toast from 'react-hot-toast'
import { User, Mail, Phone, MapPin, Save } from 'lucide-react'
import { motion } from 'framer-motion'

export function ParentProfile() {
  const { profile, updateProfile, loading } = useAuth()
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<Partial<UserProfile>>({
    defaultValues: profile || {}
  })

  const onSubmit = async (data: Partial<UserProfile>) => {
    try {
      const { error } = await updateProfile(data)
      if (error) throw error
      toast.success('Profil mis à jour avec succès !')
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <h1 className="text-3xl font-heading font-bold text-secondary-900 mb-2">Mon Profil</h1>
      <p className="text-secondary-600 mb-8">Gérez vos informations personnelles.</p>
      
      <form onSubmit={handleSubmit(onSubmit)} className="bg-white p-8 rounded-2xl shadow-xl space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-2 flex items-center"><User className="w-4 h-4 mr-2" />Nom complet</label>
            <input {...register('full_name')} className="w-full p-3 border border-secondary-300 rounded-lg" />
          </div>
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-2 flex items-center"><Mail className="w-4 h-4 mr-2" />Email</label>
            <input type="email" value={profile?.email} disabled className="w-full p-3 border border-secondary-300 rounded-lg bg-secondary-100 cursor-not-allowed" />
          </div>
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-2 flex items-center"><Phone className="w-4 h-4 mr-2" />Téléphone</label>
            <input {...register('phone')} className="w-full p-3 border border-secondary-300 rounded-lg" />
          </div>
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-2 flex items-center"><MapPin className="w-4 h-4 mr-2" />Localisation</label>
            <input {...register('location')} placeholder="Ex: Yaoundé, Cameroun" className="w-full p-3 border border-secondary-300 rounded-lg" />
          </div>
        </div>
        <div className="flex justify-end">
          <button type="submit" disabled={isSubmitting} className="flex items-center px-6 py-3 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50">
            {isSubmitting ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <><Save className="w-5 h-5 mr-2" />Enregistrer</>}
          </button>
        </div>
      </form>
    </motion.div>
  )
}
