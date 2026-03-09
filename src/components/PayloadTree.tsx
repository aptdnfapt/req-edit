import React, { useRef, useEffect, useState } from 'react';
import JSONEditor from 'jsoneditor';
import 'jsoneditor/dist/jsoneditor.min.css';
import { detectProvider } from '../utils/llmFormat';

interface Props {
  data: any;
  url: string;
  onChange: (data: any) => void;
}

export function PayloadTree({ data, url, onChange }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<JSONEditor | null>(null);
  const [view, setView] = useState<'tree' | 'raw'>('tree');
  const provider = detectProvider(url);

  useEffect(() => {
    if (containerRef.current && !editorRef.current && view === 'tree') {
      editorRef.current = new JSONEditor(containerRef.current, {
        mode: 'tree',
        modes: ['tree', 'code'],
        onChangeText: (jsonStr: string) => {
          try {
            const parsed = JSON.parse(jsonStr);
            onChange(parsed);
          } catch {}
        },
      });
      if (data) {
        editorRef.current.set(data);
      }
    }
    
    return () => {
      if (editorRef.current) {
        editorRef.current.destroy();
        editorRef.current = null;
      }
    };
  }, [view]);

  useEffect(() => {
    if (editorRef.current && data) {
      try {
        editorRef.current.update(data);
      } catch {}
    }
  }, [data]);

  if (!data) {
    return <div style={styles.empty}>No payload</div>;
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <span style={styles.title}>Payload ({provider})</span>
        <div style={styles.tabs}>
          <button 
            onClick={() => setView('tree')} 
            style={{ ...styles.tab, ...(view === 'tree' ? styles.tabActive : {}) }}
          >Tree</button>
          <button 
            onClick={() => setView('raw')} 
            style={{ ...styles.tab, ...(view === 'raw' ? styles.tabActive : {}) }}
          >Raw</button>
        </div>
      </div>
      
      <div style={styles.content}>
        {view === 'tree' ? (
          <div ref={containerRef} style={styles.editorWrap} />
        ) : (
          <textarea
            value={JSON.stringify(data, null, 2)}
            onChange={e => {
              try {
                const parsed = JSON.parse(e.target.value);
                onChange(parsed);
              } catch {}
            }}
            style={styles.rawInput}
            spellCheck={false}
          />
        )}
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
  tabs: {
    display: 'flex',
    gap: '4px',
  },
  tab: {
    padding: '4px 12px',
    borderRadius: '4px',
    border: 'none',
    backgroundColor: '#1e293b',
    color: '#94a3b8',
    cursor: 'pointer',
    fontSize: '12px',
  },
  tabActive: {
    backgroundColor: '#3b82f6',
    color: 'white',
  },
  content: {
    borderRadius: '8px',
    border: '1px solid #334155',
    backgroundColor: '#0f172a',
    overflow: 'hidden',
  },
  editorWrap: {
    height: '500px',
  },
  rawInput: {
    width: '100%',
    minHeight: '200px',
    padding: '12px',
    border: 'none',
    backgroundColor: '#0f172a',
    color: '#e2e8f0',
    fontSize: '13px',
    fontFamily: 'monospace',
    resize: 'vertical',
  },
  empty: {
    padding: '20px',
    textAlign: 'center',
    color: '#64748b',
    fontSize: '14px',
  },
};
