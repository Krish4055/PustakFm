import React, { useState } from 'react';
import { Database, Shield, ArrowRight, UserCheck, Sparkles, Plus } from 'lucide-react';
import { DEFAULT_ROLES, getAllRoles, login, addCustomRole } from '../services/auth';

interface LoginScreenProps {
  onLoginSuccess: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState(DEFAULT_ROLES[0]);
  const [customRoleInput, setCustomRoleInput] = useState('');
  const [isAddingCustomRole, setIsAddingCustomRole] = useState(false);
  const [rolesList, setRolesList] = useState<string[]>(getAllRoles());
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setError('Please enter your work email.');
      return;
    }
    if (!cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      setError('Please enter a valid email address.');
      return;
    }

    let activeRole = role;
    if (isAddingCustomRole && customRoleInput.trim()) {
      activeRole = addCustomRole(customRoleInput.trim());
    }

    login(cleanEmail, activeRole);
    onLoginSuccess();
  };

  const handleQuickLogin = (demoEmail: string, demoRole: string) => {
    login(demoEmail, demoRole);
    onLoginSuccess();
  };

  const handleAddRoleConfirm = () => {
    const trimmed = customRoleInput.trim();
    if (trimmed) {
      addCustomRole(trimmed);
      setRolesList(getAllRoles());
      setRole(trimmed);
      setIsAddingCustomRole(false);
      setCustomRoleInput('');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-900 text-slate-100">
      <div className="w-full max-w-md">
        {/* Logo & App Branding */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-600/20 border border-blue-500/30 text-blue-400 mb-4 shadow-lg shadow-blue-500/10">
            <Database className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center justify-center gap-2">
            Ask<span className="text-blue-500">DB</span>
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Natural language team workspace for company MySQL databases
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-slate-800/80 backdrop-blur-md border border-slate-700/80 rounded-2xl p-6 sm:p-8 shadow-2xl">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-700/60">
            <div>
              <h2 className="text-lg font-semibold text-white">Sign in to your team</h2>
              <p className="text-xs text-slate-400">Select your role to load assigned table permissions</p>
            </div>
            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-400 bg-emerald-950/60 border border-emerald-800/50 px-2 py-0.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              Read-Only
            </span>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-950/50 border border-red-800/60 text-red-200 text-xs flex items-center gap-2">
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Work Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                className="w-full px-3.5 py-2.5 bg-slate-900/90 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-medium text-slate-300">
                  Assigned Team Role
                </label>
                {!isAddingCustomRole && (
                  <button
                    type="button"
                    onClick={() => setIsAddingCustomRole(true)}
                    className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 transition"
                  >
                    <Plus className="w-3 h-3" /> Custom role
                  </button>
                )}
              </div>

              {!isAddingCustomRole ? (
                <div className="relative">
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-900/90 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition appearance-none cursor-pointer"
                  >
                    {rolesList.map((r) => (
                      <option key={r} value={r} className="bg-slate-900 text-white">
                        {r} {r === 'Admin' ? ' (Full Schema Access)' : ''}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400">
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                      <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                    </svg>
                  </div>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={customRoleInput}
                    onChange={(e) => setCustomRoleInput(e.target.value)}
                    placeholder="e.g. Marketing, Engineering, Ops"
                    className="flex-1 px-3 py-2 bg-slate-900/90 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={handleAddRoleConfirm}
                    className="px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium rounded-lg transition"
                  >
                    Add
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsAddingCustomRole(false)}
                    className="px-2.5 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 text-xs rounded-lg transition"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>

            <button
              type="submit"
              className="w-full mt-2 py-2.5 px-4 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-medium text-sm rounded-lg flex items-center justify-center gap-2 shadow-lg shadow-blue-600/25 transition cursor-pointer"
            >
              Enter Workspace
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo Login profiles for effortless evaluation */}
          <div className="mt-6 pt-5 border-t border-slate-700/60">
            <p className="text-[11px] font-semibold tracking-wider text-slate-400 uppercase mb-3 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              Quick 1-Click Demo Profiles
            </p>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin('sales.rep@company.com', 'Sales')}
                className="px-2.5 py-2 bg-slate-900/80 hover:bg-slate-700 border border-slate-700/80 rounded-lg text-left transition group cursor-pointer"
              >
                <div className="text-xs font-medium text-blue-300 group-hover:text-blue-200">Sales</div>
                <div className="text-[10px] text-slate-400 truncate">Alex Rivera</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('finance.lead@company.com', 'Finance')}
                className="px-2.5 py-2 bg-slate-900/80 hover:bg-slate-700 border border-slate-700/80 rounded-lg text-left transition group cursor-pointer"
              >
                <div className="text-xs font-medium text-emerald-300 group-hover:text-emerald-200">Finance</div>
                <div className="text-[10px] text-slate-400 truncate">Jordan Lee</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('admin@company.com', 'Admin')}
                className="px-2.5 py-2 bg-slate-900/80 hover:bg-slate-700 border border-slate-700/80 rounded-lg text-left transition group cursor-pointer"
              >
                <div className="text-xs font-medium text-purple-300 group-hover:text-purple-200">Admin</div>
                <div className="text-[10px] text-slate-400 truncate">Morgan Vance</div>
              </button>
            </div>
          </div>
        </div>

        {/* Footer info banner */}
        <div className="mt-6 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
          <Shield className="w-3.5 h-3.5 text-slate-400" />
          <span>Zero database credentials in frontend • n8n Webhook mediated</span>
        </div>
      </div>
    </div>
  );
};
