export type LLMProvider = 'openai' | 'anthropic' | 'unknown';

export function detectProvider(url: string): LLMProvider {
  if (url.includes('openai.com')) return 'openai';
  if (url.includes('anthropic.com')) return 'anthropic';
  return 'unknown';
}

export const colorMap: Record<string, string> = {
  model: '#00d4aa',
  messages: '#4a9eff',
  role: '#4a9eff',
  content: '#7dd3fc',
  system: '#fb923c',
  tools: '#a855f7',
  functions: '#a855f7',
  temperature: '#fbbf24',
  max_tokens: '#fbbf24',
  stream: '#94a3b8',
};

export function getKeyColor(key: string): string {
  const lowerKey = key.toLowerCase();
  for (const [match, color] of Object.entries(colorMap)) {
    if (lowerKey.includes(match)) return color;
  }
  return '#e2e8f0';
}
