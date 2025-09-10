import React, { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { authService } from '../../lib/auth'
import { UserProfile, Doctor } from '../../lib/supabase'
import toast from 'react-hot-toast'
import { User, Mail, Phone, MapPin, Save, Stethoscope, Briefcase, DollarSign, BookOpen, Shield } from 'lucide-react'
import { motion } from 'framer-motion'

type DoctorProfileFormData = Partial<UserProfile> & Partial<Doctor>;

export function DoctorProfile() {
  const { user, profile, loading, setProfile } = useAuth()
  const navigate = useNavigate()
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<DoctorProfileFormData>()

  useEffect(() => {
    if (user) {
      authService.getDoctorProfile(user.id).then(({ data, error }) => {
        if (error) {
          toast.error("Erreur lors du chargement du profil médecin.");
        } else if (data) {
          const combinedProfile = {
            ...data.profile,
            ...data,
            specialization: Array.isArray(data.specialization) ? data.specialization.join(', ') : '',
          };
          delete combinedProfile.profile;
          reset(combinedProfile);
        }
      });
    }
  }, [user, reset]);

  const onSubmit = async (data: DoctorProfileFormData) => {
    if (!user) return;
    try {
      const profileUpdates = {
        full_name: data.full_name,
        phone: data.phone,
        location: data.location,
      };
      const doctorUpdates = {
        specialization: data.specialization?.toString().split(',').map(s => s.trim()),
        experience_years: data.experience_years,
        consultation_fee: data.consultation_fee,
        bio: data.bio,
      };
      
      const { data: updatedData, error } = await authService.updateDoctorProfile(user.id, profileUpdates, doctorUpdates);
      if (error) throw error;
      
      setProfile(prev => ({ ...prev, ...profileUpdates } as UserProfile));

      toast.success('Profil mis à jour avec succès !');
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <h1 className="text-3xl font-heading font-bold text-secondary-900 mb-2">Mon Profil Professionnel</h1>
      <p className="text-secondary-600 mb-8">Gérez vos informations publiques et professionnelles.</p>
      
      <form onSubmit={handleSubmit(onSubmit)} className="bg-white p-8 rounded-2xl shadow-xl space-y-8">
        {/* Personal Info */}
        <section>
          <h2 className="text-xl font-semibold mb-4">Informations Personnelles</h2>
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
        </section>

        {/* Professional Info */}
        <section>
          <h2 className="text-xl font-semibold mb-4">Informations Professionnelles</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2 flex items-center"><Stethoscope className="w-4 h-4 mr-2" />Spécialités (séparées par des virgules)</label>
              <input {...register('specialization')} className="w-full p-3 border border-secondary-300 rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2 flex items-center"><Briefcase className="w-4 h-4 mr-2" />Années d'expérience</label>
              <input type="number" {...register('experience_years', { valueAsNumber: true })} className="w-full p-3 border border-secondary-300 rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2 flex items-center"><DollarSign className="w-4 h-4 mr-2" />Frais de consultation (FCFA)</label>
              <input type="number" {...register('consultation_fee', { valueAsNumber: true })} className="w-full p-3 border border-secondary-300 rounded-lg" />
            </div>
          </div>
          <div className="mt-6">
            <label className="block text-sm font-medium text-secondary-700 mb-2 flex items-center"><BookOpen className="w-4 h-4 mr-2" />Biographie</label>
            <textarea {...register('bio')} rows={4} className="w-full p-3 border border-secondary-300 rounded-lg"></textarea>
          </div>
        </section>

        {/* Security */}
        <section>
          <h2 className="text-xl font-semibold mb-4">Sécurité</h2>
          <div className="bg-secondary-50 p-4 rounded-lg flex items-center justify-between">
            <div>
              <h3 className="font-medium text-secondary-800">Authentification à deux facteurs (2FA)</h3>
              <p className="text-sm text-secondary-600">Ajoutez une couche de sécurité supplémentaire à votre compte.</p>
            </div>
            <button
              type="button"
              onClick={() => navigate('/auth/setup-2fa')}
              className="flex items-center px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Shield className="w-4 h-4 mr-2" />
              Configurer
            </button>
          </div>
        </section>

        <div className="flex justify-end pt-4 border-t">
          <button type="submit" disabled={isSubmitting} className="flex items-center px-6 py-3 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50">
            {isSubmitting ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <><Save className="w-5 h-5 mr-2" />Enregistrer les modifications</>}
          </button>
        </div>
      </form>
    </motion.div>
  )
}
