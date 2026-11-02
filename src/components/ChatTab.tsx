import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Plus,
  Sparkles,
  Shield,
  Info,
  RotateCcw,
  RefreshCw,
  SlidersHorizontal,
  ChevronRight,
  Database,
  ArrowRight,
} from 'lucide-react';
import { ChatMessage, UserSession } from '../types';
import { sendChatQuery } from '../services/api';
import { addToHistory, getPersistedMessages, persistMessages } from '../services/storage';
import { ChatMessageItem } from './ChatMessageItem';

interface ChatTabProps {
  user: UserSession;
  insertedText: string;
  onClearInsertedText: () => void;
  onOpenSettings: () => void;
  isDemoMode: boolean;
}

export const ChatTab: React.FC<ChatTabProps> = ({
  user,
  insertedText,
  onClearInsertedText,
  onOpenSettings,
  isDemoMode,
}) => {
  // Generate stable session id per chat session
  const [sessionId, setSessionId] = useState<string>(() => {
    return `session_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  });

  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const saved = getPersistedMessages(sessionId);
    return saved.length > 0 ? saved : [];
  });

  const [inputQuestion, setInputQuestion] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // When text is clicked from sidebar (table or column name), insert it into prompt
  useEffect(() => {
    if (insertedText) {
      setInputQuestion((prev) => {
        if (!prev) return insertedText;
        // If ends with a space, append, else add space then text
        return prev.endsWith(' ') ? `${prev}${insertedText}` : `${prev} ${insertedText}`;
      });
      onClearInsertedText();
      textareaRef.current?.focus();
    }
  }, [insertedText, onClearInsertedText]);

  // Persist messages whenever updated
  useEffect(() => {
    if (messages.length > 0) {
      persistMessages(sessionId, messages);
    }
  }, [messages, sessionId]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Start a fresh chat with a new stable session_id
  const handleNewChat = () => {
    const newId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    setSessionId(newId);
    setMessages([]);
    setInputQuestion('');
    textareaRef.current?.focus();
  };

  const handleSend = async (questionOverride?: string) => {
    const textToSend = (questionOverride || inputQuestion).trim();
    if (!textToSend || isLoading) return;

    const userMessage: ChatMessage = {
      id: `msg_${Date.now()}_u`,
      role: 'user',
      content: textToSend,
      timestamp: Date.now(),
      sessionId,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputQuestion('');
    setIsLoading(true);

    try {
      const response = await sendChatQuery({
        question: textToSend,
        role: user.role,
        session_id: sessionId,
        user_email: user.email,
      });

      const assistantMessage: ChatMessage = {
        id: `msg_${Date.now()}_a`,
        role: 'assistant',
        content: response.explanation || (response.ok ? 'Query completed.' : ''),
        timestamp: Date.now(),
        sessionId,
        sql: response.sql,
        rowCount: response.rowCount,
        columns: response.columns,
        rows: response.rows,
        error: response.ok ? undefined : (response.error || 'Unknown query error'),
        feedback: null,
      };

      setMessages((prev) => [...prev, assistantMessage]);

      // Add to query history
      addToHistory({
        sessionId,
        question: textToSend,
        sql: response.sql,
        rowCount: response.rowCount,
        userEmail: user.email,
        role: user.role,
        success: response.ok,
      });
    } catch (err: any) {
      const errMessage: ChatMessage = {
        id: `msg_${Date.now()}_err`,
        role: 'assistant',
        content: '',
        timestamp: Date.now(),
        sessionId,
        error: err.message || 'An unexpected network error occurred.',
        feedback: null,
      };
      setMessages((prev) => [...prev, errMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleUpdateFeedback = (messageId: string, feedback: 'up' | 'down', note?: string) => {
    setMessages((prev) =>
      prev.map((m) =>
        m.id === messageId
          ? { ...m, feedback, feedbackNote: note ?? m.feedbackNote }
          : m
      )
    );
  };

  // Example starter prompt chips based on role
  const promptSuggestions =
    user.role === 'Finance'
      ? [
          'Show overdue invoices and days overdue',
          'Summarize revenue by fiscal quarter',
          'Break down MRR across subscription tiers',
          'now only for last month',
        ]
      : user.role === 'Sales'
      ? [
          'Top 10 customers by revenue and tier',
          'now only for last month',
          'group that by city',
          'Sales reps quarterly quota attainment',
        ]
      : [
          'Top 10 customers by revenue and tier',
          'now only for last month',
          'group that by city',
          'Show low inventory products needing reorder',
        ];

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-3.5rem)] overflow-hidden bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      {/* Top Banner: Read-Only Safety Notice & New Chat Button */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xs text-xs">
        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
          <Shield className="w-3.5 h-3.5 text-blue-500" />
          <span className="font-medium text-[11px] sm:text-xs">
            Queries are read-only and limited to 100 rows. MySQL transactions never execute directly in browser.
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleNewChat}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/60 dark:hover:bg-blue-900/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/60 font-medium text-xs transition cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Chat</span>
          </button>
        </div>
      </div>

      {/* Messages Scroll Container */}
      <div className="flex-1 overflow-y-auto p-2 sm:p-4 space-y-2">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center max-w-2xl mx-auto px-4 text-center my-auto py-12">
            <div className="w-14 h-14 rounded-2xl bg-blue-600/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-4 border border-blue-500/20">
              <Database className="w-7 h-7" />
            </div>

            <h2 className="text-xl sm:text-2xl font-bold tracking-tight mb-2">
              Ask your MySQL database in plain English
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-lg mb-6 leading-relaxed">
              AskDB translates natural questions into safe, optimized read-only MySQL queries via n8n webhooks. Click any table in the sidebar to explore.
            </p>

            {/* Starter Suggestion Chips */}
            <div className="w-full text-left">
              <div className="text-[11px] font-semibold tracking-wider text-slate-400 uppercase mb-2 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-blue-500" />
                <span>Suggested queries for {user.role}:</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {promptSuggestions.map((prompt, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSend(prompt)}
                    className="p-3 text-left rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-500 dark:hover:border-blue-500/80 shadow-xs hover:shadow-md transition text-xs flex items-center justify-between group cursor-pointer"
                  >
                    <span className="font-medium text-slate-800 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                      {prompt}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-500 group-hover:translate-x-0.5 transition-transform flex-shrink-0 ml-2" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          messages.map((msg) => (
            <ChatMessageItem
              key={msg.id}
              message={msg}
              userEmail={user.email}
              onRerun={(q) => handleSend(q)}
              onRunEditedSql={(sql) => handleSend(`Run query: ${sql}`)}
              onUpdateFeedback={handleUpdateFeedback}
            />
          ))
        )}

        {/* Typing indicator */}
        {isLoading && (
          <div className="flex justify-start my-4 px-2 sm:px-4">
            <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 shadow-sm flex items-center gap-3">
              <div className="w-6 h-6 rounded-md bg-blue-600 flex items-center justify-center text-white">
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              </div>
              <div>
                <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                  <span>Generating SQL & querying MySQL...</span>
                  <span className="flex gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-bounce"></span>
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-bounce [animation-delay:0.2s]"></span>
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-bounce [animation-delay:0.4s]"></span>
                  </span>
                </div>
                <div className="text-[10px] text-slate-400 font-mono">
                  POST /sql-chat (session: {sessionId.slice(0, 14)}...)
                </div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-3 sm:p-4 border-t border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md">
        {/* Quick Follow-up Suggestions when conversation is active */}
        {messages.length > 0 && !isLoading && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 text-xs scrollbar-none">
            <span className="text-[10px] text-slate-400 font-medium whitespace-nowrap">
              Try follow-up:
            </span>
            {['now only for last month', 'group that by city', 'sort by highest revenue', 'filter by status completed'].map(
              (chip, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSend(chip)}
                  className="whitespace-nowrap px-2.5 py-1 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-[11px] border border-slate-200 dark:border-slate-700 transition cursor-pointer"
                >
                  "{chip}"
                </button>
              )
            )}
          </div>
        )}

        <div className="relative rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent transition shadow-xs">
          <textarea
            ref={textareaRef}
            rows={2}
            value={inputQuestion}
            onChange={(e) => setInputQuestion(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`Ask a question in plain English (e.g., "Top 10 customers by revenue")...`}
            className="w-full bg-transparent px-4 py-3 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none resize-none font-sans"
          />

          <div className="flex items-center justify-between px-3 pb-2.5">
            <div className="text-[10px] text-slate-400 flex items-center gap-2">
              <span className="hidden sm:inline">Press <kbd className="font-mono bg-slate-200 dark:bg-slate-800 px-1 py-0.5 rounded">Enter</kbd> to send, <kbd className="font-mono bg-slate-200 dark:bg-slate-800 px-1 py-0.5 rounded">Shift+Enter</kbd> for new line</span>
            </div>

            <button
              type="button"
              onClick={() => handleSend()}
              disabled={!inputQuestion.trim() || isLoading}
              className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-300 dark:disabled:bg-slate-800 disabled:text-slate-400 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm transition cursor-pointer disabled:cursor-not-allowed"
            >
              <span>Ask</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
