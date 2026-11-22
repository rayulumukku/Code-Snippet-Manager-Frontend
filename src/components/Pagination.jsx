import React from 'react';
import { FiChevronLeft, FiChevronRight, FiChevronsLeft, FiChevronsRight } from 'react-icons/fi';

/**
 * Calculates sliding window pagination items with ellipses.
 * Range: [currentPage - 2, currentPage + 2] bounded by 1 and totalPages.
 * Includes direct jumps to first and last pages with '...' indicators.
 */
export const getPaginationRange = (currentPage, totalPages) => {
  if (!totalPages || totalPages <= 0) return [];
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const start = Math.max(1, currentPage - 2);
  const end = Math.min(totalPages, currentPage + 2);

  const pages = [];

  if (start > 1) {
    pages.push(1);
    if (start > 2) {
      pages.push('...');
    }
  }

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  if (end < totalPages) {
    if (end < totalPages - 1) {
      pages.push('...');
    }
    pages.push(totalPages);
  }

  return pages;
};

const Pagination = ({ currentPage = 1, totalPages = 1, onPageChange, className = '' }) => {
  if (totalPages <= 1) return null;

  const items = getPaginationRange(currentPage, totalPages);

  return (
    <nav
      aria-label="Pagination Navigation"
      className={`flex flex-wrap items-center justify-center gap-1.5 ${className}`}
    >
      {/* First Page button */}
      <button
        type="button"
        onClick={() => onPageChange(1)}
        disabled={currentPage <= 1}
        aria-label="First page"
        title="First page"
        className="p-2 rounded-xl border border-slate-200 dark:border-custom-dark-border bg-white dark:bg-custom-dark-card text-slate-700 dark:text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-custom-dark-surface transition-colors text-sm"
      >
        <FiChevronsLeft className="w-4 h-4" />
      </button>

      {/* Previous Page button */}
      <button
        type="button"
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage <= 1}
        aria-label="Previous page"
        className="px-3 py-2 rounded-xl border border-slate-200 dark:border-custom-dark-border bg-white dark:bg-custom-dark-card text-slate-700 dark:text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-custom-dark-surface transition-colors flex items-center gap-1 text-sm font-medium"
      >
        <FiChevronLeft className="w-4 h-4" />
        <span className="hidden sm:inline">Prev</span>
      </button>

      {/* Page numbers & ellipses */}
      <div className="flex items-center gap-1">
        {items.map((item, idx) => {
          if (item === '...') {
            return (
              <span
                key={`ellipsis-${idx}`}
                className="w-9 h-9 flex items-center justify-center text-sm font-semibold text-slate-400 dark:text-slate-500 select-none"
              >
                …
              </span>
            );
          }

          const pageNum = Number(item);
          const isActive = pageNum === currentPage;

          return (
            <button
              key={`page-${pageNum}`}
              type="button"
              onClick={() => onPageChange(pageNum)}
              aria-current={isActive ? 'page' : undefined}
              className={`w-9 h-9 rounded-xl text-sm font-semibold transition-all duration-150 ${
                isActive
                  ? 'gradient-bg text-white shadow-md shadow-orange-500/20 scale-105'
                  : 'border border-slate-200 dark:border-custom-dark-border bg-white dark:bg-custom-dark-card text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-custom-dark-surface'
              }`}
            >
              {pageNum}
            </button>
          );
        })}
      </div>

      {/* Next Page button */}
      <button
        type="button"
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage >= totalPages}
        aria-label="Next page"
        className="px-3 py-2 rounded-xl border border-slate-200 dark:border-custom-dark-border bg-white dark:bg-custom-dark-card text-slate-700 dark:text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-custom-dark-surface transition-colors flex items-center gap-1 text-sm font-medium"
      >
        <span className="hidden sm:inline">Next</span>
        <FiChevronRight className="w-4 h-4" />
      </button>

      {/* Last Page button */}
      <button
        type="button"
        onClick={() => onPageChange(totalPages)}
        disabled={currentPage >= totalPages}
        aria-label="Last page"
        title="Last page"
        className="p-2 rounded-xl border border-slate-200 dark:border-custom-dark-border bg-white dark:bg-custom-dark-card text-slate-700 dark:text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-custom-dark-surface transition-colors text-sm"
      >
        <FiChevronsRight className="w-4 h-4" />
      </button>
    </nav>
  );
};

export default Pagination;
