import { cn } from '../utils/cn';

const glowColors = {
  indigo:  'text-blue-500 bg-blue-50',
  emerald: 'text-emerald-500 bg-emerald-50',
  rose:    'text-rose-500 bg-rose-50',
  amber:   'text-amber-500 bg-amber-50',
  blue:    'text-blue-500 bg-blue-50',
};

const accentBorders = {
  indigo:  'border-l-4 border-l-blue-600',
  emerald: 'border-l-4 border-l-emerald-500',
  rose:    'border-l-4 border-l-rose-500',
  amber:   'border-l-4 border-l-amber-500',
  blue:    'border-l-4 border-l-blue-600',
};

export const Card = ({
  children, title, subtitle, icon: Icon, className = '',
  headerClassName = '', bodyClassName = '', action,
  glow = false, glowColor = 'blue',
  ...props
}) => {
  if (glow) {
    const iconStyle = glowColors[glowColor] || glowColors.blue;
    const borderStyle = accentBorders[glowColor] || accentBorders.blue;
    // Detect if this is a numeric metric card (title is a plain number string)
    const isMetric = title && /^\d+$/.test(String(title).trim());

    return (
      <div
        className={cn(
          'bg-white border border-slate-200/60 rounded-2xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)] flex flex-col',
          borderStyle,
          className
        )}
        {...props}
      >
        {/* Header row: icon + optional action */}
        <div className="flex items-start justify-between mb-4">
          {Icon && (
            <div className={cn('w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0', iconStyle)}>
              <Icon size={20} />
            </div>
          )}
          {action && <div className="flex-shrink-0">{action}</div>}
        </div>

        {/* Title & subtitle */}
        <div className="flex flex-col gap-1 mb-2">
          {title && (
            isMetric ? (
              <p className="text-3xl font-black text-slate-800 leading-none tracking-tight">
                {title}
              </p>
            ) : (
              <p className="text-base font-extrabold text-slate-800 leading-snug">
                {title}
              </p>
            )
          )}
          {subtitle && (
            <p className="text-xs text-slate-400 font-medium">{subtitle}</p>
          )}
        </div>

        {children}
      </div>
    );
  }

  // Default card (non-glow)
  return (
    <div
      className={cn(
        'bg-white border border-slate-200/60 rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.04)] flex flex-col overflow-hidden',
        className
      )}
      {...props}
    >
      {(title || subtitle || Icon || action) && (
        <div className={cn('px-5 py-4 border-b border-slate-100/80 flex items-center justify-between gap-4', headerClassName)}>
          <div className="flex items-center gap-3">
            {Icon && (
              <div className="w-9 h-9 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400 flex-shrink-0">
                <Icon size={18} />
              </div>
            )}
            <div>
              {title && <p className="font-semibold text-gray-900 text-sm leading-tight">{title}</p>}
              {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
            </div>
          </div>
          {action && <div className="flex-shrink-0">{action}</div>}
        </div>
      )}
      <div className={cn('p-5 flex-grow', bodyClassName)}>
        {children}
      </div>
    </div>
  );
};
