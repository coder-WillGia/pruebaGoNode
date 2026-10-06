import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import healthRoutes from './modules/health/health.routes.js';
import matrixAnalyticsRoutes from './modules/matrix-analytics/matrix-analytics.routes.js';
import { errorHandler } from './shared/middlewares/error-handler.middleware.js';

export function createApp() {
  const app = express();

  // Middlewares globales
  app.use(cors({ origin: '*' }));
  app.use(express.json({ limit: '10mb' }));
  app.use(morgan('dev'));

  // Health check
  app.use(healthRoutes);

  // API v1 Routing
  const apiV1 = express.Router();
  apiV1.use('/matrix', matrixAnalyticsRoutes);
  app.use('/api/v1', apiV1);

  // Manejador 404
  app.use((req, res) => {
    res.status(404).json({
      status: 'error',
      message: `Ruta no encontrada: ${req.method} ${req.originalUrl}`
    });
  });

  // Manejador global de errores
  app.use(errorHandler);

  return app;
}
