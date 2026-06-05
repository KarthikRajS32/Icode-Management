import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '../utils/cn';
import { X } from 'lucide-react';

export const Dialog = ({
  isOpen, onClose, title, children,
  size = 'md', className = '', closeOnOverlayClick = true
}) => {
  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape' && isOpen) onClose(); };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      document.body.classList.add('dialog-open');
    } else {
      document.body.style.overflow = 'unset';
      document.body.classList.remove('dialog-open');
    }
    return () => {
      document.body.style.overflow = 'unset';
      document.body.classList.remove('dialog-open');
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const sizes = { sm: 'max-w-md', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' };

  return createPortal(
    <div
      onClick={(e) => closeOnOverlayClick && e.target === e.currentTarget && onClose()}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 animate-fade-in"
    >
      <div className={cn(
        'w-full bg-white rounded-xl shadow-2xl border border-slate-200/60 flex flex-col max-h-[92vh] overflow-hidden animate-scale-up',
        sizes[size], className
      )}>
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between gap-4 flex-shrink-0 bg-slate-50/50">
          <h2 className="font-bold text-slate-800 text-base tracking-tight">{title}</h2>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-slate-200 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
          >
            <X size={15} />
          </button>
        </div>
        <div className="p-6 overflow-y-auto flex-grow text-slate-700">
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
};
