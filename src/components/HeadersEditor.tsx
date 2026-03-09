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
      <div style={styles.header}>
        <span style={styles.title}>Headers</span>
        <button onClick={add} style={styles.addBtn}>+ Add</button>
      </div>
      <div style={styles.list}>
        {headers.map((h, i) => (
          <div key={i} style={styles.row}>
            <input
              value={h.key}
              onChange={e => update(i, 'key', e.target.value)}
              placeholder="Header name"
              style={{ ...styles.input, flex: 1 }}
            />
            <input
              value={h.value}
              onChange={e => update(i, 'value', e.target.value)}
              placeholder="Header value"
              style={{ ...styles.input, flex: 2 }}
            />
            <button onClick={() => remove(i)} style={styles.removeBtn}>×</button>
          </div>
        ))}
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: '14px',
    fontWeight: 600,
    color: '#e2e8f0',
  },
  addBtn: {
    padding: '4px 12px',
    borderRadius: '4px',
    border: 'none',
    backgroundColor: '#1e40af',
    color: 'white',
    cursor: 'pointer',
    fontSize: '12px',
  },
  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  row: {
    display: 'flex',
    gap: '8px',
    alignItems: 'center',
  },
  input: {
    padding: '8px 10px',
    borderRadius: '6px',
    border: '1px solid #334155',
    backgroundColor: '#0f172a',
    color: '#e2e8f0',
    fontSize: '13px',
    fontFamily: 'monospace',
  },
  removeBtn: {
    padding: '4px 10px',
    borderRadius: '4px',
    border: 'none',
    backgroundColor: '#991b1b',
    color: 'white',
    cursor: 'pointer',
    fontSize: '16px',
    lineHeight: 1,
  },
};
