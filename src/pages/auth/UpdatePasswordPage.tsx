import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { KeyRound, Heart } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';
import { AuthLayout } from './AuthLayout';
import { motion } from 'framer-motion';

const updatePasswordSchema = z.object({
  password: z.string().min(8, 'Le mot de passe doit contenir au moins 8 caractères'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirmPassword"],
});

type UpdatePasswordFormData = z.infer<typeof updatePasswordSchema>;

export function UpdatePasswordPage() {
  const { updateUserPassword } = useAuth();
  const navigate = useNavigate();
  const [isValidToken, setIsValidToken] = useState(false);

  useEffect(() => {
    // Supabase redirects with the token in the URL hash
    if (window.location.hash.includes('access_token')) {
      setIsValidToken(true);
    } else {
      toast.error("Lien de réinitialisation invalide ou expiré.");
      navigate('/auth/login');
    }
  }, [navigate]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<UpdatePasswordFormData>({
    resolver: zodResolver(updatePasswordSchema),
  });

  const onSubmit = async (data: UpdatePasswordFormData) => {
    try {
      const { error } = await updateUserPassword(data.password);
      if (error) throw error;
      toast.success('Mot de passe mis à jour avec succès ! Vous pouvez maintenant vous connecter.');
      navigate('/auth/login');
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de la mise à jour du mot de passe.');
    }
  };

  if (!isValidToken) {
    return <div className="h-screen flex items-center justify-center">Chargement...</div>;
  }

  return (
    <AuthLayout
      imageUrl="https://images.unsplash.com/photo-1526628953301-3e589a6a8b74?auto=format&fit=crop&w=1280&q=80"
      title="Sécurisez votre compte."
      subtitle="Choisissez un nouveau mot de passe fort pour protéger vos informations."
    >
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="text-center lg:text-left">
          <div className="flex items-center justify-center lg:justify-start space-x-2 mb-8">
            <Heart className="w-8 h-8 text-primary-600" />
            <span className="text-2xl font-bold font-heading text-secondary-900">EpicTracker</span>
          </div>
          <h2 className="text-2xl font-bold text-secondary-900">
            Réinitialiser le mot de passe
          </h2>
          <p className="mt-2 text-sm text-secondary-600">
            Entrez votre nouveau mot de passe ci-dessous.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-6">
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-2">Nouveau mot de passe</label>
            <input {...register('password')} type="password" className="w-full px-4 py-3 border border-secondary-300 rounded-lg" />
            {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-2">Confirmer le nouveau mot de passe</label>
            <input {...register('confirmPassword')} type="password" className="w-full px-4 py-3 border border-secondary-300 rounded-lg" />
            {errors.confirmPassword && <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>}
          </div>
          <button type="submit" disabled={isSubmitting} className="w-full flex items-center justify-center py-3 px-4 bg-primary-600 text-white font-semibold rounded-lg disabled:opacity-50">
            {isSubmitting ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <><KeyRound className="w-5 h-5 mr-2" />Mettre à jour</> }
          </button>
        </form>
      </motion.div>
    </AuthLayout>
  );
}
