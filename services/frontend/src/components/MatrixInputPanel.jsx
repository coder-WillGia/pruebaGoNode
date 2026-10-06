import React, { useState, useEffect } from 'react';
import { Table, Database, Play, Sparkles, Code2, RefreshCw } from 'lucide-react';
import { API_BASE } from '../config/env.js';

export function MatrixInputPanel({
  rows,
  cols,
  onDimensionsChange,
  matrix,
  onMatrixChange,
  onCalculate,
  loading
}) {
  const [catalogMatrices, setCatalogMatrices] = useState([]);
  const [selectedCatalogId, setSelectedCatalogId] = useState('');
  const [isJsonMode, setIsJsonMode] = useState(false);
  const [jsonText, setJsonText] = useState('');
  const [jsonError, setJsonError] = useState('');

  // Fetch matrix catalog from Go API / PostgreSQL
  useEffect(() => {
    fetchCatalog();
  }, []);

  const fetchCatalog = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/v1/matrices`);
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
    setJsonText(JSON.stringify(presetMatrix, null, 2));
    setSelectedCatalogId('');
  };

  const handleCatalogSelect = (e) => {
    const id = e.target.value;
    setSelectedCatalogId(id);
    const found = catalogMatrices.find((item) => item.id === id);
    if (found && Array.isArray(found.matrix_data)) {
      onDimensionsChange(found.rows, found.cols);
      onMatrixChange(found.matrix_data);
      setJsonText(JSON.stringify(found.matrix_data, null, 2));
    }
  };

  const handleCellChange = (r, c, value) => {
    const num = parseFloat(value) || 0;
    const newMatrix = matrix.map((rowArr, i) =>
      rowArr.map((cellVal, j) => (i === r && j === c ? num : cellVal))
    );
    onMatrixChange(newMatrix);
    setJsonText(JSON.stringify(newMatrix, null, 2));
  };

  const toggleJsonMode = () => {
    if (!isJsonMode) {
      setJsonText(JSON.stringify(matrix, null, 2));
      setIsJsonMode(true);
      setJsonError('');
    } else {
      try {
        const parsed = JSON.parse(jsonText);
        if (!Array.isArray(parsed) || parsed.length === 0 || !Array.isArray(parsed[0])) {
          throw new Error('Debe ser un array bidimensional válido');
        }
        const m = parsed.length;
        const n = parsed[0].length;
        if (m < n) {
          throw new Error('La matriz debe tener al menos tantas filas como columnas (m >= n)');
        }
        onDimensionsChange(m, n);
        onMatrixChange(parsed);
        setIsJsonMode(false);
        setJsonError('');
      } catch (err) {
        setJsonError(err.message);
      }
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-xl">
            <Table className="h-5 w-5" />
          </div>
          <div>
            <h2 className="font-bold text-base text-white">Panel de Entrada de Matriz</h2>
            <p className="text-xs text-slate-400">Ingreso dinámico o selección desde catálogo en BD</p>
          </div>
        </div>
        <span className="px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-xs font-mono text-indigo-300 font-semibold">
          {rows} × {cols}
        </span>
      </div>

      {/* Catalog Selector Dropdown */}
      <div>
        <label className="text-xs font-semibold text-slate-300 mb-2 flex items-center gap-1.5">
          <Database className="h-3.5 w-3.5 text-indigo-400" />
          <span>Cargar desde BD (Catálogo PostgreSQL):</span>
        </label>
        <select
          value={selectedCatalogId}
          onChange={handleCatalogSelect}
          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:border-indigo-500 focus:outline-none transition cursor-pointer"
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
        <label className="text-xs font-semibold text-slate-300 mb-2 flex items-center gap-1.5">
          <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
          <span>Plantillas de Evaluación:</span>
        </label>
        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => handlePresetSelect('reto3x3')}
            className="px-2.5 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-xs font-semibold text-slate-200 transition text-center hover:border-indigo-500/50"
          >
            Reto 3×3
          </button>
          <button
            type="button"
            onClick={() => handlePresetSelect('rect4x2')}
            className="px-2.5 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-xs font-semibold text-slate-200 transition text-center hover:border-indigo-500/50"
          >
            Rectangular 4×2
          </button>
          <button
            type="button"
            onClick={() => handlePresetSelect('diag3x3')}
            className="px-2.5 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-xs font-semibold text-slate-200 transition text-center hover:border-indigo-500/50"
          >
            Diagonal 3×3
          </button>
        </div>
      </div>

      {/* Dimension Inputs */}
      <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-800">
        <div>
          <label className="text-xs font-medium text-slate-400 block mb-1">Filas (m ≥ n):</label>
          <input
            type="number"
            min="1"
            max="8"
            value={rows}
            onChange={(e) => {
              const r = Math.max(1, parseInt(e.target.value, 10) || 1);
              onDimensionsChange(r, cols);
            }}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-center text-slate-200 focus:border-indigo-500 focus:outline-none"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-slate-400 block mb-1">Columnas (n):</label>
          <input
            type="number"
            min="1"
            max="8"
            value={cols}
            onChange={(e) => {
              const c = Math.max(1, parseInt(e.target.value, 10) || 1);
              onDimensionsChange(rows, c);
            }}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-center text-slate-200 focus:border-indigo-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Matrix Grid / JSON Editor */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-slate-300">Valores de la Matriz:</label>
          <button
            type="button"
            onClick={toggleJsonMode}
            className="text-xs text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1"
          >
            <Code2 className="h-3.5 w-3.5" />
            <span>{isJsonMode ? 'Ver como Cuadrícula' : 'Editar como JSON'}</span>
          </button>
        </div>

        {isJsonMode ? (
          <div className="space-y-2">
            <textarea
              rows={6}
              value={jsonText}
              onChange={(e) => setJsonText(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs font-mono text-indigo-300 focus:border-indigo-500 focus:outline-none"
            />
            {jsonError && <p className="text-xs text-rose-400">{jsonError}</p>}
          </div>
        ) : (
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 overflow-x-auto flex justify-center">
            <div
              className="grid gap-2"
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
                    className="w-14 h-10 bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-lg text-center text-xs font-mono font-semibold text-slate-100 focus:border-indigo-500 focus:outline-none transition"
                  />
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* Action Button */}
      <button
        type="button"
        disabled={loading}
        onClick={onCalculate}
        className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 transition active:scale-[0.98] disabled:opacity-50"
      >
        {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4 fill-white" />}
        <span>Calcular Factorización QR & Estadísticas</span>
      </button>
    </div>
  );
}
