import React, { useState, useMemo } from 'react';
import {
  BookmarkCheck,
  Search,
  RotateCcw,
  Users,
  Lock,
  Trash2,
  Plus,
  Tag,
  Share2,
  Calendar,
  Sparkles,
  Play,
  X,
} from 'lucide-react';
import { SavedQuery } from '../types';
import {
  getSavedQueries,
  deleteSavedQuery,
  toggleQueryTeamSharing,
  saveQuery,
} from '../services/storage';

interface SavedQueriesScreenProps {
  currentUserEmail: string;
  onRunQuery: (question: string) => void;
}

export const SavedQueriesScreen: React.FC<SavedQueriesScreenProps> = ({
  currentUserEmail,
  onRunQuery,
}) => {
  const [queries, setQueries] = useState<SavedQuery[]>(() => getSavedQueries());
  const [activeFilter, setActiveFilter] = useState<'all' | 'team' | 'mine'>('all');
  const [search, setSearch] = useState('');
  const [isCreatingNew, setIsCreatingNew] = useState(false);

  // New query state
  const [newTitle, setNewTitle] = useState('');
  const [newQuestion, setNewQuestion] = useState('');
  const [newSql, setNewSql] = useState('');
  const [newShared, setNewShared] = useState(true);

  const filteredQueries = useMemo(() => {
    let list = [...queries];

    if (activeFilter === 'team') {
      list = list.filter((q) => q.sharedWithTeam);
    } else if (activeFilter === 'mine') {
      list = list.filter((q) => q.createdBy.toLowerCase() === currentUserEmail.toLowerCase());
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (item) =>
          item.title.toLowerCase().includes(q) ||
          item.question.toLowerCase().includes(q) ||
          item.sql.toLowerCase().includes(q) ||
          (item.tags && item.tags.some((t) => t.toLowerCase().includes(q)))
      );
    }

    return list;
  }, [queries, activeFilter, search, currentUserEmail]);

  const handleDelete = (id: string) => {
    if (window.confirm('Delete this saved query from your workspace?')) {
      deleteSavedQuery(id);
      setQueries(getSavedQueries());
    }
  };

  const handleToggleShare = (id: string) => {
    toggleQueryTeamSharing(id);
    setQueries(getSavedQueries());
  };

  const handleCreateCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newQuestion.trim()) return;

    saveQuery({
      title: newTitle.trim(),
      question: newQuestion.trim(),
      sql: newSql.trim() || `SELECT * FROM customers LIMIT 10;`,
      createdBy: currentUserEmail,
      sharedWithTeam: newShared,
      tags: ['Custom'],
    });

    setQueries(getSavedQueries());
    setIsCreatingNew(false);
    setNewTitle('');
    setNewQuestion('');
    setNewSql('');
  };

  return (
    <div className="flex-1 overflow-y-auto h-[calc(100vh-3.5rem)] p-4 sm:p-6 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight flex items-center gap-2">
              <BookmarkCheck className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <span>Saved Queries & Team Reports</span>
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Curated queries ready for one-click re-runs and cross-functional team sharing
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsCreatingNew(!isCreatingNew)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow-sm transition cursor-pointer self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>New Saved Query</span>
          </button>
        </div>

        {/* Modal / Collapse for adding custom query */}
        {isCreatingNew && (
          <div className="rounded-2xl bg-white dark:bg-slate-900 border border-blue-500/50 p-5 shadow-lg space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold flex items-center gap-2 text-blue-600 dark:text-blue-400">
                <Sparkles className="w-4 h-4" />
                <span>Create New Saved Query</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsCreatingNew(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateCustom} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1">Title *</label>
                  <input
                    type="text"
                    required
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="e.g. Monthly Revenue Breakdown"
                    className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Plain English Prompt *</label>
                  <input
                    type="text"
                    required
                    value={newQuestion}
                    onChange={(e) => setNewQuestion(e.target.value)}
                    placeholder="e.g. Group completed orders by month"
                    className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">SQL Expression (Optional)</label>
                <textarea
                  rows={2}
                  value={newSql}
                  onChange={(e) => setNewSql(e.target.value)}
                  placeholder="SELECT ... FROM ... LIMIT 100;"
                  className="w-full px-3 py-1.5 bg-slate-950 text-blue-300 font-mono text-xs rounded-lg border border-slate-800"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <label className="flex items-center gap-2 text-xs font-medium cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newShared}
                    onChange={(e) => setNewShared(e.target.checked)}
                    className="rounded text-blue-600"
                  />
                  <span>Share with team members</span>
                </label>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setIsCreatingNew(false)}
                    className="px-3 py-1 text-xs text-slate-500 hover:text-slate-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-medium"
                  >
                    Save
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}

        {/* Filters and search */}
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by title, tag, or SQL..."
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

          <div className="flex items-center gap-1.5 p-1 bg-slate-200/60 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
            <button
              type="button"
              onClick={() => setActiveFilter('all')}
              className={`px-3 py-1.5 rounded-lg font-medium transition cursor-pointer ${
                activeFilter === 'all'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              All Queries ({queries.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveFilter('team')}
              className={`px-3 py-1.5 rounded-lg font-medium transition cursor-pointer flex items-center gap-1.5 ${
                activeFilter === 'team'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Users className="w-3 h-3 text-emerald-500" />
              <span>Shared ({queries.filter((q) => q.sharedWithTeam).length})</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveFilter('mine')}
              className={`px-3 py-1.5 rounded-lg font-medium transition cursor-pointer flex items-center gap-1.5 ${
                activeFilter === 'mine'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Lock className="w-3 h-3 text-slate-400" />
              <span>My Saved</span>
            </button>
          </div>
        </div>

        {/* Query Cards Grid */}
        {filteredQueries.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 p-12 text-center">
            <BookmarkCheck className="w-8 h-8 text-slate-400 mx-auto mb-3" />
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              No saved queries found
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Save any result from your chat conversations or click "New Saved Query".
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredQueries.map((item) => (
              <div
                key={item.id}
                className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 sm:p-5 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 flex flex-col justify-between transition group"
              >
                <div>
                  {/* Top Bar: Badges & Sharing */}
                  <div className="flex items-center justify-between gap-2 mb-2.5">
                    <button
                      type="button"
                      onClick={() => handleToggleShare(item.id)}
                      title="Click to toggle team sharing"
                      className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full border transition cursor-pointer ${
                        item.sharedWithTeam
                          ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/60'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      {item.sharedWithTeam ? (
                        <>
                          <Users className="w-3 h-3" />
                          <span>Shared with Team</span>
                        </>
                      ) : (
                        <>
                          <Lock className="w-3 h-3" />
                          <span>Private</span>
                        </>
                      )}
                    </button>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleDelete(item.id)}
                        title="Delete query"
                        className="p-1 rounded text-slate-400 hover:text-red-500 opacity-60 group-hover:opacity-100 transition cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1.5">
                    {item.title}
                  </h3>

                  {/* Question */}
                  <div className="text-xs text-slate-600 dark:text-slate-300 italic mb-3 bg-slate-50 dark:bg-slate-800/40 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800">
                    "{item.question}"
                  </div>

                  {/* Tags */}
                  {item.tags && item.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {item.tags.map((t, idx) => (
                        <span
                          key={idx}
                          className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900/40"
                        >
                          #{t}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* SQL snippet */}
                  <pre className="p-2.5 rounded-lg bg-slate-950 text-blue-300 font-mono text-[10px] overflow-x-auto border border-slate-800 max-h-24 mb-4">
                    {item.sql}
                  </pre>
                </div>

                {/* Bottom Bar: Re-run button & Creator */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs">
                  <span className="text-[10px] text-slate-400 font-mono truncate max-w-[140px]">
                    by {item.createdBy.split('@')[0]}
                  </span>

                  <button
                    type="button"
                    onClick={() => onRunQuery(item.question)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold shadow-xs transition cursor-pointer"
                  >
                    <Play className="w-3 h-3 fill-current" />
                    <span>Run Query</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
