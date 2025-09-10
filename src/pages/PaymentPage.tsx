import React from 'react'
import { useLocation, Navigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { DollarSign, CreditCard, Shield, ArrowLeft } from 'lucide-react'
import { usePaystackPayment } from '../hooks/usePaystackPayment'
import { useCinetpayPayment } from '../hooks/useCinetpayPayment'

export function PaymentPage() {
  const location = useLocation();
  const appointment = location.state?.appointment;

  if (!appointment) {
    return <Navigate to="/appointments" replace />;
  }

  const payWithPaystack = usePaystackPayment(appointment);
  const payWithCinetpay = useCinetpayPayment(appointment);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <Link to="/appointments" className="inline-flex items-center text-secondary-600 hover:text-primary-600 mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour aux rendez-vous
          </Link>
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center shadow-lg">
              <DollarSign className="w-8 h-8 text-white" />
            </div>
          </div>
          <h2 className="mt-6 text-3xl font-heading font-bold text-secondary-900">
            Paiement de la consultation
          </h2>
          <p className="mt-2 text-sm text-secondary-600">
            Finalisez votre rendez-vous en procédant au paiement sécurisé.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-white rounded-2xl shadow-xl p-8"
        >
          <div className="border-b border-secondary-200 pb-6 mb-6">
            <h3 className="text-lg font-semibold text-secondary-900 mb-4">Résumé du rendez-vous</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-secondary-600">Médecin:</span>
                <span className="font-medium text-secondary-800">Dr. {appointment.doctor?.profile?.full_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-secondary-600">Patient:</span>
                <span className="font-medium text-secondary-800">{appointment.child?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-secondary-600">Date:</span>
                <span className="font-medium text-secondary-800">{new Date(appointment.appointment_date).toLocaleString('fr-FR')}</span>
              </div>
              <div className="flex justify-between text-lg font-bold text-primary-600 pt-3 border-t border-secondary-200 mt-3">
                <span>Total à payer:</span>
                <span>{appointment.consultation_fee.toLocaleString()} FCFA</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-secondary-900 mb-4">Choisissez une méthode de paiement</h3>
            <div className="space-y-4">
              <button
                onClick={payWithPaystack}
                className="w-full flex items-center justify-between px-6 py-4 border-2 border-secondary-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-all"
              >
                <div className="flex items-center">
                  <CreditCard className="w-6 h-6 mr-4 text-primary-600" />
                  <span className="font-semibold text-secondary-800">Payer avec PayStack</span>
                </div>
                <img src="https://assets.paystack.com/assets/img/logos/paystack-logo-primary-dark.svg" alt="Paystack" className="h-6" />
              </button>

              <button
                onClick={payWithCinetpay}
                className="w-full flex items-center justify-between px-6 py-4 border-2 border-secondary-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-all"
              >
                <div className="flex items-center">
                  <CreditCard className="w-6 h-6 mr-4 text-primary-600" />
                  <span className="font-semibold text-secondary-800">Payer avec CinetPay</span>
                </div>
                {/* Replace with CinetPay logo if available */}
                <span className="font-bold text-blue-600">CinetPay</span>
              </button>
            </div>
          </div>

          <div className="mt-8 text-center text-xs text-secondary-500 flex items-center justify-center">
            <Shield className="w-4 h-4 mr-2" />
            <span>Paiement 100% sécurisé et crypté.</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
