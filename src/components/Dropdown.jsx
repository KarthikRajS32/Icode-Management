import { useState, useEffect, useRef } from 'react';
import { cn } from '../utils/cn';

export const Dropdown = ({ trigger, children, align = 'right', className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setIsOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className="relative inline-block text-left" ref={ref}>
      <div onClick={() => setIsOpen(!isOpen)} className="cursor-pointer">{trigger}</div>
      {isOpen && (
        <div
          className={cn(
            'absolute mt-2 w-52 rounded-xl bg-white border border-gray-100 shadow-lg overflow-hidden z-40',
            align === 'right' ? 'right-0' : 'left-0',
            className
          )}
          onClick={() => setIsOpen(false)}
        >
          <div className="py-1">{children}</div>
        </div>
      )}
    </div>
  );
};

export const DropdownItem = ({ children, onClick, className = '', danger = false, ...props }) => (
  <button
    type="button" onClick={onClick}
    className={cn(
      'w-full text-left px-4 py-2.5 text-sm font-medium flex items-center gap-2.5 transition-colors duration-100 cursor-pointer',
      danger
        ? 'text-red-600 hover:bg-red-50'
        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
      className
    )}
    {...props}
  >
    {children}
  </button>
);
