export interface UserSession {
  email: string;
  role: string;
  name?: string;
  loginTime: number;
}

export interface ColumnSchema {
  name: string;
  type: string;
  comment: string;
}

export interface TableSchema {
  name: string;
  description?: string;
  rowCountEstimate?: number;
  columns: ColumnSchema[];
}

export interface SchemaResponse {
  role: string;
  tables: TableSchema[];
}

export interface ChatQueryRequest {
  question: string;
  role: string;
  session_id: string;
  user_email: string;
}

export interface ChatQueryResponse {
  ok: boolean;
  sql?: string;
  explanation?: string;
  rowCount?: number;
  columns?: string[];
  rows?: Record<string, any>[];
  error?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  sessionId: string;
  sql?: string;
  rowCount?: number;
  columns?: string[];
  rows?: Record<string, any>[];
  error?: string;
  feedback?: 'up' | 'down' | null;
  feedbackNote?: string;
  editedSql?: string;
}

export interface SavedQuery {
  id: string;
  title: string;
  question: string;
  sql: string;
  explanation?: string;
  createdAt: number;
  createdBy: string;
  sharedWithTeam: boolean;
  tags?: string[];
}

export interface QueryHistoryItem {
  id: string;
  sessionId: string;
  question: string;
  sql?: string;
  rowCount?: number;
  timestamp: number;
  userEmail: string;
  role: string;
  success: boolean;
}

export interface AppSettings {
  n8nBaseUrl: string;
  useProxy: boolean;
  forceDemoMode: boolean;
  theme: 'dark' | 'light' | 'system';
}

export interface RoleMatrix {
  roles: string[];
  tables: string[];
  permissions: Record<string, Record<string, boolean>>; // role -> table -> boolean
}
