import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const target = (env.VITE_API_BASE_URL || env.VITE_API_URL || "https://bebaolu.onrender.com").replace(/\/$/, "");

  return {
    plugins: [react()],

    base: "/",

    server: {
      proxy: {
        '/api': {
          target,
          changeOrigin: true,
          secure: false,
        },
        '/uploads': {
          target,
          changeOrigin: true,
          secure: false,
        },
      },
    },
  };
});
