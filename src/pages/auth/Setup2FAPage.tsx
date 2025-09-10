import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { QrCode, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';
import { QRCodeCanvas as QRCode } from 'qrcode.react';
import { motion } from 'framer-motion';

export function Setup2FAPage() {
  const { enroll2FA, verify2FA } = useAuth();
  const navigate = useNavigate();
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [secret, setSecret] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const { register, handleSubmit, formState: { isSubmitting } } = useForm<{ token: string }>();

  useEffect(() => {
    const handleEnroll = async () => {
      const { data, error } = await enroll2FA();
      if (error) {
        toast.error(error.message);
        navigate('/profile');
      } else {
        setQrCodeUrl(data.qr_code);
        setSecret(data.secret);
        setLoading(false);
      }
    };
    handleEnroll();
  }, [enroll2FA, navigate]);

  const onSubmit = async ({ token }: { token: string }) => {
    const { error } = await verify2FA(token);
    if (error) {
      toast.error('Code invalide. Veuillez réessayer.');
    } else {
      toast.success('Authentification à deux facteurs activée !');
      navigate('/profile');
    }
  };

  if (loading) {
    return <div className="h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600"></div></div>;
  }

  return (
    <div className="min-h-screen bg-secondary-50 flex items-center justify-center">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-md w-full bg-white p-8 rounded-2xl shadow-xl">
        <div className="text-center mb-6">
          <div className="flex justify-center mb-4"><div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center"><ShieldCheck className="w-8 h-8 text-primary-600" /></div></div>
          <h1 className="text-2xl font-bold font-heading text-secondary-900">Activer la 2FA</h1>
          <p className="text-secondary-600 mt-2">Scannez ce QR code avec votre application d'authentification.</p>
        </div>
        
        <div className="flex justify-center my-6 p-4 border rounded-lg">
          {qrCodeUrl && <QRCode value={qrCodeUrl} size={200} />}
        </div>
        
        <p className="text-center text-sm text-secondary-600 mb-4">Ou entrez ce code manuellement :</p>
        <p className="text-center font-mono bg-secondary-100 p-2 rounded-md tracking-widest">{secret}</p>
        
        <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-4">
          <label className="block text-sm font-medium text-secondary-700">Entrez le code de vérification</label>
          <input {...register('token')} maxLength={6} className="w-full text-center text-2xl tracking-[1em] p-3 border border-secondary-300 rounded-lg" />
          <button type="submit" disabled={isSubmitting} className="w-full py-3 bg-primary-600 text-white font-semibold rounded-lg disabled:opacity-50">
            {isSubmitting ? 'Vérification...' : 'Activer et Vérifier'}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
