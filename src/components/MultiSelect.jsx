import { useState, useEffect, useRef } from 'react';
import { cn } from '../utils/cn';
import { ChevronDown, X, Check, Search } from 'lucide-react';

export const MultiSelect = ({
  options = [],
  selectedValues = [],
  onChange,
  placeholder = 'Select options...',
  label = '',
  error = '',
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) setIsOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToggleOption = (value) => {
    onChange(selectedValues.includes(value)
      ? selectedValues.filter(v => v !== value)
      : [...selectedValues, value]
    );
  };

  const filteredOptions = options.filter(opt =>
    opt.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className={cn('flex flex-col gap-1.5 w-full relative', className)} ref={containerRef}>
      {label && (
        <span className="text-xs font-semibold text-slate-600 tracking-wide">{label}</span>
      )}

      <div
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'w-full min-h-[42px] px-3.5 py-2 rounded-lg border bg-white flex flex-wrap items-center gap-1.5 cursor-pointer transition-all duration-150 text-sm',
          error ? 'border-red-300' : isOpen ? 'border-blue-500 ring-2 ring-blue-500/10' : 'border-slate-200 hover:border-slate-300'
        )}
      >
        {selectedValues.length === 0 ? (
          <span className="text-slate-400 select-none text-sm">{placeholder}</span>
        ) : (
          <div className="flex flex-wrap gap-1.5 max-w-[90%]">
            {selectedValues.map(val => {
              const opt = options.find(o => o.value === val);
              return (
                <span key={val} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 text-xs font-semibold ring-1 ring-blue-100">
                  {opt ? opt.label : val}
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); onChange(selectedValues.filter(v => v !== val)); }}
                    className="p-0.5 rounded hover:bg-blue-200 text-blue-500 transition-colors cursor-pointer"
                  >
                    <X size={10} />
                  </button>
                </span>
              );
            })}
          </div>
        )}

        <div className="absolute right-3.5 flex items-center gap-1.5 text-slate-400">
          {selectedValues.length > 0 && (
            <button type="button" onClick={(e) => { e.stopPropagation(); onChange([]); }}
              className="p-0.5 rounded hover:bg-slate-100 hover:text-slate-600 transition-colors">
              <X size={13} />
            </button>
          )}
          <ChevronDown size={14} className={cn('transition-transform duration-200', isOpen && 'rotate-180')} />
        </div>
      </div>

      {isOpen && (
        <div className="absolute top-[100%] left-0 w-full mt-1.5 rounded-xl bg-white border border-slate-200 shadow-xl overflow-hidden z-40 flex flex-col max-h-60">
          <div className="p-2 border-b border-slate-100 flex items-center gap-2 bg-slate-50/50">
            <Search size={13} className="text-slate-400 flex-shrink-0 ml-1" />
            <input
              type="text"
              placeholder="Search options..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-transparent border-none text-xs outline-none text-slate-700 placeholder-slate-400"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
          <div className="overflow-y-auto py-1 flex-grow">
            {filteredOptions.length === 0 ? (
              <div className="px-4 py-3 text-xs text-slate-400 text-center font-medium">No options found.</div>
            ) : (
              filteredOptions.map(opt => {
                const isSelected = selectedValues.includes(opt.value);
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => handleToggleOption(opt.value)}
                    className={cn(
                      'w-full text-left px-4 py-2.5 text-xs font-semibold transition-colors duration-100 flex items-center justify-between gap-3 cursor-pointer',
                      isSelected ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-800'
                    )}
                  >
                    <span>{opt.label}</span>
                    {isSelected && <Check size={13} className="text-blue-600 flex-shrink-0" />}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}

      {error && <span className="text-xs text-red-500 font-medium">{error}</span>}
    </div>
  );
};
