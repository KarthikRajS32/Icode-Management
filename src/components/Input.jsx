import { useId } from 'react';
import { cn } from '../utils/cn';

export const Input = ({
  label, id, type = 'text', error, icon: Icon,
  className = '', textarea = false, rows = 3, ...props
}) => {
  const stableId = useId();
  const inputId = id || stableId;

  const base = 'w-full px-3.5 py-2.5 rounded-lg border text-sm text-gray-800 bg-white placeholder-gray-400 outline-none transition-all duration-150';
  const state = error
    ? 'border-red-300 focus:border-red-400 focus:ring-2 focus:ring-red-100'
    : 'border-gray-200 hover:border-gray-300 focus:border-blue-400 focus:ring-2 focus:ring-blue-100';

  return (
    <div className={cn('flex flex-col gap-1.5 w-full', className)}>
      {label && (
        <label htmlFor={inputId} className="text-xs font-medium text-gray-600">
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        {Icon && (
          <div className="absolute left-3.5 text-gray-400 pointer-events-none">
            <Icon size={16} />
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
            id={inputId} type={type}
            className={cn(base, state, Icon ? 'pl-10' : '')}
            {...props}
          />
        )}
      </div>
      {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
    </div>
  );
};
