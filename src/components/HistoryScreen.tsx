import React, { useState, useMemo } from 'react';
import {
  Clock,
  Search,
  RotateCcw,
  Trash2,
  Table as TableIcon,
  CheckCircle2,
  AlertCircle,
  Code2,
  Filter,
  X,
} from 'lucide-react';
import { QueryHistoryItem } from '../types';
import { getHistory, clearHistory } from '../services/storage';

interface HistoryScreenProps {
  currentUserEmail: string;
  onRerunQuery: (question: string) => void;
}

export const HistoryScreen: React.FC<HistoryScreenProps> = ({
  currentUserEmail,
  onRerunQuery,
}) => {
  const [historyItems, setHistoryItems] = useState<QueryHistoryItem[]>(() => getHistory());
  const [search, setSearch] = useState('');
  const [filterUserOnly, setFilterUserOnly] = useState(false);

  const filteredHistory = useMemo(() => {
    let result = [...historyItems];
    if (filterUserOnly) {
      result = result.filter((item) => item.userEmail.toLowerCase() === currentUserEmail.toLowerCase());
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (item) =>
          item.question.toLowerCase().includes(q) ||
          (item.sql && item.sql.toLowerCase().includes(q)) ||
          item.role.toLowerCase().includes(q)
      );
    }

    return result;
  }, [historyItems, search, filterUserOnly, currentUserEmail]);

  const handleClear = () => {
    if (window.confirm('Are you sure you want to clear your local query history?')) {
      clearHistory();
      setHistoryItems([]);
    }
  };

  const formatTimestamp = (ts: number) => {
    const d = new Date(ts);
    return `${d.toLocaleDateString()} ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  };

  return (
    <div className="flex-1 overflow-y-auto h-[calc(100vh-3.5rem)] p-4 sm:p-6 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header & Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <span>Query History</span>
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Search and replay past natural language queries across sessions
            </p>
          </div>

          <div className="flex items-center gap-2">
            {historyItems.length > 0 && (
              <button
                type="button"
                onClick={handleClear}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 border border-red-200 dark:border-red-900/60 transition cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear History</span>
              </button>
            )}
          </div>
        </div>

        {/* Filters & Search */}
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search history by question or SQL..."
              className="w-full pl-9 pr-8 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-slate-100"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => setFilterUserOnly(!filterUserOnly)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition cursor-pointer ${
                filterUserOnly
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Filter className="w-3.5 h-3.5" />
              <span>Only my queries ({currentUserEmail.split('@')[0]})</span>
            </button>
          </div>
        </div>

        {/* History List */}
        {filteredHistory.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 p-12 text-center">
            <Clock className="w-8 h-8 text-slate-400 mx-auto mb-3" />
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              No query history found
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {search
                ? 'No queries matched your search filter.'
                : 'Questions you ask in the chat workspace will automatically appear here.'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredHistory.map((item) => (
              <div
                key={item.id}
                className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    {item.success ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800/60">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Success</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/50 px-2 py-0.5 rounded-full border border-red-200 dark:border-red-800/60">
                        <AlertCircle className="w-3 h-3" />
                        <span>Failed</span>
                      </span>
                    )}

                    <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                      Role: {item.role}
                    </span>

                    {item.rowCount !== undefined && (
                      <span className="text-[11px] font-mono text-slate-500">
                        {item.rowCount} rows
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-[11px] text-slate-400 font-mono">
                      {formatTimestamp(item.timestamp)}
                    </span>
                    <button
                      type="button"
                      onClick={() => onRerunQuery(item.question)}
                      className="flex items-center gap-1 px-3 py-1 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/60 dark:hover:bg-blue-900/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800/60 rounded-lg text-xs font-semibold transition cursor-pointer"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Re-run</span>
                    </button>
                  </div>
                </div>

                <div className="text-sm font-semibold text-slate-900 dark:text-white mb-2">
                  "{item.question}"
                </div>

                {item.sql && (
                  <pre className="p-2.5 rounded-lg bg-slate-950 text-blue-300 font-mono text-[11px] overflow-x-auto border border-slate-800 max-h-24">
                    {item.sql}
                  </pre>
                )}

                <div className="mt-2 text-[10px] text-slate-400 font-mono">
                  User: {item.userEmail}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
