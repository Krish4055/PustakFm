import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health / Config endpoint
app.get('/api/config', (_req: Request, res: Response) => {
  res.json({
    envN8nBaseUrl: process.env.N8N_BASE_URL || process.env.VITE_N8N_BASE_URL || '',
    status: 'ok',
    mode: (process.env.N8N_BASE_URL || process.env.VITE_N8N_BASE_URL) ? 'n8n' : 'demo'
  });
});

// Proxy to n8n webhook to eliminate CORS issues on private or remote n8n instances
app.post('/api/proxy/sql-chat', async (req: Request, res: Response) => {
  try {
    const targetUrl = (req.headers['x-target-n8n-url'] as string) || process.env.N8N_BASE_URL || process.env.VITE_N8N_BASE_URL;
    if (!targetUrl) {
      return res.status(400).json({ ok: false, error: 'No N8N_BASE_URL configured on server or in request header.' });
    }

    const cleanBaseUrl = targetUrl.replace(/\/+$/, '');
    const chatEndpoint = `${cleanBaseUrl}/sql-chat`;

    const upstreamRes = await fetch(chatEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(req.body),
    });

    const data = await upstreamRes.json().catch(async () => {
      const text = await upstreamRes.text();
      return { ok: false, error: text || `Upstream returned status ${upstreamRes.status}` };
    });

    return res.status(upstreamRes.status).json(data);
  } catch (err: any) {
    console.error('Proxy sql-chat error:', err);
    return res.status(502).json({
      ok: false,
      error: `Failed to connect to n8n webhook: ${err.message || 'Network error'}`,
    });
  }
});

app.get('/api/proxy/sql-schema', async (req: Request, res: Response) => {
  try {
    const targetUrl = (req.headers['x-target-n8n-url'] as string) || process.env.N8N_BASE_URL || process.env.VITE_N8N_BASE_URL;
    if (!targetUrl) {
      return res.status(400).json({ error: 'No N8N_BASE_URL configured.' });
    }

    const cleanBaseUrl = targetUrl.replace(/\/+$/, '');
    const role = (req.query.role as string) || 'Admin';
    const schemaEndpoint = `${cleanBaseUrl}/sql-schema?role=${encodeURIComponent(role)}`;

    const upstreamRes = await fetch(schemaEndpoint);
    const data = await upstreamRes.json().catch(async () => {
      const text = await upstreamRes.text();
      return { error: text || `Upstream returned status ${upstreamRes.status}` };
    });

    return res.status(upstreamRes.status).json(data);
  } catch (err: any) {
    console.error('Proxy sql-schema error:', err);
    return res.status(502).json({
      error: `Failed to fetch schema from n8n webhook: ${err.message || 'Network error'}`,
    });
  }
});

// Configure Vite middlewares in development or serve static build in production
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(port, () => {
    console.log(`AskDB server running on port ${port} (${isProd ? 'production' : 'development'})`);
  });
}

startServer();
