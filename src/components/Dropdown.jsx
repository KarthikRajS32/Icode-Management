import { useState, useEffect, useRef } from 'react';
import { cn } from '../utils/cn';

/**
 * Premium Dynamic Dropdown / Popover list
 */
export const Dropdown = ({
  trigger,
  children,
  align = 'right', // 'left' | 'right'
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const alignments = {
    left: 'left-0 origin-top-left',
    right: 'right-0 origin-top-right'
  };

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      {/* Trigger element wrapper */}
      <div onClick={() => setIsOpen(!isOpen)} className="cursor-pointer">
        {trigger}
      </div>

      {isOpen && (
        <div
          className={cn(
            'absolute mt-2.5 w-56 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-xl overflow-hidden z-40 transform transition-all duration-300 animate-in fade-in slide-in-from-top-2 duration-150',
            alignments[align],
            className
          )}
          onClick={() => setIsOpen(false)} // Auto-close upon clicking any option
        >
          <div className="py-1.5 divide-y divide-slate-50 dark:divide-slate-800/50">
            {children}
          </div>
        </div>
      )}
    </div>
  );
};

export const DropdownItem = ({
  children,
  onClick,
  className = '',
  danger = false,
  ...props
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'w-full text-left px-4 py-2.5 text-sm font-semibold transition-colors duration-200 flex items-center gap-2.5 cursor-pointer',
        danger
          ? 'text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20'
          : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-800 dark:hover:text-slate-100',
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
};
