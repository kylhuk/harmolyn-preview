import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { componentTagger } from 'lovable-tagger';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      base: process.env.TAURI_ENV_PLATFORM ? './' : '/',
      server: {
        port: 8080,
        host: '0.0.0.0',
      },
      plugins: [
        react(),
        mode === 'development' && componentTagger(),
      ].filter(Boolean),
      // SECURITY: Never inject secret API keys into client bundles via define.
      // Use edge functions / backend proxies for any external API calls.
      resolve: {
        alias: {
          '@': path.resolve(__dirname, './src'),
        }
      }
    };
});
