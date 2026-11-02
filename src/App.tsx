import React, { useState, useEffect, useCallback } from 'react';
import { UserSession, TableSchema } from './types';
import { getCurrentUser, onAuthStateChanged, logout } from './services/auth';
import { fetchSchema, getSettings, saveSettings } from './services/api';
import { Header, NavTab } from './components/Header';
import { LoginScreen } from './components/LoginScreen';
import { TableBrowserSidebar } from './components/TableBrowserSidebar';
import { ChatTab } from './components/ChatTab';
import { HistoryScreen } from './components/HistoryScreen';
import { SavedQueriesScreen } from './components/SavedQueriesScreen';
import { AdminMatrixScreen } from './components/AdminMatrixScreen';
import { SettingsModal } from './components/SettingsModal';

export const App: React.FC = () => {
  const [user, setUser] = useState<UserSession | null>(() => getCurrentUser());
  const [currentTab, setCurrentTab] = useState<NavTab>('chat');
  const [tables, setTables] = useState<TableSchema[]>([]);
  const [isLoadingSchema, setIsLoadingSchema] = useState(false);
  const [isOpenMobileSidebar, setIsOpenMobileSidebar] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [insertedText, setInsertedText] = useState<string>('');
  const [rerunQuestion, setRerunQuestion] = useState<string | null>(null);

  // Application settings and theme
  const [settings, setAppSettings] = useState(() => getSettings());
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    return settings.theme === 'light' ? 'light' : 'dark';
  });

  // Keep theme class updated on <html> document element
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.remove('dark');
      root.classList.add('light');
    }
  }, [theme]);

  // Listen for user auth changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged((newSession) => {
      setUser(newSession);
    });
    return () => unsubscribe();
  }, []);

  // Fetch schema when user or role changes
  const loadSchema = useCallback(async () => {
    if (!user) return;
    setIsLoadingSchema(true);
    try {
      const response = await fetchSchema(user.role);
      setTables(response.tables || []);
    } catch (err) {
      console.error('Failed to load schema:', err);
    } finally {
      setIsLoadingSchema(false);
    }
  }, [user]);

  useEffect(() => {
    loadSchema();
  }, [loadSchema]);

  const handleToggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    saveSettings({ theme: nextTheme });
  };

  const handleInsertText = (text: string) => {
    setInsertedText(text);
    // On mobile, close sidebar after inserting table/column name into prompt
    setIsOpenMobileSidebar(false);
  };

  const handleRerunQuery = (question: string) => {
    setRerunQuestion(question);
    setCurrentTab('chat');
    setInsertedText(question);
  };

  // If not logged in, render the login screen
  if (!user) {
    return (
      <div className={theme === 'dark' ? 'dark' : ''}>
        <LoginScreen onLoginSuccess={() => setUser(getCurrentUser())} />
      </div>
    );
  }

  const isDemoMode = settings.forceDemoMode || !settings.n8nBaseUrl;

  return (
    <div className={`min-h-screen flex flex-col ${theme === 'dark' ? 'dark bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'} antialiased`}>
      {/* Top Header */}
      <Header
        currentTab={currentTab}
        onSelectTab={(tab) => {
          // Non-admin trying to open admin is redirected to chat
          if (tab === 'admin' && user.role.toLowerCase() !== 'admin') {
            setCurrentTab('chat');
          } else {
            setCurrentTab(tab);
          }
        }}
        user={user}
        onLogout={logout}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onToggleSidebar={() => setIsOpenMobileSidebar(!isOpenMobileSidebar)}
        isDemoMode={isDemoMode}
        theme={theme}
        onToggleTheme={handleToggleTheme}
      />

      {/* Main Workspace */}
      <div className="flex-1 flex overflow-hidden">
        {/* Schema Table Browser Sidebar (Active on Chat tab) */}
        {currentTab === 'chat' && (
          <TableBrowserSidebar
            tables={tables}
            isLoading={isLoadingSchema}
            role={user.role}
            isOpenMobile={isOpenMobileSidebar}
            onCloseMobile={() => setIsOpenMobileSidebar(false)}
            onRefresh={loadSchema}
            onInsertText={handleInsertText}
          />
        )}

        {/* Tab Views */}
        {currentTab === 'chat' && (
          <ChatTab
            user={user}
            insertedText={insertedText}
            onClearInsertedText={() => setInsertedText('')}
            onOpenSettings={() => setIsSettingsOpen(true)}
            isDemoMode={isDemoMode}
          />
        )}

        {currentTab === 'history' && (
          <HistoryScreen
            currentUserEmail={user.email}
            onRerunQuery={handleRerunQuery}
          />
        )}

        {currentTab === 'saved' && (
          <SavedQueriesScreen
            currentUserEmail={user.email}
            onRunQuery={handleRerunQuery}
          />
        )}

        {currentTab === 'admin' && (
          user.role.toLowerCase() === 'admin' ? (
            <AdminMatrixScreen />
          ) : (
            <div className="p-8 text-center text-xs text-slate-400">
              Access restricted to Admin role.
            </div>
          )
        )}
      </div>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onSettingsSaved={() => {
          const updated = getSettings();
          setAppSettings(updated);
          loadSchema();
        }}
        currentTheme={theme}
        onThemeChange={(newTheme) => setTheme(newTheme)}
      />
    </div>
  );
};

export default App;
