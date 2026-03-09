import React from 'react';

interface Props {
  value: string;
  onChange: (v: string) => void;
  onParse: () => void;
}

export function CurlInput({ value, onChange, onParse }: Props) {
  return (
    <div style={styles.container}>
      <label style={styles.label}>Paste curl command:</label>
      <textarea
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder="curl -X POST https://api.openai.com/v1/chat/completions ..."
        style={styles.textarea}
        spellCheck={false}
      />
      <button onClick={onParse} style={styles.button}>
        Parse & Edit
      </button>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  label: {
    fontSize: '14px',
    fontWeight: 600,
    color: '#e2e8f0',
  },
  textarea: {
    width: '100%',
    height: '120px',
    padding: '12px',
    borderRadius: '8px',
    border: '1px solid #334155',
    backgroundColor: '#0f172a',
    color: '#e2e8f0',
    fontSize: '13px',
    fontFamily: 'monospace',
    resize: 'vertical',
  },
  button: {
    padding: '10px 20px',
    borderRadius: '6px',
    border: 'none',
    backgroundColor: '#3b82f6',
    color: 'white',
    fontWeight: 600,
    cursor: 'pointer',
    alignSelf: 'flex-start',
  },
};
