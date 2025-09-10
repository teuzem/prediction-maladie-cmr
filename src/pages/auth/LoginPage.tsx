import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, LogIn, Heart } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';
import { AuthLayout } from './AuthLayout';
import { motion } from 'framer-motion';

const loginSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(1, 'Le mot de passe est requis'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      const { error, needs2FA } = await signIn(data.email, data.password);
      if (error) throw error;
      
      toast.success('Connexion réussie !');

      if (needs2FA) {
        navigate('/auth/verify-2fa');
      } else {
        navigate('/dashboard');
      }
    } catch (error: any) {
      toast.error(error.message || 'Email ou mot de passe incorrect.');
    }
  };

  return (
    <AuthLayout
      imageUrl="https://images.unsplash.com/photo-1516574187841-cb9cc2ca948b?auto=format&fit=crop&w=1280&q=80"
      title="Bienvenue sur EpicTracker"
      subtitle="Accédez à votre espace pour suivre la santé de vos enfants et gérer vos consultations."
    >
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="text-center lg:text-left">
          <div className="flex items-center justify-center lg:justify-start space-x-2 mb-8">
            <Heart className="w-8 h-8 text-primary-600" />
            <span className="text-2xl font-bold font-heading text-secondary-900">EpicTracker</span>
          </div>
          <h2 className="text-2xl font-bold text-secondary-900">
            Connexion
          </h2>
          <p className="mt-2 text-sm text-secondary-600">
            Pas encore de compte ?{' '}
            <Link to="/auth/register" className="font-medium text-primary-600 hover:text-primary-500">
              S'inscrire
            </Link>
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-6">
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-2">Email</label>
            <input {...register('email')} type="email" className="w-full px-4 py-3 border border-secondary-300 rounded-lg" />
            {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
          </div>
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-secondary-700">Mot de passe</label>
              <Link to="/auth/forgot-password" className="text-sm font-medium text-primary-600 hover:text-primary-500">
                Mot de passe oublié ?
              </Link>
            </div>
            <div className="relative">
              <input {...register('password')} type={showPassword ? 'text' : 'password'} className="w-full px-4 py-3 pr-12 border border-secondary-300 rounded-lg" />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3 text-secondary-500">
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>}
          </div>
          <button type="submit" disabled={isSubmitting} className="w-full flex items-center justify-center py-3 px-4 bg-primary-600 text-white font-semibold rounded-lg disabled:opacity-50">
            {isSubmitting ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <><LogIn className="w-5 h-5 mr-2" />Se connecter</>}
          </button>
        </form>
      </motion.div>
    </AuthLayout>
  );
}
