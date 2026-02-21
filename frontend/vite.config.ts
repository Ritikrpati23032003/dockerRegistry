import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [react(), tailwindcss()],
    server: {
      host: true,          // allow connections from outside localhost
      port: 5173,          // dev server port
      allowedHosts: 'all', // allow all hosts (for ELB/Docker)
      proxy: {
        '/api': {
          target: 'http://10.100.45.208:6500',
          changeOrigin: true,
          secure: false,
        },
      },
    },
  };
});
