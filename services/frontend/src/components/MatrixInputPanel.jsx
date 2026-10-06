import React, { useState, useEffect } from 'react';
import { Table, Database, Play, Sparkles, RefreshCw } from 'lucide-react';
import { API_BASE } from '../config/env.js';

export function MatrixInputPanel({
  rows,
  cols,
  onDimensionsChange,
  matrix,
  onMatrixChange,
  onCalculate,
  loading,
  token
}) {
  const [catalogMatrices, setCatalogMatrices] = useState([]);
  const [selectedCatalogId, setSelectedCatalogId] = useState('');

  // Fetch matrix catalog from Go API / PostgreSQL
  useEffect(() => {
    fetchCatalog();
  }, [token]);

  const fetchCatalog = async () => {
    try {
      const headers = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      const res = await fetch(`${API_BASE}/api/v1/matrices`, { headers });
      const json = await res.json();
      if (json.status === 'success' && Array.isArray(json.data)) {
        setCatalogMatrices(json.data);
      }
    } catch (_) {}
  };

  const handlePresetSelect = (preset) => {
    let presetMatrix = [];
    if (preset === 'reto3x3') {
      presetMatrix = [
        [12, -51, 4],
        [6, 167, -68],
        [-4, 24, -41]
      ];
    } else if (preset === 'rect4x2') {
      presetMatrix = [
        [1, 2],
        [3, 4],
        [5, 6],
        [7, 8]
      ];
    } else if (preset === 'diag3x3') {
      presetMatrix = [
        [5, 0, 0],
        [0, 8, 0],
        [0, 0, 12]
      ];
    }

    onDimensionsChange(presetMatrix.length, presetMatrix[0].length);
    onMatrixChange(presetMatrix);
    setSelectedCatalogId('');
  };

  const handleCatalogSelect = (e) => {
    const id = e.target.value;
    setSelectedCatalogId(id);
    const found = catalogMatrices.find((item) => item.id === id);
    if (found && Array.isArray(found.matrix_data)) {
      onDimensionsChange(found.rows, found.cols);
      onMatrixChange(found.matrix_data);
    }
  };

  const handleCellChange = (r, c, rawValue) => {
    let numVal;
    if (rawValue === '' || rawValue === '-') {
      numVal = rawValue;
    } else {
      const parsed = parseFloat(rawValue);
      numVal = isNaN(parsed) ? 0 : parsed;
    }

    const newMatrix = matrix.map((rowArr, i) =>
      rowArr.map((cellVal, j) => (i === r && j === c ? numVal : cellVal))
    );
    onMatrixChange(newMatrix);
  };

  const handleExecuteCalculate = () => {
    // Normalizar cualquier celda vacía o guión a 0 antes de enviar
    const cleanMatrix = matrix.map((rowArr) =>
      rowArr.map((v) => (typeof v === 'number' ? v : parseFloat(v) || 0))
    );
    onMatrixChange(cleanMatrix);
    onCalculate();
  };

  return (
    <div className="bg-white/90 border border-sky-100 rounded-3xl p-4 sm:p-6 shadow-xl shadow-sky-900/5 backdrop-blur-sm space-y-4 sm:space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-sky-100 pb-3 sm:pb-4">
        <div className="flex items-center gap-2 sm:gap-2.5">
          <div className="p-1.5 sm:p-2 bg-sky-100 text-sky-700 rounded-xl">
            <Table className="h-4 w-4 sm:h-5 sm:w-5" />
          </div>
          <div>
            <h2 className="font-bold text-sm sm:text-base text-slate-900">Panel de Entrada de Matriz</h2>
            <p className="text-[11px] sm:text-xs text-slate-500">Ingreso directo en cuadrícula o desde catálogo</p>
          </div>
        </div>
        <span className="px-2.5 sm:px-3 py-1 rounded-xl bg-sky-50 border border-sky-200 text-xs font-mono text-sky-700 font-bold shrink-0">
          {rows} × {cols}
        </span>
      </div>

      {/* Catalog Selector Dropdown */}
      <div>
        <label className="text-[11px] sm:text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
          <Database className="h-3.5 w-3.5 text-sky-600 shrink-0" />
          <span>Cargar desde BD (Catálogo PostgreSQL):</span>
        </label>
        <select
          value={selectedCatalogId}
          onChange={handleCatalogSelect}
          className="w-full bg-sky-50/60 border border-sky-200 rounded-xl px-2.5 sm:px-3 py-2 sm:py-2.5 text-xs font-semibold text-slate-800 focus:bg-white focus:border-sky-500 focus:ring-2 focus:ring-sky-200 focus:outline-none transition cursor-pointer shadow-sm truncate"
        >
          <option value="">-- Seleccionar una matriz guardada --</option>
          {catalogMatrices.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name} ({item.rows}×{item.cols}) - {item.description || 'Sin descripción'}
            </option>
          ))}
        </select>
      </div>

      {/* Quick Presets */}
      <div>
        <label className="text-[11px] sm:text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
          <Sparkles className="h-3.5 w-3.5 text-sky-600 shrink-0" />
          <span>Plantillas de Evaluación:</span>
        </label>
        <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
          <button
            type="button"
            onClick={() => handlePresetSelect('reto3x3')}
            className="px-1.5 sm:px-2.5 py-2 rounded-xl bg-sky-50/80 hover:bg-sky-100/80 border border-sky-200 text-[11px] sm:text-xs font-bold text-sky-800 transition text-center hover:border-sky-400 cursor-pointer shadow-sm truncate"
          >
            Reto 3×3
          </button>
          <button
            type="button"
            onClick={() => handlePresetSelect('rect4x2')}
            className="px-1.5 sm:px-2.5 py-2 rounded-xl bg-sky-50/80 hover:bg-sky-100/80 border border-sky-200 text-[11px] sm:text-xs font-bold text-sky-800 transition text-center hover:border-sky-400 cursor-pointer shadow-sm truncate"
          >
            Rectangular 4×2
          </button>
          <button
            type="button"
            onClick={() => handlePresetSelect('diag3x3')}
            className="px-1.5 sm:px-2.5 py-2 rounded-xl bg-sky-50/80 hover:bg-sky-100/80 border border-sky-200 text-[11px] sm:text-xs font-bold text-sky-800 transition text-center hover:border-sky-400 cursor-pointer shadow-sm truncate"
          >
            Diagonal 3×3
          </button>
        </div>
      </div>

      {/* Dimension Inputs */}
      <div className="grid grid-cols-2 gap-2 sm:gap-3 pt-2.5 sm:pt-3 border-t border-sky-100">
        <div>
          <label className="text-[11px] sm:text-xs font-bold text-slate-600 block mb-1">Filas (m ≥ n):</label>
          <input
            type="number"
            min="1"
            max="8"
            value={rows}
            onChange={(e) => {
              const r = Math.max(1, parseInt(e.target.value, 10) || 1);
              onDimensionsChange(r, cols);
            }}
            className="w-full bg-sky-50/60 border border-sky-200 rounded-xl px-2.5 sm:px-3 py-1.5 sm:py-2 text-xs font-mono font-bold text-center text-slate-800 focus:bg-white focus:border-sky-500 focus:ring-2 focus:ring-sky-200 focus:outline-none shadow-sm"
          />
        </div>
        <div>
          <label className="text-[11px] sm:text-xs font-bold text-slate-600 block mb-1">Columnas (n):</label>
          <input
            type="number"
            min="1"
            max="8"
            value={cols}
            onChange={(e) => {
              const c = Math.max(1, parseInt(e.target.value, 10) || 1);
              onDimensionsChange(rows, c);
            }}
            className="w-full bg-sky-50/60 border border-sky-200 rounded-xl px-2.5 sm:px-3 py-1.5 sm:py-2 text-xs font-mono font-bold text-center text-slate-800 focus:bg-white focus:border-sky-500 focus:ring-2 focus:ring-sky-200 focus:outline-none shadow-sm"
          />
        </div>
      </div>

      {/* Matrix Interactive Grid (Responsivo con scroll táctil) */}
      <div className="space-y-1.5 sm:space-y-2">
        <label className="text-[11px] sm:text-xs font-bold text-slate-700 block">Valores de la Matriz:</label>
        <div className="bg-sky-50/50 p-2 sm:p-4 rounded-2xl border border-sky-200 overflow-x-auto max-w-full shadow-inner flex justify-center touch-pan-x">
          <div
            className="grid gap-1.5 sm:gap-2 min-w-fit mx-auto p-1"
            style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
          >
            {matrix.map((row, r) =>
              row.map((val, c) => (
                <input
                  key={`${r}-${c}`}
                  type="number"
                  step="any"
                  value={val}
                  onChange={(e) => handleCellChange(r, c, e.target.value)}
                  className="w-12 h-9 sm:w-14 sm:h-10 bg-white border border-sky-200 hover:border-sky-400 rounded-xl text-center text-xs font-mono font-bold text-slate-800 focus:border-sky-500 focus:ring-2 focus:ring-sky-200 focus:outline-none transition shadow-sm"
                />
              ))
            )}
          </div>
        </div>
      </div>

      {/* Action Button */}
      <button
        type="button"
        disabled={loading}
        onClick={handleExecuteCalculate}
        className="w-full py-3 sm:py-3.5 px-3 sm:px-4 rounded-xl bg-gradient-to-r from-sky-500 via-sky-600 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-sky-500/30 transition active:scale-[0.98] disabled:opacity-50 cursor-pointer"
      >
        {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4 fill-white" />}
        <span>Calcular Factorización QR & Estadísticas</span>
      </button>
    </div>
  );
}
