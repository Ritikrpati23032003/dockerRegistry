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
       allowedHosts: [
        'a5e3f5d76f39944d58b67e5701c2333d-179004595.us-east-1.elb.amazonaws.com',
        'localhost',
        ], // allow all hosts (for ELB/Docker)
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
