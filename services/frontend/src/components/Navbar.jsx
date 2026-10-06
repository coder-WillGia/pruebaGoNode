import React from 'react';
import { UserCircle, LogOut, Layers } from 'lucide-react';

export function Navbar({ user, onLogout }) {
  return (
    <header className="border-b border-sky-200/80 bg-white/80 backdrop-blur-md sticky top-0 z-30 shadow-sm">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2">
        {/* Logo & Branding */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl bg-gradient-to-tr from-sky-500 via-sky-600 to-blue-600 flex items-center justify-center shadow-md shadow-sky-500/20 ring-2 ring-white shrink-0">
            <Layers className="h-5 w-5 text-white" />
          </div>
          <div className="min-w-0">
            <h1 className="font-extrabold text-sm sm:text-lg leading-tight text-slate-900 truncate">
              Interseguro Matrix Pipeline
            </h1>
            <p className="text-[10px] sm:text-[11px] text-sky-700 font-medium truncate">Go + Node.js + PostgreSQL</p>
          </div>
        </div>

        {/* Status & Logged User */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>APIs en Línea (:3000 / :4000)</span>
          </div>

          {user && (
            <div className="flex items-center gap-1.5 sm:gap-2 bg-sky-50/80 border border-sky-200/80 px-2 sm:px-3 py-1.5 rounded-xl text-xs shadow-sm max-w-[170px] sm:max-w-none">
              <UserCircle className="h-4 w-4 text-sky-600 shrink-0" />
              <div className="flex flex-col text-left min-w-0">
                <span className="font-bold text-slate-800 leading-none truncate max-w-[80px] sm:max-w-[130px]">
                  {user.username}
                </span>
                <span className="text-[9px] sm:text-[10px] text-sky-600 font-semibold capitalize truncate">
                  {user.role || 'evaluador'}
                </span>
              </div>
              <button
                onClick={onLogout}
                title="Cerrar sesión"
                className="ml-1 text-slate-400 hover:text-rose-600 transition p-1 hover:bg-rose-50 rounded-lg cursor-pointer shrink-0"
              >
                <LogOut className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
