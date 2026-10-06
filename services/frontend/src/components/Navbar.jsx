import React from 'react';
import { ShieldCheck, UserCircle, LogOut, Key, Activity, Layers } from 'lucide-react';

export function Navbar({ user, onOpenAuth, onLogout }) {
  return (
    <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo & Branding */}
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/25">
            <Layers className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-base sm:text-lg leading-tight bg-gradient-to-r from-white via-slate-200 to-indigo-300 bg-clip-text text-transparent">
              Interseguro Matrix Pipeline
            </h1>
            <p className="text-[11px] text-slate-400">Microservicios Go (Fiber) + Node.js (Express) + PostgreSQL</p>
          </div>
        </div>

        {/* Status & Auth Section */}
        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>APIs en Línea (:3000 / :4000)</span>
          </div>

          {user ? (
            <div className="flex items-center gap-2 bg-slate-800/80 border border-slate-700/80 px-3 py-1.5 rounded-xl text-xs">
              <UserCircle className="h-4 w-4 text-indigo-400" />
              <div className="flex flex-col text-left">
                <span className="font-semibold text-slate-200 leading-none">{user.username}</span>
                <span className="text-[10px] text-indigo-300 capitalize">{user.role || 'evaluador'}</span>
              </div>
              <button
                onClick={onLogout}
                title="Cerrar sesión"
                className="ml-2 text-slate-400 hover:text-rose-400 transition p-1 hover:bg-slate-700 rounded-lg"
              >
                <LogOut className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => onOpenAuth('login')}
              className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-lg shadow-indigo-600/25 transition active:scale-95"
            >
              <Key className="h-3.5 w-3.5" />
              <span>Iniciar Sesión</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
