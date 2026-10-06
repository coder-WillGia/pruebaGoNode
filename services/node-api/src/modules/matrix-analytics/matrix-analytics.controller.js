import { MatrixAnalyticsService } from './matrix-analytics.service.js';
import { ApiResponse } from '../../shared/utils/api-response.js';
import { MatrixValidationError } from './matrix-analytics.domain.js';

export class MatrixAnalyticsController {
  /**
   * Manejador HTTP para POST /api/v1/matrix/analyze
   */
  static analyze(req, res, next) {
    try {
      const { q, r } = req.body || {};

      if (!q || !r) {
        return ApiResponse.badRequest(
          res,
          'El cuerpo de la petición debe contener los campos requeridos: "q" y "r" con las matrices numéricas'
        );
      }

      const result = MatrixAnalyticsService.analyze({ q, r });

      return ApiResponse.ok(res, result, 'Análisis estadístico de matrices computado exitosamente');
    } catch (error) {
      if (error instanceof MatrixValidationError) {
        return ApiResponse.badRequest(res, error.message);
      }
      return next(error);
    }
  }
}
