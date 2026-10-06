/**
 * Core Algorithm: Verificación de condición de matriz diagonal.
 * Una matriz es diagonal si es cuadrada y todos los elementos fuera de la diagonal principal son cero (con tolerancia épsilon).
 */
export class DiagonalChecker {
  static EPSILON = 1e-6;

  /**
   * Determina si una matriz dada es diagonal.
   * @param {number[][]} matrix
   * @param {number} epsilon
   * @returns {boolean}
   */
  static isDiagonal(matrix, epsilon = DiagonalChecker.EPSILON) {
    if (!Array.isArray(matrix) || matrix.length === 0) return false;

    const rows = matrix.length;
    const cols = matrix[0]?.length;

    // Solo una matriz cuadrada (n x n) puede ser diagonal
    if (rows !== cols) {
      return false;
    }

    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        if (i !== j) {
          // Elemento fuera de la diagonal principal
          if (Math.abs(matrix[i][j]) > epsilon) {
            return false;
          }
        }
      }
    }

    return true;
  }
}
