import { useId, useState } from 'react';
import { cn } from '../utils/cn';
import { Eye, EyeOff } from 'lucide-react';

export const Input = ({
  label, id, type = 'text', error, icon: Icon,
  className = '', textarea = false, rows = 3, ...props
}) => {
  const stableId = useId();
  const inputId = id || stableId;
  const [showPassword, setShowPassword] = useState(false);

  const isPassword = type === 'password';
  const currentType = isPassword ? (showPassword ? 'text' : 'password') : type;

  const base = 'w-full px-3.5 py-2.5 rounded-lg border text-sm text-slate-800 bg-white placeholder-slate-400 outline-none transition-all duration-150';
  const state = error
    ? 'border-red-300 focus:border-red-400 focus:ring-2 focus:ring-red-500/10'
    : 'border-slate-200 hover:border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10';

  return (
    <div className={cn('flex flex-col gap-1.5 w-full', className)}>
      {label && (
        <label htmlFor={inputId} className="text-xs font-semibold text-slate-600 tracking-wide">
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        {Icon && (
          <div className="absolute left-3.5 text-slate-400 pointer-events-none">
            <Icon size={15} />
          </div>
        )}
        {textarea ? (
          <textarea
            id={inputId} rows={rows}
            className={cn(base, state, Icon ? 'pl-10' : '', 'resize-none')}
            {...props}
          />
        ) : (
          <input
            id={inputId} type={currentType}
            className={cn(base, state, Icon ? 'pl-10' : '', isPassword ? 'pr-10' : '')}
            {...props}
          />
        )}
        {isPassword && !textarea && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3.5 text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer p-0.5 rounded transition-colors"
          >
            {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        )}
      </div>
      {error && <p className="text-xs text-red-500 font-medium flex items-center gap-1">{error}</p>}
    </div>
  );
};
