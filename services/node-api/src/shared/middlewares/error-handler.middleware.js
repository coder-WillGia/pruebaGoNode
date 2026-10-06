import { ApiResponse } from '../utils/api-response.js';

export function errorHandler(err, req, res, next) {
  console.error('[Unhandled Error]', err);
  return ApiResponse.internalError(
    res,
    err.message || 'Error inesperado en el servidor',
    process.env.NODE_ENV === 'development' ? err.stack : undefined
  );
}
