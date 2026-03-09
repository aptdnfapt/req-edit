import React from 'react';

interface Props {
  value: string;
  onChange: (v: string) => void;
  onParse: () => void;
  colors: any;
}

export function CurlInput({ value, onChange, onParse, colors }: Props) {
  const styles = getStyles(colors);

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
        PARSE
      </button>
    </div>
  );
}

function getStyles(c: any): Record<string, React.CSSProperties> {
  return {
    container: {
      display: 'flex',
      gap: '8px',
      alignItems: 'center',
    },
    textarea: {
      flex: 1,
      height: '28px',
      padding: '6px 10px',
      border: `1px solid ${c.border}`,
      backgroundColor: c.bgAlt2,
      color: c.text,
      fontSize: '11px',
      fontFamily: 'monospace',
      resize: 'none',
    },
    button: {
      padding: '6px 14px',
      border: 'none',
      backgroundColor: c.accent,
      color: c.text,
      fontWeight: 600,
      cursor: 'pointer',
      fontSize: '11px',
      whiteSpace: 'nowrap',
    },
  };
}