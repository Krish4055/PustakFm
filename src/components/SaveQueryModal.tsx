import React, { useState } from 'react';
import { Bookmark, X, Users, Lock, Check } from 'lucide-react';
import { saveQuery } from '../services/storage';

interface SaveQueryModalProps {
  isOpen: boolean;
  onClose: () => void;
  question: string;
  sql: string;
  explanation?: string;
  userEmail: string;
  onSaved: () => void;
}

export const SaveQueryModal: React.FC<SaveQueryModalProps> = ({
  isOpen,
  onClose,
  question,
  sql,
  explanation,
  userEmail,
  onSaved,
}) => {
  const [title, setTitle] = useState('');
  const [tags, setTags] = useState('Revenue, MySQL');
  const [sharedWithTeam, setSharedWithTeam] = useState(true);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const parsedTags = tags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    saveQuery({
      title: title.trim(),
      question,
      sql,
      explanation,
      createdBy: userEmail,
      sharedWithTeam,
      tags: parsedTags,
    });

    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      onSaved();
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 text-slate-900 dark:text-slate-100">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400">
              <Bookmark className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold">Save Query to Workspace</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Save for 1-click re-running or share with teammates</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-4 mt-4">
          <div>
            <label className="block text-xs font-semibold mb-1 text-slate-700 dark:text-slate-300">
              Query Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Top 10 High-Revenue Accounts"
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1 text-slate-700 dark:text-slate-300">
              Tags (comma-separated)
            </label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="Sales, Monthly, Churn"
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1 text-slate-700 dark:text-slate-300">
              Natural Language Prompt
            </label>
            <div className="p-2.5 rounded-lg bg-slate-100 dark:bg-slate-800/60 text-xs text-slate-700 dark:text-slate-300 italic border border-slate-200 dark:border-slate-800">
              "{question}"
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1 text-slate-700 dark:text-slate-300">
              SQL Code Preview
            </label>
            <pre className="p-2.5 rounded-lg bg-slate-950 text-blue-300 font-mono text-[11px] max-h-24 overflow-y-auto border border-slate-800">
              {sql}
            </pre>
          </div>

          {/* Share with team switch */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60">
            <div className="flex items-center gap-2">
              {sharedWithTeam ? (
                <Users className="w-4 h-4 text-emerald-500" />
              ) : (
                <Lock className="w-4 h-4 text-slate-400" />
              )}
              <div>
                <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                  {sharedWithTeam ? 'Share with Entire Team' : 'Private to My Account'}
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                  {sharedWithTeam
                    ? 'All teammates with matching role can see and run this query'
                    : 'Only you can view and run this saved query'}
                </div>
              </div>
            </div>

            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={sharedWithTeam}
                onChange={(e) => setSharedWithTeam(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSuccess}
              className="px-4 py-1.5 rounded-lg text-xs font-medium bg-blue-600 hover:bg-blue-500 text-white flex items-center gap-1.5 shadow-sm transition cursor-pointer"
            >
              {isSuccess ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  Saved!
                </>
              ) : (
                <>
                  <Bookmark className="w-3.5 h-3.5" />
                  Save Query
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
