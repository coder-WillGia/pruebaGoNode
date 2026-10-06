import { createApp } from './app.js';
import { env } from './shared/config/env.js';

const app = createApp();

app.listen(env.port, () => {
  console.log(`[Node Analytics API] Servidor Express escuchando en http://localhost:${env.port}`);
  console.log(`[Node Analytics API] Modo: ${env.nodeEnv}`);
});
