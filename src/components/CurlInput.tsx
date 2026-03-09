import React from 'react';

interface Props {
  value: string;
  onChange: (v: string) => void;
  onParse: () => void;
}

export function CurlInput({ value, onChange, onParse }: Props) {
  return (
    <div style={styles.container}>
      <textarea
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder="Paste curl command..."
        style={styles.textarea}
        spellCheck={false}
        onKeyDown={e => {
          if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
            e.preventDefault();
            onParse();
          }
        }}
      />
      <button onClick={onParse} style={styles.button}>
        Parse
      </button>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    gap: '8px',
    alignItems: 'center',
  },
  textarea: {
    flex: 1,
    height: '36px',
    padding: '8px 12px',
    borderRadius: '6px',
    border: '1px solid #334155',
    backgroundColor: '#1e293b',
    color: '#e2e8f0',
    fontSize: '12px',
    fontFamily: 'monospace',
    resize: 'none',
  },
  button: {
    padding: '8px 16px',
    borderRadius: '6px',
    border: 'none',
    backgroundColor: '#3b82f6',
    color: 'white',
    fontWeight: 600,
    cursor: 'pointer',
    fontSize: '13px',
    whiteSpace: 'nowrap',
  },
};