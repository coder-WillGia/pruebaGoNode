import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode, command }) => {
  // Cargar variables de entorno desde .env y desde el entorno del sistema (Docker / Shell)
  const env = { ...process.env, ...loadEnv(mode, process.cwd(), '') };
  const port = env.PORT || env.VITE_PORT;

  if (command === 'serve' && !port) {
    throw new Error('[Vite Config Error] La variable de entorno PORT es obligatoria y no fue encontrada en el archivo .env');
  }

  return {
    plugins: [react()],
    server: {
      port: port ? Number(port) : 5173,
      host: true
    }
  };
});
