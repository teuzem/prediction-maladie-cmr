import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  
  define: {
    'global': 'window',
  },

  optimizeDeps: {
    exclude: ['lucide-react'],
    include: ['@paystack/inline-js'],
  },
});
