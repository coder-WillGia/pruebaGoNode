/**
 * Core Algorithm: Cómputo puro de métricas estadísticas sobre colecciones de matrices.
 */
export class StatsCalculator {
  /**
   * Calcula el valor máximo, mínimo, suma, promedio y total de elementos sobre una o varias matrices.
   * @param {number[][][]} matrices - Lista de matrices a evaluar
   */
  static compute(matrices = []) {
    let max = -Infinity;
    let min = Infinity;
    let sum = 0;
    let totalElements = 0;

    for (const matrix of matrices) {
      if (!Array.isArray(matrix)) continue;

      for (let i = 0; i < matrix.length; i++) {
        const row = matrix[i];
        if (!Array.isArray(row)) continue;

        for (let j = 0; j < row.length; j++) {
          const val = row[j];
          if (typeof val !== 'number' || isNaN(val)) continue;

          if (val > max) max = val;
          if (val < min) min = val;
          sum += val;
          totalElements++;
        }
      }
    }

    if (totalElements === 0) {
      return {
        max: 0,
        min: 0,
        average: 0,
        sum: 0,
        total_elements: 0
      };
    }

    const average = sum / totalElements;

    return {
      max: Number(max.toFixed(6)),
      min: Number(min.toFixed(6)),
      average: Number(average.toFixed(6)),
      sum: Number(sum.toFixed(6)),
      total_elements: totalElements
    };
  }
}
