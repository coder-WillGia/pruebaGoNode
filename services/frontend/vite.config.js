import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Cargar variables de entorno estrictamente desde el .env del frontend
  const env = loadEnv(mode, process.cwd(), '');

  if (!env.PORT) {
    throw new Error('[Vite Config Error] La variable de entorno PORT es obligatoria y no fue encontrada en el archivo .env');
  }

  return {
    plugins: [react()],
    server: {
      port: Number(env.PORT),
      host: true
    }
  };
});
