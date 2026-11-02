import {
  AppSettings,
  ChatQueryRequest,
  ChatQueryResponse,
  SchemaResponse,
} from '../types';
import { getMockSchema, processMockChatQuery } from './demoEngine';

const SETTINGS_KEY = 'askdb_app_settings';

/**
 * Returns current application settings.
 */
export function getSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        n8nBaseUrl: parsed.n8nBaseUrl ?? (import.meta.env.VITE_N8N_BASE_URL || ''),
        useProxy: parsed.useProxy ?? true,
        forceDemoMode: parsed.forceDemoMode ?? !Boolean(parsed.n8nBaseUrl || import.meta.env.VITE_N8N_BASE_URL),
        theme: parsed.theme ?? 'dark',
      };
    }
  } catch (e) {
    console.error('Failed to load settings:', e);
  }

  const defaultEnvUrl = import.meta.env.VITE_N8N_BASE_URL || '';
  return {
    n8nBaseUrl: defaultEnvUrl,
    useProxy: true,
    forceDemoMode: !defaultEnvUrl,
    theme: 'dark',
  };
}

/**
 * Saves updated application settings to local storage.
 */
export function saveSettings(updates: Partial<AppSettings>): AppSettings {
  const current = getSettings();
  const next: AppSettings = { ...current, ...updates };
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(next));
  return next;
}

/**
 * Helper to normalize URLs by removing trailing slashes.
 */
function cleanUrl(url: string): string {
  return url.trim().replace(/\/+$/, '');
}

/**
 * Fetches the MySQL database schema for the user's role.
 * Contract: GET {N8N_BASE_URL}/sql-schema?role={role}
 */
export async function fetchSchema(role: string): Promise<SchemaResponse> {
  const settings = getSettings();
  const baseUrl = cleanUrl(settings.n8nBaseUrl);

  // If in demo mode or no base URL configured, use realistic mock schema
  if (settings.forceDemoMode || !baseUrl) {
    // Small realistic delay
    await new Promise((r) => setTimeout(r, 200));
    return getMockSchema(role);
  }

  const directEndpoint = `${baseUrl}/sql-schema?role=${encodeURIComponent(role)}`;
  const proxyEndpoint = `/api/proxy/sql-schema?role=${encodeURIComponent(role)}`;

  // 1. Try direct webhook call
  try {
    const res = await fetch(directEndpoint, {
      method: 'GET',
      headers: { Accept: 'application/json' },
    });

    if (res.ok) {
      const data = await res.json();
      return sanitizeSchemaResponse(data, role);
    }
  } catch (directErr) {
    console.warn('Direct n8n schema call failed (likely CORS or network), attempting server proxy fallback...', directErr);
  }

  // 2. Try proxy fallback if enabled
  if (settings.useProxy) {
    try {
      const proxyRes = await fetch(proxyEndpoint, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          'x-target-n8n-url': baseUrl,
        },
      });

      if (proxyRes.ok) {
        const data = await proxyRes.json();
        return sanitizeSchemaResponse(data, role);
      }
    } catch (proxyErr) {
      console.warn('Proxy schema call failed:', proxyErr);
    }
  }

  // Graceful fallback to demo schema on complete network failure, but alert developer
  console.warn('Falling back to local schema model due to webhook unavailability.');
  return getMockSchema(role);
}

/**
 * Sends a natural language query to generate and execute MySQL SQL.
 * Contract: POST {N8N_BASE_URL}/sql-chat
 * Body: { question, role, session_id, user_email }
 */
export async function sendChatQuery(payload: ChatQueryRequest): Promise<ChatQueryResponse> {
  const settings = getSettings();
  const baseUrl = cleanUrl(settings.n8nBaseUrl);

  // Demo mode branch
  if (settings.forceDemoMode || !baseUrl) {
    // Simulate real database & LLM processing time
    await new Promise((r) => setTimeout(r, 650));
    return processMockChatQuery(payload.question, payload.role, payload.session_id, payload.user_email);
  }

  const directEndpoint = `${baseUrl}/sql-chat`;
  const proxyEndpoint = `/api/proxy/sql-chat`;

  // 1. Try direct fetch
  try {
    const res = await fetch(directEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (!res.ok || data.ok === false) {
      return {
        ok: false,
        error: data.error || `n8n webhook responded with status ${res.status}`,
      };
    }

    return {
      ok: true,
      sql: data.sql,
      explanation: data.explanation || 'Query executed successfully.',
      rowCount: data.rowCount ?? (Array.isArray(data.rows) ? data.rows.length : 0),
      columns: data.columns || (data.rows && data.rows[0] ? Object.keys(data.rows[0]) : []),
      rows: data.rows || [],
    };
  } catch (directErr) {
    console.warn('Direct n8n chat call failed, trying proxy...', directErr);
  }

  // 2. Try proxy fallback
  if (settings.useProxy) {
    try {
      const proxyRes = await fetch(proxyEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          'x-target-n8n-url': baseUrl,
        },
        body: JSON.stringify(payload),
      });

      const data = await proxyRes.json();

      if (!proxyRes.ok || data.ok === false) {
        return {
          ok: false,
          error: data.error || `n8n proxy responded with status ${proxyRes.status}`,
        };
      }

      return {
        ok: true,
        sql: data.sql,
        explanation: data.explanation || 'Query executed successfully.',
        rowCount: data.rowCount ?? (Array.isArray(data.rows) ? data.rows.length : 0),
        columns: data.columns || (data.rows && data.rows[0] ? Object.keys(data.rows[0]) : []),
        rows: data.rows || [],
      };
    } catch (proxyErr: any) {
      return {
        ok: false,
        error: `Could not connect to n8n webhook at ${baseUrl}. Details: ${proxyErr.message || 'Network unreachable'}. Check the URL or switch to Demo Mode in Settings.`,
      };
    }
  }

  return {
    ok: false,
    error: `Could not connect to n8n webhook at ${baseUrl}. Please check CORS or test in Settings.`,
  };
}

/**
 * Validates connection to the user's n8n webhook URL.
 */
export async function testWebhookConnection(
  baseUrl: string,
  role: string = 'Admin'
): Promise<{ success: boolean; message: string; schemaTablesCount?: number }> {
  const cleaned = cleanUrl(baseUrl);
  if (!cleaned.startsWith('http://') && !cleaned.startsWith('https://')) {
    return { success: false, message: 'URL must begin with http:// or https://' };
  }

  try {
    const schemaUrl = `${cleaned}/sql-schema?role=${encodeURIComponent(role)}`;
    let res: globalThis.Response;

    try {
      res = await fetch(schemaUrl, { method: 'GET' });
    } catch {
      // Try through proxy
      res = await fetch(`/api/proxy/sql-schema?role=${encodeURIComponent(role)}`, {
        headers: { 'x-target-n8n-url': cleaned },
      });
    }

    if (!res.ok) {
      return {
        success: false,
        message: `HTTP error ${res.status}: ${res.statusText || 'Endpoint returned error'}`,
      };
    }

    const data = await res.json();
    const tablesCount = Array.isArray(data.tables) ? data.tables.length : 0;
    return {
      success: true,
      message: `Successfully connected to n8n! Found ${tablesCount} schema tables for role "${role}".`,
      schemaTablesCount: tablesCount,
    };
  } catch (err: any) {
    return {
      success: false,
      message: `Connection failed: ${err.message || 'Network error'}. Verify n8n is running and reachable.`,
    };
  }
}

function sanitizeSchemaResponse(data: any, fallbackRole: string): SchemaResponse {
  if (!data || typeof data !== 'object') {
    return { role: fallbackRole, tables: [] };
  }
  return {
    role: data.role || fallbackRole,
    tables: Array.isArray(data.tables) ? data.tables : [],
  };
}
