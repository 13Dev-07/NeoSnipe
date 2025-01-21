import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@utils': path.resolve(__dirname, './src/utils'),
      '@styles': path.resolve(__dirname, './src/styles'),
      '@visual_design': path.resolve(__dirname, './visual_design'),
      '@user_interface': path.resolve(__dirname, './user_interface'),
      '@market_analysis': path.resolve(__dirname, './market_analysis'),
      '@token_discovery': path.resolve(__dirname, './token_discovery'),
      '@core': path.resolve(__dirname, './core')
    }
  },
  build: {
    outDir: 'build',
    sourcemap: true,
    commonjsOptions: {
      include: [/node_modules/],
      transformMixedEsModules: true
    },
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          three: ['three', '@react-three/fiber'],
          ui: ['@mui/material', '@emotion/react', '@emotion/styled']
        }
      }
    }
  },
  optimizeDeps: {
    include: ['@emotion/react', '@emotion/styled', '@mui/material']
  },
  server: {
    port: 3000,
    open: true
  }
});