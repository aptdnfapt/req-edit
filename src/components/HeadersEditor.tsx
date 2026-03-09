import React from 'react';

interface Header { key: string; value: string }

interface Props {
  headers: Header[];
  onChange: (headers: Header[]) => void;
  colors: any;
}

export function HeadersEditor({ headers, onChange, colors }: Props) {
  const styles = getStyles(colors);

  const update = (i: number, field: 'key' | 'value', v: string) => {
    const updated = [...headers];
    updated[i] = { ...updated[i], [field]: v };
    onChange(updated);
  };

  const add = () => onChange([...headers, { key: '', value: '' }]);
  const remove = (i: number) => onChange(headers.filter((_, idx) => idx !== i));

  return (
    <div style={styles.container}>
      <div style={styles.list}>
        {headers.map((h, i) => (
          <div key={i} style={styles.row}>
            <input
              value={h.key}
              onChange={e => update(i, 'key', e.target.value)}
              placeholder="Name"
              style={styles.keyInput}
            />
            <input
              value={h.value}
              onChange={e => update(i, 'value', e.target.value)}
              placeholder="Value"
              style={styles.valueInput}
            />
            <button onClick={() => remove(i)} style={styles.removeBtn}>X</button>
          </div>
        ))}
      </div>
      <button onClick={add} style={styles.addBtn}>+ Add Header</button>
    </div>
  );
}

function getStyles(c: any): Record<string, React.CSSProperties> {
  return {
    container: {
      display: 'flex',
      flexDirection: 'column',
      gap: '6px',
    },
    list: {
      display: 'flex',
      flexDirection: 'column',
      gap: '3px',
      maxHeight: '180px',
      overflowY: 'auto',
    },
    row: {
      display: 'flex',
      gap: '3px',
      alignItems: 'center',
    },
    keyInput: {
      flex: '0 0 80px',
      padding: '4px 6px',
      border: `1px solid ${c.border}`,
      backgroundColor: c.bgAlt2,
      color: c.text,
      fontSize: '10px',
      fontFamily: 'monospace',
    },
    valueInput: {
      flex: 1,
      padding: '4px 6px',
      border: `1px solid ${c.border}`,
      backgroundColor: c.bgAlt2,
      color: c.text,
      fontSize: '10px',
      fontFamily: 'monospace',
      minWidth: 0,
    },
    removeBtn: {
      padding: '2px 6px',
      border: 'none',
      backgroundColor: c.error,
      color: c.errorText,
      cursor: 'pointer',
      fontSize: '9px',
      fontWeight: 600,
    },
    addBtn: {
      padding: '4px 6px',
      border: `1px dashed ${c.borderAlt}`,
      backgroundColor: 'transparent',
      color: c.textMuted,
      cursor: 'pointer',
      fontSize: '10px',
      textAlign: 'left',
    },
  };
}