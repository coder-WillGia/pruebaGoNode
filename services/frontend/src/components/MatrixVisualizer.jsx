import React from 'react';
import { Eye, Clock, CheckCircle2 } from 'lucide-react';

export function MatrixVisualizer({ result }) {
  if (!result) return null;

  const { original_matrix, q, r, execution_time_ms, username } = result;

  const renderMatrixGrid = (mat, colorTheme = 'sky') => {
    if (!Array.isArray(mat)) return null;

    let themeBorder = 'border-sky-200';
    let themeBg = 'bg-sky-50/50';
    if (colorTheme === 'blue') {
      themeBorder = 'border-blue-200';
      themeBg = 'bg-blue-50/50';
    } else if (colorTheme === 'indigo') {
      themeBorder = 'border-indigo-200';
      themeBg = 'bg-indigo-50/50';
    }

    return (
      <div className={`overflow-x-auto p-3 rounded-2xl border ${themeBorder} ${themeBg} shadow-inner`}>
        <table className="w-full text-center border-collapse">
          <tbody>
            {mat.map((row, rIdx) => (
              <tr key={rIdx}>
                {row.map((val, cIdx) => {
                  const isZero = Math.abs(val) < 1e-6;
                  const isDiagonal = rIdx === cIdx;
                  const formatted = isZero ? '0' : Number.isInteger(val) ? val : val.toFixed(4);

                  return (
                    <td
                      key={cIdx}
                      className={`p-2 text-xs font-mono font-bold border border-sky-200/80 rounded-lg ${
                        isZero
                          ? 'text-slate-400 bg-white/40'
                          : isDiagonal
                          ? 'text-sky-800 font-extrabold bg-sky-200/70 shadow-sm ring-1 ring-sky-300'
                          : 'text-slate-700 bg-white/80'
                      }`}
                    >
                      {formatted}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="bg-white/90 border border-sky-100 rounded-3xl p-6 shadow-xl shadow-sky-900/5 backdrop-blur-sm space-y-5">
      {/* Header with Execution Time */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-sky-100 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-sky-100 text-sky-700 rounded-xl">
            <Eye className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-bold text-base text-slate-900">Visualizador de Matrices (Go API)</h3>
            <p className="text-xs text-slate-500">Factorización QR calculada mediante Gram-Schmidt Modificado</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-50 border border-sky-200 text-xs font-mono font-bold text-sky-800 shadow-sm">
            <Clock className="h-3.5 w-3.5 text-sky-600" />
            <span>{(execution_time_ms || 0).toFixed(2)} ms</span>
          </div>

          {username && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-semibold shadow-sm">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
              <span>Ejecutado por: <b>{username}</b></span>
            </div>
          )}
        </div>
      </div>

      {/* Grid of Matrices */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Original Matrix A */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-700">Matriz Original (A)</span>
            <span className="font-mono font-bold text-slate-400 text-[11px]">
              {original_matrix?.length}×{original_matrix?.[0]?.length}
            </span>
          </div>
          {renderMatrixGrid(original_matrix, 'slate')}
        </div>

        {/* Orthogonal Matrix Q */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-sky-800">Matriz Ortogonal (Q)</span>
            <span className="font-mono font-bold text-sky-600 text-[11px]">
              {q?.length}×{q?.[0]?.length}
            </span>
          </div>
          {renderMatrixGrid(q, 'sky')}
        </div>

        {/* Upper Triangular Matrix R */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-blue-800">Matriz Triangular (R)</span>
            <span className="font-mono font-bold text-blue-600 text-[11px]">
              {r?.length}×{r?.[0]?.length}
            </span>
          </div>
          {renderMatrixGrid(r, 'blue')}
        </div>
      </div>
    </div>
  );
}
