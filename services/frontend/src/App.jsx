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

      if (!res.ok || json.status === 'error') {
        throw new Error(json.message || json.error || 'Error al procesar la matriz');
      }

      setResult(json.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Si el usuario NO está autenticado, se muestra ÚNICAMENTE la pantalla de inicio de sesión
  if (!user || !token) {
    return <LoginScreen onAuthSuccess={handleAuthSuccess} />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      {/* 1. Barra Superior con Identidad del Usuario y Logout */}
      <Navbar user={user} onLogout={handleLogout} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-800 gap-3">
          <button
            onClick={() => setActiveTab('calculator')}
            className={`px-4 py-2.5 text-xs sm:text-sm font-semibold border-b-2 flex items-center gap-2 transition ${
              activeTab === 'calculator'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Calculator className="h-4 w-4" />
            <span>Calculadora QR & Analítica</span>
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2.5 text-xs sm:text-sm font-semibold border-b-2 flex items-center gap-2 transition ${
              activeTab === 'history'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <History className="h-4 w-4" />
            <span>Auditoría en Base de Datos</span>
          </button>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Tab 1: Calculator */}
        {activeTab === 'calculator' ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
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
                <div className="bg-slate-900 border border-dashed border-slate-800 rounded-2xl p-16 text-center space-y-3">
                  <div className="h-16 w-16 mx-auto rounded-2xl bg-slate-800/80 flex items-center justify-center text-slate-500 text-2xl">
                    <Calculator className="h-8 w-8 text-slate-600" />
                  </div>
                  <h3 className="font-bold text-slate-300 text-base">Listo para calcular</h3>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    Ajusta los valores de la matriz en el panel izquierdo y presiona el botón para computar la Factorización QR en Go y el análisis en Node.js.
                  </p>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Tab 2: Auditoría en BD */
          <AuditHistoryTable />
        )}
      </main>
    </div>
  );
}

export default App;
