import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { MailCheck, Heart } from 'lucide-react';
import { motion } from 'framer-motion';

export function VerifyEmailPage() {
  const location = useLocation();
  const email = location.state?.email;

  return (
    <div className="min-h-screen bg-secondary-50 flex items-center justify-center">
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full text-center p-8 bg-white rounded-2xl shadow-xl"
      >
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center shadow-lg">
            <MailCheck className="w-8 h-8 text-white" />
          </div>
        </div>
        <h1 className="text-2xl font-bold font-heading text-secondary-900 mb-4">Vérifiez votre email</h1>
        <p className="text-secondary-600 mb-6">
          Nous avons envoyé un lien de confirmation à <br />
          <span className="font-semibold text-primary-600">{email || 'votre adresse email'}</span>.
        </p>
        <p className="text-secondary-600 mb-8">
          Veuillez cliquer sur ce lien pour activer votre compte.
        </p>
        <Link to="/auth/login" className="text-sm font-medium text-primary-600 hover:text-primary-500">
          Retour à la page de connexion
        </Link>
      </motion.div>
    </div>
  );
}
