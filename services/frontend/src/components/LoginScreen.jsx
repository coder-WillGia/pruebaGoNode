import React, { useState } from 'react';
import { Lock, User, AlertCircle, Loader2, Layers, ShieldCheck, Sparkles } from 'lucide-react';
import { API_BASE } from '../config/env.js';

export function LoginScreen({ onAuthSuccess }) {
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [username, setUsername] = useState('evaluador_interseguro');
  const [password, setPassword] = useState('interseguro2026');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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
        throw new Error(json.message || json.error || 'Credenciales inválidas');
      }

      onAuthSuccess(json.data.user, json.data.token);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 p-4 relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-violet-600/20 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-md w-full space-y-8 relative z-10 animate-in fade-in zoom-in-95 duration-300">
        
        {/* Branding & Title */}
        <div className="text-center space-y-3">
          <div className="inline-flex h-16 w-16 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-500 items-center justify-center shadow-2xl shadow-indigo-500/30 mb-2">
            <Layers className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-indigo-300 bg-clip-text text-transparent">
            Interseguro Matrix Pipeline
          </h1>
          <p className="text-xs text-slate-400 max-w-xs mx-auto">
            Factorización QR en Go (Fiber), Analítica en Node.js (Express) y Persistencia en PostgreSQL
          </p>
        </div>

        {/* Auth Card */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-8 shadow-2xl backdrop-blur space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h2 className="text-lg font-bold text-white">
                {mode === 'login' ? 'Iniciar Sesión' : 'Crear Cuenta'}
              </h2>
              <p className="text-xs text-slate-400">
                {mode === 'login' ? 'Ingresa tus credenciales para acceder' : 'Regístrate para auditar tus cálculos'}
              </p>
            </div>
            <span className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
              <ShieldCheck className="h-5 w-5" />
            </span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                Nombre de Usuario
              </label>
              <div className="relative">
                <User className="h-4 w-4 text-slate-500 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="evaluador_interseguro"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-xs font-medium text-slate-100 placeholder-slate-600 focus:border-indigo-500 focus:outline-none transition shadow-inner"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                Contraseña
              </label>
              <div className="relative">
                <Lock className="h-4 w-4 text-slate-500 absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-xs font-medium text-slate-100 placeholder-slate-600 focus:border-indigo-500 focus:outline-none transition shadow-inner"
                />
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition disabled:opacity-50 active:scale-95 cursor-pointer"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              <span>{mode === 'login' ? 'Acceder al Pipeline' : 'Registrar y Continuar'}</span>
            </button>
          </form>

          <div className="text-center pt-2 border-t border-slate-800 text-xs text-slate-400">
            <span>{mode === 'login' ? '¿Deseas registrar un nuevo usuario?' : '¿Ya tienes una cuenta?'}</span>
            <button
              type="button"
              onClick={() => {
                setMode(mode === 'login' ? 'register' : 'login');
                setError('');
              }}
              className="text-indigo-400 hover:text-indigo-300 font-semibold ml-1.5 underline cursor-pointer"
            >
              {mode === 'login' ? 'Crear cuenta' : 'Inicia Sesión'}
            </button>
          </div>
        </div>

        {/* Footer info */}
        <p className="text-center text-[11px] text-slate-600">
          Evaluación Técnica Interseguro • División TI
        </p>
      </div>
    </div>
  );
}
