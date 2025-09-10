import React from 'react';
import { motion } from 'framer-motion';
import { Heart } from 'lucide-react';

interface AuthLayoutProps {
  children: React.ReactNode;
  imageUrl: string;
  title: string;
  subtitle: string;
}

export function AuthLayout({ children, imageUrl, title, subtitle }: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-white flex">
      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:flex-none lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          {children}
        </div>
      </div>
      <div className="hidden lg:block relative w-0 flex-1">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
          className="absolute inset-0 h-full w-full object-cover"
        >
          <img
            className="absolute inset-0 h-full w-full object-cover"
            src={imageUrl}
            alt="EpicTracker background"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-primary-800 via-primary-700/60 to-transparent" />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="absolute bottom-0 left-0 p-12 text-white"
        >
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
              <Heart className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-heading font-bold">EpicTracker</span>
          </div>
          <h2 className="text-3xl font-bold leading-tight">{title}</h2>
          <p className="mt-2 text-lg text-primary-100 max-w-md">{subtitle}</p>
        </motion.div>
      </div>
    </div>
  );
}
