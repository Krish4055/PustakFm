import React, { useState } from 'react';
import { Copy, Check, ChevronDown, ChevronUp, Code2, Edit2, Play, X } from 'lucide-react';

interface SqlCodeBlockProps {
  sql: string;
  onRunEditedSql?: (newSql: string) => void;
}

export const SqlCodeBlock: React.FC<SqlCodeBlockProps> = ({ sql, onRunEditedSql }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editableSql, setEditableSql] = useState(sql);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(isEditing ? editableSql : sql);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy SQL:', err);
    }
  };

  const handleRun = () => {
    if (onRunEditedSql && editableSql.trim()) {
      onRunEditedSql(editableSql.trim());
      setIsEditing(false);
    }
  };

  // Syntax highlighting for SQL
  const renderHighlightedSql = (codeText: string) => {
    const keywords = [
      'SELECT', 'FROM', 'WHERE', 'JOIN', 'LEFT JOIN', 'RIGHT JOIN', 'INNER JOIN',
      'GROUP BY', 'ORDER BY', 'HAVING', 'LIMIT', 'OFFSET', 'AS', 'ON', 'AND', 'OR',
      'NOT', 'IN', 'IS NULL', 'IS NOT NULL', 'BETWEEN', 'LIKE', 'DESC', 'ASC',
      'CASE', 'WHEN', 'THEN', 'ELSE', 'END', 'COALESCE', 'COUNT', 'SUM', 'AVG',
      'ROUND', 'DATEDIFF', 'DATE_SUB', 'CURDATE', 'INTERVAL', 'DISTINCT'
    ];

    // Escape regex characters
    const keywordPattern = new RegExp(`\\b(${keywords.join('|')})\\b`, 'gi');

    const lines = codeText.split('\n');

    return lines.map((line, lineIdx) => {
      // Split line into tokens preserving formatting
      const parts = line.split(keywordPattern);
      return (
        <div key={lineIdx} className="table-row font-mono text-xs">
          <span className="table-cell pr-4 select-none text-slate-500 text-right opacity-50">
            {lineIdx + 1}
          </span>
          <span className="table-cell whitespace-pre">
            {parts.map((part, pIdx) => {
              const upper = part.toUpperCase();
              if (keywords.includes(upper)) {
                return (
                  <span key={pIdx} className="text-blue-400 font-semibold">
                    {part}
                  </span>
                );
              }
              // Check if part contains numbers
              if (/^\d+(\.\d+)?$/.test(part.trim())) {
                return <span key={pIdx} className="text-emerald-400">{part}</span>;
              }
              // Check if part is a string literal
              if (/^'[^']*'$/.test(part.trim())) {
                return <span key={pIdx} className="text-amber-300">{part}</span>;
              }
              return <span key={pIdx} className="text-slate-200">{part}</span>;
            })}
          </span>
        </div>
      );
    });
  };

  return (
    <div className="rounded-xl border border-slate-700/80 bg-slate-950 overflow-hidden shadow-md my-2.5">
      {/* Top toolbar */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-slate-900 border-b border-slate-800 text-xs">
        <div className="flex items-center gap-2">
          <Code2 className="w-3.5 h-3.5 text-blue-400" />
          <span className="font-mono text-[11px] font-semibold text-slate-300">
            Generated MySQL
          </span>
          <span className="text-[10px] text-slate-500 font-mono hidden sm:inline">
            Read-only
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          {!isEditing ? (
            <>
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-1 px-2 py-0.5 rounded text-slate-300 hover:text-white hover:bg-slate-800 transition text-[11px] cursor-pointer"
              >
                <Edit2 className="w-3 h-3 text-slate-400" />
                <span>Edit</span>
              </button>

              <button
                type="button"
                onClick={handleCopy}
                className="flex items-center gap-1 px-2 py-0.5 rounded text-slate-300 hover:text-white hover:bg-slate-800 transition text-[11px] cursor-pointer"
              >
                {isCopied ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-400" />
                    <span className="text-emerald-400">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3 text-slate-400" />
                    <span>Copy</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
                title={isCollapsed ? 'Expand SQL' : 'Collapse SQL'}
              >
                {isCollapsed ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={handleRun}
                className="flex items-center gap-1 px-2.5 py-0.5 rounded bg-blue-600 hover:bg-blue-500 text-white font-medium text-[11px] shadow-sm transition cursor-pointer"
              >
                <Play className="w-3 h-3 fill-current" />
                <span>Run</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setEditableSql(sql);
                  setIsEditing(false);
                }}
                className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
                title="Cancel Edit"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Code / Editor content */}
      {!isCollapsed && (
        <div className="p-3 overflow-x-auto text-slate-200">
          {isEditing ? (
            <textarea
              value={editableSql}
              onChange={(e) => setEditableSql(e.target.value)}
              rows={Math.max(4, editableSql.split('\n').length + 1)}
              className="w-full bg-slate-900 text-blue-300 font-mono text-xs p-2.5 rounded border border-blue-500/50 focus:outline-none focus:ring-1 focus:ring-blue-500"
              spellCheck={false}
            />
          ) : (
            <div className="table w-full font-mono">{renderHighlightedSql(sql)}</div>
          )}
        </div>
      )}
    </div>
  );
};
