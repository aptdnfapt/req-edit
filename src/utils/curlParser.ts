export interface ParsedCurl {
  url: string;
  method: string;
  headers: { key: string; value: string }[];
  body: any;
  raw: string;
}

function extractQuotedValue(str: string, startIndex: number): { value: string; endIndex: number } | null {
  if (startIndex >= str.length) return null;
  
  const quote = str[startIndex];
  if (quote !== "'" && quote !== '"') return null;
  
  let value = '';
  let i = startIndex + 1;
  
  while (i < str.length) {
    const char = str[i];
    
    if (quote === "'" && str.slice(i, i + 4) === "'\\''") {
      value += "'";
      i += 4;
      continue;
    }
    
    if (quote === '"' && char === '\\' && i + 1 < str.length) {
      const next = str[i + 1];
      if (next === 'n') { value += '\n'; i += 2; continue; }
      if (next === 't') { value += '\t'; i += 2; continue; }
      if (next === 'r') { value += '\r'; i += 2; continue; }
      if (next === '"' || next === '\\' || next === '/') { value += next; i += 2; continue; }
      value += char + next;
      i += 2;
      continue;
    }
    
    if (char === quote) {
      return { value, endIndex: i + 1 };
    }
    value += char;
    i++;
  }
  
  return { value, endIndex: i };
}

const SKIP_FLAGS = ['-s', '-S', '-L', '-l', '-i', '-I', '-k', '-v', '--silent', '--location', '--insecure', '--verbose'];

export function parseCurl(curlString: string): ParsedCurl {
  try {
    let str = curlString.trim();
    
    str = str.replace(/\\\s*\n/g, ' ');
    
    str = str.replace(/^curl\s+/i, '');
    
    let method = 'POST';
    let url = '';
    const headers: { key: string; value: string }[] = [];
    let body: any = null;
    
    let i = 0;
    while (i < str.length) {
      while (i < str.length && /\s/.test(str[i])) i++;
      if (i >= str.length) break;
      
      if (str[i] === '-' && SKIP_FLAGS.some(f => str.slice(i, i + f.length) === f)) {
        for (const f of SKIP_FLAGS) {
          if (str.slice(i, i + f.length) === f) {
            i += f.length;
            break;
          }
        }
        continue;
      }
      
      if (str.slice(i, i + 2) === '-X' || str.slice(i, i + 9) === '--request') {
        const flagLen = str[i + 1] === 'X' ? 2 : 9;
        i += flagLen;
        while (i < str.length && /\s/.test(str[i])) i++;
        let m = '';
        while (i < str.length && /[A-Za-z]/.test(str[i])) {
          m += str[i];
          i++;
        }
        method = m.toUpperCase() || 'POST';
        continue;
      }
      
      if (str.slice(i, i + 2) === '-H' || str.slice(i, i + 8) === '--header') {
        const flagLen = str[i + 1] === 'H' ? 2 : 8;
        i += flagLen;
        while (i < str.length && /\s/.test(str[i])) i++;
        
        const result = extractQuotedValue(str, i);
        if (result) {
          const headerStr = result.value;
          const colonIdx = headerStr.indexOf(':');
          if (colonIdx > 0) {
            const key = headerStr.slice(0, colonIdx).trim();
            const value = headerStr.slice(colonIdx + 1).trim();
            headers.push({ key, value });
          }
          i = result.endIndex;
        }
        continue;
      }
      
      if (str.slice(i, i + 2) === '-d' || 
          str.slice(i, i + 6) === '--data' ||
          str.slice(i, i + 10) === '--data-raw') {
        let flagLen = 2;
        if (str.slice(i, i + 10) === '--data-raw') flagLen = 10;
        else if (str.slice(i, i + 6) === '--data') flagLen = 6;
        
        i += flagLen;
        while (i < str.length && /\s/.test(str[i])) i++;
        
        const result = extractQuotedValue(str, i);
        if (result) {
          const bodyStr = result.value;
          try {
            body = JSON.parse(bodyStr);
          } catch {
            body = bodyStr;
          }
          i = result.endIndex;
        }
        continue;
      }
      
      if (str[i] === "'" || str[i] === '"') {
        const result = extractQuotedValue(str, i);
        if (result) {
          const val = result.value;
          if (val.startsWith('http://') || val.startsWith('https://')) {
            url = val;
          }
          i = result.endIndex;
          continue;
        }
      }
      
      if (str.slice(i, i + 7) === 'http://' || str.slice(i, i + 8) === 'https://') {
        let urlEnd = i;
        while (urlEnd < str.length && !/\s/.test(str[urlEnd])) {
          urlEnd++;
        }
        url = str.slice(i, urlEnd);
        i = urlEnd;
        continue;
      }
      
      i++;
    }
    
    return { url, method, headers, body, raw: curlString };
  } catch (e) {
    console.error('Failed to parse curl:', e);
    return { url: '', method: 'POST', headers: [], body: null, raw: curlString };
  }
}

export function toMinifiedCurl(parsed: ParsedCurl): string {
  const parts: string[] = ['curl'];
  
  if (parsed.method !== 'GET') {
    parts.push(`-X ${parsed.method}`);
  }
  
  parts.push(parsed.url);
  
  parsed.headers.forEach(h => {
    parts.push(`-H "${h.key}: ${h.value}"`);
  });
  
  if (parsed.body !== null && parsed.body !== undefined) {
    const bodyStr = typeof parsed.body === 'string' 
      ? parsed.body 
      : JSON.stringify(parsed.body);
    parts.push(`-d '${bodyStr}'`);
  }
  
  return parts.join(' ');
}

export function toPrettyCurl(parsed: ParsedCurl): string {
  const lines: string[] = ['curl'];
  
  if (parsed.method !== 'GET') {
    lines[0] += ` -X ${parsed.method}`;
  }
  
  lines[0] += ` ${parsed.url}`;
  
  parsed.headers.forEach((h, idx) => {
    const isLast = idx === parsed.headers.length - 1 && !parsed.body;
    lines.push(`  -H "${h.key}: ${h.value}"${isLast ? '' : ' \\'}`);
  });
  
  if (parsed.body !== null && parsed.body !== undefined) {
    const bodyStr = typeof parsed.body === 'string' 
      ? parsed.body 
      : JSON.stringify(parsed.body, null, 2);
    const formattedBody = bodyStr.split('\n').join('\n    ');
    lines.push(`  -d '${formattedBody}'`);
  }
  
  return lines.join(' \\\n');
}
