import React from 'react';
import { Eye, Clock, CheckCircle2 } from 'lucide-react';

export function MatrixVisualizer({ result }) {
  if (!result) return null;

  const { original_matrix, q, r, execution_time_ms, username } = result;

  const renderMatrixGrid = (mat, colorTheme = 'sky') => {
    if (!Array.isArray(mat)) return null;

    let themeBorder = 'border-sky-200';
    let themeBg = 'bg-sky-50/40';
    if (colorTheme === 'blue') {
      themeBorder = 'border-blue-200';
      themeBg = 'bg-blue-50/40';
    } else if (colorTheme === 'indigo') {
      themeBorder = 'border-indigo-200';
      themeBg = 'bg-indigo-50/40';
    }

    return (
      <div className={`overflow-x-auto max-w-full p-1.5 sm:p-2 rounded-2xl border ${themeBorder} ${themeBg} shadow-inner touch-pan-x`}>
        <table className="w-full text-center border-collapse table-fixed">
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
                      className={`px-1 py-1.5 text-[10px] sm:text-[11px] lg:text-xs font-mono font-bold tracking-tight border border-sky-200/80 rounded-lg truncate ${
                        isZero
                          ? 'text-slate-400 bg-white/40'
                          : isDiagonal
                          ? 'text-sky-900 font-black bg-sky-200/70 shadow-sm ring-1 ring-sky-300'
                          : 'text-slate-700 bg-white/80'
                      }`}
                      title={String(val)}
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
    <div className="bg-white/90 border border-sky-100 rounded-3xl p-4 sm:p-6 shadow-xl shadow-sky-900/5 backdrop-blur-sm space-y-4 sm:space-y-5">
      {/* Header with Execution Time */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 sm:gap-3 border-b border-sky-100 pb-3 sm:pb-4">
        <div className="flex items-center gap-2 sm:gap-2.5">
          <div className="p-1.5 sm:p-2 bg-sky-100 text-sky-700 rounded-xl">
            <Eye className="h-4 w-4 sm:h-5 sm:w-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm sm:text-base text-slate-900">Visualizador de Matrices (Go API)</h3>
            <p className="text-[11px] sm:text-xs text-slate-500">Factorización QR mediante Gram-Schmidt Modificado</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          <div className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl bg-sky-50 border border-sky-200 text-[11px] sm:text-xs font-mono font-bold text-sky-800 shadow-sm">
            <Clock className="h-3.5 w-3.5 text-sky-600 shrink-0" />
            <span>{(execution_time_ms || 0).toFixed(2)} ms</span>
          </div>

          {username && (
            <div className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-[11px] sm:text-xs text-emerald-800 font-semibold shadow-sm truncate max-w-[160px] sm:max-w-none">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
              <span className="truncate">Por: <b>{username}</b></span>
            </div>
          )}
        </div>
      </div>

      {/* Grid of Matrices */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 sm:gap-3 lg:gap-3.5">
        {/* Original Matrix A */}
        <div className="space-y-1.5 min-w-0">
          <div className="flex items-center justify-between text-xs px-1">
            <span className="font-bold text-slate-700 truncate">Matriz Original (A)</span>
            <span className="font-mono font-bold text-slate-400 text-[11px] shrink-0">
              {original_matrix?.length}×{original_matrix?.[0]?.length}
            </span>
          </div>
          {renderMatrixGrid(original_matrix, 'slate')}
        </div>

        {/* Orthogonal Matrix Q */}
        <div className="space-y-1.5 min-w-0">
          <div className="flex items-center justify-between text-xs px-1">
            <span className="font-bold text-sky-800 truncate">Matriz Ortogonal (Q)</span>
            <span className="font-mono font-bold text-sky-600 text-[11px] shrink-0">
              {q?.length}×{q?.[0]?.length}
            </span>
          </div>
          {renderMatrixGrid(q, 'sky')}
        </div>

        {/* Upper Triangular Matrix R */}
        <div className="space-y-1.5 min-w-0">
          <div className="flex items-center justify-between text-xs px-1">
            <span className="font-bold text-blue-800 truncate">Matriz Triangular (R)</span>
            <span className="font-mono font-bold text-blue-600 text-[11px] shrink-0">
              {r?.length}×{r?.[0]?.length}
            </span>
          </div>
          {renderMatrixGrid(r, 'blue')}
        </div>
      </div>
    </div>
  );
}
