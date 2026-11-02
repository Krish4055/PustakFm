import React, { useState, useMemo } from 'react';
import {
  Download,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Search,
  Table as TableIcon,
  X,
  FileSpreadsheet,
} from 'lucide-react';

interface ResultsTableProps {
  columns: string[];
  rows: Record<string, any>[];
  rowCount?: number;
  tableNameSuggestion?: string;
}

export const ResultsTable: React.FC<ResultsTableProps> = ({
  columns,
  rows,
  rowCount,
  tableNameSuggestion = 'results',
}) => {
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc' | null>(null);
  const [filterText, setFilterText] = useState('');

  // Handle column header click for sorting
  const handleSort = (col: string) => {
    if (sortColumn !== col) {
      setSortColumn(col);
      setSortDirection('asc');
    } else if (sortDirection === 'asc') {
      setSortDirection('desc');
    } else {
      setSortColumn(null);
      setSortDirection(null);
    }
  };

  // Filter and sort rows
  const processedRows = useMemo(() => {
    let result = [...rows];

    // 1. Text filter
    if (filterText.trim()) {
      const q = filterText.toLowerCase();
      result = result.filter((row) =>
        Object.values(row).some((val) =>
          String(val ?? '').toLowerCase().includes(q)
        )
      );
    }

    // 2. Sort
    if (sortColumn && sortDirection) {
      result.sort((a, b) => {
        const valA = a[sortColumn];
        const valB = b[sortColumn];

        if (valA === valB) return 0;
        if (valA == null) return 1;
        if (valB == null) return -1;

        // Numeric comparison if numbers
        const numA = Number(valA);
        const numB = Number(valB);
        if (!isNaN(numA) && !isNaN(numB)) {
          return sortDirection === 'asc' ? numA - numB : numB - numA;
        }

        // String comparison
        const strA = String(valA).toLowerCase();
        const strB = String(valB).toLowerCase();
        if (strA < strB) return sortDirection === 'asc' ? -1 : 1;
        if (strA > strB) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [rows, filterText, sortColumn, sortDirection]);

  // Export CSV functionality
  const handleExportCsv = () => {
    if (rows.length === 0 || columns.length === 0) return;

    const escapeCsvValue = (value: any): string => {
      if (value == null) return '""';
      const str = String(value);
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return `"${str}"`;
    };

    const headerLine = columns.map(escapeCsvValue).join(',');
    const rowLines = processedRows.map((row) =>
      columns.map((col) => escapeCsvValue(row[col])).join(',')
    );

    const csvContent = [headerLine, ...rowLines].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute(
      'download',
      `askdb-${tableNameSuggestion}-${Date.now().toString().slice(-6)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const totalCount = rowCount ?? rows.length;

  if (columns.length === 0 || rows.length === 0) {
    return (
      <div className="p-6 text-center text-xs text-slate-500 dark:text-slate-400 bg-slate-100/50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-800 my-2">
        Query completed with 0 rows returned.
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 shadow-sm overflow-hidden my-3">
      {/* Table Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-700 dark:text-slate-300">
            <TableIcon className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>Results</span>
          </span>
          <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 px-1.5 py-0.5 rounded bg-slate-200/60 dark:bg-slate-800">
            {filterText
              ? `${processedRows.length} of ${totalCount} rows`
              : `${totalCount} rows`}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Quick filter inside results */}
          <div className="relative">
            <Search className="w-3 h-3 absolute left-2 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              placeholder="Filter results..."
              className="pl-6 pr-5 py-1 text-xs rounded-md bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 w-32 sm:w-40"
            />
            {filterText && (
              <button
                type="button"
                onClick={() => setFilterText('')}
                className="absolute right-1.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Export CSV Button */}
          <button
            type="button"
            onClick={handleExportCsv}
            title="Download table data as CSV"
            className="flex items-center gap-1.5 px-2.5 py-1 bg-white hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 rounded-md text-xs font-medium text-slate-700 dark:text-slate-200 transition cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>
        </div>
      </div>

      {/* Horizontal Scroll Table with Sticky Header */}
      <div className="overflow-x-auto max-h-[440px] relative">
        <table className="w-full text-left text-xs border-collapse">
          {/* Sticky Table Header */}
          <thead className="sticky top-0 z-10 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 shadow-xs">
            <tr>
              <th className="py-2 px-3 text-[10px] font-semibold tracking-wider uppercase border-b border-slate-200 dark:border-slate-700 w-10 text-slate-400 select-none">
                #
              </th>
              {columns.map((col) => {
                const isSorted = sortColumn === col;
                return (
                  <th
                    key={col}
                    onClick={() => handleSort(col)}
                    className="py-2 px-3 font-mono text-[11px] font-semibold border-b border-slate-200 dark:border-slate-700 whitespace-nowrap cursor-pointer hover:bg-slate-200/70 dark:hover:bg-slate-700/70 transition select-none group"
                  >
                    <div className="flex items-center gap-1.5">
                      <span>{col}</span>
                      <span className="text-slate-400 group-hover:text-blue-500">
                        {isSorted ? (
                          sortDirection === 'asc' ? (
                            <ArrowUp className="w-3 h-3 text-blue-500" />
                          ) : (
                            <ArrowDown className="w-3 h-3 text-blue-500" />
                          )
                        ) : (
                          <ArrowUpDown className="w-2.5 h-2.5 opacity-40 group-hover:opacity-100" />
                        )}
                      </span>
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>

          {/* Table Body */}
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 font-mono">
            {processedRows.map((row, idx) => (
              <tr
                key={idx}
                className="hover:bg-blue-50/40 dark:hover:bg-slate-800/40 transition-colors"
              >
                <td className="py-2 px-3 text-[10px] text-slate-400 select-none">
                  {idx + 1}
                </td>
                {columns.map((col) => {
                  const val = row[col];
                  const isNumber = typeof val === 'number';
                  const isDate =
                    typeof val === 'string' &&
                    /^\d{4}-\d{2}-\d{2}/.test(val);

                  return (
                    <td
                      key={col}
                      className={`py-2 px-3 whitespace-nowrap text-slate-800 dark:text-slate-200 ${
                        isNumber ? 'text-right' : 'text-left'
                      }`}
                    >
                      {val == null ? (
                        <span className="text-slate-400 italic font-sans text-[11px]">NULL</span>
                      ) : isNumber ? (
                        typeof val === 'number' && val % 1 !== 0
                          ? val.toLocaleString(undefined, {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })
                          : val.toLocaleString()
                      ) : (
                        String(val)
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
