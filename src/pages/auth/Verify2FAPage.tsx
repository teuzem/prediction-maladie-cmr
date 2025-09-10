import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Shield, Heart } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';
import { AuthLayout } from './AuthLayout';
import { motion } from 'framer-motion';

export function Verify2FAPage() {
  const { verify2FA } = useAuth();
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { isSubmitting } } = useForm<{ token: string }>();

  const onSubmit = async ({ token }: { token: string }) => {
    const { error } = await verify2FA(token);
    if (error) {
      toast.error('Code invalide. Veuillez réessayer.');
    } else {
      toast.success('Vérification réussie !');
      navigate('/doctor/dashboard');
    }
  };

  return (
    <AuthLayout
      imageUrl="https://images.unsplash.com/photo-1618019106925-e21398b89753?auto=format&fit=crop&w=1280&q=80"
      title="Sécurité renforcée."
      subtitle="Une dernière étape pour vérifier votre identité et protéger votre compte."
    >
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="text-center lg:text-left">
          <div className="flex items-center justify-center lg:justify-start space-x-2 mb-8">
            <Heart className="w-8 h-8 text-primary-600" />
            <span className="text-2xl font-bold font-heading text-secondary-900">EpicTracker</span>
          </div>
          <h2 className="text-2xl font-bold text-secondary-900">
            Vérification 2FA
          </h2>
          <p className="mt-2 text-sm text-secondary-600">
            Entrez le code à 6 chiffres de votre application d'authentification.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-6">
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-2">Code de vérification</label>
            <input 
              {...register('token')} 
              maxLength={6} 
              className="w-full text-center text-3xl tracking-[0.5em] p-3 border border-secondary-300 rounded-lg"
              placeholder="_ _ _ _ _ _"
            />
          </div>
          <button type="submit" disabled={isSubmitting} className="w-full flex items-center justify-center py-3 px-4 bg-primary-600 text-white font-semibold rounded-lg disabled:opacity-50">
            {isSubmitting ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <><Shield className="w-5 h-5 mr-2" />Vérifier</>}
          </button>
        </form>
      </motion.div>
    </AuthLayout>
  );
}
