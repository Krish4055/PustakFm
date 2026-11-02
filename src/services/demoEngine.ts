import { SchemaResponse, TableSchema, ChatQueryResponse } from '../types';

export const DEMO_TABLES: Record<string, TableSchema> = {
  customers: {
    name: 'customers',
    description: 'B2B accounts, primary contacts, and geographic locations',
    rowCountEstimate: 1420,
    columns: [
      { name: 'id', type: 'INT UNSIGNED AUTO_INCREMENT', comment: 'Unique customer identifier' },
      { name: 'company_name', type: 'VARCHAR(255)', comment: 'Registered legal company name' },
      { name: 'contact_name', type: 'VARCHAR(150)', comment: 'Primary account contact' },
      { name: 'email', type: 'VARCHAR(255)', comment: 'Contact business email' },
      { name: 'city', type: 'VARCHAR(100)', comment: 'Headquarters city' },
      { name: 'country', type: 'VARCHAR(100)', comment: 'Country of operation' },
      { name: 'tier', type: "ENUM('Starter', 'Growth', 'Enterprise')", comment: 'Customer tier' },
      { name: 'created_at', type: 'TIMESTAMP', comment: 'Account creation date' },
    ],
  },
  orders: {
    name: 'orders',
    description: 'Transaction records and checkout receipts',
    rowCountEstimate: 8750,
    columns: [
      { name: 'id', type: 'INT UNSIGNED AUTO_INCREMENT', comment: 'Unique order ID' },
      { name: 'customer_id', type: 'INT UNSIGNED', comment: 'Foreign key referencing customers.id' },
      { name: 'order_date', type: 'DATETIME', comment: 'Date order was placed' },
      { name: 'total_amount', type: 'DECIMAL(12,2)', comment: 'Gross order value in USD' },
      { name: 'status', type: "ENUM('pending', 'completed', 'cancelled', 'refunded')", comment: 'Order status' },
      { name: 'sales_rep_id', type: 'INT UNSIGNED', comment: 'Assigned account executive' },
      { name: 'payment_method', type: 'VARCHAR(50)', comment: 'ACH, Credit Card, or Wire' },
    ],
  },
  products: {
    name: 'products',
    description: 'Software licenses, add-ons, and service offerings',
    rowCountEstimate: 120,
    columns: [
      { name: 'id', type: 'INT UNSIGNED AUTO_INCREMENT', comment: 'SKU product identifier' },
      { name: 'product_name', type: 'VARCHAR(150)', comment: 'Public marketing product title' },
      { name: 'category', type: 'VARCHAR(80)', comment: 'Category e.g. Analytics, Cloud, Security' },
      { name: 'unit_price', type: 'DECIMAL(10,2)', comment: 'Unit price per license in USD' },
      { name: 'stock_quantity', type: 'INT', comment: 'Available digital capacity / stock' },
      { name: 'is_active', type: 'TINYINT(1)', comment: '1 if available for sale, 0 if deprecated' },
    ],
  },
  sales_reps: {
    name: 'sales_reps',
    description: 'Sales team members, assigned regions, and quota targets',
    rowCountEstimate: 45,
    columns: [
      { name: 'id', type: 'INT UNSIGNED AUTO_INCREMENT', comment: 'Sales rep internal ID' },
      { name: 'full_name', type: 'VARCHAR(120)', comment: 'Employee full name' },
      { name: 'region', type: 'VARCHAR(80)', comment: 'Sales territory e.g. NA-East, EMEA, APAC' },
      { name: 'quarterly_quota', type: 'DECIMAL(12,2)', comment: 'Quarterly sales target' },
      { name: 'commission_rate', type: 'DECIMAL(4,3)', comment: 'Standard commission rate' },
    ],
  },
  invoices: {
    name: 'invoices',
    description: 'Accounts receivable billing invoices and payment collection status',
    rowCountEstimate: 6200,
    columns: [
      { name: 'invoice_number', type: 'VARCHAR(50)', comment: 'Formatted invoice code (e.g. INV-2026-004)' },
      { name: 'order_id', type: 'INT UNSIGNED', comment: 'Associated order identifier' },
      { name: 'amount_due', type: 'DECIMAL(12,2)', comment: 'Outstanding balance amount' },
      { name: 'due_date', type: 'DATE', comment: 'Net-30/60 payment due date' },
      { name: 'status', type: "ENUM('draft', 'issued', 'paid', 'overdue', 'void')", comment: 'Invoice payment status' },
      { name: 'currency', type: 'CHAR(3)', comment: 'ISO currency code (USD, EUR, GBP)' },
    ],
  },
  subscriptions: {
    name: 'subscriptions',
    description: 'Recurring monthly and annual cloud software contracts',
    rowCountEstimate: 3100,
    columns: [
      { name: 'id', type: 'INT UNSIGNED AUTO_INCREMENT', comment: 'Subscription record ID' },
      { name: 'customer_id', type: 'INT UNSIGNED', comment: 'Foreign key to customers.id' },
      { name: 'plan_name', type: 'VARCHAR(100)', comment: 'Tier (Standard, Pro, Enterprise Plus)' },
      { name: 'mrr', type: 'DECIMAL(10,2)', comment: 'Monthly Recurring Revenue contribution' },
      { name: 'billing_cycle', type: "ENUM('monthly', 'annual')", comment: 'Cadence' },
      { name: 'renews_at', type: 'DATE', comment: 'Next renewal trigger date' },
      { name: 'status', type: "ENUM('active', 'past_due', 'churned', 'trial')", comment: 'Contract state' },
    ],
  },
  revenue_by_quarter: {
    name: 'revenue_by_quarter',
    description: 'Finance reporting view summarizing quarterly audited revenues',
    rowCountEstimate: 16,
    columns: [
      { name: 'fiscal_year', type: 'INT', comment: 'Fiscal year' },
      { name: 'quarter', type: 'CHAR(2)', comment: 'Q1, Q2, Q3, Q4' },
      { name: 'total_revenue', type: 'DECIMAL(14,2)', comment: 'Audited booked revenue' },
      { name: 'cogs', type: 'DECIMAL(14,2)', comment: 'Cost of goods sold' },
      { name: 'gross_margin_pct', type: 'DECIMAL(5,2)', comment: 'Margin percentage' },
    ],
  },
  system_audit_logs: {
    name: 'system_audit_logs',
    description: 'Privileged admin access and query inspection logs',
    rowCountEstimate: 24500,
    columns: [
      { name: 'id', type: 'BIGINT UNSIGNED AUTO_INCREMENT', comment: 'Log entry ID' },
      { name: 'user_email', type: 'VARCHAR(255)', comment: 'Authenticated caller email' },
      { name: 'action', type: 'VARCHAR(100)', comment: 'SQL executed or API action' },
      { name: 'execution_time_ms', type: 'INT', comment: 'Query response duration in ms' },
      { name: 'ip_address', type: 'VARCHAR(45)', comment: 'Client origin IP' },
      { name: 'created_at', type: 'TIMESTAMP', comment: 'Event timestamp' },
    ],
  },
};

export const ROLE_DEFAULT_PERMISSIONS: Record<string, string[]> = {
  Sales: ['customers', 'orders', 'products', 'sales_reps', 'subscriptions'],
  Finance: ['invoices', 'orders', 'customers', 'subscriptions', 'revenue_by_quarter'],
  Admin: [
    'customers',
    'orders',
    'products',
    'sales_reps',
    'invoices',
    'subscriptions',
    'revenue_by_quarter',
    'system_audit_logs',
  ],
};

/**
 * Returns mock schema response according to the requested role.
 */
export function getMockSchema(role: string): SchemaResponse {
  const allowedNames = ROLE_DEFAULT_PERMISSIONS[role] || [
    'customers',
    'orders',
    'products',
    'subscriptions',
  ];

  const tables = allowedNames.map((name) => DEMO_TABLES[name]).filter(Boolean);

  return {
    role,
    tables,
  };
}

// Session conversation tracking for realistic follow-ups in demo mode
interface SessionContext {
  lastTopic?: 'customers' | 'orders' | 'revenue' | 'products' | 'invoices' | 'subscriptions';
  lastSql?: string;
  hasDateFilter?: boolean;
  hasCityGroup?: boolean;
}

const sessionContextStore = new Map<string, SessionContext>();

/**
 * Generates realistic MySQL responses for queries, handling follow-ups like:
 * - "now only for last month"
 * - "group that by city"
 * - "show top 10 customers by revenue"
 */
export function processMockChatQuery(
  question: string,
  role: string,
  sessionId: string,
  userEmail: string
): ChatQueryResponse {
  const q = question.trim().toLowerCase();
  let ctx = sessionContextStore.get(sessionId) || {};

  // Intentional error trigger for testing error handling
  if (q.includes('test error') || q.includes('cause error') || q.includes('syntax error')) {
    return {
      ok: false,
      error: 'Error 1064 (42000): You have an error in your SQL syntax near line 1. Please rephrase your query.',
    };
  }

  // Check read-only protection if user attempts write actions
  if (/^(insert|update|delete|drop|alter|truncate|create|replace)\b/i.test(q)) {
    return {
      ok: false,
      error: 'Security Error: Write and schema modification commands are blocked. AskDB is strictly read-only.',
    };
  }

  // 1. Follow-up: "now only for last month" or date narrowing
  if (
    q.includes('last month') ||
    q.includes('past 30 days') ||
    q.includes('only for last month') ||
    (q.startsWith('now ') && q.includes('month'))
  ) {
    ctx.hasDateFilter = true;
    sessionContextStore.set(sessionId, ctx);

    if (ctx.hasCityGroup) {
      const sql = `SELECT \n  c.city,\n  COUNT(DISTINCT c.id) AS active_accounts,\n  COUNT(o.id) AS total_orders,\n  ROUND(SUM(o.total_amount), 2) AS monthly_revenue\nFROM customers c\nJOIN orders o ON c.id = o.customer_id\nWHERE o.order_date >= DATE_SUB(CURDATE(), INTERVAL 1 MONTH)\n  AND o.status = 'completed'\nGROUP BY c.city\nORDER BY monthly_revenue DESC\nLIMIT 100;`;
      const rows = [
        { city: 'San Francisco', active_accounts: 48, total_orders: 142, monthly_revenue: 148500.0 },
        { city: 'New York', active_accounts: 62, total_orders: 189, monthly_revenue: 198250.5 },
        { city: 'Austin', active_accounts: 31, total_orders: 98, monthly_revenue: 92400.0 },
        { city: 'London', active_accounts: 27, total_orders: 84, monthly_revenue: 84120.0 },
        { city: 'Berlin', active_accounts: 19, total_orders: 56, monthly_revenue: 59300.0 },
        { city: 'Tokyo', active_accounts: 15, total_orders: 41, monthly_revenue: 47800.0 },
        { city: 'Toronto', active_accounts: 14, total_orders: 39, monthly_revenue: 38200.0 },
      ];
      return {
        ok: true,
        sql,
        explanation: 'Filtered the city revenue breakdown to completed orders placed within the last 30 days.',
        rowCount: rows.length,
        columns: ['city', 'active_accounts', 'total_orders', 'monthly_revenue'],
        rows,
      };
    }

    const sql = `SELECT \n  c.company_name,\n  c.tier,\n  c.city,\n  COUNT(o.id) AS orders_last_month,\n  ROUND(SUM(o.total_amount), 2) AS revenue_last_month\nFROM customers c\nJOIN orders o ON c.id = o.customer_id\nWHERE o.order_date >= DATE_SUB(CURDATE(), INTERVAL 1 MONTH)\n  AND o.status = 'completed'\nGROUP BY c.id, c.company_name, c.tier, c.city\nORDER BY revenue_last_month DESC\nLIMIT 100;`;
    const rows = [
      { company_name: 'Nexus Cloud Technologies', tier: 'Enterprise', city: 'San Francisco', orders_last_month: 8, revenue_last_month: 52400.0 },
      { company_name: 'Apex Global Financial', tier: 'Enterprise', city: 'New York', orders_last_month: 11, revenue_last_month: 48900.0 },
      { company_name: 'Starlight Media Network', tier: 'Growth', city: 'Austin', orders_last_month: 5, revenue_last_month: 24350.0 },
      { company_name: 'Aether Robotics Corp', tier: 'Growth', city: 'London', orders_last_month: 4, revenue_last_month: 19800.0 },
      { company_name: 'BlueWave Logistics LLC', tier: 'Starter', city: 'Chicago', orders_last_month: 3, revenue_last_month: 12500.0 },
      { company_name: 'OmniHealth Solutions', tier: 'Growth', city: 'Boston', orders_last_month: 3, revenue_last_month: 11200.0 },
      { company_name: 'Vanguard Cyber Systems', tier: 'Enterprise', city: 'Seattle', orders_last_month: 2, revenue_last_month: 9800.0 },
    ];
    return {
      ok: true,
      sql,
      explanation: 'Narrowed previous customer revenue analysis strictly to transactions completed in the last 1 month.',
      rowCount: rows.length,
      columns: ['company_name', 'tier', 'city', 'orders_last_month', 'revenue_last_month'],
      rows,
    };
  }

  // 2. Follow-up: "group that by city" or geographical aggregation
  if (
    q.includes('group that by city') ||
    q.includes('by city') ||
    q.includes('aggregate by city') ||
    q.includes('grouped by city')
  ) {
    ctx.hasCityGroup = true;
    sessionContextStore.set(sessionId, ctx);

    const dateClause = ctx.hasDateFilter
      ? "WHERE o.order_date >= DATE_SUB(CURDATE(), INTERVAL 1 MONTH)\n  AND o.status = 'completed'"
      : "WHERE o.status = 'completed'";

    const sql = `SELECT \n  c.city,\n  c.country,\n  COUNT(DISTINCT c.id) AS client_count,\n  COUNT(o.id) AS order_count,\n  ROUND(SUM(o.total_amount), 2) AS total_revenue,\n  ROUND(AVG(o.total_amount), 2) AS avg_order_value\nFROM customers c\nJOIN orders o ON c.id = o.customer_id\n${dateClause}\nGROUP BY c.city, c.country\nORDER BY total_revenue DESC\nLIMIT 100;`;

    const rows = [
      { city: 'New York', country: 'United States', client_count: 84, order_count: 320, total_revenue: 842100.5, avg_order_value: 2631.56 },
      { city: 'San Francisco', country: 'United States', client_count: 72, order_count: 295, total_revenue: 789400.0, avg_order_value: 2675.93 },
      { city: 'London', country: 'United Kingdom', client_count: 46, order_count: 182, total_revenue: 495200.0, avg_order_value: 2720.88 },
      { city: 'Austin', country: 'United States', client_count: 38, order_count: 144, total_revenue: 378600.0, avg_order_value: 2629.17 },
      { city: 'Berlin', country: 'Germany', client_count: 29, order_count: 98, total_revenue: 264300.0, avg_order_value: 2696.94 },
      { city: 'Singapore', country: 'Singapore', client_count: 24, order_count: 86, total_revenue: 231500.0, avg_order_value: 2691.86 },
      { city: 'Toronto', country: 'Canada', client_count: 21, order_count: 74, total_revenue: 198400.0, avg_order_value: 2681.08 },
      { city: 'Tokyo', country: 'Japan', client_count: 18, order_count: 62, total_revenue: 172900.0, avg_order_value: 2788.71 },
    ];

    return {
      ok: true,
      sql,
      explanation: 'Grouped and aggregated order revenue by customer headquarters city and country.',
      rowCount: rows.length,
      columns: ['city', 'country', 'client_count', 'order_count', 'total_revenue', 'avg_order_value'],
      rows,
    };
  }

  // 3. Customers / Top Revenue
  if (
    q.includes('customer') ||
    q.includes('client') ||
    q.includes('top 10') ||
    q.includes('top customers') ||
    q.includes('highest spending')
  ) {
    ctx.lastTopic = 'customers';
    ctx.hasCityGroup = false;
    ctx.hasDateFilter = false;
    sessionContextStore.set(sessionId, ctx);

    const sql = `SELECT \n  c.id,\n  c.company_name,\n  c.contact_name,\n  c.city,\n  c.tier,\n  COUNT(o.id) AS total_orders,\n  ROUND(SUM(o.total_amount), 2) AS total_spent_usd\nFROM customers c\nLEFT JOIN orders o ON c.id = o.customer_id AND o.status = 'completed'\nGROUP BY c.id, c.company_name, c.contact_name, c.city, c.tier\nORDER BY total_spent_usd DESC\nLIMIT 10;`;

    const rows = [
      { id: 1042, company_name: 'Nexus Cloud Technologies', contact_name: 'Eleanor Vance', city: 'San Francisco', tier: 'Enterprise', total_orders: 42, total_spent_usd: 348200.0 },
      { id: 1018, company_name: 'Apex Global Financial', contact_name: 'Marcus Sterling', city: 'New York', tier: 'Enterprise', total_orders: 38, total_spent_usd: 312500.5 },
      { id: 1105, company_name: 'Starlight Media Network', contact_name: 'Chloe Zhang', city: 'Austin', tier: 'Enterprise', total_orders: 29, total_spent_usd: 245900.0 },
      { id: 1089, company_name: 'Aether Robotics Corp', contact_name: 'Siddharth Rao', city: 'London', tier: 'Growth', total_orders: 24, total_spent_usd: 198400.0 },
      { id: 1074, company_name: 'Vanguard Cyber Systems', contact_name: 'Hanna Lindqvist', city: 'Seattle', tier: 'Enterprise', total_orders: 21, total_spent_usd: 187650.0 },
      { id: 1133, company_name: 'OmniHealth Solutions', contact_name: 'Dr. Tariq Al-Mansoor', city: 'Boston', tier: 'Growth', total_orders: 19, total_spent_usd: 164200.0 },
      { id: 1092, company_name: 'BlueWave Logistics LLC', contact_name: 'Mateo Morales', city: 'Chicago', tier: 'Starter', total_orders: 16, total_spent_usd: 142100.0 },
      { id: 1204, company_name: 'Solaris Energy Group', contact_name: 'Freja Nygard', city: 'Berlin', tier: 'Growth', total_orders: 15, total_spent_usd: 139800.0 },
      { id: 1150, company_name: 'Quantum Peak Capital', contact_name: 'Julian Davenport', city: 'London', tier: 'Enterprise', total_orders: 14, total_spent_usd: 128450.0 },
      { id: 1061, company_name: 'Horizon Biotech Labs', contact_name: 'Sarah Chen', city: 'San Diego', tier: 'Growth', total_orders: 12, total_spent_usd: 115300.0 },
    ];

    return {
      ok: true,
      sql,
      explanation: 'Identified top 10 enterprise and commercial accounts ranked by lifetime completed order volume.',
      rowCount: rows.length,
      columns: ['id', 'company_name', 'contact_name', 'city', 'tier', 'total_orders', 'total_spent_usd'],
      rows,
    };
  }

  // 4. Invoices / Accounts Receivable
  if (q.includes('invoice') || q.includes('unpaid') || q.includes('overdue') || q.includes('balance') || q.includes('receivable')) {
    ctx.lastTopic = 'invoices';
    sessionContextStore.set(sessionId, ctx);

    const sql = `SELECT \n  i.invoice_number,\n  c.company_name,\n  i.amount_due,\n  i.due_date,\n  i.status,\n  DATEDIFF(CURDATE(), i.due_date) AS days_overdue\nFROM invoices i\nJOIN orders o ON i.order_id = o.id\nJOIN customers c ON o.customer_id = c.id\nWHERE i.status IN ('overdue', 'issued')\nORDER BY i.due_date ASC\nLIMIT 100;`;

    const rows = [
      { invoice_number: 'INV-2026-0891', company_name: 'Solaris Energy Group', amount_due: 18450.0, due_date: '2026-09-15', status: 'overdue', days_overdue: 31 },
      { invoice_number: 'INV-2026-0904', company_name: 'Horizon Biotech Labs', amount_due: 9200.0, due_date: '2026-09-28', status: 'overdue', days_overdue: 18 },
      { invoice_number: 'INV-2026-0940', company_name: 'BlueWave Logistics LLC', amount_due: 12500.0, due_date: '2026-10-05', status: 'overdue', days_overdue: 11 },
      { invoice_number: 'INV-2026-0962', company_name: 'Starlight Media Network', amount_due: 34100.0, due_date: '2026-10-20', status: 'issued', days_overdue: -4 },
      { invoice_number: 'INV-2026-0985', company_name: 'Apex Global Financial', amount_due: 48900.0, due_date: '2026-10-31', status: 'issued', days_overdue: -15 },
    ];

    return {
      ok: true,
      sql,
      explanation: 'Retrieved pending and past-due accounts receivable invoices calculated against current payment terms.',
      rowCount: rows.length,
      columns: ['invoice_number', 'company_name', 'amount_due', 'due_date', 'status', 'days_overdue'],
      rows,
    };
  }

  // 5. Products / Inventory
  if (q.includes('product') || q.includes('stock') || q.includes('inventory') || q.includes('sku') || q.includes('unit price')) {
    ctx.lastTopic = 'products';
    sessionContextStore.set(sessionId, ctx);

    const sql = `SELECT \n  p.id AS sku,\n  p.product_name,\n  p.category,\n  p.unit_price,\n  p.stock_quantity,\n  CASE \n    WHEN p.stock_quantity < 20 THEN 'CRITICAL LOW'\n    WHEN p.stock_quantity < 50 THEN 'REORDER'\n    ELSE 'OPTIMAL'\n  END AS stock_health\nFROM products p\nWHERE p.is_active = 1\nORDER BY p.stock_quantity ASC\nLIMIT 100;`;

    const rows = [
      { sku: 101, product_name: 'Enterprise AI Copilot Seat', category: 'Cloud', unit_price: 1200.0, stock_quantity: 12, stock_health: 'CRITICAL LOW' },
      { sku: 104, product_name: 'Threat Shield SOC Connector', category: 'Security', unit_price: 3400.0, stock_quantity: 18, stock_health: 'CRITICAL LOW' },
      { sku: 108, product_name: 'Real-time Telemetry Pipeline', category: 'Analytics', unit_price: 2800.0, stock_quantity: 34, stock_health: 'REORDER' },
      { sku: 112, product_name: 'Multi-region Database Replica', category: 'Cloud', unit_price: 4500.0, stock_quantity: 48, stock_health: 'REORDER' },
      { sku: 115, product_name: 'Single Sign-On SAML Suite', category: 'Security', unit_price: 950.0, stock_quantity: 140, stock_health: 'OPTIMAL' },
      { sku: 120, product_name: 'Embedded Dashboard License', category: 'Analytics', unit_price: 1800.0, stock_quantity: 210, stock_health: 'OPTIMAL' },
    ];

    return {
      ok: true,
      sql,
      explanation: 'Audited active catalog software licenses and grouped by operational provisioning capacity.',
      rowCount: rows.length,
      columns: ['sku', 'product_name', 'category', 'unit_price', 'stock_quantity', 'stock_health'],
      rows,
    };
  }

  // 6. Subscriptions / MRR / Churn
  if (q.includes('subscription') || q.includes('mrr') || q.includes('churn') || q.includes('recurring') || q.includes('plan')) {
    ctx.lastTopic = 'subscriptions';
    sessionContextStore.set(sessionId, ctx);

    const sql = `SELECT \n  s.plan_name,\n  COUNT(s.id) AS active_subscribers,\n  ROUND(SUM(s.mrr), 2) AS total_mrr_usd,\n  ROUND(AVG(s.mrr), 2) AS arpu_usd,\n  SUM(CASE WHEN s.status = 'churned' THEN 1 ELSE 0 END) AS churned_count\nFROM subscriptions s\nGROUP BY s.plan_name\nORDER BY total_mrr_usd DESC\nLIMIT 100;`;

    const rows = [
      { plan_name: 'Enterprise Plus', active_subscribers: 284, total_mrr_usd: 852000.0, arpu_usd: 3000.0, churned_count: 4 },
      { plan_name: 'Growth Dedicated', active_subscribers: 740, total_mrr_usd: 518000.0, arpu_usd: 700.0, churned_count: 12 },
      { plan_name: 'Standard Team', active_subscribers: 1890, total_mrr_usd: 378000.0, arpu_usd: 200.0, churned_count: 28 },
      { plan_name: 'Developer Starter', active_subscribers: 420, total_mrr_usd: 41580.0, arpu_usd: 99.0, churned_count: 19 },
    ];

    return {
      ok: true,
      sql,
      explanation: 'Summarized Monthly Recurring Revenue (MRR) contributions and churn breakdown across subscription tiers.',
      rowCount: rows.length,
      columns: ['plan_name', 'active_subscribers', 'total_mrr_usd', 'arpu_usd', 'churned_count'],
      rows,
    };
  }

  // 7. Sales Reps / Quota
  if (q.includes('sales rep') || q.includes('quota') || q.includes('commission') || q.includes('rep') || q.includes('attainment')) {
    const sql = `SELECT \n  sr.full_name,\n  sr.region,\n  sr.quarterly_quota,\n  ROUND(COALESCE(SUM(o.total_amount), 0), 2) AS closed_revenue,\n  ROUND((COALESCE(SUM(o.total_amount), 0) / sr.quarterly_quota) * 100, 1) AS quota_attainment_pct\nFROM sales_reps sr\nLEFT JOIN orders o ON sr.id = o.sales_rep_id AND o.status = 'completed'\nGROUP BY sr.id, sr.full_name, sr.region, sr.quarterly_quota\nORDER BY quota_attainment_pct DESC\nLIMIT 100;`;

    const rows = [
      { full_name: 'Claire Beauchamp', region: 'NA-East', quarterly_quota: 250000.0, closed_revenue: 318000.0, quota_attainment_pct: 127.2 },
      { full_name: 'Kenji Takahashi', region: 'APAC', quarterly_quota: 200000.0, closed_revenue: 242500.0, quota_attainment_pct: 121.3 },
      { full_name: 'Sofia Almodovar', region: 'EMEA', quarterly_quota: 220000.0, closed_revenue: 259600.0, quota_attainment_pct: 118.0 },
      { full_name: 'Marcus Brody', region: 'NA-West', quarterly_quota: 260000.0, closed_revenue: 284100.0, quota_attainment_pct: 109.3 },
      { full_name: 'Elena Rostova', region: 'EMEA', quarterly_quota: 210000.0, closed_revenue: 198000.0, quota_attainment_pct: 94.3 },
    ];

    return {
      ok: true,
      sql,
      explanation: 'Evaluated sales executive quarterly quota attainment and closed-won contract revenue.',
      rowCount: rows.length,
      columns: ['full_name', 'region', 'quarterly_quota', 'closed_revenue', 'quota_attainment_pct'],
      rows,
    };
  }

  // 8. General / Fallback query synthesizer
  const sql = `SELECT \n  o.id AS order_id,\n  c.company_name AS customer,\n  c.city,\n  o.order_date,\n  o.total_amount,\n  o.status\nFROM orders o\nJOIN customers c ON o.customer_id = c.id\nWHERE o.order_date >= DATE_SUB(CURDATE(), INTERVAL 60 DAY)\nORDER BY o.order_date DESC\nLIMIT 15;`;

  const rows = [
    { order_id: 8749, customer: 'Nexus Cloud Technologies', city: 'San Francisco', order_date: '2026-10-14 14:22:10', total_amount: 14200.0, status: 'completed' },
    { order_id: 8748, customer: 'Apex Global Financial', city: 'New York', order_date: '2026-10-13 09:15:42', total_amount: 28900.5, status: 'completed' },
    { order_id: 8747, customer: 'Starlight Media Network', city: 'Austin', order_date: '2026-10-12 18:04:19', total_amount: 8400.0, status: 'completed' },
    { order_id: 8746, customer: 'Aether Robotics Corp', city: 'London', order_date: '2026-10-11 11:47:03', total_amount: 6250.0, status: 'pending' },
    { order_id: 8745, customer: 'Solaris Energy Group', city: 'Berlin', order_date: '2026-10-10 16:30:55', total_amount: 11800.0, status: 'completed' },
    { order_id: 8744, customer: 'BlueWave Logistics LLC', city: 'Chicago', order_date: '2026-10-09 13:12:08', total_amount: 4500.0, status: 'completed' },
  ];

  return {
    ok: true,
    sql,
    explanation: `Executed read-only query analyzing recent company records for role "${role}".`,
    rowCount: rows.length,
    columns: ['order_id', 'customer', 'city', 'order_date', 'total_amount', 'status'],
    rows,
  };
}
