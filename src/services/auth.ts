import { UserSession } from '../types';

const SESSION_STORAGE_KEY = 'askdb_user_session';
const CUSTOM_ROLES_KEY = 'askdb_custom_roles';

export const DEFAULT_ROLES = ['Sales', 'Finance', 'Admin'];

type AuthListener = (session: UserSession | null) => void;
const listeners: Set<AuthListener> = new Set();

/**
 * Gets custom roles added by users.
 */
export function getCustomRoles(): string[] {
  try {
    const raw = localStorage.getItem(CUSTOM_ROLES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/**
 * Retrieves all available roles (default + custom).
 */
export function getAllRoles(): string[] {
  const custom = getCustomRoles();
  const set = new Set([...DEFAULT_ROLES, ...custom]);
  return Array.from(set);
}

/**
 * Adds a new custom role to local storage.
 */
export function addCustomRole(roleName: string): string {
  const trimmed = roleName.trim();
  if (!trimmed) return '';
  const current = getCustomRoles();
  if (!current.includes(trimmed) && !DEFAULT_ROLES.includes(trimmed)) {
    const updated = [...current, trimmed];
    localStorage.setItem(CUSTOM_ROLES_KEY, JSON.stringify(updated));
  }
  return trimmed;
}

/**
 * Retrieves current active user session.
 */
export function getCurrentUser(): UserSession | null {
  try {
    const raw = localStorage.getItem(SESSION_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as UserSession;
  } catch (err) {
    console.error('Failed to parse user session:', err);
    return null;
  }
}

/**
 * Logs in user and stores session locally.
 * Swappable interface when real enterprise SSO (OIDC/SAML) is integrated.
 */
export function login(email: string, role: string): UserSession {
  const cleanEmail = email.trim().toLowerCase();
  const cleanRole = role.trim() || 'Sales';

  // If this role is neither in default nor in custom, save it
  if (!DEFAULT_ROLES.includes(cleanRole)) {
    addCustomRole(cleanRole);
  }

  const session: UserSession = {
    email: cleanEmail,
    role: cleanRole,
    name: cleanEmail.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
    loginTime: Date.now(),
  };

  localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
  notifyListeners(session);
  return session;
}

/**
 * Logs out user and clears local session.
 */
export function logout(): void {
  localStorage.removeItem(SESSION_STORAGE_KEY);
  notifyListeners(null);
}

/**
 * Subscribes to authentication state changes.
 */
export function onAuthStateChanged(listener: AuthListener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function notifyListeners(session: UserSession | null) {
  listeners.forEach((listener) => {
    try {
      listener(session);
    } catch (err) {
      console.error('Auth listener error:', err);
    }
  });
}
