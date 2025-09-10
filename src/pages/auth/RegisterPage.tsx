import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Baby, Stethoscope, Heart, UserPlus } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';
import { AuthLayout } from './AuthLayout';
import { PasswordStrengthIndicator } from '../../components/auth/PasswordStrengthIndicator';
import { checkPasswordStrength } from '../../lib/utils';
import { motion } from 'framer-motion';

const registerSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(8, 'Le mot de passe doit contenir au moins 8 caractères'),
  confirmPassword: z.string(),
  full_name: z.string().min(2, 'Le nom complet est requis'),
  role: z.enum(['parent', 'doctor']),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirmPassword"],
});

type RegisterFormData = z.infer<typeof registerSchema>;

export function RegisterPage() {
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const passwordStrength = checkPasswordStrength(password);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: { role: 'parent' },
  });

  const selectedRole = watch('role');

  const onSubmit = async (data: RegisterFormData) => {
    try {
      const { error } = await signUp(data.email, data.password, {
        full_name: data.full_name,
        role: data.role,
      });
      if (error) throw error;
      
      navigate('/auth/verify-email', { state: { email: data.email } });
    } catch (error: any) {
      toast.error(error.message || 'Une erreur est survenue lors de l\'inscription.');
    }
  };

  return (
    <AuthLayout
      imageUrl="https://images.unsplash.com/photo-1532094206299-025c81056a81?auto=format&fit=crop&w=1280&q=80"
      title="Rejoignez la révolution de la santé infantile."
      subtitle="Créez votre compte pour accéder à un diagnostic IA et à des consultations médicales de qualité."
    >
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="text-center lg:text-left">
          <div className="flex items-center justify-center lg:justify-start space-x-2 mb-8">
            <Heart className="w-8 h-8 text-primary-600" />
            <span className="text-2xl font-bold font-heading text-secondary-900">EpicTracker</span>
          </div>
          <h2 className="text-2xl font-bold text-secondary-900">
            Créer un compte
          </h2>
          <p className="mt-2 text-sm text-secondary-600">
            Déjà un compte ?{' '}
            <Link to="/auth/login" className="font-medium text-primary-600 hover:text-primary-500">
              Se connecter
            </Link>
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-6">
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-3">Je suis un(e) :</label>
            <div className="grid grid-cols-2 gap-3">
              <label className={`relative flex flex-col items-center p-4 rounded-lg border-2 cursor-pointer transition-all ${selectedRole === 'parent' ? 'border-primary-500 bg-primary-50' : 'border-secondary-200'}`}>
                <input type="radio" {...register('role')} value="parent" className="sr-only" />
                <Baby className="w-6 h-6 mb-2" />
                <span className="text-sm font-medium">Parent</span>
              </label>
              <label className={`relative flex flex-col items-center p-4 rounded-lg border-2 cursor-pointer transition-all ${selectedRole === 'doctor' ? 'border-primary-500 bg-primary-50' : 'border-secondary-200'}`}>
                <input type="radio" {...register('role')} value="doctor" className="sr-only" />
                <Stethoscope className="w-6 h-6 mb-2" />
                <span className="text-sm font-medium">Médecin</span>
              </label>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-2">Nom complet</label>
            <input {...register('full_name')} className="w-full px-4 py-3 border border-secondary-300 rounded-lg" />
            {errors.full_name && <p className="mt-1 text-sm text-red-600">{errors.full_name.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-2">Email</label>
            <input {...register('email')} type="email" className="w-full px-4 py-3 border border-secondary-300 rounded-lg" />
            {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-2">Mot de passe</label>
            <input {...register('password')} type="password" onChange={(e) => setPassword(e.target.value)} className="w-full px-4 py-3 border border-secondary-300 rounded-lg" />
            {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>}
            {password && <PasswordStrengthIndicator strength={passwordStrength} />}
          </div>
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-2">Confirmer le mot de passe</label>
            <input {...register('confirmPassword')} type="password" className="w-full px-4 py-3 border border-secondary-300 rounded-lg" />
            {errors.confirmPassword && <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>}
          </div>
          <button type="submit" disabled={isSubmitting} className="w-full flex items-center justify-center py-3 px-4 bg-primary-600 text-white font-semibold rounded-lg disabled:opacity-50">
            {isSubmitting ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <><UserPlus className="w-5 h-5 mr-2" />Créer mon compte</>}
          </button>
        </form>
      </motion.div>
    </AuthLayout>
  );
}
