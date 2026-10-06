import React, { useState } from 'react';
import { Lock, User, AlertCircle, Loader2, Layers, ShieldCheck } from 'lucide-react';
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
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-sky-50 via-sky-100 to-blue-100 p-3 sm:p-6 relative overflow-hidden">
      {/* Background Ambient Sky Glows */}
      <div className="absolute -top-32 -left-32 w-72 sm:w-96 h-72 sm:h-96 bg-sky-300/40 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-32 -right-32 w-72 sm:w-96 h-72 sm:h-96 bg-blue-300/40 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-sm sm:max-w-md w-full space-y-5 sm:space-y-6 relative z-10 animate-in fade-in zoom-in-95 duration-300">
        
        {/* Branding & Header */}
        <div className="text-center space-y-1.5 sm:space-y-2">
          <div className="inline-flex h-14 w-14 sm:h-16 sm:w-16 rounded-2xl bg-gradient-to-tr from-sky-500 via-sky-600 to-blue-600 items-center justify-center shadow-xl shadow-sky-500/25 mb-1 ring-4 ring-white">
            <Layers className="h-7 w-7 sm:h-8 sm:w-8 text-white" />
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900">
            Interseguro Matrix
          </h1>
          <p className="text-[11px] sm:text-xs text-sky-800/80 font-medium max-w-xs mx-auto px-2">
            Factorización QR en Go, Analítica en Node.js y Persistencia en PostgreSQL
          </p>
        </div>

        {/* Auth Glass Card */}
        <div className="bg-white/90 border border-sky-100 rounded-3xl p-5 sm:p-8 shadow-2xl shadow-sky-900/10 backdrop-blur-md space-y-4 sm:space-y-5">
          <div className="flex items-center justify-between border-b border-sky-100 pb-3 sm:pb-4">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                {mode === 'login' ? 'Iniciar Sesión' : 'Crear Cuenta'}
              </h2>
              <p className="text-[11px] sm:text-xs text-slate-500">
                {mode === 'login' ? 'Ingresa tus credenciales para acceder' : 'Regístrate para auditar tus cálculos'}
              </p>
            </div>
            <span className="p-2 sm:p-2.5 rounded-xl bg-sky-50 text-sky-600 ring-1 ring-sky-100 shrink-0 ml-2">
              <ShieldCheck className="h-4 w-4 sm:h-5 sm:w-5" />
            </span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3.5 sm:space-y-4">
            <div>
              <label className="text-[11px] sm:text-xs font-semibold text-slate-700 block mb-1">
                Nombre de Usuario
              </label>
              <div className="relative">
                <User className="h-4 w-4 text-sky-600/70 absolute left-3.5 top-3 sm:top-3.5" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder={mode === 'login' ? 'evaluador_interseguro' : 'Ej: nuevo_usuario'}
                  className="w-full bg-sky-50/60 border border-sky-200 rounded-xl pl-10 pr-4 py-2.5 sm:py-3 text-xs font-semibold text-slate-800 placeholder-slate-400 focus:bg-white focus:border-sky-500 focus:ring-2 focus:ring-sky-200 focus:outline-none transition shadow-sm"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] sm:text-xs font-semibold text-slate-700 block mb-1">
                Contraseña
              </label>
              <div className="relative">
                <Lock className="h-4 w-4 text-sky-600/70 absolute left-3.5 top-3 sm:top-3.5" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={mode === 'login' ? '••••••••' : 'Crea una contraseña segura'}
                  className="w-full bg-sky-50/60 border border-sky-200 rounded-xl pl-10 pr-4 py-2.5 sm:py-3 text-xs font-semibold text-slate-800 placeholder-slate-400 focus:bg-white focus:border-sky-500 focus:ring-2 focus:ring-sky-200 focus:outline-none transition shadow-sm"
                />
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 text-xs flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span className="break-words">{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 sm:py-3.5 rounded-xl bg-gradient-to-r from-sky-500 via-sky-600 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white font-bold text-xs sm:text-sm shadow-lg shadow-sky-500/30 flex items-center justify-center gap-2 transition disabled:opacity-50 active:scale-95 cursor-pointer"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              <span>{mode === 'login' ? 'Acceder' : 'Registrar y Continuar'}</span>
            </button>
          </form>

          <div className="text-center pt-2.5 sm:pt-3 border-t border-sky-100 text-[11px] sm:text-xs text-slate-600">
            <span>{mode === 'login' ? '¿Deseas registrar un nuevo usuario?' : '¿Ya tienes una cuenta?'}</span>
            <button
              type="button"
              onClick={() => {
                if (mode === 'login') {
                  setMode('register');
                  setUsername('');
                  setPassword('');
                } else {
                  setMode('login');
                  setUsername('evaluador_interseguro');
                  setPassword('interseguro2026');
                }
                setError('');
              }}
              className="text-sky-600 hover:text-sky-700 font-bold ml-1.5 underline cursor-pointer"
            >
              {mode === 'login' ? 'Crear cuenta' : 'Inicia Sesión'}
            </button>
          </div>
        </div>

        {/* Footer info */}
        <p className="text-center text-[10px] sm:text-[11px] text-sky-800/70 font-medium">
          Evaluación Técnica Interseguro • División TI
        </p>
      </div>
    </div>
  );
}
