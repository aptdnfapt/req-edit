const API_BASE = '/api';

export interface RunParams {
  url: string;
  method: string;
  headers: { key: string; value: string }[];
  body: any;
  stream?: boolean;
  onChunk?: (chunk: string) => void;
}

export async function runRequest(params: RunParams): Promise<{ data?: any; error?: any }> {
  const { url, method, headers, body, stream, onChunk } = params;
  
  if (stream && onChunk) {
    const response = await fetch(`${API_BASE}/run`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url, method, headers, body, stream: true }),
    });
    
    const reader = response.body?.getReader();
    if (!reader) return { error: 'No response body' };
    
    const decoder = new TextDecoder();
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      onChunk(decoder.decode(value));
    }
    return { data: null };
  }
  
  const response = await fetch(`${API_BASE}/run`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url, method, headers, body }),
  });
  
  const data = await response.json();
  
  if (!response.ok || data.error) {
    return { error: data };
  }
  
  return { data };
}
