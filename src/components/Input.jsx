import { useId } from 'react';
import { cn } from '../utils/cn';

/**
 * Reusable Form Input and Textarea
 */
export const Input = ({
  label,
  id,
  type = 'text',
  error,
  icon: Icon,
  className = '',
  textarea = false,
  rows = 3,
  ...props
}) => {
  const stableId = useId();
  const inputId = id || stableId;
  
  const baseInputStyles = 'w-full px-4 py-2.5 rounded-xl border transition-all duration-300 outline-none text-slate-800 dark:text-slate-100 bg-white dark:bg-slate-900/50 placeholder-slate-400 focus:ring-2 focus:ring-indigo-500/20 text-sm';
  
  const stateStyles = error
    ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/20'
    : 'border-slate-200 dark:border-slate-800 focus:border-indigo-500 focus:ring-indigo-500/20 hover:border-slate-300 dark:hover:border-slate-700';

  const iconPaddingStyles = Icon ? 'pl-11' : '';

  return (
    <div className={cn('flex flex-col gap-1.5 w-full', className)}>
      {label && (
        <label htmlFor={inputId} className="text-xs font-semibold text-slate-600 dark:text-slate-400 tracking-wide">
          {label}
        </label>
      )}
      
      <div className="relative flex items-center">
        {Icon && (
          <div className="absolute left-4 text-slate-400 pointer-events-none">
            <Icon size={18} />
          </div>
        )}
        
        {textarea ? (
          <textarea
            id={inputId}
            rows={rows}
            className={cn(baseInputStyles, stateStyles, iconPaddingStyles, 'resize-none')}
            {...props}
          />
        ) : (
          <input
            id={inputId}
            type={type}
            className={cn(baseInputStyles, stateStyles, iconPaddingStyles)}
            {...props}
          />
        )}
      </div>
      
      {error && (
        <span className="text-xs text-rose-500 mt-0.5 flex items-center gap-1 font-medium">
          ⚠️ {error}
        </span>
      )}
    </div>
  );
};
