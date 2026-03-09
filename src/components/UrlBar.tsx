import React from 'react';

interface Props {
  url: string;
  method: string;
  onUrlChange: (url: string) => void;
  onMethodChange: (method: string) => void;
  colors: any;
}

export function UrlBar({ url, method, onUrlChange, onMethodChange, colors }: Props) {
  const styles = getStyles(colors);

  return (
    <div style={styles.container}>
      <select value={method} onChange={e => onMethodChange(e.target.value)} style={styles.select}>
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

function getStyles(c: any): Record<string, React.CSSProperties> {
  return {
    container: {
      display: 'flex',
      gap: '4px',
      alignItems: 'center',
    },
    select: {
      padding: '5px 8px',
      border: `1px solid ${c.border}`,
      backgroundColor: c.bgAlt2,
      color: c.text,
      fontSize: '10px',
      fontWeight: 600,
      cursor: 'pointer',
      width: '65px',
    },
    input: {
      flex: 1,
      padding: '5px 8px',
      border: `1px solid ${c.border}`,
      backgroundColor: c.bgAlt2,
      color: c.textMuted,
      fontSize: '10px',
      fontFamily: 'monospace',
      minWidth: 0,
    },
  };
}