# AskDB - Natural Language Team MySQL Explorer & Analytics

**AskDB** is a responsive, enterprise-ready web platform that enables cross-functional teams (Sales, Finance, Operations, Leadership) to query company MySQL databases using plain English. 

Users chat with their database naturally, inspect the generated SQL, view interactive result tables with sorting and CSV export, and manage team queries—**without the frontend ever holding direct database credentials**. All query translation, execution, and schema filtering are mediated through two lightweight **n8n webhooks** or an intelligent, multi-turn **Demo Engine**.

---

## Architecture Overview

```
                                      +------------------------------------+
                                      |            n8n Webhook             |
                                      |   (AI / LLM Node + MySQL Node)     |
                                      +-----------------+------------------+
                                                        ^
                         HTTPS POST /sql-chat           |
                         HTTPS GET /sql-schema          | (Read-only execution,
                                                        |  LIMIT 100 enforced)
                                                        v
                                      +-----------------+------------------+
                                      |         Company MySQL DB           |
                                      |   (Customers, Orders, Invoices...) |
                                      +------------------------------------+
                                                        ^
                                                        |
+-------------------------------------------------------+---------------------------------------+
| AskDB Application                                                                             |
|                                                                                               |
|  +--------------------+     Direct or Proxy     +--------------------+     +----------------+ |
|  | React 19 Frontend  | ----------------------> | Node / Express API |     |  Demo Engine   | |
|  | - Table Browser    |                         | - /api/proxy/chat  | <-> |  - Mock Schema | |
|  | - SQL Highlighter  |                         | - /api/proxy/schema|     |  - Follow-up   | |
|  | - Results Table    |                         | - /api/config      |     |    Synthesizer | |
|  | - CSV Exporter     |                         +--------------------+     +----------------+ |
|  | - Role RBAC Matrix |                                                                       |
|  +--------------------+                                                                       |
+-----------------------------------------------------------------------------------------------+
```

### Key Architectural Principles
1. **Zero Database Credentials in Frontend**: No database passwords, hostnames, or connection strings ever exist on the client side.
2. **Webhook-Driven**: The client only communicates through standard JSON HTTP endpoints.
3. **Fail-Safe Demo Mode**: When `N8N_BASE_URL` is unset or offline, AskDB seamlessly switches to an internal multi-turn Demo Engine with realistic B2B MySQL tables.
4. **Built-in CORS Proxy**: The Express server includes proxy routes (`/api/proxy/*`) that forward requests with `x-target-n8n-url`, eliminating browser CORS issues when testing private or custom n8n instances.
5. **Strict Read-Only Governance**: All queries are read-only and automatically limited to 100 rows. Destructive DDL/DML keywords (`DROP`, `DELETE`, `UPDATE`, `INSERT`, `ALTER`) are blocked at both client and backend layers.

---

## API Contract (n8n Webhooks)

AskDB communicates with n8n via two primary endpoints:

### 1. Chat Query: `POST {N8N_BASE_URL}/sql-chat`

Used to translate natural language into SQL, execute the query on MySQL, and return structured tabular results.

**Request Body (`application/json`):**
```json
{
  "question": "Show top 10 customers by revenue and tier",
  "role": "Sales",
  "session_id": "session_1729065600000_abc123",
  "user_email": "alex.rivera@company.com"
}
```

**Success Response (`200 OK`):**
```json
{
  "ok": true,
  "sql": "SELECT c.id, c.company_name, c.tier, ROUND(SUM(o.total_amount), 2) AS total_revenue FROM customers c JOIN orders o ON c.id = o.customer_id WHERE o.status = 'completed' GROUP BY c.id, c.company_name, c.tier ORDER BY total_revenue DESC LIMIT 10;",
  "explanation": "Identified top 10 commercial accounts ranked by lifetime completed order volume.",
  "rowCount": 10,
  "columns": ["id", "company_name", "tier", "total_revenue"],
  "rows": [
    { "id": 1042, "company_name": "Nexus Cloud Technologies", "tier": "Enterprise", "total_revenue": 348200.00 },
    { "id": 1018, "company_name": "Apex Global Financial", "tier": "Enterprise", "total_revenue": 312500.50 }
  ]
}
```

**Error Response (`400 Bad Request` or `500 Server Error`):**
```json
{
  "ok": false,
  "error": "Error 1054 (42S22): Unknown column 'profit_margin' in 'field list'. Available columns in orders: [id, customer_id, total_amount, order_date, status]."
}
```

---

### 2. Schema Browser: `GET {N8N_BASE_URL}/sql-schema?role={role}`

Used by the left sidebar to dynamically render table structures and column definitions permitted for the user's role.

**Response (`200 OK`):**
```json
{
  "role": "Sales",
  "tables": [
    {
      "name": "customers",
      "description": "B2B accounts, primary contacts, and geographic locations",
      "rowCountEstimate": 1420,
      "columns": [
        { "name": "id", "type": "INT UNSIGNED AUTO_INCREMENT", "comment": "Unique customer identifier" },
        { "name": "company_name", "type": "VARCHAR(255)", "comment": "Registered legal company name" },
        { "name": "tier", "type": "ENUM('Starter', 'Growth', 'Enterprise')", "comment": "Account tier" },
        { "name": "city", "type": "VARCHAR(100)", "comment": "Headquarters city" }
      ]
    },
    {
      "name": "orders",
      "description": "Transaction receipts and checkout records",
      "rowCountEstimate": 8750,
      "columns": [
        { "name": "id", "type": "INT UNSIGNED AUTO_INCREMENT", "comment": "Unique order ID" },
        { "name": "customer_id", "type": "INT UNSIGNED", "comment": "Foreign key to customers.id" },
        { "name": "order_date", "type": "DATETIME", "comment": "Transaction timestamp" },
        { "name": "total_amount", "type": "DECIMAL(12,2)", "comment": "Gross order value in USD" },
        { "name": "status", "type": "ENUM('pending', 'completed', 'cancelled')", "comment": "Order state" }
      ]
    }
  ]
}
```

---

## Screen & Feature Walkthrough

### 1. Authentication (`src/services/auth.ts`, `LoginScreen.tsx`)
- **Email & Role Selection**: Authenticates user email with preset roles (`Sales`, `Finance`, `Admin`) or custom typed roles (e.g. `Marketing`, `Engineering`).
- **One-Click Demo Profiles**: Pre-populated demo profiles (Alex Rivera / Sales, Jordan Lee / Finance, Morgan Vance / Admin) for instant team testing.
- **Swappable Architecture**: Session is stored in local storage with an observer pattern; easily replaced with corporate SSO (OIDC/SAML/Google Workspace).

### 2. Schema Browser Sidebar (`TableBrowserSidebar.tsx`)
- Displays role-filtered tables and columns.
- **Real-Time Search**: Instant filtering across table names, column names, data types, and comments.
- **One-Click Prompt Insertion**: Clicking any table or column name automatically inserts it into the chat prompt.
- **Responsive Mobile Drawer**: Slides out as an overlay on mobile devices with backdrop dismiss.

### 3. Conversational SQL Workspace (`ChatTab.tsx`, `ChatMessageItem.tsx`)
- **Stable Session State**: Maintains a persistent `session_id` to enable natural multi-turn follow-ups (e.g., *"now only for last month"*, *"group that by city"*).
- **New Chat**: Generates a fresh session ID with one click while keeping historical records preserved.
- **Typing Indicator**: Shows live loading pulses and webhook connection indicators.
- **Friendly Error Handling**: Formats SQL syntax errors, unknown column errors, or permission denials with tips to rephrase.

### 4. SQL Inspector & Results Table (`SqlCodeBlock.tsx`, `ResultsTable.tsx`)
- **One-Line Explanation**: Provides human-readable business context above technical output.
- **Collapsible SQL Block**: Custom syntax-highlighted SQL with keyword coloring (`SELECT`, `JOIN`, `WHERE`, etc.), **Copy SQL** button, and inline **Edit & Run** mode.
- **Sortable Columns**: Click any column header to toggle sort (Ascending $\rightarrow$ Descending $\rightarrow$ Reset).
- **Sticky Table Header**: Table headers stay locked at the top when scrolling through long rowsets.
- **Horizontal Scrolling**: Seamless horizontal pan for wide tables with many columns.
- **Live In-Table Filter**: Instant client-side search to filter returned rows.
- **Export to CSV**: Formatted client-side CSV export with proper quotation escaping and timestamped filenames (`askdb-results-*.csv`).
- **Feedback Buttons**: 👍 / 👎 buttons with local storage persistence and optional improvement feedback notes.

### 5. History Screen (`HistoryScreen.tsx`)
- Searchable list of all past queries across sessions.
- Displays execution status (Success/Failed), timestamp, role, row counts, and SQL snippets.
- Filter by current user or team-wide queries.
- **One-Click Re-run**: Instantly reloads the query into the chat workspace.

### 6. Saved Queries & Team Sharing (`SavedQueriesScreen.tsx`)
- Save frequent business questions with titles, tags, and SQL code.
- **Team Sharing Toggle**: Mark queries as **"Shared with Team"** or keep them **"Private"**.
- Filter by All, Team Shared, or My Saved Queries.
- One-click execution button.

### 7. Admin Role & Table Access Matrix (`AdminMatrixScreen.tsx`)
- Restricted strictly to users with the `Admin` role.
- **Interactive Grid**: Roles as rows, MySQL tables as columns, with interactive checkboxes and batch row toggles ("All" / "None").
- **Custom Role Creation**: Create new roles directly within the matrix.
- **Backend Placeholder**: Prominently displays the target `PUT {N8N_BASE_URL}/sql-permissions` specification with a simulated sync workflow.

### 8. Settings & Connectivity (`SettingsModal.tsx`)
- Configure `N8N_BASE_URL` with inline URL validation.
- **Live Connection Test**: Pings `/sql-schema?role=Admin` to verify network reachability.
- **Demo Mode Toggle**: Switch between live n8n webhooks and mock demo data anytime.
- **Backend Proxy Toggle**: Toggle the Express proxy on/off to bypass browser CORS headers.
- **Theme Switcher**: Instant Dark Mode and Light Mode toggling.

---

## Technical Stack

| Layer | Technologies |
|---|---|
| **Frontend Framework** | React 19, TypeScript |
| **Styling & Design** | Tailwind CSS v4, JetBrains Mono & Inter typography, Dark/Light modes |
| **Icons & Visuals** | Lucide React (`lucide-react`) |
| **Build Tool** | Vite 8 with `@vitejs/plugin-react` and `@tailwindcss/vite` |
| **Backend & Proxy** | Express 4, TypeScript (`tsx`), Node.js `fetch` |
| **State & Storage** | LocalStorage with typed access layer (`storage.ts`, `auth.ts`) |

---

## File Structure

```
├── .env.example                  # Environment variable blueprint
├── index.html                    # HTML entry point with typography & meta tags
├── metadata.json                 # AI Studio applet manifest
├── package.json                  # Dependencies and execution scripts
├── server.ts                     # Express server, Vite middleware, & n8n CORS proxy
├── vite.config.ts                # Vite configuration with Tailwind CSS v4 plugin
├── public/
│   ├── icon.svg                  # SVG database icon
│   └── manifest.json             # Web App Manifest
└── src/
    ├── App.tsx                   # Main layout container and view router
    ├── index.css                 # Global styles, scrollbar styling, fonts
    ├── main.tsx                  # React DOM mounting
    ├── types/
    │   └── index.ts              # TypeScript interfaces for API, tables, & state
    ├── components/
    │   ├── Header.tsx            # Navigation bar, status pill, theme switch
    │   ├── LoginScreen.tsx       # Auth card, role selector, demo profiles
    │   ├── TableBrowserSidebar.tsx# Schema navigation with search & insert
    │   ├── ChatTab.tsx           # Main chat workspace & session manager
    │   ├── ChatMessageItem.tsx   # Message bubbles, explanation, feedback
    │   ├── SqlCodeBlock.tsx      # Syntax highlighter, copy, inline editor
    │   ├── ResultsTable.tsx      # Sortable, sticky table with CSV export
    │   ├── SaveQueryModal.tsx    # Modal to save queries with team toggle
    │   ├── HistoryScreen.tsx     # Searchable past queries log
    │   ├── SavedQueriesScreen.tsx# Curated team queries catalog
    │   ├── AdminMatrixScreen.tsx # Roles-and-tables permission matrix
    │   └── SettingsModal.tsx     # n8n URL config, connection tester, theme
    └── services/
        ├── api.ts                # Centralized API service with proxy fallback
        ├── auth.ts               # Swappable session and role manager
        ├── demoEngine.ts         # Multi-turn mock MySQL synthesizer
        └── storage.ts            # Local persistence for history, queries, & matrix
```

---

## Setup & Running Locally

### 1. Prerequisites
- Node.js 20+ installed
- npm or bun

### 2. Environment Variables
Create a `.env` file from `.env.example`:
```bash
cp .env.example .env
```

Set your webhook base URL (leave blank to run in Demo Mode):
```env
# URL where your n8n workflow exposes /sql-chat and /sql-schema
VITE_N8N_BASE_URL=https://my-n8n.com/webhook
N8N_BASE_URL=https://my-n8n.com/webhook
PORT=3000
```

### 3. Install & Start
```bash
# Install dependencies
npm install

# Start development server (serves Express + Vite on port 3000)
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Sample Queries to Try in Demo Mode

When running in **Demo Mode**, the engine includes realistic data models and multi-turn context tracking:

1. **Top Revenue Accounts**:
   > *"Show top 10 customers by revenue and tier"*
2. **Follow-up (Date filtering)**:
   > *"now only for last month"*
3. **Follow-up (Geographical aggregation)**:
   > *"group that by city"*
4. **Accounts Receivable**:
   > *"Show overdue invoices and days overdue"*
5. **Inventory Alert**:
   > *"Show low inventory products needing reorder"*
6. **Sales Quota Attainment**:
   > *"Which sales reps reached their quarterly quota?"*
7. **MRR Breakdown**:
   > *"Break down monthly recurring revenue across subscription tiers"*

---

## License

AskDB is distributed under the MIT License.
