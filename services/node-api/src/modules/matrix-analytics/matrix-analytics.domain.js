export class MatrixValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'MatrixValidationError';
  }
}

export function validateMatrix(matrix, name = 'Matriz') {
  if (!Array.isArray(matrix) || matrix.length === 0) {
    throw new MatrixValidationError(`${name} no puede estar vacía y debe ser un array bidimensional`);
  }

  const cols = matrix[0]?.length;
  if (!cols || typeof cols !== 'number') {
    throw new MatrixValidationError(`${name} debe tener columnas válidas`);
  }

  for (let i = 0; i < matrix.length; i++) {
    if (!Array.isArray(matrix[i]) || matrix[i].length !== cols) {
      throw new MatrixValidationError(`Cada fila de ${name} debe tener la misma cantidad de columnas (${cols})`);
    }
    for (let j = 0; j < cols; j++) {
      const val = matrix[i][j];
      if (typeof val !== 'number' || isNaN(val)) {
        throw new MatrixValidationError(`El elemento en [${i}][${j}] de ${name} debe ser un número válido`);
      }
    }
  }

  return { rows: matrix.length, cols };
}
