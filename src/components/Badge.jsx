import { cn } from '../utils/cn';

export const Badge = ({ children, variant = 'gray', className = '', ...props }) => {
  const variants = {
    gray:    'bg-gray-100 text-gray-600',
    violet:  'bg-blue-100 text-blue-700',
    emerald: 'bg-emerald-100 text-emerald-700',
    red:     'bg-red-100 text-red-700',
    amber:   'bg-amber-100 text-amber-700',
    blue:    'bg-blue-100 text-blue-700',
    rose:    'bg-rose-100 text-rose-700',
    indigo:  'bg-blue-100 text-blue-700',
    slate:   'bg-slate-100 text-slate-600',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium',
        variants[variant] || variants.gray,
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
};
