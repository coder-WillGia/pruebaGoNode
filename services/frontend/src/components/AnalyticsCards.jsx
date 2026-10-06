import React from 'react';
import { ArrowUpRight, ArrowDownRight, Calculator, Sigma, CheckCircle, XCircle } from 'lucide-react';

export function AnalyticsCards({ analysis }) {
  if (!analysis) return null;

  const { stats, diagonal_check } = analysis;
  const isDiag = diagonal_check?.is_any_diagonal;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl">
            <Calculator className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-bold text-base text-white">Tarjetas de Analítica (Node.js API)</h3>
            <p className="text-xs text-slate-400">Estadísticas y validación diagonal computadas en memoria</p>
          </div>
        </div>

        {/* Diagonal Badge */}
        <div
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl border text-xs font-bold uppercase tracking-wider ${
            isDiag
              ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400 shadow-lg shadow-emerald-500/10'
              : 'bg-slate-800/80 border-slate-700 text-slate-400'
          }`}
        >
          {isDiag ? (
            <>
              <CheckCircle className="h-4 w-4 text-emerald-400" />
              <span>Matriz Diagonal</span>
            </>
          ) : (
            <>
              <XCircle className="h-4 w-4 text-slate-400" />
              <span>No Diagonal</span>
            </>
          )}
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {/* Max */}
        <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-xl space-y-1 hover:border-emerald-500/30 transition">
          <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
            <span>Valor Máximo</span>
            <ArrowUpRight className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-400">{stats?.max ?? 0}</div>
        </div>

        {/* Min */}
        <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-xl space-y-1 hover:border-rose-500/30 transition">
          <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
            <span>Valor Mínimo</span>
            <ArrowDownRight className="h-4 w-4 text-rose-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-rose-400">{stats?.min ?? 0}</div>
        </div>

        {/* Average */}
        <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-xl space-y-1 hover:border-indigo-500/30 transition">
          <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
            <span>Promedio (Media)</span>
            <Calculator className="h-4 w-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-indigo-400">{stats?.average ?? 0}</div>
        </div>

        {/* Sum */}
        <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-xl space-y-1 hover:border-amber-500/30 transition">
          <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
            <span>Suma Total</span>
            <Sigma className="h-4 w-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-amber-400">{stats?.sum ?? 0}</div>
        </div>
      </div>
    </div>
  );
}
