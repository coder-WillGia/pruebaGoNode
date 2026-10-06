/**
 * Configuración de entorno para el Frontend
 * Lee estrictamente de las variables de entorno de Vite sin valores quemados.
 */
const apiUrl = import.meta.env.VITE_API_URL;

if (!apiUrl) {
  console.warn('[Frontend Config] Variable VITE_API_URL no encontrada en el entorno.');
}

export const API_BASE = apiUrl || '';
