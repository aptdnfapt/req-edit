import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));

app.post('/api/run', async (req, res) => {
  const { url, method, headers, body, stream } = req.body;

  try {
    const fetchHeaders: Record<string, string> = {};
    headers.forEach((h: { key: string; value: string }) => {
      if (h.key && h.value) fetchHeaders[h.key] = h.value;
    });

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

app.listen(8679, '0.0.0.0', () => {
  console.log('Proxy server running on http://0.0.0.0:8679');
});
