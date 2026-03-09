import React from 'react';

interface Props {
  url: string;
  method: string;
  onUrlChange: (url: string) => void;
  onMethodChange: (method: string) => void;
}

export function UrlBar({ url, method, onUrlChange, onMethodChange }: Props) {
  return (
    <div style={styles.container}>
      <select 
        value={method} 
        onChange={e => onMethodChange(e.target.value)}
        style={styles.select}
      >
        <option>GET</option>
        <option>POST</option>
        <option>PUT</option>
        <option>PATCH</option>
        <option>DELETE</option>
      </select>
      <input
        type="text"
        value={url}
        onChange={e => onUrlChange(e.target.value)}
        placeholder="https://api.example.com/endpoint"
        style={styles.input}
        spellCheck={false}
      />
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    gap: '6px',
    alignItems: 'center',
  },
  select: {
    padding: '6px 10px',
    borderRadius: '4px',
    border: '1px solid #334155',
    backgroundColor: '#1e293b',
    color: '#e2e8f0',
    fontSize: '11px',
    fontWeight: 600,
    cursor: 'pointer',
    width: '70px',
  },
  input: {
    flex: 1,
    padding: '6px 10px',
    borderRadius: '4px',
    border: '1px solid #334155',
    backgroundColor: '#1e293b',
    color: '#7dd3fc',
    fontSize: '11px',
    fontFamily: 'monospace',
    minWidth: 0,
  },
};