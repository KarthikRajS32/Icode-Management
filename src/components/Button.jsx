import { cn } from '../utils/cn';

export const Button = ({
  children, type = 'button', variant = 'primary',
  size = 'md', className = '', loading = false, disabled = false, onClick, ...props
}) => {
  const base = 'inline-flex items-center justify-center font-semibold rounded-lg transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] cursor-pointer select-none';

  const variants = {
    primary:   'bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white focus:ring-blue-500/40 shadow-sm',
    secondary: 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 hover:border-slate-300 focus:ring-slate-300/40 shadow-sm',
    success:   'bg-emerald-600 hover:bg-emerald-700 text-white focus:ring-emerald-500/40 shadow-sm',
    danger:    'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500/40 shadow-sm',
    ghost:     'bg-transparent hover:bg-slate-100 text-slate-500 hover:text-slate-800 focus:ring-slate-300/40',
    glass:     'bg-white/15 hover:bg-white/25 backdrop-blur-sm text-white border border-white/25 focus:ring-white/50',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs gap-1.5',
    md: 'px-4 py-2 text-sm gap-2',
    lg: 'px-5 py-2.5 text-sm gap-2',
  };

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={cn(base, variants[variant], sizes[size], className)}
      {...props}
    >
      {loading && (
        <svg className="animate-spin h-3.5 w-3.5 text-current flex-shrink-0" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      )}
      {children}
    </button>
  );
};
