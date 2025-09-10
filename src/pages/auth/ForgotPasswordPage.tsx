import React from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, Heart } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';
import { AuthLayout } from './AuthLayout';
import { motion } from 'framer-motion';

const forgotPasswordSchema = z.object({
  email: z.string().email('Email invalide'),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export function ForgotPasswordPage() {
  const { sendPasswordResetEmail } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    try {
      const { error } = await sendPasswordResetEmail(data.email);
      if (error) throw error;
      toast.success('Email de réinitialisation envoyé ! Vérifiez votre boîte de réception.');
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de l\'envoi de l\'email.');
    }
  };

  return (
    <AuthLayout
      imageUrl="https://images.unsplash.com/photo-1584467735878-3a7378564342?auto=format&fit=crop&w=1280&q=80"
      title="Retrouvez l'accès à votre compte."
      subtitle="Entrez votre email pour recevoir un lien de réinitialisation de mot de passe."
    >
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="text-center lg:text-left">
          <div className="flex items-center justify-center lg:justify-start space-x-2 mb-8">
            <Heart className="w-8 h-8 text-primary-600" />
            <span className="text-2xl font-bold font-heading text-secondary-900">EpicTracker</span>
          </div>
          <h2 className="text-2xl font-bold text-secondary-900">
            Mot de passe oublié
          </h2>
          <p className="mt-2 text-sm text-secondary-600">
            Entrez votre email et nous vous enverrons un lien pour réinitialiser votre mot de passe.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-6">
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-2">Email</label>
            <input {...register('email')} type="email" className="w-full px-4 py-3 border border-secondary-300 rounded-lg" />
            {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
          </div>
          <button type="submit" disabled={isSubmitting} className="w-full flex items-center justify-center py-3 px-4 bg-primary-600 text-white font-semibold rounded-lg disabled:opacity-50">
            {isSubmitting ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <><Mail className="w-5 h-5 mr-2" />Envoyer le lien</>}
          </button>
        </form>
        <div className="mt-6 text-center">
            <Link to="/auth/login" className="text-sm font-medium text-primary-600 hover:text-primary-500">
              Retour à la connexion
            </Link>
        </div>
      </motion.div>
    </AuthLayout>
  );
}
