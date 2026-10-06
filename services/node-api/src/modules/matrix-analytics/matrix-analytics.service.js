import { validateMatrix } from './matrix-analytics.domain.js';
import { StatsCalculator } from './stats-calculator.js';
import { DiagonalChecker } from './diagonal-checker.js';

export class MatrixAnalyticsService {
  /**
   * Orquesta el análisis estadístico y la verificación diagonal de matrices Q y R.
   * @param {Object} params
   * @param {number[][]} params.q - Matriz Q
   * @param {number[][]} params.r - Matriz R
   * @returns {Object} Reporte consolidado de estadísticas
   */
  static analyze({ q, r }) {
    // 1. Validaciones de dominio
    validateMatrix(q, 'Matriz Q');
    validateMatrix(r, 'Matriz R');

    // 2. Cómputo de estadísticas agregadas sobre Q y R
    const stats = StatsCalculator.compute([q, r]);

    // 3. Verificación de matriz diagonal individual y global
    const isQDiagonal = DiagonalChecker.isDiagonal(q);
    const isRDiagonal = DiagonalChecker.isDiagonal(r);
    const isAnyDiagonal = isQDiagonal || isRDiagonal;

    return {
      stats,
      diagonal_check: {
        is_q_diagonal: isQDiagonal,
        is_r_diagonal: isRDiagonal,
        is_any_diagonal: isAnyDiagonal
      }
    };
  }
}
