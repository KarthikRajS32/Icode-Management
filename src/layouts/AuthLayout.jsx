import React from 'react';

/**
 * Centered glassmorphic layout wrapper for login screen
 */
export const AuthLayout = ({ children }) => {
  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 bg-slate-950 overflow-hidden font-sans">
      {/* Dynamic Aesthetic Glowing Spheres */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-indigo-600/20 blur-3xl pointer-events-none animate-pulse duration-[8000ms]" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-[450px] h-[450px] rounded-full bg-violet-600/15 blur-3xl pointer-events-none animate-pulse duration-[12000ms]" />
      <div className="absolute top-1/2 right-10 -translate-y-1/2 w-64 h-64 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

      {/* Main card viewport */}
      <div className="relative z-10 w-full max-w-md bg-slate-900/60 dark:bg-slate-900/40 border border-slate-800/80 rounded-3xl p-8 shadow-2xl backdrop-blur-xl animate-in fade-in zoom-in-95 duration-500">
        {/* Core application title */}
        <div className="flex flex-col items-center text-center gap-1.5 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white font-extrabold text-2xl shadow-md shadow-indigo-600/20">
            iC
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight mt-3">ICode Academy</h1>
          <p className="text-xs text-slate-400 font-semibold tracking-wide uppercase">
            School Management System
          </p>
        </div>

        {children}
      </div>
    </div>
  );
};
