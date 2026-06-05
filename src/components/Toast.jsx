import { useApp } from '../context/AppContext';
import { cn } from '../utils/cn';
import { X, CheckCircle2, AlertCircle, Info } from 'lucide-react';
import { createPortal } from 'react-dom';

export const Toast = () => {
  const { toast, setToast } = useApp();
  if (!toast) return null;

  const types = {
    success: { border: 'border-emerald-200', accent: 'border-l-emerald-500', icon: CheckCircle2, iconColor: 'text-emerald-500' },
    error:   { border: 'border-red-200',     accent: 'border-l-red-500',     icon: AlertCircle,  iconColor: 'text-red-500'     },
    info:    { border: 'border-blue-200',     accent: 'border-l-blue-500',    icon: Info,         iconColor: 'text-blue-500'    },
  };

  const config = types[toast.type] || types.success;
  const Icon = config.icon;

  return createPortal(
    <div className="fixed bottom-5 right-5 z-[100] w-full max-w-sm animate-scale-up">
      <div className={cn(
        'flex items-start gap-3 p-4 rounded-xl bg-white border border-l-4 shadow-lg',
        config.border, config.accent
      )}>
        <Icon size={17} className={cn('flex-shrink-0 mt-0.5', config.iconColor)} />
        <p className="text-sm font-medium flex-grow leading-snug text-slate-700">{toast.message}</p>
        <button onClick={() => setToast(null)} className="p-0.5 rounded text-slate-400 hover:text-slate-600 flex-shrink-0 cursor-pointer transition-colors">
          <X size={14} />
        </button>
      </div>
    </div>,
    document.body
  );
};
