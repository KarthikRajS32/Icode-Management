import { useState, useEffect, useRef } from 'react';
import { cn } from '../utils/cn';
import { ChevronDown, X, Check, Search } from 'lucide-react';
import { Badge } from './Badge';

/**
 * Reusable Custom Multi-Select Dropdown Component
 */
export const MultiSelect = ({
  options = [], // [{ value, label }]
  selectedValues = [], // [value]
  onChange,
  placeholder = 'Select options...',
  label = '',
  error = '',
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const containerRef = useRef(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToggleOption = (value) => {
    if (selectedValues.includes(value)) {
      onChange(selectedValues.filter((v) => v !== value));
    } else {
      onChange([...selectedValues, value]);
    }
  };

  const handleRemoveOption = (value, e) => {
    e.stopPropagation(); // Avoid opening the dropdown popup
    onChange(selectedValues.filter((v) => v !== value));
  };

  const filteredOptions = options.filter((opt) =>
    opt.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className={cn('flex flex-col gap-1.5 w-full relative', className)} ref={containerRef}>
      {label && (
        <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 tracking-wide">
          {label}
        </span>
      )}

      {/* Select Field trigger container */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'w-full min-h-[42px] px-3.5 py-1.5 rounded-xl border bg-white dark:bg-slate-900/50 flex flex-wrap items-center gap-1.5 cursor-pointer transition-all duration-300 outline-none focus-within:ring-2 focus-within:ring-indigo-500/20 text-sm',
          error
            ? 'border-rose-500 focus-within:ring-rose-500/20'
            : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
        )}
      >
        {selectedValues.length === 0 ? (
          <span className="text-slate-400 select-none text-xs">{placeholder}</span>
        ) : (
          <div className="flex flex-wrap gap-1.5 max-w-[90%]">
            {selectedValues.map((val) => {
              const opt = options.find((o) => o.value === val);
              return (
                <Badge
                  key={val}
                  variant="indigo"
                  className="text-[9px] lowercase font-extrabold flex items-center gap-1 normal-case scale-95"
                >
                  {opt ? opt.label : val}
                  <button
                    type="button"
                    onClick={(e) => handleRemoveOption(val, e)}
                    className="p-0.5 rounded-full hover:bg-indigo-200 dark:hover:bg-indigo-900 text-indigo-600 dark:text-indigo-400 transition-colors flex-shrink-0 cursor-pointer"
                  >
                    <X size={10} />
                  </button>
                </Badge>
              );
            })}
          </div>
        )}

        <div className="absolute right-3.5 text-slate-400 flex items-center gap-1.5">
          {selectedValues.length > 0 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onChange([]);
              }}
              className="p-0.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600"
            >
              <X size={14} />
            </button>
          )}
          <ChevronDown size={14} className={cn('transition-transform duration-200', isOpen && 'rotate-180')} />
        </div>
      </div>

      {/* Floating Options Panel */}
      {isOpen && (
        <div className="absolute top-[100%] left-0 w-full mt-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-xl overflow-hidden z-40 transform transition-all duration-300 animate-in fade-in slide-in-from-top-2 duration-150 flex flex-col max-h-60">
          
          {/* Inner Search Box */}
          <div className="p-2 border-b border-slate-50 dark:border-slate-800 flex items-center gap-2">
            <Search size={14} className="text-slate-400 flex-shrink-0 ml-1.5" />
            <input
              type="text"
              placeholder="Filter list options..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-transparent border-none text-xs outline-none text-slate-800 dark:text-slate-100 pr-2"
              onClick={(e) => e.stopPropagation()} // Stop click-propagation opening/closing panel
            />
          </div>

          {/* Scrollable list item grid */}
          <div className="overflow-y-auto py-1 flex-grow">
            {filteredOptions.length === 0 ? (
              <div className="px-4 py-3 text-xs text-slate-400 text-center select-none font-semibold">
                No active choices found.
              </div>
            ) : (
              filteredOptions.map((opt) => {
                const isSelected = selectedValues.includes(opt.value);
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => handleToggleOption(opt.value)}
                    className={cn(
                      'w-full text-left px-4 py-2.5 text-xs font-semibold transition-colors duration-150 flex items-center justify-between gap-3 cursor-pointer',
                      isSelected
                        ? 'bg-indigo-50/50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                    )}
                  >
                    <span>{opt.label}</span>
                    {isSelected && <Check size={14} className="text-indigo-600 dark:text-indigo-400 flex-shrink-0" />}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}

      {error && (
        <span className="text-xs text-rose-500 mt-0.5 flex items-center gap-1 font-medium">
          ⚠️ {error}
        </span>
      )}
    </div>
  );
};
