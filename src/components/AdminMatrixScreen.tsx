import React, { useState } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  Table as TableIcon,
  Plus,
  Save,
  RotateCcw,
  Check,
  AlertTriangle,
  ExternalLink,
  Layers,
  Database,
  Lock,
} from 'lucide-react';
import { RoleMatrix } from '../types';
import { getRoleMatrix, saveRoleMatrix } from '../services/storage';
import { addCustomRole } from '../services/auth';

export const AdminMatrixScreen: React.FC = () => {
  const [matrix, setMatrix] = useState<RoleMatrix>(() => getRoleMatrix());
  const [isSaving, setIsSaving] = useState(false);
  const [saveToast, setSaveToast] = useState<string | null>(null);
  const [newRoleInput, setNewRoleInput] = useState('');
  const [isAddingRole, setIsAddingRole] = useState(false);

  const handleToggle = (role: string, table: string) => {
    // Admin role is always superuser and has all tables enabled
    if (role === 'Admin') return;

    setMatrix((prev) => {
      const currentPerms = prev.permissions[role] || {};
      const nextPerms = {
        ...prev.permissions,
        [role]: {
          ...currentPerms,
          [table]: !currentPerms[table],
        },
      };

      const updated = { ...prev, permissions: nextPerms };
      saveRoleMatrix(updated);
      return updated;
    });
  };

  const handleToggleRowAll = (role: string, enableAll: boolean) => {
    if (role === 'Admin') return;
    setMatrix((prev) => {
      const rowPerms: Record<string, boolean> = {};
      prev.tables.forEach((t) => {
        rowPerms[t] = enableAll;
      });

      const updated = {
        ...prev,
        permissions: {
          ...prev.permissions,
          [role]: rowPerms,
        },
      };
      saveRoleMatrix(updated);
      return updated;
    });
  };

  const handleAddRole = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newRoleInput.trim();
    if (!trimmed || matrix.roles.includes(trimmed)) return;

    addCustomRole(trimmed);

    setMatrix((prev) => {
      const newRoles = [...prev.roles, trimmed];
      const newPerms = { ...prev.permissions };
      newPerms[trimmed] = {};
      // Default to read access on basic tables
      prev.tables.forEach((t) => {
        newPerms[trimmed][t] = ['customers', 'orders', 'products'].includes(t);
      });

      const updated: RoleMatrix = {
        ...prev,
        roles: newRoles,
        permissions: newPerms,
      };
      saveRoleMatrix(updated);
      return updated;
    });

    setNewRoleInput('');
    setIsAddingRole(false);
    triggerToast(`Created role "${trimmed}" with initial table permissions.`);
  };

  const handleSyncToBackend = () => {
    setIsSaving(true);
    // Simulate API call to backend / n8n webhook
    setTimeout(() => {
      setIsSaving(false);
      saveRoleMatrix(matrix);
      triggerToast('Permissions successfully synchronized to local state & staged for backend sync!');
    }, 800);
  };

  const triggerToast = (msg: string) => {
    setSaveToast(msg);
    setTimeout(() => setSaveToast(null), 3500);
  };

  return (
    <div className="flex-1 overflow-y-auto h-[calc(100vh-3.5rem)] p-4 sm:p-6 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-purple-100 dark:bg-purple-950/80 text-purple-600 dark:text-purple-400">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
                Role & Table Access Matrix
              </h1>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Configure read-only schema table visibility and query boundaries per organizational team role
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsAddingRole(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-lg text-xs font-semibold transition cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Role</span>
            </button>

            <button
              type="button"
              onClick={handleSyncToBackend}
              disabled={isSaving}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-semibold shadow-sm transition cursor-pointer disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Syncing...</span>
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" />
                  <span>Save & Sync Matrix</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Toast alert */}
        {saveToast && (
          <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2 shadow-sm animate-fade-in">
            <Check className="w-4 h-4 text-emerald-500" />
            <span>{saveToast}</span>
          </div>
        )}

        {/* Clear "Connect to backend" placeholder callout box */}
        <div className="rounded-2xl bg-gradient-to-r from-purple-900/10 via-blue-900/10 to-indigo-900/10 dark:from-purple-950/50 dark:via-blue-950/40 dark:to-indigo-950/50 border border-purple-200 dark:border-purple-800/60 p-4 sm:p-5">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-purple-600 text-white shadow-xs">
              <Database className="w-4 h-4" />
            </div>
            <div className="space-y-1 text-xs">
              <div className="font-bold text-sm text-purple-950 dark:text-purple-200 flex items-center gap-2">
                <span>Connect to Backend Placeholder</span>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-purple-200 dark:bg-purple-900/70 text-purple-900 dark:text-purple-300">
                  Ready for API Integration
                </span>
              </div>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                Currently, role permissions are persisted across user sessions in browser local storage.
                When your enterprise backend or n8n workflow supports permission storage, this screen will dispatch:
              </p>
              <div className="font-mono text-[11px] p-2 rounded bg-slate-900 text-purple-300 border border-slate-800 inline-block">
                PUT {`{N8N_BASE_URL}`}/sql-permissions — body: {`{ role, allowed_tables: [...] }`}
              </div>
            </div>
          </div>
        </div>

        {/* Add custom role inline form */}
        {isAddingRole && (
          <form
            onSubmit={handleAddRole}
            className="flex items-center gap-2 p-3 bg-white dark:bg-slate-900 border border-blue-500/50 rounded-xl"
          >
            <input
              type="text"
              required
              value={newRoleInput}
              onChange={(e) => setNewRoleInput(e.target.value)}
              placeholder="Enter custom role name (e.g. Operations, DataScience)"
              className="flex-1 px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs"
              autoFocus
            />
            <button
              type="submit"
              className="px-3 py-1.5 bg-purple-600 text-white text-xs font-semibold rounded-lg hover:bg-purple-500"
            >
              Add
            </button>
            <button
              type="button"
              onClick={() => setIsAddingRole(false)}
              className="px-3 py-1.5 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs rounded-lg"
            >
              Cancel
            </button>
          </form>
        )}

        {/* Matrix Table */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-b border-slate-200 dark:border-slate-700">
                  <th className="py-3 px-4 font-bold text-xs uppercase tracking-wider sticky left-0 z-10 bg-slate-100 dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 min-w-[160px]">
                    Role
                  </th>
                  {matrix.tables.map((tbl) => (
                    <th
                      key={tbl}
                      className="py-3 px-3.5 font-mono text-center border-r border-slate-200 dark:border-slate-700 whitespace-nowrap"
                    >
                      <div className="flex flex-col items-center gap-0.5">
                        <TableIcon className="w-3.5 h-3.5 text-blue-500" />
                        <span className="font-semibold">{tbl}</span>
                      </div>
                    </th>
                  ))}
                  <th className="py-3 px-3 text-center whitespace-nowrap">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                {matrix.roles.map((role) => {
                  const rolePerms = matrix.permissions[role] || {};
                  const isAdminRole = role.toLowerCase() === 'admin';

                  return (
                    <tr
                      key={role}
                      className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      {/* Role Row Label */}
                      <td className="py-3.5 px-4 font-semibold text-slate-800 dark:text-slate-200 sticky left-0 z-10 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-700">
                        <div className="flex items-center gap-2">
                          {isAdminRole ? (
                            <span className="w-2 h-2 rounded-full bg-purple-500" />
                          ) : (
                            <span className="w-2 h-2 rounded-full bg-blue-500" />
                          )}
                          <span className="text-sm">{role}</span>
                          {isAdminRole && (
                            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300">
                              Superuser
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Table Checkboxes */}
                      {matrix.tables.map((tbl) => {
                        const isChecked = isAdminRole ? true : Boolean(rolePerms[tbl]);

                        return (
                          <td
                            key={tbl}
                            className="py-3 px-3.5 text-center border-r border-slate-200 dark:border-slate-700"
                          >
                            <label className="inline-flex items-center justify-center cursor-pointer p-1">
                              <input
                                type="checkbox"
                                checked={isChecked}
                                disabled={isAdminRole}
                                onChange={() => handleToggle(role, tbl)}
                                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300 dark:border-slate-700 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
                              />
                            </label>
                          </td>
                        );
                      })}

                      {/* Row batch actions */}
                      <td className="py-3 px-3 text-center whitespace-nowrap">
                        {!isAdminRole ? (
                          <div className="flex items-center justify-center gap-1.5 text-[11px]">
                            <button
                              type="button"
                              onClick={() => handleToggleRowAll(role, true)}
                              className="text-blue-600 hover:text-blue-500 font-medium px-1.5 py-0.5 rounded hover:bg-blue-50 dark:hover:bg-blue-950/40"
                            >
                              All
                            </button>
                            <span className="text-slate-300 dark:text-slate-700">|</span>
                            <button
                              type="button"
                              onClick={() => handleToggleRowAll(role, false)}
                              className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 font-medium px-1.5 py-0.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800"
                            >
                              None
                            </button>
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-400 italic">
                            Full access locked
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
