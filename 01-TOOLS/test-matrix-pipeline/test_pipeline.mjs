/**
 * Script de Verificación de Salud del Pipeline
 * Prueba de conexión a Go API (:3000), Node API (:4000) y ejecución de cálculo.
 */

const GO_URL = 'http://localhost:3000';
const NODE_URL = 'http://localhost:4000';

async function checkHealth(url, name) {
  try {
    const res = await fetch(`${url}/health`);
    const data = await res.json();
    console.log(`[PASS] ${name} está activo:`, data);
    return true;
  } catch (err) {
    console.error(`[FAIL] No se pudo conectar a ${name} (${url}):`, err.message);
    return false;
  }
}

async function testPipelineCalculation() {
  const matrix = [
    [12, -51, 4],
    [6, 167, -68],
    [-4, 24, -41]
  ];

  try {
    const res = await fetch(`${GO_URL}/api/v1/matrix/process`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ matrix })
    });
    const data = await res.json();
    console.log('[PASS] Cálculo de Factorización QR y Estadísticas exitoso:');
    console.log('- Dimensiones:', data.data.dimensions);
    console.log('- Estadísticas Node.js:', data.data.analysis.stats);
    console.log('- ¿Es Diagonal?:', data.data.analysis.diagonal_check.is_any_diagonal);
  } catch (err) {
    console.error('[FAIL] Error ejecutando pipeline:', err.message);
  }
}

async function run() {
  console.log('=== 01-TOOLS: Smoke Test Pipeline ===');
  await checkHealth(GO_URL, 'Go API (Fiber)');
  await checkHealth(NODE_URL, 'Node API (Express)');
  await testPipelineCalculation();
}

run();
