// Configuración de API Gateway (Go Fiber)
const GO_API_BASE = 'http://localhost:3000';

let isJsonMode = false;
let authMode = 'login'; // 'login' | 'register'
let currentUser = JSON.parse(localStorage.getItem('interseguro_user') || 'null');
let currentToken = localStorage.getItem('interseguro_token') || '';

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
  renderAuthUI();
  generateMatrixGrid();
  loadPreset('reto3x3');
});

// Switch Tabs
function switchTab(tab) {
  const viewCalc = document.getElementById('viewCalculator');
  const viewHist = document.getElementById('viewHistory');
  const btnCalc = document.getElementById('tabBtnCalc');
  const btnHist = document.getElementById('tabBtnHist');

  if (tab === 'calculator') {
    viewCalc.classList.remove('hidden');
    viewHist.classList.add('hidden');
    btnCalc.className = 'px-4 py-2 text-sm font-semibold border-b-2 border-indigo-500 text-indigo-400 flex items-center gap-2';
    btnHist.className = 'px-4 py-2 text-sm font-semibold border-b-2 border-transparent text-slate-400 hover:text-slate-200 flex items-center gap-2';
  } else {
    viewCalc.classList.add('hidden');
    viewHist.classList.remove('hidden');
    btnHist.className = 'px-4 py-2 text-sm font-semibold border-b-2 border-indigo-500 text-indigo-400 flex items-center gap-2';
    btnCalc.className = 'px-4 py-2 text-sm font-semibold border-b-2 border-transparent text-slate-400 hover:text-slate-200 flex items-center gap-2';
    fetchHistory();
  }
}

// Render Auth Topbar UI
function renderAuthUI() {
  const container = document.getElementById('authSection');
  if (currentUser && currentToken) {
    container.innerHTML = `
      <div class="flex items-center gap-2 bg-slate-800/80 border border-slate-700 px-3 py-1.5 rounded-xl text-xs">
        <i class="fa-solid fa-circle-user text-indigo-400"></i>
        <span class="font-medium text-slate-200">${escapeHtml(currentUser.username)}</span>
        <button onclick="logout()" title="Cerrar sesión" class="ml-2 text-slate-400 hover:text-rose-400 transition">
          <i class="fa-solid fa-right-from-bracket"></i>
        </button>
      </div>
    `;
  } else {
    container.innerHTML = `
      <button onclick="openAuthModal('login')" class="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 transition">
        <i class="fa-solid fa-key"></i> Iniciar Sesión
      </button>
    `;
  }
}

function openAuthModal(mode = 'login') {
  authMode = mode;
  document.getElementById('authModal').classList.remove('hidden');
  document.getElementById('modalAuthTitle').innerText = mode === 'login' ? 'Iniciar Sesión' : 'Registrar Cuenta';
  document.getElementById('btnSubmitAuth').innerText = mode === 'login' ? 'Iniciar Sesión' : 'Registrarse';
  document.getElementById('authTogglePrompt').innerText = mode === 'login' ? '¿No tienes cuenta?' : '¿Ya tienes cuenta?';
  document.getElementById('authToggleBtn').innerText = mode === 'login' ? 'Regístrate' : 'Inicia Sesión';
  document.getElementById('authError').classList.add('hidden');
}

function closeAuthModal() {
  document.getElementById('authModal').classList.add('hidden');
}

function toggleAuthMode() {
  openAuthModal(authMode === 'login' ? 'register' : 'login');
}

async function submitAuth() {
  const username = document.getElementById('authUsername').value.trim();
  const password = document.getElementById('authPassword').value.trim();
  const errEl = document.getElementById('authError');

  if (!username || !password) {
    errEl.innerText = 'Debes completar usuario y contraseña';
    errEl.classList.remove('hidden');
    return;
  }

  const endpoint = authMode === 'login' ? '/api/v1/auth/login' : '/api/v1/auth/register';

  try {
    const res = await fetch(`${GO_API_BASE}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password, role: 'evaluador' })
    });

    const data = await res.json();
    if (!res.ok || data.status === 'error') {
      throw new Error(data.message || 'Error en la autenticación');
    }

    currentUser = data.data.user;
    currentToken = data.data.token;
    localStorage.setItem('interseguro_user', JSON.stringify(currentUser));
    localStorage.setItem('interseguro_token', currentToken);

    closeAuthModal();
    renderAuthUI();
  } catch (err) {
    errEl.innerText = err.message;
    errEl.classList.remove('hidden');
  }
}

function logout() {
  currentUser = null;
  currentToken = '';
  localStorage.removeItem('interseguro_user');
  localStorage.removeItem('interseguro_token');
  renderAuthUI();
}

// Generate Dynamic Matrix Grid
function generateMatrixGrid() {
  const rows = parseInt(document.getElementById('inputRows').value, 10) || 3;
  const cols = parseInt(document.getElementById('inputCols').value, 10) || 3;

  document.getElementById('dimLabel').innerText = `${rows} x ${cols}`;
  const grid = document.getElementById('matrixGrid');
  grid.style.gridTemplateColumns = `repeat(${cols}, minmax(0, 1fr))`;
  grid.innerHTML = '';

  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      const input = document.createElement('input');
      input.type = 'number';
      input.id = `cell_${i}_${j}`;
      input.value = (i === j) ? '1' : '0';
      input.className = 'w-14 h-10 bg-slate-900 border border-slate-800 rounded-lg text-center text-xs font-mono text-slate-200 focus:border-indigo-500 focus:outline-none';
      grid.appendChild(input);
    }
  }
}

// Presets
function loadPreset(type) {
  let matrix = [];
  if (type === 'reto3x3') {
    matrix = [
      [12, -51, 4],
      [6, 167, -68],
      [-4, 24, -41]
    ];
  } else if (type === 'rect4x2') {
    matrix = [
      [1, 2],
      [3, 4],
      [5, 6],
      [7, 8]
    ];
  } else if (type === 'diag3x3') {
    matrix = [
      [5, 0, 0],
      [0, 8, 0],
      [0, 0, 12]
    ];
  }

  const rows = matrix.length;
  const cols = matrix[0].length;
  document.getElementById('inputRows').value = rows;
  document.getElementById('inputCols').value = cols;
  generateMatrixGrid();

  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      const cell = document.getElementById(`cell_${i}_${j}`);
      if (cell) cell.value = matrix[i][j];
    }
  }

  document.getElementById('matrixJsonInput').value = JSON.stringify(matrix, null, 2);
}

function toggleJsonMode() {
  isJsonMode = !isJsonMode;
  const gridContainer = document.getElementById('matrixGridContainer');
  const jsonArea = document.getElementById('matrixJsonInput');
  const btn = document.getElementById('btnToggleMode');

  if (isJsonMode) {
    jsonArea.value = JSON.stringify(getMatrixFromGrid(), null, 2);
    gridContainer.classList.add('hidden');
    jsonArea.classList.remove('hidden');
    btn.innerText = 'Editar como Cuadrícula';
  } else {
    try {
      const parsed = JSON.parse(jsonArea.value);
      if (Array.isArray(parsed) && parsed.length > 0) {
        document.getElementById('inputRows').value = parsed.length;
        document.getElementById('inputCols').value = parsed[0].length;
        generateMatrixGrid();
        for (let i = 0; i < parsed.length; i++) {
          for (let j = 0; j < parsed[0].length; j++) {
            const cell = document.getElementById(`cell_${i}_${j}`);
            if (cell) cell.value = parsed[i][j];
          }
        }
      }
    } catch (_) {}
    gridContainer.classList.remove('hidden');
    jsonArea.classList.add('hidden');
    btn.innerText = 'Editar como JSON';
  }
}

function getMatrixFromGrid() {
  if (isJsonMode) {
    return JSON.parse(document.getElementById('matrixJsonInput').value);
  }
  const rows = parseInt(document.getElementById('inputRows').value, 10);
  const cols = parseInt(document.getElementById('inputCols').value, 10);
  const matrix = [];
  for (let i = 0; i < rows; i++) {
    const row = [];
    for (let j = 0; j < cols; j++) {
      const val = parseFloat(document.getElementById(`cell_${i}_${j}`)?.value || '0');
      row.push(val);
    }
    matrix.push(row);
  }
  return matrix;
}

// Process Matrix Call
async function processMatrix() {
  const btn = document.getElementById('btnProcess');
  btn.disabled = true;
  btn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Computando...`;

  try {
    const matrix = getMatrixFromGrid();
    const headers = { 'Content-Type': 'application/json' };
    if (currentToken) {
      headers['Authorization'] = `Bearer ${currentToken}`;
    }

    const res = await fetch(`${GO_API_BASE}/api/v1/matrix/process`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ matrix })
    });

    const data = await res.json();
    if (!res.ok || data.status === 'error') {
      throw new Error(data.message || data.error || 'Error al procesar la matriz');
    }

    renderResults(data.data);
  } catch (err) {
    alert(`Error: ${err.message}`);
  } finally {
    btn.disabled = false;
    btn.innerHTML = `<i class="fa-solid fa-bolt"></i> Calcular QR & Estadísticas`;
  }
}

// Render Results
function renderResults(data) {
  document.getElementById('resultsPlaceholder').classList.add('hidden');
  document.getElementById('resultsContainer').classList.remove('hidden');

  // Auditoria
  const user = data.username ? data.username : (currentUser ? currentUser.username : 'Anónimo');
  document.getElementById('auditUserText').innerText = `Ejecutado por: ${user} ${data.user_id ? `(ID: ${data.user_id.slice(0, 8)}...)` : ''}`;
  document.getElementById('auditTimeText').innerText = `${data.execution_time_ms.toFixed(2)} ms`;

  // Stats de Node.js
  const stats = data.analysis.stats;
  document.getElementById('statMax').innerText = stats.max;
  document.getElementById('statMin').innerText = stats.min;
  document.getElementById('statAvg').innerText = stats.average;
  document.getElementById('statSum').innerText = stats.sum;

  // Diagonal Check
  const isDiag = data.analysis.diagonal_check.is_any_diagonal;
  const diagBadge = document.getElementById('diagBadge');
  if (isDiag) {
    diagBadge.className = 'px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wide bg-emerald-500/20 text-emerald-400 border border-emerald-500/30';
    diagBadge.innerText = 'Matriz Diagonal';
  } else {
    diagBadge.className = 'px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wide bg-slate-800 text-slate-400 border border-slate-700';
    diagBadge.innerText = 'No Diagonal';
  }

  // Render Matrices
  document.getElementById('dimQ').innerText = `${data.q.length}x${data.q[0].length}`;
  document.getElementById('dimR').innerText = `${data.r.length}x${data.r[0].length}`;
  document.getElementById('renderQ').innerHTML = formatMatrixHtml(data.q);
  document.getElementById('renderR').innerHTML = formatMatrixHtml(data.r);
}

function formatMatrixHtml(m) {
  let html = '<table class="w-full text-center">';
  for (const row of m) {
    html += '<tr>';
    for (const val of row) {
      const formatted = typeof val === 'number' ? (Number.isInteger(val) ? val : val.toFixed(4)) : val;
      html += `<td class="p-1 px-2 border border-slate-800/50">${formatted}</td>`;
    }
    html += '</tr>';
  }
  html += '</table>';
  return html;
}

// Fetch History
async function fetchHistory() {
  const tbody = document.getElementById('historyTableBody');
  tbody.innerHTML = '<tr><td colspan="8" class="text-center py-6 text-slate-500">Cargando registros...</td></tr>';

  try {
    const res = await fetch(`${GO_API_BASE}/api/v1/matrix/history?limit=20`);
    const data = await res.json();
    const list = data.data || [];

    if (list.length === 0) {
      tbody.innerHTML = '<tr><td colspan="8" class="text-center py-6 text-slate-500">No hay operaciones registradas aún.</td></tr>';
      return;
    }

    let rowsHtml = '';
    for (const item of list) {
      const date = new Date(item.created_at).toLocaleString();
      const user = item.username || 'Anónimo';
      const stats = item.analysis?.stats || {};
      const isDiag = item.analysis?.diagonal_check?.is_any_diagonal;

      rowsHtml += `
        <tr class="hover:bg-slate-800/40 transition">
          <td class="py-3 px-4 text-slate-400">${date}</td>
          <td class="py-3 px-4 text-indigo-300 font-sans font-medium"><i class="fa-solid fa-user-circle mr-1"></i> ${escapeHtml(user)}</td>
          <td class="py-3 px-4">${item.rows}x${item.cols}</td>
          <td class="py-3 px-4 text-emerald-400">${stats.max ?? '-'}</td>
          <td class="py-3 px-4 text-rose-400">${stats.min ?? '-'}</td>
          <td class="py-3 px-4 text-indigo-400">${stats.average ?? '-'}</td>
          <td class="py-3 px-4">${isDiag ? '<span class="text-emerald-400">Sí</span>' : '<span class="text-slate-500">No</span>'}</td>
          <td class="py-3 px-4 text-slate-400">${(item.execution_time_ms || 0).toFixed(2)} ms</td>
        </tr>
      `;
    }
    tbody.innerHTML = rowsHtml;
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="8" class="text-center py-6 text-rose-400">Error al cargar historial: ${err.message}</td></tr>`;
  }
}

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
