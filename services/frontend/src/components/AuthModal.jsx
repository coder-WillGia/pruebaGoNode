import React, { useState } from 'react';
import { X, Lock, User, AlertCircle, Loader2 } from 'lucide-react';
import { API_BASE } from '../config/env.js';

export function AuthModal({ isOpen, mode, onClose, onAuthSuccess, onToggleMode }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError('Por favor completa todos los campos.');
      return;
    }

    setLoading(true);
    setError('');

    const endpoint = mode === 'login' ? '/api/v1/auth/login' : '/api/v1/auth/register';

    try {
      const res = await fetch(`${API_BASE}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: username.trim(),
          password: password.trim(),
          role: 'evaluador'
        })
      });

      const json = await res.json();

      if (!res.ok || json.status === 'error') {
        throw new Error(json.message || json.error || 'Error en la autenticación');
      }

      onAuthSuccess(json.data.user, json.data.token);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 max-w-sm w-full rounded-2xl p-6 space-y-5 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="space-y-1">
          <h3 className="font-bold text-lg text-white">
            {mode === 'login' ? 'Iniciar Sesión' : 'Crear Cuenta'}
          </h3>
          <p className="text-xs text-slate-400">
            Autenticación segura con JWT y PostgreSQL (tabla <code className="text-indigo-400 font-mono">users</code>)
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-medium text-slate-300 block mb-1.5">Nombre de Usuario</label>
            <div className="relative">
              <User className="h-4 w-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="evaluador_interseguro"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-xs font-medium text-slate-100 placeholder-slate-600 focus:border-indigo-500 focus:outline-none transition"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-slate-300 block mb-1.5">Contraseña</label>
            <div className="relative">
              <Lock className="h-4 w-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-xs font-medium text-slate-100 placeholder-slate-600 focus:border-indigo-500 focus:outline-none transition"
              />
            </div>
          </div>

          {error && (
            <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition disabled:opacity-50 active:scale-95"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            <span>{mode === 'login' ? 'Acceder al Sistema' : 'Registrar y Autenticar'}</span>
          </button>
        </form>

        <div className="text-center pt-3 border-t border-slate-800 text-xs text-slate-400">
          <span>{mode === 'login' ? '¿No tienes cuenta?' : '¿Ya tienes una cuenta?'}</span>
          <button
            type="button"
            onClick={onToggleMode}
            className="text-indigo-400 hover:text-indigo-300 font-semibold ml-1.5 underline"
          >
            {mode === 'login' ? 'Regístrate aquí' : 'Inicia Sesión'}
          </button>
        </div>
      </div>
    </div>
  );
}
