/**
 * Tool de verificación para el pipeline de Factorización QR y Estadísticas
 * Ejecuta pruebas de conexión y pruebas funcionales de extremo a extremo.
 */
import http from 'http';

export async function testConnection(url) {
  return new Promise((resolve) => {
    const req = http.get(url, (res) => {
      resolve({ ok: res.statusCode >= 200 && res.statusCode < 400, statusCode: res.statusCode });
    });
    req.on('error', (err) => resolve({ ok: false, error: err.message }));
    req.setTimeout(3000, () => {
      req.destroy();
      resolve({ ok: false, error: 'Timeout' });
    });
  });
}

console.log('01-TOOLS: Test Matrix Pipeline initialized.');
