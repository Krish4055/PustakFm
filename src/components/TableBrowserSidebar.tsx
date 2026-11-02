import React, { useState, useMemo } from 'react';
import {
  Table as TableIcon,
  Columns,
  Search,
  ChevronRight,
  ChevronDown,
  RefreshCw,
  X,
  Database,
  Info,
  Sparkles,
  HelpCircle,
} from 'lucide-react';
import { TableSchema } from '../types';

interface TableBrowserSidebarProps {
  tables: TableSchema[];
  isLoading: boolean;
  role: string;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  onRefresh: () => void;
  onInsertText: (text: string) => void;
}

export const TableBrowserSidebar: React.FC<TableBrowserSidebarProps> = ({
  tables,
  isLoading,
  role,
  isOpenMobile,
  onCloseMobile,
  onRefresh,
  onInsertText,
}) => {
  const [search, setSearch] = useState('');
  const [expandedTables, setExpandedTables] = useState<Record<string, boolean>>({
    customers: true,
    orders: true,
  });

  const toggleTable = (tableName: string) => {
    setExpandedTables((prev) => ({
      ...prev,
      [tableName]: !prev[tableName],
    }));
  };

  // Filter tables and columns based on search
  const filteredTables = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return tables;

    return tables
      .map((tbl) => {
        const matchesTable = tbl.name.toLowerCase().includes(query) || (tbl.description && tbl.description.toLowerCase().includes(query));
        const matchedColumns = tbl.columns.filter(
          (col) =>
            col.name.toLowerCase().includes(query) ||
            col.type.toLowerCase().includes(query) ||
            (col.comment && col.comment.toLowerCase().includes(query))
        );

        if (matchesTable || matchedColumns.length > 0) {
          return {
            ...tbl,
            columns: matchesTable ? tbl.columns : matchedColumns,
          };
        }
        return null;
      })
      .filter((t): t is TableSchema => t !== null);
  }, [tables, search]);

  const sidebarContent = (
    <div className="h-full flex flex-col bg-slate-50 dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100">
      {/* Top Header */}
      <div className="p-3.5 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <Database className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Schema Browser
            </h2>
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={onRefresh}
              disabled={isLoading}
              title="Refresh Schema"
              className="p-1 rounded text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 transition cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-blue-500' : ''}`} />
            </button>
            <button
              type="button"
              onClick={onCloseMobile}
              className="p-1 rounded text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 lg:hidden cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Role badge */}
        <div className="flex items-center justify-between text-[11px] mb-2.5">
          <span className="text-slate-500 dark:text-slate-400">Current Role:</span>
          <span className="font-semibold px-2 py-0.5 rounded bg-blue-100 text-blue-800 dark:bg-blue-950/70 dark:text-blue-300 border border-blue-200 dark:border-blue-800/60">
            {role}
          </span>
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tables & columns..."
            className="w-full pl-8 pr-3 py-1.5 bg-white dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-md text-xs placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-900 dark:text-slate-100"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* Tables List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {isLoading && tables.length === 0 ? (
          <div className="p-4 text-center text-xs text-slate-500 dark:text-slate-400 flex flex-col items-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin text-blue-500" />
            <span>Loading MySQL schema...</span>
          </div>
        ) : filteredTables.length === 0 ? (
          <div className="p-4 text-center text-xs text-slate-500 dark:text-slate-400">
            {search ? 'No tables or columns match your search.' : 'No tables assigned to this role.'}
          </div>
        ) : (
          filteredTables.map((tbl) => {
            const isExpanded = search ? true : Boolean(expandedTables[tbl.name]);

            return (
              <div
                key={tbl.name}
                className="rounded-lg border border-transparent hover:border-slate-200 dark:hover:border-slate-800/80 bg-white/50 dark:bg-slate-800/30 transition-colors"
              >
                {/* Table Header Row */}
                <div className="flex items-center justify-between p-2 rounded-lg group">
                  <button
                    type="button"
                    onClick={() => toggleTable(tbl.name)}
                    className="flex items-center gap-1.5 flex-1 text-left cursor-pointer"
                  >
                    {isExpanded ? (
                      <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                    ) : (
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                    )}
                    <TableIcon className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                    <span className="font-mono text-xs font-medium text-slate-800 dark:text-slate-200 truncate">
                      {tbl.name}
                    </span>
                  </button>

                  <div className="flex items-center gap-1">
                    {tbl.rowCountEstimate && (
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                        ~{tbl.rowCountEstimate.toLocaleString()}
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => onInsertText(tbl.name)}
                      title={`Insert table "${tbl.name}" into prompt`}
                      className="opacity-0 group-hover:opacity-100 text-[10px] px-1.5 py-0.5 rounded bg-blue-100 hover:bg-blue-200 dark:bg-blue-950 dark:hover:bg-blue-900 text-blue-700 dark:text-blue-300 font-mono transition cursor-pointer"
                    >
                      + Insert
                    </button>
                  </div>
                </div>

                {/* Columns List (when expanded) */}
                {isExpanded && (
                  <div className="pl-6 pr-2 pb-2 pt-0.5 space-y-1">
                    {tbl.description && (
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 italic mb-1.5 line-clamp-2">
                        {tbl.description}
                      </p>
                    )}
                    {tbl.columns.map((col) => (
                      <div
                        key={col.name}
                        onClick={() => onInsertText(col.name)}
                        title={`${col.comment ? `${col.comment}\n` : ''}Click to insert "${col.name}" into chat input`}
                        className="flex items-center justify-between p-1 rounded hover:bg-blue-50 dark:hover:bg-blue-950/40 cursor-pointer group/col transition"
                      >
                        <div className="flex items-center gap-1.5 min-w-0">
                          <Columns className="w-3 h-3 text-slate-400 group-hover/col:text-blue-500 flex-shrink-0" />
                          <span className="font-mono text-[11px] text-slate-700 dark:text-slate-300 truncate group-hover/col:text-blue-600 dark:group-hover/col:text-blue-400">
                            {col.name}
                          </span>
                        </div>
                        <span className="text-[9px] font-mono text-slate-400 dark:text-slate-500 group-hover/col:text-slate-600 dark:group-hover/col:text-slate-300 px-1 py-0.2 rounded bg-slate-100 dark:bg-slate-800/80 uppercase">
                          {col.type.split(' ')[0]}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Bottom Hint */}
      <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-slate-100/60 dark:bg-slate-900/60 text-[11px] text-slate-500 dark:text-slate-400 flex items-start gap-1.5">
        <Sparkles className="w-3.5 h-3.5 text-blue-500 flex-shrink-0 mt-0.5" />
        <span>Click any table or column name to insert into your chat question.</span>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden lg:block w-72 flex-shrink-0 h-[calc(100vh-3.5rem)] sticky top-14">
        {sidebarContent}
      </aside>

      {/* Mobile Slide-Over Drawer */}
      {isOpenMobile && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={onCloseMobile}
          />
          {/* Drawer container */}
          <div className="fixed inset-y-0 left-0 w-80 max-w-[85vw] shadow-2xl z-10">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
