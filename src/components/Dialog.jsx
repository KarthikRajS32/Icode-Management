import { useEffect } from 'react';
import { cn } from '../utils/cn';
import { X } from 'lucide-react';

/**
 * Premium Reusable Modal Dialog with backdrop blur and entry animations
 */
export const Dialog = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md', // 'sm' | 'md' | 'lg' | 'xl'
  className = '',
  closeOnOverlayClick = true
}) => {
  // Listen for escape key press to close modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl'
  };

  const handleOverlayClick = (e) => {
    if (closeOnOverlayClick && e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      onClick={handleOverlayClick}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 dark:bg-slate-950/60 backdrop-blur-sm transition-all duration-300"
    >
      <div
        className={cn(
          'w-full bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden transform transition-all duration-300 scale-100 flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200',
          sizes[size],
          className
        )}
      >
        {/* Header Block */}
        <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800/60 flex items-center justify-between gap-4">
          <h2 className="font-extrabold text-slate-800 dark:text-slate-100 text-lg leading-tight">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors duration-200 cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-grow text-slate-700 dark:text-slate-300">
          {children}
        </div>
      </div>
    </div>
  );
};
