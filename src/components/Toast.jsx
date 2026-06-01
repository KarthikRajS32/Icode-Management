import { useApp } from '../context/AppContext';
import { cn } from '../utils/cn';
import { X, CheckCircle2, AlertCircle, Info } from 'lucide-react';

export const Toast = () => {
  const { toast, setToast } = useApp();
  if (!toast) return null;

  const types = {
    success: { bg: 'bg-white border-emerald-200', icon: CheckCircle2, iconColor: 'text-emerald-500', text: 'text-gray-800' },
    error:   { bg: 'bg-white border-red-200',     icon: AlertCircle,  iconColor: 'text-red-500',     text: 'text-gray-800' },
    info:    { bg: 'bg-white border-blue-200',     icon: Info,         iconColor: 'text-blue-500',    text: 'text-gray-800' },
  };

  const config = types[toast.type] || types.success;
  const Icon = config.icon;

  return (
    <div className="fixed bottom-5 right-5 z-[100] w-full max-w-sm">
      <div className={cn('flex items-start gap-3 p-4 rounded-xl border shadow-lg', config.bg)}>
        <Icon size={18} className={cn('flex-shrink-0 mt-0.5', config.iconColor)} />
        <p className={cn('text-sm font-medium flex-grow leading-snug', config.text)}>{toast.message}</p>
        <button onClick={() => setToast(null)} className="p-0.5 rounded text-gray-400 hover:text-gray-600 flex-shrink-0 cursor-pointer">
          <X size={14} />
        </button>
      </div>
    </div>
  );
};
