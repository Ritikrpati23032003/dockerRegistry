import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [react(), tailwindcss()],
    server: {
      proxy: {
        '/api': {
          target: 'http://10.100.45.208:6500',
          changeOrigin: true,
          secure: false,
        },
      },
      host: true, // Needed for Docker port mapping
      port: 5173,
       allowedHosts: [
        'a15a1cbae7beb41f696abb3f8681f2fb-194050949.us-east-1.elb.amazonaws.com'
      ],
    },
  };
});
