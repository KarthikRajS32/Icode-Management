import { useState } from 'react';
import { cn } from '../utils/cn';
import { Button } from './Button';
import { Input } from './Input';
import { Search, ChevronLeft, ChevronRight, Inbox } from 'lucide-react';

/**
 * Reusable Modern Table with search, sorting, and pagination
 */
export const Table = ({
  columns = [], // Array of { key, label, render }
  data = [], // Array of records
  searchPlaceholder = 'Search records...',
  searchKey, // Field name to search by (if search is enabled)
  emptyMessage = 'No records found',
  isLoading = false,
  pageSize = 6,
  className = '',
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // 1. Filter data based on search term
  const filteredData = data.filter(item => {
    if (!searchTerm || !searchKey) return true;
    const value = item[searchKey];
    if (value === undefined || value === null) return false;
    return String(value).toLowerCase().includes(searchTerm.toLowerCase());
  });

  // 2. Pagination calculation
  const totalItems = filteredData.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  
  // Adjust current page if filter shrinks data size
  const activePage = Math.min(currentPage, totalPages);
  
  const startIndex = (activePage - 1) * pageSize;
  const paginatedData = filteredData.slice(startIndex, startIndex + pageSize);

  const handlePageChange = (pageNum) => {
    if (pageNum >= 1 && pageNum <= totalPages) {
      setCurrentPage(pageNum);
    }
  };

  return (
    <div className={cn('flex flex-col gap-4 w-full', className)}>
      {/* Search Header Row */}
      {searchKey && (
        <div className="flex items-center justify-between gap-4">
          <Input
            icon={Search}
            placeholder={searchPlaceholder}
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1); // Reset page on filter
            }}
            className="max-w-md shadow-sm"
          />
          <div className="text-xs text-slate-400 font-medium">
            Showing {filteredData.length === 0 ? 0 : startIndex + 1} to {Math.min(startIndex + pageSize, totalItems)} of {totalItems} items
          </div>
        </div>
      )}

      {/* Main Table Grid Container */}
      <div className="w-full overflow-x-auto bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-2xl shadow-sm">
        <table className="w-full min-w-[600px] border-collapse text-left text-sm text-slate-500">
          <thead className="bg-slate-50/50 dark:bg-slate-800/30 text-slate-600 dark:text-slate-400 uppercase tracking-wider font-semibold text-xs border-b border-slate-100 dark:border-slate-800/50">
            <tr>
              {columns.map((col, index) => (
                <th key={col.key || index} className="px-6 py-4 font-bold">
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
            {isLoading ? (
              <tr>
                <td colSpan={columns.length} className="px-6 py-12 text-center">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <svg className="animate-spin h-8 w-8 text-indigo-600" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span className="text-slate-400 text-xs">Loading records...</span>
                  </div>
                </td>
              </tr>
            ) : paginatedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-6 py-16 text-center">
                  <div className="flex flex-col items-center justify-center gap-3 text-slate-400">
                    <div className="p-3 bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-500 rounded-full">
                      <Inbox size={28} />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-600 dark:text-slate-300 text-sm">{emptyMessage}</p>
                      {searchTerm && <p className="text-xs text-slate-400 mt-1">Try modifying your search filter.</p>}
                    </div>
                  </div>
                </td>
              </tr>
            ) : (
              paginatedData.map((row, rowIndex) => (
                <tr
                  key={row.id || rowIndex}
                  className="hover:bg-slate-50/30 dark:hover:bg-slate-800/10 transition-colors duration-200"
                >
                  {columns.map((col, colIndex) => (
                    <td key={colIndex} className="px-6 py-4.5 text-slate-700 dark:text-slate-200">
                      {col.render ? col.render(row, rowIndex) : row[col.key]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Row */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between gap-4 mt-1 px-1">
          <div className="text-xs text-slate-400 font-medium">
            Page {activePage} of {totalPages}
          </div>
          <div className="flex items-center gap-1.5">
            <Button
              variant="secondary"
              size="sm"
              disabled={activePage === 1}
              onClick={() => handlePageChange(activePage - 1)}
              className="p-1.5 rounded-lg"
            >
              <ChevronLeft size={16} />
            </Button>
            
            {Array.from({ length: totalPages }).map((_, idx) => {
              const pageNum = idx + 1;
              const isCurrent = pageNum === activePage;
              return (
                <Button
                  key={idx}
                  variant={isCurrent ? 'primary' : 'secondary'}
                  size="sm"
                  onClick={() => handlePageChange(pageNum)}
                  className={cn(
                    'w-8 h-8 p-0 rounded-lg text-xs font-semibold',
                    !isCurrent && 'hover:bg-slate-200 dark:hover:bg-slate-700'
                  )}
                >
                  {pageNum}
                </Button>
              );
            })}

            <Button
              variant="secondary"
              size="sm"
              disabled={activePage === totalPages}
              onClick={() => handlePageChange(activePage + 1)}
              className="p-1.5 rounded-lg"
            >
              <ChevronRight size={16} />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
