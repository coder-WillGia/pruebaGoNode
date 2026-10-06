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
    <div className="bg-white/90 border border-sky-100 rounded-3xl p-6 shadow-xl shadow-sky-900/5 backdrop-blur-sm space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-sky-100 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-sky-100 text-sky-700 rounded-xl">
            <History className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-bold text-base text-slate-900">Historial de Auditoría en Base de Datos</h3>
            <p className="text-xs text-slate-500">
              Registros guardados en PostgreSQL (<code className="text-sky-700 font-mono font-bold">matrix_operations</code> y <code className="text-sky-700 font-mono font-bold">matrix_analytics</code>)
            </p>
          </div>
        </div>

        <button
          onClick={fetchHistory}
          disabled={loading}
          className="px-3.5 py-2 rounded-xl bg-sky-50 hover:bg-sky-100 border border-sky-200 text-xs font-bold text-sky-800 flex items-center gap-1.5 transition active:scale-95 disabled:opacity-50 cursor-pointer shadow-sm"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Actualizar</span>
        </button>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-sky-100 shadow-sm">
        <table className="w-full text-left text-xs">
          <thead className="bg-sky-50/80 border-b border-sky-100 text-sky-900 uppercase tracking-wider font-bold">
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
          <tbody className="divide-y divide-sky-100 font-mono text-slate-700">
            {history.length === 0 ? (
              <tr>
                <td colSpan="8" className="text-center py-8 text-slate-400 font-sans font-medium">
                  {loading ? 'Cargando registros desde PostgreSQL...' : 'No hay operaciones registradas aún.'}
                </td>
              </tr>
            ) : (
              history.map((item) => {
                const date = new Date(item.created_at).toLocaleString();
                const stats = item.analysis?.stats || {};
                const isDiag = item.analysis?.diagonal_check?.is_any_diagonal;

                return (
                  <tr key={item.id} className="hover:bg-sky-50/60 transition">
                    <td className="py-3 px-4 text-slate-500">{date}</td>
                    <td className="py-3 px-4 text-sky-800 font-sans font-bold flex items-center gap-1.5">
                      <UserCheck className="h-3.5 w-3.5 text-sky-600 shrink-0" />
                      <span>{item.username || 'Anónimo'}</span>
                    </td>
                    <td className="py-3 px-4 font-bold">{item.rows} × {item.cols}</td>
                    <td className="py-3 px-4 text-emerald-700 font-bold">{stats.max ?? '-'}</td>
                    <td className="py-3 px-4 text-rose-700 font-bold">{stats.min ?? '-'}</td>
                    <td className="py-3 px-4 text-sky-700 font-bold">{stats.average ?? '-'}</td>
                    <td className="py-3 px-4">
                      {isDiag ? (
                        <span className="text-emerald-700 font-bold px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200">Sí</span>
                      ) : (
                        <span className="text-slate-400">No</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-slate-500">{(item.execution_time_ms || 0).toFixed(2)} ms</td>
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
