import React from 'react';
import { motion } from 'framer-motion';

interface PasswordStrengthIndicatorProps {
  strength: number; // Score from 0 to 5
}

export function PasswordStrengthIndicator({ strength }: PasswordStrengthIndicatorProps) {
  const levels = [
    { text: 'Très faible', color: 'bg-red-500' },
    { text: 'Faible', color: 'bg-red-500' },
    { text: 'Moyen', color: 'bg-yellow-500' },
    { text: 'Fort', color: 'bg-green-500' },
    { text: 'Très fort', color: 'bg-green-500' },
    { text: 'Excellent', color: 'bg-green-600' },
  ];

  const currentLevel = levels[strength];

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            className={`h-1.5 flex-1 rounded-full ${i < strength ? currentLevel.color : 'bg-secondary-200'}`}
            initial={{ width: 0 }}
            animate={{ width: '100%' }}
            transition={{ duration: 0.3 }}
          />
        ))}
      </div>
      {strength > 0 && (
        <p className="text-xs font-medium" style={{ color: currentLevel.color.replace('bg-', '') }}>
          Force : {currentLevel.text}
        </p>
      )}
    </div>
  );
}
