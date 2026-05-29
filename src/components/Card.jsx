import React from 'react';
import { cn } from '../utils/cn';

/**
 * Premium Card with dynamic glow highlights
 */
export const Card = ({
  children,
  title,
  subtitle,
  icon: Icon,
  className = '',
  headerClassName = '',
  bodyClassName = '',
  action,
  glow = false,
  glowColor = 'indigo', // 'indigo' | 'emerald' | 'rose' | 'amber'
  ...props
}) => {
  const glowColors = {
    indigo: 'hover:border-indigo-400 dark:hover:border-indigo-600/80 hover:shadow-md',
    emerald: 'hover:border-emerald-400 dark:hover:border-emerald-600/80 hover:shadow-md',
    rose: 'hover:border-rose-400 dark:hover:border-rose-600/80 hover:shadow-md',
    amber: 'hover:border-amber-400 dark:hover:border-amber-600/80 hover:shadow-md',
  };

  return (
    <div
      className={cn(
        'relative bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-2xl shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 overflow-hidden flex flex-col',
        glow && glowColors[glowColor],
        className
      )}
      {...props}
    >
      {(title || subtitle || Icon || action) && (
        <div className={cn('px-6 py-5 border-b border-slate-50 dark:border-slate-800/50 flex items-center justify-between gap-4', headerClassName)}>
          <div className="flex items-center gap-3">
            {Icon && (
              <div className={cn(
                'p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400',
                glow && glowColor === 'indigo' && 'text-indigo-500 bg-indigo-50 dark:bg-indigo-950/30',
                glow && glowColor === 'emerald' && 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/30',
                glow && glowColor === 'rose' && 'text-rose-500 bg-rose-50 dark:bg-rose-950/30',
                glow && glowColor === 'amber' && 'text-amber-500 bg-amber-50 dark:bg-amber-950/30',
              )}>
                <Icon size={20} />
              </div>
            )}
            <div>
              {title && <h3 className="font-bold text-slate-800 dark:text-slate-100 text-base leading-tight">{title}</h3>}
              {subtitle && <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{subtitle}</p>}
            </div>
          </div>
          {action && <div className="flex-shrink-0">{action}</div>}
        </div>
      )}
      <div className={cn('p-6 flex-grow flex flex-col justify-between', bodyClassName)}>
        {children}
      </div>
    </div>
  );
};
