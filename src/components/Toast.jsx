import { useApp } from '../context/AppContext';
import { cn } from '../utils/cn';
import { X, CheckCircle, Info, AlertTriangle } from 'lucide-react';

/**
 * Premium in-app floating Toast Notification Alert
 */
export const Toast = () => {
  const { toast, setToast } = useApp();

  if (!toast) return null;

  const types = {
    success: {
      bg: 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-100 dark:border-emerald-900/50',
      text: 'text-emerald-800 dark:text-emerald-200',
      iconText: 'text-emerald-500',
      icon: CheckCircle
    },
    error: {
      bg: 'bg-rose-50 dark:bg-rose-950/20 border-rose-100 dark:border-rose-900/50',
      text: 'text-rose-800 dark:text-rose-200',
      iconText: 'text-rose-500',
      icon: AlertTriangle
    },
    info: {
      bg: 'bg-blue-50 dark:bg-blue-950/20 border-blue-100 dark:border-blue-900/50',
      text: 'text-blue-800 dark:text-blue-200',
      iconText: 'text-blue-500',
      icon: Info
    }
  };

  const config = types[toast.type] || types.success;
  const IconComponent = config.icon;

  return (
    <div className="fixed bottom-6 right-6 z-[100] max-w-sm w-full p-0 flex flex-col gap-2 pointer-events-auto animate-in slide-in-from-bottom-5 fade-in duration-300">
      <div className={cn(
        'w-full flex items-start gap-3.5 p-4 rounded-2xl border shadow-xl backdrop-blur-md',
        config.bg
      )}>
        {/* Type Icon */}
        <div className={cn('p-0.5 rounded-full flex-shrink-0 mt-0.5', config.iconText)}>
          <IconComponent size={20} />
        </div>

        {/* Message body */}
        <div className="flex-grow">
          <p className={cn('text-sm font-semibold leading-relaxed', config.text)}>
            {toast.message}
          </p>
        </div>

        {/* Close Button */}
        <button
          type="button"
          onClick={() => setToast(null)}
          className={cn(
            'p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 flex-shrink-0 transition-colors duration-200 cursor-pointer',
            config.iconText
          )}
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
};
