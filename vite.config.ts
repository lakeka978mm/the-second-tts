import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      base: process.env.GITHUB_PAGES === 'true' ? '/the-second-tts/' : '/',
      server: {
        port: 3000,
        host: '0.0.0.0',
        proxy: {
          // 本地开发时，将浏览器请求代理到火山 Doubao TTS V3 接口，避免跨域 / CORS 问题
          '/doubao-tts': {
            target: 'https://openspeech.bytedance.com',
            changeOrigin: true,
            secure: true,
            rewrite: (p) => p.replace(/^\/doubao-tts/, '/api/v3/tts/unidirectional'),
          },
        },
      },
      plugins: [react()],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
