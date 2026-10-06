/**
 * Configuración de entorno para el Frontend
 * Lee estrictamente de las variables de entorno de Vite sin valores quemados ni fallbacks.
 */
const apiUrl = import.meta.env.VITE_API_URL;

if (!apiUrl) {
  throw new Error('[Frontend Config Error] La variable de entorno VITE_API_URL es obligatoria y no fue encontrada en el .env');
}

export const API_BASE = apiUrl;
