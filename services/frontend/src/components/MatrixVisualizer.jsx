import React from 'react';
import { Eye, Clock, CheckCircle2 } from 'lucide-react';

export function MatrixVisualizer({ result }) {
  if (!result) return null;

  const { original_matrix, q, r, execution_time_ms, username } = result;

  const renderMatrixGrid = (mat, colorTheme = 'indigo') => {
    if (!Array.isArray(mat)) return null;

    const themeBorder = colorTheme === 'indigo' ? 'border-indigo-500/20' : 'border-violet-500/20';
    const themeBg = colorTheme === 'indigo' ? 'bg-indigo-950/20' : 'bg-violet-950/20';

    return (
      <div className={`overflow-x-auto p-3 rounded-xl border ${themeBorder} ${themeBg}`}>
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
                      className={`p-2 text-xs font-mono font-semibold border border-slate-800/60 rounded ${
                        isZero
                          ? 'text-slate-600'
                          : isDiagonal
                          ? 'text-indigo-300 font-bold bg-indigo-500/10'
                          : 'text-slate-200'
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
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
      {/* Header with Execution Time */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-xl">
            <Eye className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-bold text-base text-white">Visualizador de Matrices (Go API)</h3>
            <p className="text-xs text-slate-400">Factorización QR calculada mediante Gram-Schmidt Modificado</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-xs font-mono text-slate-300">
            <Clock className="h-3.5 w-3.5 text-indigo-400" />
            <span>{(execution_time_ms || 0).toFixed(2)} ms</span>
          </div>

          {username && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-300">
              <CheckCircle2 className="h-3.5 w-3.5" />
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
            <span className="font-bold text-slate-300">Matriz Original (A)</span>
            <span className="font-mono text-slate-500 text-[11px]">
              {original_matrix?.length}×{original_matrix?.[0]?.length}
            </span>
          </div>
          {renderMatrixGrid(original_matrix, 'slate')}
        </div>

        {/* Orthogonal Matrix Q */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-indigo-300">Matriz Ortogonal (Q)</span>
            <span className="font-mono text-indigo-400 text-[11px]">
              {q?.length}×{q?.[0]?.length}
            </span>
          </div>
          {renderMatrixGrid(q, 'indigo')}
        </div>

        {/* Upper Triangular Matrix R */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-violet-300">Matriz Triangular (R)</span>
            <span className="font-mono text-violet-400 text-[11px]">
              {r?.length}×{r?.[0]?.length}
            </span>
          </div>
          {renderMatrixGrid(r, 'violet')}
        </div>
      </div>
    </div>
  );
}
