import React from 'react';
import {
  Database,
  MessageSquare,
  Clock,
  BookmarkCheck,
  ShieldAlert,
  Settings,
  LogOut,
  Sun,
  Moon,
  Menu,
  Sparkles,
  Radio,
} from 'lucide-react';
import { UserSession } from '../types';

export type NavTab = 'chat' | 'history' | 'saved' | 'admin';

interface HeaderProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  user: UserSession;
  onLogout: () => void;
  onOpenSettings: () => void;
  onToggleSidebar: () => void;
  isDemoMode: boolean;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onSelectTab,
  user,
  onLogout,
  onOpenSettings,
  onToggleSidebar,
  isDemoMode,
  theme,
  onToggleTheme,
}) => {
  const isAdmin = user.role.toLowerCase() === 'admin';

  return (
    <header className="sticky top-0 z-30 h-14 border-b border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-3 sm:px-5 flex items-center justify-between transition-colors">
      {/* Left: Mobile menu toggle + Logo */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onToggleSidebar}
          aria-label="Toggle schema table browser"
          className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden cursor-pointer"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div
          onClick={() => onSelectTab('chat')}
          className="flex items-center gap-2.5 cursor-pointer select-none group"
        >
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
            <Database className="w-4 h-4" />
          </div>
          <div>
            <div className="font-extrabold text-base tracking-tight text-slate-900 dark:text-white flex items-center gap-1.5 leading-none">
              Ask<span className="text-blue-600 dark:text-blue-400">DB</span>
            </div>
            <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono tracking-wider hidden sm:block">
              MYSQL EXPLORER
            </div>
          </div>
        </div>

        {/* Status Pill: Demo Mode vs Live Webhook */}
        <button
          type="button"
          onClick={onOpenSettings}
          title={isDemoMode ? 'Running in Demo Mode with Mock Data. Click to configure n8n.' : 'Connected to n8n Webhook. Click to configure.'}
          className={`hidden md:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium cursor-pointer transition ${
            isDemoMode
              ? 'bg-amber-100 text-amber-800 border border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800/60'
              : 'bg-emerald-100 text-emerald-800 border border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800/60'
          }`}
        >
          {isDemoMode ? (
            <>
              <Sparkles className="w-3 h-3 text-amber-500" />
              <span>Demo Mode</span>
            </>
          ) : (
            <>
              <Radio className="w-3 h-3 text-emerald-500 animate-pulse" />
              <span>n8n Webhook</span>
            </>
          )}
        </button>
      </div>

      {/* Center: Navigation Tabs */}
      <nav className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => onSelectTab('chat')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition ${
            currentTab === 'chat'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span>Chat</span>
        </button>

        <button
          type="button"
          onClick={() => onSelectTab('history')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition ${
            currentTab === 'history'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>History</span>
        </button>

        <button
          type="button"
          onClick={() => onSelectTab('saved')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition ${
            currentTab === 'saved'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <BookmarkCheck className="w-3.5 h-3.5" />
          <span>Saved</span>
        </button>

        {isAdmin && (
          <button
            type="button"
            onClick={() => onSelectTab('admin')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition ${
              currentTab === 'admin'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-950/40'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Admin</span>
          </button>
        )}
      </nav>

      {/* Right: Actions, User info, Theme, Settings */}
      <div className="flex items-center gap-2">
        {/* Theme Toggle */}
        <button
          type="button"
          onClick={onToggleTheme}
          aria-label="Toggle color theme"
          className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* Settings button */}
        <button
          type="button"
          onClick={onOpenSettings}
          aria-label="Application Settings"
          className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
        >
          <Settings className="w-4 h-4" />
        </button>

        {/* User Profile Chip */}
        <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-800">
          <div className="text-right">
            <div className="text-xs font-medium text-slate-800 dark:text-slate-200 leading-tight truncate max-w-[120px]">
              {user.email.split('@')[0]}
            </div>
            <div className="text-[10px] text-blue-600 dark:text-blue-400 font-medium leading-none">
              {user.role}
            </div>
          </div>
        </div>

        {/* Logout */}
        <button
          type="button"
          onClick={onLogout}
          title="Sign out of AskDB"
          className="p-1.5 rounded-lg text-slate-500 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
