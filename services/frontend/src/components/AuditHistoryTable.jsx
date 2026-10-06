import React, { useState, useEffect } from 'react';
import { History, RefreshCw, UserCheck } from 'lucide-react';
import { API_BASE } from '../config/env.js';

export function AuditHistoryTable() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/v1/matrix/history?limit=25`);
      const json = await res.json();
      if (json.status === 'success' && Array.isArray(json.data)) {
        setHistory(json.data);
      }
    } catch (_) {
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-xl">
            <History className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-bold text-base text-white">Historial de Auditoría en Base de Datos</h3>
            <p className="text-xs text-slate-400">
              Registros guardados en PostgreSQL (<code className="text-indigo-400 font-mono">matrix_operations</code> y <code className="text-indigo-400 font-mono">matrix_analytics</code>)
            </p>
          </div>
        </div>

        <button
          onClick={fetchHistory}
          disabled={loading}
          className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-slate-200 flex items-center gap-1.5 transition active:scale-95 disabled:opacity-50"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Actualizar</span>
        </button>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-800">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
            <tr>
              <th className="py-3 px-4">Fecha / Hora</th>
              <th className="py-3 px-4">Usuario</th>
              <th className="py-3 px-4">Dimensiones</th>
              <th className="py-3 px-4">Máximo</th>
              <th className="py-3 px-4">Mínimo</th>
              <th className="py-3 px-4">Promedio</th>
              <th className="py-3 px-4">Diagonal</th>
              <th className="py-3 px-4">Tiempo</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-mono text-slate-300">
            {history.length === 0 ? (
              <tr>
                <td colSpan="8" className="text-center py-8 text-slate-500 font-sans">
                  {loading ? 'Cargando registros desde PostgreSQL...' : 'No hay operaciones registradas aún.'}
                </td>
              </tr>
            ) : (
              history.map((item) => {
                const date = new Date(item.created_at).toLocaleString();
                const stats = item.analysis?.stats || {};
                const isDiag = item.analysis?.diagonal_check?.is_any_diagonal;

                return (
                  <tr key={item.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3 px-4 text-slate-400">{date}</td>
                    <td className="py-3 px-4 text-indigo-300 font-sans font-medium flex items-center gap-1.5">
                      <UserCheck className="h-3.5 w-3.5 text-indigo-400 shrink-0" />
                      <span>{item.username || 'Anónimo'}</span>
                    </td>
                    <td className="py-3 px-4">{item.rows} × {item.cols}</td>
                    <td className="py-3 px-4 text-emerald-400 font-bold">{stats.max ?? '-'}</td>
                    <td className="py-3 px-4 text-rose-400 font-bold">{stats.min ?? '-'}</td>
                    <td className="py-3 px-4 text-indigo-300">{stats.average ?? '-'}</td>
                    <td className="py-3 px-4">
                      {isDiag ? (
                        <span className="text-emerald-400 font-bold">Sí</span>
                      ) : (
                        <span className="text-slate-500">No</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-slate-400">{(item.execution_time_ms || 0).toFixed(2)} ms</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
