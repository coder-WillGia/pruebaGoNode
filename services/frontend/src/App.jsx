import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { LoginScreen } from './components/LoginScreen';
import { MatrixInputPanel } from './components/MatrixInputPanel';
import { MatrixVisualizer } from './components/MatrixVisualizer';
import { AnalyticsCards } from './components/AnalyticsCards';
import { AuditHistoryTable } from './components/AuditHistoryTable';
import { Calculator, History, AlertTriangle } from 'lucide-react';
import { API_BASE } from './config/env.js';

export function App() {
  // Auth State
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('interseguro_user') || 'null');
    } catch (_) {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem('interseguro_token') || '');

  // Matrix and UI State
  const [rows, setRows] = useState(3);
  const [cols, setCols] = useState(3);
  const [matrix, setMatrix] = useState([
    [12, -51, 4],
    [6, 167, -68],
    [-4, 24, -41]
  ]);

  const [activeTab, setActiveTab] = useState('calculator'); // 'calculator' | 'history'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  const handleDimensionsChange = (newRows, newCols) => {
    setRows(newRows);
    setCols(newCols);
    const newMat = Array.from({ length: newRows }, (_, r) =>
      Array.from({ length: newCols }, (_, c) => (matrix[r]?.[c] !== undefined ? matrix[r][c] : (r === c ? 1 : 0)))
    );
    setMatrix(newMat);
  };

  const handleAuthSuccess = (loggedUser, authToken) => {
    setUser(loggedUser);
    setToken(authToken);
    localStorage.setItem('interseguro_user', JSON.stringify(loggedUser));
    localStorage.setItem('interseguro_token', authToken);
  };

  const handleLogout = () => {
    setUser(null);
    setToken('');
    setResult(null);
    localStorage.removeItem('interseguro_user');
    localStorage.removeItem('interseguro_token');
  };

  const handleCalculate = async () => {
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const headers = { 'Content-Type': 'application/json' };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch(`${API_BASE}/api/v1/matrix/process`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ matrix })
      });

      const json = await res.json();

      if (res.status === 401) {
        handleLogout();
        throw new Error('Sesión expirada o no autorizada. Por favor ingresa nuevamente.');
      }

      if (!res.ok || json.status === 'error') {
        throw new Error(json.message || json.error || 'Error al procesar la matriz');
      }

      setResult(json.data);
    } catch (err) {
      setError(err.message || 'Error de conexión con el backend de Go');
    } finally {
      setLoading(false);
    }
  };

  // Si el usuario NO está autenticado, se muestra ÚNICAMENTE la pantalla de inicio de sesión
  if (!user || !token) {
    return <LoginScreen onAuthSuccess={handleAuthSuccess} />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-sky-50 via-sky-100/60 to-blue-100/50 text-slate-800 relative overflow-hidden">
      {/* Background Soft Glows */}
      <div className="absolute -top-40 -left-40 w-72 sm:w-96 h-72 sm:h-96 bg-sky-300/30 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute top-1/2 -right-40 w-72 sm:w-96 h-72 sm:h-96 bg-blue-300/25 rounded-full blur-3xl pointer-events-none"></div>

      {/* 1. Barra Superior con Identidad del Usuario y Logout */}
      <Navbar user={user} onLogout={handleLogout} />

      <main className="flex-1 max-w-[1440px] w-full mx-auto px-3 sm:px-6 lg:px-8 py-5 sm:py-8 space-y-6 sm:space-y-8 relative z-10">
        {/* Navigation Tabs (Centradas y Responsivas) */}
        <div className="flex justify-center w-full px-1">
          <div className="inline-flex p-1 sm:p-1.5 bg-white/80 border border-sky-200/80 rounded-2xl shadow-sm backdrop-blur-md gap-1 sm:gap-2 max-w-full overflow-x-auto">
            <button
              onClick={() => setActiveTab('calculator')}
              className={`px-3 sm:px-5 py-2 sm:py-2.5 text-[11px] sm:text-xs md:text-sm font-bold rounded-xl flex items-center gap-1.5 sm:gap-2 transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                activeTab === 'calculator'
                  ? 'bg-gradient-to-r from-sky-500 via-sky-600 to-blue-600 text-white shadow-md shadow-sky-500/25 ring-2 ring-white'
                  : 'text-slate-600 hover:text-sky-800 hover:bg-sky-50/80'
              }`}
            >
              <Calculator className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span>Calculadora QR & Analítica</span>
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`px-3 sm:px-5 py-2 sm:py-2.5 text-[11px] sm:text-xs md:text-sm font-bold rounded-xl flex items-center gap-1.5 sm:gap-2 transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                activeTab === 'history'
                  ? 'bg-gradient-to-r from-sky-500 via-sky-600 to-blue-600 text-white shadow-md shadow-sky-500/25 ring-2 ring-white'
                  : 'text-slate-600 hover:text-sky-800 hover:bg-sky-50/80'
              }`}
            >
              <History className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span>Auditoría en Base de Datos</span>
            </button>
          </div>
        </div>

        {error && (
          <div className="p-3.5 sm:p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-3 shadow-sm">
            <AlertTriangle className="h-5 w-5 shrink-0 text-rose-500" />
            <span className="font-medium break-words">{error}</span>
          </div>
        )}

        {/* Tab 1: Calculator */}
        {activeTab === 'calculator' ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
            {/* 2. Panel de Entrada de Matriz */}
            <div className="lg:col-span-5">
              <MatrixInputPanel
                rows={rows}
                cols={cols}
                onDimensionsChange={handleDimensionsChange}
                matrix={matrix}
                onMatrixChange={setMatrix}
                onCalculate={handleCalculate}
                loading={loading}
                token={token}
              />
            </div>

            {/* 3 & 4. Visualizador de Matrices y Tarjetas de Analítica */}
            <div className="lg:col-span-7 space-y-6">
              {result ? (
                <>
                  {/* 4. Tarjetas de Analítica (Node.js) */}
                  <AnalyticsCards analysis={result.analysis} />

                  {/* 3. Visualizador de Matrices Q y R (Go) */}
                  <MatrixVisualizer result={result} />
                </>
              ) : (
                <div className="bg-white/80 border border-dashed border-sky-200 rounded-3xl p-8 sm:p-16 text-center space-y-3 shadow-sm backdrop-blur-sm">
                  <div className="h-14 w-14 sm:h-16 sm:w-16 mx-auto rounded-2xl bg-sky-100 flex items-center justify-center text-sky-600 text-2xl shadow-inner">
                    <Calculator className="h-7 w-7 sm:h-8 sm:w-8 text-sky-600" />
                  </div>
                  <h3 className="font-bold text-slate-800 text-sm sm:text-base">Listo para calcular</h3>
                  <p className="text-[11px] sm:text-xs text-slate-500 max-w-sm mx-auto font-medium">
                    Ajusta los valores de la matriz en el panel izquierdo y presiona el botón para computar la Factorización QR en Go y el análisis en Node.js.
                  </p>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Tab 2: Auditoría en BD */
          <AuditHistoryTable token={token} />
        )}
      </main>
    </div>
  );
}

export default App;
