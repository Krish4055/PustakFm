import React, { useState } from 'react';
import {
  ThumbsUp,
  ThumbsDown,
  Bookmark,
  AlertCircle,
  Sparkles,
  User,
  Clock,
  RotateCcw,
  CheckCircle2,
  Database,
  Info,
} from 'lucide-react';
import { ChatMessage } from '../types';
import { SqlCodeBlock } from './SqlCodeBlock';
import { ResultsTable } from './ResultsTable';
import { SaveQueryModal } from './SaveQueryModal';

interface ChatMessageItemProps {
  message: ChatMessage;
  userEmail: string;
  onRerun: (question: string) => void;
  onRunEditedSql: (sql: string) => void;
  onUpdateFeedback: (messageId: string, feedback: 'up' | 'down', note?: string) => void;
}

export const ChatMessageItem: React.FC<ChatMessageItemProps> = ({
  message,
  userEmail,
  onRerun,
  onRunEditedSql,
  onUpdateFeedback,
}) => {
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [showFeedbackNoteInput, setShowFeedbackNoteInput] = useState(false);
  const [feedbackNote, setFeedbackNote] = useState('');

  const isUser = message.role === 'user';

  const handleFeedback = (type: 'up' | 'down') => {
    onUpdateFeedback(message.id, type);
    if (type === 'down') {
      setShowFeedbackNoteInput(true);
    } else {
      setShowFeedbackNoteInput(false);
    }
  };

  const handleSaveNote = () => {
    if (feedbackNote.trim()) {
      onUpdateFeedback(message.id, 'down', feedbackNote.trim());
      setShowFeedbackNoteInput(false);
    }
  };

  const formatTime = (ts: number) => {
    const d = new Date(ts);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (isUser) {
    return (
      <div className="flex justify-end my-4 px-2 sm:px-4">
        <div className="max-w-[85%] sm:max-w-[75%] rounded-2xl bg-blue-600 text-white p-3.5 sm:p-4 shadow-md group">
          <div className="flex items-center justify-between gap-4 mb-1">
            <span className="text-[11px] font-medium text-blue-200">You</span>
            <div className="flex items-center gap-1.5 opacity-80 group-hover:opacity-100 transition">
              <span className="text-[10px] text-blue-200">{formatTime(message.timestamp)}</span>
              <button
                type="button"
                onClick={() => onRerun(message.content)}
                title="Re-run this query"
                className="p-1 rounded hover:bg-blue-700/60 transition cursor-pointer"
              >
                <RotateCcw className="w-3 h-3 text-blue-200" />
              </button>
            </div>
          </div>
          <div className="text-sm font-medium leading-relaxed whitespace-pre-wrap select-text">
            {message.content}
          </div>
        </div>
      </div>
    );
  }

  // Assistant Message
  return (
    <div className="flex justify-start my-4 px-2 sm:px-4">
      <div className="w-full max-w-4xl rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 sm:p-5 shadow-sm text-slate-900 dark:text-slate-100">
        {/* Assistant Header */}
        <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-slate-100 dark:border-slate-800/80">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-blue-600 flex items-center justify-center text-white shadow-xs">
              <Database className="w-3.5 h-3.5" />
            </div>
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
              AskDB Engine
            </span>
            <span className="text-[10px] text-slate-400 font-mono hidden sm:inline">
              via n8n webhook
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Clock className="w-3 h-3" />
            <span>{formatTime(message.timestamp)}</span>
          </div>
        </div>

        {/* Error State Banner */}
        {message.error && (
          <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-red-800 dark:text-red-300 mb-3 text-xs">
            <div className="flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
              <div className="space-y-1">
                <div className="font-semibold">Query Execution Error</div>
                <div className="font-mono text-[11px] leading-relaxed break-words">{message.error}</div>
                <div className="text-[11px] text-red-700 dark:text-red-400 pt-1">
                  Tip: Check the schema sidebar for available table names and columns, or rephrase your question.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Explanation text banner */}
        {message.content && !message.error && (
          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-200 mb-2">
            <Sparkles className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
            <div className="leading-relaxed">{message.content}</div>
          </div>
        )}

        {/* Collapsible, Syntax-highlighted SQL block */}
        {message.sql && (
          <SqlCodeBlock
            sql={message.sql}
            onRunEditedSql={onRunEditedSql}
          />
        )}

        {/* Results Table (sortable, sticky header, scroll, row count, CSV export) */}
        {message.rows && message.columns && (
          <ResultsTable
            columns={message.columns}
            rows={message.rows}
            rowCount={message.rowCount}
          />
        )}

        {/* Action bar: Save Query & Feedback Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-3 mt-2 border-t border-slate-100 dark:border-slate-800/80 text-xs">
          <div className="flex items-center gap-2">
            {message.sql && (
              <button
                type="button"
                onClick={() => setIsSaveModalOpen(true)}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer font-medium"
              >
                <Bookmark className="w-3.5 h-3.5" />
                <span>Save Query</span>
              </button>
            )}
          </div>

          {/* Feedback buttons */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] text-slate-400 hidden sm:inline mr-1">
              Helpful result?
            </span>
            <button
              type="button"
              onClick={() => handleFeedback('up')}
              title="Helpful result"
              className={`p-1.5 rounded-lg transition cursor-pointer ${
                message.feedback === 'up'
                  ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800'
                  : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <ThumbsUp className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={() => handleFeedback('down')}
              title="Report issue or incorrect query"
              className={`p-1.5 rounded-lg transition cursor-pointer ${
                message.feedback === 'down'
                  ? 'bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400 border border-rose-300 dark:border-rose-800'
                  : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <ThumbsDown className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Optional note prompt on thumbs down */}
        {showFeedbackNoteInput && (
          <div className="mt-2.5 p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex gap-2 items-center">
            <input
              type="text"
              value={feedbackNote}
              onChange={(e) => setFeedbackNote(e.target.value)}
              placeholder="What could be improved? (e.g. wrong join, missing column)"
              className="flex-1 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded px-2.5 py-1 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <button
              type="button"
              onClick={handleSaveNote}
              className="px-2.5 py-1 bg-slate-700 hover:bg-slate-600 text-white text-xs font-medium rounded transition cursor-pointer"
            >
              Submit
            </button>
          </div>
        )}

        {/* Save Query Modal */}
        {message.sql && (
          <SaveQueryModal
            isOpen={isSaveModalOpen}
            onClose={() => setIsSaveModalOpen(false)}
            question={message.content}
            sql={message.sql}
            explanation={message.content}
            userEmail={userEmail}
            onSaved={() => {}}
          />
        )}
      </div>
    </div>
  );
};
