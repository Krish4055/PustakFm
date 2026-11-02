import { QueryHistoryItem, SavedQuery, RoleMatrix, ChatMessage } from '../types';
import { DEMO_TABLES, ROLE_DEFAULT_PERMISSIONS } from './demoEngine';
import { getAllRoles } from './auth';

const HISTORY_KEY = 'askdb_query_history';
const SAVED_QUERIES_KEY = 'askdb_saved_queries';
const ROLE_MATRIX_KEY = 'askdb_role_matrix';
const SESSIONS_CHAT_KEY = 'askdb_chat_sessions';

// ----------------- QUERY HISTORY -----------------

export function getHistory(): QueryHistoryItem[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function addToHistory(item: Omit<QueryHistoryItem, 'id' | 'timestamp'>): QueryHistoryItem {
  const current = getHistory();
  const newItem: QueryHistoryItem = {
    ...item,
    id: `hist_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    timestamp: Date.now(),
  };

  // Keep latest 200 history items
  const updated = [newItem, ...current.slice(0, 199)];
  localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
  return newItem;
}

export function clearHistory(): void {
  localStorage.removeItem(HISTORY_KEY);
}

// ----------------- SAVED QUERIES -----------------

const DEFAULT_SAVED_QUERIES: SavedQuery[] = [
  {
    id: 'saved_1',
    title: 'Top 10 High-Value Customers (MRR & Order Total)',
    question: 'Show top 10 customers by revenue and tier',
    sql: `SELECT \n  c.company_name,\n  c.tier,\n  c.city,\n  COUNT(o.id) AS total_orders,\n  ROUND(SUM(o.total_amount), 2) AS total_spent_usd\nFROM customers c\nJOIN orders o ON c.id = o.customer_id\nWHERE o.status = 'completed'\nGROUP BY c.id, c.company_name, c.tier, c.city\nORDER BY total_spent_usd DESC\nLIMIT 10;`,
    explanation: 'Ranks top 10 commercial accounts by completed revenue across all tiers.',
    createdAt: Date.now() - 86400000 * 2,
    createdBy: 'admin@company.com',
    sharedWithTeam: true,
    tags: ['Revenue', 'Sales', 'Core'],
  },
  {
    id: 'saved_2',
    title: 'Overdue Invoices (> 30 Days Past Net Terms)',
    question: 'Show unpaid or overdue invoices with days overdue',
    sql: `SELECT \n  i.invoice_number,\n  c.company_name,\n  i.amount_due,\n  i.due_date,\n  DATEDIFF(CURDATE(), i.due_date) AS days_overdue\nFROM invoices i\nJOIN orders o ON i.order_id = o.id\nJOIN customers c ON o.customer_id = c.id\nWHERE i.status = 'overdue'\nORDER BY days_overdue DESC\nLIMIT 100;`,
    explanation: 'Audits delinquent accounts receivable requiring collections outreach.',
    createdAt: Date.now() - 86400000 * 4,
    createdBy: 'finance@company.com',
    sharedWithTeam: true,
    tags: ['Finance', 'Collections'],
  },
  {
    id: 'saved_3',
    title: 'Sales Rep Quarterly Quota Attainment Leaderboard',
    question: 'Which sales reps achieved their quarterly quota?',
    sql: `SELECT \n  sr.full_name,\n  sr.region,\n  sr.quarterly_quota,\n  ROUND(SUM(o.total_amount), 2) AS closed_revenue,\n  ROUND((SUM(o.total_amount) / sr.quarterly_quota) * 100, 1) AS attainment_pct\nFROM sales_reps sr\nLEFT JOIN orders o ON sr.id = o.sales_rep_id\nGROUP BY sr.id, sr.full_name, sr.region, sr.quarterly_quota\nORDER BY attainment_pct DESC\nLIMIT 100;`,
    explanation: 'Leaderboard of sales representatives ranked by percentage quota achievement.',
    createdAt: Date.now() - 86400000 * 5,
    createdBy: 'sarah.vp@company.com',
    sharedWithTeam: true,
    tags: ['Sales', 'Quota'],
  },
  {
    id: 'saved_4',
    title: 'Critical Inventory & Reorder Health Audit',
    question: 'List active software licenses and capacity below 50 units',
    sql: `SELECT \n  p.product_name,\n  p.category,\n  p.unit_price,\n  p.stock_quantity\nFROM products p\nWHERE p.is_active = 1 AND p.stock_quantity < 50\nORDER BY p.stock_quantity ASC\nLIMIT 100;`,
    explanation: 'Flags digital SKU licenses requiring immediate replenishment.',
    createdAt: Date.now() - 86400000 * 1,
    createdBy: 'ops@company.com',
    sharedWithTeam: false,
    tags: ['Inventory', 'Ops'],
  },
];

export function getSavedQueries(): SavedQuery[] {
  try {
    const raw = localStorage.getItem(SAVED_QUERIES_KEY);
    if (!raw) {
      localStorage.setItem(SAVED_QUERIES_KEY, JSON.stringify(DEFAULT_SAVED_QUERIES));
      return DEFAULT_SAVED_QUERIES;
    }
    return JSON.parse(raw);
  } catch {
    return DEFAULT_SAVED_QUERIES;
  }
}

export function saveQuery(query: Omit<SavedQuery, 'id' | 'createdAt'>): SavedQuery {
  const current = getSavedQueries();
  const newQuery: SavedQuery = {
    ...query,
    id: `saved_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    createdAt: Date.now(),
  };

  const updated = [newQuery, ...current];
  localStorage.setItem(SAVED_QUERIES_KEY, JSON.stringify(updated));
  return newQuery;
}

export function deleteSavedQuery(id: string): void {
  const current = getSavedQueries();
  const updated = current.filter((q) => q.id !== id);
  localStorage.setItem(SAVED_QUERIES_KEY, JSON.stringify(updated));
}

export function toggleQueryTeamSharing(id: string): SavedQuery | null {
  const current = getSavedQueries();
  let updatedItem: SavedQuery | null = null;
  const updated = current.map((q) => {
    if (q.id === id) {
      updatedItem = { ...q, sharedWithTeam: !q.sharedWithTeam };
      return updatedItem;
    }
    return q;
  });
  localStorage.setItem(SAVED_QUERIES_KEY, JSON.stringify(updated));
  return updatedItem;
}

// ----------------- ADMIN ROLE MATRIX -----------------

export function getRoleMatrix(): RoleMatrix {
  try {
    const raw = localStorage.getItem(ROLE_MATRIX_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // fallback
  }

  // Generate initial matrix from defaults
  const allRoles = getAllRoles();
  const allTables = Object.keys(DEMO_TABLES);
  const permissions: Record<string, Record<string, boolean>> = {};

  allRoles.forEach((role) => {
    permissions[role] = {};
    const allowed = ROLE_DEFAULT_PERMISSIONS[role] || ['customers', 'orders', 'products'];
    allTables.forEach((table) => {
      permissions[role][table] = allowed.includes(table);
    });
  });

  const matrix: RoleMatrix = {
    roles: allRoles,
    tables: allTables,
    permissions,
  };

  localStorage.setItem(ROLE_MATRIX_KEY, JSON.stringify(matrix));
  return matrix;
}

export function saveRoleMatrix(matrix: RoleMatrix): void {
  localStorage.setItem(ROLE_MATRIX_KEY, JSON.stringify(matrix));
}

// ----------------- CHAT SESSIONS PERSISTENCE -----------------

export function getPersistedMessages(sessionId: string): ChatMessage[] {
  try {
    const raw = localStorage.getItem(`${SESSIONS_CHAT_KEY}_${sessionId}`);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function persistMessages(sessionId: string, messages: ChatMessage[]): void {
  try {
    localStorage.setItem(`${SESSIONS_CHAT_KEY}_${sessionId}`, JSON.stringify(messages));
  } catch (e) {
    console.error('Failed to persist messages:', e);
  }
}
