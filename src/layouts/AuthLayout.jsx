export const AuthLayout = ({ children }) => {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 font-sans relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)' }}
    >
      {/* Subtle grid pattern overlay */}
      <div className="absolute inset-0 opacity-[0.03]"
        style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)', backgroundSize: '40px 40px' }}
      />

      <div className="relative z-10 w-full max-w-md animate-fade-in">
        {/* Brand mark */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-blue-600 flex items-center justify-center text-white font-black text-xl shadow-lg mb-4 ring-4 ring-blue-500/20">
            iC
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">ICode Academy</h1>
          <p className="text-sm text-slate-400 mt-1.5 font-medium">Education Management Platform</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl border border-slate-200/60 p-8">
          {children}
        </div>

        <p className="text-center text-xs text-slate-500 mt-6 font-medium">
          © {new Date().getFullYear()} ICode Academy. All rights reserved.
        </p>
      </div>
    </div>
  );
};
