import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

const staticDir = __dirname;
app.use(express.static(staticDir));

app.use(cors());
app.use(express.json({ limit: '10mb' }));

app.post('/api/run', async (req, res) => {
  const { url, method, headers, body, stream } = req.body;

  try {
    const fetchHeaders: Record<string, string> = {};
    if (Array.isArray(headers)) {
      headers.forEach((h: { key: string; value: string }) => {
        if (h.key && h.value) fetchHeaders[h.key] = h.value;
      });
    } else if (headers && typeof headers === 'object') {
      Object.entries(headers).forEach(([key, value]) => {
        if (key && value) fetchHeaders[key] = String(value);
      });
    }

    const response = await fetch(url, {
      method: method || 'GET',
      headers: fetchHeaders,
      body: body ? JSON.stringify(body) : undefined,
    });

    const contentType = response.headers.get('content-type') || '';
    
    if (stream || contentType.includes('text/event-stream')) {
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
      
      const reader = response.body?.getReader();
      if (!reader) {
        res.status(500).json({ error: 'No response body' });
        return;
      }
      
      const decoder = new TextDecoder();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        res.write(decoder.decode(value));
      }
      res.end();
    } else {
      const data = await response.text();
      let json;
      try {
        json = JSON.parse(data);
      } catch {
        json = { raw: data };
      }
      
      if (!response.ok) {
        res.status(response.status).json({ error: json, status: response.status });
      } else {
        res.json(json);
      }
    }
  } catch (err) {
    const error = err as Error;
    res.status(500).json({ 
      error: error.message,
      stack: error.stack 
    });
  }
});



const PORT = process.env.PORT || 8678;
const HOST = process.env.HOST || 'localhost';
app.listen(Number(PORT), HOST, () => {
  console.log(`LLM Request Block Editor running at http://${HOST}:${PORT}`);
});
