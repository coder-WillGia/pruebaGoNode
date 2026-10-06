import React from 'react';
import { ArrowUpRight, ArrowDownRight, Calculator, Sigma, CheckCircle, XCircle } from 'lucide-react';

export function AnalyticsCards({ analysis }) {
  if (!analysis) return null;

  const { stats, diagonal_check } = analysis;
  const isDiag = diagonal_check?.is_any_diagonal;

  return (
    <div className="bg-white/90 border border-sky-100 rounded-3xl p-4 sm:p-6 shadow-xl shadow-sky-900/5 backdrop-blur-sm space-y-4 sm:space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-2.5 sm:gap-3 border-b border-sky-100 pb-3 sm:pb-4">
        <div className="flex items-center gap-2 sm:gap-2.5">
          <div className="p-1.5 sm:p-2 bg-sky-100 text-sky-700 rounded-xl">
            <Calculator className="h-4 w-4 sm:h-5 sm:w-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm sm:text-base text-slate-900">Tarjetas de Analítica (Node.js API)</h3>
            <p className="text-[11px] sm:text-xs text-slate-500">Estadísticas y validación diagonal en memoria</p>
          </div>
        </div>

        {/* Diagonal Badge */}
        <div
          className={`flex items-center gap-1.5 px-3 py-1 sm:py-1.5 rounded-xl border text-[11px] sm:text-xs font-bold uppercase tracking-wider shadow-sm ${
            isDiag
              ? 'bg-emerald-50 border-emerald-300 text-emerald-700 shadow-emerald-500/10'
              : 'bg-slate-50 border-slate-200 text-slate-500'
          }`}
        >
          {isDiag ? (
            <>
              <CheckCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-emerald-600" />
              <span>Matriz Diagonal</span>
            </>
          ) : (
            <>
              <XCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-slate-400" />
              <span>No Diagonal</span>
            </>
          )}
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-4">
        {/* Max */}
        <div className="bg-emerald-50/60 border border-emerald-200/80 p-3 sm:p-4 rounded-2xl space-y-1 hover:border-emerald-400 transition shadow-sm min-w-0">
          <div className="flex items-center justify-between text-[11px] sm:text-xs text-emerald-800 font-bold">
            <span className="truncate">Máximo</span>
            <ArrowUpRight className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-emerald-600 shrink-0" />
          </div>
          <div className="text-lg sm:text-2xl font-black font-mono text-emerald-700 truncate">{stats?.max ?? 0}</div>
        </div>

        {/* Min */}
        <div className="bg-rose-50/60 border border-rose-200/80 p-3 sm:p-4 rounded-2xl space-y-1 hover:border-rose-400 transition shadow-sm min-w-0">
          <div className="flex items-center justify-between text-[11px] sm:text-xs text-rose-800 font-bold">
            <span className="truncate">Mínimo</span>
            <ArrowDownRight className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-rose-600 shrink-0" />
          </div>
          <div className="text-lg sm:text-2xl font-black font-mono text-rose-700 truncate">{stats?.min ?? 0}</div>
        </div>

        {/* Average */}
        <div className="bg-sky-50/60 border border-sky-200/80 p-3 sm:p-4 rounded-2xl space-y-1 hover:border-sky-400 transition shadow-sm min-w-0">
          <div className="flex items-center justify-between text-[11px] sm:text-xs text-sky-800 font-bold">
            <span className="truncate">Promedio</span>
            <Calculator className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-sky-600 shrink-0" />
          </div>
          <div className="text-lg sm:text-2xl font-black font-mono text-sky-700 truncate">{stats?.average ?? 0}</div>
        </div>

        {/* Sum */}
        <div className="bg-amber-50/60 border border-amber-200/80 p-3 sm:p-4 rounded-2xl space-y-1 hover:border-amber-400 transition shadow-sm min-w-0">
          <div className="flex items-center justify-between text-[11px] sm:text-xs text-amber-800 font-bold">
            <span className="truncate">Suma Total</span>
            <Sigma className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-amber-600 shrink-0" />
          </div>
          <div className="text-lg sm:text-2xl font-black font-mono text-amber-700 truncate">{stats?.sum ?? 0}</div>
        </div>
      </div>
    </div>
  );
}
