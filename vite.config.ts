
import { defineConfig, loadEnv } from 'vite';
  import react from '@vitejs/plugin-react-swc';
  import path from 'path';
  export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd(), '');
    const supabaseUrl = env.VITE_SUPABASE_URL || 'https://evcqpapvcvmljgqiuzsq.supabase.co';

    return {
      plugins: [react()],
      resolve: {
        extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
        dedupe: ['react', 'react-dom'],
        alias: {
          react: path.resolve(__dirname, './node_modules/react'),
          'react-dom': path.resolve(__dirname, './node_modules/react-dom'),
          '@': path.resolve(__dirname, './src'),
        },
      },
      optimizeDeps: {
        include: ['react', 'react-dom', 'react-router-dom', 'framer-motion'],
      },
      build: {
        target: 'esnext',
        outDir: 'build',
      },
      server: {
        port: 3000,
        strictPort: true,
        open: true,
        proxy: {
          '/functions/v1': {
            target: supabaseUrl,
            changeOrigin: true,
            secure: true,
          },
        },
      },
      preview: {
        port: 3000,
        strictPort: true,
      },
    };
  });
