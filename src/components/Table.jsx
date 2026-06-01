import { useState } from 'react';
import { cn } from '../utils/cn';
import { Button } from './Button';
import { Input } from './Input';
import { Search, ChevronLeft, ChevronRight, Inbox } from 'lucide-react';

export const Table = ({
  columns = [], data = [], searchPlaceholder = 'Search...', searchKey,
  emptyMessage = 'No records found', isLoading = false, pageSize = 6, className = '',
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const filtered = data.filter(item => {
    if (!searchTerm || !searchKey) return true;
    const val = item[searchKey];
    return val != null && String(val).toLowerCase().includes(searchTerm.toLowerCase());
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const activePage = Math.min(currentPage, totalPages);
  const start = (activePage - 1) * pageSize;
  const paginated = filtered.slice(start, start + pageSize);

  return (
    <div className={cn('flex flex-col gap-4', className)}>
      {searchKey && (
        <div className="flex items-center justify-between gap-4">
          <Input
            icon={Search} placeholder={searchPlaceholder} value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            className="max-w-xs"
          />
          <span className="text-xs text-gray-400">
            {filtered.length === 0 ? '0' : `${start + 1}–${Math.min(start + pageSize, filtered.length)}`} of {filtered.length}
          </span>
        </div>
      )}

      <div className="w-full overflow-x-auto rounded-xl border border-gray-100 bg-white">
        <table className="w-full min-w-[560px] text-sm text-left">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              {columns.map((col, i) => (
                <th key={col.key || i} className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {isLoading ? (
              <tr><td colSpan={columns.length} className="px-5 py-12 text-center">
                <div className="flex justify-center">
                  <svg className="animate-spin h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                </div>
              </td></tr>
            ) : paginated.length === 0 ? (
              <tr><td colSpan={columns.length} className="px-5 py-14 text-center">
                <div className="flex flex-col items-center gap-2 text-gray-400">
                  <Inbox size={24} className="text-gray-300" />
                  <p className="text-sm font-medium text-gray-500">{emptyMessage}</p>
                  {searchTerm && <p className="text-xs text-gray-400">Try a different search term.</p>}
                </div>
              </td></tr>
            ) : (
              paginated.map((row, ri) => (
                <tr key={row.id || ri} className="hover:bg-gray-50/60 transition-colors">
                  {columns.map((col, ci) => (
                    <td key={ci} className="px-5 py-3.5 text-gray-700">
                      {col.render ? col.render(row, ri) : row[col.key]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between px-1">
          <span className="text-xs text-gray-400">Page {activePage} of {totalPages}</span>
          <div className="flex items-center gap-1">
            <Button variant="secondary" size="sm" disabled={activePage === 1}
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))} className="w-8 h-8 p-0">
              <ChevronLeft size={14} />
            </Button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
              <Button key={p} size="sm"
                variant={p === activePage ? 'primary' : 'secondary'}
                onClick={() => setCurrentPage(p)}
                className="w-8 h-8 p-0 text-xs">
                {p}
              </Button>
            ))}
            <Button variant="secondary" size="sm" disabled={activePage === totalPages}
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} className="w-8 h-8 p-0">
              <ChevronRight size={14} />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
