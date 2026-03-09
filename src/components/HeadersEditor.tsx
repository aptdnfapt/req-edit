import React from 'react';

interface Header { key: string; value: string }

interface Props {
  headers: Header[];
  onChange: (headers: Header[]) => void;
}

export function HeadersEditor({ headers, onChange }: Props) {
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
            <button onClick={() => remove(i)} style={styles.removeBtn}>×</button>
          </div>
        ))}
      </div>
      <button onClick={add} style={styles.addBtn}>+ Add Header</button>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    maxHeight: '200px',
    overflowY: 'auto',
  },
  row: {
    display: 'flex',
    gap: '4px',
    alignItems: 'center',
  },
  keyInput: {
    flex: '0 0 90px',
    padding: '5px 8px',
    borderRadius: '4px',
    border: '1px solid #334155',
    backgroundColor: '#1e293b',
    color: '#e2e8f0',
    fontSize: '11px',
    fontFamily: 'monospace',
  },
  valueInput: {
    flex: 1,
    padding: '5px 8px',
    borderRadius: '4px',
    border: '1px solid #334155',
    backgroundColor: '#1e293b',
    color: '#e2e8f0',
    fontSize: '11px',
    fontFamily: 'monospace',
    minWidth: 0,
  },
  removeBtn: {
    padding: '2px 6px',
    borderRadius: '3px',
    border: 'none',
    backgroundColor: '#7f1d1d',
    color: '#fca5a5',
    cursor: 'pointer',
    fontSize: '12px',
    lineHeight: 1,
  },
  addBtn: {
    padding: '4px 8px',
    borderRadius: '4px',
    border: '1px dashed #475569',
    backgroundColor: 'transparent',
    color: '#94a3b8',
    cursor: 'pointer',
    fontSize: '11px',
    textAlign: 'left',
  },
};