import { createApp } from './app.js';
import { env } from './shared/config/env.js';

const app = createApp();

const host = '0.0.0.0';

app.listen(env.port, host, () => {
  console.log(`[Node Analytics API] Servidor Express escuchando en http://${host}:${env.port}`);
  console.log(`[Node Analytics API] Modo: ${env.nodeEnv}`);
});

