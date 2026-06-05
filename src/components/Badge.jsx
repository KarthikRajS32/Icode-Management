import { cn } from '../utils/cn';

export const Badge = ({ children, variant = 'gray', className = '', ...props }) => {
  const variants = {
    gray:    'bg-slate-100 text-slate-600 ring-1 ring-slate-200/60',
    violet:  'bg-blue-50 text-blue-700 ring-1 ring-blue-100',
    emerald: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100',
    red:     'bg-red-50 text-red-700 ring-1 ring-red-100',
    amber:   'bg-amber-50 text-amber-700 ring-1 ring-amber-100',
    blue:    'bg-blue-50 text-blue-700 ring-1 ring-blue-100',
    rose:    'bg-rose-50 text-rose-700 ring-1 ring-rose-100',
    indigo:  'bg-indigo-50 text-indigo-700 ring-1 ring-indigo-100',
    slate:   'bg-slate-100 text-slate-600 ring-1 ring-slate-200/60',
    green:   'bg-green-50 text-green-700 ring-1 ring-green-100',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold tracking-wide',
        variants[variant] || variants.gray,
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
};
