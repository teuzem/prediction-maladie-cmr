import PaystackPop from '@paystack/inline-js';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import { supabase } from '../lib/supabase';
import { Appointment } from '../lib/supabase';

export const usePaystackPayment = (appointment: Appointment) => {
  const { user, profile } = useAuth();

  const payWithPaystack = () => {
    if (!user || !profile) {
      toast.error('Vous devez être connecté pour effectuer un paiement.');
      return;
    }

    const publicKey = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY;
    if (!publicKey || publicKey === 'YOUR_API_KEY') {
      toast.error("La clé API de paiement n'est pas configurée.");
      console.error('Paystack public key is missing. Please set it in your .env file.');
      return;
    }

    const paystack = new PaystackPop();

    paystack.newTransaction({
      key: publicKey,
      email: user.email,
      amount: appointment.consultation_fee * 100, // Paystack expects amount in lowest currency unit
      currency: 'XAF', // CFA Franc
      ref: `epictracker_${appointment.id}_${Date.now()}`,
      metadata: {
        user_id: user.id,
        full_name: profile.full_name,
        appointment_id: appointment.id,
      },
      onSuccess: async (transaction) => {
        toast.success('Paiement réussi ! Mise à jour du statut...');
        
        // --- REAL-TIME DATABASE UPDATE ---
        // In a real app, this should be handled by a secure backend webhook.
        // For this project, we'll update the database directly from the client for demonstration.
        try {
          const { error: paymentError } = await supabase
            .from('payments')
            .insert({
              appointment_id: appointment.id,
              parent_id: user.id,
              amount: appointment.consultation_fee,
              currency: 'XAF',
              payment_method: 'paystack',
              transaction_id: transaction.reference,
              payment_status: 'completed',
              payment_gateway_response: transaction as any,
            });

          if (paymentError) throw paymentError;

          toast.success('Statut du paiement mis à jour.');
          window.location.href = '/appointments';

        } catch (error: any) {
          console.error('Error updating payment status:', error);
          toast.error(`Erreur lors de la mise à jour: ${error.message}`);
        }
      },
      onCancel: () => {
        toast.error('Le processus de paiement a été annulé.');
      },
    });
  };

  return payWithPaystack;
};
